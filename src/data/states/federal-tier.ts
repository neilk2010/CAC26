import type { StateMeta } from "@/lib/types";

// Every U.S. jurisdiction the app screens: 50 states + DC, listed ONCE, in full.
//
// This file is deliberately complete and never edited when a state is promoted.
// A jurisdiction listed here gets the full federal baseline plus a REAL,
// official aggregator pointer — Benefits.gov is the U.S. government's own
// cross-program finder (docs/sources.md §1); we never invent a state-specific
// URL we haven't verified.
//
// Promoting a state to "deep" = writing its pack and adding ONE line to
// src/data/states/deep.ts. The registry (states/index.ts) drops the
// jurisdiction entry below for any code that has a deep pack, so a state can
// never be registered twice and a promotion can never require a deletion here.

const BENEFITS_GOV = { name: "Benefits.gov", url: "https://www.benefits.gov" };

function jurisdiction(code: string, name: string): StateMeta {
  return { code, name, available: true, tier: "federal", aggregator: BENEFITS_GOV };
}

export const ALL_JURISDICTIONS: StateMeta[] = [
  jurisdiction("AL", "Alabama"),
  jurisdiction("AK", "Alaska"),
  jurisdiction("AZ", "Arizona"),
  jurisdiction("AR", "Arkansas"),
  jurisdiction("CA", "California"),
  jurisdiction("CO", "Colorado"),
  jurisdiction("CT", "Connecticut"),
  jurisdiction("DE", "Delaware"),
  jurisdiction("DC", "District of Columbia"),
  jurisdiction("FL", "Florida"),
  jurisdiction("GA", "Georgia"),
  jurisdiction("HI", "Hawaii"),
  jurisdiction("ID", "Idaho"),
  jurisdiction("IL", "Illinois"),
  jurisdiction("IN", "Indiana"),
  jurisdiction("IA", "Iowa"),
  jurisdiction("KS", "Kansas"),
  jurisdiction("KY", "Kentucky"),
  jurisdiction("LA", "Louisiana"),
  jurisdiction("ME", "Maine"),
  jurisdiction("MD", "Maryland"),
  jurisdiction("MA", "Massachusetts"),
  jurisdiction("MI", "Michigan"),
  jurisdiction("MN", "Minnesota"),
  jurisdiction("MS", "Mississippi"),
  jurisdiction("MO", "Missouri"),
  jurisdiction("MT", "Montana"),
  jurisdiction("NE", "Nebraska"),
  jurisdiction("NV", "Nevada"),
  jurisdiction("NH", "New Hampshire"),
  jurisdiction("NJ", "New Jersey"),
  jurisdiction("NM", "New Mexico"),
  jurisdiction("NY", "New York"),
  jurisdiction("NC", "North Carolina"),
  jurisdiction("ND", "North Dakota"),
  jurisdiction("OH", "Ohio"),
  jurisdiction("OK", "Oklahoma"),
  jurisdiction("OR", "Oregon"),
  jurisdiction("PA", "Pennsylvania"),
  jurisdiction("RI", "Rhode Island"),
  jurisdiction("SC", "South Carolina"),
  jurisdiction("SD", "South Dakota"),
  jurisdiction("TN", "Tennessee"),
  jurisdiction("TX", "Texas"),
  jurisdiction("UT", "Utah"),
  jurisdiction("VT", "Vermont"),
  jurisdiction("VA", "Virginia"),
  jurisdiction("WA", "Washington"),
  jurisdiction("WV", "West Virginia"),
  jurisdiction("WI", "Wisconsin"),
  jurisdiction("WY", "Wyoming"),
];
