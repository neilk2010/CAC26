import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const OH_META: StateMeta = {
  code: "OH",
  name: "Ohio",
  available: true,
  tier: "deep",
  // Ohio Benefits Self Service is the single front door — SNAP, Medicaid and
  // Ohio Works First cash assistance all apply through it.
  aggregator: { name: "Ohio Benefits", url: "https://ssp.benefits.ohio.gov/" },
};
