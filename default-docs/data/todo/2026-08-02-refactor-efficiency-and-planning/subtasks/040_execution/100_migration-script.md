---
title: "Migration — agent-log status vocabulary → the canonical seven"
status: done
---

# Overview

Ship `migration/0.2.0_agent-log-status-vocabulary.py`, which rewrites every
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

**Added 2026-08-03, after the field was already dropped — see
[Where the number went](#where-the-number-went-and-what-the-migration-is-the-only-chance-to-check).**

- [x] **Report every file whose `iteration:` value disagrees with its filename
      prefix, before dropping the field.** The migration is the only pass that
      ever sees both numbers; after it runs the frontmatter value is gone and a
      disagreement is unrecoverable — **shipped in 0.2.1, and scoped to
      new-shape files only; see [What the measurement changed](#what-the-measurement-changed-and-it-overturned-this-subtasks-premise)**
- [x] Decide what a disagreement means — the honest default is **report and keep
      the filename**, never rename a file to match a field being deleted —
      **implemented exactly so; the hit text says `KEEPING THE FILENAME`**
- [x] Follow-up, not this script: **lint the `NNN_` digit rule** now that nothing
      does. `0` = the iteration file, `1`–`9` = producers, and no second `NN0_`
      within one iteration — **mostly already existed; two gaps closed in 0.2.1**

# Outcomes and Next Steps

`migration/0.2.0_agent-log-status-vocabulary.py` ships, and has been **run against
this repo's own `default-docs/`** with the result committed in the same change.

## What the measurement changed — and it overturned this subtask's premise

**Closed 2026-08-03 in the 0.2.1 release**
([the round](../../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md)).
The check shipped, but **not** in the form this subtask asked for, and the reason
is the most useful thing here.

The premise above is that the prefix and `iteration:` are *two copies of one
fact* that nothing kept agreeing, so the migration should report where they
drifted. **Measured against this repo's own pre-migration tree — 83 files
carrying both, recovered from git at `8f0ce28` — a blanket comparison reports 83
disagreements out of 83.** Every one is false.

They were never two copies of one fact. In the retired shape, `MNN_` counted
**milestones** and `iteration:` counted **rounds**:

| File | Field | Reading |
|---|---|---|
| `101_step-a.md` | `iteration: 1` | milestone 1, round 1 |
| `102_doctrine-parity-wiring.md` | `iteration: 1` | milestone **2**, round **1** — correct, not drifted |

Applying the current rule (first two digits = the iteration) to those files is a
category error, not a comparison. Even reading them under the old rule, 8 of 83
"disagree" — and those 8 are just activities with several milestones in one
round, which is exactly what the old numbering was for.

**So the check is gated on `_is_new_shape_round_file()`** — the file must sit in
a numbered `02_working/`, which only exists in the current shape. There, and only
there, do the prefix and the field claim the same thing and can contradict.

The discriminator is **structural rather than a heuristic**: the slot name is
present or it is not. That is the same move as taking the number from the
filename in the first place.

### Controls, both directions

| Control | Expected | Got |
|---|---|---|
| Real pre-migration tree, 83 old-shape files (`git archive 8f0ce28`) | **0** mismatches — all are convention, not drift | **0** ✓ |
| Same run still detects the field itself | 86 `log-iteration` drops, 181 points / 110 files | identical to the original recorded run ✓ |
| Constructed new-shape file: `020_round-two.md` with `iteration: 7` | **1** mismatch | **1** ✓ |
| Beside it, `021_producer.md` with `iteration: 2` | not flagged | not flagged ✓ |

The middle row is the one that matters for safety: **181 points across 110 files,
byte-identical to the run recorded in *Acceptance* above.** The addition is
report-only and regressed nothing.

## The digit lint — already existed, and had two holes

The third todo assumed nothing linted the `NNN_` rule. Most of it **already did**,
built with the slot numbering: a malformed prefix, a retired `iteration:` field, a
non-round status, and a `dropped` round with no callout all warn already.

Two real gaps, both closed:

- **A lone producer with no iteration file passed.** The guard read
  `list.length > 1`, so one orphaned `031_` file was invisible — and that is the
  *likelier* of the two mistakes, being what an agent leaves behind when it
  produces one artifact and never writes the round up.
- **Two files ending `0` in one iteration were never checked at all**, so
  `040_round-a.md` and `040_round-b.md` could both claim to be that round's own
  record.

Proved with a before/after on one fixture — **1 warning on the pre-fix code, 3 on
the fixed code** — and the real tracker stays at its single pre-existing warning,
so neither rule added noise.

> [!NOTE]
> **Status history, kept because the round-trip is the point.** This was at
> `review`, went **back to `in-progress`** on 2026-08-03 when three todo items
> were added after the original scope had already been verified — "done, awaiting
> sign-off" stopped being true — and returned to `review` the same day once
> 0.2.1 closed all three.
>
> The reopening was correct and worth imitating: a subtask that grows new scope
> after reaching `review` is not still awaiting sign-off, and quietly leaving it
> there would have shipped the release with an open item reading as finished.
>
> **The deadline that was not a date has now passed safely.** The disagreement
> check was only runnable *before* this migration ran on a consumer tracker;
> afterwards the `iteration:` values are gone and there is nothing to compare
> against. It made it into 0.2.1 — and the measurement then showed the check was
> worth far less than feared, because the two numbers were never comparable in
> the old shape at all.

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

**The blast radius was 75 files, not 78.** This subtask originally recorded 78
and named that as the acceptance test — in this section and again under *Blast
radius* below, where the wrong number survived this correction for a day and
would have failed a passing run.
`grep -rlE "^status: *(success|failed|not-started) *$"` returns 75, and the
script's own detect agrees: 71 `success`, 3 `failed`, 1 `not-started`. Every
statement of the number now reads 75; the correction is recorded here rather
than the mistake being quietly erased.

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

> [!IMPORTANT]
> **This stays true of THIS script, and a second script exists for the other
> case.** On 2026-08-03 the three slots gained numeric prefixes
> ([the numbering spec](../../notes/80_agent-log-numbering-spec.md)), so every
> agent log already written in the **new** shape needs
> `summary.md` → `01_summary.md`, `working/` → `02_working/`,
> `debrief/` → `03_debrief/`. That is not the case this section was arguing
> against: the retired six-slot folders are still left exactly where they are,
> and what moves is only the shape this issue itself introduced days earlier.
> It ships as `0.2.0_agent-log-slot-numbering.py` under
> [number the agent log's own slots](../080_presentation-and-numbering/030_agent-log-slot-numbering.md), not
> here — this script is a text rewrite of frontmatter values and is already
> verified idempotent, and folding a link-aware folder rename into it would put
> two unrelated failure modes behind one command.
>
> **Two things that converter has to get right, neither of which this one
> faced.** First, the old six-slot shape contained a file called
> `01_summary.md` — the *same name* the new shape now uses — so it must decide
> which shape a folder is in before renaming anything, and must never rename
> onto an existing name. Second, renames are link-bearing: the spec counts
> **114 inbound links** mentioning `summary.md`, so this is `agent-ks move`
> work, run by one actor sequentially, not a text substitution.

# Details

## Where the number went, and what the migration is the only chance to check

**The `iteration:` field is removed; the iteration number is not.** It moved into
the filename, which is the half that was already there:

```
02_working/
├── 010_audit-round.md       ← iteration 01, the orchestrator's file
├── 011_audit-bytes.md       ← iteration 01, a producer's own file
├── 020_fix-round.md         ← iteration 02
└── 030_battery.md           ← iteration 03
```

First two digits are the iteration, last digit is which file within it — `0` for
the round's own file, `1`–`9` for agents that produced something substantial.

**Why the field went rather than the number.** The value was stored in two
places, the prefix and the frontmatter, and **nothing kept them agreeing.** A
file could be `020_fix.md` carrying `iteration: 3`, and neither the build nor the
validator would say a word: the sidebar badge would read 3 and the sort order
would read 2. Taking the number from the filename leaves nowhere for the two to
disagree — the same move as a plan stage pulling its subtasks' live status
instead of storing a copy.

### The check this script is uniquely placed to run

`drop iteration:` and `read the filename prefix` happen in the same pass over the
same file, which makes this **the only moment both numbers exist at once.** After
migration the frontmatter value is gone from every consumer tracker and any
disagreement between the two is unrecoverable — not hard to find, *gone*.

So the script should report the disagreements as it drops the field. Not fix
them: renaming a file to match a value that is being deleted is trusting the half
we decided was untrustworthy, and a rename breaks every link pointing at it.
**Report, keep the filename, let a human look.**

Cheap to add — the detect pass already walks every agent-log file and already
parses both the prefix and the field.

### What is not fixed by any of this

The numbering now carries meaning by **digit position**, and nothing lints it.
One of the [three readers](./130_independent-skill-audit.md) named exactly that
as a reason to prefer the old scheme: the old one at least warned on a missing
`iteration:` field, where the new one silently accepts `031_` in an iteration
with no `030_`.

That trade is real and it is recorded rather than argued away. It does not change
the call — a lint for the digit rule is straightforward to add, and two stored
values that silently disagree cannot be fixed at all — but the lint does not
exist yet, and until it does this is a convention with no enforcement.

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

**Changed 2026-08-03 — the last clause now has one exception.** *Old* structure
still needs no migration. *New* structure does, because the three slots were
renumbered after this script shipped
([the numbering spec](../../notes/80_agent-log-numbering-spec.md)). That is a
separate script in a separate subtask
([number the agent log's own slots](../080_presentation-and-numbering/030_agent-log-slot-numbering.md)); see the
callout under *Scope held* for why the two are not merged.

## Blast radius — counted

**75 files in this repo alone** carry `status: success`, `status: failed` or
`status: not-started`, across `default-docs/data/todo/` — 71, 3 and 1
respectively. Every consumer tracker will have proportionally more, since
agent-logs are where the volume is.

That count is also the acceptance test: run detect, expect 75 here, migrate,
re-run detect, expect 0.

## Not in this script

- `agent-memory/plans/` → `plans/`. Sid migrates the one live consumer by hand
  ([decided](../010_initial-research/030_brainstorm-plans-section.md)). Nothing automated, nothing
  maintained.
- The `MILESTONE_STATUSES` set itself — deleting it from `check.mjs` is part of
  [`015`](./015_code-agent-log-settings.md), not a content migration.
