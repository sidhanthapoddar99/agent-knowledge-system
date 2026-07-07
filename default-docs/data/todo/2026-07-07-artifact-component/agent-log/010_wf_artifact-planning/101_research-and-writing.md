---
title: "Milestone — research + parallel Opus writing"
status: done
---

## Goal

Ground the planning content in the real codebase and the real captured skills,
then write all eleven planning files in one parallel Opus-xhigh pass.

## Approach

Two research agents ran first: one mapped the first-class diagram pipeline
(`loaders/diagram-pages.ts`, the `data.ts` hook, `content-assets` serving,
`route-match.ts`, the dead `validateRoutes()` in `config.ts`) with file:line
citations; the other inventoried all four skills under `tmp_skills/` and
produced the convergence map. Three writers then produced, in parallel:
`brainstorm/01` (8 architecture threads, A–H) + `notes/02` (settled decisions);
`brainstorm/02` (10 skill-design sections) + `notes/01` (provenance +
three-way-diff upstream protocol); and all seven subtasks (`10_`–`70_`).

## Result

All 11 files written (~17k words). Notable calls the writers made: the new
skill is named `artifact-authoring` (avoids colliding with the Claude Code
built-in `artifact-design`); the sidecar is `<name>.meta.json`/`.meta.jsonc`
mirroring `diagram-pages.ts:161`; the reserved-URL guard resurrects the dead
`validateRoutes()` and covers the full reserved segment set (`artifacts`,
`assets`, `content-assets`, `api`, `editor`); artifacts run unsandboxed as
first-party content with `text/html` scoped to the route only; the tmp_skills
baseline is preserved privately with a public integrity manifest.

## Next

Adversarial verification (factual + completeness), then fixes.
