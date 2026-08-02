---
title: "Migration — one status vocabulary"
status: done
agent: claude
---

# Goal

Subtask 100 — the mandatory half of the release. Agent-log files carried their
own status vocabulary of fourteen aliases; the tracker now has exactly one, so
existing content must be rewritten or it stops validating on upgrade.

# Inputs

- `subtasks/040_execution/100_migration-script.md`
- `migration/README.md` — the contract every script follows
- `migration/0.1.1_state-to-status.py` — closest prior art

# Expected Outcome

The change, and what it touched.

# Outcome

`migration/0.1.3_agent-log-status-vocabulary.py` ships and has been run on this
repo's own `default-docs/`, with the result committed in the same change.

| Change | Points | Files |
|---|---:|---:|
| `status:` remapped to the canonical seven | 75 | 75 |
| `iteration:` dropped | 86 | 86 |
| `wip` / `blocked` labels removed | 20 | 17 |
| **Total** | **181** | **110** |

Idempotent (second run rewrote 0), `verify` exits 0, and all **59** settings
files still parse with their comments and formatting intact.

## The decision that grew the scope

**The label retirement joined this script rather than being a doc edit.**
Subtask 110 wanted `wip`/`blocked` deleted from the vocabulary, but 14 issues
carried the value — deleting the declaration alone would have made them invalid.
Same class of change as the status remap: a vocabulary edit that invalidates
existing files. One pass, one script.

## What the round did to avoid a silent corruption

**Ran it on a copy first, and validated every JSON file after.** The script edits
JSON *textually* on purpose — the tracker root is a `.jsonc` whose comments a
`json.loads`/`dumps` round-trip would destroy — and a textual edit that silently
produced invalid JSON would not have surfaced until a build much later.

## Correction

**The blast radius is 75 files, not the 78 the subtask recorded.** `grep -rlE
"^status: *(success|failed|not-started) *$"` returns 75, and the script's own
detect agrees. Corrected in the subtask rather than left to be re-derived.
