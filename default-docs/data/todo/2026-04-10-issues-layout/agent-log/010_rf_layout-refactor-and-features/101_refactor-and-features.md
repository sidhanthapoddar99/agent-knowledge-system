---
iteration: 1
agent: claude
status: success
date: 2026-04-18
---

# Layout refactor + index-page features

Covers the folder restructure (subtask 16) plus the four feature subtasks that landed alongside it: group-by (11), compact filter (12), preset views (13), TOC-replaces-MetaPanel (8), 4-state subtask status (14), filter-state cache (10), subtask page header + numbering (7), Overview combined subtask view (9), agent-log nested folders (15).

## Folder restructure

`DetailBody.astro` was 1576 lines. `parts/client.ts` was 752. `parts/` mixed Astro UI with TS modules; every `.astro` file owned its own `<style>` block.

New layout:

```
src/layouts/issues/default/
├── IndexLayout.astro / DetailLayout.astro     (thin wrappers)
├── IndexBody.astro / DetailBody.astro         (slim orchestrators)
├── parts/
│   ├── shared/     StatusBadge · IssueCard · MetaPanel
│   ├── index/      FilterBar · PresetStrip · StateTabs · ViewToggle ·
│   │               Pagination · IssuesCards · IssuesTable
│   └── detail/     DetailSidebar · IssueThread · OverviewSubtasks ·
│                   Comprehensive · SubtaskPage · NotePage ·
│                   AgentLogPage · MetaSidebar
├── scripts/
│   ├── index/      client · types · filters · groups · presets
│   └── detail/     client · panels · subtask-state · comprehensive ·
│                   toc-observer · types
├── server/         helpers · state-icon · toc
└── styles/         index.css · detail.css · groups.css
```

`DetailBody.astro`: 1576 → 128 lines. `client.ts`: 752 → 557. Extracted `detail.css` (730 lines), `index.css` (31), `groups.css` (~100). Dead code dropped: `index.ts`, MetaPanel non-compact branch, inline state-icon / TOC helpers.

## Index-page features

- **Group-by** (`component` / `milestone` / `priority`) — each group renders as its own boxed section with inline state-tab filter + per-group pagination. Global state-tabs + pagination hide while grouped.
- **Compact filter-bar mode** — chevron toggle persists per-tracker in `localStorage`; active chips mirror into a single-row strip when the per-field rows collapse.
- **Preset views** — read from the tracker's root `settings.json`. Status tab is explicitly NOT part of presets (warns and ignores if set) — status is a user-scoped cached preference.
- **Filter-state cache** — URL is source of truth; `localStorage` restores last state on arrival with a blank URL so returning users keep their view.

## Detail-page features

- **TOC replaces MetaPanel on sub-docs** — each subtask / note / agent-log panel has its own auto-generated TOC in the right sidebar. Heading IDs are prefixed server-side (`extractAndPrefixToc`) so multiple sub-docs sharing one DOM don't clash on `#setup`.
- **MetaPanel moved into header** as a compact 5-line horizontal strip (ID+Component / Status+Priority+Milestone / Labels / Author+Assignees / dates).
- **4-state subtask status** (`open` / `review` / `closed` / `cancelled`) — cycles on click, POSTs to `/__editor/subtask-toggle`, updates every surface optimistically with rollback on failure. Reads legacy `done: bool`; writes canonical `state`.
- **Review tab covers soft debt** — an open issue whose subtasks are in `review` shows up under Review without flipping the issue status.
- **Subtask page header** — title + state badge + numeric prefix. Sidebar subtasks sort by active-group-first then numeric prefix.
- **Comprehensive panel** — all subtask bodies inline under five filter tabs (Review / Open / Closed / Cancelled / All). Bodies over 150 words collapse behind a chevron expander.
- **Agent-log nested folders** — flat `agent-log/*.md` files render first; `agent-log/<group>/*.md` render as collapsible subgroups. Anything nested deeper (tier 2) is warned and ignored.

## Notable bugs caught

- `element.hidden = true` didn't hide `.issues-state-tabs` / `.issues-pagination` — author CSS `display: flex` won the specificity tie with UA `[hidden] { display: none }`. Added explicit `[hidden]` rules.
- Cloned state-tabs inherited `hidden` from the original (because `apply()` hides globals *before* the clone runs). Fix: `tabsClone.removeAttribute('hidden')` post-clone.
- `<section>` / `<div>` built with `document.createElement` carry no `data-astro-cid-*` — Astro scoped styles silently skip them. Moved group-section styles to `styles/groups.css` and imported globally. Rule: if a runtime-built element needs styling, its CSS must live in a global sheet.
- Deep-cloning the whole `<table>` (not recreating it) preserves every `data-astro-cid-*` on `<thead>` / `<tbody>` / `<th>` / `<tr>` / `<td>`, so the rows inside the cloned table stay styled correctly.
