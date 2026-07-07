---
title: "Reserved-URL guard — reject a docs section base URL of 'artifacts'"
status: open
---

## Goal

Because the full-page route [`20_route.md`](./20_route.md) claims `/artifacts`,
a docs section whose `base_url` is `artifacts` would silently shadow-fight the
route (route priority means the static `/artifacts/` segment wins, so the
section's pages would become unreachable with no error). Close that at **config
load time** with a hard, actionable failure — the same class of protection the
framework already gives for missing themes and out-of-range engine versions.

This subtask depends on `20` (the reserved prefix must exist to be worth
guarding) and it also closes a pre-existing latent hole: today **nothing** stops
`base_url: "content-assets"` or `base_url: "assets"` from shadowing those
serving routes either. Whatever reserved-segment list we introduce for
`artifacts` should cover all of them.

## Where the guard belongs (verified)

- Base URLs come from `site.yaml → pages.<name>.base_url`
  (`PageConfig`, `astro-doc-code/src/loaders/config.ts:37-42`), consumed by the
  router at `route-match.ts:62` and `static-paths.ts:23`.
- Put the check inside **`loadSiteConfig()`** (`config.ts:138-222`), next to the
  pages-resolution loop at `:209-216`. That function runs once, is cached with
  `site.yaml` as its dependency (`:219`), and precedes all routing — a bad
  config never reaches the router.
- **Error style: hard throw**, matching the config-level precedents — `getTheme`
  missing-theme throw (`config.ts:246-250`), missing-`paths:` throw
  (`paths.ts:190-198`), reserved-key throw (`paths.ts:203-207`), and the version
  gate `assertContentVersionSupported` (`config.ts:172`). Content-level problems
  use `addError`/`addWarning` collection, but a reserved-base_url clash is a
  config error, so it must **hard-stop startup**, not surface as a dismissable
  toolbar warning.
- There is already a `validateRoutes(pages)` function
  (`config.ts:354-386`) that checks for overlapping routes — but it is **never
  called** anywhere except the barrel export (`src/loaders/index.ts`). Either
  wire a fresh inline check into `loadSiteConfig`, or **resurrect
  `validateRoutes`** by calling it from `loadSiteConfig` and extending it with a
  reserved-segment list. Resurrecting it is the cleaner move — it puts the
  overlapping-route check to work at the same time.

## Tasks

- [ ] **Define the reserved-segment list.** A single source-of-truth constant
      (e.g. `RESERVED_BASE_URLS`) covering the route prefixes that must never be
      a page `base_url`: `artifacts`, `assets`, `content-assets`, `api`,
      `editor`. Match against the normalized base URL (strip a leading `/`, as
      `route-match.ts:62` does). Done when the constant is defined once and
      referenced by the check.

- [ ] **Wire the check into `loadSiteConfig()`.** In or next to the
      pages-resolution loop (`config.ts:209-216`), iterate `config.pages` and
      throw if any `base_url` (normalized) equals a reserved segment. Prefer
      extending `validateRoutes` with the reserved list and **calling it** from
      `loadSiteConfig` (it is currently dead code) so both the overlapping-route
      check and the reserved-segment check run. Done when a section with
      `base_url: artifacts` prevents `loadSiteConfig` from returning.

- [ ] **Write an actionable error message.** It must name the offending page key,
      its `base_url`, the reserved word, *why* it's reserved (the `/artifacts`
      full-page route), and the fix (choose a different base URL). Model the tone
      on the existing config throws. Example shape:
      `[CONFIG ERROR] Page "showcase" uses base_url "artifacts", which is
      reserved by the built-in /artifacts/<path> route for full-page artifacts.
      Rename this section's base_url (e.g. "showcases"). Reserved base URLs:
      artifacts, assets, content-assets, api, editor.` Done when the thrown
      message contains the page name, the reserved word, and the fix.

- [ ] **Verification (failure path).** Temporarily set an existing docs section's
      `base_url` to `artifacts` in `default-docs/config/site.yaml`, run
      `./start dev`, and confirm the dev server **refuses to start** with the
      actionable message (not a stack trace into unrelated code, not a silent
      shadowing). Repeat once with `content-assets` to prove the latent hole is
      closed too. Revert the config afterward. Done when both bad values hard-fail
      with the intended message and the reverted config starts clean.

- [ ] **Verification (happy path + guard docs).** Confirm a normal config (no
      reserved base URLs) still loads and `docs-guide check config` passes. The
      user-facing statement of this limitation is authored in
      [`60_documentation.md`](./60_documentation.md) and the skills learn it in
      [`50_skills-integration.md`](./50_skills-integration.md) — this subtask owns
      only the enforcement; cross-check that those two land the same reserved-word
      list so code and docs never drift.
