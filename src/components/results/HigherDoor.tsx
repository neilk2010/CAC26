"use client";

import { Choice } from "@/components/ui/Choice";
import { FLAG_QUESTION_MAP } from "@/data/questions";
import { raisedCeilingOpportunity } from "@/lib/engine";
import { money } from "@/lib/format";
import { useHousehold } from "@/lib/household-store";
import type { EligibilityResult } from "@/lib/types";

// The second door on a program: a higher income limit that opens on a
// household flag the visitor skipped. Without this they are measured against
// the low limit and told "unlikely" — against a line that may not be theirs.
//
// The question is asked here rather than linked to, because the general
// wizard's step is local state with no deep link: a link would restart a
// five-step form to reach one skipped question, which nobody will do. Answering
// writes the same flag the wizard writes, so the engine re-runs and the card
// re-reads itself immediately.

export function HigherDoor({ result }: { result: EligibilityResult }) {
  const { household, setFlag } = useHousehold();
  const opening = raisedCeilingOpportunity(result.program, household);
  if (opening === undefined) return null;

  const entry = FLAG_QUESTION_MAP[opening.flag];
  if (entry === undefined) return null;

  return (
    <div className="rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2.5 space-y-2">
      <p className="text-xs text-foreground/80">
        A higher limit — {money(Math.round(opening.ceiling))}/mo — applies when {entry.label}.
      </p>
      {/* The wizard's own wording, so the question reads the same in both
          places and lives in one file. */}
      <p className="text-xs text-muted">{entry.question}</p>
      <div className="flex gap-2">
        <Choice
          className="rounded-md px-3 py-1 text-xs"
          onClick={() => setFlag(opening.flag, true)}
        >
          Yes
        </Choice>
        <Choice
          className="rounded-md px-3 py-1 text-xs"
          onClick={() => setFlag(opening.flag, false)}
        >
          No
        </Choice>
      </div>
    </div>
  );
}
