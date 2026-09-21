import { describe, expect, it } from "vitest";
import { getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import { monthlyFPL } from "@/data/fpl";
import type { Household } from "@/lib/types";

// The Florida lesson, locked down.
//
// The federal baseline models Medicaid at 138% FPL. In a state that never took
// the ACA expansion that is wildly wrong — Texas caps parents at roughly $196
// a month and covers childless adults at no income at all. If a future edit
// dropped a non-expansion state's own Medicaid entry, or forgot its
// `supersedes`, the federal 138% entry would quietly reappear and tell people
// they qualify for coverage that does not exist for them. That is the single
// most harmful failure mode in this dataset, so it gets its own test.

/** States whose packs must NOT leave the federal 138% Medicaid entry standing. */
const NON_EXPANSION = ["TX", "FL", "GA"];

function household(state: string, monthlyIncome: number, extra: Partial<Household> = {}): Household {
  return {
    state,
    householdSize: 1,
    monthlyIncomeMin: monthlyIncome,
    monthlyIncomeMax: monthlyIncome,
    flags: {},
    ...extra,
  };
}

describe("non-expansion states never inherit the federal 138% Medicaid rule", () => {
  for (const code of NON_EXPANSION) {
    describe(code, () => {
      const state = getState(code)!;

      it("supersedes the federal Medicaid entry", () => {
        const ids = state.programs.map((p) => p.id);
        expect(ids, `${code} must replace us-medicaid with its own rules`).not.toContain(
          "us-medicaid"
        );
      });

      it("does not tell a childless adult at 130% FPL they likely qualify", () => {
        // 130% FPL is comfortably under the federal expansion line of 138%, so
        // us-medicaid would rate this "likely". No non-expansion state should.
        const income = monthlyFPL(1) * 1.3;
        const results = evaluateAll(state.programs, household(code, income));
        const confidentHealth = results.filter(
          (r) =>
            r.program.category === "health" &&
            r.confidence === "likely" &&
            /medicaid/i.test(r.program.name)
        );
        expect(
          confidentHealth.map((r) => r.program.id),
          `${code} rated a childless adult at 130% FPL as likely for Medicaid`
        ).toEqual([]);
      });
    });
  }
});

describe("expansion states still work normally", () => {
  // The mirror image: the test above must not be passing because the engine
  // broke for everyone. An expansion state at 130% FPL should still match.
  for (const code of ["OH", "NC", "MI", "PA", "NY", "IL", "NJ", "CA"]) {
    it(`${code} rates a childless adult at 130% FPL as likely for Medicaid`, () => {
      const state = getState(code)!;
      const income = monthlyFPL(1) * 1.3;
      const results = evaluateAll(state.programs, household(code, income));
      const likely = results.filter(
        (r) => r.program.category === "health" && r.confidence === "likely"
      );
      expect(likely.length, `${code} found no likely health coverage`).toBeGreaterThan(0);
    });
  }
});
