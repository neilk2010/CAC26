"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { compareCliff, safeRaiseMonthly } from "@/lib/cliff";
import { money } from "@/lib/format";
import { useCountUp } from "@/lib/use-count-up";
import { Card } from "@/components/ui/Card";
import { InfoBox } from "@/components/ui/InfoBox";

const STEP = 100;
const MAX_INCREASE = 5000;

// The benefits-cliff simulator, on the audited arithmetic in lib/cliff.ts
// (unit-tested — see tests/unit/cliff.test.ts). Basis stated on-page: LIKELY
// programs only, with every program that appears/disappears named and priced
// from its own record.

export default function CliffSimulatorPage() {
  const { household } = useHousehold();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;

  const baselineIncome =
    household.monthlyIncomeMin !== undefined && household.monthlyIncomeMax !== undefined
      ? Math.round((household.monthlyIncomeMin + household.monthlyIncomeMax) / 2)
      : undefined;

  const [increase, setIncrease] = useState(500);

  const comparison = useMemo(() => {
    if (baselineIncome === undefined) return undefined;
    return compareCliff(programs, household, baselineIncome, increase);
  }, [programs, household, baselineIncome, increase]);

  const safeRaise = useMemo(() => {
    if (baselineIncome === undefined) return undefined;
    return safeRaiseMonthly(programs, household, baselineIncome, STEP, MAX_INCREASE);
  }, [programs, household, baselineIncome]);

  // The net-effect headline glides between values as the slider moves — the
  // same count-up voice as the results dashboard (reduced motion: instant).
  const shownNet = useCountUp(comparison?.netEffectAnnual ?? 0, 600);

  if (baselineIncome === undefined || comparison === undefined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-muted">We need your current income first.</p>
        <Link href="/intake" className="text-accent hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  const {
    extraPayAnnual,
    baselineLikelyValue,
    hypotheticalLikelyValue,
    benefitChangeAnnual,
    netEffectAnnual,
    lost,
    gained,
    uncountedPossible,
  } = comparison;

  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Benefits-cliff simulator</h1>
          <p className="text-sm text-muted">
            An <strong className="text-foreground">educational estimate</strong>, not financial
            advice. See roughly what happens to your total resources if your income changes —
            sometimes a raise costs you more in lost benefits than you gain in pay.
          </p>
        </div>

        <InfoBox label="Explainer" title="What's a &ldquo;benefits cliff&rdquo;?">
          <p className="text-sm text-muted leading-relaxed">
            Most assistance programs cut off once your income crosses a limit — sometimes all at
            once, not gradually. That means a modest raise or extra shift can push your income just
            over the line and cost you more in lost benefits than you gained in pay. This tool
            walks through that math using the programs from your results, so you can see the
            trade-off before it happens, not after.
          </p>
        </InfoBox>

        <Card className="p-5 space-y-3">
          <label className="block text-sm font-medium">
            If your monthly income went up by{" "}
            <span className="text-accent font-semibold">{money(increase)}</span>...
          </label>
          <input
            type="range"
            min={0}
            max={MAX_INCREASE}
            step={STEP}
            value={increase}
            onChange={(e) => setIncrease(Number(e.target.value))}
            className="w-full accent-[#2dd4bf]"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>+$0</span>
            <span>+{money(MAX_INCREASE)}</span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="label-mono text-[10px] text-muted">now</p>
            <p className="font-semibold mt-1">{money(baselineIncome)}/mo income</p>
            <p className="text-sm text-muted">
              ~{money(baselineLikelyValue)}/yr in likely benefits
            </p>
          </Card>
          <Card className="p-4">
            <p className="label-mono text-[10px] text-muted">if income rises</p>
            <p className="font-semibold mt-1">{money(baselineIncome + increase)}/mo income</p>
            <p className="text-sm text-muted">
              ~{money(hypotheticalLikelyValue)}/yr in likely benefits
            </p>
          </Card>
        </div>

        <div
          className="rounded-xl p-5 border"
          style={{
            borderColor: netEffectAnnual >= 0 ? "rgba(45,212,191,0.35)" : "rgba(248,113,113,0.35)",
            backgroundColor:
              netEffectAnnual >= 0 ? "rgba(45,212,191,0.08)" : "rgba(248,113,113,0.08)",
          }}
        >
          <p className="label-mono text-[10px] text-muted">estimated net effect per year</p>
          <p
            className="text-3xl font-bold mt-1 tabular-nums"
            style={{
              color: `color-mix(in srgb, ${
                netEffectAnnual >= 0 ? "#2dd4bf" : "#f87171"
              } 78%, var(--foreground))`,
            }}
          >
            {shownNet >= 0 ? "+" : "−"}
            {money(Math.abs(shownNet))}
          </p>
          <p className="text-xs text-muted mt-1">
            Extra pay ({money(extraPayAnnual)}/yr){" "}
            {benefitChangeAnnual <= 0 ? "minus" : "plus"} the change in estimated likely benefits
            ({money(Math.abs(benefitChangeAnnual))}/yr{" "}
            {benefitChangeAnnual <= 0 ? "lost" : "gained"}).
          </p>
        </div>

        {(lost.length > 0 || gained.length > 0) && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              What changes at +{money(increase)}/mo
            </h2>
            <div className="space-y-2">
              {lost.map((d) => (
                <div
                  key={d.program.id}
                  className="rounded-lg border px-4 py-3 text-sm flex items-baseline justify-between gap-3"
                  style={{
                    borderColor:
                      d.to === "possible" ? "rgba(249,211,76,0.4)" : "rgba(248,113,113,0.4)",
                    backgroundColor:
                      d.to === "possible" ? "rgba(249,211,76,0.07)" : "rgba(248,113,113,0.07)",
                  }}
                >
                  <span className="min-w-0">
                    <span className="font-medium">{d.program.shortName}</span>
                    <span className="text-muted">
                      {" "}
                      {d.to === "possible"
                        ? "— counted as lost here, but this program tests income after deductions, so you may still qualify; check with the agency"
                        : "— your new income would be over this program's limit"}
                    </span>
                  </span>
                  <span
                    className="tabular-nums shrink-0"
                    style={{ color: "color-mix(in srgb, #f87171 78%, var(--foreground))" }}
                  >
                    −{d.midpoint > 0 ? `${money(d.midpoint)}/yr` : "value varies"}
                  </span>
                </div>
              ))}
              {gained.map((d) => (
                <div
                  key={d.program.id}
                  className="rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-sm flex items-baseline justify-between gap-3"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{d.program.shortName}</span>
                    <span className="text-muted">
                      {" "}
                      — your new income would newly qualify for this one
                    </span>
                  </span>
                  <span className="tabular-nums shrink-0 text-accent">
                    +{d.midpoint > 0 ? `${money(d.midpoint)}/yr` : "value varies"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted">
          How this is counted: only programs marked <strong>likely</strong> — where the published
          rules decide — are in these totals, valued at the midpoint of each record&apos;s
          verified range.
          {uncountedPossible > 0 && (
            <>
              {" "}
              {uncountedPossible} &ldquo;possibly eligible&rdquo; program
              {uncountedPossible === 1 ? "" : "s"} (waitlists, agency formulas, after-deduction
              income tests) {uncountedPossible === 1 ? "is" : "are"} left out of both columns
              rather than guessed at.
            </>
          )}
        </p>

        {safeRaise !== undefined && (
          <div className="rounded-xl border border-accent/30 bg-accent/10 p-5">
            <p className="label-mono text-[10px] text-accent">
              roughly how much more you could earn safely
            </p>
            {safeRaise >= MAX_INCREASE ? (
              <>
                <p className="text-xl font-bold mt-1">
                  no cliff within +{money(MAX_INCREASE)}/mo
                </p>
                <p className="text-xs text-muted mt-1">
                  Across every raise this tool checks, the extra pay outweighs the estimated
                  benefit changes for your household.
                </p>
              </>
            ) : (
              <>
                <p className="text-xl font-bold mt-1">up to about {money(safeRaise)}/mo more</p>
                <p className="text-xs text-muted mt-1">
                  Before the estimated loss in benefits outweighs the extra pay, based on the
                  programs in your results.
                </p>
              </>
            )}
          </div>
        )}

        <Link href="/results" className="text-sm text-accent hover:underline block">
          ← Back to my results
        </Link>
      </div>
    </main>
  );
}
