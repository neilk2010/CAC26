import type { Program } from "@/lib/types";

// Rules-as-data: Georgia pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. Georgia has NOT expanded Medicaid, so childless adults under 100% of
// poverty fall in the coverage gap unless they qualify through Pathways. That
// shapes this whole pack: the marketplace floor is 100% (not 138%), and
// Pathways is the only Medicaid door for most working-age adults.

const GATEWAY = "https://gateway.ga.gov/";
// The federal MAGI table is the published source for every state's Medicaid and
// CHIP thresholds; Georgia's figures below add the 5-point disregard to it.
const MAGI_TABLE =
  "https://www.medicaid.gov/medicaid/national-medicaid-chip-program-information/medicaid-childrens-health-insurance-program-basic-health-program-eligibility-levels";

export const GA_PROGRAMS: Program[] = [
  {
    id: "ga-snap",
    name: "Georgia SNAP (Food Stamps)",
    shortName: "GA SNAP",
    state: "GA",
    category: "food",
    summary:
      "Monthly money on an EBT card for groceries. Georgia uses the standard 130% of poverty line and still counts savings — up to $2,000, or $3,000 if someone is 60+ or has a disability.",
    agencyName: "Georgia Division of Family & Children Services",
    applyUrl: GATEWAY,
    sourceUrl: "https://dfcs.georgia.gov/food-assistance-eligibility-requirements",
    lastVerified: "2026-09-20",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 130,
      // DFCS exempts households with an elderly (60+) or disabled member from
      // the gross test entirely — they're judged on NET income at 100% FPL,
      // which this tool can't compute from a rough income range. Rather than
      // wrongly rule those households out at 130%, we let them through to a
      // generous ceiling and let the agency run the real net calculation.
      // (Our age flag is 65+, so this is narrower than Georgia's own 60+.)
      raisedIncomeLimitFlags: ["age65Plus", "disabled"],
      raisedMaxIncomePctFPL: 200,
      // $2,000 standard / $3,000 with an elderly or disabled member. Our
      // savings buckets are wider than that gap, so both screen identically.
      assetLimitDollar: 2000,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ga-peachcare", "ga-wic", "ga-tanf", "ga-liheap"],
  },
  {
    id: "ga-medicaid",
    name: "Georgia Medicaid",
    shortName: "GA Medicaid",
    state: "GA",
    category: "health",
    summary:
      "Georgia did not expand Medicaid, so for adults it mostly covers pregnancy (up to 225% of poverty) and parents with very low income (33%). If you're a working-age adult without kids, look at Pathways instead.",
    agencyName: "Georgia Department of Community Health",
    applyUrl: GATEWAY,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: Georgia parents/caretakers 28%, pregnancy 220%; both
      // plus the standard 5-percentage-point disregard. No expansion adults.
      maxIncomePctFPL: 33,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 225,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ga-pathways", "ga-peachcare", "ga-access"],
  },
  {
    id: "ga-pathways",
    name: "Georgia Pathways to Coverage",
    shortName: "GA Pathways",
    state: "GA",
    category: "health",
    summary:
      "Georgia's own Medicaid door for adults 19-64 earning under 100% of poverty — about $1,330 a month for one person. You have to log 80 hours a month of work, school, training, or volunteering to get and keep it.",
    agencyName: "Georgia Department of Community Health",
    applyUrl: GATEWAY,
    sourceUrl: "https://pathways.georgia.gov/eligibility",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Pathways: ages 19-64, at or below 100% FPL, plus 80 hours/month of a
      // qualifying activity. We can't verify the hours from intake answers, so
      // confidence is capped below and the summary states the requirement.
      maxIncomePctFPL: 100,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 8,
    // The 80-hour monthly activity rule decides this, and we can't check it.
    confidenceCap: "possible",
    cascadeHints: ["ga-medicaid", "ga-snap"],
  },
  {
    id: "ga-peachcare",
    name: "PeachCare for Kids",
    shortName: "PeachCare",
    state: "GA",
    category: "health",
    summary:
      "Health coverage for Georgia kids up to 252% of the poverty level — around $80,000 for a family of four. Low monthly premiums, and none at all for children under 6.",
    agencyName: "Georgia Department of Community Health",
    applyUrl: GATEWAY,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: Georgia separate CHIP at 247% + 5-point disregard.
      maxIncomePctFPL: 252,
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
    cascadeHints: ["ga-medicaid", "ga-wic", "ga-snap"],
  },
  {
    id: "ga-tanf",
    equivalentKey: "state-tanf",
    name: "TANF Cash Assistance",
    shortName: "GA TANF",
    state: "GA",
    category: "cash",
    summary:
      "Monthly cash for families with children and almost no income. Georgia's ceiling is strict — a family of three has to be under $784 a month, with less than $1,000 in savings — and it's capped at 48 months for life.",
    agencyName: "Georgia Division of Family & Children Services",
    applyUrl: GATEWAY,
    sourceUrl:
      "https://dfcs.georgia.gov/services/temporary-assistance-needy-families/tanf-eligibility-requirements",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // DFCS Gross Income Ceiling (GIC) by assistance-unit size — a flat
      // dollar table, not a percent of poverty.
      maxIncomeSizeTable: {
        1: 435,
        2: 659,
        3: 784,
        4: 925,
        5: 1060,
        6: 1149,
        7: 1243,
        8: 1319,
      },
      sizeTableExtraPerPerson: 44,
      assetLimitDollar: 1000,
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
    cascadeHints: ["ga-snap", "ga-medicaid"],
  },
  {
    id: "ga-liheap",
    name: "Home Energy Assistance (LIHEAP)",
    shortName: "GA LIHEAP",
    state: "GA",
    category: "energy",
    summary:
      "Help with a heating or cooling bill, paid straight to the utility through your local Community Action Agency. Georgia goes by 60% of the state's median income — roughly $34,500 a year for one person, $77,000 for five — and money runs out, so apply early.",
    agencyName: "Georgia Division of Family & Children Services",
    applyUrl: "https://dfcs.georgia.gov/services/low-income-home-energy-assistance-program-liheap",
    sourceUrl: "https://dfcs.georgia.gov/services/low-income-home-energy-assistance-program-liheap",
    lastVerified: "2026-09-20",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Georgia tests 60% of STATE MEDIAN INCOME, not a percent of poverty, and
      // does not publish the full size chart on the eligibility page. DFCS does
      // publish two anchors: $34,549/yr for a household of 1 and $77,071/yr for
      // 5. Against the 2025 poverty guidelines those work out to ~221% and
      // ~205% FPL respectively, so we screen at the more generous end and cap
      // confidence — better to send someone to check the real chart than to
      // rule out a single-person household that actually qualifies.
      maxIncomePctFPL: 220,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 800,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    // Funds are first-come, first-served and the real test is 60% SMI.
    confidenceCap: "possible",
    cascadeHints: ["ga-snap"],
  },
  {
    id: "ga-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "GA",
    category: "food",
    summary:
      "Food benefits, nutrition help, and breastfeeding support for pregnant people, new parents, and kids under 5.",
    agencyName: "Georgia Department of Public Health",
    applyUrl: "https://dph.georgia.gov/WIC",
    sourceUrl: "https://dph.georgia.gov/WIC",
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
    cascadeHints: ["ga-snap", "ga-peachcare"],
  },
  {
    id: "ga-access",
    equivalentKey: "state-marketplace-subsidy",
    name: "Georgia Access Marketplace Savings",
    shortName: "GA Access",
    state: "GA",
    category: "health",
    summary:
      "Lowers your monthly premium on a plan bought through Georgia Access — the state's own marketplace since 2024, replacing HealthCare.gov. Because Georgia didn't expand Medicaid, savings start at 100% of poverty.",
    agencyName: "Georgia Access",
    applyUrl: "https://georgiaaccess.gov/",
    sourceUrl: "https://georgiaaccess.gov/",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Non-expansion state: the subsidy floor is 100% FPL, not 138%. Below
      // that is the coverage gap — Pathways is the alternative door.
      minIncomePctFPL: 100,
      maxIncomePctFPL: 400,
      categoricalRequirements: [],
      requireAllCategorical: false,
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 1000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ga-medicaid", "ga-pathways"],
  },
];
