---
title: "Implementation — index page, detail page, theming"
status: done
---

The visual half — index page, detail page, subtask interactivity, and typography alignment with the theme contract.

## Index page

- [x] Filter chips per vocabulary field (status, priority, type, component, milestone, labels)
- [x] Search box (title + description)
- [x] Sort by date / priority
- [x] Table view + card view toggle
- [x] Real subtask counts in index (X/Y done) with progress
- [x] Status / priority badges with vocabulary colors (light-mode legibility via `color-mix`)
- [x] Pagination with chevron prev/next

## Detail page

- [x] Three-column layout — left sidebar / main panel / right MetaPanel
- [x] Left sidebar: collapsible sections (This issue / Notes / Subtasks / Agent log) with counts
- [x] Subtasks sorted incomplete-first
- [x] Notes & Agent log collapsed by default
- [x] Panel switching with `#hash` URL routing (`history.replaceState` + `hashchange` listener)
- [x] Auto-expand the parent section when the URL hash points to a sub-doc
- [x] Comment thread under issue overview
- [x] MetaPanel: ID, status / priority / type / component / milestone, labels, assignees, author, created / updated / due
- [x] Date formatting (`Jun 25, 2025` style, UTC)
- [x] Sub-pages (subtask / note / agent-log) render flush like docs (no surrounding box)

## Subtask checkbox UX

- [x] Checkbox in sidebar + overview subtask list + subtask page
- [x] Three-way state sync (sidebar / overview / page) on toggle
- [x] Optimistic UI with rollback on fetch failure
- [x] Progress bar in overview updates live

## Typography & theming

- [x] Page titles use `--ui-text-title`
- [x] Body / table rows / cards use `--ui-text-body`
- [x] Badges / IDs / dates use `--ui-text-micro`
- [x] No `font-weight: 600/700` on h1–h6 (consume `--font-weight-normal`)
- [x] Badge colors use `color-mix` so they stay legible in both themes
