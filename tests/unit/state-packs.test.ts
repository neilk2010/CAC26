import { describe, expect, it } from "vitest";
import { STATES, deepStates, getState } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import type { Household } from "@/lib/types";

// Guards the hand-verified state packs as a group. These are data invariants,
// not engine logic: they catch the mistakes that are easy to make when adding
// a pack by hand (a typo'd supersedes id, a stale lastVerified, a program that
// can never match anyone) and that no other test would notice.

const DEEP_CODES = ["NJ", "CA", "TX", "FL", "NY", "PA", "IL", "OH", "GA", "NC", "MI"];

describe("deep state packs", () => {
  it("every expected state has a deep pack and no state appears twice", () => {
    const codes = deepStates().map((s) => s.code).sort();
    expect(codes).toEqual([...DEEP_CODES].sort());
    const all = STATES.map((s) => s.code);
    expect(new Set(all).size).toBe(all.length);
  });

  it("all 50 states plus DC are still selectable", () => {
    expect(STATES.length).toBe(51);
  });

  for (const code of DEEP_CODES) {
    describe(code, () => {
      const state = getState(code)!;
      const statePack = state.programs.filter((p) => p.state === code);

      it("supersedes only real federal ids, and drops them from the composed list", () => {
        const composedIds = new Set(state.programs.map((p) => p.id));
        for (const p of statePack) {
          for (const federalId of p.supersedes ?? []) {
            expect(federalId.startsWith("us-"), `${p.id} supersedes ${federalId}`).toBe(true);
            // The whole point of supersedes: no household sees both.
            expect(composedIds.has(federalId), `${federalId} still present in ${code}`).toBe(false);
          }
        }
      });

      it("program ids are unique and namespaced to the state", () => {
        const ids = statePack.map((p) => p.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id.startsWith(`${code.toLowerCase()}-`)).toBe(true);
      });

      it("every program cites a real source and apply link, and states its own code", () => {
        for (const p of statePack) {
          expect(p.state).toBe(code);
          expect(p.sourceUrl).toMatch(/^https:\/\//);
          expect(p.applyUrl).toMatch(/^https:\/\//);
          // A stamped date must be a real ISO date, not a placeholder.
          expect(p.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(Number.isNaN(Date.parse(p.lastVerified))).toBe(false);
        }
      });

      it("cascadeHints point at programs that exist for this state", () => {
        const composedIds = new Set(state.programs.map((p) => p.id));
        for (const p of statePack) {
          for (const hint of p.cascadeHints ?? []) {
            expect(composedIds.has(hint), `${p.id} → missing ${hint}`).toBe(true);
          }
        }
      });

      it("a low-income family with kids matches food, health and energy help", () => {
        const household: Household = {
          state: code,
          householdSize: 3,
          monthlyIncomeMin: 1000,
          monthlyIncomeMax: 1500,
          liquidAssetsMin: 0,
          liquidAssetsMax: 2000,
          kidsUnder17Count: 2,
          flags: { schoolAgeChild: true, paysHomeEnergy: true },
        };
        // Match on category, not on id spelling — program ids legitimately
        // differ per state (nj-familycare, ca-medi-cal, mi-fap, nc-fns...).
        const live = new Set(
          evaluateAll(state.programs, household)
            .filter((r) => r.confidence !== "unlikely")
            .map((r) => r.program.category)
        );
        for (const category of ["food", "health", "energy"] as const) {
          expect(live.has(category), `${code} has no live ${category} program`).toBe(true);
        }
      });

      it("no program is dead on arrival — each can match some household", () => {
        // Two households, because one can't reach everything: programs with an
        // income FLOOR (marketplace subsidies) and programs that require owning
        // a home (senior freezes, homestead exemptions) are correctly out of
        // reach for a zero-income renter. A program unreachable by BOTH is
        // almost certainly mis-encoded.
        const poorRenterWithKids: Household = {
          state: code,
          householdSize: 3,
          monthlyIncomeMin: 0,
          monthlyIncomeMax: 500,
          liquidAssetsMin: 0,
          liquidAssetsMax: 500,
          kidsUnder17Count: 2,
          employmentStatus: "working",
          housingTenure: "rent",
          filingStatus: "headOfHousehold",
          flags: {
            schoolAgeChild: true,
            pregnantOrChildUnder5: true,
            paysHomeEnergy: true,
            utilityHardship: true,
            filesTaxes: true,
          },
        };
        const olderHomeownerModestIncome: Household = {
          state: code,
          householdSize: 2,
          // A deliberately wide range: it straddles the thresholds that sit
          // close together here (NY's Essential Plan hands off to marketplace
          // subsidies at 200% FPL), so those programs land on "borderline"
          // rather than falling into a gap between two test households.
          monthlyIncomeMin: 3000,
          monthlyIncomeMax: 4500,
          liquidAssetsMin: 0,
          liquidAssetsMax: 2000,
          kidsUnder17Count: 0,
          employmentStatus: "retired",
          housingTenure: "own",
          filingStatus: "joint",
          flags: {
            age65Plus: true,
            disabled: true,
            paysHomeEnergy: true,
            filesTaxes: true,
            veteran: true,
          },
        };
        const reachable = new Set(
          [poorRenterWithKids, olderHomeownerModestIncome].flatMap((h) =>
            evaluateAll(state.programs, h)
              .filter((r) => r.confidence !== "unlikely")
              .map((r) => r.program.id)
          )
        );
        for (const p of statePack) {
          expect(reachable.has(p.id), `${p.id} is unreachable by any household`).toBe(true);
        }
      });
    });
  }
});
