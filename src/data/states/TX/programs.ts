import type { Program } from "@/lib/types";

// Rules-as-data: Texas pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. Texas never expanded Medicaid, and this pack models that honestly:
// the adult coverage gap is real and the summaries say so instead of hiding it.

export const TX_PROGRAMS: Program[] = [
  {
    id: "tx-snap",
    name: "Texas SNAP (Lone Star Card)",
    shortName: "TX SNAP",
    state: "TX",
    category: "food",
    summary:
      "Monthly money on a Lone Star Card to help buy groceries. Texas uses the standard federal income line — and unlike most states, it also has a savings limit.",
    agencyName: "Texas Health and Human Services Commission",
    applyUrl: "https://www.yourtexasbenefits.com/",
    sourceUrl:
      "https://www.hhs.texas.gov/handbooks/texas-works-handbook/c-120-supplemental-nutrition-assistance-program",
    lastVerified: "2026-07-19",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Texas has no broad-based categorical eligibility: the standard gross
      // limit is 130% FPL (the 165% column in the handbook applies only to
      // elderly/disabled separate-household status). Net 100% also applies but
      // isn't modeled. Handbook C-121, effective Oct. 1, 2025.
      maxIncomePctFPL: 130,
      // Texas kept a SNAP resource test: $5,000 in countable resources
      // (liquid + excess vehicle value). Handbook A-1220.
      assetLimitDollar: 5000,
      categoricalRequirements: [],
      requireAllCategorical: false,
      // Categorically eligible: all-TANF/SSI households skip the income test.
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["tx-medicaid-kids-chip", "tx-wic", "tx-tanf"],
  },
  {
    id: "tx-medicaid-kids-chip",
    name: "Children's Medicaid & CHIP",
    shortName: "TX Kids Medicaid/CHIP",
    state: "TX",
    category: "health",
    summary:
      "Free or low-cost health coverage for Texas kids and teens through age 18. Honest note: Texas did not expand Medicaid, so adults without disabilities generally can't get Medicaid here — but kids qualify at much higher family incomes than most people expect.",
    agencyName: "Texas Health and Human Services Commission",
    applyUrl: "https://www.yourtexasbenefits.com/",
    sourceUrl:
      "https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-members/chip",
    lastVerified: "2026-07-19",
    supersedes: ["us-medicaid", "us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // The official CHIP monthly income table (the outer ceiling of the
      // kids' coverage ladder — lower incomes route to Children's Medicaid
      // automatically when you apply). hhs.texas.gov, read 2026-07-19.
      maxIncomeSizeTable: {
        1: 2622,
        2: 3543,
        3: 4464,
        4: 5386,
        5: 6307,
        6: 7228,
        7: 8149,
      },
      sizeTableExtraPerPerson: 922,
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
    cascadeHints: ["tx-snap", "tx-wic", "tx-parents-medicaid"],
  },
  {
    id: "tx-pregnancy-medicaid",
    equivalentKey: "us-medicaid",
    name: "Medicaid for Pregnant Women & CHIP Perinatal",
    shortName: "TX Pregnancy Coverage",
    state: "TX",
    category: "health",
    summary:
      "Free coverage during pregnancy and up to 12 months after birth. If income is slightly too high for Medicaid, CHIP Perinatal picks up — and it has no immigration-status requirement.",
    agencyName: "Texas Health and Human Services Commission",
    applyUrl: "https://www.yourtexasbenefits.com/",
    sourceUrl:
      "https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-programs-services/medicaid-pregnant-women-chip-perinatal",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CHIP Perinatal's table (the outer ceiling; pregnancy Medicaid runs
      // slightly lower and is checked automatically on the same application).
      maxIncomeSizeTable: {
        1: 2687,
        2: 3643,
        3: 4599,
        4: 5555,
        5: 6512,
      },
      sizeTableExtraPerPerson: 957,
      categoricalRequirements: [{ type: "pregnantOrChildUnder5" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 10000,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["tx-wic", "tx-medicaid-kids-chip"],
  },
  {
    id: "tx-parents-medicaid",
    equivalentKey: "us-medicaid",
    name: "Medicaid for Parents & Caretakers",
    shortName: "TX Parent Medicaid",
    state: "TX",
    category: "health",
    summary:
      "Medicaid for a parent or relative caring for a child who already has Medicaid. Honest note: because Texas didn't expand Medicaid, this limit is among the lowest in the country — a single parent of two qualifies only under about $230 a month.",
    agencyName: "Texas Health and Human Services Commission",
    applyUrl: "https://www.yourtexasbenefits.com/",
    sourceUrl:
      "https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-programs-services/programs-children-adults-disabilities/programs-children-families/medicaid-parents-caretakers",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // The one-parent column of the official table — near-identical to the
      // two-parent column at these sizes. hhs.texas.gov, read 2026-07-19.
      maxIncomeSizeTable: {
        1: 103,
        2: 196,
        3: 230,
        4: 277,
        5: 310,
        6: 356,
        7: 389,
        8: 441,
      },
      sizeTableExtraPerPerson: 52,
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
    cascadeHints: ["tx-medicaid-kids-chip", "tx-marketplace"],
  },
  {
    id: "tx-tanf",
    equivalentKey: "state-tanf",
    name: "TANF Cash Help",
    shortName: "TX TANF",
    state: "TX",
    category: "cash",
    summary:
      "Monthly cash help for families with children who have very little or no income. Texas's limits are strict — a single-parent family of three must be under about $751 a month — and grants are small, but it comes with SNAP and Medicaid connections.",
    agencyName: "Texas Health and Human Services Commission",
    applyUrl: "https://www.yourtexasbenefits.com/",
    sourceUrl: "https://www.hhs.texas.gov/handbooks/texas-works-handbook/c-110-tanf",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // Budgetary-needs (100%) column for caretaker cases without a second
      // parent — the eligibility ceiling in handbook C-111, Oct. 1, 2025.
      maxIncomeSizeTable: {
        1: 313,
        2: 650,
        3: 751,
        4: 903,
        5: 1003,
        6: 1153,
        7: 1252,
        8: 1425,
      },
      sizeTableExtraPerPerson: 173,
      // TANF resource limit: $1,000 (handbook A-1220).
      assetLimitDollar: 1000,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    // Max grants run ~$130-$470/month by family size and case type (C-111).
    estimatedAnnualValueMin: 1500,
    estimatedAnnualValueMax: 5500,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["tx-snap", "tx-medicaid-kids-chip"],
  },
  {
    id: "tx-ceap",
    name: "Comprehensive Energy Assistance Program",
    shortName: "TX CEAP",
    state: "TX",
    category: "energy",
    summary:
      "Texas's version of LIHEAP: help paying electric and gas bills, run through local agencies covering all 254 counties. Funds are seasonal — apply early.",
    agencyName: "Texas Dept. of Housing and Community Affairs",
    applyUrl: "https://www.tdhca.texas.gov/help-texans",
    sourceUrl: "https://www.tdhca.texas.gov/comprehensive-energy-assistance-program-ceap",
    lastVerified: "2026-07-19",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CEAP eligibility is 150% of the federal poverty guidelines (TDHCA
      // LIHEAP State Plan / program guidance).
      maxIncomePctFPL: 150,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["tx-snap"],
  },
  {
    id: "tx-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "TX",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "Texas WIC (HHSC)",
    applyUrl: "https://texaswic.org/",
    sourceUrl: "https://texaswic.org/apply",
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
    cascadeHints: ["tx-snap", "tx-pregnancy-medicaid"],
  },
  {
    id: "tx-ssi",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income",
    shortName: "SSI",
    state: "TX",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources. Texas doesn't add a state supplement, but SSI in Texas also comes with automatic Medicaid.",
    agencyName: "Social Security Administration",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://www.ssa.gov/benefits/ssi/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // 2026 Federal Benefit Rate (no TX state supplement).
      maxIncomeFlatDollar: 994,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["tx-snap", "tx-homestead"],
  },
  {
    id: "tx-homestead",
    equivalentKey: "state-property-tax-relief",
    name: "Homestead Exemption for Seniors & People with Disabilities",
    shortName: "TX Homestead 65+",
    state: "TX",
    category: "housing",
    summary:
      "Texas homeowners 65+ or with a disability get a $200,000 school-tax homestead exemption ($140,000 general + $60,000 additional, after the 2025 ballot measures) plus a permanent ceiling on school taxes. No income test — you just have to apply with your county appraisal district.",
    agencyName: "County Appraisal District / Texas Comptroller",
    applyUrl: "https://comptroller.texas.gov/taxes/property-tax/exemptions/",
    sourceUrl: "https://comptroller.texas.gov/taxes/property-tax/exemptions/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // No income test — eligibility is age/disability + owning your home.
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["own"], label: "you own your home" },
      ],
    },
    estimatedAnnualValueMin: 500,
    estimatedAnnualValueMax: 2000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["tx-ssi"],
  },
  {
    id: "tx-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Health Insurance Marketplace Savings",
    shortName: "Marketplace Subsidy",
    state: "TX",
    category: "health",
    summary:
      "Lowers your monthly premium for a HealthCare.gov plan. Honest note: because Texas didn't expand Medicaid, subsidies only start at 100% of the poverty level — below that line most adults fall into a coverage gap with no help, which is a real gap in the law, not a mistake in your application.",
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
      // Marketplace subsidies are for people without another affordable
      // coverage option — the real ACA "firewall" rule.
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 1000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["tx-medicaid-kids-chip"],
  },
];
