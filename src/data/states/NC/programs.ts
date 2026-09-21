import type { Program } from "@/lib/types";

// Rules-as-data: North Carolina pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. North Carolina expanded Medicaid on December 1, 2023, which is recent
// enough that many residents still assume they're in the coverage gap — the
// Medicaid summary below says so plainly.

const EPASS = "https://epass.nc.gov/";
// The federal MAGI table is the published source for every state's Medicaid and
// CHIP thresholds; North Carolina's figures below add the 5-point disregard.
const MAGI_TABLE =
  "https://www.medicaid.gov/medicaid/national-medicaid-chip-program-information/medicaid-childrens-health-insurance-program-basic-health-program-eligibility-levels";

export const NC_PROGRAMS: Program[] = [
  {
    id: "nc-fns",
    name: "Food and Nutrition Services (SNAP)",
    shortName: "NC FNS",
    state: "NC",
    category: "food",
    summary:
      "Monthly money on an EBT card for groceries — North Carolina calls it FNS. The line is 200% of the poverty level, and households that qualify this way have no savings limit at all.",
    agencyName: "NC Department of Health and Human Services",
    applyUrl: EPASS,
    sourceUrl:
      "https://policies.ncdhhs.gov/wp-content/uploads/FNS-220-Categorical-Eligibility-10.2024.pdf",
    lastVerified: "2026-09-20",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // FNS 220: a household at or below 200% FPL that received information
      // about TANF-funded services is "expanded categorically eligible", which
      // waives the resource, gross AND net income limits.
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["nc-medicaid", "nc-wic", "nc-lieap", "nc-work-first"],
  },
  {
    id: "nc-medicaid",
    name: "NC Medicaid",
    shortName: "NC Medicaid",
    state: "NC",
    category: "health",
    summary:
      "North Carolina expanded Medicaid on December 1, 2023 — adults now qualify up to 138% of the poverty level, and pregnancy coverage reaches 201%. If you were turned down before 2024, it's worth applying again.",
    agencyName: "NC Medicaid",
    applyUrl: EPASS,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: NC expansion adults 133%, pregnancy 196%; both plus
      // the standard 5-percentage-point disregard.
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 201,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["nc-fns", "nc-kids", "nc-wic"],
  },
  {
    id: "nc-kids",
    name: "NC Medicaid for Children",
    shortName: "NC Kids",
    state: "NC",
    category: "health",
    summary:
      "Health coverage for North Carolina kids up to 216% of the poverty level — roughly $69,000 for a family of four — with no savings test.",
    agencyName: "NC Medicaid",
    applyUrl: EPASS,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: NC children 0-18 at 211% + 5-point disregard = 216%.
      maxIncomePctFPL: 216,
      categoricalRequirements: [
        { type: "pregnantOrChildUnder5" },
        { type: "schoolAgeChild" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 2000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["nc-medicaid", "nc-wic", "nc-fns"],
  },
  {
    id: "nc-work-first",
    equivalentKey: "state-tanf",
    name: "Work First Family Assistance",
    shortName: "Work First",
    state: "NC",
    category: "cash",
    summary:
      "Monthly cash for families with children and very little income. North Carolina compares your countable income to a need standard — $544 a month for a family of three — and pays half the difference.",
    agencyName: "NC Department of Health and Human Services",
    applyUrl: EPASS,
    sourceUrl:
      "https://www.ncdhhs.gov/divisions/social-services/work-first-family-assistance/work-first-eligibility-and-income",
    lastVerified: "2026-09-20",
    rules: {
      // Countable income (after disregards) is measured against the need
      // standard, so gross over the line is "borderline", never a hard fail.
      incomeBasis: "net",
      incomePeriod: "monthly",
      // Work First need standard by number of people on the grant, from the
      // 2026-2028 NC TANF State Plan. The payment is 50% of the gap between
      // countable income and this standard.
      maxIncomeSizeTable: {
        1: 362,
        2: 472,
        3: 544,
        4: 594,
        5: 648,
        6: 698,
        7: 746,
        8: 772,
      },
      sizeTableExtraPerPerson: 50,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["nc-fns", "nc-medicaid"],
  },
  {
    id: "nc-lieap",
    name: "Low Income Energy Assistance (LIEAP)",
    shortName: "NC LIEAP",
    state: "NC",
    category: "energy",
    summary:
      "A one-time payment straight to your heating company. The line is 130% of the poverty level. Households with someone 60+ or getting disability services can apply in December; everyone else starts January 2, and it closes March 31 or when the money runs out.",
    agencyName: "NC Department of Health and Human Services",
    applyUrl: EPASS,
    sourceUrl:
      "https://www.ncdhhs.gov/divisions/social-services/energy-assistance/low-income-energy-assistance-lieap",
    lastVerified: "2026-09-20",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // NCDHHS: household income at or below 130% of the federal poverty limit.
      maxIncomePctFPL: 130,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 600,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["nc-cip", "nc-fns"],
  },
  {
    id: "nc-cip",
    equivalentKey: "us-liheap",
    name: "Crisis Intervention Program",
    shortName: "NC CIP",
    state: "NC",
    category: "energy",
    summary:
      "For when the heat or air is already off, or about to be. Unlike LIEAP this runs all year and there's no seasonal window — your county social services office decides based on the emergency in front of you.",
    agencyName: "NC Department of Health and Human Services",
    applyUrl: "https://www.ncdhhs.gov/divisions/social-services/energy-assistance",
    sourceUrl: "https://www.ncdhhs.gov/divisions/social-services/energy-assistance",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // NCDHHS publishes no income percentage for CIP — it's a crisis program
      // the county decides case by case. Rather than invent a ceiling, we screen
      // on the crisis itself and cap confidence at "possible".
      categoricalRequirements: [{ type: "utilityHardship" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 800,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    // County-discretion crisis program with no published income line.
    confidenceCap: "possible",
    cascadeHints: ["nc-lieap", "nc-fns"],
  },
  {
    id: "nc-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "NC",
    category: "food",
    summary:
      "Food benefits, nutrition help, and breastfeeding support for pregnant people, new parents, and kids under 5.",
    agencyName: "NC Department of Health and Human Services",
    applyUrl: "https://www.nutritionnc.com/wic/",
    sourceUrl: "https://www.nutritionnc.com/wic/",
    lastVerified: "2026-09-20",
    supersedes: ["us-wic"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 185% FPL is the federal WIC statutory ceiling, identical in every state.
      maxIncomePctFPL: 185,
      categoricalRequirements: [{ type: "pregnantOrChildUnder5" }],
      requireAllCategorical: true,
      // Adjunctive eligibility: SNAP, Medicaid or TANF meets WIC's income test.
      incomeWaivedByFlags: ["receivesSnap", "receivesMedicaid", "receivesTanf"],
    },
    estimatedAnnualValueMin: 600,
    estimatedAnnualValueMax: 1600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    cascadeHints: ["nc-fns", "nc-medicaid"],
  },
  {
    id: "nc-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Marketplace Premium Savings",
    shortName: "NC Marketplace",
    state: "NC",
    category: "health",
    summary:
      "Lowers your monthly premium on a HealthCare.gov plan if you earn too much for Medicaid. The 400% of poverty cap is back for 2026 plans.",
    agencyName: "HealthCare.gov",
    applyUrl: "https://www.healthcare.gov/",
    sourceUrl: "https://www.healthcare.gov/lower-costs/",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Expansion state since 12/1/2023: Medicaid covers below 138%.
      minIncomePctFPL: 138,
      maxIncomePctFPL: 400,
      categoricalRequirements: [],
      requireAllCategorical: false,
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 1000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["nc-medicaid"],
  },
];
