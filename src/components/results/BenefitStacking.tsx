"use client";

import Link from "next/link";
import { InfoBox } from "@/components/ui/InfoBox";
import { money, moneyRange } from "@/lib/format";
import { FLAG_QUESTIONS } from "@/data/questions";
import type { CategoricalFlag, EligibilityResult, Household } from "@/lib/types";

// How the matched programs combine: the likely ones summed as one honest
// range, adjunctive links surfaced from the rules themselves (enrolling in
// one program can auto-qualify another's income test), and a pointer to the
// cliff simulator where a raise could change the picture. Everything here is
// derived from record fields — same basis as the cards.

const FLAG_LABELS = Object.fromEntries(
  FLAG_QUESTIONS.map((q) => [q.flag, q.label])
) as Record<CategoricalFlag, string>;

export function BenefitStacking({
  results,
  flags,
}: {
  results: EligibilityResult[];
  flags: Household["flags"];
}) {
  const likely = results.filter((r) => r.confidence === "likely");
  if (likely.length < 2) return null;

  const valued = likely.filter(
    (r) =>
      r.program.estimatedAnnualValueMin !== undefined &&
      r.program.estimatedAnnualValueMax !== undefined
  );
  const totalMin = valued.reduce((s, r) => s + r.program.estimatedAnnualValueMin!, 0);
  const totalMax = valued.reduce((s, r) => s + r.program.estimatedAnnualValueMax!, 0);

  // Adjunctive links from the rules: programs still in play whose income test
  // would be waived by a benefit the household doesn't (yet) report receiving.
  const interactions = results
    .filter((r) => r.confidence === "likely" || r.confidence === "possible")
    .flatMap((r) =>
      (r.program.rules.incomeWaivedByFlags ?? [])
        .filter((f) => flags[f] !== true)
        .map((f) => ({ program: r.program, flagLabel: FLAG_LABELS[f] }))
    );

  return (
    <InfoBox
      label="How these stack"
      title={`Your ${likely.length} likely programs together ≈ ${moneyRange(totalMin, totalMax)}/yr`}
    >
      <ul className="text-sm space-y-1.5">
        {likely.map((r) => (
          <li key={r.program.id} className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">{r.program.shortName}</span>
            <span className="tabular-nums text-muted shrink-0">
              {r.program.estimatedAnnualValueMin !== undefined &&
              r.program.estimatedAnnualValueMax !== undefined
                ? r.program.estimatedAnnualValueMin === r.program.estimatedAnnualValueMax
                  ? `${money(r.program.estimatedAnnualValueMin)}/yr`
                  : `${moneyRange(
                      r.program.estimatedAnnualValueMin,
                      r.program.estimatedAnnualValueMax
                    )}/yr`
                : "value varies"}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted">
        Summed from each record&apos;s verified range — the agencies set the real amounts, and
        some programs count others as income, so the true total can differ.
      </p>

      {interactions.length > 0 && (
        <div className="pt-1 space-y-1.5">
          <p className="text-xs text-muted">programs that unlock each other</p>
          {interactions.map(({ program, flagLabel }, i) => (
            <p key={`${program.id}-${i}`} className="text-sm">
              <span className="font-medium">{program.shortName}</span>
              <span className="text-muted">
                {" "}
                — its income test is automatically met once {flagLabel}.
              </span>
            </p>
          ))}
        </div>
      )}

      <p className="text-sm pt-1">
        Planning extra hours or a raise? Stacked benefits can drop at once —{" "}
        <Link href="/cliff-simulator" className="text-accent underline hover:no-underline">
          see what a raise really nets you
        </Link>
      </p>
    </InfoBox>
  );
}
