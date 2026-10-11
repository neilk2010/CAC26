import type { Program } from "@/lib/types";

// Which program records get attached to a question.
//
// Keyword scoring, not embeddings: it needs no API call, no index to rebuild
// when a state pack changes, and it is deterministic — the same question always
// grounds on the same records, which is what makes the guide's answers
// reviewable. 139 programs is small enough that scoring them all costs nothing.

const STOP = new Set([
  "a","am","an","and","any","are","as","at","be","can","do","does","for","from","get","give","got",
  "has","have","how","i","if","in","is","it","me","my","of","on","or","our","so","that","the","them",
  "they","this","to","up","us","was","we","what","when","where","which","who","will","with","you","your",
]);

/** Words a question and a program record can share, lowercased and de-noised. */
function terms(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

/** Everyday words for a category, so "food stamps" reaches the food programs. */
/** Words common enough inside program names that matching one means nothing. */
const AMBIGUOUS = new Set([
  "bill", "bills", "help", "program", "programs", "assistance", "aid", "care",
  "plan", "state", "federal", "national", "benefit", "benefits", "support",
]);

const CATEGORY_WORDS: Record<Program["category"], string[]> = {
  food: ["food", "groceries", "grocery", "eat", "hungry", "meals", "nutrition", "stamps", "ebt"],
  health: ["health", "doctor", "medical", "insurance", "medicaid", "medicare", "dental", "coverage"],
  energy: ["energy", "heat", "heating", "cooling", "electric", "utility", "utilities", "gas", "bill"],
  cash: ["cash", "money", "income", "assistance", "welfare", "tanf", "unemployment"],
  education: ["school", "college", "student", "tuition", "scholarship", "grant", "fafsa", "education"],
  housing: ["housing", "rent", "rental", "apartment", "homeless", "mortgage", "landlord", "section"],
  tax: ["tax", "taxes", "refund", "credit", "filing", "return", "eitc", "irs"],
  "phone-internet": ["phone", "internet", "broadband", "wifi", "cell", "mobile", "lifeline"],
};

export interface RetrievedProgram {
  id: string;
  name: string;
  shortName: string;
  state: string;
  category: string;
  summary: string;
  agencyName: string;
  applyUrl: string;
  sourceUrl: string;
  lastVerified: string;
}

/** Only the fields the guide may speak from — rules stay out, since the engine
 *  decides eligibility and the model must not reinterpret a rule itself. */
function strip(p: Program): RetrievedProgram {
  return {
    id: p.id, name: p.name, shortName: p.shortName, state: p.state,
    category: p.category, summary: p.summary, agencyName: p.agencyName,
    applyUrl: p.applyUrl, sourceUrl: p.sourceUrl, lastVerified: p.lastVerified,
  };
}

/**
 * The programs most likely to be what a question is about, best first.
 * Returns [] when nothing scores — the guide then says it doesn't know rather
 * than reaching for an unrelated record.
 */
export function retrievePrograms(
  question: string,
  programs: Program[],
  limit = 5
): RetrievedProgram[] {
  const q = terms(question);
  if (q.length === 0) return [];
  const asked = new Set(q);

  // Which kinds of help the question is about. When it names one, that is the
  // strongest signal there is: "heating bill" is an energy question even though
  // "bill" also appears in "GI Bill".
  const wanted = new Set<string>();
  for (const [cat, words] of Object.entries(CATEGORY_WORDS)) {
    if (words.some((w) => asked.has(w))) wanted.add(cat);
  }

  const scored = programs.map((p) => {
    // A name match only counts on a distinctive word. Without this, one common
    // word shared with a title outranks a real topical match.
    let nameHits = 0;
    for (const w of terms(`${p.shortName} ${p.name}`)) {
      if (asked.has(w) && !AMBIGUOUS.has(w)) nameHits += 1;
    }
    let score = nameHits * 6;
    if (wanted.has(p.category)) score += 5;
    // Capped: a long summary should never outweigh naming the thing.
    let summaryHits = 0;
    for (const w of terms(p.summary)) if (asked.has(w)) summaryHits += 1;
    score += Math.min(summaryHits, 3);
    return { p, score, nameHits };
  });

  return scored
    .filter((s) => s.score > 0)
    // Once the question names a kind of help, anything outside it needs to have
    // been named outright to stay.
    .filter((s) => wanted.size === 0 || wanted.has(s.p.category) || s.nameHits > 0)
    .sort((a, b) => b.score - a.score || a.p.shortName.localeCompare(b.p.shortName))
    .slice(0, limit)
    .map((s) => strip(s.p));
}
