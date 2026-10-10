"use client";

import { money } from "@/lib/format";
import { useHousehold } from "@/lib/household-store";
import type { EligibilityResult, Household } from "@/lib/types";

// The advisory layer, static and deterministic: what to DO next and what a
// match may be WORTH — computed only from fields on the program record
// (plus the household's kid count for per-child credits). Nothing here
// estimates, interpolates, or invents: if the record doesn't carry a value,
// we say to verify with the official source. The optional AI layer
// (ExplainButton) sits on top of this and can only rephrase; this block is
// the floor that always renders.

/**
 * Deterministic worth line from record fields only:
 * - Per-child credits (records with requireKidsUnder17 + a per-child min,
 *   like the CTC): kid count × the record's own per-child figure, capped by
 *   the record's own max. Pure arithmetic on record numbers.
 * - Otherwise: the record's verified min–max range, stated as a range.
 */
function worthLine(result: EligibilityResult, household: Household): string | null {
  const { program } = result;
  const min = program.estimatedAnnualValueMin;
  const max = program.estimatedAnnualValueMax;
  if (min === undefined && max === undefined) return null;

  const kids = household.kidsUnder17Count;
  if (program.rules.requireKidsUnder17 && min !== undefined && kids !== undefined && kids > 0) {
    const computed = Math.min(kids * min, max ?? kids * min);
    return `Around ${money(computed)}/year for your ${kids} ${
      kids === 1 ? "child" : "children"
    }, based on this program's per-child figure — the exact amount comes out of your tax return.`;
  }
  if (min !== undefined && max !== undefined) {
    return `Typically ${money(min)}–${money(max)}/year depending on your household — the agency sets the exact amount.`;
  }
  return null;
}

function nextStepLine(result: EligibilityResult): string {
  const { program } = result;
  const weeks =
    program.estimatedTimeToBenefitWeeksMin !== undefined &&
    program.estimatedTimeToBenefitWeeksMax !== undefined
      ? program.estimatedTimeToBenefitWeeksMin === 0
        ? ` Help usually starts within ${program.estimatedTimeToBenefitWeeksMax} week${
            program.estimatedTimeToBenefitWeeksMax === 1 ? "" : "s"
          }.`
        : ` Typical time to benefit: ${program.estimatedTimeToBenefitWeeksMin}–${program.estimatedTimeToBenefitWeeksMax} weeks.`
      : "";
  return `Apply with ${program.agencyName} — the button below goes to the official application.${weeks}`;
}

export function Advisory({ result }: { result: EligibilityResult }) {
  const { household } = useHousehold();
  if (result.confidence === "unlikely") return null;

  const worth = worthLine(result, household);

  return (
    <div className="rise-in rounded-lg bg-background/50 border border-card-border px-4 py-3 space-y-1.5">
      <p className="text-sm">
        <span className="text-xs text-muted mr-2">Next step</span>
        {nextStepLine(result)}
      </p>
      {worth ? (
        <p className="text-sm">
          <span className="text-xs text-muted mr-2">Worth</span>
          {worth}
        </p>
      ) : (
        <p className="text-sm text-muted">
          <span className="text-xs mr-2">Worth</span>
          This record doesn&apos;t carry a dollar estimate — verify with the official source.
        </p>
      )}
    </div>
  );
}
