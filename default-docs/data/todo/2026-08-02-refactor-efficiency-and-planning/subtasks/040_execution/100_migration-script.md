---
title: "Migration — agent-log status vocabulary → the canonical seven"
status: review
---

# Overview

Ship `migration/0.1.3_agent-log-status-vocabulary.py`, which rewrites every
agent-log file's `status:` onto the canonical seven and drops the now-dead
`iteration:` field.

**This is the mandatory half of the release.** Without it a consumer's existing
agent-log files fail validation on upgrade.

**Done when** detect reports every affected file with line numbers, dry-run
shows the exact rewrites, migrate is idempotent (a second run finds zero), and
`agent-ks check issues` is clean on this repo's own `default-docs/` afterwards.

# References

- Contract every migration script follows: `migration/README.md`
- Closest prior art, same shape of change:
  `migration/0.1.1_state-to-status.py` (a field rename **plus** a value remap)
- Why the vocabulary changed:
  [The agent-log structure](../../notes/20_agent-log-structure.md) → *status
  means "did the agent finish"*
- Ships with: [Version bump](../050_version-bump.md) — same commit

# Todo list

- [x] Detect pass — report file **and line** for every affected `status:` and
      `iteration:`, and change nothing
- [x] Remap `status:` per the table below
- [x] Drop `iteration:` — the `NNN_` filename owns the number now
- [x] `--dry-run`, and idempotent: a second run finds zero instances
- [x] Python, stdlib only, module docstring carries purpose + usage
- [x] Run it on `default-docs/` and commit the result in the same change
- [x] `agent-ks check issues` clean afterwards; `./start build` clean

# Outcomes and Next Steps

`migration/0.1.3_agent-log-status-vocabulary.py` ships, and has been **run against
this repo's own `default-docs/`** with the result committed in the same change.

## Three changes in one pass, not two

The subtask scoped two (status values, `iteration:`). A third joined it from
[`110`](./110_superseded-wording-sweep.md): the `wip`/`blocked` **labels**. Same
class of change — a vocabulary edit that invalidates existing files — and doing
it as a separate doc edit would have left 14 issues carrying a value the
vocabulary no longer declared.

| Change | Points | Files |
|---|---:|---:|
| `status:` remapped to the canonical seven | 75 | 75 |
| `iteration:` dropped | 86 | 86 |
| `wip` / `blocked` labels removed | 20 | 17 |
| **Total** | **181** | **110** |

## Measured, and one correction to this subtask

**The blast radius was 75 files, not 78.** This subtask recorded 78 and named it
as the acceptance test.
`grep -rlE "^status: *(success|failed|not-started) *$"` returns 75, and the
script's own detect agrees. The number is corrected here rather than left to be
re-derived.

## Acceptance, each item run

| Check | Result |
|---|---|
| detect reports file **and line** for every point | 181 points, 110 files, grouped by kind |
| `--dry-run` shows the exact rewrites, changes nothing | verified on a copy first |
| migrate applied | 110 files rewritten |
| **idempotent** — second run finds zero | `rewrote 0 file(s)` |
| `verify` exits 0 | clean |
| every `settings.json`/`.jsonc` still parses | **59 of 59**, comments and formatting intact |
| `agent-ks check issues` | exit 0 |
| `./start build` | clean |

**Run on a copy before the real tree.** A textual JSON edit that silently
produced invalid JSON would have been invisible until a build much later, and the
tracker root is a `.jsonc` whose comments a `json.loads`/`dumps` round-trip would
have destroyed — which is why the script edits textually and why the copy came
first.

## `failed → dropped`, in the docstring

The mapping people will question is explained where they will read it: `status`
answers *did the agent finish its assignment*, not *was the news good*. An audit
that completed and found five defects is `done`. What it found is prose in
`# Outcome`.

## Scope held

Folder structure untouched — the retired six-slot folders and `MNN_` files still
parse and render as ordinary markdown. History stays as written; a script that
restructured old folders would rewrite the record rather than migrate it.

# Details

## The validator accepts FOURTEEN status values today — a third vocabulary

Found 2026-08-02 in `check.mjs`, `MILESTONE_STATUSES`. This was missed in every
earlier count of "how many status vocabularies exist", which had it at two:

```
not-started · todo · pending · planned
in-progress · wip · active
success · completed · complete · done
failed · fail · error
```

Fourteen aliases collapsing to four colours. Moving agent-log files onto the
canonical seven kills ten of them, which is what makes this release breaking.

## The mapping

| Old value(s) | New | Why |
|---|---|---|
| `not-started`, `todo`, `pending`, `planned` | `open` | Assigned, not started |
| `in-progress`, `wip`, `active` | `in-progress` | Unchanged in meaning |
| `success`, `completed`, `complete`, `done` | `done` | **The agent finished its assignment** |
| `failed`, `fail`, `error` | `dropped` | The agent did **not** finish |

**`failed → dropped` is the one that needs explaining, so put it in the
docstring.** Under the new rule `status` answers *did the agent finish*, not
*was the news good*. An audit that completed and found five defects is `done` —
it did its job. `dropped` means the run did not deliver: crashed, refused,
superseded. What was actually found lives in the file's `# Outcome` section.

## Scope — values only, not folder structure

The six-slot activity folders (`00_goal.md` … `05_notes.md`) and milestone files
are **left where they are**. They still parse and still render as ordinary
markdown; only the status *values* break.

[The agent-log spec](../../notes/20_agent-log-structure.md) already ruled that
history stays as written — the new shape governs what is recorded next. A script
that restructured old folders would rewrite the record rather than migrate it.

**That earlier note said "a migration would be optional and is not proposed."
That was wrong about the values**, and this subtask is the correction: the
structure needs no migration, the vocabulary does.

## Blast radius — counted

**78 files in this repo alone** carry `status: success`, `status: failed` or
`status: not-started`, across `default-docs/data/todo/`. Every consumer tracker
will have proportionally more, since agent-logs are where the volume is.

That count is also the acceptance test: run detect, expect 78 here, migrate,
re-run detect, expect 0.

## Not in this script

- `agent-memory/plans/` → `plans/`. Sid migrates the one live consumer by hand
  ([decided](../030_brainstorm-plans-section.md)). Nothing automated, nothing
  maintained.
- The `MILESTONE_STATUSES` set itself — deleting it from `check.mjs` is part of
  [`015`](./015_code-agent-log-settings.md), not a content migration.
