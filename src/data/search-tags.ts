// Synonym/tag index for universal search. Every target id MUST exist in the
// program catalog (src/data/**/programs.ts) or the scope registry — the
// palette drops anything it can't resolve, so a typo here is a silent miss.

export interface SearchTag {
  /** What a user might type — lowercase, natural phrasing. */
  phrase: string;
  targets: (
    | { kind: "program"; id: string }
    | { kind: "scope"; id: string }   // category or persona id
    | { kind: "page"; path: "/cliff-simulator" | "/tax-guide" | "/deadlines" | "/scholarships" | "/packet" }
  )[];
}

// Every deep state's SNAP entry — generic food-stamp phrases must reach the
// state-administered version, since it supersedes us-snap in that state.
const SNAP_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "us-snap" },
  { kind: "program", id: "nj-snap" },
  { kind: "program", id: "ca-calfresh" },
  { kind: "program", id: "tx-snap" },
  { kind: "program", id: "fl-snap" },
  { kind: "program", id: "ny-snap" },
  { kind: "program", id: "pa-snap" },
  { kind: "program", id: "il-snap" },
];

const WIC_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "us-wic" },
  { kind: "program", id: "nj-wic" },
  { kind: "program", id: "ca-wic" },
  { kind: "program", id: "tx-wic" },
  { kind: "program", id: "fl-wic" },
  { kind: "program", id: "ny-wic" },
  { kind: "program", id: "pa-wic" },
  { kind: "program", id: "il-wic" },
];

const LIHEAP_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "us-liheap" },
  { kind: "program", id: "nj-liheap" },
  { kind: "program", id: "ca-liheap" },
  { kind: "program", id: "tx-ceap" },
  { kind: "program", id: "fl-liheap" },
  { kind: "program", id: "ny-heap" },
  { kind: "program", id: "pa-liheap" },
  { kind: "program", id: "il-liheap" },
];

const MEDICAID_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "us-medicaid" },
  { kind: "program", id: "nj-familycare" },
  { kind: "program", id: "ca-medi-cal" },
  { kind: "program", id: "tx-medicaid-kids-chip" },
  { kind: "program", id: "fl-kidcare" },
  { kind: "program", id: "ny-medicaid" },
  { kind: "program", id: "pa-medicaid" },
  { kind: "program", id: "il-medicaid" },
];

const MARKETPLACE_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "nj-get-covered-nj" },
  { kind: "program", id: "ca-covered-ca" },
  { kind: "program", id: "tx-marketplace" },
  { kind: "program", id: "fl-marketplace" },
  { kind: "program", id: "ny-marketplace" },
  { kind: "program", id: "pa-pennie" },
  { kind: "program", id: "il-marketplace" },
];

const TANF_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "nj-wfnj" },
  { kind: "program", id: "ca-calworks" },
  { kind: "program", id: "tx-tanf" },
  { kind: "program", id: "fl-tca" },
  { kind: "program", id: "ny-family-assistance" },
  { kind: "program", id: "pa-tanf" },
  { kind: "program", id: "il-tanf" },
];

const SSI_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "nj-ssi" },
  { kind: "program", id: "ca-ssi-ssp" },
  { kind: "program", id: "tx-ssi" },
  { kind: "program", id: "fl-ssi" },
  { kind: "program", id: "ny-ssi-ssp" },
  { kind: "program", id: "pa-ssi-ssp" },
  { kind: "program", id: "il-ssi" },
];

const EITC_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "us-eitc" },
  { kind: "program", id: "nj-eitc" },
  { kind: "program", id: "ca-eitc" },
  { kind: "program", id: "ny-eitc" },
  { kind: "program", id: "il-eitc" },
  { kind: "program", id: "pa-tax-forgiveness" },
];

const PROPERTY_TAX_TARGETS: SearchTag["targets"] = [
  { kind: "program", id: "nj-senior-freeze" },
  { kind: "program", id: "ca-ptp" },
  { kind: "program", id: "tx-homestead" },
  { kind: "program", id: "fl-senior-homestead" },
  { kind: "program", id: "ny-enhanced-star" },
  { kind: "program", id: "pa-ptrr" },
  { kind: "program", id: "il-senior-freeze" },
];

