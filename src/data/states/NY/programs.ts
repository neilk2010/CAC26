import type { Program } from "@/lib/types";

// Rules-as-data: New York pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. NY is an expansion state with several programs most states don't have
// (Essential Plan, universal school meals, a state SSI supplement); the
// Essential Plan's July 2026 cut from 250% to 200% FPL is reflected here.

export const NY_PROGRAMS: Program[] = [
  {
    id: "ny-snap",
    name: "New York SNAP",
    shortName: "NY SNAP",
    state: "NY",
    category: "food",
    summary:
      "Monthly money on an EBT card to help buy groceries. New York's income lines are tiered: higher if anyone works, highest if the household includes someone 60+ or disabled — and there's no savings test for most households.",
    agencyName: "NY Office of Temporary and Disability Assistance",
    applyUrl: "https://mybenefits.ny.gov/",
    sourceUrl: "https://otda.ny.gov/programs/snap/",
    lastVerified: "2026-07-19",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // OTDA's three-tier structure (effective Oct 1, 2025): 130% FPL with no
      // earned income, 150% with earned income, 200% for households with a
      // member 60+/disabled or with dependent-care costs. 150% is modeled as
      // the base (most applicants have earnings); the 200% tier is raised via
      // flags. "The only way to know is to apply" — OTDA.
      maxIncomePctFPL: 150,
      raisedIncomeLimitFlags: ["age65Plus", "disabled"],
      raisedMaxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ny-medicaid", "ny-wic", "ny-heap", "ny-family-assistance"],
  },
  {
    id: "ny-medicaid",
    name: "New York Medicaid",
    shortName: "NY Medicaid",
    state: "NY",
    category: "health",
    summary:
      "Free or very low-cost health coverage for New Yorkers with lower incomes. New York expanded Medicaid, so adults qualify up to 138% of the poverty level — and kids and pregnant New Yorkers qualify at much higher incomes.",
    agencyName: "NY State of Health / NYS Department of Health",
    applyUrl: "https://nystateofhealth.ny.gov/",
    sourceUrl: "https://info.nystateofhealth.ny.gov/",
    lastVerified: "2026-07-19",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 138% FPL MAGI adults; pregnancy coverage reaches 223% and kids route
      // to Child Health Plus (its own entry, to 400%) — raise the ceiling
      // rather than screening those households out at the adult rate.
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 223,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ny-snap", "ny-essential-plan", "ny-child-health-plus"],
  },
  {
    id: "ny-essential-plan",
    name: "Essential Plan",
    shortName: "Essential Plan",
    state: "NY",
    category: "health",
    summary:
      "A New York-only health plan with $0 monthly premium and very low costs, for adults who earn a bit too much for Medicaid. Honest note: as of July 1, 2026 the income cutoff dropped from 250% to 200% of the poverty level — if you were covered under the old limit, check your renewal carefully.",
    agencyName: "NY State of Health",
    applyUrl: "https://nystateofhealth.ny.gov/",
    sourceUrl: "https://info.nystateofhealth.ny.gov/EssentialPlan",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Medicaid covers below 138%; EP picks up from there to 200% FPL
      // (reduced from 250% effective 7/1/2026 per NYS budget action).
      minIncomePctFPL: 138,
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 2000,
    estimatedAnnualValueMax: 7000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ny-medicaid", "ny-marketplace"],
  },
  {
    id: "ny-child-health-plus",
    name: "Child Health Plus",
    shortName: "CHPlus",
    state: "NY",
    category: "health",
    summary:
      "Health coverage for every New York kid under 19 — free below about 222% of the poverty level, then affordable sliding-scale premiums all the way up to 400%. No child in NY should be uninsured.",
    agencyName: "NY State of Health / NYS Department of Health",
    applyUrl: "https://nystateofhealth.ny.gov/",
    sourceUrl: "https://www.health.ny.gov/health_care/child_health_plus/eligibility_and_cost.htm",
    lastVerified: "2026-07-19",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Subsidized CHPlus reaches 400% FPL (2026 NY State of Health income
      // levels); free under ~2.2x poverty, premiums above.
      maxIncomePctFPL: 400,
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
    cascadeHints: ["ny-medicaid", "ny-school-meals"],
  },
  {
    id: "ny-family-assistance",
    equivalentKey: "state-tanf",
    name: "Family Assistance (Temporary Assistance)",
    shortName: "NY Family Assistance",
    state: "NY",
    category: "cash",
    summary:
      "Monthly cash assistance for families with children who have very little or no income. Amounts and income cutoffs vary by county — for a family of three in NYC the standard is about $789 a month — so your local social services district makes the call.",
    agencyName: "NY OTDA / Local Department of Social Services",
    applyUrl: "https://mybenefits.ny.gov/",
    sourceUrl: "https://otda.ny.gov/programs/temporary-assistance/",
    lastVerified: "2026-07-19",
    // County-varying shelter allowances mean we can't promise "likely."
    confidenceCap: "possible",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // The statewide standard of need varies by county (shelter maximums
      // differ). Anchored here to the documented NYC family-of-3 standard
      // (~$789/month, unchanged since 2012) with a rough per-person step —
      // combined with the "possible" cap this screens out clearly-over-income
      // households without ever promising eligibility.
      maxIncomeSizeTable: { 3: 789 },
      sizeTableExtraPerPerson: 120,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 9500,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ny-snap", "ny-medicaid", "ny-heap"],
  },
  {
    id: "ny-heap",
    name: "Home Energy Assistance Program",
    shortName: "NY HEAP",
    state: "NY",
    category: "energy",
    summary:
      "Help paying heating bills (and a summer cooling benefit for eligible households). Seasonal — the regular benefit opens each fall and closes in spring, so mark the calendar.",
    agencyName: "NY Office of Temporary and Disability Assistance",
    applyUrl: "https://mybenefits.ny.gov/",
    sourceUrl: "https://otda.ny.gov/programs/heap/",
    lastVerified: "2026-07-19",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 2025-2026 HEAP monthly income limits, straight from OTDA's table.
      maxIncomeSizeTable: {
        1: 3473,
        2: 4542,
        3: 5611,
        4: 6680,
        5: 7749,
        6: 8818,
        7: 9018,
        8: 9218,
      },
      // Sizes 9-13 step ~$200; the +$687 step applies only past size 13.
      sizeTableExtraPerPerson: 200,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
      // SNAP, Temporary Assistance, or SSI (living alone) auto-qualify.
      incomeWaivedByFlags: ["receivesSnap", "receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["ny-snap"],
  },
  {
    id: "ny-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "NY",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "NYS Department of Health",
    applyUrl: "https://www.health.ny.gov/prevention/nutrition/wic/",
    sourceUrl: "https://www.health.ny.gov/prevention/nutrition/wic/",
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
    cascadeHints: ["ny-snap", "ny-medicaid"],
  },
  {
    id: "ny-school-meals",
    name: "New York Universal Free School Meals",
    shortName: "School Meals",
    state: "NY",
    category: "education",
    summary:
      "Every New York public school student eats breakfast and lunch free — no income test, no application, statewide since the 2025-26 school year.",
    agencyName: "NYS Education Department, Child Nutrition",
    applyUrl: "https://www.cn.nysed.gov/content/new-york-state-universal-free-meals",
    sourceUrl: "https://www.cn.nysed.gov/content/new-york-state-universal-free-meals",
    lastVerified: "2026-07-19",
    supersedes: ["us-nslp"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      categoricalRequirements: [{ type: "schoolAgeChild" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 800,
    estimatedAnnualValueMax: 1600,
    estimatedTimeToBenefitWeeksMin: 0,
    estimatedTimeToBenefitWeeksMax: 1,
    cascadeHints: ["ny-snap", "ny-wic"],
  },
  {
    id: "ny-ssi-ssp",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income + NY State Supplement",
    shortName: "SSI/SSP",
    state: "NY",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources. New York adds its own supplement on top of the federal payment ($87/month if you live alone).",
    agencyName: "Social Security Administration + NY OTDA",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://otda.ny.gov/programs/ssp/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // 2026: federal FBR $994 + NY SSP $87 (individual living alone) = $1,081.
      maxIncomeFlatDollar: 1081,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13500,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["ny-medicaid", "ny-snap", "ny-enhanced-star"],
  },
  {
    id: "ny-eitc",
    equivalentKey: "state-eitc",
    name: "New York State Earned Income Credit",
    shortName: "NY EITC",
    state: "NY",
    category: "tax",
    summary:
      "Extra cash back on your state tax return — 30% of your federal EITC — if you worked and had lower earnings. New York City residents can get an additional city credit on top.",
    agencyName: "NYS Department of Taxation and Finance",
    applyUrl: "https://www.tax.ny.gov/pit/credits/eitc.htm",
    sourceUrl: "https://www.tax.ny.gov/pit/credits/eitc.htm",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // NY EIC = 30% of the federal credit, so the federal EITC's tax-year-2025
      // AGI ceilings apply (IRS tables, already verified for us-eitc).
      kidCountIncomeTiers: [
        { atLeastKids: 0, maxAnnualSingle: 19104, maxAnnualJoint: 26214 },
        { atLeastKids: 1, maxAnnualSingle: 50434, maxAnnualJoint: 57554 },
        { atLeastKids: 2, maxAnnualSingle: 57310, maxAnnualJoint: 64430 },
        { atLeastKids: 3, maxAnnualSingle: 61555, maxAnnualJoint: 68675 },
      ],
      categoricalRequirements: [{ type: "filesTaxes" }],
      requireAllCategorical: true,
      fieldRequirements: [
        {
          field: "employmentStatus",
          oneOf: ["working", "selfEmployed"],
          label: "you have earnings from a job or self-employment",
        },
      ],
      disqualifyingFlags: ["investmentIncomeOverCap"],
    },
    // 30% of the federal credit range ($649-$8,046).
    estimatedAnnualValueMin: 195,
    estimatedAnnualValueMax: 2414,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["ny-snap"],
  },
  {
    id: "ny-enhanced-star",
    equivalentKey: "state-property-tax-relief",
    name: "Enhanced STAR (School Tax Relief for Seniors)",
    shortName: "Enhanced STAR",
    state: "NY",
    category: "housing",
    summary:
      "A bigger school-tax break for New York homeowners 65+ — worth hundreds to over a thousand dollars a year depending on your district. Starting 2026, the state auto-upgrades you from Basic STAR the year you turn 65 if your income qualifies.",
    agencyName: "NYS Department of Taxation and Finance",
    applyUrl: "https://www.tax.ny.gov/pit/property/star/",
    sourceUrl: "https://www.tax.ny.gov/pit/property/star/eligibility.htm",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // 2026-27 school year Enhanced STAR income limit (2024 AGI of all
      // owners + resident spouses).
      maxIncomeFlatDollar: 110750,
      categoricalRequirements: [{ type: "age65Plus" }],
      requireAllCategorical: true,
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["own"], label: "you own your home" },
      ],
    },
    estimatedAnnualValueMin: 400,
    estimatedAnnualValueMax: 1500,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["ny-ssi-ssp"],
  },
  {
    id: "ny-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "NY State of Health Marketplace Savings",
    shortName: "NYSOH Subsidy",
    state: "NY",
    category: "health",
    summary:
      "Lowers your monthly premium for a plan bought through New York's own marketplace, for households above the Essential Plan cutoff. The federal 400% of poverty cap is back for 2026 plans.",
    agencyName: "NY State of Health",
    applyUrl: "https://nystateofhealth.ny.gov/",
    sourceUrl: "https://info.nystateofhealth.ny.gov/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Below 200% the Essential Plan (its own entry) is the better door; the
      // enhanced-subsidy era ended 12/31/2025 so the 400% cliff applies.
      minIncomePctFPL: 200,
      maxIncomePctFPL: 400,
      categoricalRequirements: [],
      requireAllCategorical: false,
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 1000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ny-essential-plan"],
  },
];
