---
title: "Reserved-URL guard — reject a docs section base URL of 'artifacts'"
status: review
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

- [x] **Define the reserved-segment list.** A single source-of-truth constant
      (e.g. `RESERVED_BASE_URLS`) covering the route prefixes that must never be
      a page `base_url`: `artifacts`, `assets`, `content-assets`, `api`,
      `editor`. Match against the normalized base URL (strip a leading `/`, as
      `route-match.ts:62` does). Done when the constant is defined once and
      referenced by the check.
      <!-- DONE: `export const RESERVED_BASE_URLS = ['artifacts','assets',
      'content-assets','api','editor'] as const;` added to config.ts (above
      validateRoutes), plus a `RESERVED_BASE_URL_REASONS` map for per-segment
      "why" text; also re-exported from loaders/index.ts. The check normalizes
      with `url.replace(/^\//,'').replace(/\/$/,'')` (leading + trailing slash)
      then equality-matches the set. -->



- [x] **Wire the check into `loadSiteConfig()`.** In or next to the
      pages-resolution loop (`config.ts:209-216`), iterate `config.pages` and
      throw if any `base_url` (normalized) equals a reserved segment. Prefer
      extending `validateRoutes` with the reserved list and **calling it** from
      `loadSiteConfig` (it is currently dead code) so both the overlapping-route
      check and the reserved-segment check run. Done when a section with
      `base_url: artifacts` prevents `loadSiteConfig` from returning.
      <!-- DONE: chose the resurrect-validateRoutes path. Extended
      `validateRoutes()` with the reserved-segment loop (it already did
      overlapping-route detection), and called it from `loadSiteConfig()` right
      after the pages-resolution loop and BEFORE the cache set, so a bad config
      is never cached: `const routeErrors = validateRoutes(config.pages); if
      (routeErrors.length) throw new Error(routeErrors.join('\n\n'));`. The dead
      overlapping-route check is now live too. -->



- [x] **Write an actionable error message.** It must name the offending page key,
      its `base_url`, the reserved word, *why* it's reserved (the `/artifacts`
      full-page route), and the fix (choose a different base URL). Model the tone
      on the existing config throws. Example shape:
      `[CONFIG ERROR] Page "showcase" uses base_url "artifacts", which is
      reserved by the built-in /artifacts/<path> route for full-page artifacts.
      Rename this section's base_url (e.g. "showcases"). Reserved base URLs:
      artifacts, assets, content-assets, api, editor.` Done when the thrown
      message contains the page name, the reserved word, and the fix.
      <!-- DONE. Actual thrown message (verified live):
      `[CONFIG ERROR] Page "dev-docs" uses base_url "/artifacts", which is
      reserved by the built-in /artifacts/<path> route that serves full-page HTML
      artifacts. Rename this section's base_url to a non-reserved value in
      site.yaml. Reserved base URLs: artifacts, assets, content-assets, api,
      editor.` Per-segment "why" comes from RESERVED_BASE_URL_REASONS so each
      reserved word names its own route (e.g. content-assets → the
      /content-assets/<path> route). -->



- [x] **Verification (failure path).** Temporarily set an existing docs section's
      `base_url` to `artifacts` in `default-docs/config/site.yaml`, run
      `./start dev`, and confirm the dev server **refuses to start** with the
      actionable message (not a stack trace into unrelated code, not a silent
      shadowing). Repeat once with `content-assets` to prove the latent hole is
      closed too. Revert the config afterward. Done when both bad values hard-fail
      with the intended message and the reverted config starts clean.
      <!-- DONE. Set dev-docs base_url="/artifacts" → build hard-throws with the
      [CONFIG ERROR] message pointing at config.ts:108 (the throw). Set
      base_url="content-assets" (bare, no slash → also proves normalization) →
      hard-throws naming the /content-assets route. site.yaml reverted (git diff
      empty) and the full build then succeeds (751 pages). -->



- [x] **Verification (happy path + guard docs).** Confirm a normal config (no
      reserved base URLs) still loads and `docs-guide check config` passes. The
      user-facing statement of this limitation is authored in
      [`60_documentation.md`](./60_documentation.md) and the skills learn it in
      [`50_skills-integration.md`](./50_skills-integration.md) — this subtask owns
      only the enforcement; cross-check that those two land the same reserved-word
      list so code and docs never drift.
      <!-- DONE (enforcement half). Reverted config: full build loads clean (751
      pages), so loadSiteConfig()'s guard does not fire on a normal config.
      `docs-guide check config` reports ONE error but it is PRE-EXISTING and
      unrelated: pages.issues-test.data → @data/issues-test dir is missing (a
      separate data-dir-existence check, not the reserved-URL guard). No
      reserved-URL error is raised on the normal config. CROSS-CHECK FOR
      REVIEWER: 50/60 subtasks must publish the SAME list —
      `artifacts, assets, content-assets, api, editor` — sourced from
      RESERVED_BASE_URLS in config.ts (now barrel-exported) so code and docs
      never drift. Those two docs/skill subtasks are owned by other agents. -->

