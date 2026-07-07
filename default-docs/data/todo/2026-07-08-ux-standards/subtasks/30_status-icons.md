---
title: "Complete the subtask status icon set (blue in-progress, verify blocked, hover tooltips)"
status: review
---

Finish the subtask status symbol vocabulary in the issues layout. Current state (rendered by `stateIconSvg()` used in `src/layouts/issues/default/parts/detail/SubtaskTree.astro`, colored in `styles/detail.css`): not-started grey checkbox ✔ done, done green tick ✔ done, dropped red cross ✔ done, review yellow dot ✔ done. Missing / unverified:

- [x] **In-progress: blue half-circle.** Add a half-filled-circle glyph for `in-progress`, tinted `var(--color-info)` — never hardcoded blue. This matches the standard the existing icons already follow (`--color-success` / `--color-error` / `--color-warning` via the theme contract).
- [x] **Blocked: verify what renders today.** Check `stateIconSvg()` for the `blocked` status; if it falls back to a generic glyph, give it a deliberate symbol consistent with the set.
- [x] **Hover tooltips on all status icons.** Each status glyph gets `data-tip="<status name>"` + `data-tip-always` (the row already carries a truncation-aware `data-tip` for the title — the icon tip names the *status*).
- [x] **Fix the in-progress color inconsistency.** `styles/detail.css:616` tints the agent-log status chip for in-progress with `--color-warning`; the sidebar badge (`detail.css:144`) uses `--color-info`. Standardize on `--color-info` for in-progress everywhere in the layout.
