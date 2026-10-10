"use client";

import { useId } from "react";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chevron, Disclosure, useDisclosureState } from "@/components/ui/Disclosure";
import { Advisory } from "@/components/results/Advisory";
import { ExplainButton } from "@/components/results/ExplainButton";
import { IncomeThreshold } from "@/components/results/IncomeThreshold";
import { UniqueBadge } from "@/components/results/UniqueBadge";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/components/results/confidence";
import { useHousehold } from "@/lib/household-store";
import { money } from "@/lib/format";
import { isExclusiveTo } from "@/lib/uniqueness";
import type { EligibilityResult } from "@/lib/types";

// One program result. Collapsed = ONE line: name + est. $/yr + confidence
// badge. Expanded = the full story: summary, reason trace, counterfactual,
// advisory, the opt-in AI explainer, and a single merged action row
// ("Verify & apply" + the source stamp). Obeys the page's Expand all /
// Collapse all broadcasts via useDisclosureState.

/** Compact worth for the collapsed line — same record-only arithmetic as Advisory. */
function compactWorth(result: EligibilityResult, kids: number | undefined): string | null {
  const { program } = result;
  const min = program.estimatedAnnualValueMin;
  const max = program.estimatedAnnualValueMax;
  if (min === undefined || max === undefined) return null;
  if (program.rules.requireKidsUnder17 && kids !== undefined && kids > 0) {
    return `~${money(Math.min(kids * min, max))}/yr`;
  }
  if (min === max) return `~${money(min)}/yr`;
  return `${money(min)}–${money(max)}/yr`;
}

export function ResultCard({ result }: { result: EligibilityResult }) {
  const { program, confidence, reasons, counterfactual } = result;
  const { household } = useHousehold();
  const [open, setOpen] = useDisclosureState(false);
  const bodyId = useId();
  const color = CONFIDENCE_COLOR[confidence];
  const worth = confidence === "unlikely" ? null : compactWorth(result, household.kidsUnder17Count);

  return (
    <Card
      className="result-card overflow-hidden border-l-[3px]"
      style={{ borderLeftColor: color }}
    >
      {/* ARIA accordion pattern: the heading survives (screen readers still get
          a program outline), the button inside it is the whole clickable row. */}
      <h3>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="rc-head group w-full flex items-center gap-3 text-left"
        >
          <Chevron open={open} />
          <span className="min-w-0 flex-1 font-semibold text-sm truncate group-hover:text-accent transition-colors">
            {program.name}
          </span>
          {worth && (
            <span className="hidden sm:inline text-xs text-muted shrink-0">
              {worth}
            </span>
          )}
          {/* Derived from the program library, not the household — see
              lib/uniqueness.ts. Renders nothing for the common case. */}
          <UniqueBadge program={program} />
          {/* keyed on confidence so the badge pops whenever a match changes tier */}
          <Badge
            key={confidence}
            color={color}
            className="badge-pop shrink-0 px-3 py-1 text-[11px]"
          >
            {CONFIDENCE_LABEL[confidence]}
          </Badge>
        </button>
      </h3>

      <Disclosure open={open} id={bodyId}>
        <div className="rc-body space-y-3">
          <p className="text-xs text-muted -mt-1">{program.agencyName}</p>
          <p className="text-sm">{program.summary}</p>
          {/* Optional editorial note, shown only when the program really is
              state-exclusive — the count-based badge works without it. */}
          {program.whyUnique && isExclusiveTo(program, program.state) && (
            <p className="text-sm italic text-foreground/70">{program.whyUnique}</p>
          )}
          {/* The income line comes first: it's the question people open a card
              to answer, and it's the one part they can check themselves. */}
          <IncomeThreshold result={result} />
          <ul className="text-sm text-muted list-disc list-inside space-y-1">
            {reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          {counterfactual && <p className="text-sm italic text-foreground/70">{counterfactual}</p>}
          <Advisory result={result} />
          <ExplainButton program={program} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
            <ButtonLink href={program.applyUrl} external className="inline-block text-sm px-4 py-2">
              Verify and apply with {program.agencyName}
            </ButtonLink>
            <a
              href={program.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted underline hover:text-foreground"
            >
              Source, checked {program.lastVerified}
            </a>
          </div>
        </div>
      </Disclosure>
    </Card>
  );
}
