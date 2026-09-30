---
title: "Roadmap and releases layouts (on demand, after 1.0.0)"
status: open
---

Two new first-class content types were planned for Astro: **Roadmap** (a forward-looking view of planned and in-flight work, built from tracker data) and **Releases** (a changelog: folder per release, newest first). They fit the rule "more built-in layouts, on demand", but every task in [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) names Astro files. This leaf re-plans both on the new architecture — a Rust loader and derived data, a component in `agentks-ui` — and holds them until after 1.0.0 unless a need appears sooner.

# 01 To Do
- [ ] **Roadmap** (absorbed 01):
    - [ ] Data from the tracker, not a new folder: Rust derives a roadmap payload from issues filtered by status, priority, component and labels. No milestone or release-bucket field — the project rules out scheduling fields.
    - [ ] Layout `@roadmap/default`: lanes grouped by status category, then priority; drafts (`draft: true` issues) hidden; filter by component and label as an island matching values.
    - [ ] Items link to their issue pages.
- [ ] **Releases** (absorbed 02):
    - [ ] Folder per release `YYYY-MM-DD-vX.Y.Z/` with `settings.json` (version, date, summary, tags, included issue ids) and `release.md`; Rust loads and validates them.
    - [ ] Layout `@releases/default`: index newest first (version, date, summary, tag filter), detail page with the changelog body and included issues deep-linked by URLs Rust resolves.
    - [ ] RSS and Atom feed: a Phase 3 publishing output ([150/60 SEO, sitemap and feeds](../150_publishing/60_seo-sitemap-feeds.md)).
- [ ] **Each type in one change:** the Rust loader and payload, the component, the content-format doc, the user-guide page, and a fixture.

## Guardrails
- On demand: start only when the plan schedules it or a user needs it.
- No scheduling fields in the tracker, ever, without an explicit policy reversal.

## Done when
- For each type: a fixture section renders in the client with parity between the local client and the static build, and its docs page exists.

# 02 Status and Result
Open. Not started. Scheduled after 1.0.0 unless the plan says otherwise.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/agentks-engine` (loaders and payloads), `apps/packages/agentks-ui/src/layouts/{roadmap,releases}/`.
- **Absorbed:** [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) — [01 roadmap](../../../2026-04-10-new-layout-types/subtasks/01_roadmap.md), [02 releases](../../../2026-04-10-new-layout-types/subtasks/02_releases.md).
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (section 01, "Adding a built-in layout"), [content format](../../notes/02_engine/01_content-format.md).
- **Depends on:** [25](./25_issues-layouts.md) (shared tracker parts), [030/60 tracker loader](../030_rust-engine/60_tracker-loader.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): more built-in layouts over time, only on demand; RSS belongs to Phase 3 ([impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md)).
- Decided (sidhantha, 2026-09-29): the roadmap filters by status, priority, component and labels, not milestones.

# 05 Notes & Analysis
## Watch out
- Adding a content type touches routing in Rust (a new page kind in the manifest). Keep the `kind` list in one place ([080/20](../080_ui-and-client/20_shared-ui-package.md)).
