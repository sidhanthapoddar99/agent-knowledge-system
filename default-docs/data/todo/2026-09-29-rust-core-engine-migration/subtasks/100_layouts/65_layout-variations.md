---
title: "Layout variations: what survives, on demand"
status: open
---

[2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) collected ideas for more layout shapes: extra docs styles, sidebar and outline variations, navbar and footer variants, and extra built-in themes. After the migration, layouts are built-in components added only on demand, and branding is CSS. This leaf sorts that backlog into what survives as an on-demand candidate and what is dropped, so the old issue can be closed, and keeps the candidates in one list for the plan to schedule when needed.

# 01 To Do
- [ ] **Sort the backlog** into the table in `05` below, confirming each verdict against the new rules.
- [ ] **Built-in themes** (absorbed 04): themes are CSS, not layouts. Ship at most two extra themes with 1.0.0 if they prove the contract (for example a high-contrast one); the rest become examples in the theme docs. Each theme passes the contract check ([10](./10_theme-contract-and-css.md)).
- [ ] **Candidates stay here** until the plan schedules one; each, when built, follows "Adding a built-in layout" in [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) section 01.

## Guardrails
- Nothing speculative is built ahead of demand.
- A variant that CSS can express is a CSS example in the docs, not a new layout.

## Done when
- Every item of the absorbed issue has a verdict in the table below, and the old issue can be superseded pointing here.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** decisions in this leaf; any built candidate goes to `apps/packages/agentks-ui/src/layouts/`.
- **Absorbed:** [layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) subtasks [01 doc layouts](../../../2025-06-25-layouts-and-variations/subtasks/01_doc-layouts.md), [02 page templates](../../../2025-06-25-layouts-and-variations/subtasks/02_page-templates.md) (see [45](./45_custom-pages.md)), [03 navbar and footer](../../../2025-06-25-layouts-and-variations/subtasks/03_navbar-and-footer.md) (see [50](./50_navbar-and-footer.md)), [04 built-in themes](../../../2025-06-25-layouts-and-variations/subtasks/04_built-in-themes.md).
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md), [impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md) (layouts-and-variations row).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): layouts are added on demand only; some items of the variations issue are speculative and should be dropped rather than carried.

# 05 Notes & Analysis
## 01 Proposed verdicts (claude, 2026-09-30; confirm when this leaf runs)

| Item | Verdict | Why |
|---|---|---|
| `doc_style3`: wide content, no sidebar | Covered | `@docs/compact` is exactly this |
| `doc_style4`: split view, sidebar plus TOC | Covered | `@docs/default` already has sidebar and outline |
| Sidebar icons, badge counts | Candidate | Needs data from Rust (counts); build on demand |
| Search in sidebar | Moved | Site search, [150/40](../150_publishing/40_static-search.md) and the retrieval index |
| Outline on the left or floating | CSS | A hook plus a CSS example |
| Landing page with hero, about page | Covered | `home`, `info` ([45](./45_custom-pages.md)) |
| Contact page, more custom templates | Dropped | Speculative; an artifact or fragment covers one-offs |
| Centred-logo navbar | CSS | A hook plus a CSS example |
| Four-column footer | Candidate | The default footer may already take columns; check on demand |
| Mega menu navbar | Dropped | Speculative |
| Corporate, Playful, Terminal themes | Examples | Theme docs examples; at most one or two shipped |
