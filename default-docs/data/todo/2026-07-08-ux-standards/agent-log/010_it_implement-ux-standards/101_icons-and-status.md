---
title: "File-type icons on both sidebars + completed status icon set"
agent: claude-fable-5
date: 2026-07-08
iteration: 1
status: success
---

## Goal

Subtasks 10/20/30 — the code half: type glyphs on both sidebar trees, the finished status-icon vocabulary with tooltips and theme-contract colors.

## Approach

Two useful discoveries changed the plan from the subtask text:

- **All seven status glyphs already existed** in `server/state-icon.ts` (including the in-progress half-circle and a blocked circle-slash) — the missing pieces were only the *colors* (just review/done/dropped were tinted) and the *tooltips*.
- The issues loader already stamps sub-docs with `docType: 'markdown' | 'diagram' | 'artifact'`, so the issues tree needed no loader work either.

## Result

- New shared module `src/layouts/file-type-icons.ts` (diagram + artifact glyphs, markdown deliberately unmarked); consumed by `docs/default/Sidebar.astro` (all three leaf-render depths, label wrapped in `.sidebar__link-label`, glyph in `.sidebar__link-doctype`, flex CSS in `src/styles/docs.css`) and by `SubdocTree.astro` (replacing the inline artifact-only SVG — first-class diagrams now get their glyph too).
- `useSidebar.ts`: `SidebarItem` gains `fileType`, copied from `LoadedContent` in both item-creation paths — the field existed but was dropped before render.
- New `STATUS_LABELS` map in `src/loaders/issue-status.ts` (re-exported via the issues barrel); `data-tip` + `data-tip-always` + `aria-label` added to the status icons on all four surfaces (`SubtaskTree`, `MetaSidebar`, `OverviewSubtasks`, `Comprehensive`); the client cycler (`subtask-state.ts`) keeps tips honest via a new `setIconTip()`.
- Color rules in `detail.css`: `in-progress → var(--color-info)`, `input-needed → var(--color-warning)` added on all icon surfaces; fixed the pre-existing inconsistency where the agent-log status chip tinted in-progress with `--color-warning`.
- **Decided:** `open`/`blocked` stay neutral grey — Not Started is a resting category; blocked's reason is read in prose, it's not an alarm.

## Next

Legend + docs (milestone 2), verification (milestone 3).
