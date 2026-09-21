"use client";

import { Badge } from "@/components/ui/Badge";
import { getState } from "@/data/states";
import { coveredStateCount, uniqueness } from "@/lib/uniqueness";
import { formatT, useT } from "@/lib/i18n";
import type { Program } from "@/lib/types";

// The "★ Only in NJ" chip. Everything here is derived from lib/uniqueness.ts,
// so adding a state recomputes it with no edit to this file.
//
// Accessibility: the star is decorative (aria-hidden) and the visible text is
// an abbreviation, so the REAL sentence rides along in a visually-hidden span.
// A screen reader hears "Only New Jersey offers this among the 6 states
// OpenDoor covers in depth" — never a bare glyph. The same sentence is the
// wrapper's title, so a sighted mouse user gets it on hover.

/** Violet, the v4 palette's accent-2 family. Badge mixes it toward the
 *  foreground, so one hex reads correctly in both themes. */
const UNIQUE_COLOR = "#8b5cf6";

export function UniqueBadge({ program }: { program: Program }) {
  const t = useT();
  const { rarity, stateCount } = uniqueness(program);
  if (rarity === "common") return null;

  const covered = coveredStateCount();
  const stateName = getState(program.state)?.name ?? program.state;

  const visible =
    rarity === "exclusive"
      ? formatT(t("unique.badge"), { code: program.state })
      : formatT(t("unique.badgeRare"), { count: stateCount });

  const spoken =
    rarity === "exclusive"
      ? formatT(t("unique.srExclusive"), { state: stateName, covered })
      : formatT(t("unique.srRare"), { count: stateCount, covered });

  return (
    <span title={spoken} className="shrink-0">
      <Badge color={UNIQUE_COLOR} className="label-mono px-2.5 py-1 text-[10px]">
        <span aria-hidden="true">★ {visible}</span>
        <span className="sr-only">{spoken}</span>
      </Badge>
    </span>
  );
}
