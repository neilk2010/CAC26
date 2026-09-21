import { describe, expect, it } from "vitest";
import { STATES, deepStates } from "@/data/states";
import {
  coveredStateCount,
  equivalenceKey,
  exclusiveResults,
  isExclusiveTo,
  uniqueness,
} from "@/lib/uniqueness";
import type { EligibilityResult, Program } from "@/lib/types";

// The uniqueness index decides whether we tell a user "no other state we
// cover offers this." That claim is only as honest as the equivalence keys
// behind it, so this suite guards the one way it can go wrong: a new state
// pack shipping a program another state already has, under a different key.

const STATE_CODES = new Set(STATES.map((s) => s.code.toLowerCase()));

/** "NY SNAP" / "PA SNAP" -> "snap"; drops state-code tokens and punctuation. */
function normalizeShortName(shortName: string): string {
  return shortName
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0 && !STATE_CODES.has(token))
    .join("");
}

describe("equivalence keys", () => {
  const allPrograms = STATES.flatMap((s) => s.programs);

  it("two states shipping the same program agree on its equivalence key", () => {
    // Group every program by its normalized short name, then assert that a
    // name appearing in more than one state resolves to a single key. This is
    // what catches "someone added PA's EITC and forgot to tag it state-eitc",
    // which would otherwise render a false "Only in Pennsylvania" badge.
    const byName = new Map<string, Map<string, Set<string>>>(); // name -> key -> states
    for (const state of STATES) {
      for (const program of state.programs) {
        // Only state-administered entries. The federal baseline is the SAME
        // object composed into all 51 jurisdictions, and a state program is
        // often deliberately a different thing under a similar name (federal
        // Lifeline vs California LifeLine; income-tested NSLP vs a state's
        // universal free meals) — comparing those is a false alarm.
        if (program.state === "US") continue;
        const name = normalizeShortName(program.shortName);
        const keys = byName.get(name) ?? new Map<string, Set<string>>();
        const states = keys.get(equivalenceKey(program)) ?? new Set<string>();
        states.add(state.code);
        keys.set(equivalenceKey(program), states);
        byName.set(name, keys);
      }
    }

    const conflicts: string[] = [];
    for (const [name, keys] of byName) {
      if (keys.size <= 1) continue;
      const spread = [...keys.entries()].map(
        ([key, states]) => `${key} (${[...states].sort().join(",")})`
      );
      conflicts.push(`"${name}" resolves to ${keys.size} keys: ${spread.join(" vs ")}`);
    }
    expect(conflicts).toEqual([]);
  });

  it("every program resolves to a non-empty key", () => {
    for (const program of allPrograms) {
      expect(equivalenceKey(program).length).toBeGreaterThan(0);
    }
  });

  it("federal-baseline programs are never exclusive to a state", () => {
    // us-* keys mean "this exists in all 51 jurisdictions" — SNAP, Medicaid,
    // LIHEAP, WIC and SSI must never be badged as a local perk just because
    // only a few state packs model them so far.
    const wronglyExclusive = allPrograms
      .filter((p) => equivalenceKey(p).startsWith("us-"))
      .filter((p) => uniqueness(p).rarity !== "common")
      .map((p) => p.id);
    expect(wronglyExclusive).toEqual([]);
  });
});

describe("uniqueness classification", () => {
  function find(id: string): Program {
    const found = STATES.flatMap((s) => s.programs).find((p) => p.id === id);
    if (!found) throw new Error(`fixture program ${id} missing`);
    return found;
  }

  it("counts a shared state program across every state that offers it", () => {
    // State EITCs are tagged "state-eitc" in NJ, CA, NY, IL, OH and MI.
    const nj = uniqueness(find("nj-eitc"));
    expect(nj.stateCount).toBeGreaterThan(1);
    expect(nj.rarity).not.toBe("exclusive");
    // and all of them agree on the count
    expect(uniqueness(find("il-eitc")).stateCount).toBe(nj.stateCount);
  });

  it("flags a program no other covered state offers", () => {
    // NY's Essential Plan (a Basic Health Program) and California's CAPI have
    // no counterpart in any other pack.
    expect(uniqueness(find("ny-essential-plan")).rarity).toBe("exclusive");
    expect(isExclusiveTo(find("ca-capi"), "CA")).toBe(true);
    expect(isExclusiveTo(find("ca-capi"), "NY")).toBe(false);
  });

  it("pairs a two-state program as rare, not exclusive", () => {
    // Senior pharmaceutical assistance: NJ PAAD + PA PACE/PACENET.
    const paad = uniqueness(find("nj-paad"));
    expect(paad.stateCount).toBe(2);
    expect(paad.rarity).toBe("rare");
  });

  it("recomputes from the registry rather than a hardcoded list", () => {
    // The denominator every piece of copy uses must track the deep packs.
    expect(coveredStateCount()).toBe(deepStates().length);
    expect(coveredStateCount()).toBeGreaterThanOrEqual(6);
  });
});

describe("exclusiveResults", () => {
  function resultFor(id: string, confidence: EligibilityResult["confidence"]) {
    const program = STATES.flatMap((s) => s.programs).find((p) => p.id === id)!;
    return { program, confidence, reasons: [] } satisfies EligibilityResult;
  }

  it("keeps matched exclusives and drops ruled-out ones", () => {
    const results = [resultFor("ny-essential-plan", "likely"), resultFor("ny-snap", "likely")];
    expect(exclusiveResults(results, "NY").map((r) => r.program.id)).toEqual([
      "ny-essential-plan",
    ]);
    // The same exclusive, ruled out, is not worth celebrating.
    expect(exclusiveResults([resultFor("ny-essential-plan", "unlikely")], "NY")).toEqual([]);
  });

  it("returns nothing for a federal-tier state", () => {
    // Pick the federal-tier state dynamically rather than naming one: this
    // test used to hardcode Ohio, which broke the moment Ohio was promoted.
    // Any state without a deep pack sees only the federal baseline, and
    // nothing in that baseline can ever be state-exclusive.
    const federalTier = STATES.find((s) => s.tier === "federal");
    expect(federalTier, "expected at least one federal-tier jurisdiction").toBeDefined();
    const results = federalTier!.programs.map((p) => resultFor(p.id, "likely"));
    expect(exclusiveResults(results, federalTier!.code)).toEqual([]);
  });
});
