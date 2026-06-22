---
title: Standardize NN_ / NNN_ notation (from XX_) + digit-width convention
state: closed
---

Make the placeholder notation and the digit-width rule consistent across docs **and** the
skill, replacing the old `XX_` shorthand and the fixed-2-digit framing.

**Done:**

- **Notation sweep** — `XX_` → `NN_` across all live docs (`user-guide`, `dev-docs`), the
  plugin skill (`SKILL.md`, references, commands, starter `template/`), and the framework
  `CLAUDE.md`. Only `XX_` existed in content; verified zero `XX` remaining. Tracker history
  left untouched. (The user listed `XXX/XXXX/XXXXX` too; the convention is now expressed as
  `NN_`/`NNN_`/`NNNN_`/`NNNNN_`.)
- **Digit-width standard** — 2–5 digits, sorted by numeric value (widths coexist), `_`
  canonical, single-digit and 6+ rejected. Documented as a tier:
  - **Docs:** `NN_` is the convention; `NNN_` only on a special requirement (headroom /
    leading-digit grouping); `NNNN_`/`NNNNN_` very rare (explicit demand / exceptional).
  - **Issue tracker:** `NN_` **and** `NNN_` are *both* conventional — for subtask leaf
    files and grouping folders — with `NNN_` used freely (grouping, many items), not as an
    exception. `agent-log/` and `notes/` numbering is optional but `NN_`/`NNN_` are good
    conventions; the CLI writes `NNN_` for agent-logs and comments.
- **Pages touched:** `user-guide/17_docs/{01_overview,02_structure}.md`,
  `19_issues/05_sub-docs/{03_subtasks,04_notes,05_agent-log}.md`,
  `19_issues/03_folder-structure.md`; skill `SKILL.md`,
  `references/layouts/{docs-layout,issue-layout}.md`. Build green.

Pairs with the parser-level work in
[2026-06-22-numeric-ordering-prefix-convention](../../2026-06-22-numeric-ordering-prefix-convention/issue.md).
