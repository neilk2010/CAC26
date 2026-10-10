import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CONFIDENCE_COLOR, CONFIDENCE_LABEL } from "@/components/results/confidence";
import { activePopulations } from "@/data/populations";
import type { EligibilityResult, Household } from "@/lib/types";

// For each population the household falls into, a framing callout that pulls its
// highlighted programs out of the results so they're easy to zero in on.
export function PopulationSpotlight({
  flags,
  results,
}: {
  flags: Household["flags"];
  results: EligibilityResult[];
}) {
  const active = activePopulations(flags);
  if (active.length === 0) return null;

  const byId = new Map(results.map((r) => [r.program.id, r]));

  return (
    <>
      {active.map((p) => {
        const highlighted = p.highlightProgramIds
          .map((id) => byId.get(id))
          .filter((r): r is EligibilityResult => !!r && r.confidence !== "unlikely");
        return (
          <Card key={p.id} className="p-5 space-y-2 border-l-[3px]" style={{ borderLeftColor: p.color }}>
            <p className="text-xs" style={{ color: p.color }}>
              For {p.label.toLowerCase()}
            </p>
            <p className="text-sm font-medium">{p.tagline}</p>
            {highlighted.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {highlighted.map((r) => (
                  <Badge
                    key={r.program.id}
                    color={CONFIDENCE_COLOR[r.confidence]}
                    className="text-xs px-2.5 py-1"
                  >
                    {r.program.shortName}, {CONFIDENCE_LABEL[r.confidence].toLowerCase()}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">
                We don&apos;t have {p.label.toLowerCase()}-specific programs in this state yet — the
                landing page points you to the official resources in the meantime.
              </p>
            )}
            <Link
              href={`/intake/${p.id}`}
              className="inline-block text-sm hover:underline"
              style={{ color: p.color }}
            >
              Go deeper: the {p.label.toLowerCase()} questions
            </Link>
          </Card>
        );
      })}
    </>
  );
}
