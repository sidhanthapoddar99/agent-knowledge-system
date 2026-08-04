---
title: "02_working/ gets a generated round table, and a gate that keeps it honest"
status: done
agent: claude
---

# Goal

Close [`015`](../../../subtasks/110_tracker-ergonomics/015_the-working-index-is-a-table-of-the-round.md):
a scaffolded agent log shows one file, so two of its three slots are invisible.
Seed an index that carries the run's shape — kind, who, how it ended — rather
than an empty placeholder.

# Inputs

- `subtasks/110_tracker-ergonomics/015_the-working-index-is-a-table-of-the-round.md`
- The precedent that decides the design:
  [the execution group's overview](../../../subtasks/040_execution/00_overview.md)
- `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-agent-log.mjs`,
  `new-iteration.mjs`, `check.mjs`

# Expected Outcome

The change, and what it touched.

# Outcome

## The decision the subtask said had to come first: derived, and regenerated

**Typed was never on the table** — this issue has the receipt for it, a hand-typed
status column that read `review` for thirteen rows while all thirteen files said
`done`, for a day. The subtask left two derived shapes open:

| Shape | Taken? | Why |
|---|---|---|
| **Rendered** — the layout builds the table at build time, nothing on disk | no | It stores nothing and cannot drift, but it leaves `02_working/` with no file — and git does not track empty directories, so the folder vanishes on clone. The seeding problem is the *whole* subtask, and rendered does not solve it |
| **Regenerated** — a script rewrites the file | **yes** | One generator, no layout change, and a real file on disk — which the project's own filesystem-first principle wants anyway: `ls` and `cat` should answer the question, not only the site |

**And the drift objection is answered structurally rather than promised away.**
`agent-ks check issues` re-runs the generator and compares; a table that
disagrees with its round files is an **error**. That converts the precedent's
failure mode from silent rot into a gate — the same move this repo prefers
everywhere: *make an invariant structural rather than documenting it.*

## What shipped

| File | Change |
|---|---|
| `scripts/issues/_working-index.mjs` | **new** — the one generator. Reads a `02_working/`, renders the table |
| `scripts/issues/new-agent-log.mjs` | seeds `02_working/00_index.md`, empty; the rule from [`020`](../../../subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md) added to `--help`; `03_debrief/` named in the help rather than seeded |
| `scripts/issues/new-iteration.mjs` | persists `unit:` to frontmatter, and rewrites the index on **every** round |
| `scripts/issues/reindex.mjs` | **new** — `agent-ks issue reindex <id> [--log] [--check]` |
| `scripts/issues/check.mjs` | `unit` accepted; `00_index.md` exempt from the `NNN_` numbering rule; the staleness error |
| `scripts/_manifest.mjs` | registers `issue reindex` |
| the issues skill + `guide.ts` | document it, both short and long form |

**Columns, and where each comes from — nothing is inferred from a filename:**
`#` from the prefix · `Round` from `title:` · `Kind` from `unit:` · `Who` from
`agent:` · `Status` from `status:` · `Produced` from that iteration's producer
files. A round with no `unit:` prints `—`, because a kind guessed from a title is
a plausible label with no source.

**A fan-out is one row.** Producers fold into the last cell, which is exactly the
question a reader of someone else's run has — how much was delegated and how much
was judged.

## Why `reindex` exists at all, and it is not a nicety

The staleness gate was nearly unusable without it. A round's **status** changes
far more often than a round is created — `open` becomes `done` the moment work
lands — so with `new-iteration` as the only writer, the only way to answer the
gate would have been to create an iteration nobody wanted. **A gate that is red
on arrival is a gate people learn to ignore**, which this repo has already
written down once. `reindex` makes the error actionable in one command, and the
error message names it.

## Control tests — both directions

| Test | Result |
|---|---|
| Backfill 4 historic logs, then `check issues` | ✅ clean, down to the two known unrelated warnings |
| Hand-edit one cell (`done` → `dropped`), then `check issues` | ❌ **errors on exactly that file**, naming the fix |
| Restore, re-run | ✅ clean again |
| `reindex --check` on a tree with no index | reports 4 stale, exit 1, **writes nothing** |
| `new-agent-log` → `new-iteration` ×2 on this very run | index seeded empty, then rewritten twice, current at `check` |
| Production build | ✅ 1,203 pages, `guide.ts` change included |

**Backfilling the four historic logs was itself the generator's real test**, and
it produced something the flat filenames never showed: run `020_wf_ship-the-split`
round 07 renders three named auditors (`opus`, `sonnet`, `gpt-5.6-sol`) and round
14 two — a fan-out visible for the first time without opening a file.

> [!NOTE]
> **One real finding, left alone deliberately.** In `020_wf_ship-the-split` the
> index shows round 14 as `in-progress` inside a run that finished. That is a
> genuinely stale round file the table surfaced on its first use — the point of
> the thing working. Closing a round is not this run's to do, so it is reported
> rather than corrected.
