"use client";

import { useState } from "react";
import { useHousehold } from "@/lib/household-store";
import type { Program } from "@/lib/types";

// The optional AI layer over the static advisory. Opt-in per program, with
// the privacy disclosure rendered BEFORE anything is sent; the server route
// (/api/explain) looks the record up itself and runs a locked prompt that
// can only rephrase record fields — never add to them. No API key configured
// → the server says {disabled} once and the whole affordance disappears.
// Any failure → a quiet honest line; the static advisory is always the floor.

export function ExplainButton({ program }: { program: Program }) {
  const { household } = useHousehold();
  const [state, setState] = useState<"idle" | "loading" | "hidden" | "failed" | "done">("idle");
  const [summary, setSummary] = useState<string | null>(null);

  if (state === "hidden") return null;

  if (state === "done" && summary) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-4 space-y-1">
        <p className="text-xs text-muted">
          AI summary — verify with the official source
        </p>
        <p className="text-sm">{summary}</p>
      </div>
    );
  }

  async function explain() {
    setState("loading");
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId: program.id,
          household: {
            size: household.householdSize,
            incomeBand:
              household.monthlyIncomeMin !== undefined
                ? `${household.monthlyIncomeMin}-${household.monthlyIncomeMax} per month`
                : undefined,
            kids: household.kidsUnder17Count,
            state: household.state,
            situations: Object.entries(household.flags)
              .filter(([, v]) => v === true)
              .map(([k]) => k),
          },
        }),
      });
      const data = (await res.json()) as { summary?: string; disabled?: boolean; error?: string };
      if (data.disabled) {
        setState("hidden");
      } else if (data.summary) {
        setSummary(data.summary);
        setState("done");
      } else {
        setState("failed");
      }
    } catch {
      setState("failed");
    }
  }

  if (state === "failed") {
    return (
      <p className="text-xs text-muted">
        AI summary isn&apos;t available right now — the details above are the full picture.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={explain}
        disabled={state === "loading"}
        className="press-weight rounded-full border border-card-border px-3.5 py-1.5 text-xs text-muted hover:text-foreground disabled:opacity-60"
      >
        {state === "loading" ? "Writing…" : "Explain in plain words"}
      </button>
      <p className="text-[11px] text-muted/80">
        Uses AI: sends this program&apos;s public record and a summary of your answers (household
        size, income range, situations — never your address or anything identifying) to
        Anthropic to write the summary.
      </p>
    </div>
  );
}
