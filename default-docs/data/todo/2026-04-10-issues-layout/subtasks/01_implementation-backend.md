---
title: "Implementation — data, loader, routing, API"
state: closed
---

The non-visual half of the issues layout — folder model, loader, routing, content-type registration, and the subtask-toggle API.

## Data model & loader

- [x] Folder-per-item layout (`YYYY-MM-DD-<slug>/`)
- [x] `settings.json` per item — status, priority, type, component, milestone, labels, author, dates
- [x] Root `settings.json` declares vocabulary (status / priority / type / component / milestone / labels) with optional colors
- [x] Loader (`src/loaders/issues.ts`) — async, mtime-cached
- [x] Multi-file model — `issue.md` + `comments/NNN_*.md` + `subtasks/NNN_*.md` + `notes/*.md` + `agent-log/NNN_*.md`
- [x] Stray root-level `.md` files surfaced as warnings

## Routing & content-type registration

- [x] `@issues` alias in `src/loaders/alias.ts`
- [x] `type: issues` branch in `src/pages/[...slug].astro`
- [x] Index route `/<base_url>` → `IndexLayout.astro`
- [x] Detail route `/<base_url>/<id>` → `DetailLayout.astro`
- [x] Sub-doc routes (subtasks / notes / agent-log) — open as panels with URL-hash routing
- [x] Page registration in `site.yaml` (`type: issues`, `layout: "@issues/default"`, `data:` alias)

## Subtask-toggle API

- [x] `POST /__editor/subtask-toggle` — updates frontmatter `done` field via `gray-matter`
- [x] Path-allowed gate against `watchPaths`
