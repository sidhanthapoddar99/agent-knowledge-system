---
title: "Impact on other issues"
---

**None of the 25 other active issues is untouched in substance, and none is fully solved by construction.** A review on 2026-09-29 read each one against this migration's decisions: 4 are partly delivered by the migration, 15 are still wanted but must be re-planned on the new architecture, 3 are obsolete, 2 are unaffected, and the idea dump is mixed. Most open work should **pause** now, because it builds on Astro code or the current editor that the migration replaces. No issue's status has been changed; this note is the record, and the user decides what to update.

# 03 References

- [The architecture note](./17_local-spa-over-websocket.md), [phasing](./15_phasing.md), [future stages](../02_future-stages/01_index.md) — the decisions each verdict cites.
- [Open questions](./16_open-questions.md) — questions 06 and 13 take findings from this review.

# 04 Decisions

None yet. Updating the affected issues (a pointer to this note, a re-scope, or a status change) is the user's call.

# 05 Notes & Analysis

## 01 How to read the verdicts

| Verdict | Meaning |
|---|---|
| **Partial** | The migration delivers part of the goal by construction; the rest remains |
| **Rework** | Still wanted, but its design or open subtasks target Astro or the current editor, so they must be re-planned |
| **Obsolete** | A migration decision makes the goal disappear |
| **Unaffected** | Independent of the migration |

"Pause" means open work would be thrown away if done now. "Continue" means it survives the migration.

## 02 Partly delivered by the migration

| Issue | What the migration delivers | What remains | Now |
|---|---|---|---|
| [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md) | Config validation with helpful errors (Rust loads config); a config migration tool (`agentks migrate`) | Per-page overrides need a Rust design. Environment-specific configs clash with ".env holds ports only". SEO, OG and Twitter cards, analytics and custom head tags are Phase 3 only | Pause |
| [2026-04-19-knowledge-graph-and-wiki-links](../../../2026-04-19-knowledge-graph-and-wiki-links/issue.md) | One pipeline for every content type and a URL registry, from the Rust site index (subtasks `01`, `02`) | The `[[wiki-link]]` syntax, graph queries and backlink surfaces. `03` (rewrites through Yjs) must be re-planned for Phase 2 editing; `07` moves to the retrieval stage and the dev toolkit | Pause |
| [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) | The file-to-URL map and one resolver for docs, blog and tracker (group `100_absolute-resolution`, which becomes Phase 1 acceptance criteria) | Rust must output root-absolute hrefs (see 04 below). `200_path-prefix` moves to Phase 3. `300/010` is Astro-only and obsolete; `300/020` becomes the Phase 1 route-parity check. 0.x publishers keep the static-host trailing-slash bug until Phase 3 | Pause |
| [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) | The display half, already done: embeds and first-class diagram pages carry into Phase 1 | `30_editor/*` becomes Phase 2 block editing (click a diagram, edit its source); `30_excalidraw` also waits on the UI-framework question | Pause `30_editor`; **continue** `40_tooling/10_excalidraw-scene-tools` (CLI and skill work) |

## 03 Still wanted, re-plan on the new architecture

| Issue | Why | Now |
|---|---|---|
| [2025-06-25-blog-testing-polish](../../../2025-06-25-blog-testing-polish/issue.md) | Blog layouts become frontend components; sorting, authors and tags become Rust-computed values. The checklist becomes a Phase 1 check; design pagination on the new engine | Pause |
| [2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md) | "Hidden in production" now means "left out of the Phase 3 export". Rust decides visibility; the frontend shows a badge | Pause |
| [2025-06-25-dev-toolbar-enhancements](../../../2025-06-25-dev-toolbar-enhancements/issue.md) | Everything hangs off Astro's toolbar; the dev toolkit is rebuilt in Phase 2. Subtasks `01_ram-cpu-viewer` and `02_cache-inspector` already exist in code but are still `open` | Pause |
| [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) | Layouts become built-in frontend components, added on demand only; some items are speculative and should be dropped rather than carried | Pause; `04_built-in-themes` may continue if it uses only theme variables |
| [2025-06-25-plugin-system](../../../2025-06-25-plugin-system/issue.md) | A user-code plugin API with build and render hooks contradicts "rules stay in Rust, CSS is the only extension". Search, AI and graph survive as the later retrieval stage. `02_search` and `04_graph-view` duplicate the search and knowledge-graph issues | Pause |
| [2025-06-25-sizing-and-responsive](../../../2025-06-25-sizing-and-responsive/issue.md) | Layout CSS moves into the SPA. Breakpoints and mobile layouts become SPA acceptance criteria; image `srcset` moves to the Rust asset and export pipeline | Pause; documenting the spacing system may continue |
| [2026-04-10-editor-advanced](../../../2026-04-10-editor-advanced/issue.md) | Every subtask targets the discarded editor. Slash commands, spell check and drag-and-drop upload re-plan for Phase 2; wiki links and embedding are parser work that overlaps the knowledge-graph issue; `07_performance-improvements` is obsolete | Pause |
| [2026-04-10-editor-core](../../../2026-04-10-editor-core/issue.md) | Much of it is obsolete. `03_client-side-rendering` contradicts the single-renderer decision. `02` toolbar, `04` auto-save (with echo suppression) and `12` live status re-plan for Phase 2. `09` doc switcher is obsolete (SPA navigation). `11` ToC view is delivered by Rust-computed outlines. `08` asset manager and `14` code editing are a Phase 2 toolkit question | Pause |
| [2026-04-10-new-layout-types](../../../2026-04-10-new-layout-types/issue.md) | Fits "more layouts on demand", but every task names Astro files; it becomes a Rust loader, derived JSON and an SPA component. Its roadmap filters by milestone, which the project rule against scheduling fields forbids. RSS belongs to Phase 3 | Pause |
| [2026-04-10-sync-and-presence](../../../2026-04-10-sync-and-presence/issue.md) | Moves to the later multi-user stage on `yrs`, the Rust server and the same WebSocket; the current Yjs server is discarded. `03_sync-testing` of the old server would be wasted | Pause |
| [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) | One model now: reading by default, live preview in place from the toolkit. `02_preview-mode` and `04_view-only-edit-mode` are delivered by that model; `01_live-preview` re-plans (CodeMirror decorations may be reused); `03_true-wysiwyg` is likely obsolete | Pause |
| [2026-04-19-docs-phase-2](../../../2026-04-19-docs-phase-2/issue.md) | Pages documenting Astro internals, the Yjs editor and scoped layout classes will be deleted | Pause the Astro-internals parts of `01` and `02`, and `07`; **continue** `08`, `029` (fold in the rename) and `019` |
| [2026-04-19-site-wide-search](../../../2026-04-19-site-wide-search/issue.md) | Built on Orama inside Astro, a Node search API and a multi-user CMS. The migration names a Rust retrieval index shared by the site and agents; search on the static export is a Phase 3 question. `02`, `09` and `04` are obsolete as written; `05` merges into the retrieval stage | Pause |
| [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md) | The algorithm carries over (eager `lastHash..HEAD` walk, merge-base check, pre-warming), retargeted to Rust and the `~/.agentks` build cache. Its deferral note still points at the superseded Go issue | Pause (already deferred) |
| [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) | The shipped core (iframes, sidecar, skill, `/artifacts` route) carries over; the SPA router must keep `/artifacts` reserved. `110` overlaps note 11's "artifact as a top-level page"; `120` (inline HTML) changes how scripts run and are trusted inside an SPA | Pause `110` and `120` |

