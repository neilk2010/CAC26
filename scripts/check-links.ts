/**
 * Link checker for the program data.
 *
 *   npx tsx scripts/check-links.ts [--json out.json] [--timeout 20000] [--concurrency 8]
 *
 * Imports every module under src/data (so URLs held in shared constants are
 * resolved), walks the exported values, and collects every http(s) URL along
 * with the record it belongs to (nearest ancestor object with an `id`) and the
 * field it sits in. Each unique URL is fetched once with redirects followed.
 *
 * Reported as problems:
 *   - 404 / 410 / 5xx
 *   - timeouts and network errors (DNS, TLS, reset)
 *   - redirects that land on a different page: another host, the site's
 *     homepage, or a path that looks like an error page
 *   - 200 responses whose <title> reads like a "page not found" (soft 404)
 * Other non-2xx statuses (403, 429, …) are listed separately: they are usually
 * bot blocking on government sites and need a human check in a browser.
 * TLS chain errors on INCOMPLETE_CHAIN_ALLOWLIST hosts are listed, not flagged.
 *
 * Read-only: never writes to the data files.
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");

const args = process.argv.slice(2);
const argVal = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};
const TIMEOUT_MS = Number(argVal("--timeout") ?? 20000);
const CONCURRENCY = Number(argVal("--concurrency") ?? 8);
const JSON_OUT = argVal("--json");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

// Hosts that serve an incomplete TLS certificate chain (no intermediate cert).
// Browsers and OS TLS stacks fetch the missing intermediate and load the page
// fine, but Node's fetch rejects it. Only chain-verification errors are
// excused for these hosts — a 404, timeout or any other failure still counts.
// Verified in a browser/curl before adding; re-check when the list changes.
const INCOMPLETE_CHAIN_ALLOWLIST = new Set([
  "www.njhelps.gov", // NJ DHS eligibility screener — verified 2026-10-19
]);
const CHAIN_ERRORS = new Set([
  "UNABLE_TO_VERIFY_LEAF_SIGNATURE",
  "UNABLE_TO_GET_ISSUER_CERT_LOCALLY",
  "UNABLE_TO_GET_ISSUER_CERT",
]);

type Occurrence ={ file: string; recordId: string; field: string };
type Result = {
  url: string;
  status: number | null;
  finalUrl: string | null;
  redirected: boolean;
  error?: string;
  title?: string;
  ms: number;
};
type Problem = { kind: string; detail: string };

// ---------------------------------------------------------------------------
// 1. Collect URLs
// ---------------------------------------------------------------------------

function listDataFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listDataFiles(full));
    // index.ts files only re-export / assemble other modules.
    else if (/\.ts$/.test(name) && name !== "index.ts") out.push(full);
  }
  return out;
}

const URL_RE = /https?:\/\/[^\s"'<>)\]]+/g;

function walk(
  value: unknown,
  file: string,
  recordId: string,
  fieldPath: string,
  seen: Set<object>,
  found: Map<string, Occurrence[]>,
) {
  if (typeof value === "string") {
    for (const m of value.match(URL_RE) ?? []) {
      const url = m.replace(/[.,;:]+$/, "");
      const list = found.get(url) ?? [];
      if (!list.some((o) => o.file === file && o.recordId === recordId && o.field === fieldPath))
        list.push({ file, recordId, field: fieldPath });
      found.set(url, list);
    }
    return;
  }
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, file, recordId, `${fieldPath}[${i}]`, seen, found));
    return;
  }
  const obj = value as Record<string, unknown>;
  const id = typeof obj.id === "string" ? obj.id : recordId;
  // Inside a record, report field paths relative to it.
  const base = id !== recordId ? "" : fieldPath;
  for (const [k, v] of Object.entries(obj)) {
    walk(v, file, id, base ? `${base}.${k}` : k, seen, found);
  }
}

async function collect(): Promise<Map<string, Occurrence[]>> {
  const found = new Map<string, Occurrence[]>();
  for (const file of listDataFiles(DATA_DIR)) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const mod = (await import(pathToFileURL(file).href)) as Record<string, unknown>;
    for (const [exportName, value] of Object.entries(mod)) {
      if (exportName === "default" && typeof value === "object" && value && "__esModule" in value) continue;
      walk(value, rel, `(${exportName})`, "", new Set(), found);
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// 2. Check URLs
// ---------------------------------------------------------------------------

async function check(url: string): Promise<Result> {
  const start = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    let title: string | undefined;
    const type = res.headers.get("content-type") ?? "";
    if (type.includes("html")) {
      // Only the head matters; cap the read so big pages don't stall the run.
      const text = await readCapped(res, 200_000);
      title = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
    } else {
      await res.body?.cancel();
    }
    return { url, status: res.status, finalUrl: res.url, redirected: res.redirected, title, ms: Date.now() - start };
  } catch (e) {
    const err = e as Error & { cause?: { code?: string; message?: string } };
    const msg = ctrl.signal.aborted
      ? `timeout after ${TIMEOUT_MS}ms`
      : (err.cause?.code ?? err.cause?.message ?? err.message);
    return { url, status: null, finalUrl: null, redirected: false, error: msg, ms: Date.now() - start };
  } finally {
    clearTimeout(timer);
  }
}

async function readCapped(res: Response, max: number): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < max) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  await reader.cancel().catch(() => {});
  return Buffer.concat(chunks).toString("utf8");
}

// One retry for timeouts / network errors / 5xx, since gov sites are flaky.
async function checkWithRetry(url: string): Promise<Result> {
  const first = await check(url);
  if (first.status === null || first.status >= 500) {
    const second = await check(url);
    return second.status !== null && second.status < 500 ? second : first;
  }
  return first;
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>, onDone: () => void): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
        onDone();
      }
    }),
  );
  return out;
}

// ---------------------------------------------------------------------------
// 3. Classify
// ---------------------------------------------------------------------------

const normHost = (h: string) => h.toLowerCase().replace(/^www\./, "");
const normPath = (p: string) => decodeURIComponent(p).toLowerCase().replace(/\/(index\.(html?|php|aspx?))?$/, "") || "/";

const ERROR_PATH_RE = /(404|not[-_]?found|page[-_]?not|error|unavailable|maintenance)/i;
const SOFT_404_TITLE_RE = /(page not found|404|not found|no longer available|page (does not|doesn't) exist|error)/i;

function isAllowlistedChainError(r: Result): boolean {
  return (
    r.status === null &&
    CHAIN_ERRORS.has(r.error ?? "") &&
    INCOMPLETE_CHAIN_ALLOWLIST.has(new URL(r.url).hostname)
  );
}

function classify(r: Result): Problem | "warn" | null {
  if (isAllowlistedChainError(r)) return null;
  if (r.status === null) {
    return { kind: r.error?.startsWith("timeout") ? "TIMEOUT" : "NETWORK ERROR", detail: r.error ?? "" };
  }
  if (r.status === 404 || r.status === 410) return { kind: String(r.status), detail: r.title ?? "" };
  if (r.status >= 500) return { kind: `${r.status} (server error)`, detail: r.title ?? "" };

  if (r.redirected && r.finalUrl) {
    const a = new URL(r.url);
    const b = new URL(r.finalUrl);
    if (normHost(a.hostname) !== normHost(b.hostname)) {
      return { kind: "REDIRECT (other host)", detail: r.finalUrl };
    }
    const pa = normPath(a.pathname);
    const pb = normPath(b.pathname);
    if (pa !== pb) {
      if (pb === "/" && pa !== "/") return { kind: "REDIRECT (to homepage)", detail: r.finalUrl };
      if (ERROR_PATH_RE.test(pb) && !ERROR_PATH_RE.test(pa)) return { kind: "REDIRECT (to error page)", detail: r.finalUrl };
      return { kind: "REDIRECT (different page)", detail: r.finalUrl };
    }
    // Same host and path: http→https, trailing slash, www, query/auth params — fine.
  }

  if (r.status >= 200 && r.status < 300 && r.title && SOFT_404_TITLE_RE.test(r.title)) {
    return { kind: "SOFT 404 (title)", detail: `"${r.title}"` };
  }
  if (r.status < 200 || r.status >= 300) return "warn";
  return null;
}

// ---------------------------------------------------------------------------
// 4. Run + report
// ---------------------------------------------------------------------------

async function main() {
  const found = await collect();
  const urls = [...found.keys()].sort();
  const occurrences = [...found.values()].reduce((n, l) => n + l.length, 0);
  console.error(`Found ${urls.length} unique URLs (${occurrences} references). Checking…`);

  let done = 0;
  const results = await pool(urls, CONCURRENCY, checkWithRetry, () => {
    done++;
    if (done % 20 === 0 || done === urls.length) console.error(`  ${done}/${urls.length}`);
  });

  const problems: { r: Result; p: Problem }[] = [];
  const warnings: Result[] = [];
  let ok = 0;
  for (const r of results) {
    const c = classify(r);
    if (c === null) ok++;
    else if (c === "warn") warnings.push(r);
    else problems.push({ r, p: c });
  }

  const order = ["404", "410", "SERVER", "TIMEOUT", "NETWORK", "REDIRECT", "SOFT"];
  const rank = (k: string) => {
    const i = order.findIndex((o) => k.includes(o) || (o === "SERVER" && /^5\d\d/.test(k)));
    return i < 0 ? order.length : i;
  };
  problems.sort((x, y) => rank(x.p.kind) - rank(y.p.kind) || x.r.url.localeCompare(y.r.url));

  const lines: string[] = [];
  const where = (url: string) =>
    found.get(url)!.map((o) => `      - ${o.recordId}  ${o.field}  (${o.file})`);

  lines.push(`# Link check — ${new Date().toISOString()}`);
  lines.push("");
  lines.push(`Unique URLs: ${urls.length}   References: ${occurrences}`);
  lines.push(`OK: ${ok}   Problems: ${problems.length}   Needs manual check (403/429/etc.): ${warnings.length}`);
  lines.push("");

  const counts = new Map<string, number>();
  for (const { p } of problems) counts.set(p.kind, (counts.get(p.kind) ?? 0) + 1);
  for (const [k, n] of [...counts].sort((a, b) => rank(a[0]) - rank(b[0]))) lines.push(`  ${k.padEnd(28)} ${n}`);
  lines.push("");

  lines.push("## Problems");
  if (!problems.length) lines.push("  (none)");
  for (const { r, p } of problems) {
    lines.push(`  [${p.kind}] ${r.url}`);
    if (p.detail) lines.push(`      → ${p.detail}`);
    lines.push(...where(r.url));
  }
  lines.push("");

  lines.push("## Needs manual check (non-2xx, likely bot blocking)");
  if (!warnings.length) lines.push("  (none)");
  for (const r of warnings) {
    lines.push(`  [${r.status}] ${r.url}`);
    lines.push(...where(r.url));
  }

  const excused = results.filter(isAllowlistedChainError);
  if (excused.length) {
    lines.push("");
    lines.push("## Allowlisted (incomplete TLS chain; loads in browsers)");
    for (const r of excused) lines.push(`  [${r.error}] ${r.url}`);
  }

  console.log(lines.join("\n"));

  if (JSON_OUT) {
    writeFileSync(
      JSON_OUT,
      JSON.stringify(
        results.map((r) => ({ ...r, problem: classify(r), occurrences: found.get(r.url) })),
        null,
        2,
      ),
    );
    console.error(`Wrote ${JSON_OUT}`);
  }

  process.exitCode = problems.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
