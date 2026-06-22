---
title: "Surfaces — backlinks cards + graph dev-tools app"
state: open
---

Absorbed from the original phase-3 scope (Layer 4). Once the registry, graph, and query API exist, surface them where authors and agents will actually encounter them.

## Backlinks card on detail pages

- [ ] Docs detail layout (`src/layouts/docs/default/`) — collapsible "Referenced by N pages" section alongside the outline / TOC.
- [ ] Blog post layout (`src/layouts/blogs/default/PostLayout.astro`) — same.
- [ ] Issue detail layout (`src/layouts/issues/default/DetailLayout.astro`) — same.
- [ ] Component reused across layouts; lives in a shared `parts/` or a top-level layout utility.
- [ ] Empty state: if zero backlinks, hide the section rather than showing "0 references."

## Graph dev-tools app

Following the existing pattern (`system-metrics`, `cache-inspector`):

- [ ] New entry in `src/dev-tools/` — e.g. `graph-inspector/`.
- [ ] Summary surface: orphans count + broken-links count for the whole site.
- [ ] Per-current-page view: backlinks, outlinks, broken links on *this* page.
- [ ] Lives in the "More Dev Tools" overflow menu (3-dot) alongside system-metrics and cache-inspector.
- [ ] Uses the `/api/graph/*` endpoints from subtask 01.

## Decisions deferred

- Graph visualization UI (D3 / Obsidian-style graph) — still a non-goal for v1.
- Whether backlinks belong inside the existing outline collapsible or as a new sidebar region — open question in the issue.

## Verify

- Open any page with ≥1 inbound link → backlinks card renders with the list.
- Graph dev-tools app shows site-level orphan and broken-link counts at a glance.
