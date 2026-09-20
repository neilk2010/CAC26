import type { StateMeta } from "@/lib/types";

// The 40 federal-tier jurisdictions (50 states + DC, minus the deep-tier
// NJ/CA/TX/FL/NY/PA/IL/OH/GA/NC/MI packs): every one gets the full federal baseline plus
// a REAL, official aggregator pointer. Benefits.gov is the U.S. government's
// own cross-program finder (docs/sources.md §1) — we never invent a
// state-specific URL we haven't verified. Promoting a state to "deep" =
// writing its pack + moving it to the deep list in src/data/states/index.ts.

const BENEFITS_GOV = { name: "Benefits.gov", url: "https://www.benefits.gov" };

function federalTier(code: string, name: string): StateMeta {
  return { code, name, available: true, tier: "federal", aggregator: BENEFITS_GOV };
}

export const FEDERAL_TIER_STATES: StateMeta[] = [
  federalTier("AL", "Alabama"),
  federalTier("AK", "Alaska"),
  federalTier("AZ", "Arizona"),
  federalTier("AR", "Arkansas"),
  federalTier("CO", "Colorado"),
  federalTier("CT", "Connecticut"),
  federalTier("DE", "Delaware"),
  federalTier("DC", "District of Columbia"),
  federalTier("HI", "Hawaii"),
  federalTier("ID", "Idaho"),
  federalTier("IN", "Indiana"),
  federalTier("IA", "Iowa"),
  federalTier("KS", "Kansas"),
  federalTier("KY", "Kentucky"),
  federalTier("LA", "Louisiana"),
  federalTier("ME", "Maine"),
  federalTier("MD", "Maryland"),
  federalTier("MA", "Massachusetts"),
  federalTier("MN", "Minnesota"),
  federalTier("MS", "Mississippi"),
  federalTier("MO", "Missouri"),
  federalTier("MT", "Montana"),
  federalTier("NE", "Nebraska"),
  federalTier("NV", "Nevada"),
  federalTier("NH", "New Hampshire"),
  federalTier("NM", "New Mexico"),
  federalTier("ND", "North Dakota"),
  federalTier("OK", "Oklahoma"),
  federalTier("OR", "Oregon"),
  federalTier("RI", "Rhode Island"),
  federalTier("SC", "South Carolina"),
  federalTier("SD", "South Dakota"),
  federalTier("TN", "Tennessee"),
  federalTier("UT", "Utah"),
  federalTier("VT", "Vermont"),
  federalTier("VA", "Virginia"),
  federalTier("WA", "Washington"),
  federalTier("WV", "West Virginia"),
  federalTier("WI", "Wisconsin"),
  federalTier("WY", "Wyoming"),
];
