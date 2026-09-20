import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const GA_META: StateMeta = {
  code: "GA",
  name: "Georgia",
  available: true,
  tier: "deep",
  // Georgia Gateway is the single front door for SNAP, Medicaid, TANF and
  // PeachCare for Kids.
  aggregator: { name: "Georgia Gateway", url: "https://gateway.ga.gov/" },
};
