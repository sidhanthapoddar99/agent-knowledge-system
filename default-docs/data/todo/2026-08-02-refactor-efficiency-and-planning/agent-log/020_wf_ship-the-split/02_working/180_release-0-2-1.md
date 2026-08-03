---
title: "0.2.1 — the migration's last check, the digit lint, and the first release where the floor stays put"
status: done
agent: claude
---

# Goal

Close the migration subtask's three remaining items, then ship **engine 0.2.1**
and **plugin 0.7.1**.

Sid: *"after this update the version of skill to 0.7.1 also what about migration
thing after which move it to 0.2.1 / subtasks/040_execution/100_migration-script.md
--> what about this?"*

# Inputs

- [The migration subtask](../../../subtasks/040_execution/100_migration-script.md),
  at `in-progress` for three items added after its original scope completed
- The pre-migration tree, recovered from git at `8f0ce28` — 83 files still
  carrying both a filename prefix and an `iteration:` field

# Expected Outcome

The three items closed, a release note, and the gates green.

# Outcome

**Shipped.** Engine `0.2.1`, plugin `0.7.1`, floor **unchanged at `0.2.0`**.

## The measurement overturned the thing I was asked to build

The subtask's premise: the filename prefix and `iteration:` are two copies of one
fact that nothing kept agreeing, so report where they drifted before the field is
dropped forever.

**Run against the real pre-migration tree, a blanket comparison reports 83
disagreements out of 83 files.** All false. The two numbers were never two copies
of one fact — `MNN_` counted **milestones**, `iteration:` counted **rounds**, so
`102_doctrine-parity-wiring.md` carrying `iteration: 1` is milestone 2 of round 1
and is correct.

Had I shipped the check as specified, every consumer running the migration would
have got a wall of warnings about files that were fine — and the real signal, if
any existed, would have been buried in it.

So the check is gated on `_is_new_shape_round_file()`: the file must sit in a
numbered `02_working/`, which exists only in the current shape. **Structural, not
a heuristic** — the slot name is there or it is not.

**Getting this right required the old data, and the old data only exists in git.**
`git archive 8f0ce28` was the whole experiment; reasoning about it would have
produced the broken version with a confident explanation attached.

## The digit lint mostly existed — and had two holes

The third item assumed nothing linted the `NNN_` rule. Most of it already did.
Two real gaps:

- `list.length > 1` let a **lone** orphaned producer through — the likelier
  mistake, being what an agent leaves when it produces one artifact and never
  writes the round up.
- Nothing caught **two files ending `0`** in one iteration, both claiming to be
  that round's own record.

Before/after on one fixture: **1 warning → 3**. The real tracker stays at its
single pre-existing warning, so neither rule added noise.

## `check.mjs` demonstrated the wrong-tree defect a second time

The first control run of the new lint printed nothing. Not because the lint
failed — because `agent-ks check issues` runs the **installed** `check.mjs`,
not the edited one, exactly as
[`130`](../../../subtasks/090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md) describes for
the link checker. It turned into a free baseline: the installed copy *is* the
pre-fix code, which is where the 1-vs-3 before/after came from.

Worth noting the pattern is **not** confined to `check-skill-links.mjs`. Anything
invoked through the `agent-ks` dispatcher tests the install, so a plugin change
must be exercised with `bun <repo path>` until reinstalled.

## The floor stays at 0.2.0, and that is the point

**First release where `MIN_CONTENT_VERSION` is behind `ENGINE_VERSION`.** 0.2.1
changes no content format — a startup refusal, two lints, a report — so content
written for 0.2.0 is byte-for-byte valid and nobody migrates.

Every earlier release moved both numbers together, which made them look like one
number. The comparator fix in 0.2.0 is what makes the gap meaningful at all.

Gate proved at every boundary rather than assumed:

| Declared | Verdict |
|---|---|
| `0.1.2` | REFUSED — below the floor |
| `0.2.0` | **PASS** — behind the engine, at the floor. The new condition |
| `0.2.1` | PASS |
| `0.3.0` | REFUSED — above the engine |
| *(absent)* | REFUSED |

# Gates

| Gate | Result |
|---|---|
| `./start build` | **952 pages**, exit 0 |
| Version gate | all five boundaries correct (table above) |
| `agent-ks check issues` | 51 folders, 0 errors, 1 pre-existing warning |
| `check-skill-links` **against the working tree** | 3 skills, clean |
| Migration, real pre-migration tree | 181 points / 110 files — **identical to the original run**; 0 false mismatches |
| Migration, constructed new-shape mismatch | exactly 1, correct file |
| Digit lint | 1 → 3 warnings on the fixture; real tracker unchanged |
| `tsc --noEmit` | 0 errors in the files touched |

# Left for Sid

- **The tag.** `v0.2.1` is not pushed. Pushing it publishes a public GitHub
  release, which is outward-facing, so it is stated here rather than done.
- **Reinstall the plugin** — `check-skill-links` and `check.mjs` both ship fixes
  that cannot take effect through `agent-ks` until the install is refreshed.
- **A 404 on ~10 user-guide pages**, found by the agent rewriting the
  using-with-AI page and outside its scope: `./lifecycle-and-review` resolves to
  `issues/setup/lifecycle-and-review`, and `03_folder-structure.md` uses a third
  wrong form. Filed as its own subtask.
