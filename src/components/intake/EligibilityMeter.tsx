import { Meter } from "@/components/ui/Meter";

interface EligibilityMeterProps {
  possible: number;
  total: number;
}

export function EligibilityMeter({ possible, total }: EligibilityMeterProps) {
  const pct = total === 0 ? 0 : Math.round((possible / total) * 100);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-accent">Eligibility so far</span>
        <span className="text-sm text-muted">
          {/* keyed so the number pops whenever an answer changes it */}
          <span key={possible} className="badge-pop inline-block font-semibold text-foreground">
            {possible}
          </span>{" "}
          of {total} still possible
        </span>
      </div>
      <Meter pct={pct} />
    </div>
  );
}
