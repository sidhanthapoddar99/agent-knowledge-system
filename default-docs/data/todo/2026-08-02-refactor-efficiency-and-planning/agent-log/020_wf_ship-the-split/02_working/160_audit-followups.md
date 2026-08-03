---
title: "The audit follow-ups — three agents on disjoint files, and a gate that was lying"
status: done
agent: claude
---

# Goal

Clear the seven follow-ups the three audit readers left behind
([the group](../../../subtasks/070_audit-followups/00_overview.md)), and stop
doing it one grep at a time.

Sid's words at the start of the round, and they were about method rather than
scope: *"What the hell are you doing on an iteration loop and that too so
slow?"* The work was breadth — twenty-odd reference files, most of the cost in
reading — and it was being run serially in the main context. That is the exact
shape the delegation rule exists for.

# Inputs

- The seven follow-ups, `010`–`070`, written from the three-reader audit
  ([the audit brief](./140_audit-brief.md))
- The two audit reports: [the Opus skill-consistency
  read](./141_audit-skill-consistency-opus.md) and [the sol executor-followability
  read](./142_audit-executor-followability-sol.md)

# Expected Outcome

Every follow-up either fixed with the gates green, or closed with evidence that
it was already fixed. No new subtask opened for a one-line edit.

# Outcome

**All seven resolved. Build 950 pages green, `check issues` 51 folders / 0
errors / 1 pre-existing warning, `check skill-links` clean and control-tested.**

## Three agents, split by file OWNERSHIP rather than by subtask

The split that made this parallelisable is not the obvious one. Subtasks `020`
and `040` are different concerns but touch the same three files; `030` is one
concern confined to one file. Splitting by subtask would have put two agents in
`28_plans.md` at once.

| Agent | Owned | Covered |
|---|---|---|
| 1 | `24_agent-logs.md` alone | `030` |
| 2 | `SKILL.md`, `00_overview.md`, `28_plans.md` | `020` + `040` |
| 3 | read-only, whole skill | the sweep — no writes, so it could not collide |

Each brief carried the hard rule that no agent runs a git write command. Nothing
collided, and no file was touched by two writers.

## The decision I took rather than escalating

**The closing-authority rule lives in `00_overview.md`, as a `### Closing
authority` section, and every other file links to it.** Three files each stated
a version of it and two of them were wrong for agent logs. The alternative —
correcting all three in place — keeps the drift and buys nothing structural.
Fourteen inbound links from eight files now point at that one anchor.

## Two agent decisions worth keeping, both taken on evidence

**Agent 1 contradicted the audit readers, and was right.** The readers assumed
child agent logs nest one level. It read the code: `check.mjs:869` errors at
`depth + 2 >= MAX_SUBFOLDER_DEPTH` with the top log entered at depth 1, so a
child *and* a grandchild are legal and only a third level fails — and both
`check.mjs:870` and `new-agent-log.mjs:106` already say *"two levels of child
agent log is the working ceiling"* in as many words. Writing "one level" would
have put the manual at odds with its own validator. **Verified independently
before accepting it**, which is the whole reason the terminal judge re-reads.

**Agent 2 settled an unstated rule:** `done`/`dropped` on a *plan stage* is
agent-settable, read off two facts already in the file — the agent may close a
plan, and a stage carries no status of the work. It is the third row of the new
authority table and reversible in one line.

## What the read-only sweep found, which neither writer would have

`64_phase-index.md` **is where the previous rewrite stopped.** It had received
exactly one changed line — the bullet that used to say *"numbering encodes
sequence"* — while the ASCII tree, the opening sentence and the closing takeaway
all still taught the retired model, and the tree still lacked the `plans/` folder
the repaired bullet points at. **A reader copies the tree, not the bullet.**
Rewritten whole.

Three of the sweep's findings fell outside all seven subtasks, and are folded in
rather than given new folders:

| Site | Defect |
|---|---|
| `42_updating.md:111` | The skill's only tracker-validation recipe named **`check section`**, which validates a *docs* section and knows nothing of tracker schema — it would pass a tracker with a broken vocabulary. Also wrote the tracker positionally where the tool takes `--tracker` |
| `10_writing.md:133` | Broke its own reference-by-link rule sixty lines after stating it |
| `43_moving-restructuring.md:41` | Told an agent to flip a subtask to `done` |

# The gate that was lying, and it is the finding of the round

`agent-ks check skill-links` reported **"✓ all checks passed, 3 skills, 44 files"**
on this round's edits. It had read none of them.

The script resolves its scan root from **its own location on disk**, and the
`agent-ks` dispatcher on `PATH` runs the *installed* plugin. So a bare run
checked `~/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/0.7.0/skills`
— a published copy that no working-tree edit can ever reach.

Two things make this worse than an ordinary bug:

- **Every previous "skill-links clean" in this issue's record was measured the
  same way**, including the one in [the release round](./150_version-bump.md).
  Those greens were true of the installed plugin and say nothing about what was
  committed.
- The script's own docstring describes fixing a *neighbouring* scope bug — *"it
  used to default to its own skill root, so a bare run reported 'all checks
  passed' having read one skill of three"*. The lesson was recorded and the same
  class of defect survived in a different form. **A gate whose scope is derived
  from where its code happens to live will keep doing this.**

Correct invocation, which is what every gate line below used:

```bash
bun plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs
```

**Control-tested rather than trusted.** A probe file carrying one deliberately
broken link was dropped into `references/`: the run went from 44 files clean to
45 files with `✗ broken link → ./this-file-does-not-exist.md`, then back to 44
and clean when removed. That is the proof the pass is real and not another empty
scope.

Filed as [the gate reads the installed plugin](../../../subtasks/130_skill-links-checks-the-wrong-tree.md).

# Gates

| Gate | Result |
|---|---|
| `./start build` | **950 pages**, exit 0 |
| `agent-ks check issues` | 51 folders, **0 errors**, 1 warning (pre-existing, `2026-04-10-issues-layout`) |
| `check-skill-links.mjs` **run against the working tree** | 3 skills, 44 files, clean — control-tested both directions |
