---
title: "Goal — implement the full UX-standards issue in one pass"
agent: claude-fable-5
date: 2026-07-08
status: in-progress
---

## Goal

Execute all six subtasks of this issue end-to-end in a single interactive session: file-type icons in the docs sidebar (10) and the issues sub-doc tree (20), the completed status-icon set with hover tooltips and theme-contract colors (30), the symbol legend in the Guide panel + user-guide (40), the dev-docs UX-standards page + `tooltip.ts` script page + `CLAUDE.md` pointer (50), and the verification pass (60).

## Approach

Read the existing implementations first (`state-icon.ts`, `SubdocTree.astro`, `useSidebar.ts`, `tooltip.ts`), then build a shared glyph vocabulary module (`src/layouts/file-type-icons.ts`) consumed by both sidebars rather than forking SVGs, generate the Guide legend from code constants (`stateIconSvg` + new `STATUS_LABELS`) so it cannot drift, and verify against the production build + preview server.
