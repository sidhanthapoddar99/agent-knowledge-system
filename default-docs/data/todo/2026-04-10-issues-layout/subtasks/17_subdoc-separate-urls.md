---
title: "Subtasks / notes / agent-log get their own URLs"
status: done
---

Today every panel on the detail page lives under one URL (`/<base>/<issue-id>`) with a hash for the active panel (`#subtask-foo`, `#note-bar`, `#log-baz`). Overview ↔ Comprehensive is a filter between two views of the same data — fine as hash. But subtasks / notes / agent-logs are **distinct documents**; they should be real pages.

## Target URL shape

| Panel | Today | Target |
|---|---|---|
| Overview (issue body + comments) | `/<base>/<id>` | `/<base>/<id>` (unchanged) |
| Comprehensive (all subtasks inline) | `/<base>/<id>#comprehensive` | `/<base>/<id>#comprehensive` (unchanged — filter view) |
| Subtask | `/<base>/<id>#subtask-<slug>` | `/<base>/<id>/subtasks/<slug>` |
| Note | `/<base>/<id>#note-<name>` | `/<base>/<id>/notes/<name>` |
| Agent-log (flat) | `/<base>/<id>#log-<name>` | `/<base>/<id>/agent-log/<name>` |
| Agent-log (grouped) | `/<base>/<id>#log-<group>--<name>` | `/<base>/<id>/agent-log/<group>/<name>` |

## Why

- **Shareability** — pasting a URL to a specific subtask should resolve to exactly that subtask, with a per-panel `<title>`, canonical tag, and `og:title`.
- **SEO / indexing** — each sub-doc becomes its own indexable page instead of one URL with everything collapsed via `display: none`.
- **Back / forward** — browser history moves between whole documents, not between hash mutations on one page.
- **Heading anchors work natively** — a `#setup` anchor inside a subtask page no longer collides with anchors from other subtasks, so the `extractAndPrefixToc` server-side heading-id rewrite can be dropped for sub-docs (it stays only for the Comprehensive inline view).
- **Smaller pages** — the overview page stops shipping every subtask / note / log body inline.

## Non-goals

- Overview and Comprehensive stay co-resident. Comprehensive is an inline filtered view of the same data, not a separate document.
- No client-side SPA navigation between sub-docs — each click is a real page load. Simpler, and navigation inside the same issue is cheap on local builds and fine on static-hosted production.

## Scope

### 1. Routing (`src/pages/[...slug].astro`)

- [ ] Match `<base>/<issue-id>` → Overview/Comprehensive page (existing `DetailLayout`)
- [ ] Match `<base>/<issue-id>/subtasks/<slug>` → new SubDocLayout rendering one `SubtaskPage`
- [ ] Match `<base>/<issue-id>/notes/<name>` → SubDocLayout rendering one `NotePage`
- [ ] Match `<base>/<issue-id>/agent-log/<name>` → SubDocLayout rendering one `AgentLogPage` (flat)
- [ ] Match `<base>/<issue-id>/agent-log/<group>/<name>` → SubDocLayout rendering one `AgentLogPage` (grouped)
- [ ] `getStaticPaths` enumerates all sub-docs across all issues

### 2. Layouts

- [ ] New `SubDocLayout.astro` sharing `DetailSidebar` + `MetaSidebar` (TOC panel for this doc) with a single-panel main column
- [ ] Existing `DetailLayout.astro` keeps Overview + Comprehensive only
- [ ] Sidebar `<button data-panel>` becomes `<a href>` for sub-doc entries; the panel-activate JS stays for overview↔comprehensive

### 3. Loader / helpers

- [ ] `server/helpers.ts`: add `subtaskUrl(baseUrl, id, subtask)`, `noteUrl(...)`, `logUrl(...)` helpers that return the target path; sidebar + meta-sidebar consume these
- [ ] Drop `extractAndPrefixToc` calls for individual sub-docs (each sub-doc is its own DOM); keep it for the Comprehensive panel
- [ ] Drop `logPanelKey()` — URLs are now the canonical identifier

### 4. Subtask state cycling

- [ ] On a sub-doc page, cycling a subtask state needs to POST to `/__editor/subtask-toggle` as today; UI only updates the *current* surface — the sidebar of the *next* page load re-reads from disk
- [ ] No cross-tab sync in this pass (if two tabs are open on different sub-docs, each reflects the last load)

### 5. TOC / right-sidebar

- [ ] `MetaSidebar` variant for sub-doc pages: TOC of the current doc only (no `data-meta-panel` swapping)
- [ ] Active-section highlight observer runs once, doesn't need the mutation-observer panel-swap dance

## Migration

- Old `#subtask-<slug>` / `#note-<name>` / `#log-<name>` hash URLs should redirect (client-side `<script>` on the overview page) to the new path so existing bookmarks / shared links don't 404.

## Out of scope

- SPA-style view transitions between sub-doc pages (Astro View Transitions) — land the base URL refactor first; transitions are an additive polish.
- Editing sub-docs inline — the editor integration stays unchanged.
- Cross-tab state sync via BroadcastChannel — noted above, deferred.
