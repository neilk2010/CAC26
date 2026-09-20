import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const MI_META: StateMeta = {
  code: "MI",
  name: "Michigan",
  available: true,
  tier: "deep",
  // MI Bridges is the single front door for food, cash, health and emergency
  // relief benefits.
  aggregator: { name: "MI Bridges", url: "https://newmibridges.michigan.gov/" },
};
