import type { Program } from "@/lib/types";

// Rules-as-data: Pennsylvania pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. PA is an expansion state with two programs most states don't have:
// CHIP with no upper income cap, and PACE/PACENET prescription help (whose
// PACENET ceiling rose on July 1, 2026 — reflected here).

export const PA_PROGRAMS: Program[] = [
  {
    id: "pa-snap",
    name: "Pennsylvania SNAP",
    shortName: "PA SNAP",
    state: "PA",
    category: "food",
    summary:
      "Monthly money on an EBT card to help buy groceries. Pennsylvania's income line is 200% of the poverty level — higher than the federal default — and there's no savings test.",
    agencyName: "PA Department of Human Services",
    applyUrl: "https://www.compass.state.pa.us/",
    sourceUrl: "https://www.pa.gov/agencies/dhs/resources/snap/snap-income-limits",
    lastVerified: "2026-07-19",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // DHS's published table (effective Oct 1, 2025) tracks 200% FPL:
      // $2,610/month for 1, $5,360 for 4. No asset test under BBCE.
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["pa-medicaid", "pa-wic", "pa-liheap", "pa-tanf"],
  },
  {
    id: "pa-medicaid",
    name: "Medical Assistance (PA Medicaid)",
    shortName: "PA Medical Assistance",
    state: "PA",
    category: "health",
    summary:
      "Free or low-cost health coverage for Pennsylvanians with lower incomes. PA expanded Medicaid, so most adults qualify up to 138% of the poverty level — pregnancy coverage reaches 215%, with no asset test.",
    agencyName: "PA Department of Human Services",
    applyUrl: "https://www.compass.state.pa.us/",
    sourceUrl: "https://www.pa.gov/services/dhs/apply-for-medicaid-coverage-for-pregnancy",
    lastVerified: "2026-07-19",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 138% FPL MAGI adults; pregnant applicants and infants under 1 qualify
      // to 215% FPL (DHS presumptive-eligibility limits, 2026).
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 215,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["pa-snap", "pa-chip", "pa-wic"],
  },
  {
    id: "pa-chip",
    name: "Pennsylvania CHIP",
    shortName: "PA CHIP",
    state: "PA",
    category: "health",
    summary:
      "Health coverage for every uninsured Pennsylvania kid under 19 — genuinely every kid: there's no income cap. Free below about 208% of the poverty level, affordable monthly premiums from there up to about 314%, and full-cost buy-in above that.",
    agencyName: "PA Department of Human Services",
    applyUrl: "https://www.compass.state.pa.us/",
    sourceUrl: "https://www.pa.gov/agencies/dhs/resources/chip/eligibility-and-benefits",
    lastVerified: "2026-07-19",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // The subsidized tiers end at ~314% FPL (free ≤208%, low-cost premiums
      // 208-314%); above that CHIP is still open at full cost, which the
      // summary explains rather than the screener promising savings.
      maxIncomePctFPL: 314,
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
    cascadeHints: ["pa-medicaid", "pa-school-meals"],
  },
  {
    id: "pa-tanf",
    equivalentKey: "state-tanf",
    name: "TANF Cash Assistance",
    shortName: "PA TANF",
    state: "PA",
    category: "cash",
    summary:
      "Monthly cash assistance for families with children who have very little or no income. Honest note: PA's grant has been frozen since 1990 — about $403 a month for a family of three in most counties — but it comes with SNAP, Medical Assistance, and child care connections.",
    agencyName: "PA Department of Human Services / County Assistance Office",
    applyUrl: "https://www.compass.state.pa.us/",
    sourceUrl: "https://www.pa.gov/agencies/dhs/resources/cash-assistance/tanf",
    lastVerified: "2026-07-19",
    // Payment standards vary by county group — never promise "likely."
    confidenceCap: "possible",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // Anchored to the Group 2 (most counties, incl. Philadelphia) family-of-3
      // payment standard of $403/month, frozen since 1990; rough per-person
      // step. Combined with the "possible" cap this screens out clearly-over-
      // income households without promising eligibility.
      maxIncomeSizeTable: { 3: 403 },
      sizeTableExtraPerPerson: 100,
      assetLimitDollar: 1000,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 2000,
    estimatedAnnualValueMax: 5500,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["pa-snap", "pa-medicaid"],
  },
  {
    id: "pa-liheap",
    name: "Low Income Home Energy Assistance Program",
    shortName: "PA LIHEAP",
    state: "PA",
    category: "energy",
    summary:
      "Grants to help pay heating bills (plus crisis grants if you're close to losing heat). Seasonal — opens each winter, typically November through spring.",
    agencyName: "PA Department of Human Services",
    applyUrl: "https://www.compass.state.pa.us/",
    sourceUrl:
      "https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-announces-opening-of-2025-26-liheap-seaso",
    lastVerified: "2026-07-19",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // PA sets LIHEAP at 150% of the federal poverty guidelines (2025-26
      // season: $23,940/year for 1, $49,500 for 4).
      maxIncomePctFPL: 150,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["pa-snap"],
  },
  {
    id: "pa-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "PA",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "PA Department of Health",
    applyUrl: "https://www.pawic.com/",
    sourceUrl: "https://www.pawic.com/",
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
    cascadeHints: ["pa-snap", "pa-medicaid"],
  },
  {
    id: "pa-school-meals",
    name: "School Meals (Free Breakfast for All + Free/Reduced Lunch)",
    shortName: "PA School Meals",
    state: "PA",
    category: "education",
    summary:
      "Every Pennsylvania public school student gets free breakfast, no income test, under the state's universal breakfast program. Free or reduced-price lunch depends on income — and families on SNAP or TANF qualify automatically.",
    agencyName: "PA Department of Education",
    applyUrl: "https://www.pa.gov/agencies/education/programs-and-services/schools/food-and-nutrition.html",
    sourceUrl: "https://www.pa.gov/agencies/education/programs-and-services/schools/food-and-nutrition.html",
    lastVerified: "2026-07-19",
    supersedes: ["us-nslp"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Lunch: 130% free / 185% reduced (federal NSLP lines); breakfast is
      // free for every student regardless of income (state-funded).
      maxIncomePctFPL: 185,
      categoricalRequirements: [{ type: "schoolAgeChild" }],
      requireAllCategorical: true,
      incomeWaivedByFlags: ["receivesSnap", "receivesTanf"],
    },
    estimatedAnnualValueMin: 400,
    estimatedAnnualValueMax: 1600,
    estimatedTimeToBenefitWeeksMin: 0,
    estimatedTimeToBenefitWeeksMax: 1,
    cascadeHints: ["pa-snap", "pa-wic"],
  },
  {
    id: "pa-ssi-ssp",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income + PA State Supplement",
    shortName: "SSI/SSP",
    state: "PA",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources. Pennsylvania adds a small state supplement on top of the federal payment.",
    agencyName: "Social Security Administration + PA DHS",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://www.ssa.gov/pubs/EN-05-11150.pdf",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // 2026: federal FBR $994 + PA SSP $22.10 (individual living
      // independently) ≈ $1,016.
      maxIncomeFlatDollar: 1016,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["pa-medicaid", "pa-snap", "pa-ptrr", "pa-pace"],
  },
  {
    id: "pa-ptrr",
    equivalentKey: "state-property-tax-relief",
    name: "Property Tax/Rent Rebate",
    shortName: "PTRR",
    state: "PA",
    category: "housing",
    summary:
      "A yearly rebate of up to $1,000 on property taxes OR rent for Pennsylvanians 65+, widows/widowers 50+, and people with disabilities 18+. Renters qualify too — and only half of Social Security counts toward the income limit.",
    agencyName: "PA Department of Revenue",
    applyUrl: "https://www.pa.gov/agencies/revenue/ptrr",
    sourceUrl: "https://www.pa.gov/agencies/revenue/ptrr",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // 2026 income limit (indexed annually): $48,110, homeowners and renters
      // alike. Half of Social Security is excluded from the count.
      maxIncomeFlatDollar: 48110,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
      // Homeowners AND renters both qualify — no housingTenure requirement.
    },
    estimatedAnnualValueMin: 380,
    estimatedAnnualValueMax: 1500,
    estimatedTimeToBenefitWeeksMin: 8,
    estimatedTimeToBenefitWeeksMax: 24,
    cascadeHints: ["pa-pace", "pa-ssi-ssp"],
  },
  {
    id: "pa-pace",
    equivalentKey: "state-senior-pharma",
    name: "PACE / PACENET Prescription Assistance",
    shortName: "PACE/PACENET",
    state: "PA",
    category: "health",
    summary:
      "Low-cost prescription drugs for Pennsylvanians 65+ — copays run about $6 to $15. Funded by the Pennsylvania Lottery. The income ceiling rose on July 1, 2026 to $45,000 for a single person ($55,000 married).",
    agencyName: "PA Department of Aging",
    applyUrl: "https://www.pa.gov/services/aging/apply-for-the-pharmaceutical-assistance-contract-for-the-elderly",
    sourceUrl: "https://www.pa.gov/agencies/aging/aging-programs-and-services/pace-program",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // PACENET single-person ceiling effective 7/1/2026 (SB 731 of 2025):
      // $45,000 single; married $55,000 not modeled (no marital-status field).
      maxIncomeFlatDollar: 45000,
      categoricalRequirements: [{ type: "age65Plus" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 300,
    estimatedAnnualValueMax: 2500,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["pa-ptrr", "pa-ssi-ssp"],
  },
  {
    id: "pa-tax-forgiveness",
    name: "PA Tax Forgiveness (Schedule SP)",
    shortName: "Tax Forgiveness",
    state: "PA",
    category: "tax",
    summary:
      "Pennsylvania has no state EITC — instead, lower-income workers can get some or all of their state income tax back through Tax Forgiveness. Retirees and families with dependents often qualify without knowing it; you must file a PA-40 with Schedule SP to claim it.",
    agencyName: "PA Department of Revenue",
    applyUrl: "https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/tax-forgiveness",
    sourceUrl: "https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/tax-forgiveness",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Statutory eligibility-income ceilings (partial forgiveness ends):
      // single $8,750 / married $17,500, plus $9,500 per dependent child.
      kidCountIncomeTiers: [
        { atLeastKids: 0, maxAnnualSingle: 8750, maxAnnualJoint: 17500 },
        { atLeastKids: 1, maxAnnualSingle: 18250, maxAnnualJoint: 27000 },
        { atLeastKids: 2, maxAnnualSingle: 27750, maxAnnualJoint: 36500 },
        { atLeastKids: 3, maxAnnualSingle: 37250, maxAnnualJoint: 46000 },
      ],
      categoricalRequirements: [{ type: "filesTaxes" }],
      requireAllCategorical: true,
    },
    // PA's flat 3.07% tax on qualifying income, refunded in full or part.
    estimatedAnnualValueMin: 100,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["pa-snap"],
  },
  {
    id: "pa-pennie",
    equivalentKey: "state-marketplace-subsidy",
    name: "Pennie Marketplace Savings",
    shortName: "Pennie Subsidy",
    state: "PA",
    category: "health",
    summary:
      "Lowers your monthly premium for a plan bought through Pennie, Pennsylvania's own health insurance marketplace, if you earn too much for Medical Assistance. The federal 400% of poverty cap is back for 2026 plans.",
    agencyName: "Pennie (PA's official marketplace)",
    applyUrl: "https://pennie.com/",
    sourceUrl: "https://pennie.com/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Expansion state: Medical Assistance covers below 138%; the enhanced-
      // subsidy era ended 12/31/2025 so the 400% FPL cliff applies for 2026.
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
    cascadeHints: ["pa-medicaid"],
  },
];
