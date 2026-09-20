import { FEDERAL_PROGRAMS } from "@/data/federal/programs";
import { FEDERAL_TIER_STATES } from "@/data/states/federal-tier";
import { NJ_META } from "@/data/states/NJ/meta";
import { NJ_PROGRAMS } from "@/data/states/NJ/programs";
import { CA_META } from "@/data/states/CA/meta";
import { CA_PROGRAMS } from "@/data/states/CA/programs";
import { TX_META } from "@/data/states/TX/meta";
import { TX_PROGRAMS } from "@/data/states/TX/programs";
import { FL_META } from "@/data/states/FL/meta";
import { FL_PROGRAMS } from "@/data/states/FL/programs";
import { NY_META } from "@/data/states/NY/meta";
import { NY_PROGRAMS } from "@/data/states/NY/programs";
import { PA_META } from "@/data/states/PA/meta";
import { PA_PROGRAMS } from "@/data/states/PA/programs";
import { IL_META } from "@/data/states/IL/meta";
import { IL_PROGRAMS } from "@/data/states/IL/programs";
import { OH_META } from "@/data/states/OH/meta";
import { OH_PROGRAMS } from "@/data/states/OH/programs";
import { GA_META } from "@/data/states/GA/meta";
import { GA_PROGRAMS } from "@/data/states/GA/programs";
import { NC_META } from "@/data/states/NC/meta";
import { NC_PROGRAMS } from "@/data/states/NC/programs";
import { MI_META } from "@/data/states/MI/meta";
import { MI_PROGRAMS } from "@/data/states/MI/programs";
import { assertAddOnlyInvariant } from "@/lib/data-invariants";
import type { Program, StateMeta } from "@/lib/types";

// State registry, v3: ALL states are selectable, honestly tiered.
//   deep    = hand-verified state pack + federal baseline (NJ, CA, TX, FL,
//             NY, PA, IL, OH, GA, NC, MI)
//   federal = federal baseline + a real aggregator pointer for the state
//             programs we don't screen yet
// The federal baseline (and the address-based local features — Census
// geocoder, HUD income limits, LIHTC properties, HRSA health centers — which
// are national datasets) works in every state on day one.
//
// Composition rule: a state program that `supersedes` federal ids replaces
// those federal entries in that state — NJ SNAP stands in for us-snap, so a
// NJ household never sees both. Adding a deep state = a data pack + a meta
// entry; the engine and every template are untouched.
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

export const STATES: StateEntry[] = [
  composeState(NJ_META, NJ_PROGRAMS),
  composeState(CA_META, CA_PROGRAMS),
  composeState(TX_META, TX_PROGRAMS),
  composeState(FL_META, FL_PROGRAMS),
  composeState(NY_META, NY_PROGRAMS),
  composeState(PA_META, PA_PROGRAMS),
  composeState(IL_META, IL_PROGRAMS),
  composeState(OH_META, OH_PROGRAMS),
  composeState(GA_META, GA_PROGRAMS),
  composeState(NC_META, NC_PROGRAMS),
  composeState(MI_META, MI_PROGRAMS),
  ...FEDERAL_TIER_STATES.map((m) => composeState(m, [])),
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
