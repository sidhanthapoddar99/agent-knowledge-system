---
title: "Homepage: checks in the gate"
status: open
---

The homepage is small, so its checks can be strict and automatic: a Lighthouse score floor, an accessibility scan, a link check, a bundle size budget and screenshots in both themes and at two widths. This leaf adds them to the gate so a later change cannot quietly break the page.

# 01 To Do
- [ ] **Lighthouse** on the exported page (with `@lhci/cli` against a local static server): performance ≥ 90, accessibility ≥ 95, best practices ≥ 95, SEO ≥ 95, on mobile emulation. Fail below the floor.
- [ ] **Accessibility** with `@axe-core/playwright`: no serious or critical findings in light and dark mode.
- [ ] **Links** — every link on the page resolves: internal links to files in the export or to `/docs/…` paths that exist in the docs build, external links answer 2xx or 3xx (external checks nightly, not on every push).
- [ ] **Bundle budget** — total JavaScript shipped by the homepage under 150 KB gzipped (a proposal; set from the first build plus a margin and record it).
- [ ] **Screenshots** — Playwright screenshots at 1440 and 390 px wide, light and dark, stored as CI artifacts for review.
- [ ] **No console errors** on load.
- [ ] **Wire the checks in.** The gate already runs the homepage's lint (oxlint), typecheck and `bun test` ([20](./20_app-scaffold.md)). Lighthouse, axe, the screenshots and the console check need a browser, so they belong in the ladder's `e2e` rung, which the repository does not list yet: add that rung with the shared Playwright harness from [170/30](../170_testing/30_end-to-end.md). Also run the checks in the website workflow, so a failing homepage blocks a deploy.

## Guardrails
- A floor can be lowered only in a change that says why.

## Done when
- The e2e rung runs every check above and passes on the finished page.
- A deliberately broken change (remove an `alt` text, add a 300 KB script) fails the checks.

# 02 Status and Result
Open. Not started. The 2026-10-01 rebuild's screenshots were taken by hand, not in the gate; the Playwright MCP needs Google Chrome installed on this machine.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `apps/agentks-homepage/` and `tests/e2e/`.
- **Read first:** [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) (the gate and CI).
- **Depends on:** [190/30 sections](./30_sections.md), [170/30 end to end](../170_testing/30_end-to-end.md) (the shared Playwright harness).
- **Unblocks:** [195/20 build and deploy pipeline](../195_hosting/20_build-and-deploy-pipeline.md).

# 04 Decisions
- Decided (claude, 2026-09-30): Lighthouse floors of 90 for performance and 95 for the rest, on mobile emulation, because the page is static and small and has no reason to score lower.

# 05 Notes & Analysis

## Watch out
- Lighthouse scores vary between runs. Run three times and use the median, like the performance budget ([170/40](../170_testing/40_performance-budget.md)).
