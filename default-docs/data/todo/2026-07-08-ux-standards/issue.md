---
title: "UX standards — sidebar file-type icons, status icon polish, and the standards doc"
---

## Goal

Take the quality-of-life patterns that shipped organically inside the issues layout, codify them as project-wide **UX standards** in dev-docs (referenced from `CLAUDE.md`), and extend the two headline patterns — truncation-aware hover tooltips and file-type icons — to the docs sidebar so both layouts speak the same visual language.

## Context — where these patterns came from

The originals shipped un-tracked as part of the issue-anatomy layout work; this issue is their provenance anchor:

- **Truncation-aware tooltip system** — `astro-doc-code/src/scripts/tooltip.ts` (site-wide singleton, loaded from `BaseLayout.astro`). Any element with `data-tip` shows a cursor-anchored tooltip **only when its text is actually cropped** (`scrollWidth > clientWidth`); `data-tip-always` opts non-text triggers (icons) in unconditionally. CSS in `src/styles/element.css` (`.ui-tooltip`).
- **Agent-log kind icons with explainer hover** — `src/layouts/issues/default/parts/detail/SubdocTree.astro` resolves the two-letter activity code (`lp`/`au`/`rf`/`it`/`wf`) via `kindMap` and renders a glyph from `server/agent-log-icons.ts` with `data-tip` + `data-tip-always`, so hovering the icon says what the activity kind means.
- **File-type glyph for non-markdown sub-docs** — `SubdocTree.astro` renders a trailing `.issue-sidebar__doctype` glyph for first-class `.html` artifact sub-docs; markdown is the default and stays unmarked.
- **Status-tinted counts and badges** — done/total on subtask folders, the "N awaiting review" dot, milestone badges tinted through the theme status vars (`detail.css`, `color-mix` over `--color-success` / `--color-info`).

The design rules these encode (tooltips only when needed; markdown-is-default-so-unmarked; hierarchy from weight/color, not size; status colors only through the theme contract) are what the dev-docs standards page must capture — as *rules*, not a changelog.

## Scope decisions

- **Images are out of scope.** Images are embed-only today — never first-class sidebar pages — so there is nothing to put an icon on. If images ever become first-class, they join the icon vocabulary then (decided sidhantha, 2026-07-08).
- **Icon types now: diagram (`.mmd`/`.dot`/`.excalidraw`) and HTML artifact.** Monochrome, no color — color stays reserved for status.
- **Placement: trailing (right side) of the row label** — this matches where the issues tree already puts the artifact glyph, so docs and issues converge rather than conflict. In the docs sidebar, folders keep their collapse chevron; type icons apply to leaf rows only.
- **All status icon colors go through the theme status variables** (`--color-info` for in-progress, `--color-success`, `--color-error`, `--color-warning`) — never hardcoded hex — same standard the existing tick/cross/dot already follow (decided sidhantha, 2026-07-08).
- **The status symbol legend lives in the Guide panel and the user-guide only.** The dev-docs page carries rationale and mechanism, not a duplicate table (decided sidhantha, 2026-07-08).

## Success criteria

- Docs sidebar and issues sub-doc tree both show trailing file-type icons for diagram and artifact pages, each with a hover tooltip naming the type; markdown rows are unmarked.
- The subtask status icon set is complete and consistent: not-started grey checkbox, in-progress blue (`--color-info`) half-circle, blocked has a verified symbol, review yellow dot, done green tick, dropped red cross — all with hover tooltips naming the status.
- The Guide panel and user-guide carry the status + type symbol legend (kept in sync with the `doc-issues` skill per the guide.ts coupling rule).
- Dev-docs has a UX-standards page (plus a `15_scripts/` page for `tooltip.ts`, currently undocumented), and `CLAUDE.md` points to it instead of inlining the content.
