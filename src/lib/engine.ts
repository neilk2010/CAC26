import { monthlyFPL } from "@/data/fpl";
import { FLAG_QUESTIONS } from "@/data/questions";
import { money } from "@/lib/format";
import type {
  CategoricalFlag,
  Confidence,
  EligibilityResult,
  Household,
  Program,
  ProgramRules,
} from "@/lib/types";

type TestStatus = "pass" | "fail" | "borderline" | "unknown";

// Plain-language labels for reason traces, derived from the shared question
// catalog so the wording lives in exactly one place (src/data/questions.ts).
const FLAG_LABELS = Object.fromEntries(
  FLAG_QUESTIONS.map((q) => [q.flag, q.label])
) as Record<CategoricalFlag, string>;

/** Looks up a size-varying monthly dollar ceiling, extending past the table's largest key. */
function sizeTableMonthlyLimit(
  table: Record<number, number>,
  extraPerPerson: number | undefined,
  householdSize: number
): number {
  const keys = Object.keys(table).map(Number);
  const maxKey = Math.max(...keys);
  const size = Math.max(1, Math.round(householdSize));
  if (size <= maxKey) return table[size] ?? table[maxKey];
  return table[maxKey] + (extraPerPerson ?? 0) * (size - maxKey);
}

function monthlyIncomeLimits(rules: ProgramRules, household: Household) {
  let maxMonthly: number | undefined;
  let minMonthly: number | undefined;
  const householdSize = household.householdSize!;

  // Kid-count-tiered annual ceilings (EITC/CTC-style credits). testIncome
  // guarantees kidsUnder17Count is answered before this runs.
  if (rules.kidCountIncomeTiers !== undefined) {
    const kids = household.kidsUnder17Count ?? 0;
    const tier = [...rules.kidCountIncomeTiers]
      .sort((a, b) => b.atLeastKids - a.atLeastKids)
      .find((t) => kids >= t.atLeastKids);
    if (tier) {
      const annual =
        household.filingStatus === "joint" && tier.maxAnnualJoint !== undefined
          ? tier.maxAnnualJoint
          : tier.maxAnnualSingle;
      const tierMonthly = annual / 12;
      maxMonthly = maxMonthly === undefined ? tierMonthly : Math.min(maxMonthly, tierMonthly);
    }
  }

  const raised =
    rules.raisedIncomeLimitFlags?.some((f) => household.flags[f] === true) ?? false;
  const effectivePctFPL = raised && rules.raisedMaxIncomePctFPL !== undefined
    ? rules.raisedMaxIncomePctFPL
    : rules.maxIncomePctFPL;
  const effectiveFlatDollar = raised && rules.raisedMaxIncomeFlatDollar !== undefined
    ? rules.raisedMaxIncomeFlatDollar
    : rules.maxIncomeFlatDollar;

  if (effectivePctFPL !== undefined) {
    // Combine with any ceiling already derived (kid-count tiers above): the
    // binding limit is the LOWEST one. Assigning here used to silently clobber
    // a lower tier ceiling — caught by the v4 cliff audit, locked by a test.
    const pctMonthly = monthlyFPL(householdSize) * (effectivePctFPL / 100);
    maxMonthly = maxMonthly === undefined ? pctMonthly : Math.min(maxMonthly, pctMonthly);
  }
  if (rules.minIncomePctFPL !== undefined) {
    minMonthly = monthlyFPL(householdSize) * (rules.minIncomePctFPL / 100);
  }
  if (rules.maxIncomeSizeTable !== undefined) {
    const tableMonthly = sizeTableMonthlyLimit(
      rules.maxIncomeSizeTable,
      rules.sizeTableExtraPerPerson,
      householdSize
    );
    maxMonthly = maxMonthly === undefined ? tableMonthly : Math.min(maxMonthly, tableMonthly);
  }
  if (effectiveFlatDollar !== undefined) {
    const flatMonthly =
      rules.incomePeriod === "annual" ? effectiveFlatDollar / 12 : effectiveFlatDollar;
    maxMonthly = maxMonthly === undefined ? flatMonthly : Math.min(maxMonthly, flatMonthly);
  }
  return { minMonthly, maxMonthly };
}

