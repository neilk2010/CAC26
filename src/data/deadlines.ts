import type { CategoricalFlag } from "@/lib/types";

// Deadline-bearing programs — rules-as-data. Every window below was verified
// against the linked official source on its lastVerified date. Honesty rules:
// a date only appears here if the SOURCE states it; season windows that vary
// by state get `varies` copy and NO downloadable date. Nothing is invented.

export interface DeadlineRule {
  id: string;
  /** Show when ANY of these program ids is a likely/possible match. */
  programIds?: string[];
  /** Show when this household flag is true (e.g. student → FAFSA). */
  flag?: CategoricalFlag;
  /** Show for everyone (subject to supersededBy). */
  always?: boolean;
  /** Hidden when any of these rules also matched (state versions beat federal). */
  supersededBy?: string[];
  /** Scholarship-contest deadlines — grouped separately, shown to everyone. */
  scholarship?: boolean;
  title: string;
  detail: string;
  sourceUrl: string;
  lastVerified: string;
  /** Annual recurring window; day precision ONLY where the source states it. */
  opens?: { month: number; day: number; label: string; };
  closes?: { month: number; day: number; label: string; };
  /** When the real date varies (by state/affiliate), say so — no .ics offered. */
  varies?: string;
}

export const DEADLINE_RULES: DeadlineRule[] = [
  {
    id: "aca-oep-nj",
    programIds: ["nj-get-covered-nj"],
    title: "GetCoveredNJ Open Enrollment",
    detail:
      "New Jersey's health insurance marketplace enrolls anyone during Open Enrollment. Outside the window you need a qualifying life event.",
    sourceUrl: "https://www.nj.gov/getcoverednj/",
    lastVerified: "2026-07-08",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 31, label: "Open Enrollment Ends" },
  },
  {
    id: "aca-oep-ca",
    programIds: ["ca-covered-ca"],
    title: "Covered California Open Enrollment",
    detail:
      "California's marketplace enrolls anyone during Open Enrollment; apply by December to be covered on January 1.",
    sourceUrl: "https://www.coveredca.com/support/before-you-buy/enrollment-dates-and-deadlines/",
    lastVerified: "2026-07-08",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 31, label: "Open Enrollment Ends" },
  },
  {
    id: "aca-oep-ny",
    programIds: ["ny-marketplace", "ny-essential-plan"],
    title: "NY State of Health Open Enrollment",
    detail:
      "New York's marketplace enrolls anyone November 1 through January 31; enroll by December 15 for coverage that starts January 1. (Essential Plan and Medicaid enroll year-round.)",
    sourceUrl: "https://info.nystateofhealth.ny.gov/news/press-release-new-york-state-department-health-announces-open-enrollment-2026-coverage",
    lastVerified: "2026-07-19",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 31, label: "Open Enrollment Ends" },
  },
  {
    id: "aca-oep-pa",
    programIds: ["pa-pennie"],
    title: "Pennie Open Enrollment",
    detail:
      "Pennsylvania's marketplace enrolls anyone November 1 through January 31; enroll by December 15 for coverage that starts January 1.",
    sourceUrl: "https://agency.pennie.com/pennies-2026-open-enrollment-period-is-underway-protect-your-health-by-enrolling-in-a-high-quality-health-plan-through-pennie/",
    lastVerified: "2026-07-19",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 31, label: "Open Enrollment Ends" },
  },
  {
    id: "aca-oep-il",
    programIds: ["il-marketplace"],
    title: "Get Covered Illinois Open Enrollment",
    detail:
      "Illinois' own marketplace (new for 2026) enrolls anyone November 1 through January 15.",
    sourceUrl: "https://getcovered.illinois.gov/get-started/about-the-marketplace.html",
    lastVerified: "2026-07-19",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 15, label: "Open Enrollment Ends" },
  },
  {
    id: "aca-oep-federal",
    always: true,
    supersededBy: ["aca-oep-nj", "aca-oep-ca", "aca-oep-ny", "aca-oep-pa", "aca-oep-il"],
    title: "HealthCare.gov Open Enrollment",
    detail:
      "The federal marketplace's yearly window to enroll in or change a health plan. Enroll by December 15 for coverage that starts January 1.",
    sourceUrl: "https://www.healthcare.gov/quick-guide/dates-and-deadlines/",
    lastVerified: "2026-07-08",
    opens: { month: 11, day: 1, label: "Open Enrollment Starts" },
    closes: { month: 1, day: 15, label: "Open Enrollment Ends" },
  },
  {
    id: "fafsa",
    programIds: ["us-pell"],
    flag: "student",
    title: "FAFSA (federal student aid)",
    detail:
      "The form opens by October 1 for the next school year, and the federal window closes June 30 at the end of that school year. File EARLY — many state grant deadlines fall months before the federal one.",
    sourceUrl: "https://studentaid.gov/apply-for-aid/fafsa/fafsa-deadlines",
    lastVerified: "2026-07-08",
    opens: { month: 10, day: 1, label: "FAFSA opens for the next school year" },
    closes: { month: 6, day: 30, label: "Federal FAFSA deadline for the ending school year" },
  },
  {
    id: "liheap-nj",
    programIds: ["nj-liheap"],
    title: "NJ LIHEAP season (heating help)",
    detail:
      "New Jersey accepts LIHEAP applications October 1 through June 30 — but it's first-come, first-served while funds last, so apply as early in the season as you can.",
    sourceUrl: "https://www.nj.gov/dca/dhcr/offices/hea.shtml",
    lastVerified: "2026-07-08",
    opens: { month: 10, day: 1, label: "LIHEAP season opens — apply early, funds run out" },
    closes: { month: 6, day: 30, label: "LIHEAP season closes" },
  },
  {
    id: "liheap-general",
    programIds: [
      "us-liheap",
      "ca-liheap",
      "tx-ceap",
      "fl-liheap",
      "ny-heap",
      "pa-liheap",
      "il-liheap",
    ],
    supersededBy: ["liheap-nj"],
    title: "LIHEAP season (heating/cooling help)",
    detail:
      "Energy assistance is seasonal and funding-capped, and each state sets its own application window — many open in the fall. Check your state's dates and apply the week it opens.",
    sourceUrl: "https://www.acf.hhs.gov/ocs/map/liheap-map-state-and-territory-contact-listing",
    lastVerified: "2026-07-08",
    varies:
      "Window varies by state — no date is shown because there isn't one national date to show.",
  },
  {
    id: "vfw-voice-of-democracy",
    scholarship: true,
    title: "VFW Voice of Democracy (audio essay, grades 9–12)",
    detail:
      "Entries go to a local VFW Post by October 31. Top national award is $35,000; every state first-place winner gets at least $1,000.",
    sourceUrl: "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    lastVerified: "2026-07-07",
    closes: { month: 10, day: 31, label: "Entries due at your local VFW Post" },
  },
  {
    id: "vfw-patriots-pen",
    scholarship: true,
    title: "VFW Patriot's Pen (written essay, grades 6–8)",
    detail: "Same October 31 deadline as Voice of Democracy, for middle schoolers.",
    sourceUrl: "https://www.vfw.org/community/youth-and-education/youth-scholarships",
    lastVerified: "2026-07-07",
    closes: { month: 10, day: 31, label: "Entries due at your local VFW Post" },
  },
  {
    id: "coca-cola-scholars",
    scholarship: true,
    title: "Coca-Cola Scholars application",
    detail:
      "Opens in early August and closes at the end of September for that school year's seniors ($20,000 × 150 scholars). The verified close for the 2027 class is September 30 — confirm on the official page before planning around it.",
    sourceUrl: "https://www.coca-colascholarsfoundation.org/apply/",
    lastVerified: "2026-07-07",
    closes: { month: 9, day: 30, label: "Application closes (verify exact date on the official page)" },
  },
];
