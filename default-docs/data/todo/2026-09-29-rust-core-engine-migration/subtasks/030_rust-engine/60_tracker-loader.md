---
title: "Tracker loader — issues, anatomy sections, statuses and derived fields in Rust"
status: in-progress
---

The tracker is the most complex section type: one folder per issue, seven anatomy sections read by four different readers, a fixed eight-status vocabulary, and derived fields (`created`, `updated`, status category, subtask counts, the review queue, filter options). Today these rules exist twice: in the Astro loader and in the Rust CLI's `issue` and `check issues` commands. This leaf merges them into one implementation that the issues pages, `agentks issue …` and `agentks check issues` all call.

# 01 To Do
- [ ] **The section registry**, one declaration of each anatomy section's identity (folder, URL segment, field, sub-doc kind, label), ported from [issue-sections.ts](../../../../../../agent-ks-engine/src/loaders/issue-sections.ts): `subtasks/`, `notes/`, `brainstorm/`, `agent-memory/`, `agent-log/`, `plans/`, `comments/`.
- [ ] **The four readers**: subtask (groups, index leaves, status per leaf), free-form (notes, brainstorm, memory, including diagram and artifact sub-docs), agent-log (kinds, run folders, `00_index.md`, run statuses), plan (overview, stages with `outcome`, `notes`, `who`, `subtasks:`), and comments (flat, `author`, `date`).
- [ ] **The vocabulary**: the eight statuses and four categories fixed in code ([issue-status.ts](../../../../../../agent-ks-engine/src/loaders/issue-status.ts)), the run statuses, the legacy status map; priority, component and labels from the tracker's root settings file.
- [ ] **Derived fields**, computed here and sent as final values: `created` from the folder slug; `updated` from git ([040/70 git-dates cache](../040_caching/70_git-dates-cache.md), via `agentks-git`); status category; subtask counts (Closed counts as done); an index leaf's status derived from its siblings; the review queue; filter option lists for the issues index.
- [ ] **Validation** — the rules `agentks check issues` enforces today (frontmatter schema drift, template sections, index-leaf status agreement, `## Questions` vs status, `## Agent log` form, memory index) in `agentks-content`, returning error records. The CLI command and the page's error list show the same findings.
- [ ] **Page data** for the issues index and one issue ([80](./80_page-data-interface.md)): every issue with derived fields; one issue with its anatomy tree, each entry's status and category, plans with live subtask status, logs and comments.
- [ ] **Depth cap**: `MAX_SUBFOLDER_DEPTH = 5`; a folder past it is ignored with one warning, as today.
- [ ] **Parity**: the issues index rows and every issue's tree against the golden snapshot; `agentks check issues` output against today's `agent-ks check issues` on this repository's tracker.

## Guardrails
- The browser computes nothing: no status-to-category mapping, no sorting, no filter logic beyond matching values Rust sent ([03/01](../../notes/03_frontend/01_shared-ui-package.md)). Today's browser copies ([detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts), [index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts)) have no successor in TypeScript.
- Statuses stay fixed in code. Only the user sets `done` or `dropped`; the loader never changes a status on disk.

## Done when
- The issues index and every issue in this repository's tracker match the golden snapshot (excluding `updated`).
- `agentks check issues` on this repository's tracker reports the same findings as today's `agent-ks check issues`, with any difference explained.
- The demo fixture [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) renders every anatomy section.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `agentks-content` (rules, readers, validation), `agentks-site` (assembly into page data).
- **Read first:** [02/01 Content format](../../notes/02_engine/01_content-format.md) section 02; the `agent-ks-issues` skill (the anatomy); the user guide's [issues section](../../../../user-guide/19_issues/01_overview.md); today's [issues.ts](../../../../../../agent-ks-engine/src/loaders/issues.ts), [issue-sections.ts](../../../../../../agent-ks-engine/src/loaders/issue-sections.ts), [issue-status.ts](../../../../../../agent-ks-engine/src/loaders/issue-status.ts), [issue-dates.ts](../../../../../../agent-ks-engine/src/loaders/issue-dates.ts); the CLI's [issues.rs](../../../../../../agent-ks-cli/src/issues.rs) and [checks.rs](../../../../../../agent-ks-cli/src/checks.rs); the bundled [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts).
- **Depends on:** [40](./40_site-index.md), [020/50](../020_content-contract/50_ordering-settings-frontmatter.md), [040/70](../040_caching/70_git-dates-cache.md).
- **Unblocks:** [100/25 issues layouts](../100_layouts/25_issues-layouts.md), [070/20 content commands](../070_cli/20_content-commands-port.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): every rule stays in Rust; the tracker's statuses and categories stay fixed in engine code.
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core, so `check issues` and the issues page read one loader.

# 05 Notes & Analysis
## Watch out
- `updated` depends on the whole git history under the folder; never compute it per request. It comes from the git-dates cache, pre-warmed at start.
- The issue guide text ([guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts)) is static content for the issues layout, not a loader concern; it moves with [100/25](../100_layouts/25_issues-layouts.md).
