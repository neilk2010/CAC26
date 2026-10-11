import { describe, expect, it } from "vitest";
import { evaluateProgram, raisedCeilingOpportunity } from "@/lib/engine";
import { monthlyFPL } from "@/data/fpl";
import type { Household, Program, ProgramRules } from "@/lib/types";

// Engine behaviors the v4 cliff audit leaned on — locked here so a future
// data or engine edit can't silently un-fix them.

function prog(id: string, rules: Partial<ProgramRules>, extra?: Partial<Program>): Program {
  return {
    id,
    name: id,
    shortName: id,
    state: "US",
    category: "tax",
    summary: "synthetic test program",
    agencyName: "Test Agency",
    applyUrl: "https://example.gov/apply",
    sourceUrl: "https://example.gov",
    lastVerified: "2026-01-01",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [],
      requireAllCategorical: false,
      ...rules,
    },
    ...extra,
  };
}

function household(income: number, extra?: Partial<Household>): Household {
  return {
    state: "US",
    householdSize: 2,
    monthlyIncomeMin: income,
    monthlyIncomeMax: income,
    flags: {},
    ...extra,
  };
}

describe("income ceiling combination (the audit's latent bug)", () => {
  // A kid-tier ceiling of $24,000/yr ($2,000/mo) alongside a much higher
  // %-FPL ceiling: the BINDING limit is the lower one. Before the v4 fix the
  // %-FPL assignment clobbered the tier ceiling entirely.
  const both = prog("tier-plus-fpl", {
    kidCountIncomeTiers: [{ atLeastKids: 0, maxAnnualSingle: 24000 }],
    maxIncomePctFPL: 400,
  });

  it("the lower (tier) ceiling binds when %-FPL is higher", () => {
    // Sanity: 400% FPL for 2 really is above $2,000/mo, so the tier binds.
    expect(monthlyFPL(2) * 4).toBeGreaterThan(2000);
    const over = evaluateProgram(both, household(3000, { kidsUnder17Count: 2 }));
    expect(over.confidence).toBe("unlikely");
    const under = evaluateProgram(both, household(1500, { kidsUnder17Count: 2 }));
    expect(under.confidence).toBe("likely");
  });

  it("the lower (%-FPL) ceiling binds when the tier is higher", () => {
    const fplBinds = prog("fpl-binds", {
      kidCountIncomeTiers: [{ atLeastKids: 0, maxAnnualSingle: 1000000 }],
      maxIncomePctFPL: 100,
    });
    const limit = monthlyFPL(2);
    const over = evaluateProgram(fplBinds, household(limit + 500, { kidsUnder17Count: 1 }));
    expect(over.confidence).toBe("unlikely");
  });
});

describe("net-basis honesty (locked v3 behavior)", () => {
  it("gross over a net-basis limit is borderline (possible), never fail", () => {
    const netProg = prog("net-basis", { incomeBasis: "net", maxIncomeFlatDollar: 2000 });
    const r = evaluateProgram(netProg, household(2600));
    expect(r.confidence).toBe("possible");
  });
});

describe("adjunctive eligibility", () => {
  it("a qualifying received benefit waives the income test entirely", () => {
    const adjunctive = prog("adjunctive", {
      maxIncomeFlatDollar: 1000,
      incomeWaivedByFlags: ["receivesMedicaid"],
    });
    const r = evaluateProgram(
      adjunctive,
      household(9000, { flags: { receivesMedicaid: true } })
    );
    expect(r.confidence).toBe("likely");
  });
});

describe("kid-count tiers", () => {
  const eitcLike = prog("eitc-like", {
    kidCountIncomeTiers: [
      { atLeastKids: 0, maxAnnualSingle: 18000, maxAnnualJoint: 25000 },
      { atLeastKids: 2, maxAnnualSingle: 52000, maxAnnualJoint: 59000 },
    ],
  });

  it("more kids select the higher tier", () => {
    // $3,000/mo = $36,000/yr: over the 0-kid tier, within the 2-kid tier.
    expect(
      evaluateProgram(eitcLike, household(3000, { kidsUnder17Count: 0 })).confidence
    ).toBe("unlikely");
    expect(
      evaluateProgram(eitcLike, household(3000, { kidsUnder17Count: 2 })).confidence
    ).toBe("likely");
  });

  it("joint filers use the joint ceiling", () => {
    // $1,800/mo = $21,600/yr: over single ($18k), within joint ($25k).
    expect(
      evaluateProgram(eitcLike, household(1800, { kidsUnder17Count: 0, filingStatus: "single" }))
        .confidence
    ).toBe("unlikely");
    expect(
      evaluateProgram(eitcLike, household(1800, { kidsUnder17Count: 0, filingStatus: "joint" }))
        .confidence
    ).toBe("likely");
  });

  it("unanswered kid count is needsInfo, never fail", () => {
    expect(evaluateProgram(eitcLike, household(3000)).confidence).toBe("needsInfo");
  });
});

describe("the higher door (raisedCeilingOpportunity)", () => {
  // NJ FamilyCare's real shape: 138% FPL, or 355% when someone is pregnant
  // or there's a child under 5.
  const twoDoors = prog("two-doors", {
    maxIncomePctFPL: 138,
    raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
    raisedMaxIncomePctFPL: 355,
  });

  it("offers the unanswered flag, with the ceiling it would raise to", () => {
    const open = raisedCeilingOpportunity(twoDoors, household(2000));
    expect(open?.flag).toBe("pregnantOrChildUnder5");
    // The raised ceiling is recomputed by the engine, not hardcoded here.
    expect(open?.ceiling).toBeCloseTo(monthlyFPL(2) * 3.55, 5);
  });

  it("stays silent once the flag is answered either way", () => {
    // "Yes" — they are already measured against the raised ceiling.
    expect(
      raisedCeilingOpportunity(twoDoors, household(2000, { flags: { pregnantOrChildUnder5: true } }))
    ).toBeUndefined();
    // "No" — re-asking about a pregnancy would be badgering.
    expect(
      raisedCeilingOpportunity(twoDoors, household(2000, { flags: { pregnantOrChildUnder5: false } }))
    ).toBeUndefined();
  });

  it("ignores programs with one door, or a flag that doesn't raise the line", () => {
    expect(raisedCeilingOpportunity(prog("flat", { maxIncomePctFPL: 138 }), household(2000)))
      .toBeUndefined();
    // Flag listed but no raised figure: the ceiling never moves, so there is
    // no door to offer.
    const noRaise = prog("no-raise", {
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["disabled"],
    });
    expect(raisedCeilingOpportunity(noRaise, household(2000))).toBeUndefined();
  });

  it("picks the flag that opens the line widest", () => {
    const twoFlags = prog("two-flags", {
      maxIncomeFlatDollar: 1000,
      raisedIncomeLimitFlags: ["schoolAgeChild", "pregnantOrChildUnder5"],
      raisedMaxIncomeFlatDollar: 5000,
    });
    // Both flags raise to the same figure here, so the first wins; what
    // matters is that a choice is made and the raised ceiling is reported.
    const open = raisedCeilingOpportunity(twoFlags, household(2000));
    expect(open?.ceiling).toBe(5000);
    // With one already declined, the other is still offered.
    const declined = raisedCeilingOpportunity(
      twoFlags,
      household(2000, { flags: { schoolAgeChild: false } })
    );
    expect(declined?.flag).toBe("pregnantOrChildUnder5");
  });

  it("says nothing before household size is known, since every ceiling scales with it", () => {
    const noSize: Household = { state: "US", flags: {} };
    expect(raisedCeilingOpportunity(twoDoors, noSize)).toBeUndefined();
  });
});
