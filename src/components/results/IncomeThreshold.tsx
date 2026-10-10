"use client";

import { CONFIDENCE_COLOR } from "@/components/results/confidence";
import { monthlyIncomeCeiling } from "@/lib/engine";
import { money } from "@/lib/format";
import { useHousehold } from "@/lib/household-store";
import type { EligibilityResult } from "@/lib/types";

// Where this household actually sits against a program's income line.
// The engine already derives that line to decide the outcome, so showing it
// costs nothing and turns "Likely eligible" into something a person can check
// against their own paycheck. Renders nothing for programs with no income
// ceiling (crisis funds, waitlists) — there is no line to draw.

const TRACK = 999999; // the open-ended top income bucket's sentinel

export function IncomeThreshold({ result }: { result: EligibilityResult }) {
  const { household } = useHousehold();
  const ceiling = monthlyIncomeCeiling(result.program, household);
  const incomeMin = household.monthlyIncomeMin;
  const incomeMax = household.monthlyIncomeMax;

  if (ceiling === undefined || incomeMin === undefined || incomeMax === undefined) return null;

  // The top bucket is "$7,000+", so its max is a sentinel, not a number to
  // scale the track by.
  const openEnded = incomeMax >= TRACK;
  const bandEnd = openEnded ? Math.max(incomeMin * 1.5, ceiling * 1.3) : incomeMax;
  const scale = Math.max(bandEnd, ceiling) * 1.25;
  const pct = (v: number) => Math.min(100, Math.max(0, (v / scale) * 100));

  const color = CONFIDENCE_COLOR[result.confidence];
  const bandLeft = pct(incomeMin);
  const bandWidth = Math.max(2, pct(bandEnd) - bandLeft);

  // Gross income against a net-basis line would read as "over" when the real
  // test happens after deductions, so say so rather than imply a verdict.
  const net = result.program.rules.incomeBasis === "net";
  let verdict: string;
  if (net) {
    verdict = "This program counts income after deductions, so the real line sits higher than it looks here.";
  } else if (incomeMax <= ceiling) {
    verdict = "Your income is under this program's line.";
  } else if (incomeMin > ceiling) {
    verdict = "Your income is above this program's line.";
  } else {
    verdict = "Your range crosses the line, so it depends where you actually land.";
  }

  return (
    <div className="rounded-lg border border-card-border bg-background/40 px-3 py-2.5 space-y-2">
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-foreground/80">
          You: {openEnded ? `${money(incomeMin)}+` : `${money(incomeMin)}–${money(incomeMax)}`}/mo
        </span>
        <span className="text-muted">
          Limit for {household.householdSize}: {money(Math.round(ceiling))}/mo
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-card-border/60">
        <div
          className="absolute inset-y-0 rounded-full"
          style={{ left: `${bandLeft}%`, width: `${bandWidth}%`, backgroundColor: color, opacity: 0.6 }}
        />
        <div
          className="absolute w-[2px] rounded-full"
          style={{ left: `${pct(ceiling)}%`, top: "-4px", bottom: "-4px", backgroundColor: "var(--foreground)" }}
          aria-hidden
        />
      </div>
      <p className="text-xs text-muted">{verdict}</p>
    </div>
  );
}
