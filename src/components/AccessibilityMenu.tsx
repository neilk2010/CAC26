"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { useT } from "@/lib/i18n";
import {
  getA11ySnapshot,
  getA11yServerSnapshot,
  resetA11yPrefs,
  setDyslexiaFont,
  setHighContrast,
  setReduceMotion,
  setTextSize,
  subscribeA11y,
  type A11yPrefs,
  type TextSize,
} from "@/lib/a11y-store";

// A floating, self-contained accessibility widget: a corner launcher button
// opens a panel with text-size steps and three plain on/off toggles. Every
// preference persists via lib/a11y-store.ts and applies instantly, app-wide,
// through the CSS in globals.css — no page needs to know this exists.

function useA11yPrefs(): A11yPrefs {
  return useSyncExternalStore(subscribeA11y, getA11ySnapshot, getA11yServerSnapshot);
}

function ToggleRow({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  checked: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="flex items-center gap-2 text-sm text-foreground">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`press-weight relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "border-accent bg-accent" : "border-card-border bg-card-border/60"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

const TEXT_SIZES: { value: TextSize; label: string }[] = [
  { value: "md", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

export function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const prefs = useA11yPrefs();
  const t = useT();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={panelRef} className="fixed bottom-5 left-5 z-50 flex flex-col items-start">
      {open && (
        <div
          role="dialog"
          aria-label={t("a11y.title")}
          className="rise-in mb-3 w-72 rounded-2xl border border-card-border bg-card p-4 shadow-xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">{t("a11y.title")}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t("a11y.closeAria")}
              className="flex h-6 w-6 items-center justify-center rounded-full text-muted hover:text-foreground"
            >
              <Icon size={14} strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </Icon>
            </button>
          </div>

          <div className="mb-1 text-xs text-muted label-mono">{t("a11y.textSize")}</div>
          <div className="mb-3 flex gap-1.5" role="group" aria-label={t("a11y.textSizeAria")}>
            {TEXT_SIZES.map((s) => (
              <button
                key={s.value}
                type="button"
                aria-pressed={prefs.textSize === s.value}
                onClick={() => setTextSize(s.value)}
                className={`press-weight flex-1 rounded-lg border py-1.5 text-sm font-semibold transition-colors ${
                  prefs.textSize === s.value
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-card-border text-muted hover:text-foreground"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="divide-y divide-card-border/70 border-t border-card-border/70">
            <ToggleRow
              label={t("a11y.highContrast")}
              checked={prefs.highContrast}
              onChange={setHighContrast}
              icon={
                <Icon size={14} strokeWidth={1.8}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none" />
                </Icon>
              }
            />
            <ToggleRow
              label={t("a11y.dyslexiaFont")}
              checked={prefs.dyslexiaFont}
              onChange={setDyslexiaFont}
              icon={
                <Icon size={14} strokeWidth={1.8}>
                  <path d="M5 5h11M9 5v14" />
                </Icon>
              }
            />
            <ToggleRow
              label={t("a11y.reduceMotion")}
              checked={prefs.reduceMotion}
              onChange={setReduceMotion}
              icon={
                <Icon size={14} strokeWidth={1.8}>
                  <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
                </Icon>
              }
            />
          </div>

          <button
            type="button"
            onClick={resetA11yPrefs}
            className="press-weight mt-3 w-full rounded-lg border border-card-border py-1.5 text-xs text-muted hover:text-foreground"
          >
            {t("a11y.reset")}
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("a11y.openAria")}
        aria-expanded={open}
        className="press-weight flex h-12 w-12 items-center justify-center rounded-full border border-accent/60 bg-accent text-white shadow-lg hover:shadow-xl"
      >
        <Icon size={22} strokeWidth={2}>
          <circle cx="16" cy="4" r="1" />
          <path d="m18 19 1-7-6 1" />
          <path d="m5 8 3-3 5.5 3-2.36 3.5" />
          <path d="M4.24 14.5a5 5 0 0 0 6.88 6" />
          <path d="M13.76 17.5a5 5 0 0 0-6.88-6" />
        </Icon>
      </button>
    </div>
  );
}
