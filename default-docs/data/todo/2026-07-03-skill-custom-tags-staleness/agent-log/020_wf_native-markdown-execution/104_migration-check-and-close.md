---
title: "Migration check shipped, issue closed"
iteration: 4
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Migration check shipped, issue closed

## Goal

Execute subtask 50 (the legacy-content migration check the user added mid-run),
then close the issue on the user's explicit sign-off ("mark all the subtasks
complete, and the issue has completed itself").

## Approach

- New validator following the existing check idiom (`blog/check.mjs` pattern,
  `reportAndExit` from `_check-lib.mjs`), registered in `_manifest.mjs` so the
  manifest-driven selftest covers its contract automatically.
- False-positive hardening driven by real runs: skip fenced code blocks
  (documentation examples), inline code spans (prose *mentions*), and YAML
  frontmatter (titles about the migration itself).

## Result

- `docs-guide check legacy-tags [root]` ships: flags `:::callout` /
  `:::collapsible` / `:::tabs` directives and `<callout>` / `<tabs>` / `<tab>` /
  `<collapsible>` tags with file:line and the native replacement (callout types
  mapped — `warning`→`[!WARNING]`, `danger`→`[!CAUTION]`, …); `--json`; exit 1
  on hits so it can gate CI. `<table>` proven not to false-match `<tab>`.
- Evidence: synthetic fixture detects all four syntax families and skips all
  three mention forms; `default-docs/data` scans clean (exit 0); full selftest
  PASS; installed cache mirrored (parity diff clean) and the on-PATH
  `docs-guide` lists + runs the new verb.
- Skill guidance added to both writing references ("legacy content: run the
  check, migrate on touch") and a `cli-toolkit.md` row.
- **Shipped in commit `65b9673`** (51 files: framework retirement, GFM alerts,
  docs/skills sweeps, this check, tracker records). Subtasks 10–50 and the
  issue set to `done` on the user's explicit instruction.

## Next

— (issue closed; the next cycle owns `notes/01_tracker-references-scan.md` —
7 issues still referencing custom tags)
