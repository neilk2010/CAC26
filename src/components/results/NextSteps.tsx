"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import type { RankedOffer } from "@/lib/offers";

// Adaptive branching, rendered: the top-ranked deeper forms for THIS
// household. Each card wears its destination room's key color and sigil —
// the offer looks like the door it opens. Data + ranking live in
// src/data/offers.ts + src/lib/offers.ts; nothing here is scope-specific.

export function NextSteps({
  offers,
  heading = "Made for your situation",
  limit = 3,
}: {
  offers: RankedOffer[];
  heading?: string;
  limit?: number;
}) {
  const top = offers.slice(0, limit);
  if (top.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{heading}</h2>
      <div className="grid gap-3">
        {top.map(({ rule, scope, unanswered }, i) => (
          <Link
            key={rule.id}
            href={`/intake/${scope.id}`}
            className="press-weight rise-in block rounded-xl border p-4"
            style={
              {
                "--stagger": i,
                borderColor: `color-mix(in srgb, ${scope.color} 35%, var(--card-border))`,
                background: `linear-gradient(135deg, color-mix(in srgb, ${scope.color} 10%, transparent), transparent 60%)`,
              } as CSSProperties
            }
          >
            <div className="flex items-start gap-3">
              <span
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${scope.color} 16%, transparent)` }}
              >
                <Icon size={18} stroke={scope.color}>
                  {ICON_PATHS[scope.iconKey]}
                </Icon>
              </span>
              <div className="min-w-0">
                <p className="text-sm">{rule.reason}</p>
                <p
                  className="text-sm font-medium mt-1.5"
                  style={{
                    color: `color-mix(in srgb, ${scope.color} 62%, var(--foreground))`,
                  }}
                >
                  Open the {scope.label.toLowerCase()} questions
                  {unanswered > 0 && (
                    <span className="text-muted font-normal">
                      {" "}
                      ({unanswered} short question{unanswered === 1 ? "" : "s"})
                    </span>
                  )}{" "}
                  <span className="offer-arrow">→</span>
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
