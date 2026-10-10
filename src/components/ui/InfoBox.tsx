"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import { Chevron, Disclosure } from "@/components/ui/Disclosure";

// The app-wide answer to "big always-expanded info boxes": one line collapsed
// (eyebrow + title), the full story on click. Tinted by the scope/brand color.
// Deliberately independent of DisclosureGroup — "Expand all" means result
// cards, not explainers.

export function InfoBox({
  label,
  title,
  tint,
  defaultOpen = false,
  children,
}: {
  /** Small eyebrow above the title, e.g. "Your local office". */
  label: string;
  /** The one line that stays visible collapsed — make it carry the hook. */
  title: string;
  /** Key color; defaults to the brand accent. */
  tint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const color = tint ?? "var(--accent)";

  return (
    <div
      className="rounded-xl"
      style={
        {
          border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${color} 7%, transparent)`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={bodyId}
        className="ib-head w-full flex items-center gap-3 text-left"
      >
        <span className="min-w-0 flex-1">
          <span
            className="block text-xs"
            style={{ color: `color-mix(in srgb, ${color} 62%, var(--foreground))` }}
          >
            {label}
          </span>
          <span className="block text-sm font-medium truncate">{title}</span>
        </span>
        <Chevron open={open} color={`color-mix(in srgb, ${color} 62%, var(--foreground))`} />
      </button>
      <Disclosure open={open} id={bodyId}>
        <div className="ib-body space-y-2">{children}</div>
      </Disclosure>
    </div>
  );
}
