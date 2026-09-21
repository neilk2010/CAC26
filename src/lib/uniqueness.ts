import { STATES, deepStates } from "@/data/states";
import type { EligibilityResult, Program } from "@/lib/types";

// "What does my state have that others don't?" — derived, never asserted.
//
// The naive version (count distinct states per program id) is useless here:
// program ids are state-prefixed, so EVERY state-pack entry would look
// exclusive and we'd tell a Californian that CalEITC is "only in California"
// when ~30 states run an EITC. So we count over an EQUIVALENCE KEY instead:
//
//   program.equivalentKey ?? program.supersedes?.[0] ?? program.id
//
// The key says only "these rows are the same KIND of benefit." Uniqueness is
// still computed from the data, so promoting state #7 reclassifies every
// badge with zero edits here — see tests/unit/uniqueness.test.ts, which fails
// the build if two states ship the same program under different keys.

/** The key a program is counted under. Exported for the guardrail test. */
export function equivalenceKey(program: Program): string {
  return program.equivalentKey ?? program.supersedes?.[0] ?? program.id;
}

/**
 * A key naming a federal-baseline program (SNAP, Medicaid, LIHEAP, SSI…) is
 * nationwide by definition: it exists in all 51 jurisdictions, and state packs
 * only re-express it with local rules. Those can never be "exclusive" no
 * matter how few state packs happen to model them yet — which is exactly the
 * trap that would have branded SSI "only in New York".
 */
function isNationwide(key: string): boolean {
  return key.startsWith("us-");
}

/** key → set of state codes whose pack offers that kind of program. */
function buildIndex(): Map<string, Set<string>> {
  const index = new Map<string, Set<string>>();
  for (const state of STATES) {
    for (const program of state.programs) {
      const key = equivalenceKey(program);
      let codes = index.get(key);
      if (!codes) {
        codes = new Set<string>();
        index.set(key, codes);
      }
      codes.add(state.code);
    }
  }
  return index;
}

// Built once at module load over the whole registry.
const INDEX = buildIndex();

/** How many hand-verified state packs exist — the denominator in all copy. */
export function coveredStateCount(): number {
  return deepStates().length;
}

export type Rarity = "exclusive" | "rare" | "common";

export interface Uniqueness {
  /** Distinct states offering this kind of program, across the whole library. */
  stateCount: number;
  rarity: Rarity;
}

/**
 * Rarity is always relative to what OpenDoor actually covers in depth, and the
 * copy says so. We never claim a program exists nowhere else in the country —
 * only that no other state WE cover offers it. That claim is always true.
 */
export function uniqueness(program: Program): Uniqueness {
  const key = equivalenceKey(program);
  const stateCount = INDEX.get(key)?.size ?? 1;
  if (isNationwide(key)) return { stateCount, rarity: "common" };
  if (stateCount === 1) return { stateCount, rarity: "exclusive" };
  if (stateCount <= 3) return { stateCount, rarity: "rare" };
  return { stateCount, rarity: "common" };
}

export function isExclusiveTo(program: Program, stateCode: string): boolean {
  return program.state === stateCode && uniqueness(program).rarity === "exclusive";
}

/**
 * The household's matched programs that no other covered state offers.
 * "Unlikely" results are filtered out — a program you don't qualify for isn't
 * worth celebrating as a local perk.
 */
export function exclusiveResults(
  results: EligibilityResult[],
  stateCode: string
): EligibilityResult[] {
  return results.filter(
    (r) => r.confidence !== "unlikely" && isExclusiveTo(r.program, stateCode)
  );
}
