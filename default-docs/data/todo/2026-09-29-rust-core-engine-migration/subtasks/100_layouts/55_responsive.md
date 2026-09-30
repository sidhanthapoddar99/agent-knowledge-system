---
title: "Responsive layouts: breakpoints and mobile checks"
status: open
---

Every layout must work from a 320-pixel phone to a large desktop, with no visual mismatch between navbar, content and footer at any width. [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) holds this goal today with its remaining work undone. In the new frontend, layout CSS lives in `agentks-ui`, so its breakpoints and mobile behaviour become acceptance checks for every layout. This leaf takes over that issue's open items, defines the breakpoint rules once, and adds the automated checks.

# 01 To Do
- [ ] **One breakpoint scale** carried from today's [breakpoints](../../../../../../agent-ks-engine/src/styles/breakpoints.css): xs 480, sm 640, md 768, lg 1024, xl 1280, 2xl 1536, 3xl 1920, 4k 2560 pixels. Raw values in media queries (custom properties cannot be used there); no invented breakpoints. A stylelint rule rejects any other width in `@media`.
- [ ] **Aligned breakpoints** across components (absorbed 01, open): navbar, sidebar, outline, body and footer switch at the same widths; `--max-width-primary` and `--max-width-secondary` keep navbar, content and footer edges aligned.
- [ ] **Mobile behaviour per layout** (absorbed 02):
    - [ ] Navbar mobile menu ([50](./50_navbar-and-footer.md)).
    - [ ] Sidebar as a drawer ([080/60](../080_ui-and-client/60_pwa-and-mobile.md)).
    - [ ] Touch-friendly controls, at least 44 by 44 pixels.
    - [ ] No horizontal page overflow; tables and code scroll inside their box.
    - [ ] The tracker index switches to card view below md; the detail page stacks its side panels below the body.
- [ ] **Responsive typography** uses the semantic tokens; fluid `clamp()` only on display surfaces (home, countdown).
- [ ] **Images.** `srcset` and lazy loading are produced by Rust's asset pipeline ([150/20](../150_publishing/20_ssg-renderer.md) for published sites); layouts only place the markup.
- [ ] **Automated checks** (Playwright, run in the parity workflow): one page per layout kind at 320, 375, 768, 1024, 1440 and 1920 pixels, light and dark — fail on any horizontal overflow of the document, any tap target under 44 pixels in the mobile widths, or misaligned navbar, content and footer edges; screenshots archived for review.
- [ ] **Document** the spacing and breakpoint system for theme authors ([180/30 themes and layouts](../180_documentation/30_themes-and-layouts.md)) (absorbed 01, open).

## Guardrails
- One scale; no per-layout breakpoints.
- Responsiveness never hides content a reader needs; it moves it (drawer, stacked panels).

## Done when
- The Playwright checks pass for every layout kind at every width.
- The absorbed issue's open items are all covered by a check above.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: component CSS in `apps/packages/agentks-ui`, checks in `apps/agentks-client/tests/responsive/`.
- **Absorbed:** [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) — [01 sizing consistency](../../../2025-06-25-sizing-and-responsive/subtasks/01_sizing-consistency.md) (aligned breakpoints, spacing docs) and [02 mobile responsive](../../../2025-06-25-sizing-and-responsive/subtasks/02_mobile-responsive.md) (audit, navbar menu, drawer, fluid type, touch targets, 320–1920 testing, overflow, images).
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (section 08), [the client application](../../notes/03_frontend/02_client-application.md) (section 08).
- **Depends on:** leaves 15 to 50 of this group.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): breakpoints and mobile layouts become acceptance checks for the layouts ([impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md)).
- Decided (sidhantha, 2026-09-30): the client is mobile friendly.

# 05 Notes & Analysis
## Watch out
- Screenshots catch what overflow checks miss; review the archive by eye before closing, as the parity rule "nothing drastic" requires.
