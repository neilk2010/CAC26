import { describe, expect, it } from "vitest";
import { icsForRule, matchedDeadlines, nextOccurrence } from "@/lib/deadline-utils";
import { DEADLINE_RULES } from "@/data/deadlines";
import { STATES } from "@/data/states";
import { evaluateAll } from "@/lib/engine";
import type { Household } from "@/lib/types";

describe("nextOccurrence", () => {
  it("stays in the current year when the date is ahead", () => {
    expect(nextOccurrence(11, 1, new Date(2026, 6, 8))).toEqual({
      year: 2026,
      month: 11,
      day: 1,
    });
  });
  it("rolls to next year when the date has passed", () => {
    expect(nextOccurrence(1, 31, new Date(2026, 6, 8))).toEqual({
      year: 2027,
      month: 1,
      day: 31,
    });
  });
  it("today counts as upcoming, not passed", () => {
    expect(nextOccurrence(7, 8, new Date(2026, 6, 8))).toEqual({ year: 2026, month: 7, day: 8 });
  });
});

describe("deadline data invariants", () => {
  const allProgramIds = new Set(STATES.flatMap((s) => s.programs.map((p) => p.id)));

  it("every referenced program id exists", () => {
    for (const rule of DEADLINE_RULES) {
      for (const id of rule.programIds ?? []) {
        expect(allProgramIds.has(id), `${rule.id} references missing program ${id}`).toBe(true);
      }
    }
  });

  it("every rule has either a stated date or an honest 'varies' — never neither", () => {
    for (const rule of DEADLINE_RULES) {
      const dated = rule.opens !== undefined || rule.closes !== undefined;
      expect(dated || rule.varies !== undefined, rule.id).toBe(true);
    }
  });

  it("supersededBy references are real rule ids", () => {
    const ids = new Set(DEADLINE_RULES.map((r) => r.id));
    for (const rule of DEADLINE_RULES) {
      for (const s of rule.supersededBy ?? []) expect(ids.has(s), `${rule.id} → ${s}`).toBe(true);
    }
  });
});

describe("matchedDeadlines", () => {
  const now = new Date(2026, 6, 8);

  it("NJ household gets the NJ marketplace window, not the federal one", () => {
    const nj = STATES.find((s) => s.code === "NJ")!;
    // Income ABOVE 100% FPL: marketplace subsidies have an income floor, so a
    // very-low-income household correctly does NOT match them (Medicaid does).
    const household: Household = {
      state: "NJ",
      householdSize: 3,
      monthlyIncomeMin: 3000,
      monthlyIncomeMax: 3500,
      flags: {},
    };
    const { personal } = matchedDeadlines(evaluateAll(nj.programs, household), household, now);
    const ids = personal.map((m) => m.rule.id);
    expect(ids).toContain("aca-oep-nj");
    expect(ids).not.toContain("aca-oep-federal");
    expect(ids).toContain("liheap-nj");
    expect(ids).not.toContain("liheap-general");
  });

  it("a federal-tier household falls back to the federal windows", () => {
    // AZ is still federal-tier (GA was promoted to a deep pack alongside
    // OH/NC/MI, so it no longer falls back to the federal windows).
    const az = STATES.find((s) => s.code === "AZ")!;
    const household: Household = {
      state: "AZ",
      householdSize: 3,
      monthlyIncomeMin: 1500,
      monthlyIncomeMax: 2000,
      flags: {},
    };
    const { personal } = matchedDeadlines(evaluateAll(az.programs, household), household, now);
    const ids = personal.map((m) => m.rule.id);
    expect(ids).toContain("aca-oep-federal");
    expect(ids).toContain("liheap-general");
  });

  it("a deep-state household (TX) gets its own LIHEAP season, not a dead end", () => {
    const tx = STATES.find((s) => s.code === "TX")!;
    const household: Household = {
      state: "TX",
      householdSize: 3,
      monthlyIncomeMin: 1500,
      monthlyIncomeMax: 2000,
      flags: { paysHomeEnergy: true },
    };
    const { personal } = matchedDeadlines(evaluateAll(tx.programs, household), household, now);
    const ids = personal.map((m) => m.rule.id);
    // TX has no state marketplace — the federal OEP window applies.
    expect(ids).toContain("aca-oep-federal");
    // tx-ceap matches the varies-by-state LIHEAP rule.
    expect(ids).toContain("liheap-general");
  });

  it("varies-only rules carry no dated moment (nothing invented)", () => {
    const rule = DEADLINE_RULES.find((r) => r.id === "liheap-general")!;
    expect(rule.opens ?? rule.closes).toBeUndefined();
  });
});

describe("icsForRule", () => {
  it("emits a valid calendar with one event per dated moment", () => {
    const fafsa = DEADLINE_RULES.find((r) => r.id === "fafsa")!;
    const ics = icsForRule(fafsa, new Date(2026, 6, 8));
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(2); // opens + closes
    expect(ics).toContain("DTSTART;VALUE=DATE:20261001"); // opens Oct 1, 2026
    expect(ics).toContain("DTSTART;VALUE=DATE:20270630"); // closes Jun 30, 2027
    expect(ics).toContain("studentaid.gov");
  });
});
