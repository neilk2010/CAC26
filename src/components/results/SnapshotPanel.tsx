"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  clearSnapshot,
  diffSnapshot,
  loadSnapshot,
  makeSnapshot,
  saveSnapshot,
  type SnapshotDiff,
} from "@/lib/snapshot";
import { useHousehold } from "@/lib/household-store";
import { downloadBenefitsPdf } from "@/lib/benefits-pdf";
import { getState } from "@/data/states";
import type { EligibilityResult } from "@/lib/types";

// The "since last time" panel. Reads the on-device snapshot AFTER mount (it's
// localStorage — the server never sees it), shows only likely-line crossings,
// and offers save/update/delete. State changes (NJ → CA) invalidate the
// comparison rather than pretending the two program sets line up.

export function SnapshotPanel({
  results,
  state,
}: {
  results: EligibilityResult[];
  state: string;
}) {
  const { isSignedIn } = useUser();
  const { household } = useHousehold();
  const [status, setStatus] = useState<
    | { kind: "loading" }
    | { kind: "none" }
    | { kind: "stateChanged"; savedAt: string }
    | { kind: "diff"; diff: SnapshotDiff }
    | { kind: "justSaved" }
  >({ kind: "loading" });

  useEffect(() => {
    const snap = loadSnapshot();
    if (!snap) setStatus({ kind: "none" });
    else if (snap.state !== state) setStatus({ kind: "stateChanged", savedAt: snap.savedAt });
    else setStatus({ kind: "diff", diff: diffSnapshot(snap, results) });
  }, [results, state]);

  function save() {
    saveSnapshot(makeSnapshot(state, results));
    setStatus({ kind: "justSaved" });
    if (isSignedIn) {
      const confidences = Object.fromEntries(results.map((r) => [r.program.id, r.confidence]));
      fetch("/api/account/screening", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ household, confidences }),
      }).catch(() => {});
    } else {
      // No account to sync to — the tangible "saved" is a real file. Built
      // entirely client-side (see benefits-pdf.ts), nothing is uploaded.
      downloadBenefitsPdf(household, results, getState(state)?.name ?? state);
    }
  }

  function remove() {
    clearSnapshot();
    setStatus({ kind: "none" });
  }

  if (status.kind === "loading") return null;

  if (status.kind === "none") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-card-border bg-card/60 px-4 py-3">
        <p className="text-sm text-muted min-w-0 flex-1">
          Save a snapshot of today&apos;s results — next visit, we&apos;ll show only what
          changed.{" "}
          {isSignedIn
            ? "Synced to your account, so it follows you to any device."
            : "A PDF of your results downloads to this device too — nothing is sent anywhere."}
        </p>
        <button
          type="button"
          onClick={save}
          className="press-weight rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5 text-xs text-accent"
        >
          Save snapshot
        </button>
      </div>
    );
  }

  if (status.kind === "justSaved") {
    return (
      <div className="rounded-xl border border-accent/30 bg-accent/8 px-4 py-3">
        <p className="text-sm text-muted">
          Snapshot saved{isSignedIn ? " and synced to your account" : ""}
          {!isSignedIn && (
            <>
              , and a PDF{" "}
              <strong className="text-foreground font-semibold">downloaded to your device</strong>
            </>
          )}
          . Come back after things change — a new job, a new baby, a new program in our
          library — and this box will tell you what moved.
        </p>
      </div>
    );
  }

  if (status.kind === "stateChanged") {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-card-border bg-card/60 px-4 py-3">
        <p className="text-sm text-muted min-w-0 flex-1">
          Your snapshot from {status.savedAt} was for a different state, so a comparison
          would be apples to oranges. Save a fresh one?
        </p>
        <button
          type="button"
          onClick={save}
          className="press-weight rounded-full border border-accent/50 bg-accent/10 px-3.5 py-1.5 text-xs text-accent"
        >
          Save new snapshot
        </button>
      </div>
    );
  }

  const { diff } = status;
  const changed = diff.nowLikely.length > 0 || diff.noLongerLikely.length > 0;

  return (
    <div
      className="rounded-xl border px-4 py-3 space-y-2"
      style={{
        borderColor: changed ? "color-mix(in srgb, var(--accent) 40%, transparent)" : "var(--card-border)",
        backgroundColor: changed ? "color-mix(in srgb, var(--accent) 6%, transparent)" : "color-mix(in srgb, var(--card) 60%, transparent)",
      }}
    >
      <p className="text-xs text-accent">since your snapshot, {diff.savedAt}</p>
      {changed ? (
        <div className="space-y-1.5 text-sm">
          {diff.nowLikely.length > 0 && (
            <p>
              <span className="font-semibold" style={{ color: "#2dd4bf" }}>
                Now likely:
              </span>{" "}
              {diff.nowLikely.map((r) => r.program.shortName).join(", ")} — worth opening
              below.
            </p>
          )}
          {diff.noLongerLikely.length > 0 && (
            <p>
              <span className="font-semibold" style={{ color: "#f87171" }}>
                No longer likely:
              </span>{" "}
              {diff.noLongerLikely.map((d) => d.result.program.shortName).join(", ")} — the
              cards below say why.
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nothing crossed the &ldquo;likely&rdquo; line since then — your picture is steady.
        </p>
      )}
      <div className="flex gap-4 pt-0.5">
        <button type="button" onClick={save} className="text-xs text-accent hover:underline">
          Update snapshot to today
        </button>
        <button type="button" onClick={remove} className="text-xs text-muted hover:underline">
          Delete snapshot
        </button>
      </div>
    </div>
  );
}
