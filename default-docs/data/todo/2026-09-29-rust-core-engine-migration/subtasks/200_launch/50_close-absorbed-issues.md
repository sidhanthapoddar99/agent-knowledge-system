---
title: "Close the issues this migration took over"
status: open
---

About twenty open issues in this tracker describe work that the migration now does, in its own subtasks, on the new engine. Leaving them open would keep two homes for one job, and agents would pick up the stale one. This leaf marks each fully absorbed issue `superseded`, with a `→` line naming the subtask that took it over, and leaves a pointer on the ones only partly absorbed. sidhantha granted this on 2026-09-30: an issue whose work is taken over and no longer relevant may be marked superseded. `done` and `dropped` stay sidhantha's.

# 01 To Do
- [ ] **Confirm each target leaf exists** and actually carries the absorbed work (read the leaf's References for the "Absorbed" line). If a leaf dropped part of an issue's scope, that issue is only partly absorbed.
- [ ] **For each fully absorbed issue**, in one edit:
    - [ ] Add the `→` line as the first line of its `issue.md`, in the form already used on [2025-06-25-editor-server-management](../../../2025-06-25-editor-server-management/issue.md): `> → superseded by [<leaf title>](<relative link to the leaf>): <one clause of why>.`
    - [ ] Set the status with `agent-ks issue set-state <id> superseded`.
    - [ ] Add a comment (author claude) with two lines: what took it over, and "Superseded under sidhantha's grant of 2026-09-30".
- [ ] **For each partly absorbed issue**, add a comment naming the leaf that took the absorbed part, and leave the status alone.
- [ ] **Run `agent-ks check issues`**: no errors, and no "superseded without a → line" warning.
- [ ] **Timing.** Run this pass right before the tracker move ([10](./10_tracker-move.md)), so absorbed issues stay behind as closed history. Run it once more at the end of the launch for anything absorbed later.
- [ ] **Claude edits; sidhantha commits** these changes in this repository.

## Guardrails
- Only `superseded`. Never `done` or `dropped`; those are sidhantha's.
- Supersede only when the whole remaining scope has a home in a migration leaf. Partial means a pointer comment, not a status change.
- Don't rewrite the history in the absorbed issue; add the `→` line and the comment only.

## Done when
- Every issue in the "Fully absorbed" table below is `superseded` with a `→` line that resolves.
- Every issue in the "Partly absorbed" table carries a pointer comment.
- `agent-ks check issues` and `agent-ks check link-form` report no new errors.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** this one, `default-docs/data/todo/` (local `/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system`). Claude edits, sidhantha commits.
- **Read first:**
  - [Impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md) — the verdict for each issue.
  - [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) — the superseding grant.
  - The tracker skill's lifecycle rules (`superseded` needs a `→` line; only the user sets `done` or `dropped`).
- **Depends on:** the target leaves being written and, for the final pass, built.
- **Unblocks:** [200/10 tracker move](./10_tracker-move.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): Claude may mark an issue `superseded` once its work is finished or taken over and it is no longer relevant ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).
- Decided (claude, 2026-09-30): absorbed issues are superseded before the tracker move, so they stay in the old repository as closed history instead of moving.

# 05 Notes & Analysis

## 01 Fully absorbed

Leaf paths are relative to this issue's `subtasks/` folder. Confirm each before superseding.

| Issue | Taken over by |
|---|---|
| [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) | [020/30 links and URLs](../020_content-contract/30_links-and-urls.md); its path-prefix group also feeds [195/30](../195_hosting/30_docs-at-slash-docs.md) |
| [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) | [040/70 git dates cache](../040_caching/70_git-dates-cache.md) |
| [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) | [060/00 collaboration](../060_collaboration/00_overview.md) |
| [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) | [100/35 diagram pages](../100_layouts/35_diagram-pages.md), [110/50 diagram editing](../110_editing/50_diagram-editing.md), [060/80 diagram collaboration](../060_collaboration/80_diagram-collaboration.md) |
| [2026-04-10-editor-core](../../../2026-04-10-editor-core/issue.md) | [110/40 save path](../110_editing/40_save-path-and-sync.md) and the [110/00 editing](../110_editing/00_overview.md) group |
| [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) | [110/60 authoring helpers](../110_editing/60_authoring-helpers.md) |
| [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md) | [110/10 dev toolbar](../110_editing/10_dev-toolbar.md) |
| [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md) | [100/20 blog layouts](../100_layouts/20_blog-layouts.md) |
| [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) | [100/55 responsive](../100_layouts/55_responsive.md) |
| [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) | [100/60 roadmap and releases](../100_layouts/60_roadmap-and-releases.md) |
| [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) | [100/65 layout variations](../100_layouts/65_layout-variations.md) |
| [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) | [100/30 artifact pages](../100_layouts/30_artifact-pages.md) |
| [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md) | [130/40 extensions](../130_ai-plugins/40_extensions.md) |
| [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md) | [150/50 dev-only content](../150_publishing/50_dev-only-content.md) |
| [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) | [030/95 retrieval index](../030_rust-engine/95_retrieval-index.md), [150/40 static search](../150_publishing/40_static-search.md) |
| [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) | [180/00 documentation](../180_documentation/00_overview.md) |
| [2025-06-25-codebase-refactoring](../../../2025-06-25-codebase-refactoring/issue.md) | [030/00 rust engine](../030_rust-engine/00_overview.md) (every subtask refactors the TypeScript loaders the Rust core replaces); its docs-sync subtask goes to [180](../180_documentation/00_overview.md) |

## 02 Partly absorbed — pointer comment only

| Issue | Absorbed part | What stays |
|---|---|---|
| [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) | Subtasks 01 and 02 (one pipeline, the URL registry) → [030/40 site index](../030_rust-engine/40_site-index.md) | Graph queries and backlink surfaces (07); wiki links were rejected, embeds stay `[[path]]` |
| [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md) | Config validation and a config migration tool → [020/20 config folder](../020_content-contract/20_config-folder.md), [140/20 migrate command](../140_versioning-and-migrations/20_migrate-command.md) | Per-page overrides and anything [020/20](../020_content-contract/20_config-folder.md) did not take; supersede if it took everything |

## 03 Not absorbed — leave alone

| Issue | Why |
|---|---|
| [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md) | Its own feature; only the engine side is in [100/40](../100_layouts/40_video-pages.md) |
| [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) | A fixture; used by the parity tests |
| [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) | Its 0.x fix is in review for sidhantha to close; its lesson is carried by [020/40](../020_content-contract/40_embeds-and-dependencies.md) |
| [2025-06-25-future-feature-ideas](../../../2025-06-25-future-feature-ideas/issue.md) | The idea dump; keeps capturing |

## Watch out
- Some target leaf paths above were planned before the leaves were written. If a group renamed or renumbered a leaf, fix the link here before superseding; `agent-ks check link-form` will flag it.