/**
 * The monthly income line this household is measured against for one program.
 * The engine already derives it to decide the outcome; exposing it lets the UI
 * show someone where they actually sit instead of only a confidence word.
 * Undefined when the program sets no ceiling, or household size is still
 * unknown — every ceiling scales with it.
 */
export function monthlyIncomeCeiling(
  program: Program,
  household: Household
): number | undefined {
  if (household.householdSize === undefined) return undefined;
  return monthlyIncomeLimits(program.rules, household).maxMonthly;
}

function testIncome(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  // Adjunctive/categorical eligibility: already receiving a qualifying program
  // waives the income test entirely (e.g. WIC via SNAP/Medicaid/TANF; Lifeline
  // via SNAP/Medicaid/SSI). Can only add matches, never remove them.
  const waiver = (rules.incomeWaivedByFlags ?? []).find((f) => household.flags[f] === true);
  if (waiver !== undefined) {
    return {
      status: "pass",
      reason: `Because ${FLAG_LABELS[waiver]}, this program's income test is automatically met.`,
    };
  }

  if (!household.householdSize) {
    return { status: "unknown", reason: "We still need your household size to check the income rule." };
  }
  if (household.monthlyIncomeMin === undefined && household.monthlyIncomeMax === undefined) {
    return { status: "unknown", reason: "We still need your income range to check this program." };
  }
  if (rules.kidCountIncomeTiers !== undefined && household.kidsUnder17Count === undefined) {
    return {
      status: "unknown",
      reason:
        "This credit's income limit depends on how many children under 17 live with you — we still need that number.",
    };
  }

  const incMin = household.monthlyIncomeMin ?? household.monthlyIncomeMax!;
  const incMax = household.monthlyIncomeMax ?? household.monthlyIncomeMin!;
  const { minMonthly, maxMonthly } = monthlyIncomeLimits(rules, household);

  let upper: TestStatus = "pass";
  if (maxMonthly !== undefined) {
    if (incMax <= maxMonthly) upper = "pass";
    else if (incMin > maxMonthly) upper = "fail";
    else upper = "borderline";
  }

  let lower: TestStatus = "pass";
  if (minMonthly !== undefined) {
    if (incMin >= minMonthly) lower = "pass";
    else if (incMax < minMonthly) lower = "fail";
    else lower = "borderline";
  }

  if (upper === "fail") {
    // Net-basis programs (WFNJ, SSI, CAPI, County GA) test income AFTER
    // deductions, but we only collect gross. Net ≤ gross always, so gross
    // over the limit can honestly only ever be "borderline" — a hard fail
    // here wrongly turned away households whose net income still qualifies.
    if (rules.incomeBasis === "net") {
      return {
        status: "borderline",
        reason: `This program counts income after deductions (things like work expenses and child care), and your before-tax income is above its ${money(
          maxMonthly!
        )}/month line — you may still qualify once deductions are counted, so it's worth checking with the agency.`,
      };
    }
    return {
      status: "fail",
      reason: `Your household income looks like it's above the limit for this program (about ${money(
        maxMonthly!
      )}/month for a household of ${household.householdSize}).`,
      counterfactual: `If your monthly household income were below about ${money(
        maxMonthly!
      )}, you'd likely qualify on income.`,
    };
  }
  if (lower === "fail") {
    return {
      status: "fail",
      reason: `This program has an income floor of about ${money(
        minMonthly!
      )}/month, and your income looks like it's below that.`,
      counterfactual: `This one kicks in once household income is above about ${money(
        minMonthly!
      )}/month.`,
    };
  }
  if (upper === "borderline" || lower === "borderline") {
    return {
      status: "borderline",
      reason: "Your income is close to the line for this program — worth double-checking with the agency.",
    };
  }
  return { status: "pass", reason: "Your household income looks like it fits within the limit." };
}

