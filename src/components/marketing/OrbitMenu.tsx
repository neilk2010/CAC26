"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { CATEGORIES } from "@/data/categories";
import { POPULATIONS } from "@/data/populations";
import { Icon } from "@/components/ui/Icon";
import { ICON_PATHS } from "@/components/ui/icons";
import { useT } from "@/lib/i18n";

/** The orbit section's heading — client so it follows the language toggle. */
export function OrbitSectionIntro() {
  const t = useT();
  return (
    <>
      <h2 className="text-3xl font-bold text-center px-6">{t("home.momentsTitle")}</h2>
      <p className="text-center text-muted mt-2 max-w-xl mx-auto px-6">
        {t("home.momentsSub")}
        <span className="hidden md:inline"> {t("home.momentsHint")}</span>
      </p>
    </>
  );
}

// The homepage showpiece: OpenDoor at the center, five personas on the inner
// ring, eight categories on the outer — slowly orbiting. Hover (or keyboard
// focus) pauses the sky and enlarges the node under the pointer; click flies
// into that room. Engineering constraints, in order: GPU-cheap (every
// animation is transform-only — ring spins, counter-spins, and a static angle
// that cancel exactly, so labels stay upright), fully reduced-motion-safe
// (static rings, instant navigation), and REAL <Link> nodes so the showpiece
// degrades to plain navigation with zero JS. The tab nav and category grid
// remain the reliable ways in — this is the door worth filming.

interface OrbitNode {
  id: string;
  label: string;
  color: string;
  iconKey: string;
  href: string;
}

const INNER: OrbitNode[] = POPULATIONS.map((p) => ({
  id: p.id,
  label: p.label,
  color: p.color,
  iconKey: p.iconKey,
  href: `/intake/${p.id}`,
}));

const OUTER: OrbitNode[] = CATEGORIES.map((c) => ({
  id: c.id,
  label: c.label,
  color: c.color,
  iconKey: c.iconKey,
  href: `/intake/${c.id}`,
}));

const FLY_MS = 420;

function Ring({
  nodes,
  radius,
  size,
  ringClass,
  startDeg,
  flyingTo,
  onFly,
}: {
  nodes: OrbitNode[];
  radius: number;
  size: number;
  ringClass: string;
  startDeg: number;
  flyingTo: string | null;
  onFly: (node: OrbitNode) => void;
}) {
  const step = 360 / nodes.length;
  return (
    <div className={`orbit-ring ${ringClass} absolute left-1/2 top-1/2`} aria-hidden={false}>
      {nodes.map((n, i) => {
        const angle = startDeg + i * step;
        return (
          <div
            key={n.id}
            className="orbit-arm absolute"
            style={
              {
                "--angle": `${angle}deg`,
                "--radius": `${radius}px`,
              } as CSSProperties
            }
          >
            <div className="orbit-counter">
              <div className="orbit-upright" style={{ "--angle": `${angle}deg` } as CSSProperties}>
                <Link
                  href={n.href}
                  onClick={(e) => {
                    // Plain left-clicks fly; modified clicks (new tab etc.)
                    // keep native link behavior.
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    onFly(n);
                  }}
                  className={`orbit-node group flex flex-col items-center ${
                    flyingTo === n.id ? "orbit-fly-target" : ""
                  } ${flyingTo && flyingTo !== n.id ? "orbit-fly-rest" : ""}`}
                  style={{ "--node-color": n.color } as CSSProperties}
                  aria-label={`${n.label} — open this door`}
                >
                  <span
                    className="orbit-chip flex items-center justify-center rounded-full"
                    style={{ width: size, height: size }}
                  >
                    <Icon size={Math.round(size * 0.42)} stroke={n.color}>
                      {ICON_PATHS[n.iconKey]}
                    </Icon>
                  </span>
                  <span className="orbit-label label-mono text-[10px] whitespace-nowrap">
                    {n.label}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function OrbitMenu() {
  const router = useRouter();
  const [flyingTo, setFlyingTo] = useState<string | null>(null);

  function fly(node: OrbitNode) {
    if (flyingTo) return; // one departure at a time
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      router.push(node.href);
      return;
    }
    setFlyingTo(node.id);
    window.setTimeout(() => router.push(node.href), FLY_MS);
  }

  return (
    <nav
      aria-label="Explore by situation or by kind of help"
      className={`orbit relative mx-auto ${flyingTo ? "orbit-flying" : ""}`}
    >
      {/* Faint orbital paths — static, purely decorative. */}
      {/* Each --path-r MUST equal its Ring's radius below, or the chips stop
          tracking the line they're drawn on. */}
      <div aria-hidden className="orbit-path" style={{ "--path-r": "136px" } as CSSProperties} />
      <div aria-hidden className="orbit-path" style={{ "--path-r": "288px" } as CSSProperties} />

      {/* The core: OpenDoor itself — a real door to the general intake. */}
      <Link
        href="/intake"
        className="orbit-core absolute left-1/2 top-1/2 flex flex-col items-center justify-center rounded-full text-center"
        aria-label="Start the three-minute eligibility check"
      >
        <span className="w-9 h-9 rounded-xl border border-accent/60 bg-background flex items-center justify-center mb-1.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="5" y="3" width="11" height="18" rx="1.5" stroke="var(--accent)" strokeWidth="1.6" />
            <circle cx="13.2" cy="12" r="1" fill="var(--accent)" />
            <path d="M16 5.5L20 7v13l-4-1.2" stroke="var(--accent-2)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="font-semibold tracking-tight text-sm">OpenDoor</span>
        <span className="label-mono text-[8px] text-muted mt-0.5">start here</span>
      </Link>

      <Ring
        nodes={INNER}
        radius={136}
        size={62}
        ringClass="orbit-ring-inner"
        startDeg={-90}
        flyingTo={flyingTo}
        onFly={fly}
      />
      <Ring
        nodes={OUTER}
        radius={288}
        size={54}
        ringClass="orbit-ring-outer"
        startDeg={-67.5}
        flyingTo={flyingTo}
        onFly={fly}
      />
    </nav>
  );
}
