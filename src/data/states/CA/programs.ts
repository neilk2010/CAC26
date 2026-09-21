import type { Program } from "@/lib/types";

// Rules-as-data: California demo pack.
// Figures are general-information approximations for education purposes only —
// see Ground Rules in OpenDoor_feature_plan.md. Every program links to the
// official source and application so the agency makes the real determination.
// Adding a new program = adding an entry here; the engine never hardcodes rules.

export const CA_PROGRAMS: Program[] = [
  {
    id: "ca-calfresh",
    name: "CalFresh (SNAP)",
    shortName: "CalFresh",
    state: "CA",
    category: "food",
    summary:
      "Monthly money on a debit-like card to help buy groceries. California's version of federal SNAP food stamps.",
    agencyName: "California Department of Social Services",
    applyUrl: "https://www.getcalfresh.org/",
    sourceUrl: "https://www.cdss.ca.gov/calfresh",
    lastVerified: "2026-07-04",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ca-medi-cal", "ca-wic", "ca-school-meals", "ca-calworks"],
  },
  {
    id: "ca-medi-cal",
    name: "Medi-Cal",
    shortName: "Medi-Cal",
    state: "CA",
    category: "health",
    summary: "Free or low-cost health coverage for California residents with lower incomes.",
    agencyName: "California Dept. of Health Care Services",
    applyUrl: "https://www.coveredca.com/",
    sourceUrl: "https://www.dhcs.ca.gov/",
    lastVerified: "2026-07-04",
    supersedes: ["us-medicaid","us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // 138% FPL is the MAGI adult-expansion limit; kids qualify to ~266% FPL and
      // pregnancy coverage (via MCAP) extends to ~322% FPL — raise the ceiling
      // instead of screening those households out at the adult rate.
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5", "schoolAgeChild"],
      raisedMaxIncomePctFPL: 322,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ca-calfresh", "ca-wic", "ca-covered-ca"],
  },
  {
    id: "ca-liheap",
    name: "Low Income Home Energy Assistance Program",
    shortName: "LIHEAP",
    state: "CA",
    category: "energy",
    summary: "Help paying heating and cooling bills, plus free weatherization for your home.",
    agencyName: "CA Dept. of Community Services & Development",
    applyUrl: "https://www.csd.ca.gov/pages/liheap",
    sourceUrl: "https://www.csd.ca.gov/pages/liheap",
    lastVerified: "2026-07-04",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CA tests LIHEAP against the greater of 200% FPL or 60% State Median Income —
      // SMI is the binding (higher) limit in practice, so model that directly.
      maxIncomeSizeTable: {
        1: 3331.66,
        2: 4356.83,
        3: 5382.0,
        4: 6407.16,
        5: 7432.25,
        6: 8457.41,
        7: 8649.66,
        8: 8841.83,
      },
      sizeTableExtraPerPerson: 192.21,
      // LIHEAP is for households responsible for home energy costs (directly
      // or as part of rent).
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 8,
    cascadeHints: ["ca-lifeline", "ca-calfresh"],
  },
  {
    id: "ca-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "CA",
    category: "food",
    summary:
      "Food benefits, nutrition education, and support for pregnant people, new parents, and kids under 5.",
    agencyName: "California WIC Program (CDPH)",
    applyUrl: "https://www.myfamily.wic.ca.gov/",
    sourceUrl: "https://www.myfamily.wic.ca.gov/",
    lastVerified: "2026-07-04",
    supersedes: ["us-wic"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 185,
      categoricalRequirements: [{ type: "pregnantOrChildUnder5" }],
      requireAllCategorical: true,
      // Adjunctive eligibility: already receiving SNAP/CalFresh, Medi-Cal, or
      // CalWORKs automatically meets WIC's income test (federal WIC rule).
      incomeWaivedByFlags: ["receivesSnap", "receivesMedicaid", "receivesTanf"],
    },
    estimatedAnnualValueMin: 600,
    estimatedAnnualValueMax: 1600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    cascadeHints: ["ca-calfresh", "ca-medi-cal"],
  },
  {
    id: "ca-calworks",
    equivalentKey: "state-tanf",
    name: "California Work Opportunity and Responsibility to Kids",
    shortName: "CalWORKs",
    state: "CA",
    category: "cash",
    summary: "Monthly cash aid for families with children who have very low or no income.",
    agencyName: "California Department of Social Services",
    applyUrl: "https://benefitscal.com/",
    sourceUrl: "https://www.cdss.ca.gov/calworks",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CalWORKs isn't a flat % of FPL — entry uses the Minimum Basic Standard of
      // Adequate Care (MBSAC), a gross-income table by family size (Region 1, FY25-26).
      maxIncomeSizeTable: {
        1: 930,
        2: 1526,
        3: 1892,
        4: 2244,
        5: 2561,
        6: 2880,
        7: 3166,
        8: 3445,
      },
      sizeTableExtraPerPerson: 279,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 2000,
    estimatedAnnualValueMax: 14000,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ca-calfresh", "ca-medi-cal", "ca-school-meals"],
  },
  {
    id: "ca-school-meals",
    name: "California Universal School Meals",
    shortName: "School Meals",
    state: "CA",
    category: "education",
    summary:
      "Every California public school student eats breakfast and lunch free — no income test, no application, since 2022.",
    agencyName: "California Department of Education",
    applyUrl: "https://www.cde.ca.gov/ls/nu/sn/universalmealsfaq.asp",
    sourceUrl: "https://www.cde.ca.gov/ls/nu/sn/universalmealsfaq.asp",
    lastVerified: "2026-07-04",
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
    cascadeHints: ["ca-calfresh", "ca-wic"],
  },
  {
    id: "ca-ssi-ssp",
    equivalentKey: "us-ssi",
    name: "Supplemental Security Income / State Supplementary Payment",
    shortName: "SSI/SSP",
    state: "CA",
    category: "cash",
    summary:
      "Monthly cash payment for people who are 65+, blind, or disabled and have limited income and resources.",
    agencyName: "Social Security Administration + CA SSP",
    applyUrl: "https://www.ssa.gov/benefits/ssi/",
    sourceUrl: "https://www.ssa.gov/benefits/ssi/",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // Combined federal SSI + CA state supplement (SSP) max for an individual living
      // independently, effective 1/1/2026.
      maxIncomeFlatDollar: 1234,
      assetLimitDollar: 2000,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["ca-medi-cal", "ca-calfresh"],
  },
  {
    id: "ca-capi",
    name: "Cash Assistance Program for Immigrants",
    shortName: "CAPI",
    state: "CA",
    category: "cash",
    summary:
      "State-funded cash aid for older or disabled immigrants who don't qualify for SSI because of immigration status.",
    agencyName: "California Department of Social Services",
    applyUrl: "https://www.cdss.ca.gov/capi",
    sourceUrl: "https://www.cdss.ca.gov/capi",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      // CAPI is designed to mirror SSI/SSP payment standards exactly.
      maxIncomeFlatDollar: 1234,
      assetLimitDollar: 2000,
      // Real CAPI eligibility is (65+ or disabled) AND excluded from SSI on
      // immigration-status grounds — the any-of/all-of schema here can't
      // express that nested AND/OR, and the "immigrants" scope's coverage of
      // this question doesn't depend on CAPI anyway (see scope-explicit
      // immigrants.status question in data/questions/scopes.ts, which works
      // for every state — CAPI only exists in the CA pack).
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 6000,
    estimatedAnnualValueMax: 13000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 16,
    cascadeHints: ["ca-medi-cal"],
  },
  {
    id: "ca-lifeline",
    equivalentKey: "state-lifeline",
    name: "California LifeLine",
    shortName: "CA LifeLine",
    state: "CA",
    category: "phone-internet",
    summary: "A discount on your monthly phone or internet bill.",
    agencyName: "California Public Utilities Commission",
    applyUrl: "https://www.californialifeline.com/",
    sourceUrl: "https://www.californialifeline.com/",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      maxIncomePctFPL: 150,
      categoricalRequirements: [],
      requireAllCategorical: false,
      // Program-based eligibility: CA LifeLine also qualifies households already
      // on CalFresh/SNAP, Medi-Cal, or SSI regardless of income.
      incomeWaivedByFlags: ["receivesSnap", "receivesMedicaid", "receivesSsi"],
    },
    estimatedAnnualValueMin: 120,
    estimatedAnnualValueMax: 240,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 3,
    cascadeHints: ["ca-liheap", "ca-calfresh"],
  },
  {
    id: "ca-eitc",
    equivalentKey: "state-eitc",
    name: "California Earned Income Tax Credit + Young Child Tax Credit",
    shortName: "CalEITC",
    state: "CA",
    category: "tax",
    summary:
      "Extra cash back when you file your state tax return, if you worked and had lower earnings. Bigger credit if you have a child under 6.",
    agencyName: "California Franchise Tax Board",
    applyUrl: "https://www.ftb.ca.gov/file/personal/credits/california-earned-income-tax-credit.html",
    sourceUrl: "https://www.ftb.ca.gov/file/personal/credits/california-earned-income-tax-credit.html",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // 2025 tax year — unlike federal/NJ EITC, CalEITC's earned-income ceiling
      // doesn't vary by number of qualifying children (only the credit amount does).
      maxIncomeFlatDollar: 32900,
      // Like the federal EITC: earned income + a filed state return.
      categoricalRequirements: [{ type: "filesTaxes" }],
      requireAllCategorical: true,
      fieldRequirements: [
        {
          field: "employmentStatus",
          oneOf: ["working", "selfEmployed"],
          label: "you have earnings from a job or self-employment",
        },
      ],
    },
    estimatedAnnualValueMin: 300,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["ca-calfresh"],
  },
  {
    id: "ca-county-ga",
    equivalentKey: "state-general-assistance",
    name: "County General Assistance",
    shortName: "General Assistance",
    state: "CA",
    category: "cash",
    summary:
      "A last-resort cash safety net run by your county for adults with little to no income who don't qualify for other cash aid. Amounts vary a lot by county.",
    agencyName: "County Department of Social Services",
    applyUrl: "https://www.cdss.ca.gov/county-offices",
    sourceUrl: "https://www.cdss.ca.gov/inforesources/general-assistance",
    lastVerified: "2025-02-01",
    rules: {
      incomeBasis: "net",
      incomePeriod: "monthly",
      maxIncomeFlatDollar: 700,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 7200,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["ca-calfresh", "ca-medi-cal"],
  },
  {
    id: "ca-ptp",
    equivalentKey: "state-property-tax-relief",
    name: "Property Tax Postponement",
    shortName: "Property Tax Postponement",
    state: "CA",
    category: "housing",
    summary:
      "Lets homeowners who are 65+ or disabled delay paying property taxes until the home is sold or transferred. Also requires meaningful equity in the home.",
    agencyName: "California State Controller's Office",
    applyUrl: "https://www.sco.ca.gov/ardtax_prop_tax_postponement.html",
    sourceUrl: "https://www.sco.ca.gov/ardtax_prop_tax_postponement.html",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      maxIncomeFlatDollar: 55181,
      categoricalRequirements: [{ type: "age65Plus" }, { type: "disabled" }],
      requireAllCategorical: false,
      // PTP postpones property tax on a home you own and live in.
      fieldRequirements: [
        { field: "housingTenure", oneOf: ["own"], label: "you own your home" },
      ],
    },
    estimatedAnnualValueMin: 500,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 10,
    cascadeHints: [],
  },
  {
    id: "ca-covered-ca",
    equivalentKey: "state-marketplace-subsidy",
    name: "Covered California Premium Assistance",
    shortName: "Covered CA Subsidy",
    state: "CA",
    category: "health",
    summary:
      "Lowers your monthly health insurance premium if you buy a plan through California's marketplace and earn too much for Medi-Cal.",
    agencyName: "Covered California",
    applyUrl: "https://www.coveredca.com/",
    sourceUrl: "https://www.coveredca.com/",
    lastVerified: "2026-07-04",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Federal enhanced subsidies (ARPA/IRA, which removed the 400% FPL cliff)
      // expired 12/31/2025 and the hard cutoff returned for 2026. CA's own state
      // subsidy only reaches ~150-165% FPL, so it doesn't extend this ceiling further.
      minIncomePctFPL: 138,
      maxIncomePctFPL: 400,
      categoricalRequirements: [],
      requireAllCategorical: false,
      // Marketplace subsidies are for people without another affordable
      // coverage option — the real ACA "firewall" rule. Doesn't touch
      // Medi-Cal, which has no such exclusion.
      disqualifyingFlags: ["hasOtherHealthCoverage"],
    },
    estimatedAnnualValueMin: 1000,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["ca-medi-cal"],
  },
];
