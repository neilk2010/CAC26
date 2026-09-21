import { FEDERAL_PROGRAMS } from "@/data/federal/programs";
import { ALL_JURISDICTIONS } from "@/data/states/federal-tier";
import { DEEP_PACKS } from "@/data/states/deep";
import { assertAddOnlyInvariant } from "@/lib/data-invariants";
import type { Program, StateMeta } from "@/lib/types";

// State registry, v3: ALL states are selectable, honestly tiered.
//   deep    = hand-verified state pack + federal baseline (see states/deep.ts)
//   federal = federal baseline + a real aggregator pointer for the state
//             programs we don't screen yet
// The federal baseline (and the address-based local features — Census
// geocoder, HUD income limits, LIHTC properties, HRSA health centers — which
// are national datasets) works in every state on day one.
//
// Composition rule: a state program that `supersedes` federal ids replaces
// those federal entries in that state — NJ SNAP stands in for us-snap, so a
// NJ household never sees both. Adding a deep state = a data pack + one line
// in states/deep.ts; the engine and every template are untouched.
export interface StateEntry extends StateMeta {
  programs: Program[];
}

export const DEFAULT_STATE = "NJ";

function composeState(meta: StateMeta, statePack: Program[]): StateEntry {
  const superseded = new Set(statePack.flatMap((p) => p.supersedes ?? []));
  return {
    ...meta,
    programs: [...statePack, ...FEDERAL_PROGRAMS.filter((f) => !superseded.has(f.id))],
  };
}

// Deep packs win; every remaining jurisdiction composes from the federal
// baseline alone. Filtering by code means a promoted state is never listed
// twice — states/federal-tier.ts stays the complete 51 and is never edited.
const DEEP_CODES = new Set(DEEP_PACKS.map((p) => p.meta.code));

export const STATES: StateEntry[] = [
  ...DEEP_PACKS.map((p) => composeState(p.meta, p.programs)),
  ...ALL_JURISDICTIONS.filter((m) => !DEEP_CODES.has(m.code)).map((m) => composeState(m, [])),
].sort((a, b) => a.name.localeCompare(b.name));

// Fail the build loudly if any pack violates the add-only guarantee for
// optional/sensitive questions (see lib/data-invariants.ts).
assertAddOnlyInvariant(STATES.flatMap((s) => s.programs));

export function getState(code: string): StateEntry | undefined {
  return STATES.find((s) => s.code === code);
}

/** Find a program by id across every state (used by the per-population landings). */
export function getProgramById(id: string): Program | undefined {
  for (const s of STATES) {
    const found = s.programs.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}

/** The states with hand-verified deep packs — used for honest coverage copy. */
export function deepStates(): StateEntry[] {
  return STATES.filter((s) => s.tier === "deep");
}

/** Count of distinct programs across the whole library (site copy derives from this). */
export function totalProgramCount(): number {
  const ids = new Set<string>();
  for (const s of STATES) for (const p of s.programs) ids.add(p.id);
  return ids.size;
}

/** Stable reference so callers doing `getState(x)?.programs ?? EMPTY_PROGRAMS` don't
 * create a new array identity every render (which would defeat useMemo/useEffect deps). */
export const EMPTY_PROGRAMS: Program[] = [];