## 04 Obsolete

| Issue | Why |
|---|---|
| [2025-06-25-codebase-refactoring](../../../2025-06-25-codebase-refactoring/issue.md) | Every open subtask refactors the TypeScript loaders that the Rust core replaces (Phase 1, step 2). `06_docs-and-example-sync` becomes the dev-docs rewrite |
| [2025-06-25-editor-server-management](../../../2025-06-25-editor-server-management/issue.md) | Wants the current editor run as a managed long-lived server; that editor is discarded and the CLI already owns the Rust server's lifecycle |
| [2026-04-10-editor-navigation-and-layout](../../../2026-04-10-editor-navigation-and-layout/issue.md) | IDE chrome for the discarded editor page. Only tab persistence survives (the editing-mode note keeps it); status and CPU panels move to the dev toolkit |

## 05 Unaffected

| Issue | Why | Now |
|---|---|---|
| [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) | Fixture content, not engine code. It becomes the natural input for the Phase 1 comparison of the issues layout | Continue |
| [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) | The fix is in review and stays correct for 0.x. Its lesson must carry into the Rust cache (see 06 below) | Continue: finish the review |

## 06 The idea dump

[2025-06-25-future-feature-ideas](../../../2025-06-25-future-feature-ideas/issue.md) keeps capturing. Entries the migration touches:

- `05_performance` and `07_developer-tools`: largely delivered — the hash-keyed browser cache, push updates, kept scroll and sidebar state, Phase 2 live preview, and linting already in the CLI.
- `04_social-and-collaboration` and `06_analytics-and-insights`: only make sense for a published site; Phase 3 if ever.
- `01_content-enhancements`: content reuse must be designed in the Rust pipeline; versions and i18n are publishing concerns.
- `02_navigation-and-discovery`: breadcrumbs and tag pages computed by Rust; keyboard navigation and reading progress in the frontend; schema.org markup in Phase 3.
- `03_visual-features`: frontend-only, barely affected.

## 07 Findings that changed this issue's notes

The review found four gaps in this issue's own notes. Each is now fixed where it belongs:

1. **Links.** The notes said relative links keep resolving under real URL paths. [2026-08-04](../../../2026-08-04-absolute-link-resolution/issue.md) shows browser-relative hrefs are the defect. The files on disk keep their relative links; **Rust outputs root-absolute hrefs**. Fixed in [the architecture note](./17_local-spa-over-websocket.md) and [Phase 3](../02_future-stages/07_phase-3-publishing.md).
2. **Embeds in cache keys.** A page that inlines another file (`[[../assets/x.mmd]]`) goes stale unless its hash includes the embedded file's hash — the lesson of [2026-08-07](../../../2026-08-07-content-embed-cache-dependencies/issue.md). Fixed in [the architecture note](./17_local-spa-over-websocket.md) and [the build cache](./07_agentks-home-and-build-cache.md).
3. **First-class diagram pages** (`.mmd`, `.dot`, `.excalidraw`, `.drawio` and their sidecars) were missing from Phase 1's scope and checks. Added to [phasing](./15_phasing.md) and [open question 06](./16_open-questions.md).
4. **`[[...]]` syntax clash.** The wiki-links issue defines `[[target]]` as a link, but today's engine uses `[[path]]` as the embed syntax. Added as [open question 13](./16_open-questions.md).

## 08 Tracker clean-ups spotted, not done

- `2025-06-25-dev-toolbar-enhancements` subtasks `01` and `02` look built but are still `open`.
- `2026-04-10-new-layout-types` subtask `01_roadmap` filters by milestone, against the project's rule on scheduling fields.
- `2025-06-25-plugin-system` subtasks `02_search` and `04_graph-view` duplicate the search and knowledge-graph issues.
- `2026-05-08-update-date-time-optimization` note `04_deferred-until-runtime-migration.md` points at the superseded Go issue ([open question 09](./16_open-questions.md)).
