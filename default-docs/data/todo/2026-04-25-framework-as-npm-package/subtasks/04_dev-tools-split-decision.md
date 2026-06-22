---
title: "Dev-tools split — does the live editor / Yjs / cache inspector ship in the package?"
state: open
---

`src/dev-tools/` contains substantial functionality: live editor (CodeMirror 6 + Yjs CRDT sync), layout-selector, error-logger, system-metrics, cache-inspector, plus the shared server (middleware, editor-store, yjs-sync, presence). It's the most "framework-y" part of the project but also the heaviest in deps (Yjs, y-codemirror, websockets, gray-matter, etc.).

## The question

Does this ship in the main `documentation-template` package, or as a separate optional package?

## Three options

### A. All-in-one — dev-tools ship in the main package

- Pro: one install, no version-skew between dev-tools and engine
- Pro: matches the current developer experience
- Con: every consumer pays the install size for dev-tools they may not use in production
- Note: dev-tools ARE dev-only — they don't ship in `astro build` output. So the "install size" cost is `node_modules` weight, not bundle weight.

### B. Sibling optional package — `documentation-template-dev`

- Consumer adds it as a dev dep separately
- Engine package becomes leaner
- Con: two-package coordination tax (versions have to track each other; integration has to gracefully no-op when the dev package is absent)
- Con: more documentation surface

### C. Plugin-style — main package exposes hooks; dev-tools ship as separate Astro integrations

- `documentation-template/integration` (engine) + `documentation-template/dev-tools` (extras) under one package, two integrations
- Consumer picks: `integrations: [docTemplate(), docTemplateDevTools()]`
- Pro: clean opt-in
- Con: more API surface; the existing single-integration story is simpler

## Recommendation (default if no strong preference)

**Option A — ship everything in one package.** Reasoning:

- Dev-tools are dev-only; consumers don't ship them to prod, so install size is the only cost
- The Yjs / WebSocket dep weight is real (~few MB) but acceptable for a framework that already pulls Astro + its sub-deps
- One install command, one upgrade command — operational simplicity wins for a framework with 30 consumers
- Future: if dev-tools grow much heavier (e.g., add a full graph view, a heavy AI panel), revisit and split

If we go A, add a `disableDevTools` integration option (see subtask 03) so a paranoid consumer can opt out of the dev-server overhead.

## Open question — the editor's WebSocket port

The Yjs sync currently picks a port at dev-server startup. In a multi-project workflow (developer running 3 framework instances at once), port collisions are possible. If we go A, document this; if it becomes a real issue, add a port option.

## Acceptance

- Decision recorded in this issue's `notes/`
- `disableDevTools` option in the integration (if A) or split integrations (if C)
- Dev-tools-related deps marked correctly in `package.json` (still `dependencies`, not `devDependencies`, since they're consumed at the *consumer's* dev time)

## Out of scope

- Re-architecting any specific dev-tool (live editor, etc.) — that's separate work
- Supporting *production* uses of the dev-tools — they remain dev-only
