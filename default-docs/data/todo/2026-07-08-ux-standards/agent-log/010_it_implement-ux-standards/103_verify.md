---
title: "Verification — production build + rendered-output checks"
agent: claude-fable-5
date: 2026-07-08
iteration: 3
status: success
---

## Goal

Subtask 60 — prove the shipped icons, tooltips, and colors actually render, against the real built site.

## Approach

`./start build` (full production build), then `./start preview` and assertions against the served HTML/CSS with curl. Browser screenshots were **blocked**: the playwright MCP plugin is configured for the Chrome channel, which isn't installed on this machine (only bundled Chromium) — so verification is DOM/CSS-level, not pixel-level.

## Result

All checks pass:

- **Build**: 800 pages, clean, 13.8s.
- **Docs sidebar** (`/user-guide/writing-content/*`): both first-class artifact pages render `.sidebar__link-doctype` with `data-tip="Artifact" data-tip-always aria-label`.
- **Issues tree**: `2026-04-10-editor-diagrams` renders the **Diagram** glyph on its first-class `.excalidraw` note; `2026-07-07-artifact-component` renders 3 **Artifact** glyphs.
- **Status icons** (demo fixture `2026-07-01-demo-issue-anatomy-showcase`): every subtask icon carries `aria-label` + `data-tip` with the human label (Open/Done/Review…).
- **Guide panel**: the generated "Status icons" legend renders, tinted spans included.
- **Compiled CSS**: `.issue-sidebar__item[data-state=in-progress] .issue-sidebar__check{color:var(--color-info)}` and the corrected `issue-log__chip--status.is-in-progress{color:var(--color-info)…}` both present in the served stylesheet.
- **Tracker**: `docs-guide check issues` — zero errors (4 pre-existing warnings untouched).

## Next

Human review: eyeball light/dark in a real browser (the one thing this pass could not do) — see the note in `subtasks/60_verify.md`.
