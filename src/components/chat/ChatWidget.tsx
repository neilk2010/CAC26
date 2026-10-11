"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { useHousehold } from "@/lib/household-store";
import { useT } from "@/lib/i18n";

// The guide: a navigator, not a decision-maker.
//
// Eligibility is settled here in the browser by the same engine the results
// page uses, and the verdict is sent to the model as a fact to report. The
// model never sees a program's rules, so it cannot reinterpret one — the worst
// failure this app could have is telling someone they qualify when they don't.
//
// Hidden entirely when no key is configured, rather than offering a chat that
// answers everything with an error.

interface Turn {
  role: "user" | "model";
  text: string;
}

/** What the engine already decided, compact enough to sit in a prompt. */
function useEngineVerdict() {
  const { household } = useHousehold();
  return useMemo(() => {
    const entry = getState(household.state);
    if (!entry || household.householdSize === undefined) return null;
    if (household.monthlyIncomeMin === undefined) return null;
    const results = evaluateAll(entry.programs, household);
    const pick = (c: string) =>
      results.filter((r) => r.confidence === c).map((r) => r.program.shortName);
    return {
      state: entry.name,
      householdSize: household.householdSize,
      likely: pick("likely"),
      possible: pick("possible"),
      needsInfo: pick("needsInfo").length,
      notLikely: pick("unlikely").length,
    };
  }, [household]);
}

/** A summary of the household with nothing that identifies anyone. */
function useHouseholdSummary() {
  const { household } = useHousehold();
  return useMemo(() => {
    if (!household.state) return null;
    return {
      state: household.state,
      size: household.householdSize,
      incomeBand:
        household.monthlyIncomeMin === undefined
          ? undefined
          : `${household.monthlyIncomeMin}-${household.monthlyIncomeMax}/mo`,
      situations: Object.entries(household.flags)
        .filter(([, v]) => v === true)
        .map(([k]) => k),
    };
  }, [household]);
}

export function ChatWidget() {
  const t = useT();
  const pathname = usePathname();
  const verdict = useEngineVerdict();
  const summary = useHouseholdSummary();

  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [busyLimit, setBusyLimit] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // One probe, so the launcher never appears on a deployment without a key.
  useEffect(() => {
    let live = true;
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { enabled?: boolean }) => {
        if (live) setEnabled(Boolean(d.enabled));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        launcherRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    requestAnimationFrame(() => inputRef.current?.focus());
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [turns, busy]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    setDraft("");
    setFailed(false);
    setBusyLimit(false);
    const history = turns.slice(-6);
    setTurns((prev) => [...prev, { role: "user", text: q }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question: q,
          history,
          page: pathname,
          household: summary,
          engineVerdict: verdict,
        }),
      });
      const data = (await res.json()) as { answer?: string; busy?: boolean };
      if (data.answer) setTurns((prev) => [...prev, { role: "model", text: data.answer! }]);
      else if (data.busy) setBusyLimit(true);
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  if (!enabled) return null;

  const starters: string[] = [t("chat.s1"), t("chat.s2"), t("chat.s3")];

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t("chat.title")}
          className="palette-panel flex w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-2xl"
        >
          <div className="flex items-start gap-3 border-b border-card-border px-4 py-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold">{t("chat.title")}</h2>
              <p className="mt-0.5 text-xs text-muted">{t("chat.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                launcherRef.current?.focus();
              }}
              aria-label={t("chat.close")}
              className="press-weight shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={logRef} className="max-h-[52vh] min-h-[160px] space-y-3 overflow-y-auto px-4 py-3">
            {turns.length === 0 && (
              <>
                <p className="text-sm text-muted">{t("chat.empty")}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {starters.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void ask(s)}
                      className="press-weight rounded-full border border-dashed border-card-border px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            )}

            {turns.map((turn, i) => (
              <div key={i} className={turn.role === "user" ? "flex justify-end" : ""}>
                <p
                  className={
                    turn.role === "user"
                      ? "max-w-[85%] rounded-2xl bg-accent/15 px-3 py-2 text-sm text-foreground"
                      : "max-w-[92%] text-sm leading-relaxed text-foreground"
                  }
                >
                  {/* Paths the guide names become real links. */}
                  {turn.role === "model" ? linkPaths(turn.text) : turn.text}
                </p>
              </div>
            ))}

            {busy && <p className="text-sm text-muted">{t("chat.thinking")}</p>}
            {busyLimit && <p className="text-sm text-muted">{t("chat.busy")}</p>}
            {failed && <p className="text-sm text-[#f87171]">{t("chat.error")}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(draft);
            }}
            className="flex items-center gap-2 border-t border-card-border px-3 py-2.5"
          >
            <input
              ref={inputRef}
              id="chat-draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.placeholder")}
              maxLength={1000}
              className="min-w-0 flex-1 rounded-lg border border-card-border bg-background px-3 py-2 text-sm outline-none focus:border-accent/60"
            />
            <button
              type="submit"
              disabled={busy || draft.trim().length === 0}
              className="press-weight shrink-0 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-[#04201c] disabled:opacity-40"
            >
              {t("chat.send")}
            </button>
          </form>

          <p className="border-t border-card-border px-4 py-2 text-[11px] text-muted">
            {t("chat.disclaimer")}
          </p>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t("chat.launch")}
        className="press-weight flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent text-[#04201c] shadow-lg transition-transform hover:scale-105"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L3 20l1-4.6A8.5 8.5 0 1 1 21 11.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

/** Turns a /path the guide mentioned into a link, leaving the rest as text. */
function linkPaths(text: string) {
  const parts = text.split(/(\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*)/g);
  return parts.map((part, i) =>
    /^\/[a-z]/.test(part) ? (
      <Link key={i} href={part} className="text-accent underline underline-offset-2">
        {part}
      </Link>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}