function testCategorical(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  const reqs = rules.categoricalRequirements;
  if (reqs.length === 0) {
    return { status: "pass", reason: "No age, disability, or family-status requirement for this one." };
  }

  const evals = reqs.map((r) => household.flags[r.type]);
  const labels = reqs.map((r) => FLAG_LABELS[r.type]);

  if (rules.requireAllCategorical) {
    if (evals.some((v) => v === false)) {
      return {
        status: "fail",
        reason: `This program requires that ${labels.join(" and ")}.`,
      };
    }
    if (evals.every((v) => v === true)) {
      return { status: "pass", reason: `Matches the requirement: ${labels.join(" and ")}.` };
    }
    return {
      status: "unknown",
      reason: `We still need to confirm: ${labels.join(" and ")}.`,
    };
  }

  // any-of
  if (evals.some((v) => v === true)) {
    return { status: "pass", reason: `Matches at least one qualifying condition (${labels.join(", ")}).` };
  }
  if (evals.every((v) => v === false)) {
    return {
      status: "fail",
      reason: `This program requires at least one of: ${labels.join(", ")}.`,
      counterfactual: `You'd need at least one of these to apply: ${labels.join(", ")}.`,
    };
  }
  return {
    status: "unknown",
    reason: `We still need to confirm one of: ${labels.join(", ")}.`,
  };
}

function testAssets(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  if (rules.assetLimitDollar === undefined) {
    // No resource test for this program — nothing to check.
    return { status: "pass", reason: "" };
  }
  const limit = rules.assetLimitDollar;
  if (household.liquidAssetsMin === undefined && household.liquidAssetsMax === undefined) {
    return {
      status: "unknown",
      reason: `This program has a resource limit of about ${money(
        limit
      )} — we still need your rough savings to check it.`,
    };
  }

  const assetsMin = household.liquidAssetsMin ?? household.liquidAssetsMax!;
  const assetsMax = household.liquidAssetsMax ?? household.liquidAssetsMin!;

  if (assetsMax <= limit) {
    return {
      status: "pass",
      reason: `Your savings look within this program's resource limit of about ${money(limit)}.`,
    };
  }
  if (assetsMin > limit) {
    return {
      status: "fail",
      reason: `This program limits countable resources to about ${money(
        limit
      )}, and your savings look higher than that.`,
      counterfactual: `Programs like this one only count resources up to about ${money(
        limit
      )} — some savings (like a home or one car) usually don't count.`,
    };
  }
  return {
    status: "borderline",
    reason: `Your savings are close to this program's resource limit of about ${money(
      limit
    )} — worth checking with the agency.`,
  };
}

function testFields(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string; counterfactual?: string } {
  if (rules.requireKidsUnder17) {
    if (household.kidsUnder17Count === undefined) {
      return {
        status: "unknown",
        reason: "We still need to know how many children under 17 live with you.",
      };
    }
    if (household.kidsUnder17Count === 0) {
      return {
        status: "fail",
        reason: "This credit requires at least one qualifying child under 17.",
      };
    }
  }

  const reqs = rules.fieldRequirements ?? [];
  if (reqs.length === 0) return { status: "pass", reason: "" };

  const missing = reqs.filter((r) => household[r.field] === undefined);
  const failed = reqs.filter(
    (r) => household[r.field] !== undefined && !r.oneOf.includes(household[r.field] as string)
  );

  if (failed.length > 0) {
    return {
      status: "fail",
      reason: `This program requires that ${failed.map((r) => r.label).join(" and ")}.`,
    };
  }
  if (missing.length > 0) {
    return {
      status: "unknown",
      reason: `We still need to confirm: ${missing.map((r) => r.label).join(" and ")}.`,
    };
  }
  return {
    status: "pass",
    reason: `Matches the requirement: ${reqs.map((r) => r.label).join(" and ")}.`,
  };
}

