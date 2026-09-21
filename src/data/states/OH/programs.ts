import type { Program } from "@/lib/types";

// Rules-as-data: Ohio pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. Ohio is a Medicaid expansion state, and its SNAP rule is unusually
// generous: categorical eligibility waives the 130% gross test entirely for
// households up to 200% of poverty, with no resource limit at all.

const OHIO_BENEFITS = "https://ssp.benefits.ohio.gov/";
// One application covers HEAP, the Winter Crisis Program and PIPP Plus.
const ENERGY_APPLICATION =
  "https://dam.assets.ohio.gov/image/upload/v1750956199/development.ohio.gov/individual/energyassistance/2025-2026_HEAP_application_B_W.pdf";
const ENERGY_PLAN =
  "https://dam.assets.ohio.gov/image/upload/v1752492359/development.ohio.gov/individual/energyassistance/Draft_PY_2025-2026_HEAP_State_Plan.pdf";
// The federal MAGI table is the published source for every state's Medicaid and
// CHIP thresholds; Ohio's own figures below add the 5-point disregard to it.
const MAGI_TABLE =
  "https://www.medicaid.gov/medicaid/national-medicaid-chip-program-information/medicaid-childrens-health-insurance-program-basic-health-program-eligibility-levels";

export const OH_PROGRAMS: Program[] = [
  {
    id: "oh-snap",
    name: "Ohio SNAP (Food Assistance)",
    shortName: "OH SNAP",
    state: "OH",
    category: "food",
    summary:
      "Monthly money on an Ohio Direction Card for groceries. Ohio's line is one of the highest in the country — 200% of the poverty level — and there's no savings or car limit at all.",
    agencyName: "Ohio Department of Job and Family Services",
    applyUrl: OHIO_BENEFITS,
    sourceUrl: "https://codes.ohio.gov/ohio-administrative-code/rule-5101:4-2-02",
    lastVerified: "2026-09-20",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // OAC 5101:4-2-02 (eff. 10-1-2024): an assistance group at or below 200%
      // FPL is categorically eligible, which waives the 130% gross limit, the
      // net income limit AND the resource limit. No assetLimitDollar on purpose.
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["oh-medicaid", "oh-wic", "oh-heap", "oh-owf"],
  },
  {
    id: "oh-medicaid",
    name: "Ohio Medicaid",
    shortName: "OH Medicaid",
    state: "OH",
    category: "health",
    summary:
      "Free or low-cost health coverage. Ohio expanded Medicaid, so adults qualify up to 138% of the poverty level — and pregnancy coverage reaches 205%.",
    agencyName: "Ohio Department of Medicaid",
    applyUrl: OHIO_BENEFITS,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table lists Ohio at 133% expansion / 200% pregnancy; both get
      // the standard 5-percentage-point disregard, so 138% and 205% apply.
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 205,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["oh-snap", "oh-healthy-start", "oh-wic"],
  },
  {
    id: "oh-healthy-start",
    name: "Healthy Start (Children's Coverage)",
    shortName: "Healthy Start",
    state: "OH",
    category: "health",
    summary:
      "Health coverage for Ohio kids up to 211% of the poverty level — roughly $67,000 for a family of four — with no premium for most families and no savings test.",
    agencyName: "Ohio Department of Medicaid",
    applyUrl: OHIO_BENEFITS,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: Ohio children 0-18 at 206% + 5-point disregard = 211%.
      maxIncomePctFPL: 211,
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
    cascadeHints: ["oh-medicaid", "oh-wic", "oh-snap"],
  },
  {
    id: "oh-owf",
    equivalentKey: "state-tanf",
    name: "Ohio Works First (Cash Assistance)",
    shortName: "OWF",
    state: "OH",
    category: "cash",
    summary:
      "Monthly cash for families with children and very little income. Ohio sets the entry line at half the poverty level and re-indexes it every July.",
    agencyName: "Ohio Department of Job and Family Services",
    applyUrl: OHIO_BENEFITS,
    sourceUrl: "https://codes.ohio.gov/ohio-administrative-code/rule-5101:1-23-20",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // OAC 5101:1-23-20: initial eligibility is 50% of the federal poverty
      // guidelines (ORC 5107.10), re-indexed effective July 1 each year.
      maxIncomePctFPL: 50,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 2400,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["oh-snap", "oh-medicaid"],
  },
  {
    id: "oh-heap",
    name: "Home Energy Assistance Program (HEAP)",
    shortName: "OH HEAP",
    state: "OH",
    category: "energy",
    summary:
      "A once-a-year credit on your heating bill, plus emergency help if you've been shut off or are close to it. Ohio's line is 175% of the poverty level.",
    agencyName: "Ohio Department of Development",
    applyUrl: ENERGY_APPLICATION,
    sourceUrl: ENERGY_PLAN,
    lastVerified: "2026-09-20",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // PY 2025-2026 HEAP state plan: 175% FPG for households of 1-8; larger
      // households are measured against 60% of state median income instead.
      maxIncomePctFPL: 175,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 800,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 10,
    cascadeHints: ["oh-pipp", "oh-snap"],
  },
  {
    id: "oh-pipp",
    name: "PIPP Plus (Percentage of Income Payment Plan)",
    shortName: "PIPP Plus",
    state: "OH",
    category: "energy",
    summary:
      "Instead of paying what the meter says, you pay a set share of your income each month — and paying on time chips away at what you already owe. Same 175% of poverty line as HEAP, same application.",
    agencyName: "Ohio Department of Development",
    applyUrl: ENERGY_APPLICATION,
    sourceUrl: ENERGY_PLAN,
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // Same 175% FPG income test as HEAP; PIPP Plus is on the same form.
      maxIncomePctFPL: 175,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 300,
    estimatedAnnualValueMax: 1500,
    estimatedTimeToBenefitWeeksMin: 3,
    estimatedTimeToBenefitWeeksMax: 10,
    cascadeHints: ["oh-heap", "oh-snap"],
  },
  {
    id: "oh-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "OH",
    category: "food",
    summary:
      "Food benefits, nutrition help, and breastfeeding support for pregnant people, new parents, and kids under 5.",
    agencyName: "Ohio Department of Health",
    applyUrl: "https://odh.ohio.gov/know-our-programs/wic",
    sourceUrl: "https://odh.ohio.gov/know-our-programs/wic",
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
    cascadeHints: ["oh-snap", "oh-medicaid"],
  },
  {
    id: "oh-eitc",
    equivalentKey: "state-eitc",
    name: "Ohio Earned Income Tax Credit",
    shortName: "OH EITC",
    state: "OH",
    category: "tax",
    summary:
      "If you qualify for the federal EITC, Ohio adds 30% of it on your state return. It can erase what you owe the state, but unlike the federal credit it won't come back as a refund on its own.",
    agencyName: "Ohio Department of Taxation",
    applyUrl: "https://www.getyourrefund.org/",
    sourceUrl: "https://codes.ohio.gov/ohio-revised-code/section-5747.71",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // ORC 5747.71: 30% of the federal credit, nonrefundable (capped at tax
      // due). Eligibility tracks the federal EITC's TY2025 AGI ceilings.
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
    // 30% of the federal $649-$8,046 range, and only up to tax owed.
    estimatedAnnualValueMin: 195,
    estimatedAnnualValueMax: 2414,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    // Nonrefundable: worth nothing if you owe no Ohio tax, so never "likely".
    confidenceCap: "possible",
    cascadeHints: ["oh-snap"],
  },
  {
    id: "oh-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Marketplace Premium Savings",
    shortName: "OH Marketplace",
    state: "OH",
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
      // Expansion state: Medicaid covers below 138%, so subsidies start there.
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
    cascadeHints: ["oh-medicaid"],
  },
];
