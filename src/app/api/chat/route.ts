import { GLOSSARY, PROJECT_FACTS, SITE_MAP } from "@/lib/chat/knowledge";
import { retrievePrograms } from "@/lib/chat/retrieve";
import { getState } from "@/data/states";
import { FEDERAL_PROGRAMS } from "@/data/federal/programs";

// Answers are generated per question against freshly retrieved records.
export const dynamic = "force-dynamic";

// SAFETY CONTRACT — do not edit without re-reading the one in /api/explain.
//
// The guide may rephrase what it is handed and nothing else. It must never
// decide eligibility: the engine already did that client-side and its verdict
// arrives in the payload, so the model's job is to report it, never to re-run
// it. A model that reads a rule and guesses would be the one failure this whole
// app exists to prevent.
const GUIDE_SYSTEM_PROMPT =
  "You are OpenDoor's guide: a calm, plain-spoken helper on a website that shows people which " +
  "public benefit programs they may qualify for. Answer at a 6th-grade reading level in at most " +
  "3 short sentences. No markdown, no preamble, no emoji.\n\n" +
  "HARD RULES:\n" +
  "1. Use ONLY facts present in the provided JSON (siteMap, glossary, projectFacts, programs, " +
  "engineVerdict, household). Never introduce a number, dollar amount, percentage, date, income " +
  "limit, program name, or agency that is not literally in that JSON.\n" +
  "2. NEVER decide or predict eligibility yourself. If engineVerdict is present, you may report " +
  "exactly what it says. If it is absent and the person asks whether they qualify, say you need " +
  "their answers first and point them to the /intake questionnaire. Never say someone does or " +
  "does not qualify based on a program's rules.\n" +
  "3. If the answer is not in the JSON, say you do not have that and point to the program's agency " +
  "or the relevant page. Never guess.\n" +
  "4. Never give financial, legal, immigration, or medical advice.\n" +
  "5. OpenDoor is not a government site and cannot approve anyone. Say so if asked.\n" +
  "6. When a page would help, name it by its path from siteMap, e.g. /results.\n" +
  "7. Answer in the same language the person wrote in.";

interface RawBody {
  question?: unknown;
  history?: unknown;
  household?: unknown;
  engineVerdict?: unknown;
  page?: unknown;
}

interface Turn { role: "user" | "model"; text: string }

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return [];
  const out: Turn[] = [];
  for (const t of raw.slice(-6)) {
    if (typeof t !== "object" || t === null) continue;
    const r = (t as { role?: unknown }).role;
    const x = (t as { text?: unknown }).text;
    if ((r === "user" || r === "model") && typeof x === "string" && x.length <= 2000) {
      out.push({ role: r, text: x });
    }
  }
  return out;
}

/** Whatever the client sends is untrusted; keep only known-shaped primitives. */
function parseJsonish(raw: unknown, maxChars: number): unknown {
  if (raw === undefined || raw === null) return null;
  try {
    const s = JSON.stringify(raw);
    if (typeof s !== "string" || s.length > maxChars) return null;
    return JSON.parse(s) as unknown;
  } catch {
    return null;
  }
}

/** Lets the widget stay hidden entirely when no key is configured, rather than
 *  offering a chat that answers every question with an error. */
export function GET() {
  return Response.json({ enabled: Boolean(process.env.GROQ_API_KEY) });
}

export async function POST(request: Request) {
  if (!process.env.GROQ_API_KEY) {
    return Response.json({ disabled: true });
  }

  let body: RawBody;
  try {
    body = (await request.json()) as RawBody;
  } catch {
    return Response.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) {
    return Response.json({ error: "question is required." }, { status: 400 });
  }
  if (question.length > 1000) {
    return Response.json({ error: "question is too long." }, { status: 400 });
  }

  const stateCode = typeof body.household === "object" && body.household !== null
    ? (body.household as { state?: unknown }).state
    : undefined;
  const programs = (typeof stateCode === "string" ? getState(stateCode)?.programs : undefined)
    ?? FEDERAL_PROGRAMS;

  const grounding = {
    page: typeof body.page === "string" ? body.page.slice(0, 120) : null,
    siteMap: SITE_MAP,
    glossary: GLOSSARY,
    projectFacts: PROJECT_FACTS,
    household: parseJsonish(body.household, 2000),
    engineVerdict: parseJsonish(body.engineVerdict, 8000),
    programs: retrievePrograms(question, programs),
  };

  const messages = [
    { role: "system", content: GUIDE_SYSTEM_PROMPT },
    // "model" is this app's word for the guide's own turns; Groq's OpenAI-shaped
    // API calls them "assistant".
    ...parseHistory(body.history).map((t) => ({
      role: t.role === "model" ? "assistant" : "user",
      content: t.text,
    })),
    { role: "user", content: `${JSON.stringify(grounding)}\n\nQuestion: ${question}` },
  ];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // Overridable: Groq retires model ids faster than this app changes, so a
        // rename is an env edit rather than a deploy.
        model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
        messages,
        temperature: 0.2,
        max_tokens: 300,
      }),
      signal: AbortSignal.timeout(20_000),
    });

    if (!res.ok) return Response.json({ error: "unavailable" });

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const answer = data.choices?.[0]?.message?.content?.trim();
    if (!answer) return Response.json({ error: "unavailable" });

    return Response.json({ answer });
  } catch {
    return Response.json({ error: "unavailable" });
  }
}
