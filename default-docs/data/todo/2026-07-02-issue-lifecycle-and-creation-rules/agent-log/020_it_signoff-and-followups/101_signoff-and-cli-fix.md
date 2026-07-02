---
title: "Milestone 1 — loop sign-off + subtask 13 CLI fix"
iteration: 1
status: success
---

## Goal

Close out the loop at sidhantha's word and fix the CLI regression (subtask 13).

## Approach & result

**Sign-off.** Ticked every internal checkbox in subtasks 03–09 (01–02 were
already ticked) — the loop milestones + green build/checks confirm each line
shipped, so the boxes were just lagging. Then set subtasks **01–09 → `done`** via
`docs-guide issue set-state … --subtask N done`. (First attempt fed the CLI a
`.md` filename with a trailing space from `ls`; re-ran with numeric selectors.)

**Subtask 13 — `subtasks --status all`.** Root cause confirmed live: `list.mjs`
expands the `all` keyword before validating, but `subtasks.mjs` ran the filter
through `isValidState` first, which drops `all` → empty filter → silent fallback
to the default non-Closed scope. On a fully-`done` issue that returns nothing.
Fixed by expanding `all` → the full `STATUSES` list *before* the vocabulary
filter (mirrors `list.mjs:118`), documented the keyword in `--help`. Unknown
tokens are still dropped so a typo can't smuggle in an empty "everything" filter.
Verified: `--status all` now lists all 13 (incl. the nine `done`); bare default
lists only the four non-Closed. The `_selftest.mjs` is a per-command *contract*
smoke-test (not a behavioural harness), so this is covered by the live check +
the mirrored inline comment rather than a data-coupled fixture.

## Next

Subtasks 11 + 12 (the root-settings schema wave).
