import type { Program } from "@/lib/types";

// Rules-as-data: Illinois pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. IL is an expansion state whose kids' coverage (All Kids) is open
// regardless of immigration status, and whose TANF is one of the few that
// rises automatically with the poverty level each October.

export const IL_PROGRAMS: Program[] = [
  {
    id: "il-snap",
    name: "Illinois SNAP",
    shortName: "IL SNAP",
    state: "IL",
    category: "food",
    summary:
      "Monthly money on a Link card to help buy groceries. Illinois' income line is 165% of the poverty level for most households — higher (200%) if anyone is 60+ or disabled.",
    agencyName: "Illinois Department of Human Services",
    applyUrl: "https://abe.illinois.gov/",
    sourceUrl: "https://www.dhs.state.il.us/page.aspx?item=21738",
    lastVerified: "2026-07-19",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // IDHS WAG 25-03-02 (effective Oct 1, 2025): 165% FPL gross for most
      // households; 200% when a member is 60+ or disabled.
      maxIncomePctFPL: 165,
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
    cascadeHints: ["il-medicaid", "il-wic", "il-liheap", "il-tanf"],
  },
  {
    id: "il-medicaid",
    name: "Illinois Medicaid",
    shortName: "IL Medicaid",
    state: "IL",
    category: "health",
    summary:
      "Free or low-cost health coverage for Illinoisans with lower incomes. Illinois expanded Medicaid, so adults qualify up to 138% of the poverty level — and the Moms & Babies program covers pregnancy up to 213%.",
    agencyName: "IL Dept. of Healthcare and Family Services",
    applyUrl: "https://abe.illinois.gov/",
    sourceUrl: "https://hfs.illinois.gov/medicalclients/maternal.html",
    lastVerified: "2026-07-19",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 138% FPL MAGI adults; Moms & Babies covers pregnancy to 213% FPL
      // (208% + 5% disregard, IDHS PM 06-09-03).
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 213,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["il-snap", "il-all-kids", "il-wic"],
  },
  {
    id: "il-all-kids",
    name: "All Kids (Children's Coverage)",
    shortName: "All Kids",
    state: "IL",
    category: "health",
    summary:
      "Health coverage for Illinois kids under 19, up to 318% of the poverty level (about $99,000 for a family of four) — and open to every child regardless of immigration status, with no asset test.",
    agencyName: "IL Dept. of Healthcare and Family Services",
    applyUrl: "https://abe.illinois.gov/",
    sourceUrl: "https://hfs.illinois.gov/medicalprograms/allkids/income.html",
    lastVerified: "2026-07-19",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // All Kids Assist MAGI standard: 318% FPL (313% + 5% disregard).
      maxIncomePctFPL: 318,
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
    cascadeHints: ["il-medicaid", "il-wic"],
  },
  {
    id: "il-tanf",
    equivalentKey: "state-tanf",
    name: "TANF Cash Assistance",
    shortName: "IL TANF",
    state: "IL",
    category: "cash",
    summary:
      "Monthly cash assistance for families with children who have very little or no income. Illinois is one of the few states whose grant rises with the poverty level every October — about $753 a month for a family of three this year.",
    agencyName: "Illinois Department of Human Services",
    applyUrl: "https://abe.illinois.gov/",
    sourceUrl: "https://www.dhs.state.il.us/Page.aspx?item=30358",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // IL payment levels are set at 35% of the FPL (statutory step-ups,
      // IDHS MR #25.39 effective Oct 1, 2025); countable income must be
      // below the payment level, so 35% FPL is the eligibility ceiling.
      // No asset test (eliminated in 2013).
      maxIncomePctFPL: 35,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 9000,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["il-snap", "il-medicaid"],
  },
  {
    id: "il-liheap",
    name: "Low Income Home Energy Assistance Program",
    shortName: "IL LIHEAP",
    state: "IL",
    category: "energy",
    summary:
      "Help paying heating and electric bills through local agencies. Seasonal, first-come first-served — application months are assigned, with seniors and people with disabilities going first each fall.",
    agencyName: "IL Dept. of Commerce & Economic Opportunity",
    applyUrl: "https://helpillinoisfamilies.com/",
    sourceUrl: "https://dceo.illinois.gov/communityservices/utilitybillassistance/howtoapply.html",
    lastVerified: "2026-07-19",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Illinois tests LIHEAP against 60% of State Median Income — the
      // FFY2026 annual figures (LIHEAP Clearinghouse, ACF) divided by 12.
      maxIncomeSizeTable: {
        1: 3331.58,
        2: 4356.75,
        3: 5381.83,
        4: 6407.0,
        5: 7432.08,
        6: 8457.17,
        7: 8649.38,
        8: 8841.59,
      },
      sizeTableExtraPerPerson: 192.21,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["il-snap"],
  },
  {
    id: "il-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "IL",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "Illinois Department of Human Services",
    applyUrl: "https://www.dhs.state.il.us/page.aspx?item=30513",
    sourceUrl: "https://www.dhs.state.il.us/page.aspx?item=30513",
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
    cascadeHints: ["il-snap", "il-medicaid"],
  },
  {
    id: "il-ssi",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income",
    shortName: "SSI",
    state: "IL",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources. SSI in Illinois also connects you to Medicaid and (via AABD) possible extra state help.",
    agencyName: "Social Security Administration",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://www.ssa.gov/benefits/ssi/",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // 2026 Federal Benefit Rate (IL's AABD supplement varies case-by-case
      // and isn't modeled).
      maxIncomeFlatDollar: 994,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["il-snap", "il-benefit-access", "il-senior-freeze"],
  },
  {
    id: "il-eitc",
    equivalentKey: "state-eitc",
    name: "Illinois Earned Income Tax Credit + Child Tax Credit",
    shortName: "IL EITC",
    state: "IL",
    category: "tax",
    summary:
      "Extra cash back on your state return — 20% of your federal EITC, plus an Illinois Child Tax Credit worth 40% of your IL EITC if you have kids under 12. Illinois also extends it to ITIN filers and workers 18-24 without kids, who can't get the federal credit.",
    agencyName: "Illinois Department of Revenue",
    applyUrl: "https://tax.illinois.gov/programs/eitc.html",
    sourceUrl: "https://tax.illinois.gov/programs/eitc.html",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Tracks the federal EITC's tax-year-2025 AGI ceilings (IRS tables,
      // already verified for us-eitc); IL broadens who can claim, never narrows.
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
    // 2025 IL EITC maximums: $130 (no kids) to $1,609 (3+ kids), per IDOR.
    estimatedAnnualValueMin: 130,
    estimatedAnnualValueMax: 1609,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["il-snap"],
  },
  {
    id: "il-benefit-access",
    name: "Benefit Access Program (Free Transit + Plate Discount)",
    shortName: "Benefit Access",
    state: "IL",
    category: "cash",
    summary:
      "An Illinois-only deal for seniors 65+ and people with disabilities: free rides on participating transit systems (including CTA, Metra, and Pace) and a discounted license plate renewal.",
    agencyName: "Illinois Department on Aging",
    applyUrl: "https://ilaging.illinois.gov/benefitsaccess.html",
    sourceUrl: "https://ilaging.illinois.gov/benefitsaccess.html",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 2026 annual limits ($33,562 / $44,533 / $55,500 for 1/2/3-person
      // households) expressed monthly for the engine.
      maxIncomeSizeTable: {
        1: 2796.83,
        2: 3711.08,
        3: 4625.0,
      },
      sizeTableExtraPerPerson: 913,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1500,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["il-ssi", "il-senior-freeze"],
  },
  {
    id: "il-senior-freeze",
    equivalentKey: "state-property-tax-relief",
    name: "Low-Income Senior Citizens Assessment Freeze",
    shortName: "IL Senior Freeze",
    state: "IL",
    category: "housing",
    summary:
      "Freezes the assessed value of your home so rising property values don't raise your taxes, for homeowners 65+ with household income of $65,000 or less. The limit is set to rise to $75,000 for tax year 2026 (payable 2027).",
    agencyName: "County Assessor / Illinois Department of Revenue",
    applyUrl: "https://tax.illinois.gov/localgovernments/property/taxrelief.html",
    sourceUrl: "https://tax.illinois.gov/localgovernments/property/taxrelief.html",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // 2025 tax year (payable 2026) limit: $65,000 household income; Public
      // Act 104-0452 raises it to $75,000 starting tax year 2026.
      maxIncomeFlatDollar: 65000,
      categoricalRequirements: [{ type: "age65Plus" }],
      requireAllCategorical: true,
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["own"], label: "you own your home" },
      ],
    },
    estimatedAnnualValueMin: 300,
    estimatedAnnualValueMax: 2000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["il-benefit-access", "il-ssi"],
  },
  {
    id: "il-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Get Covered Illinois Marketplace Savings",
    shortName: "GCI Subsidy",
    state: "IL",
    category: "health",
    summary:
      "Lowers your monthly premium for a plan bought through Get Covered Illinois — the state's own marketplace as of 2026 — if you earn too much for Medicaid. The federal 400% of poverty cap is back for 2026 plans.",
    agencyName: "Get Covered Illinois",
    applyUrl: "https://getcovered.illinois.gov/",
    sourceUrl: "https://getcovered.illinois.gov/get-started/about-the-marketplace.html",
    lastVerified: "2026-07-19",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Expansion state: Medicaid covers below 138%; the enhanced-subsidy era
      // ended 12/31/2025 so the 400% FPL cliff applies for 2026.
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
    cascadeHints: ["il-medicaid"],
  },
];
