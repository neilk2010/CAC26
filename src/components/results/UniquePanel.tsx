"use client";

import { InfoBox } from "@/components/ui/InfoBox";
import { getState } from "@/data/states";
import { coveredStateCount, exclusiveResults } from "@/lib/uniqueness";
import { formatT, useT } from "@/lib/i18n";
import { money } from "@/lib/format";
import type { EligibilityResult } from "@/lib/types";

// "Unique to {State}" — the programs no other state we cover in depth runs.
//
// Entirely derived (lib/uniqueness.ts): the list, the count, and the wording
// all recompute when a state pack is added, and the panel disappears on its
// own for federal-tier states, where nothing is state-exclusive.
//
// The copy is deliberately scoped to "states OpenDoor covers in depth" rather
// than claiming a program exists nowhere else in the country — a claim we
// can't verify and don't need to make.

const UNIQUE_COLOR = "#8b5cf6";

export function UniquePanel({
  results,
  state,
}: {
  results: EligibilityResult[];
  state: string;
}) {
  const t = useT();
  const exclusives = exclusiveResults(results, state);
  if (exclusives.length === 0) return null;

  const stateName = getState(state)?.name ?? state;
  const covered = coveredStateCount();

  return (
    <InfoBox
      tint={UNIQUE_COLOR}
      label={formatT(t("unique.panelLabel"), { state: stateName })}
      title={formatT(t("unique.panelTitle"), { state: stateName })}
    >
      <p className="text-sm">{t("unique.panelIntro")}</p>
      <ul className="space-y-2 pt-1">
        {exclusives.map(({ program }) => {
          const min = program.estimatedAnnualValueMin;
          const max = program.estimatedAnnualValueMax;
          const worth =
            min !== undefined && max !== undefined
              ? min === max
                ? `~${money(min)}/yr`
                : `${money(min)}–${money(max)}/yr`
              : null;
          return (
            <li key={program.id} className="text-sm">
              <span className="font-medium">{program.name}</span>
              {worth && <span className="label-mono text-[10px] text-muted"> · {worth}</span>}
              {/* whyUnique is optional — the entry reads fine without it. */}
              {program.whyUnique && (
                <span className="block text-muted">{program.whyUnique}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted pt-1">
        {formatT(t("unique.panelFootnote"), { covered })}
      </p>
    </InfoBox>
  );
}
