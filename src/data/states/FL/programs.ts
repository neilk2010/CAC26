import type { Program } from "@/lib/types";

// Rules-as-data: Florida pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. Florida never expanded Medicaid, and this pack models that honestly:
// the adult coverage gap is real and the summaries say so instead of hiding it.

export const FL_PROGRAMS: Program[] = [
  {
    id: "fl-snap",
    name: "Florida SNAP (Food Assistance)",
    shortName: "FL SNAP",
    state: "FL",
    category: "food",
    summary:
      "Monthly money on an EBT card to help buy groceries. Florida's income line is one of the more generous — 200% of the poverty level — and most households face no savings test.",
    agencyName: "Florida Department of Children and Families",
    applyUrl: "https://myaccess.myflfamilies.com/",
    sourceUrl:
      "https://www.myflfamilies.com/services/public-assistance/supplemental-nutrition-assistance-program-snap/snap-eligibility/",
    lastVerified: "2026-07-19",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Broad-based categorical eligibility: "most households must have gross
      // income less than or equal to 200 percent of the FPL" (DCF, read
      // 2026-07-19). No asset test for most households.
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["fl-kidcare", "fl-wic", "fl-tca"],
  },
  {
    id: "fl-kidcare",
    name: "Florida KidCare & Children's Medicaid",
    shortName: "FL KidCare",
    state: "FL",
    category: "health",
    summary:
      "Health and dental coverage for Florida kids through age 18 — free under about 133% of the poverty level, then $15-$20 a month up to 200%. Honest note: Florida did not expand Medicaid, so most adults without disabilities can't get Medicaid here, but kids qualify at far higher family incomes.",
    agencyName: "Florida KidCare / Agency for Health Care Administration",
    applyUrl: "https://www.floridakidcare.org/",
    sourceUrl: "https://www.floridakidcare.org/",
    lastVerified: "2026-07-19",
    supersedes: ["us-medicaid", "us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Subsidized KidCare (Medicaid → MediKids/Healthy Kids/CMS Plan) runs to
      // 200% FPL; above that is full-pay. floridakidcare.org 2026 guidelines.
      maxIncomePctFPL: 200,
      categoricalRequirements: [
        { type: "pregnantOrChildUnder5" },
        { type: "schoolAgeChild" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["fl-snap", "fl-wic", "fl-parents-medicaid"],
  },
  {
    id: "fl-pregnancy-medicaid",
    equivalentKey: "us-medicaid",
    name: "Medicaid for Pregnant Women",
    shortName: "FL Pregnancy Medicaid",
    state: "FL",
    category: "health",
    summary:
      "Free coverage during pregnancy and for 12 months after birth, at incomes up to about twice the poverty level — much higher than Florida's regular adult limit.",
    agencyName: "Florida Department of Children and Families",
    applyUrl: "https://myaccess.myflfamilies.com/",
    sourceUrl: "https://www.myflfamilies.com/services/public-assistance/medicaid",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 196% FPL (2026 Family-Related Medicaid chart, per DCF's ESS Appendix
      // A-7 methodology as published by Florida Health Justice Project).
      maxIncomeSizeTable: {
        1: 2607,
        2: 3535,
        3: 4463,
        4: 5390,
        5: 6318,
        6: 7246,
        7: 8174,
        8: 9101,
      },
      sizeTableExtraPerPerson: 928,
      categoricalRequirements: [{ type: "pregnantOrChildUnder5" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 10000,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["fl-wic", "fl-kidcare"],
  },
  {
    id: "fl-parents-medicaid",
    equivalentKey: "us-medicaid",
    name: "Medicaid for Parents & Caretakers",
    shortName: "FL Parent Medicaid",
    state: "FL",
    category: "health",
    summary:
      "Medicaid for parents and caretaker relatives of minor children. Honest note: because Florida didn't expand Medicaid, this limit has been frozen for decades at about 27% of the poverty level — a family of three qualifies only under about $600 a month.",
    agencyName: "Florida Department of Children and Families",
    applyUrl: "https://myaccess.myflfamilies.com/",
    sourceUrl: "https://www.myflfamilies.com/services/public-assistance/medicaid",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // The frozen parent/caretaker standard (2026 Family-Related Medicaid
      // chart, "Adults" column).
      maxIncomeSizeTable: {
        1: 356,
        2: 478,
        3: 600,
        4: 723,
        5: 846,
        6: 968,
        7: 1091,
        8: 1214,
      },
      sizeTableExtraPerPerson: 123,
      categoricalRequirements: [
        { type: "pregnantOrChildUnder5" },
        { type: "schoolAgeChild" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["fl-kidcare", "fl-marketplace"],
  },
  {
    id: "fl-tca",
    equivalentKey: "state-tanf",
    name: "Temporary Cash Assistance",
    shortName: "FL TCA",
    state: "FL",
    category: "cash",
    summary:
      "Monthly cash help for families with children who have very little or no income. Florida's payment standards have been frozen since 1992 — a family of three tops out at $303 a month — but TCA connects you to SNAP, Medicaid, and child care help.",
    agencyName: "Florida Department of Children and Families",
    applyUrl: "https://myaccess.myflfamilies.com/",
    sourceUrl: "https://www.myflfamilies.com/services/public-assistance/temporary-cash-assistance",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // Countable income must be under the payment standard (Tier I, shelter
      // obligation over $50) — the binding test. A 185% FPL gross screen also
      // applies but is far looser. Fla. Stat. 414.095; DCF TCA page.
      maxIncomeSizeTable: {
        1: 180,
        2: 241,
        3: 303,
        4: 364,
        5: 426,
        6: 487,
        7: 549,
        8: 610,
      },
      sizeTableExtraPerPerson: 61,
      // Countable assets must be $2,000 or less (DCF TCA eligibility rules).
      assetLimitDollar: 2000,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 1500,
    estimatedAnnualValueMax: 4500,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["fl-snap", "fl-kidcare"],
  },
  {
    id: "fl-liheap",
    name: "Low Income Home Energy Assistance Program",
    shortName: "FL LIHEAP",
    state: "FL",
    category: "energy",
    summary:
      "Help paying electric and cooling bills through local agencies — in Florida the summer cooling season is when it matters most. Funds are seasonal; apply early.",
    agencyName: "Florida Department of Commerce (local LIHEAP agencies)",
    applyUrl: "https://floridajobs.org/community-development/Low-Income-Home-Energy-Assistance-Program",
    sourceUrl: "https://floridajobs.org/community-development/Low-Income-Home-Energy-Assistance-Program",
    lastVerified: "2026-07-19",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Florida tests LIHEAP against 60% of State Median Income — the FFY2026
      // annual figures (LIHEAP Clearinghouse, ACF) divided by 12.
      maxIncomeSizeTable: {
        1: 2679.58,
        2: 3504.08,
        3: 4328.58,
        4: 5153.08,
        5: 5977.5,
        6: 6802.0,
        7: 6956.6,
        8: 7111.19,
      },
      sizeTableExtraPerPerson: 154.59,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["fl-snap"],
  },
  {
    id: "fl-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "FL",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "Florida Department of Health",
    applyUrl: "https://www.floridahealth.gov/programs-and-services/wic/",
    sourceUrl: "https://www.floridahealth.gov/programs-and-services/wic/",
    lastVerified: "2026-07-19",
    supersedes: ["us-wic"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 185,
      categoricalRequirements: [{ type: "pregnantOrChildUnder5" }],
      requireAllCategorical: true,
      // Adjunctive eligibility: already receiving SNAP, Medicaid, or TANF
      // automatically meets WIC's income test (federal WIC rule).
      incomeWaivedByFlags: ["receivesSnap", "receivesMedicaid", "receivesTanf"],
    },
    estimatedAnnualValueMin: 600,
    estimatedAnnualValueMax: 1600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    cascadeHints: ["fl-snap", "fl-pregnancy-medicaid"],
  },
  {
    id: "fl-ssi",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income",
    shortName: "SSI",
    state: "FL",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources. SSI in Florida also comes with automatic Medicaid.",
    agencyName: "Social Security Administration",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://www.ssa.gov/benefits/ssi/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // 2026 Federal Benefit Rate (no FL state supplement for independent living).
      maxIncomeFlatDollar: 994,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["fl-snap", "fl-senior-homestead"],
  },
  {
    id: "fl-senior-homestead",
    equivalentKey: "state-property-tax-relief",
    name: "Limited-Income Senior Additional Homestead Exemption",
    shortName: "FL Senior Exemption",
    state: "FL",
    category: "housing",
    summary:
      "An extra property-tax exemption (up to $50,000) for homeowners 65+ with limited household income — on top of Florida's regular homestead exemption. Honest note: it only applies in counties and cities that adopted it, so check with your county property appraiser.",
    agencyName: "County Property Appraiser / Florida Dept. of Revenue",
    applyUrl: "https://floridarevenue.com/property/Pages/Taxpayers_Exemptions.aspx",
    sourceUrl: "https://floridarevenue.com/property/Documents/AdditionalHomestead.pdf",
    lastVerified: "2026-07-19",
    // County/city opt-in — qualifying statewide can't be promised.
    confidenceCap: "possible",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // 2026 adjusted-gross-income limitation per Fla. Stat. 196.075 (indexed
      // annually by the Dept. of Revenue).
      maxIncomeFlatDollar: 38686,
      categoricalRequirements: [{ type: "age65Plus" }],
      requireAllCategorical: true,
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["own"], label: "you own your home" },
      ],
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 800,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["fl-ssi"],
  },
  {
    id: "fl-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Health Insurance Marketplace Savings",
    shortName: "Marketplace Subsidy",
    state: "FL",
    category: "health",
    summary:
      "Lowers your monthly premium for a HealthCare.gov plan. Honest note: because Florida didn't expand Medicaid, subsidies only start at 100% of the poverty level — below that line most adults fall into a coverage gap with no help, which is a real gap in the law, not a mistake in your application.",
    agencyName: "HealthCare.gov (federal marketplace)",
    applyUrl: "https://www.healthcare.gov/",
    sourceUrl: "https://www.healthcare.gov/lower-costs/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Non-expansion state: premium tax credits begin at 100% FPL (not 138%).
      // The enhanced-subsidy era ended 12/31/2025, so the 400% FPL cliff is
      // back for 2026 plans.
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
    cascadeHints: ["fl-kidcare"],
  },
];