export const SEARCH_TAGS: SearchTag[] = [
  // --- colloquial program names: food ----------------------------------------
  {
    phrase: "food stamps",
    targets: SNAP_TARGETS,
  },
  {
    phrase: "ebt",
    targets: SNAP_TARGETS,
  },
  {
    phrase: "snap",
    targets: SNAP_TARGETS,
  },
  {
    phrase: "calfresh",
    targets: [{ kind: "program", id: "ca-calfresh" }],
  },
  {
    phrase: "lone star card",
    targets: [{ kind: "program", id: "tx-snap" }],
  },
  {
    phrase: "link card",
    targets: [{ kind: "program", id: "il-snap" }],
  },
  {
    phrase: "grocery money",
    targets: [
      { kind: "program", id: "us-snap" },
      { kind: "scope", id: "food" },
    ],
  },
  {
    phrase: "food bank",
    targets: [{ kind: "program", id: "us-tefap" }, { kind: "scope", id: "food" }],
  },
  {
    phrase: "wic",
    targets: WIC_TARGETS,
  },
  {
    phrase: "free school lunch",
    targets: [
      { kind: "program", id: "us-nslp" },
      { kind: "program", id: "nj-school-meals" },
      { kind: "program", id: "ca-school-meals" },
      { kind: "program", id: "ny-school-meals" },
      { kind: "program", id: "pa-school-meals" },
    ],
  },
  // --- colloquial program names: health ---------------------------------------
  {
    phrase: "obamacare",
    targets: [...MARKETPLACE_TARGETS, { kind: "scope", id: "health" }],
  },
  {
    phrase: "marketplace insurance",
    targets: MARKETPLACE_TARGETS,
  },
  {
    phrase: "no health insurance",
    targets: [...MEDICAID_TARGETS, { kind: "scope", id: "health" }],
  },
  {
    phrase: "medicaid",
    targets: MEDICAID_TARGETS,
  },
  {
    phrase: "medi-cal",
    targets: [{ kind: "program", id: "ca-medi-cal" }],
  },
  {
    phrase: "familycare",
    targets: [{ kind: "program", id: "nj-familycare" }],
  },
  {
    phrase: "essential plan",
    targets: [{ kind: "program", id: "ny-essential-plan" }],
  },
  {
    phrase: "child health plus",
    targets: [{ kind: "program", id: "ny-child-health-plus" }],
  },
  {
    phrase: "kidcare",
    targets: [{ kind: "program", id: "fl-kidcare" }],
  },
  {
    phrase: "all kids",
    targets: [{ kind: "program", id: "il-all-kids" }],
  },
  {
    phrase: "pennie",
    targets: [{ kind: "program", id: "pa-pennie" }],
  },
  {
    phrase: "chip",
    targets: [
      { kind: "program", id: "us-chip" },
      { kind: "program", id: "tx-medicaid-kids-chip" },
      { kind: "program", id: "fl-kidcare" },
      { kind: "program", id: "ny-child-health-plus" },
      { kind: "program", id: "pa-chip" },
      { kind: "program", id: "il-all-kids" },
    ],
  },
  {
    phrase: "kids health insurance",
    targets: [
      { kind: "program", id: "us-chip" },
      { kind: "program", id: "tx-medicaid-kids-chip" },
      { kind: "program", id: "fl-kidcare" },
      { kind: "program", id: "ny-child-health-plus" },
      { kind: "program", id: "pa-chip" },
      { kind: "program", id: "il-all-kids" },
      { kind: "scope", id: "health" },
    ],
  },
  {
    phrase: "prescription help",
    targets: [
      { kind: "program", id: "nj-paad" },
      { kind: "program", id: "pa-pace" },
      { kind: "program", id: "us-extra-help" },
    ],
  },
  {
    phrase: "pace",
    targets: [{ kind: "program", id: "pa-pace" }],
  },
  {
    phrase: "pacenet",
    targets: [{ kind: "program", id: "pa-pace" }],
  },
  {
    phrase: "medicare",
    targets: [
      { kind: "program", id: "us-msp" },
      { kind: "program", id: "us-extra-help" },
      { kind: "scope", id: "health" },
    ],
  },
  // --- colloquial program names: housing --------------------------------------
  {
    phrase: "section 8",
    targets: [{ kind: "program", id: "us-section8" }],
  },
  {
    phrase: "housing voucher",
    targets: [{ kind: "program", id: "us-section8" }],
  },
  {
    phrase: "rental assistance",
    targets: [{ kind: "program", id: "us-era" }],
  },
  {
    phrase: "property tax relief",
    targets: [...PROPERTY_TAX_TARGETS, { kind: "scope", id: "housing" }],
  },
  {
    phrase: "star",
    targets: [{ kind: "program", id: "ny-enhanced-star" }],
  },
  {
    phrase: "rent rebate",
    targets: [{ kind: "program", id: "pa-ptrr" }],
  },
  {
    phrase: "homestead exemption",
    targets: [
      { kind: "program", id: "tx-homestead" },
      { kind: "program", id: "fl-senior-homestead" },
    ],
  },
  // --- colloquial program names: cash -----------------------------------------
  {
    phrase: "welfare",
    targets: [{ kind: "scope", id: "cash" }, ...TANF_TARGETS],
  },
  {
    phrase: "tanf",
    targets: TANF_TARGETS,
  },
  {
    phrase: "cash assistance",
    targets: [{ kind: "scope", id: "cash" }],
  },
  {
    phrase: "general assistance",
    targets: [{ kind: "program", id: "nj-county-ga" }, { kind: "program", id: "ca-county-ga" }],
  },
  {
    phrase: "ssi",
    targets: SSI_TARGETS,
  },
  {
    phrase: "ssdi",
    targets: [{ kind: "program", id: "us-ssdi" }],
  },
  {
    phrase: "social security disability",
    targets: [{ kind: "program", id: "us-ssdi" }],
  },
  {
    phrase: "disabled",
    targets: [{ kind: "program", id: "us-ssdi" }, ...SSI_TARGETS, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "capi",
    targets: [{ kind: "program", id: "ca-capi" }],
  },
  {
    phrase: "small business loan",
    targets: [{ kind: "program", id: "us-sba" }],
  },
  // --- colloquial program names: energy / phone -------------------------------
  {
    phrase: "liheap",
    targets: LIHEAP_TARGETS,
  },
  {
    phrase: "heap",
    targets: [{ kind: "program", id: "ny-heap" }],
  },
  {
    phrase: "ceap",
    targets: [{ kind: "program", id: "tx-ceap" }],
  },
  {
    phrase: "lifeline phone",
    targets: [
      { kind: "program", id: "us-lifeline" },
      { kind: "program", id: "ca-lifeline" },
    ],
  },
  {
    phrase: "phone bill",
    targets: [
      { kind: "scope", id: "phone-internet" },
      { kind: "program", id: "us-lifeline" },
    ],
  },
  {
    phrase: "internet discount",
    targets: [
      { kind: "scope", id: "phone-internet" },
      { kind: "program", id: "us-lifeline" },
    ],
  },
  // --- colloquial program names: tax ------------------------------------------
  {
    phrase: "eitc",
    targets: EITC_TARGETS,
  },
  {
    phrase: "earned income tax credit",
    targets: EITC_TARGETS,
  },
  {
    phrase: "tax forgiveness",
    targets: [{ kind: "program", id: "pa-tax-forgiveness" }],
  },
  {
    phrase: "child tax credit",
    targets: [{ kind: "program", id: "us-ctc" }],
  },
  {
    phrase: "tax refund",
    targets: [
      { kind: "page", path: "/tax-guide" },
      { kind: "program", id: "us-eitc" },
      { kind: "program", id: "us-ctc" },
    ],
  },
  {
    phrase: "file taxes",
    targets: [{ kind: "page", path: "/tax-guide" }],
  },
  {
    phrase: "free tax prep",
    targets: [{ kind: "page", path: "/tax-guide" }, { kind: "scope", id: "tax" }],
  },
  // --- colloquial program names: education / veterans -------------------------
  {
    phrase: "pell grant",
    targets: [{ kind: "program", id: "us-pell" }],
  },
  {
    phrase: "fafsa",
    targets: [{ kind: "program", id: "us-pell" }, { kind: "scope", id: "education" }],
  },
  {
    phrase: "scholarship",
    targets: [{ kind: "page", path: "/scholarships" }, { kind: "program", id: "us-scholarships" }, { kind: "scope", id: "education" }],
  },
  {
    phrase: "job training",
    targets: [{ kind: "program", id: "us-job-training" }],
  },
  {
    phrase: "resume help",
    targets: [{ kind: "program", id: "us-job-training" }],
  },
  {
    phrase: "gi bill",
    targets: [{ kind: "program", id: "us-gi-bill" }],
  },
  {
    phrase: "va disability",
    targets: [{ kind: "program", id: "us-va-disability" }],
  },
  {
    phrase: "va pension",
    targets: [{ kind: "program", id: "us-va-pension" }],
  },
  {
    phrase: "va home loan",
    targets: [{ kind: "program", id: "us-va-home-loan" }],
  },
  {
    phrase: "va health care",
    targets: [{ kind: "program", id: "us-va-healthcare" }],
  },
  // --- life situations: pregnancy / new baby ----------------------------------
  {
    phrase: "pregnant",
    targets: [
      // WIC + Medicaid in every deep-state shape — the state packs SUPERSEDE
      // the us-* ids, so each household resolves its own state's version.
      ...WIC_TARGETS,
      ...MEDICAID_TARGETS,
      { kind: "program", id: "tx-pregnancy-medicaid" },
      { kind: "program", id: "fl-pregnancy-medicaid" },
      { kind: "scope", id: "families" },
    ],
  },
  {
    phrase: "new baby",
    targets: [...WIC_TARGETS, { kind: "scope", id: "families" }],
  },
  {
    phrase: "having a baby",
    targets: [
      { kind: "program", id: "us-wic" },
      { kind: "scope", id: "families" },
    ],
  },
  // --- life situations: job loss ------------------------------------------------
  {
    phrase: "laid off",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "lost my job",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "unemployed",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  // --- life situations: housing ------------------------------------------------
  {
    phrase: "can't pay rent",
    targets: [{ kind: "program", id: "us-era" }, { kind: "scope", id: "housing" }],
  },
  {
    phrase: "behind on rent",
    targets: [{ kind: "program", id: "us-era" }],
  },
  {
    phrase: "eviction",
    targets: [{ kind: "program", id: "us-era" }, { kind: "program", id: "us-section8" }],
  },
  // --- life situations: energy bills --------------------------------------------
  {
    phrase: "heat bill",
    targets: [...LIHEAP_TARGETS, { kind: "scope", id: "energy" }],
  },
  {
    phrase: "electric bill",
    targets: [...LIHEAP_TARGETS, { kind: "scope", id: "energy" }],
  },
  {
    phrase: "can't afford heat",
    targets: LIHEAP_TARGETS,
  },
  {
    phrase: "utility assistance",
    targets: [
      { kind: "scope", id: "energy" },
      { kind: "program", id: "us-liheap" },
      { kind: "program", id: "nj-usf" },
    ],
  },
  // NOTE: no solar/clean-energy or rooftop-panel program exists anywhere in the
  // catalog (federal, NJ, or CA) — only heating/cooling bill help (LIHEAP) and
  // utility bill credits (NJ USF) and phone discounts (Lifeline). "solar" and "clean energy" resolve to the
  // energy category only, honestly, rather than a program that doesn't exist.
  {
    phrase: "solar",
    targets: [{ kind: "scope", id: "energy" }],
  },
  {
    phrase: "clean energy",
    targets: [{ kind: "scope", id: "energy" }],
  },
  // --- demographics --------------------------------------------------------------
  {
    phrase: "senior",
    targets: [{ kind: "scope", id: "seniors" }],
  },
  {
    phrase: "over 65",
    targets: [{ kind: "scope", id: "seniors" }],
  },
  {
    phrase: "veteran",
    targets: [{ kind: "scope", id: "veterans" }],
  },
  {
    phrase: "served in the military",
    targets: [{ kind: "scope", id: "veterans" }],
  },
  {
    phrase: "student",
    targets: [{ kind: "scope", id: "students" }, { kind: "program", id: "us-pell" }],
  },
  {
    phrase: "immigrant",
    targets: [{ kind: "scope", id: "immigrants" }, { kind: "program", id: "ca-capi" }],
  },
  {
    phrase: "family with kids",
    targets: [{ kind: "scope", id: "families" }],
  },
  // --- money / tax tools -----------------------------------------------------------
  {
    phrase: "raise",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "benefits cliff",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "will a raise hurt my benefits",
    targets: [{ kind: "page", path: "/cliff-simulator" }],
  },
  {
    phrase: "deadlines",
    targets: [{ kind: "page", path: "/deadlines" }],
  },
  {
    phrase: "when is the deadline",
    targets: [{ kind: "page", path: "/deadlines" }],
  },
  {
    phrase: "document checklist",
    targets: [{ kind: "page", path: "/packet" }],
  },
  {
    phrase: "application packet",
    targets: [{ kind: "page", path: "/packet" }],
  },
  {
    phrase: "print my documents",
    targets: [{ kind: "page", path: "/packet" }],
  },
  // --- Spanish -----------------------------------------------------------------------
  {
    phrase: "estampillas de comida",
    targets: SNAP_TARGETS,
  },
  {
    phrase: "cupones de alimentos",
    targets: SNAP_TARGETS,
  },
  {
    phrase: "seguro médico",
    targets: [{ kind: "scope", id: "health" }, { kind: "program", id: "us-medicaid" }],
  },
  {
    phrase: "asistencia médica",
    targets: [{ kind: "scope", id: "health" }],
  },
  {
    phrase: "ayuda con la renta",
    targets: [{ kind: "program", id: "us-era" }, { kind: "scope", id: "housing" }],
  },
  {
    phrase: "desempleo",
    targets: [{ kind: "program", id: "us-job-training" }, { kind: "scope", id: "cash" }],
  },
  {
    phrase: "embarazada",
    targets: WIC_TARGETS,
  },
  {
    phrase: "factura de luz",
    targets: LIHEAP_TARGETS,
  },
  {
    phrase: "impuestos",
    targets: [{ kind: "page", path: "/tax-guide" }],
  },
];
