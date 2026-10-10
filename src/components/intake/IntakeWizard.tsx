"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHousehold } from "@/lib/household-store";
import { EMPTY_PROGRAMS, getState, STATES } from "@/data/states";
import { evaluateAll, stillPossibleCount } from "@/lib/engine";
import {
  ASSET_BUCKETS,
  FLAG_QUESTIONS,
  GENERAL_INTAKE_FLAGS,
  INCOME_BUCKETS,
} from "@/data/questions";
import { formatT, useLocale, useT } from "@/lib/i18n";
import type { TranslationKey } from "@/data/i18n/en";
import { activePopulations, POPULATION_TRIGGER_FLAGS } from "@/data/populations";
import { EligibilityMeter } from "@/components/intake/EligibilityMeter";
import { IntakeSidebar } from "@/components/intake/IntakeSidebar";
import { QuestionStep } from "@/components/intake/QuestionStep";
import { FlagStep } from "@/components/intake/FlagStep";
import { BackLink } from "@/components/intake/BackLink";
import { Button } from "@/components/ui/Button";
import type { CategoricalFlag } from "@/lib/types";

export function IntakeWizard() {
  const router = useRouter();
  const { household, setState, setHouseholdSize, setIncomeRange, setAssetsRange, setFlag } =
    useHousehold();
  const [step, setStep] = useState(0);
  const t = useT();
  const locale = useLocale();

  const stateEntry = getState(household.state);
  const programs = stateEntry?.programs ?? EMPTY_PROGRAMS;
  const results = useMemo(() => evaluateAll(programs, household), [programs, household]);
  const possible = stillPossibleCount(results);

  // The savings step only appears when a program that tests resource limits
  // (e.g. SSI, CAPI) is still in play — most people never see it.
  const needsAssets = useMemo(
    () =>
      results.some(
        (r) => r.confidence !== "unlikely" && r.program.rules.assetLimitDollar !== undefined
      ),
    [results]
  );

  const steps = useMemo(
    () => ["state", "size", "income", "flags", ...(needsAssets ? ["assets"] : []), "review"],
    [needsAssets]
  );

  // Which flag questions to ask: program-required flags for programs not yet
  // ruled out, plus population triggers (so users can self-identify), plus the
  // extra questions for any population they're already in. Restricted to the
  // GENERAL intake's flags — category-scoped questions (Medicare, energy bills,
  // work history, …) live on their /intake/[scope] deep-dive page instead, so
  // this step stays short.
  const relevantFlags = useMemo(() => {
    const flagSet = new Set<CategoricalFlag>();
    for (const r of results) {
      if (r.confidence === "unlikely") continue;
      for (const req of r.program.rules.categoricalRequirements) {
        flagSet.add(req.type);
      }
    }
    for (const f of POPULATION_TRIGGER_FLAGS) flagSet.add(f);
    for (const p of activePopulations(household.flags)) {
      for (const f of p.extraQuestions) flagSet.add(f);
    }
    return FLAG_QUESTIONS.filter((q) => flagSet.has(q.flag) && GENERAL_INTAKE_FLAGS.has(q.flag));
  }, [results, household.flags]);

  // Clamp in case the step list shrank (e.g. the savings step dropped out after
  // an answer) so the index always points at a real step.
  const safeStep = Math.min(step, steps.length - 1);
  const currentStep = steps[safeStep];

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const categories = useMemo(
    () => [...new Set(programs.map((p) => p.category.replace("-", " & ")))],
    [programs]
  );

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto w-full px-6 py-14 grid lg:grid-cols-[1fr_280px] gap-10">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="label-mono text-[10px] text-muted">
              {formatT(t("intake.step"), { n: safeStep + 1, total: steps.length })} ·{" "}
              {t(`intake.stepLabel.${currentStep}` as TranslationKey)}
            </span>
          </div>

          {locale === "es" && (
            <p className="text-xs text-muted italic">{t("intake.esNote")}</p>
          )}

          {/* The meter counts this state's programs, so there is nothing to
              count until one is picked — "0 of 0" would just read as broken. */}
          {programs.length > 0 && (
            <EligibilityMeter possible={possible} total={programs.length} />
          )}

          {/* keyed on the step id: each step rises in as its own scene */}
          <div key={currentStep} className="rise-in">
          {currentStep === "state" && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">{t("intake.stateTitle")}</h2>
              <p className="text-sm text-muted">
                {t("intake.stateSub")}{" "}
                <span className="text-accent">{t("intake.fullCoverage")}</span>{" "}
                {t("intake.stateSubEnd")}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {STATES.map((s) => (
                  <button
                    key={s.code}
                    onClick={() => {
                      setState(s.code);
                      next();
                    }}
                    className="press-weight choice-idle rounded-xl border border-card-border bg-card px-3 py-2 text-left text-sm"
                  >
                    {s.name}
                    {s.tier === "deep" && (
                      <span className="block text-[10px] text-accent label-mono">
                        {t("intake.fullCoverage")}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </section>
          )}

          {currentStep === "size" && (
            <QuestionStep
              title={t("intake.sizeTitle")}
              gridClassName="grid grid-cols-4 gap-3"
              onBack={back}
              options={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
                key: String(n),
                label: n === 8 ? "8+" : n,
                active: household.householdSize === n,
                onSelect: () => {
                  setHouseholdSize(n);
                  next();
                },
              }))}
            />
          )}

          {currentStep === "income" && (
            <QuestionStep
              title={t("intake.incomeTitle")}
              subtitle={t("intake.incomeSub")}
              gridClassName="grid gap-2"
              onBack={back}
              options={INCOME_BUCKETS.map((b) => ({
                key: b.label,
                label: b.label,
                active: household.monthlyIncomeMin === b.min,
                className: "text-left",
                onSelect: () => {
                  setIncomeRange(b.min, b.max);
                  next();
                },
              }))}
            />
          )}

          {currentStep === "flags" && (
            <FlagStep
              questions={relevantFlags}
              flags={household.flags}
              onAnswer={setFlag}
              onBack={back}
              onNext={next}
            />
          )}

          {currentStep === "assets" && (
            <QuestionStep
              title={t("intake.assetsTitle")}
              subtitle={t("intake.assetsSub")}
              gridClassName="grid gap-2"
              onBack={back}
              options={ASSET_BUCKETS.map((b) => ({
                key: b.label,
                label: b.label,
                active: household.liquidAssetsMin === b.min,
                className: "text-left",
                onSelect: () => {
                  setAssetsRange(b.min, b.max);
                  next();
                },
              }))}
            />
          )}

          {currentStep === "review" && (
            <section className="space-y-4 text-center">
              <h2 className="text-2xl font-semibold">{t("intake.reviewTitle")}</h2>
              <p className="text-muted">
                {formatT(t("intake.reviewSub"), { possible, total: programs.length })}
              </p>
              <Button onClick={() => router.push("/results")} className="press-weight px-8 py-3">
                {t("intake.seeResults")}
              </Button>
              <div>
                <BackLink onClick={back} />
              </div>
            </section>
          )}
          </div>
        </div>

        <IntakeSidebar
          step={currentStep}
          stateName={stateEntry?.name}
          categories={categories}
          programCount={programs.length}
          results={results}
        />
      </div>
    </main>
  );
}
