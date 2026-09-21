# **OpenDoor — Research Sources & Data Sources**

*Congressional App Challenge 2026*

**How to use this doc:** Every entry below has (1) the name, (2) the official link, (3) what it's for, and (4) an **Eligibility Type** tag so you know whether it's a guaranteed benefit (everyone who qualifies gets it) or a **limited/lottery** benefit (funding-capped, so qualifying doesn't guarantee you get it — important for your "feasibility" feature).

**Eligibility Type key:**

* 🟢 **Entitlement** — if you meet the criteria, you get it (no cap, no lottery)  
* 🟡 **First-come/first-served or capped funding** — funds run out; timing matters  
* 🔴 **Lottery / waitlist** — random selection, long waits, not everyone who qualifies gets in

---

## **1\. Master "Benefit Finder" Sites (start here — these already do eligibility screening)**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| Benefits.gov | https://www.benefits.gov | Official U.S. government benefit finder; screens across 1,000+ federal/state programs | 🟢 (screening only, not a benefit itself) |
| USA.gov Benefits | https://www.usa.gov/benefits | Plain-language overview of federal assistance programs, organized by category | 🟢 |
| findhelp.org | https://www.findhelp.org | The main nonprofit/social-care directory (formerly Aunt Bertha); has an API and is what most 211 systems run on — good for your "hyperlocal programs" feature | 🟢 |
| 211.org | https://www.211.org | National human-services helpline/directory; searchable by ZIP code; good model for your "warm handoff to humans" feature | 🟢 |
| Get Covered / GetCTC / Code for America benefits tools | https://www.codeforamerica.org | Nonprofit civic-tech org that has literally built benefits-access tools (GetYourRefund, GetCTC, integrated benefits applications) — good to cite as precedent/inspiration and possibly reach out to for judge credibility | — |

---

## **1b. Federal Open Data Infrastructure (the "firehose" behind everything else)**

These aren't benefit programs — they're the raw data/API layer some of the programs below are built on. Worth knowing about for your eligibility engine's back end:

| Source | Link | What it is |
| ----- | ----- | ----- |
| Data.gov | https://www.data.gov | Central catalog of federal open datasets (CSV/JSON/APIs) across every agency — HUD, USDA, Census, Education, Labor, HHS, VA, etc. |
| api.data.gov | https://api.data.gov | The federal API gateway/key-signup portal — most federal APIs (like College Scorecard below) are actually hosted under this domain |
| U.S. Census Bureau API | https://www.census.gov/data/developers/data-sets.html | American Community Survey data by ZIP/county — income, poverty rate, household composition; useful for pre-filling location-based estimates |
| College Scorecard API | https://collegescorecard.ed.gov/data/api/ | Official Dept. of Education API — cost, graduation rate, median earnings, Pell Grant recipient % per school. **Verified actively maintained** (data last updated June 10, 2026). Free API key via api.data.gov |

---

## **2\. Food Assistance**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| SNAP (food stamps) — USDA Food and Nutrition Service | https://www.fns.usda.gov/snap/recipient/eligibility | Official federal eligibility rules (income limits, asset tests, household rules) | 🟢 Entitlement |
| SNAP State Directory | https://www.fns.usda.gov/snap/state-directory | Links to every state's SNAP application portal | 🟢 |
| WIC (Women, Infants, Children) | https://www.fns.usda.gov/wic | Nutrition aid for pregnant women, new moms, and kids under 5 | 🟢 Entitlement (but state funding caps have occurred historically — verify current status per state) |
| National School Lunch Program (NSLP) & School Breakfast Program | https://www.fns.usda.gov/nslp | Free/reduced-price school meal eligibility (130%/185% of poverty line) | 🟢 Entitlement |
| Community Eligibility Provision (CEP) | https://www.fns.usda.gov/cn/community-eligibility-provision | Lets whole high-poverty schools serve free meals to everyone — useful nuance for your eligibility engine | 🟢 |
| TEFAP (food banks/pantries via USDA) | https://www.fns.usda.gov/tefap | Federal food distributed through local food banks | 🟡 Capped funding |
| Feeding America food bank locator | https://www.feedingamerica.org/find-your-local-foodbank | Locate the nearest food pantry by ZIP | 🟢 (locator) |

---

## **3\. Housing**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| HUD Housing Choice Voucher ("Section 8") overview | https://www.hud.gov/helping-americans/housing-choice-vouchers-tenants | Federal rental subsidy program, run through \~2,000 local Public Housing Agencies (PHAs) | 🔴 **Lottery/waitlist** — demand far exceeds vouchers; many PHAs use a random lottery just to get ON the waitlist, then more waiting after that |
| HUD PHA Contact Directory | https://www.hud.gov/program\_offices/public\_indian\_housing/pha/contacts | Find the local housing authority for any address — needed since HCV is administered locally, not federally | 🟢 (directory) |
| HUD Income Limits Tool | https://www.huduser.gov/portal/datasets/il.html | Official Area Median Income (AMI) limits by county/household size — this is the real eligibility math behind almost every housing program | 🟢 (data source) |
| USA.gov Section 8 overview | https://www.usa.gov/housing-voucher-section-8 | Plain-language explainer confirming waitlists are often closed/lottery-based | 🔴 |
| LIHEAP (heating/cooling assistance) | https://www.acf.hhs.gov/ocs/programs/liheap | Federal home energy assistance program, run through states | 🟡 Capped funding — money runs out each season |
| Emergency Rental Assistance / local housing authorities | https://www.nlihc.org/era-dashboard | National Low Income Housing Coalition's tracker of local rental assistance programs (good hyperlocal source) | 🟡 |

---

## **4\. Utilities & Internet**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| Lifeline (FCC) | https://www.lifelinesupport.org | $9.25/month phone or internet discount for low-income households (SNAP/Medicaid/SSI qualify) — **this is the current main federal broadband subsidy** | 🟢 Entitlement |
| ⚠️ Affordable Connectivity Program (ACP) | https://www.fcc.gov/acp | **Ended June 1, 2024\.** Do not build this into your app as active — it's archived by the FCC itself. As of mid-2026 Congress has not refunded it. Only include if you add a note like "historical/may return." | ❌ Discontinued |
| LIHWAP (water/wastewater assistance) | https://www.acf.hhs.gov/ocs/programs/liheap/water-assistance | Federal help with water bills, modeled on LIHEAP | 🟡 Capped funding |

---

## **5\. Healthcare**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| Medicaid | https://www.medicaid.gov | Income-based health coverage; eligibility varies significantly by state (expansion vs. non-expansion states) | 🟢 Entitlement (in expansion states, essentially everyone under \~138% FPL) |
| CHIP (Children's Health Insurance Program) | https://www.medicaid.gov/chip | Health coverage for kids in families that earn too much for Medicaid but not enough for private insurance | 🟢 Entitlement |
| Healthcare.gov | https://www.healthcare.gov | ACA Marketplace plans \+ subsidy calculator | 🟢 |
| Medicaid.gov state eligibility pages | https://www.medicaid.gov/about-us/beneficiary-resources/index.html | Directory of every state's Medicaid agency | 🟢 (directory) |
| Medicare Savings Programs (QMB/SLMB/QI) | https://www.medicare.gov/basics/costs/help/medicare-savings-programs | State-run programs that pay Medicare premiums (and sometimes cost-sharing) for lower-income Medicare enrollees; income tiers set by statute up to 135% FPL, plus a resource test | 🟢 Entitlement |
| Extra Help / Part D Low-Income Subsidy | https://www.ssa.gov/medicare/part-d-extra-help | Lowers Medicare prescription drug costs for enrollees up to 150% FPL (statutory since 2024); SSA applies a resource test. Widely under-claimed | 🟢 Entitlement |

---

## **6\. Cash Assistance & Disability**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| TANF (Temporary Assistance for Needy Families) | https://www.acf.hhs.gov/ofa/programs/temporary-assistance-needy-families-tanf | Cash assistance for families with children; time-limited, state-run | 🟡 Capped/time-limited (federal 5-year lifetime limit in most states) |
| SSI (Supplemental Security Income) | https://www.ssa.gov/ssi | Cash aid for low-income elderly, blind, or disabled individuals | 🟢 Entitlement |
| SSDI | https://www.ssa.gov/disability | Disability insurance for people with a sufficient work history | 🟢 Entitlement (if work-history criteria met) |
| Social Security Benefit Eligibility Screening Tool (BEST) | https://ssabest.benefits.gov | Official SSA screening tool — good model/reference for your own eligibility engine | 🟢 |

---

## **6b. Veterans**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| VA Benefits (main hub) | https://www.va.gov/benefits | Disability compensation, healthcare, education (GI Bill), home loans, pension, burial benefits | 🟢 Entitlement (based on service/disability rating) |
| VA Disability Compensation | https://www.va.gov/disability | Monthly payments based on service-connected disability rating | 🟢 Entitlement |
| GI Bill / Education Benefits | https://www.va.gov/education | Tuition, housing allowance, and books for veterans and some dependents | 🟢 Entitlement (based on service length) |
| VA Home Loans | https://www.va.gov/housing-assistance | No-down-payment home loan guarantee | 🟢 Entitlement |

## **6c. Disaster Assistance**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| FEMA Individual Assistance | https://www.fema.gov/assistance/individual | Temporary housing, home repair grants, and emergency aid after a federally declared disaster | 🟡 Only available after a declared disaster in your area; capped funding |
| DisasterAssistance.gov | https://www.disasterassistance.gov | Cross-agency disaster benefit finder (FEMA, SBA, USDA, HUD) | 🟢 (screening tool) |

## **6d. Small Business**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| SBA Loans & Grants | https://www.sba.gov/funding-programs | Small business loans, disaster loans, and some grant programs | 🟡 Competitive/capped — probably lower priority for a family-benefits app, but relevant if you add a "self-employed household" path |

---

## **7\. Tax Credits (often the single biggest "unclaimed money" category)**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| IRS Earned Income Tax Credit (EITC) | https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit-eitc | Refundable credit for low/moderate income workers — IRS itself says \~1 in 5 eligible people don't claim it | 🟢 Entitlement (must file taxes to get it) |
| IRS Child Tax Credit | https://www.irs.gov/credits-deductions/individuals/child-tax-credit | Per-child tax credit, partially refundable | 🟢 Entitlement |
| IRS VITA/TCE free tax prep locator | https://irs.treasury.gov/freetaxprep/ | Finds free, IRS-certified tax preparation sites — critical because EITC/CTC require filing a return to claim | 🟢 (locator) |
| GetCTC / GetYourRefund (Code for America) | https://www.getyourrefund.org | Free simplified filing tool built specifically to help non-filers claim EITC/CTC | 🟢 |

---

## **8\. Scholarships & Education Aid**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| FAFSA (Federal Student Aid) | https://studentaid.gov | The federal form that determines eligibility for Pell Grants, federal loans, and work-study | 🟢 Entitlement for Pell Grant (based on financial need formula) |
| Federal Pell Grant info | https://studentaid.gov/understand-aid/types/grants/pell | Official eligibility rules for the largest federal grant program | 🟢 Entitlement |
| CareerOneStop Scholarship Finder (U.S. Dept. of Labor) | https://www.careeronestop.org/toolkit/training/find-scholarships.aspx | Government-run scholarship search engine — most "reputable" free option since other big scholarship sites are private/ad-driven | 🟡 (individual scholarships are usually capped/competitive) |
| College Board BigFuture Scholarship Search | https://bigfuture.collegeboard.org/scholarship-search | Widely used, reputable scholarship database | 🟡 Competitive |
| Federal Student Aid — FSA ID & deadlines | https://studentaid.gov/apply-for-aid/fafsa/filling-out | FAFSA deadlines and required documents — useful for your "deadline guardian" feature | 🟢 |
| Free Application for Federal Student Aid — State deadlines | https://studentaid.gov/apply-for-aid/fafsa/filling-out/state-deadlines | State-by-state FAFSA deadline list | 🟢 |

**Private scholarship search engines — use with a reputability caveat.** These aren't fraudulent, but most make money by collecting your data for marketing, which cuts against your app's own "privacy-first" pitch — worth being upfront about that trade-off if you link out to them:

| Source | Link | Note |
| ----- | ----- | ----- |
| Fastweb | https://www.fastweb.com | Large, long-running database; requires a profile; sends marketing email |
| Scholarships.com | https://www.scholarships.com | Large database; ad-heavy, frequent pop-ups |
| Cappex | https://www.cappex.com | Scholarship search \+ college matching; requires profile |
| Peterson's | https://www.petersons.com | Long-established test-prep/college company; also runs a scholarship search |
| Bold.org | https://bold.org | Newer, generally considered less ad-driven/spammy than the above; also lets donors create scholarships directly |
|  |  |  |

---

## **8b. Jobs & Training**

| Source | Link | What it is | Type |
| ----- | ----- | ----- | ----- |
| CareerOneStop (U.S. Dept. of Labor) | https://www.careeronestop.org | Job training, apprenticeships, and the government-run scholarship finder already listed above — one source covers both | 🟢 |
| American Job Centers locator | https://www.careeronestop.org/LocalHelp/AmericanJobCenters/find-american-job-centers.aspx | Find your local workforce office for in-person help with job training benefits | 🟢 (locator) |

---

## **9\. Data Sources for Building Your Eligibility Engine (developer-facing)**

These are the sources that let you actually encode real rules "as data" instead of hardcoding, per your Layer 2 design:

| Source | Link | What it gives you |
| ----- | ----- | ----- |
| HUD Income Limits (AMI data) | https://www.huduser.gov/portal/datasets/il.html | Downloadable AMI% tables by county & household size — the backbone of housing/utility eligibility math |
| Federal Poverty Guidelines (HHS/ASPE) | https://aspe.hhs.gov/topics/poverty-economic-mobility/poverty-guidelines | The official annual FPL numbers almost every program bases income cutoffs on |
| USDA SNAP eligibility calculator source rules | https://www.fns.usda.gov/snap/recipient/eligibility | Documented income/asset thresholds you can turn into rule logic |
| findhelp.org / Open Referral Human Services Data Specification | https://openreferral.org | Open data standard for social services — this is literally what your "Open API / open data output" goal (Layer 8\) should be built on/compatible with |
| 211 Open Referral network | https://www.211.org/about-us/open-referral | Standardized local resource data feeds by region |
| CMS/Medicaid eligibility rules | https://www.medicaid.gov/medicaid/eligibility/index.html | State-by-state expansion status and income thresholds |

---

## **10\. Finding State-Specific Programs (do this for whatever state you launch in first)**

Since a lot of the highest-value stuff (utility hardship funds, county diaper banks, senior tax freezes) is state or county-run, here's the general playbook to find them for any state:

1. **Search pattern:** `"[state name] department of human services benefits"` and `"[state] 211"` — almost every state has a DHS/DCF-equivalent agency with its own benefits portal.  
2. **State 211 site:** every state has a `[state].211.org` or similar — these list local/county programs findhelp.org doesn't always catch.  
3. **State Medicaid agency site** — search `"[state] Medicaid eligibility"` for expansion status and income limits.  
4. **State housing finance agency** — search `"[state] housing finance agency"` or `"[state] department of community affairs"` for state-run rental/utility assistance (separate from federal HUD programs).  
5. **State department of education** — search `"[state] department of education free reduced lunch"` and `"[state] scholarship programs"` for state-specific grants (many states have their own Pell-Grant-like programs).  
6. **findhelp.org and 211.org already listed above** — enter any ZIP code and they'll surface local/county programs automatically, which is the fastest way to populate your "hyperlocal" feature without manually researching every county.

---

## **Notes on Feasibility for Your App (judge-relevant framing)**

* **Entitlement programs (🟢)** are the safest ones to build a confident "you qualify, here's how much" calculator for — the math is deterministic.  
* **Capped/first-come programs (🟡)** should show a confidence caveat: "you likely qualify based on income, but funding may run out — apply early."  
* **Lottery/waitlist programs (🔴)**, especially housing vouchers, should never promise "you'll get this." Frame it as "you're eligible to enter" and be transparent about real wait times (often 1–10+ years for Section 8 in many cities) — this honesty is actually a good thing to point out to judges, since most consumer apps oversell housing assistance.

---

## **Part 2 — How to Actually Build the Data Layer (Methodology)**

This is the practical build order — worth putting in your project doc/README as evidence you thought about data quality, which judges care about:

1. **API/CSV/JSON first, always.** Before writing a scraper for any agency, check whether it publishes an API or open dataset (Data.gov and api.data.gov above are the first stop). Scraping should be your last resort, not your first move.  
2. **If no API exists, scrape narrowly and only public info.** Only pull eligibility rules, benefit descriptions, and application *links* — never scrape login pages, application forms, or anything behind a personal account. Also check each site's Terms of Service/`robots.txt` before scraping; some state sites explicitly prohibit it, which matters for a project you might publicly submit.

**Normalize everything into one schema** so your AI queries a consistent database instead of raw pages. A minimal version of ChatGPT's suggested schema:  
 {  "name": "",  "category": "",  "agency": "",  "state": "",  "income\_limit": "",  "asset\_limit": "",  "household\_rules": "",  "eligibility\_type": "entitlement | capped | lottery",  "benefit\_amount": "",  "renewal\_frequency": "",  "application\_url": "",  "official\_source\_url": "",  "confidence": "verified | high\_confidence | needs\_review",  "last\_verified": ""}

3. (Note: I added `eligibility_type` and `confidence` as enums rather than free text, and merged some fields — makes it much easier to filter/sort in your app later.)  
4. **Store it in a real database (PostgreSQL is a solid, free choice)** — don't have your AI feature re-derive facts from memory or live web search at query time. The AI's job should be to *explain* a database match in plain language, not to *find* the match itself. This also protects you from hallucinated eligibility numbers, which would be a serious credibility problem for a benefits app.  
5. **Assign a confidence tier to every record:**  
   * **Verified** — pulled directly from an official .gov API or dataset  
   * **High Confidence** — from a well-known nonprofit/education org (e.g., 211, findhelp.org, College Board)  
   * **Needs Review** — auto-extracted and not yet human-checked  
6. **Re-verify on a schedule, prioritized by program.** High-traffic programs (SNAP, Medicaid, FAFSA, EITC) should be checked more often than a small county diaper-bank listing. Track a `last_verified` date per record and flag anything stale.  
7. **For state/local programs, crawl outward from each state's official benefits portal** rather than trying to hand-write scrapers for thousands of individual county pages — follow links from the state portal, extract what's structured, and queue anything ambiguous for manual review instead of guessing.  
8. **For scholarships, keep the schema minimal:** title, deadline, amount, GPA requirement, major, citizenship/residency requirement, and application URL. That's enough to power a real recommendation engine without needing to scrape entire scholarship sites.

<!-- BEGIN:state-packs (generated by scripts/audit-sources.mjs — do not edit) -->

## **11\. State Program Packs (audit trail)**

*Generated by `npm run audit:sources` from `src/data/states/**` — 11 states, 114 state-administered programs. Do not hand-edit.*

Every program below is encoded as data in `src/data/states/<CODE>/programs.ts` and was read off the linked official page on its `last_verified` date. A state reaches **FULL COVERAGE** only when its pack carries at least 8 verified state-administered programs, always covering food, health, energy and cash (SNAP, Medicaid/CHIP, LIHEAP, TANF) — enforced by `tests/unit/coverage-bar.test.ts`. Re-verify before relying on any figure.

### **New Jersey (NJ)** — 13 programs, 8 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| New Jersey SNAP (Food Stamps) | Food | NJ Dept. of Human Services, Division of Family Development | https://www.nj.gov/humanservices/dfd/programs/njsnap/ | 2026-07-04 |
| NJ FamilyCare | Health | NJ Dept. of Human Services | https://www.njfamilycare.org/ | 2026-07-04 |
| Low Income Home Energy Assistance Program | Energy | NJ Dept. of Community Affairs | https://www.nj.gov/dca/dhcr/programs/liheap/ | 2026-07-04 |
| Women, Infants & Children | Food | NJ Dept. of Health | https://www.nj.gov/health/fhs/wic/ | 2026-07-04 |
| Work First New Jersey | Cash | County Board of Social Services | https://www.nj.gov/humanservices/dfd/programs/wfnj/ | 2026-07-04 |
| New Jersey Free School Meals for All | Education | NJ Dept. of Agriculture / Dept. of Education | https://www.nj.gov/agriculture/divisions/fn/childadult/njschoolmeals.html | 2025-02-01 |
| Supplemental Security Income | Cash | Social Security Administration | https://www.ssa.gov/benefits/ssi/ | 2026-07-04 |
| Pharmaceutical Assistance to the Aged and Disabled | Health | NJ Dept. of Human Services, Division of Aging Services | https://www.nj.gov/humanservices/doas/services/paad/ | 2026-07-04 |
| Universal Service Fund + NJ Lifeline | Phone & Internet | NJ Board of Public Utilities | https://www.nj.gov/dca/dhcr/programs/usf/ | 2026-07-04 |
| New Jersey Earned Income Tax Credit | Tax | NJ Division of Taxation | https://www.nj.gov/treasury/taxation/eitc/index.shtml | 2026-07-04 |
| County General Assistance | Cash | County Board of Social Services | https://www.nj.gov/humanservices/dfd/programs/ga/ | 2025-02-01 |
| Senior Freeze (Property Tax Reimbursement) | Housing | NJ Division of Taxation | https://www.nj.gov/treasury/taxation/ptr/index.shtml | 2026-07-04 |
| Get Covered NJ Premium Assistance | Health | Get Covered New Jersey | https://www.getcoverednj.gov/ | 2026-07-04 |

### **California (CA)** — 13 programs, 8 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| CalFresh (SNAP) | Food | California Department of Social Services | https://www.cdss.ca.gov/calfresh | 2026-07-04 |
| Medi-Cal | Health | California Dept. of Health Care Services | https://www.dhcs.ca.gov/ | 2026-07-04 |
| Low Income Home Energy Assistance Program | Energy | CA Dept. of Community Services & Development | https://www.csd.ca.gov/pages/liheap | 2026-07-04 |
| Women, Infants & Children | Food | California WIC Program (CDPH) | https://www.myfamily.wic.ca.gov/ | 2026-07-04 |
| California Work Opportunity and Responsibility to Kids | Cash | California Department of Social Services | https://www.cdss.ca.gov/calworks | 2026-07-04 |
| California Universal School Meals | Education | California Department of Education | https://www.cde.ca.gov/ls/nu/sn/universalmealsfaq.asp | 2026-07-04 |
| Supplemental Security Income / State Supplementary Payment | Cash | Social Security Administration + CA SSP | https://www.ssa.gov/benefits/ssi/ | 2026-07-04 |
| Cash Assistance Program for Immigrants | Cash | California Department of Social Services | https://www.cdss.ca.gov/capi | 2026-07-04 |
| California LifeLine | Phone & Internet | California Public Utilities Commission | https://www.californialifeline.com/ | 2026-07-04 |
| California Earned Income Tax Credit + Young Child Tax Credit | Tax | California Franchise Tax Board | https://www.ftb.ca.gov/file/personal/credits/california-earned-income-tax-credit.html | 2026-07-04 |
| County General Assistance | Cash | County Department of Social Services | https://www.cdss.ca.gov/inforesources/general-assistance | 2025-02-01 |
| Property Tax Postponement | Housing | California State Controller's Office | https://www.sco.ca.gov/ardtax_prop_tax_postponement.html | 2026-07-04 |
| Covered California Premium Assistance | Health | Covered California | https://www.coveredca.com/ | 2026-07-04 |

### **Texas (TX)** — 10 programs, 5 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Texas SNAP (Lone Star Card) | Food | Texas Health and Human Services Commission | https://www.hhs.texas.gov/handbooks/texas-works-handbook/c-120-supplemental-nutrition-assistance-program | 2026-07-19 |
| Children's Medicaid & CHIP | Health | Texas Health and Human Services Commission | https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-members/chip | 2026-07-19 |
| Medicaid for Pregnant Women & CHIP Perinatal | Health | Texas Health and Human Services Commission | https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-programs-services/medicaid-pregnant-women-chip-perinatal | 2026-07-19 |
| Medicaid for Parents & Caretakers | Health | Texas Health and Human Services Commission | https://www.hhs.texas.gov/services/health/medicaid-chip/medicaid-chip-programs-services/programs-children-adults-disabilities/programs-children-families/medicaid-parents-caretakers | 2026-07-19 |
| TANF Cash Help | Cash | Texas Health and Human Services Commission | https://www.hhs.texas.gov/handbooks/texas-works-handbook/c-110-tanf | 2026-07-19 |
| Comprehensive Energy Assistance Program | Energy | Texas Dept. of Housing and Community Affairs | https://www.tdhca.texas.gov/comprehensive-energy-assistance-program-ceap | 2026-07-19 |
| Women, Infants & Children | Food | Texas WIC (HHSC) | https://texaswic.org/apply | 2026-07-19 |
| Supplemental Security Income | Cash | Social Security Administration | https://www.ssa.gov/benefits/ssi/ | 2026-07-19 |
| Homestead Exemption for Seniors & People with Disabilities | Housing | County Appraisal District / Texas Comptroller | https://comptroller.texas.gov/taxes/property-tax/exemptions/ | 2026-07-19 |
| Health Insurance Marketplace Savings | Health | HealthCare.gov (federal marketplace) | https://www.healthcare.gov/lower-costs/ | 2026-07-19 |

### **Florida (FL)** — 10 programs, 5 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Florida SNAP (Food Assistance) | Food | Florida Department of Children and Families | https://www.myflfamilies.com/services/public-assistance/supplemental-nutrition-assistance-program-snap/snap-eligibility/ | 2026-07-19 |
| Florida KidCare & Children's Medicaid | Health | Florida KidCare / Agency for Health Care Administration | https://www.floridakidcare.org/ | 2026-07-19 |
| Medicaid for Pregnant Women | Health | Florida Department of Children and Families | https://www.myflfamilies.com/services/public-assistance/medicaid | 2026-07-19 |
| Medicaid for Parents & Caretakers | Health | Florida Department of Children and Families | https://www.myflfamilies.com/services/public-assistance/medicaid | 2026-07-19 |
| Temporary Cash Assistance | Cash | Florida Department of Children and Families | https://www.myflfamilies.com/services/public-assistance/temporary-cash-assistance | 2026-07-19 |
| Low Income Home Energy Assistance Program | Energy | Florida Department of Commerce (local LIHEAP agencies) | https://floridajobs.org/community-development/Low-Income-Home-Energy-Assistance-Program | 2026-07-19 |
| Women, Infants & Children | Food | Florida Department of Health | https://www.floridahealth.gov/programs-and-services/wic/ | 2026-07-19 |
| Supplemental Security Income | Cash | Social Security Administration | https://www.ssa.gov/benefits/ssi/ | 2026-07-19 |
| Limited-Income Senior Additional Homestead Exemption | Housing | County Property Appraiser / Florida Dept. of Revenue | https://floridarevenue.com/property/Documents/AdditionalHomestead.pdf | 2026-07-19 |
| Health Insurance Marketplace Savings | Health | HealthCare.gov (federal marketplace) | https://www.healthcare.gov/lower-costs/ | 2026-07-19 |

### **New York (NY)** — 12 programs, 7 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| New York SNAP | Food | NY Office of Temporary and Disability Assistance | https://otda.ny.gov/programs/snap/ | 2026-07-19 |
| New York Medicaid | Health | NY State of Health / NYS Department of Health | https://info.nystateofhealth.ny.gov/ | 2026-07-19 |
| Essential Plan | Health | NY State of Health | https://info.nystateofhealth.ny.gov/EssentialPlan | 2026-07-19 |
| Child Health Plus | Health | NY State of Health / NYS Department of Health | https://www.health.ny.gov/health_care/child_health_plus/eligibility_and_cost.htm | 2026-07-19 |
| Family Assistance (Temporary Assistance) | Cash | NY OTDA / Local Department of Social Services | https://otda.ny.gov/programs/temporary-assistance/ | 2026-07-19 |
| Home Energy Assistance Program | Energy | NY Office of Temporary and Disability Assistance | https://otda.ny.gov/programs/heap/ | 2026-07-19 |
| Women, Infants & Children | Food | NYS Department of Health | https://www.health.ny.gov/prevention/nutrition/wic/ | 2026-07-19 |
| New York Universal Free School Meals | Education | NYS Education Department, Child Nutrition | https://www.cn.nysed.gov/content/new-york-state-universal-free-meals | 2026-07-19 |
| Supplemental Security Income + NY State Supplement | Cash | Social Security Administration + NY OTDA | https://otda.ny.gov/programs/ssp/ | 2026-07-19 |
| New York State Earned Income Credit | Tax | NYS Department of Taxation and Finance | https://www.tax.ny.gov/pit/credits/eitc.htm | 2026-07-19 |
| Enhanced STAR (School Tax Relief for Seniors) | Housing | NYS Department of Taxation and Finance | https://www.tax.ny.gov/pit/property/star/eligibility.htm | 2026-07-19 |
| NY State of Health Marketplace Savings | Health | NY State of Health | https://info.nystateofhealth.ny.gov/ | 2026-07-19 |

### **Pennsylvania (PA)** — 12 programs, 7 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Pennsylvania SNAP | Food | PA Department of Human Services | https://www.pa.gov/agencies/dhs/resources/snap/snap-income-limits | 2026-07-19 |
| Medical Assistance (PA Medicaid) | Health | PA Department of Human Services | https://www.pa.gov/services/dhs/apply-for-medicaid-coverage-for-pregnancy | 2026-07-19 |
| Pennsylvania CHIP | Health | PA Department of Human Services | https://www.pa.gov/agencies/dhs/resources/chip/eligibility-and-benefits | 2026-07-19 |
| TANF Cash Assistance | Cash | PA Department of Human Services / County Assistance Office | https://www.pa.gov/agencies/dhs/resources/cash-assistance/tanf | 2026-07-19 |
| Low Income Home Energy Assistance Program | Energy | PA Department of Human Services | https://www.pa.gov/agencies/dhs/newsroom/shapiro-administration-announces-opening-of-2025-26-liheap-seaso | 2026-07-19 |
| Women, Infants & Children | Food | PA Department of Health | https://www.pawic.com/ | 2026-07-19 |
| School Meals (Free Breakfast for All + Free/Reduced Lunch) | Education | PA Department of Education | https://www.pa.gov/agencies/education/programs-and-services/schools/food-and-nutrition.html | 2026-07-19 |
| Supplemental Security Income + PA State Supplement | Cash | Social Security Administration + PA DHS | https://www.ssa.gov/pubs/EN-05-11150.pdf | 2026-07-19 |
| Property Tax/Rent Rebate | Housing | PA Department of Revenue | https://www.pa.gov/agencies/revenue/ptrr | 2026-07-19 |
| PACE / PACENET Prescription Assistance | Health | PA Department of Aging | https://www.pa.gov/agencies/aging/aging-programs-and-services/pace-program | 2026-07-19 |
| PA Tax Forgiveness (Schedule SP) | Tax | PA Department of Revenue | https://www.pa.gov/agencies/revenue/forms-and-publications/pa-personal-income-tax-guide/tax-forgiveness | 2026-07-19 |
| Pennie Marketplace Savings | Health | Pennie (PA's official marketplace) | https://pennie.com/ | 2026-07-19 |

### **Illinois (IL)** — 11 programs, 6 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Illinois SNAP | Food | Illinois Department of Human Services | https://www.dhs.state.il.us/page.aspx?item=21738 | 2026-07-19 |
| Illinois Medicaid | Health | IL Dept. of Healthcare and Family Services | https://hfs.illinois.gov/medicalclients/maternal.html | 2026-07-19 |
| All Kids (Children's Coverage) | Health | IL Dept. of Healthcare and Family Services | https://hfs.illinois.gov/medicalprograms/allkids/income.html | 2026-07-19 |
| TANF Cash Assistance | Cash | Illinois Department of Human Services | https://www.dhs.state.il.us/Page.aspx?item=30358 | 2026-07-19 |
| Low Income Home Energy Assistance Program | Energy | IL Dept. of Commerce & Economic Opportunity | https://dceo.illinois.gov/communityservices/utilitybillassistance/howtoapply.html | 2026-07-19 |
| Women, Infants & Children | Food | Illinois Department of Human Services | https://www.dhs.state.il.us/page.aspx?item=30513 | 2026-07-19 |
| Supplemental Security Income | Cash | Social Security Administration | https://www.ssa.gov/benefits/ssi/ | 2026-07-19 |
| Illinois Earned Income Tax Credit + Child Tax Credit | Tax | Illinois Department of Revenue | https://tax.illinois.gov/programs/eitc.html | 2026-07-19 |
| Benefit Access Program (Free Transit + Plate Discount) | Cash | Illinois Department on Aging | https://ilaging.illinois.gov/benefitsaccess.html | 2026-07-19 |
| Low-Income Senior Citizens Assessment Freeze | Housing | County Assessor / Illinois Department of Revenue | https://tax.illinois.gov/localgovernments/property/taxrelief.html | 2026-07-19 |
| Get Covered Illinois Marketplace Savings | Health | Get Covered Illinois | https://getcovered.illinois.gov/get-started/about-the-marketplace.html | 2026-07-19 |

### **Ohio (OH)** — 9 programs, 5 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Ohio SNAP (Food Assistance) | Food | Ohio Department of Job and Family Services | https://codes.ohio.gov/ohio-administrative-code/rule-5101:4-2-02 | 2026-09-20 |
| Ohio Medicaid | Health | Ohio Department of Medicaid |  | 2026-09-20 |
| Healthy Start (Children's Coverage) | Health | Ohio Department of Medicaid |  | 2026-09-20 |
| Ohio Works First (Cash Assistance) | Cash | Ohio Department of Job and Family Services | https://codes.ohio.gov/ohio-administrative-code/rule-5101:1-23-20 | 2026-09-20 |
| Home Energy Assistance Program (HEAP) | Energy | Ohio Department of Development |  | 2026-09-20 |
| PIPP Plus (Percentage of Income Payment Plan) | Energy | Ohio Department of Development |  | 2026-09-20 |
| Women, Infants & Children | Food | Ohio Department of Health | https://odh.ohio.gov/know-our-programs/wic | 2026-09-20 |
| Ohio Earned Income Tax Credit | Tax | Ohio Department of Taxation | https://codes.ohio.gov/ohio-revised-code/section-5747.71 | 2026-09-20 |
| Marketplace Premium Savings | Health | HealthCare.gov | https://www.healthcare.gov/lower-costs/ | 2026-09-20 |

### **Georgia (GA)** — 8 programs, 4 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Georgia SNAP (Food Stamps) | Food | Georgia Division of Family & Children Services | https://dfcs.georgia.gov/food-assistance-eligibility-requirements | 2026-09-20 |
| Georgia Medicaid | Health | Georgia Department of Community Health |  | 2026-09-20 |
| Georgia Pathways to Coverage | Health | Georgia Department of Community Health | https://pathways.georgia.gov/eligibility | 2026-09-20 |
| PeachCare for Kids | Health | Georgia Department of Community Health |  | 2026-09-20 |
| TANF Cash Assistance | Cash | Georgia Division of Family & Children Services | https://dfcs.georgia.gov/services/temporary-assistance-needy-families/tanf-eligibility-requirements | 2026-09-20 |
| Home Energy Assistance (LIHEAP) | Energy | Georgia Division of Family & Children Services | https://dfcs.georgia.gov/services/low-income-home-energy-assistance-program-liheap | 2026-09-20 |
| Women, Infants & Children | Food | Georgia Department of Public Health | https://dph.georgia.gov/WIC | 2026-09-20 |
| Georgia Access Marketplace Savings | Health | Georgia Access | https://georgiaaccess.gov/ | 2026-09-20 |

### **North Carolina (NC)** — 8 programs, 4 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Food and Nutrition Services (SNAP) | Food | NC Department of Health and Human Services | https://policies.ncdhhs.gov/wp-content/uploads/FNS-220-Categorical-Eligibility-10.2024.pdf | 2026-09-20 |
| NC Medicaid | Health | NC Medicaid |  | 2026-09-20 |
| NC Medicaid for Children | Health | NC Medicaid |  | 2026-09-20 |
| Work First Family Assistance | Cash | NC Department of Health and Human Services | https://www.ncdhhs.gov/divisions/social-services/work-first-family-assistance/work-first-eligibility-and-income | 2026-09-20 |
| Low Income Energy Assistance (LIEAP) | Energy | NC Department of Health and Human Services | https://www.ncdhhs.gov/divisions/social-services/energy-assistance/low-income-energy-assistance-lieap | 2026-09-20 |
| Crisis Intervention Program | Energy | NC Department of Health and Human Services | https://www.ncdhhs.gov/divisions/social-services/energy-assistance | 2026-09-20 |
| Women, Infants & Children | Food | NC Department of Health and Human Services | https://www.nutritionnc.com/wic/ | 2026-09-20 |
| Marketplace Premium Savings | Health | HealthCare.gov | https://www.healthcare.gov/lower-costs/ | 2026-09-20 |

### **Michigan (MI)** — 8 programs, 5 categories

| Program | Category | Administering agency | Official source | last_verified |
| ----- | ----- | ----- | ----- | ----- |
| Food Assistance Program (SNAP) | Food | Michigan Department of Health and Human Services | https://mdhhs-pres-prod.michigan.gov/olmweb/ex/BP/Public/BEM/213.pdf | 2026-09-20 |
| Healthy Michigan Plan (Medicaid) | Health | Michigan Department of Health and Human Services |  | 2026-09-20 |
| Children's Health Coverage (MIChild) | Health | Michigan Department of Health and Human Services |  | 2026-09-20 |
| Family Independence Program (Cash) | Cash | Michigan Department of Health and Human Services | https://mdhhs-pres-prod.michigan.gov/olmweb/ex/rf/public/rft/210.pdf | 2026-09-20 |
| State Emergency Relief — Energy | Energy | Michigan Department of Health and Human Services | https://mdhhs-pres-prod.michigan.gov/olmweb/ex/er/public/erm/301.pdf | 2026-09-20 |
| Women, Infants & Children | Food | Michigan Department of Health and Human Services | https://www.michigan.gov/mdhhs/assistance-programs/wic | 2026-09-20 |
| Michigan Earned Income Tax Credit | Tax | Michigan Department of Treasury | https://www.michigan.gov/taxes/iit/tax-guidance/credits-exemptions/eitc | 2026-09-20 |
| Marketplace Premium Savings | Health | HealthCare.gov | https://www.healthcare.gov/lower-costs/ | 2026-09-20 |

### **Volatile — re-check before each release**

*No program currently carries a `volatile` note.*

<!-- END:state-packs -->

---

[https://opendoor-nj.vercel.app](https://opendoor-nj.vercel.app)   