function testDisqualifiers(
  rules: ProgramRules,
  household: Household
): { status: TestStatus; reason: string } {
  const hit = (rules.disqualifyingFlags ?? []).find((f) => household.flags[f] === true);
  if (hit !== undefined) {
    return { status: "fail", reason: `This program isn't available when ${FLAG_LABELS[hit]}.` };
  }
  // Unanswered disqualifiers don't block or nag — they're refinement questions
  // on the relevant category page, and most households are nowhere near them.
  return { status: "pass", reason: "" };
}

export function evaluateProgram(program: Program, household: Household): EligibilityResult {
  const income = testIncome(program.rules, household);
  const categorical = testCategorical(program.rules, household);
  const assets = testAssets(program.rules, household);
  const fields = testFields(program.rules, household);
  const disqualifiers = testDisqualifiers(program.rules, household);

  const reasons = [income.reason, categorical.reason];
  // Only surface the resource reason for programs that actually test assets.
  if (program.rules.assetLimitDollar !== undefined) reasons.push(assets.reason);
  if (fields.reason !== "") reasons.push(fields.reason);
  if (disqualifiers.reason !== "") reasons.push(disqualifiers.reason);
  const counterfactual =
    income.counterfactual ?? categorical.counterfactual ?? assets.counterfactual ?? fields.counterfactual;

  let confidence: Confidence;
  if (
    income.status === "fail" ||
    categorical.status === "fail" ||
    assets.status === "fail" ||
    fields.status === "fail" ||
    disqualifiers.status === "fail"
  ) {
    confidence = "unlikely";
  } else if (income.status === "unknown" || assets.status === "unknown") {
    confidence = "needsInfo";
  } else if (
    income.status === "pass" &&
    categorical.status === "pass" &&
    assets.status === "pass" &&
    fields.status === "pass"
  ) {
    confidence = "likely";
  } else {
    // some dimension is borderline, or a categorical/field answer is still unknown
    confidence = "possible";
  }

  // Programs decided by a formula, rating, or waitlist we can't model never
  // show better than "possible" — "likely" would overpromise.
  if (program.confidenceCap === "possible" && confidence === "likely") {
    confidence = "possible";
    reasons.push(
      "The agency makes the final call here (its own formula, rating, or waitlist) — we can't promise this one."
    );
  }

  return { program, confidence, reasons, counterfactual };
}

export function evaluateAll(programs: Program[], household: Household): EligibilityResult[] {
  return programs.map((p) => evaluateProgram(p, household));
}

/** "Eligibility so far" meter: count of programs not yet ruled out. */
export function stillPossibleCount(results: EligibilityResult[]): number {
  return results.filter((r) => r.confidence !== "unlikely").length;
}

/** Rough "money left on the table" estimate: midpoint of value range, summed over likely + possible results. */
export function estimatedAnnualValue(results: EligibilityResult[]): { min: number; max: number } {
  const relevant = results.filter((r) => r.confidence === "likely" || r.confidence === "possible");
  return relevant.reduce(
    (acc, r) => ({
      min: acc.min + (r.program.estimatedAnnualValueMin ?? 0),
      max: acc.max + (r.program.estimatedAnnualValueMax ?? 0),
    }),
    { min: 0, max: 0 }
  );
}

/** Single-number estimate (midpoint of each program's value range) for the benefits-cliff simulator. */
export function estimatedAnnualValueMidpoint(results: EligibilityResult[]): number {
  const { min, max } = estimatedAnnualValue(results);
  return Math.round((min + max) / 2);
}

/** Cascade suggestions: programs hinted at by "likely" results, that aren't already likely themselves. */
export function cascadeSuggestions(results: EligibilityResult[]): { from: Program; suggested: Program }[] {
  const byId = new Map(results.map((r) => [r.program.id, r]));
  const likely = results.filter((r) => r.confidence === "likely");
  const suggestions: { from: Program; suggested: Program }[] = [];

  for (const r of likely) {
    for (const hintId of r.program.cascadeHints ?? []) {
      const hinted = byId.get(hintId);
      if (hinted && hinted.confidence !== "likely") {
        suggestions.push({ from: r.program, suggested: hinted.program });
      }
    }
  }
  return suggestions;
}
