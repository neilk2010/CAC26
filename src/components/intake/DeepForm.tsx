"use client";

import type { CSSProperties, ReactNode } from "react";
import { ASSET_BUCKETS, FLAG_QUESTION_MAP, INCOME_BUCKETS } from "@/data/questions";
import { useHousehold } from "@/lib/household-store";
import { Choice } from "@/components/ui/Choice";
import type { CategoricalFlag, Household, QuestionInput, ScreeningQuestion } from "@/lib/types";

// The coverage-driven form generator. Give it ANY scope's questions and it
// renders the form — there is zero scope- or category-specific branching here,
// and no question text or eligibility number lives in this file: prompts come
// from the question records / flag registry, and buckets from the data layer.

function QuestionShell({
  question,
  stagger,
  children,
}: {
  question: ScreeningQuestion;
  stagger: number;
  children: ReactNode;
}) {
  const registryEntry =
    question.input.kind === "flag" ? FLAG_QUESTION_MAP[question.input.flag] : undefined;
  const prompt = question.prompt ?? registryEntry?.question;
  const help = question.help ?? registryEntry?.help;

  return (
    <div
      className="q-shell rise-in rounded-xl border border-card-border bg-card px-4 py-4 space-y-3"
      style={{ "--stagger": stagger } as CSSProperties}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{prompt}</p>
          {question.optional && (
            <span
              className="scope-ink shrink-0 text-xs rounded-full px-2 py-0.5"
              style={{
                border: "1px solid color-mix(in srgb, var(--scope-accent, var(--accent)) 35%, transparent)",
              }}
            >
              optional
            </span>
          )}
        </div>
        {question.optional && (
          <p className="text-xs text-muted italic">Why we ask: {question.optional.whyWeAsk}</p>
        )}
        {help && <p className="text-xs text-muted">{help}</p>}
      </div>
      {children}
    </div>
  );
}

function FlagInput({ flag }: { flag: CategoricalFlag }) {
  const { household, setFlag } = useHousehold();
  return (
    <div className="flex gap-2">
      {([
        ["Yes", true],
        ["No", false],
        ["Skip", undefined],
      ] as const).map(([label, val]) => (
        <Choice
          key={label}
          active={val !== undefined && household.flags[flag] === val}
          className="rounded-md px-3 py-1 text-sm"
          onClick={() => setFlag(flag, val)}
        >
          {label}
        </Choice>
      ))}
    </div>
  );
}

function FlagGroupInput({
  options,
  noneLabel,
}: {
  options: { flag: CategoricalFlag; label: string }[];
  noneLabel?: string;
}) {
  const { household, setFlag } = useHousehold();
  const noneActive = options.every((o) => household.flags[o.flag] === false);
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = household.flags[o.flag] === true;
        return (
          <Choice
            key={o.flag}
            active={active}
            className="rounded-md px-3 py-1 text-sm"
            onClick={() => setFlag(o.flag, active ? undefined : true)}
          >
            {o.label}
          </Choice>
        );
      })}
      {noneLabel && (
        <Choice
          active={noneActive}
          className="rounded-md px-3 py-1 text-sm"
          onClick={() => {
            for (const o of options) setFlag(o.flag, false);
          }}
        >
          {noneLabel}
        </Choice>
      )}
    </div>
  );
}

function SelectInput({
  field,
  options,
}: {
  field: "employmentStatus" | "housingTenure" | "filingStatus";
  options: { value: string; label: string }[];
}) {
  const { household, patch } = useHousehold();
  return (
    <div className="grid gap-2">
      {options.map((o) => (
        <Choice
          key={o.value}
          active={household[field] === o.value}
          className="text-left text-sm"
          onClick={() => patch({ [field]: o.value })}
        >
          {o.label}
        </Choice>
      ))}
    </div>
  );
}

function CountInput({
  field,
  min,
  max,
}: {
  field: "kidsUnder17Count" | "householdSize";
  min: number;
  max: number;
}) {
  const { household, patch } = useHousehold();
  const values: number[] = [];
  for (let n = min; n <= max; n++) values.push(n);
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((n) => (
        <Choice
          key={n}
          active={household[field] === n}
          className="rounded-md px-3.5 py-1.5 text-sm"
          onClick={() => patch({ [field]: n })}
        >
          {n === max ? `${n}+` : n}
        </Choice>
      ))}
    </div>
  );
}

function BucketInput({
  minField,
  maxField,
}: {
  minField: "monthlyIncomeMin" | "liquidAssetsMin";
  maxField: "monthlyIncomeMax" | "liquidAssetsMax";
}) {
  const { household, patch } = useHousehold();
  const buckets = minField === "monthlyIncomeMin" ? INCOME_BUCKETS : ASSET_BUCKETS;
  return (
    <div className="grid gap-2">
      {buckets.map((b) => (
        <Choice
          key={b.label}
          active={household[minField] === b.min}
          className="text-left text-sm"
          onClick={() => patch({ [minField]: b.min, [maxField]: b.max } as Partial<Household>)}
        >
          {b.label}
        </Choice>
      ))}
    </div>
  );
}

function ZipInput() {
  const { household, patch } = useHousehold();
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]{5}"
        maxLength={5}
        placeholder="e.g. 07102"
        defaultValue={household.zip ?? ""}
        aria-label="ZIP code"
        className="w-32 rounded-xl border border-card-border bg-background px-3 py-2 text-sm focus:border-accent/60 focus:outline-none"
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 5);
          e.target.value = v;
          patch({ zip: v.length === 5 ? v : undefined });
        }}
      />
      {household.zip && <span className="text-xs text-accent">saved</span>}
    </div>
  );
}

function QuestionField({ input }: { input: QuestionInput }) {
  switch (input.kind) {
    case "flag":
      return <FlagInput flag={input.flag} />;
    case "flagGroup":
      return <FlagGroupInput options={input.options} noneLabel={input.noneLabel} />;
    case "select":
      return <SelectInput field={input.field} options={input.options} />;
    case "count":
      return <CountInput field={input.field} min={input.min} max={input.max} />;
    case "bucket":
      return <BucketInput minField={input.minField} maxField={input.maxField} />;
    case "zip":
      return <ZipInput />;
  }
}

export function DeepForm({ questions }: { questions: ScreeningQuestion[] }) {
  const required = questions.filter((q) => !q.optional);
  const optional = questions.filter((q) => !!q.optional);

  if (questions.length === 0) return null;

  return (
    <div className="space-y-6">
      {required.length > 0 && (
        <div className="space-y-3">
          {required.map((q, i) => (
            <QuestionShell key={q.id} question={q} stagger={i}>
              <QuestionField input={q.input} />
            </QuestionShell>
          ))}
        </div>
      )}
      {optional.length > 0 && (
        <div className="optional-block space-y-3">
          <p className="text-xs scope-ink">
            optional — answering can only unlock more options
          </p>
          {optional.map((q, i) => (
            <QuestionShell key={q.id} question={q} stagger={required.length + i}>
              <QuestionField input={q.input} />
            </QuestionShell>
          ))}
        </div>
      )}
    </div>
  );
}
