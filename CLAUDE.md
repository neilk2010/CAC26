@AGENTS.md

## TODO before submission

- [ ] **Refresh `lastVerified` dates + figures (manual data QA).** Every program
  in `src/data/states/*/programs.ts` (and `FPL_LAST_VERIFIED` / the FPL numbers in
  `src/data/fpl.ts`) is stamped `2025-02-01` and uses 2025 figures. Each needs a
  human to re-read its official source and update the numbers + date — do NOT
  bump the dates without actually re-checking (unverified figures would violate
  the project's own "open data, verify with the agency" ground rule).

