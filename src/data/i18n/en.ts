// English chrome strings — the source of truth for keys. es.ts must cover
// every key here (typed as Record<TranslationKey, string>). Templates use
// {name} placeholders, filled by formatT in lib/i18n.tsx.

export const en = {
  // Nav
  "nav.checkEligibility": "Check eligibility",
  "nav.myResults": "My results",
  "nav.cliffSimulator": "Cliff simulator",
  "nav.search": "Search",
  "nav.searchAria": "Search programs and pages",
  "nav.localPrivate": "Local and private",
  "nav.signIn": "Sign in",
  "nav.myAccount": "Saved results",
  "nav.startOver": "Start over",
  "nav.startOverAria": "Clear this device's answers and start over — for shared or public computers",

  // Hero
  "hero.headline1": "Open every door",
  "hero.headline2": "you already",
  "hero.headlineAccent": "qualify for.",
  "hero.sub":
    "Food, health, energy, and cash assistance — explained in plain language, with a real application link for every result. No login required. No guesswork.",
  "hero.cta": "Check my eligibility",
  "hero.how": "See how it works",
  "hero.pill0": "No login required",
  "hero.pill1": "Not a government site",
  "hero.pill2": "Free forever",
  "hero.pill3": "Open data only",
  "hero.mockLabel": "your results",
  "hero.mockValue": "Est. value you may be missing",
  "hero.mockLikely": "Likely eligible",
  "hero.mockPossible": "Possibly eligible",

  // Home — the orbit section
  "home.momentsTitle": "Built for the moments life throws at you",
  "home.momentsSub": "Whoever you are, there's a door with your name on it.",
  "home.momentsHint": "Hover to pause the sky; click to walk in.",

  // Intake wizard chrome
  "intake.step": "step {n} of {total}",
  "intake.stepLabel.state": "your state",
  "intake.stepLabel.size": "household",
  "intake.stepLabel.income": "income",
  "intake.stepLabel.flags": "situations",
  "intake.stepLabel.assets": "savings",
  "intake.stepLabel.review": "review",
  "intake.stateTitle": "Which state are you in?",
  "intake.stateSub":
    "Every state works: federal programs and address-based local data are national. States marked",
  "intake.stateSubEnd": "also carry a hand-verified pack of their own state programs.",
  "intake.fullCoverage": "full coverage",
  "intake.sizeTitle": "How many people are in your household?",
  "intake.incomeTitle": "About how much does your household bring in before taxes, per month?",
  "intake.incomeSub": "A range is fine — exact numbers aren't needed.",
  "intake.flagsTitle": "A few more questions",
  "intake.flagsSub":
    "We only ask what still matters based on your answers so far. Skip any you're not sure about.",
  "intake.flagsNone": "Nothing else we need — you're all set.",
  "intake.optional": "optional",
  "intake.whyWeAsk": "Why we ask:",
  "intake.yes": "Yes",
  "intake.no": "No",
  "intake.skip": "Skip",
  "intake.continue": "Continue",
  "intake.back": "← Back",
  "intake.assetsTitle": "About how much does your household have in savings and other resources?",
  "intake.assetsSub":
    "Think checking, savings, and cash — a home and usually one car don't count.",
  "intake.reviewTitle": "Ready to see your results",
  "intake.reviewSub": "{possible} of {total} programs still look possible based on your answers.",
  "intake.seeResults": "See my results",
  "intake.esNote":
    "Questions and program details are shown in English for now — the buttons and steps are in Spanish.",

  // Results
  "results.eyebrow": "your results",
  "results.title": "Here's what we found",
  "results.intro":
    "Based on what you told us for a household of {size} in {state}. This is general information, not an official decision — every program links to the real agency so they can confirm.",
  "results.esNote":
    "Program details and reason traces come from official sources and are shown in English for now.",
  "results.editAnswers": "← Edit my answers",
  "results.tryCliff": "Try the benefits-cliff simulator",
  "results.deadlines": "My deadline timeline",
  "results.packet": "My printable benefits packet",
  "results.clear": "Clear my answers",

  // Dashboard
  "dash.eyebrow": "Est. money you may be leaving unclaimed",
  "dash.perYear": "/yr",
  "dash.midpoint":
    "Midpoint of {range} across {count} program{plural} you may qualify for — an estimate, not a guarantee. Every card below links to the agency that decides.",
  "dash.noMoneyEyebrow": "Your screening so far",
  "dash.noMoneyBody":
    "Nothing here carries a dollar estimate yet — the counts on the right show what's still open, and answering more questions can unlock more.",
  "dash.of": "of",
  "dash.likely": "Likely",
  "dash.stillOpen": "Still open",
  "dash.screened": "Screened",
  "dash.ringAria": "{open} of {total} screened programs still open to you",
  "dash.panelAria": "Your results at a glance",

  // Results controls
  "controls.expandAll": "Expand all",
  "controls.collapseAll": "Collapse all",
  "controls.comfortable": "Comfortable",
  "controls.compact": "Compact",
  "controls.densityAria": "Display density",

  // Search palette
  "search.placeholder": "Try a life phrase — “pregnant”, “food stamps”, “can't pay rent”…",
  "search.aria": "Search programs, rooms, and pages",
  "search.tryThese": "try one of these",
  "search.noMatch": "Nothing matched that — but the full questionnaire checks everything we screen.",
  "search.startThere": "Start there",
  "search.footer": "↑↓ choose · enter to open · searches only this device",
  "search.kind.program": "program",
  "search.kind.scope": "room",
  "search.kind.page": "page",

  // Unique-to-your-state (derived in lib/uniqueness.ts — never hardcoded)
  "unique.badge": "Only in {code}",
  "unique.badgeRare": "{count} states",
  "unique.srExclusive": "Only {state} offers this among the {covered} states OpenDoor covers in depth.",
  "unique.srRare": "Offered in just {count} of the {covered} states OpenDoor covers in depth.",
  "unique.panelLabel": "unique to {state}",
  "unique.panelTitle": "Unique to {state} — programs most states don't have",
  "unique.panelIntro": "No other state OpenDoor covers in depth runs these. They're easy to miss precisely because national guides don't mention them.",
  "unique.panelFootnote": "Based on the {covered} states with hand-verified program packs. As more states are added, this list updates itself.",

  // Accessibility panel
  "a11y.openAria": "Accessibility options",
  "a11y.title": "Accessibility",
  "a11y.closeAria": "Close accessibility options",
  "a11y.textSize": "Text Size",
  "a11y.textSizeAria": "Text size",
  "a11y.highContrast": "High Contrast",
  "a11y.dyslexiaFont": "Dyslexia Font",
  "a11y.reduceMotion": "Reduce Motion",
  "a11y.reset": "Reset",

  // Footer
  "footer.about": "About",
  "footer.how": "How it works",
  "footer.check": "Check eligibility",
  "footer.disclaimer":
    "OpenDoor is informational only — not affiliated with any government agency. Built for the Congressional App Challenge 2026.",
  "footer.credit": "Built by Neil Kumar and Rishanth Yavasani",
} as const;

export type TranslationKey = keyof typeof en;
