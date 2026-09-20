import type { StateMeta } from "@/lib/types";

// State-level metadata, kept separate from the program pack so the registry
// composes each state from its own meta + programs (rules-as-data).
export const NC_META: StateMeta = {
  code: "NC",
  name: "North Carolina",
  available: true,
  tier: "deep",
  // ePASS is North Carolina's online front door for Food and Nutrition
  // Services, Medicaid and Work First.
  aggregator: { name: "NC ePASS", url: "https://epass.nc.gov/" },
};
