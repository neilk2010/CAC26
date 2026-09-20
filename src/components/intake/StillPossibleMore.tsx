"use client";

import { useEffect, useRef, useState } from "react";
import {
  CONFIDENCE_COLOR,
  CONFIDENCE_LABEL,
  CONFIDENCE_ORDER,
} from "@/components/results/confidence";
import type { Confidence } from "@/lib/types";

// The sidebar shows the first 8 programs still in play and used to end with a
// dead "+N more" label. This is that label made real: a read-only peek at the
// full list, grouped by how confident the engine currently is. Deliberately
// inert — mid-intake the answer isn't settled yet, so there's nothing to click
// through to. /results is where programs become actionable.

export interface StillPossibleItem {
  id: string;
  name: string;
  confidence: Confidence;
}

export function StillPossibleMore({
  items,
  hiddenCount,
}: {
  items: StillPossibleItem[];
  hiddenCount: number;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // Focus after paint so the dialog exists to receive it.
    requestAnimationFrame(() => closeRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const groups = CONFIDENCE_ORDER.map((confidence) => ({
    confidence,
    list: items.filter((i) => i.confidence === confidence),
  })).filter((g) => g.list.length > 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={`Show all ${items.length} programs still possible`}
        className="press-weight text-xs text-muted rounded-full border border-dashed border-card-border px-2.5 py-1 hover:border-accent/40 hover:text-accent transition-colors"
      >
        +{hiddenCount} more
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="still-possible-title"
        >
          <button
            aria-label="Close"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px] cursor-default"
          />
          <div className="palette-panel relative w-full max-w-sm rounded-2xl border border-card-border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3 border-b border-card-border">
              <div className="min-w-0 flex-1">
                <h2 id="still-possible-title" className="font-semibold text-sm">
                  Still possible so far
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {`${items.length} programs your answers haven't ruled out yet.`}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="press-weight shrink-0 rounded-lg p-1 text-muted hover:text-foreground"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="max-h-[56vh] overflow-y-auto px-4 py-3 space-y-4">
              {groups.map((g) => (
                <div key={g.confidence}>
                  <p className="label-mono text-[9px] flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: CONFIDENCE_COLOR[g.confidence] }}
                    />
                    <span style={{ color: CONFIDENCE_COLOR[g.confidence] }}>
                      {CONFIDENCE_LABEL[g.confidence]}
                    </span>
                    <span className="text-muted">· {g.list.length}</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {g.list.map((i) => (
                      <span
                        key={i.id}
                        className="text-xs rounded-full border px-2.5 py-1"
                        style={{
                          borderColor: `color-mix(in srgb, ${CONFIDENCE_COLOR[g.confidence]} 30%, transparent)`,
                          backgroundColor: `color-mix(in srgb, ${CONFIDENCE_COLOR[g.confidence]} 10%, transparent)`,
                          color: `color-mix(in srgb, ${CONFIDENCE_COLOR[g.confidence]} 62%, var(--foreground))`,
                        }}
                      >
                        {i.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <p className="px-4 py-2 border-t border-card-border text-[10px] text-muted label-mono">
              this list narrows as you answer
            </p>
          </div>
        </div>
      )}
    </>
  );
}
