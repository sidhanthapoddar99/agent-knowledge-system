---
title: "24_agent-logs.md contradicts itself in four places"
status: review
---

# Overview

The agent-log reference is the largest file in the skill (491 lines) and the one
a reader consults most often. Two readers found four internal contradictions in
it, one of them naming a passage from which *"an agent cannot safely build the
folder tree"*.

These are not stale cross-references to other files — they are the same document
disagreeing with itself, which means no amount of reading elsewhere resolves
them.

**Done when** the four passages below agree with the rest of the file, and the
worked example matches the rule it illustrates.

# References

- [reader 3 — sol](../../agent-log/020_wf_ship-the-split/02_working/073_verdict-sol.md)
  — the child-log passage is its *worst passage in my winner*
- [reader 1 — Opus](../../agent-log/020_wf_ship-the-split/02_working/071_verdict-opus.md)
  — the numbering defect, under *flatly wrong*
- The intended shape: [the agent-log structure](../../notes/20_agent-log-structure.md)

# Todo list

- [x] **`:69-70`** — *"A ten-stage plan gives ten child agent logs"* against
      `:378-390`, which says plan stages *"do not appear in `agent-log/` at
      all"*. Decide which is the rule and delete the other
- [x] **`:420`** — the flagship example numbers a producer folder `060_`, where
      `:83` numbers the same artifact `061_` and `:136` reserves `0` for the
      iteration file. **Verified: both numbers are in the file.**
- [x] **`:486`** — *"Iteration files are write-once by nature"* against `:95,97`
      (Task List ticked as work lands, Outcome Summary written at close) and
      `:182` (orchestrator writes the head, producer writes the Outcome later)
- [x] **`:75-84`** — *"Two levels of child agent log is the working ceiling"*
      against the worked example's *"Depth stops at four"* (`:444`) and a table
      showing one level. State whether a second nested child log is legal
- [x] Re-read the file end to end afterwards — four found by two readers is a
      floor, not a census

# Outcomes and Next Steps

**Done 2026-08-03** — [the round](../../agent-log/020_wf_ship-the-split/02_working/160_audit-followups.md).
All four resolved, plus seven more the end-to-end re-read turned up — which is
why the last todo above is worded as a floor rather than a census.

| # | Kept | Deleted |
|---|---|---|
| `:69-70` | "A plan stage is not a run, and never becomes a folder here" | "A ten-stage plan gives ten child agent logs" |
| `:420` | `NN0_` = iteration file, `NN1_`–`NN9_` = producers | `060_research-codecs/` — now `060_codec-shortlist.md` + `061_research-codecs/` beside it |
| `:486` | Iteration files are filled in as the round runs | "write-once by nature" — replaced by the real property, that the **log is append-only** |
| `:75-84` | "Two levels of child agent log is the working ceiling" | The table showing one level, and "Depth stops at four" |

## The depth call went against the readers, on code evidence

Both readers implied one level of child log. The agent that owned the file read
the validator instead: `check.mjs:869` errors at `depth + 2 >=
MAX_SUBFOLDER_DEPTH` with the top log entered at depth 1, so a child **and** a
grandchild are legal and only a third level fails — and `check.mjs:870` and
`new-agent-log.mjs:106` both already say *"Two levels of child agent log is the
working ceiling"* verbatim. Writing "one level" would have put the manual at
odds with its own tooling.

**Verified independently before accepting it** rather than taken on report: the
arithmetic was re-derived and both source lines re-read. `MAX_SUBFOLDER_DEPTH =
5` counts folder segments below `agent-log/`, so the deepest legal path is
log → child → child → `02_working/` → producer folder — exactly five. The table
now shows that path and states plainly that a second nested child is legal and a
third is not, with the escape hatch for a third-level sub-goal.

## Seven more, found only by the end-to-end re-read

- **"An audit report is an iteration file"** contradicted the vocabulary, the
  pair case and the worked example. An audit report is a **producer** file.
- **"No slot is required to exist"** against `01_summary.md` being REQUIRED.
  Now: `02_working/` and `03_debrief/` are optional, `01_summary.md` always
  exists.
- An external tool's owner "writes the iteration file" → writes *that half's*
  file, per the pair rule.
- `status: done  # the canonical 7` over a table listing five → "five of the
  canonical 7".
- "The workflow's stages are NOT folders" used *stages* for a workflow's internal
  units one bullet after saying plan stages do not appear — renamed.
- The "rapid ad-hoc changes" recipe opened a log for inline work, against the
  gate that only delegation or multiple rounds opens one.
- "No notes section" read as a ban on the issue's `notes/`; it meant `# Notes` in
  `01_summary.md`.

## Left for someone else — a doc-vs-code gap, not a contradiction

`:67-68` says *"everything directly under `agent-log/` is a run whatever its
number"*, but `new-agent-log.mjs` supports `--group`, which creates a **label**
folder under `agent-log/` that is not a run. The file is consistent with itself;
it disagrees with the CLI. Not fixed here — it needs a decision about which one
is right, and the CLI was outside this scope.

# Details

## The one that is provably wrong rather than ambiguous

Line 136 states the numbering rule:

> First two digits = the iteration. Last digit = which file within it — `0` for
> the iteration file itself, `1`…`9` for a producer's own file.

Line 83 applies it correctly: `061_research-codecs/`, a producer's artifact
folder. Line 420, in the flagship worked example, writes the **same artifact** as
`060_research-codecs/` — a producer in the slot reserved for the iteration file,
inside an iteration that has no iteration file.

Both lines are in the tree today. This one needs no design call, only the fix.

## Why sol called `:69-70` the worst passage

> A ten-stage plan gives ten child agent logs; a loop with four named goals gives
> four; the agents running inside any of them give iteration files.

It contradicts the file twice over: `:378-390` says stages are *not* folders in
`agent-log/` (they are iteration digits), and `:118-132` says file count follows
**produced output**, not agent count. The sentence quietly reinstates
one-unit-one-folder, which is the exact rule this issue removed.

**A reader building a tree from that sentence builds the shape the rewrite
deleted.** That is the same failure as the stale worked examples
([`010`](./010_migrate-the-worked-examples.md)), one level in.

## On "write-once"

The write-once claim is defensible as *intent* — an iteration file is not
rewritten the way `01_summary.md`'s State is. But the file also instructs a
two-phase write (head before the work, Outcome after), which is by definition not
write-once. The wording needs to distinguish **written twice, at two known
moments** from **live**.
