// The only things the guide is allowed to say about the site itself.
//
// Hand-written rather than derived: a route list would tell the model a page
// exists without telling it what the page is for, and a guide that sends
// someone to the wrong page is worse than one that says "I don't know".

export interface SitePage {
  path: string;
  title: string;
  /** What a visitor accomplishes here, in the words they'd use. */
  purpose: string;
}

export const SITE_MAP: SitePage[] = [
  { path: "/intake", title: "Check eligibility",
    purpose: "The questionnaire. About ten plain questions — state, household size, income as a range. No account, and answers stay in this browser." },
  { path: "/results", title: "My results",
    purpose: "Every program screened for this household, grouped by how confident the engine is, each with the reason it matched and a link to the agency that decides." },
  { path: "/cliff-simulator", title: "Cliff simulator",
    purpose: "Shows what happens to benefits if household income rises — where a raise could cost more than it gains." },
  { path: "/deadlines", title: "Deadlines",
    purpose: "Enrollment windows and filing dates that apply to this household, such as marketplace open enrollment." },
  { path: "/packet", title: "Printable packet",
    purpose: "A printable checklist of matched programs and the documents each application asks for." },
  { path: "/how-it-works", title: "How it works",
    purpose: "How the screening works and where the rules come from." },
  { path: "/about", title: "About",
    purpose: "Who built OpenDoor, and the project's ground rules about open data and verifying with the agency." },
  { path: "/tax-guide", title: "Tax guide",
    purpose: "Tax credits like the EITC and Child Tax Credit, and free filing help." },
  { path: "/scholarships", title: "Scholarships",
    purpose: "Scholarship and student-aid opportunities, including contest deadlines." },
];

export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export const GLOSSARY: GlossaryEntry[] = [
  { term: "Likely eligible",
    meaning: "Every rule OpenDoor can check passed. It is not an approval — the agency still decides." },
  { term: "Possibly eligible",
    meaning: "The rules OpenDoor can check passed, but something the program weighs is unknown or varies locally." },
  { term: "Need more info",
    meaning: "A question that decides this program has not been answered yet." },
  { term: "Not likely",
    meaning: "At least one rule OpenDoor can check did not pass. The agency can still look at a case individually." },
  { term: "FPL",
    meaning: "Federal Poverty Level. A yearly income figure set by the federal government; many programs set their limit as a percentage of it, which is why limits are written like \"130% FPL\"." },
  { term: "Income range",
    meaning: "OpenDoor asks for income as a band rather than an exact figure, so nobody has to disclose a salary to get an answer." },
  { term: "Gross vs net income",
    meaning: "Gross is before deductions, net is after. Some programs test net income, so the real cutoff sits higher than a gross figure suggests." },
  { term: "Asset limit",
    meaning: "Some programs cap how much a household can hold in savings. Many have no asset test at all." },
  { term: "The income line",
    meaning: "The monthly income limit a program was judged against for this household size. Each result card shows it." },
  { term: "The higher limit",
    meaning: "Some programs raise their income limit for households with a pregnancy, a young child, a disability, or someone 65+. If that question was skipped, a result card offers it." },
];

/** Facts about the project itself that the guide may state. */
export const PROJECT_FACTS = [
  "OpenDoor screens 139 benefit programs: 25 federal ones that apply everywhere, plus state-administered programs.",
  "Eleven states are covered in full detail; all 51 states and DC are selectable.",
  "Answers are kept in the visitor's own browser. There is no account requirement and nothing is sent to a server to get results.",
  "OpenDoor is not a government site and cannot approve anyone. Every program links to the agency that actually decides.",
  "Each program record carries the date its figures were last checked against the agency's own source.",
  "The site is available in English and Spanish.",
];
