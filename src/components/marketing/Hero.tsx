"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { BrowserFrame } from "@/components/ui/BrowserFrame";
import { ButtonLink } from "@/components/ui/Button";
import { FEDERAL_PROGRAMS } from "@/data/federal/programs";
import { deepStates, getState, totalProgramCount } from "@/data/states";
import { useHousehold } from "@/lib/household-store";
import { useT } from "@/lib/i18n";
import type { TranslationKey } from "@/data/i18n/en";

const TRUST_PILL_KEYS: TranslationKey[] = [
  "hero.pill0",
  "hero.pill1",
  "hero.pill2",
  "hero.pill3",
];

export function Hero() {
  const t = useT();
  const { household } = useHousehold();

  // Illustrative preview shown in the hero mockup (not live data) — drawn
  // from the visitor's own state's program pack so no single state is
  // hardcoded into the marketing copy. Before they pick a state, the federal
  // baseline stands in: those programs apply everywhere, so it stays honest.
  const statePrograms = getState(household.state)?.programs ?? FEDERAL_PROGRAMS;
  const mockupRows = statePrograms.slice(0, 3).map((p, i) => ({
    name: p.shortName,
    conf: i < 2 ? t("hero.mockLikely") : t("hero.mockPossible"),
    color: i < 2 ? "#2dd4bf" : "#f9d34c",
  }));

  return (
    <section className="relative overflow-hidden border-b border-card-border">
      <div className="grid-bg" />
      <div className="corner-glow teal w-[420px] h-[420px] -top-32 -left-32" />
      <div className="corner-glow cyan w-[380px] h-[380px] top-40 -right-24" />

      <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          {/* Derived from the state registry — no hardcoded state claims. */}
          <Badge className="text-[13px] text-accent border border-accent/30 px-3 py-1">
            {totalProgramCount()} programs across every state, {deepStates().length} covered in full
          </Badge>
          <h1 className="mt-6 text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
            {t("hero.headline1")}
            <br />
            {t("hero.headline2")} {t("hero.headlineAccent")}
          </h1>
          <p className="mt-6 text-lg text-muted max-w-md">{t("hero.sub")}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/intake" className="px-7 py-3">
              {t("hero.cta")}
            </ButtonLink>
            <Link
              href="#how-it-works"
              className="text-sm text-foreground/80 hover:text-accent transition-colors"
            >
              {t("hero.how")}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {TRUST_PILL_KEYS.map((k) => (
              <Badge
                key={k}
                className="text-[13px] text-muted border border-card-border px-3 py-1.5"
              >
                {t(k)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Product mockup card */}
        <div className="relative">
          <BrowserFrame
            label={t("hero.mockLabel")}
            className="hover-lift shadow-2xl shadow-black/40 rotate-1 hover:rotate-0"
          >
            <div className="p-5 space-y-3">
              {mockupRows.map((r) => (
                <div
                  key={r.name}
                  className="rounded-lg border border-card-border bg-background/60 p-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{r.name}</span>
                  <Badge color={r.color} bgAlpha="22" className="text-[11px] px-2 py-1">
                    {r.conf}
                  </Badge>
                </div>
              ))}
              <div className="rounded-lg bg-accent/10 border border-accent/30 p-3">
                <p className="text-[11px] text-accent">{t("hero.mockValue")}</p>
                <p className="text-xl font-bold mt-1">$4,200 – $9,600 / yr</p>
              </div>
            </div>
          </BrowserFrame>
        </div>
      </div>
    </section>
  );
}
