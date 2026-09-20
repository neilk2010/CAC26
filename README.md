# OpenDoor

A free, informational tool that helps people find public benefit and assistance
programs they may qualify for (food, energy, school aid, utility help, healthcare,
and local programs), explains them in plain language, and points them to the
official place to apply.

Built for the Congressional App Challenge 2026. Full feature plan and ground rules
in [`OpenDoor_feature_plan.md`](./OpenDoor_feature_plan.md).

## Ground rules

- **Informational only, never official.** OpenDoor never makes an official
  eligibility decision — every result says "you may qualify" and links to the
  real agency to confirm.
- **No account needed, ever.** The full tool works anonymously — every answer
  lives in your browser's local storage only, and nothing is sent to a server.
- **Accounts are optional, minimal, and deletable.** Signing in only unlocks
  saving your results across devices (`src/app/api/account/screening`,
  Clerk + Neon Postgres) — one row per account, the same shape as the
  on-device snapshot, deletable in one click from `/account`. Nothing about
  the screener itself is ever gated behind login.
- **Open data and open-source only.** No paid or license-restricted data feeds.

## How it works

Everything the app screens against is data — adding a program, state, question,
or population is a data edit, never a code change.

- `src/lib/types.ts` — core data shapes (`Household`, `Program`, `EligibilityResult`,
  `FlagQuestion`, `StateMeta`).
- `src/data/states/<STATE>/{meta,programs}.ts` — rules-as-data program packs.
- `src/data/questions.ts` — the intake question catalog (the single source of
  truth for every screening dimension; the engine and wizard both read it).
- `src/data/populations.ts` — data-defined population modules (seniors, families,
  veterans, students, immigrants) that tailor intake and results.
- `src/lib/engine.ts` — evaluates a household against program rules (income,
  categorical requirements, and resource/asset limits) and produces a confidence
  label + plain-language reason trace per program.
- `src/components/{intake,results,marketing,ui,layout}` — the design system and
  the composed views.
- `src/app/(screener)/{intake,results,cliff-simulator}` — the screener flow,
  including the benefits-cliff simulator (flagship feature).
- `src/app/(marketing)/{page,about,how-it-works,for/[population]}` — the marketing
  pages, including data-driven per-population landings.

Currently ships with eleven full-coverage states — New Jersey (the default),
California, Texas, Florida, New York, Pennsylvania, Illinois, Ohio, Georgia,
North Carolina, and Michigan — each with a hand-verified state pack on top of
the federal baseline, plus an honest federal-tier experience for the other 40
jurisdictions.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local results (address → county → real data)

`src/app/api/near-you/route.ts` turns an address into local benchmarks and
nearby resources: Census geocoder (address → county/tract) → HUD Fair Market
Rent & income limits → HUD LIHTC affordable-housing properties → HRSA health
centers (health flow only). Each step reports honestly if a source is down —
never a blank or invented result.

The address is sent to the Census Bureau's public geocoder server-side only —
never stored or logged by this app.

FMR/income limits need a free HUD API token: register at
[huduser.gov's FMR API page](https://www.huduser.gov/portal/dataset/fmr-api.html)
and add it to your own `.env.local` (see `.env.example`; never commit it):

```
HUD_TOKEN=your-token-here
```

Without a token, geocoding, LIHTC properties, and health centers still work —
only rent/income-limit benchmarks are unavailable.

## Optional accounts (save results across devices)

Signing in is never required — it only unlocks saving your results so you can
pick them up on another device. Auth is [Clerk](https://clerk.com)
(`src/app/sign-in`, `src/app/sign-up`, `src/proxy.ts`); storage is a single
Neon Postgres table (`src/db/schema.ts`) holding one row per account — the
same `{household, confidences}` shape as the on-device snapshot
(`src/lib/snapshot.ts`), nothing more. `src/app/api/account/screening/route.ts`
is the only route that touches it, gated by `auth()` on every handler.
`/account` shows the saved screening and a one-click delete.

Both are provisioned via the Vercel Marketplace
(`vercel integration add clerk` / `vercel integration add neon`), which
auto-populates `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, and
`DATABASE_URL` — see `.env.example`. Without them set, the guest flow (intake,
results, cliff-simulator, packet) is completely unaffected; only the
sign-in/sign-up pages and the save button would need them configured to work.

## Collaborating

This repo is shared between contributors as collaborators — clone it, create a
branch or work on `main` directly, and `git pull` / `git push` to stay in sync.
For live pair-programming, use the CodeTogether extension alongside git.
