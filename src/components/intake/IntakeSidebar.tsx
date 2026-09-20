import { STEP_NOTES } from "@/data/questions";
import { StillPossibleMore } from "@/components/intake/StillPossibleMore";
import type { EligibilityResult } from "@/lib/types";

interface IntakeSidebarProps {
  step: string;
  stateName?: string;
  categories: string[];
  programCount: number;
  results: EligibilityResult[];
}

export function IntakeSidebar({ step, stateName, categories, programCount, results }: IntakeSidebarProps) {
  const stillPossible = results.filter((r) => r.confidence !== "unlikely");

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 h-fit">
      <div className="rounded-xl border border-card-border bg-card p-5">
        <h3 className="font-semibold text-sm">Why we ask this</h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">{STEP_NOTES[step]}</p>
      </div>

      {stateName && (
        <div className="rounded-xl border border-card-border bg-card p-5">
          <h3 className="font-semibold text-sm">
            What&apos;s included for {stateName}
          </h3>
          <p className="text-sm text-muted mt-1">{programCount} programs across:</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categories.map((c) => (
              <span
                key={c}
                className="text-xs rounded-full border border-card-border px-2.5 py-1 capitalize"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {stillPossible.length > 0 && (
        <div className="rounded-xl border border-card-border bg-card p-5">
          <h3 className="font-semibold text-sm">Still possible so far</h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {stillPossible.slice(0, 8).map((r) => (
              <span
                key={r.program.id}
                className="text-xs rounded-full border border-accent/30 bg-accent/10 text-accent px-2.5 py-1"
              >
                {r.program.shortName}
              </span>
            ))}
            {stillPossible.length > 8 && (
              <StillPossibleMore
                hiddenCount={stillPossible.length - 8}
                items={stillPossible.map((r) => ({
                  id: r.program.id,
                  name: r.program.shortName,
                  confidence: r.confidence,
                }))}
              />
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-card-border bg-card p-5">
        <h3 className="font-semibold text-sm">Good to know</h3>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          OpenDoor is informational only, not a government site. Every result links to the real
          agency — they make the final decision, not us.
        </p>
      </div>
    </aside>
  );
}
