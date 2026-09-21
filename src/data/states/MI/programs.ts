import type { Program } from "@/lib/types";

// Rules-as-data: Michigan pack.
// Figures are general-information approximations for education purposes only —
// every number below was read from the named official source on the lastVerified
// date. Michigan publishes unusually precise policy manuals (BEM/RFT/ERM), so
// the cash and energy rules here are exact dollar tables rather than estimates.

const MI_BRIDGES = "https://newmibridges.michigan.gov/";
// The federal MAGI table is the published source for every state's Medicaid and
// CHIP thresholds; Michigan's figures below add the 5-point disregard.
const MAGI_TABLE =
  "https://www.medicaid.gov/medicaid/national-medicaid-chip-program-information/medicaid-childrens-health-insurance-program-basic-health-program-eligibility-levels";

export const MI_PROGRAMS: Program[] = [
  {
    id: "mi-fap",
    name: "Food Assistance Program (SNAP)",
    shortName: "MI FAP",
    state: "MI",
    category: "food",
    summary:
      "Monthly money on a Bridge Card for groceries — Michigan calls it FAP. Households up to 200% of the poverty level are categorically eligible, which means no savings limit and no separate income test.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: MI_BRIDGES,
    sourceUrl: "https://mdhhs-pres-prod.michigan.gov/olmweb/ex/BP/Public/BEM/213.pdf",
    lastVerified: "2026-09-20",
    // Replaces the federal baseline entry in this state — see states/index.ts.
    supersedes: ["us-snap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // BEM 213 (BPB 2026-003, eff. 2-1-2026): groups at or below 200% FPL are
      // categorically eligible and "automatically meet the asset and income
      // limits". The 130%/100% columns in RFT 250 apply only to groups that
      // aren't categorically eligible, so 200% is the operative ceiling.
      maxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
      incomeWaivedByFlags: ["receivesTanf", "receivesSsi"],
    },
    estimatedAnnualValueMin: 1200,
    estimatedAnnualValueMax: 3600,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["mi-medicaid", "mi-wic", "mi-ser-energy", "mi-fip"],
  },
  {
    id: "mi-medicaid",
    name: "Healthy Michigan Plan (Medicaid)",
    shortName: "MI Medicaid",
    state: "MI",
    category: "health",
    summary:
      "Free or low-cost health coverage. Michigan expanded Medicaid through the Healthy Michigan Plan, so adults qualify up to 138% of the poverty level — and pregnancy coverage reaches 200%.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: MI_BRIDGES,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-medicaid"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: Michigan expansion adults 133%, pregnancy 195%; both
      // plus the standard 5-percentage-point disregard.
      maxIncomePctFPL: 138,
      raisedIncomeLimitFlags: ["pregnantOrChildUnder5"],
      raisedMaxIncomePctFPL: 200,
      categoricalRequirements: [],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 3000,
    estimatedAnnualValueMax: 8000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["mi-fap", "mi-kids", "mi-wic"],
  },
  {
    id: "mi-kids",
    name: "Children's Health Coverage (MIChild)",
    shortName: "MI Kids",
    state: "MI",
    category: "health",
    summary:
      "Health coverage for Michigan kids up to 217% of the poverty level — roughly $69,000 for a family of four — with a low monthly premium and no savings test.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: MI_BRIDGES,
    sourceUrl: MAGI_TABLE,
    lastVerified: "2026-09-20",
    supersedes: ["us-chip"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // CMS MAGI table: Michigan children 0-18 at 212% + 5-point disregard.
      maxIncomePctFPL: 217,
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
    cascadeHints: ["mi-medicaid", "mi-wic", "mi-fap"],
  },
  {
    id: "mi-fip",
    equivalentKey: "state-tanf",
    name: "Family Independence Program (Cash)",
    shortName: "MI FIP",
    state: "MI",
    category: "cash",
    summary:
      "Monthly cash for families with children and very little income. Michigan compares your countable income to a payment standard — $583 a month for a group of three — and pays the difference.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: MI_BRIDGES,
    sourceUrl: "https://mdhhs-pres-prod.michigan.gov/olmweb/ex/rf/public/rft/210.pdf",
    lastVerified: "2026-09-20",
    rules: {
      // Countable income (after disregards) is measured against the payment
      // standard, so gross over the line is "borderline", never a hard fail.
      incomeBasis: "net",
      incomePeriod: "monthly",
      // RFT 210, eligible-grantee payment standard (effective 12/1/2024).
      maxIncomeSizeTable: {
        1: 363,
        2: 478,
        3: 583,
        4: 707,
        5: 822,
        6: 981,
        7: 1072,
        8: 1167,
      },
      sizeTableExtraPerPerson: 95,
      categoricalRequirements: [
        { type: "schoolAgeChild" },
        { type: "pregnantOrChildUnder5" },
      ],
      requireAllCategorical: false,
    },
    estimatedAnnualValueMin: 1800,
    estimatedAnnualValueMax: 6000,
    estimatedTimeToBenefitWeeksMin: 2,
    estimatedTimeToBenefitWeeksMax: 6,
    cascadeHints: ["mi-fap", "mi-medicaid"],
  },
  {
    id: "mi-ser-energy",
    name: "State Emergency Relief — Energy",
    shortName: "MI SER",
    state: "MI",
    category: "energy",
    summary:
      "Help with a heat or electric bill when you're shut off or about to be — and with water and sewer too. The line is 150% of the poverty level, about $1,956 a month for one person, and there's no copay for energy help.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: MI_BRIDGES,
    sourceUrl: "https://mdhhs-pres-prod.michigan.gov/olmweb/ex/er/public/erm/301.pdf",
    lastVerified: "2026-09-20",
    supersedes: ["us-liheap"],
    rules: {
      incomeBasis: "gross",
      incomePeriod: "monthly",
      // ERM 301/208 (eff. 10/1/2025): energy and water/sewer services use the
      // 150% FPL limits — $1,956/mo for one person up to $6,081/mo for seven,
      // plus $688 per additional member. No income copayment for energy.
      maxIncomePctFPL: 150,
      categoricalRequirements: [{ type: "paysHomeEnergy" }],
      requireAllCategorical: true,
    },
    estimatedAnnualValueMin: 200,
    estimatedAnnualValueMax: 1000,
    estimatedTimeToBenefitWeeksMin: 1,
    estimatedTimeToBenefitWeeksMax: 4,
    cascadeHints: ["mi-fap", "mi-fip"],
  },
  {
    id: "mi-wic",
    name: "Women, Infants & Children",
    shortName: "WIC",
    state: "MI",
    category: "food",
    summary:
      "Food benefits, nutrition help, and breastfeeding support for pregnant people, new parents, and kids under 5.",
    agencyName: "Michigan Department of Health and Human Services",
    applyUrl: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
    sourceUrl: "https://www.michigan.gov/mdhhs/assistance-programs/wic",
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
    cascadeHints: ["mi-fap", "mi-medicaid"],
  },
  {
    id: "mi-eitc",
    equivalentKey: "state-eitc",
    name: "Michigan Earned Income Tax Credit",
    shortName: "MI EITC",
    state: "MI",
    category: "tax",
    summary:
      "If you qualify for the federal EITC, Michigan adds 30% of it — and it's refundable, so it comes back as cash even if you owe the state nothing. You qualify automatically; you just have to file.",
    agencyName: "Michigan Department of Treasury",
    applyUrl: "https://www.getyourrefund.org/",
    sourceUrl: "https://www.michigan.gov/taxes/iit/tax-guidance/credits-exemptions/eitc",
    lastVerified: "2026-09-20",
    rules: {
      incomeBasis: "gross",
      incomePeriod: "annual",
      // Michigan's Working Families Tax Credit: 30% of the federal credit and
      // refundable. Eligibility tracks the federal EITC's TY2025 AGI ceilings.
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
    // 30% of the federal $649-$8,046 range, paid as a refund.
    estimatedAnnualValueMin: 195,
    estimatedAnnualValueMax: 2414,
    estimatedTimeToBenefitWeeksMin: 4,
    estimatedTimeToBenefitWeeksMax: 12,
    cascadeHints: ["mi-fap"],
  },
  {
    id: "mi-marketplace",
    equivalentKey: "state-marketplace-subsidy",
    name: "Marketplace Premium Savings",
    shortName: "MI Marketplace",
    state: "MI",
    category: "health",
    summary:
      "Lowers your monthly premium on a HealthCare.gov plan if you earn too much for the Healthy Michigan Plan. The 400% of poverty cap is back for 2026 plans.",
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
    cascadeHints: ["mi-medicaid"],
  },
];
