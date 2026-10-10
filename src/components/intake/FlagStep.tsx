import { Button } from "@/components/ui/Button";
import { BackLink } from "@/components/intake/BackLink";
import { FLAG_OPTIONAL_INFO } from "@/data/questions";
import { useT } from "@/lib/i18n";
import type { CategoricalFlag, FlagQuestion, Household } from "@/lib/types";

// The adaptive "a few more questions" step: renders one Yes/No/Skip row per
// catalog question that a still-possible program actually requires.
interface FlagStepProps {
  questions: FlagQuestion[];
  flags: Household["flags"];
  onAnswer: (flag: CategoricalFlag, value: boolean | undefined) => void;
  onBack: () => void;
  onNext: () => void;
}

export function FlagStep({ questions, flags, onAnswer, onBack, onNext }: FlagStepProps) {
  const t = useT();
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{t("intake.flagsTitle")}</h2>
      <p className="text-sm text-muted">{t("intake.flagsSub")}</p>
      <div className="space-y-3">
        {questions.length === 0 && (
          <p className="text-sm text-muted">{t("intake.flagsNone")}</p>
        )}
        {questions.map((q) => {
          const optionalInfo = FLAG_OPTIONAL_INFO[q.flag];
          return (
            <div
              key={q.flag}
              className="rounded-xl border border-card-border bg-card px-4 py-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-2">
                  <span className="text-sm">{q.question}</span>
                  {optionalInfo && (
                    <span className="shrink-0 text-xs text-accent border border-accent/30 rounded-full px-2 py-0.5">
                      {t("intake.optional")}
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  {(
                    [
                      { label: t("intake.yes"), val: true },
                      { label: t("intake.no"), val: false },
                      { label: t("intake.skip"), val: undefined },
                    ] as const
                  ).map((opt) => {
                    const active = flags[q.flag] === opt.val;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => onAnswer(q.flag, opt.val)}
                        className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                          active
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-card-border hover:border-accent/60"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {optionalInfo && (
                <p className="text-xs text-muted italic">
                  {t("intake.whyWeAsk")} {optionalInfo.whyWeAsk}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between pt-2">
        <BackLink onClick={onBack} />
        <Button onClick={onNext} className="px-6 py-2">
          {t("intake.continue")}
        </Button>
      </div>
    </section>
  );
}
