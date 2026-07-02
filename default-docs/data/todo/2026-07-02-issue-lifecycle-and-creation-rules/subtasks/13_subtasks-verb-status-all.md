---
title: subtasks verb — --status all silently degrades to the default scope
status: review
---

Found 2026-07-02 while validating the loop output against a fully-`done` issue:
`docs-guide issue subtasks <id> --status all` printed nothing (exit 0) where it
should list every subtask. Root cause: `list.mjs:118` special-cases the `all`
keyword and expands it to all seven statuses, but `subtasks.mjs:37` runs the
filter through `isValidState`, which silently *drops* `all` — the empty filter
then falls back to the default non-closed scope. So `--status all` never errors
and never widens; on a fully-closed issue it returns empty.

This matters beyond the one flag: the `list` tip we ship literally advertises
"Add `--status all` (or `--include-closed`)" as the canonical spelling, and a
verb in the same family accepting the flag while silently ignoring it is the
same silent-ignore disease subtask 12 targets in settings. (`set-state`'s
`isValidState` use is fine — validating a single target status is its job.)

- [x] Expand `all` before the validity filter in `subtasks.mjs` (mirror
      `list.mjs:118`): `all` present → scope = the full `STATUSES` list. Done —
      unknown tokens are still dropped so a typo can't smuggle in an empty
      filter as "everything".
- [x] Document the `all` keyword in the verb's `--help` status line.
- [~] Self-test case — the CLI `_selftest.mjs` is a per-command *contract*
      smoke-test (help exit 0, `-h` honored, `--json` shape), not a
      fixture-driven behavioral harness; a `--status all` assertion would have to
      couple to specific live data (this issue having `done` subtasks) and rot
      when the issue is archived. Verified **behaviorally** instead against the
      real tracker: `--status all` lists all 13 (incl. the nine `done`), bare
      default lists only the four non-Closed — recorded in the milestone.
- [x] Cache mirror + `diff -rq`; version bump rides along with the shipped wave
      (12/11) — done in the finalize step, not a dedicated bump for a one-liner.
