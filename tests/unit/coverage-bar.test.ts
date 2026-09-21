import { describe, expect, it } from "vitest";
import { DEEP_PACKS } from "@/data/states/deep";
import { STATES } from "@/data/states";
import { FEDERAL_PROGRAMS } from "@/data/federal/programs";
import type { Program } from "@/lib/types";

// The FULL COVERAGE bar, enforced.
//
// Until now the bar lived only as a comment in data/states/deep.ts, which
// means nothing stopped a thin pack being promoted and inflating the map. The
// promise on the homepage ("full coverage in N states") is only honest if every
// pack in DEEP_PACKS actually clears it, so that's asserted here instead.

/** Minimum verified state-administered programs for a pack to count as deep. */
const MIN_PROGRAMS = 8;
/**
 * Minimum distinct categories (of the 8 the app covers) — the four required
 * below. Several shipped packs (GA, NC) cover exactly those four, so the bar
 * is set at what the verified data actually clears rather than an aspiration.
 */
const MIN_CATEGORIES = 4;
/**
 * Every state genuinely administers these four, so a pack missing one is a
 * research gap rather than a real difference between states.
 */
const REQUIRED_CATEGORIES: Program["category"][] = ["food", "health", "energy", "cash"];

describe("full-coverage bar", () => {
  it("has at least one deep pack", () => {
    expect(DEEP_PACKS.length).toBeGreaterThan(0);
  });

  for (const pack of DEEP_PACKS) {
    describe(`${pack.meta.name} (${pack.meta.code})`, () => {
      const categories = new Set(pack.programs.map((p) => p.category));

      it(`ships at least ${MIN_PROGRAMS} state programs`, () => {
        expect(pack.programs.length).toBeGreaterThanOrEqual(MIN_PROGRAMS);
      });

      it(`spans at least ${MIN_CATEGORIES} categories`, () => {
        expect(categories.size).toBeGreaterThanOrEqual(MIN_CATEGORIES);
      });

      it("covers food, health, energy and cash", () => {
        const missing = REQUIRED_CATEGORIES.filter((c) => !categories.has(c));
        expect(missing).toEqual([]);
      });

      it("is tiered deep with a real aggregator pointer", () => {
        expect(pack.meta.tier).toBe("deep");
        expect(pack.meta.aggregator.url).toMatch(/^https:\/\/.+/);
        expect(pack.meta.aggregator.name.length).toBeGreaterThan(0);
      });

      it("every program belongs to this state and is fully attributed", () => {
        for (const program of pack.programs) {
          expect(program.state, program.id).toBe(pack.meta.code);
          expect(program.agencyName.length, program.id).toBeGreaterThan(0);
          expect(program.applyUrl, program.id).toMatch(/^https:\/\/.+/);
          expect(program.sourceUrl, program.id).toMatch(/^https:\/\/.+/);
          // ISO date — the data-freshness ground rule depends on this parsing.
          expect(program.lastVerified, program.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
      });
    });
  }
});

describe("cross-reference integrity", () => {
  // Nothing checked these before, so a typo'd id was a silent dead link: a
  // cascade suggestion that never renders, or a `supersedes` that fails to
  // replace its federal entry and shows the household BOTH versions.
  const allIds = new Set(STATES.flatMap((s) => s.programs.map((p) => p.id)));
  const federalIds = new Set(FEDERAL_PROGRAMS.map((p) => p.id));
  // DEFINITIONS, not compositions: the registry deliberately composes every
  // federal program into all 51 jurisdictions, so iterating STATES would see
  // each federal entry 51 times over.
  const allPrograms = [...DEEP_PACKS.flatMap((p) => p.programs), ...FEDERAL_PROGRAMS];

  it("every cascadeHints id resolves to a real program", () => {
    const dangling: string[] = [];
    for (const program of allPrograms) {
      for (const hint of program.cascadeHints ?? []) {
        if (!allIds.has(hint)) dangling.push(`${program.id} → ${hint}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it("every supersedes id names a real federal program", () => {
    const dangling: string[] = [];
    for (const program of allPrograms) {
      for (const sup of program.supersedes ?? []) {
        if (!federalIds.has(sup)) dangling.push(`${program.id} → ${sup}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it("every fieldRequirement oneOf value is a real answer the intake can produce", () => {
    // FieldRequirement.oneOf is typed as string[], so a plausible-looking but
    // invalid value ("student" for employmentStatus) compiles cleanly and then
    // silently never matches — the requirement can never be satisfied and the
    // program quietly stops being reachable. Caught for real while adding GA.
    const VALID: Record<string, string[]> = {
      employmentStatus: ["working", "selfEmployed", "unemployed", "retired", "unableToWork"],
      housingTenure: ["own", "rent", "other"],
      filingStatus: ["single", "joint", "headOfHousehold"],
    };
    const bad: string[] = [];
    for (const program of allPrograms) {
      for (const req of program.rules.fieldRequirements ?? []) {
        for (const value of req.oneOf) {
          if (!VALID[req.field]?.includes(value)) {
            bad.push(`${program.id}: ${req.field} → "${value}"`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });

  it("program ids are unique across the whole library", () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const program of allPrograms) {
      if (seen.has(program.id)) dupes.push(program.id);
      seen.add(program.id);
    }
    expect(dupes).toEqual([]);
  });
});
