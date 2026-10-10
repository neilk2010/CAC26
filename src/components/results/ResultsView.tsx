"use client";

import Link from "next/link";
import { useMemo, type CSSProperties } from "react";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState } from "@/data/states";
import { cascadeSuggestions, evaluateAll } from "@/lib/engine";
import { rankOffers } from "@/lib/offers";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL, CONFIDENCE_ORDER } from "@/components/results/confidence";
import { DisclosureGroup } from "@/components/ui/Disclosure";
import { CategoryTabs } from "@/components/results/CategoryTabs";
import { ResultsControls } from "@/components/results/ResultsControls";
import { CoverageNote } from "@/components/results/CoverageNote";
import { NextSteps } from "@/components/results/NextSteps";
import { BenefitStacking } from "@/components/results/BenefitStacking";
import { UniquePanel } from "@/components/results/UniquePanel";
import { ResultCard } from "@/components/results/ResultCard";
import { ResultsDashboard } from "@/components/results/ResultsDashboard";
import { CascadePanel } from "@/components/results/CascadePanel";
import { PopulationSpotlight } from "@/components/results/PopulationSpotlight";
import { SnapshotPanel } from "@/components/results/SnapshotPanel";
import { formatT, useLocale, useT } from "@/lib/i18n";

export function ResultsView() {
  const { household, reset } = useHousehold();
  const t = useT();
  const locale = useLocale();
  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const cascades = useMemo(() => cascadeSuggestions(results), [results]);
  const offers = useMemo(() => rankOffers(household, results), [household, results]);

  const grouped = CONFIDENCE_ORDER.map((c) => ({
    confidence: c,
    items: results.filter((r) => r.confidence === c),
  })).filter((g) => g.items.length > 0);

  // No state picked yet means no programs to evaluate, so it belongs with the
  // other "answer the questions first" cases rather than rendering an empty page.
  if (!stateEntry || !household.householdSize || household.monthlyIncomeMin === undefined) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-muted">We need a few answers first.</p>
        <Link href="/intake" className="text-accent hover:underline">
          Go to the questionnaire →
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12 space-y-8">
      <div className="rise-in space-y-2" style={{ "--stagger": 0 } as CSSProperties}>
        <p className="label-mono text-[10px] text-accent">{t("results.eyebrow")}</p>
        <h1 className="text-3xl font-bold">{t("results.title")}</h1>
        <p className="text-sm text-muted">
          {formatT(t("results.intro"), {
            size: household.householdSize,
            state: stateEntry.name,
          })}
        </p>
        {locale === "es" && <p className="text-xs text-muted italic">{t("results.esNote")}</p>}
      </div>

      <div className="rise-in" style={{ "--stagger": 1 } as CSSProperties}>
        <ResultsDashboard results={results} />
      </div>

      <div className="rise-in" style={{ "--stagger": 2 } as CSSProperties}>
        <SnapshotPanel results={results} state={stateEntry.code} />
      </div>

      <div className="rise-in" style={{ "--stagger": 2 } as CSSProperties}>
        <BenefitStacking results={results} flags={household.flags} />
      </div>

      {/* Renders nothing unless this state has a program no other covered
          state offers — so federal-tier states are untouched. */}
      <div className="rise-in" style={{ "--stagger": 2 } as CSSProperties}>
        <UniquePanel results={results} state={stateEntry.code} />
      </div>

      {stateEntry && (
        <div className="rise-in" style={{ "--stagger": 1 } as CSSProperties}>
          <CoverageNote stateEntry={stateEntry} />
        </div>
      )}

      <div className="rise-in" style={{ "--stagger": 2 } as CSSProperties}>
        <NextSteps offers={offers} />
      </div>

      <div className="rise-in" style={{ "--stagger": 3 } as CSSProperties}>
        <CategoryTabs results={results} />
      </div>

      <div className="rise-in" style={{ "--stagger": 3 } as CSSProperties}>
        <PopulationSpotlight flags={household.flags} results={results} />
      </div>

      <CascadePanel cascades={cascades} />

      <DisclosureGroup>
        <div className="rise-in" style={{ "--stagger": 4 } as CSSProperties}>
          <ResultsControls />
        </div>

        {grouped.map((g, gi) => (
          <section
            key={g.confidence}
            className="rise-in space-y-3 mt-8"
            style={{ "--stagger": 4 + gi } as CSSProperties}
          >
            <h2
              className="tier-rule text-lg font-semibold"
              style={
                {
                  color: `color-mix(in srgb, ${CONFIDENCE_COLOR[g.confidence]} 70%, var(--foreground))`,
                  "--tier-color": CONFIDENCE_COLOR[g.confidence],
                } as CSSProperties
              }
            >
              {CONFIDENCE_LABEL[g.confidence]}
            </h2>
            <div className="card-stack">
              {g.items.map((r, i) => (
                <div key={r.program.id} className="rise-in" style={{ "--stagger": i } as CSSProperties}>
                  <ResultCard result={r} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </DisclosureGroup>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-card-border">
        <Link href="/intake" className="text-sm text-accent hover:underline">
          {t("results.editAnswers")}
        </Link>
        <Link href="/cliff-simulator" className="text-sm text-accent hover:underline">
          {t("results.tryCliff")}
        </Link>
        <Link href="/deadlines" className="text-sm text-accent hover:underline">
          {t("results.deadlines")}
        </Link>
        <Link href="/packet" className="text-sm text-accent hover:underline">
          {t("results.packet")}
        </Link>
        <button onClick={reset} className="text-sm text-muted hover:underline ml-auto">
          {t("results.clear")}
        </button>
      </div>
    </main>
  );
}
