# Agent-memory — `agent-memory/` — always on

AI-mutable working state for **this** issue — durable facts worth not rediscovering.
Agent-managed, issue-scoped. **Maintain it continuously during any work on the
issue**, not only inside a named agent-log activity: the log records *what
happened*; memory holds *what's still true*.

## Shape — an index plus three lifecycle buckets

```
agent-memory/
├── memory.md                       INDEX ONLY — routes, stores nothing. Pinned first.
│
├── plans/                          WHAT'S LEFT        · live, rewritten every session
│   ├── 001_plan-<three-words>.md     0NN_ = sequence · HIGHEST NUMBER = ACTIVE
│   ├── 002_plan-<three-words>.md     one open at a time · closed ones frozen
│   └── 101_questions-to-answer.md    1NN_ = standing · spans every plan
│
├── knowledge/                      WHAT'S TRUE        · mutable in place
│   └── <topic>.md                    gotchas · decisions · key-facts
│
└── history/                        HOW WE GOT HERE    · write-once, never goes stale
    └── <subject>.md
```

**Bucketed by LIFECYCLE, not by subject** — each folder has exactly one staleness
rule, and that rule is what tells a cold reader whether to trust the file.

| Bucket | Answers | Goes stale? |
|---|---|---|
| `memory.md` | where is everything | it's a map — if it's wrong, it's broken |
| `plans/` | what's left, in what order, who's blocked | **yes, instantly** — unmaintained is worse than absent |
| `knowledge/` | what is true and binding here | only if not corrected |
| `history/` | how we got here | **no** — what happened can't expire |

**Precedence when they disagree: `plans/` > `knowledge/` > `history/`**, and the
loser gets corrected rather than left to contradict.

### Grow into it — don't scaffold it empty

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | small issue, a handful of facts |
| 1 | + topic files flat at the root | **most issues stop here** |
| 2 | + `plans/` | work spans sessions, has an order or a human-blocked queue |
| 3 | + `history/`, and `knowledge/` once flat files outgrow the root | "true now" and "how we got here" start fighting |

## `memory.md` — the index

One line per topic file: `- [Gotchas](knowledge/gotchas.md) — <one-line hook>`.
Load the index, then read only what the task needs — same pattern as a skill
(`SKILL.md` → `references/`).

- **Content never lives in the index.** Map, not store. The failure mode is an
  index that grows a "current state" section, which then competes with `plans/`
  for the same job and loses silently.
- **A superseded section gets DELETED, not annotated as stale.** If it is worth
  keeping it belongs in `history/`.
- **Open with a pointer to the active plan** — first thing any reader hits.
- **Any bucket beyond the standard three declares its lifecycle on its index
  line.** A folder whose staleness rules nobody knows is what this shape prevents.

## `plans/` — what's left

**Bands:** `0NN_` = plan files (sequential, each with a ~3-word slug —
`001_plan.md` is anonymous and defeats the purpose); `1NN_` = standing files
spanning every plan. `_` is the canonical separator, so both sort by numeric
value and lint cleanly.

- **Highest-numbered plan file is ACTIVE.** One open at a time.
- **A new plan opens only when the previous is COMPLETE** — not when the plan
  changes. **Mid-plan discoveries go into the CURRENT file**; they belong to that
  body of work.
- **Update in place as work lands; never delete.**
- **A closed plan is never edited again** — it gets a `## Closed` section (what
  shipped, what was dropped and why) and is frozen.
- **Answered questions move to an `Answered` section, never deleted** — a decision
  whose reasoning is lost gets re-litigated.

**Why numbered files, not one edited forever.** Dated plan documents that pile up
each read as authoritative and nothing says which is current, so superseded
orderings get followed. One undated file edited forever fixes that and breaks
something worse: it destroys the answer to *"what did we consider in scope back
then, and what did we know?"* — the exact question you ask when work turns out
mis-scoped. Numbering keeps the record **and** an unambiguous highest-wins rule.

## The plan file — the template

````markdown
---
title: "Plan 001 — <what this body of work is>"
plan: open              # open | closed — the CLI enforces one-open-at-a-time on this
opened: 2026-08-01
---

> [!IMPORTANT]
> **This plan is OPEN.** Update in place as work lands; never delete it. A new
> `002_plan-…` opens only when this one is COMPLETE. If this disagrees with
> anything else in `agent-memory/`, this file wins and the other gets corrected.

## Goal
One paragraph — what "done" means for this whole plan.

## Scope
Where the shape came from (the user's words, an audit), then:

| # | Cycle | Outcome | Owner | Depends on | Subtasks | Status |
|---|-------|---------|-------|------------|----------|--------|
| 1 | **Bug fixing** `bug-fixing` | the known-wrong code stops being wrong | agent | — | 2/4 | in-progress |
| 2 | **Sign-offs** `sign-offs` | eight finished things stop being parked | **human** | — | 0/13 | input-needed |
| 3 | **The write lease** `write-lease` | the actual restructure | agent | `sign-offs` | 0/1 | blocked |

## Execution order — what actually happens next
<!-- OPTIONAL. Omit it while the `#` order IS the running order; add it the
     moment the two diverge. When present, THIS TABLE WINS. -->

| Order | Cycle | Why it sits here | Blocked on |
|---|---|---|---|
| **1st** | **1** — bug fixing | finish what is started before opening anything | nobody |
| **2nd** | **3 + 2 together** — the lease loop | they interleave as one loop, not a sequence | nobody |
| **last** | **4** — cleanup | optimising code that 3 is about to move means doing it twice | 3 |

**Cycle N is not in this order — it is a parallel track.** Say so for anything
deliberately outside the sequence, or it reads as forgotten.

## 1 · Bug fixing
Objective and outcome in prose a human reads once and gets — what this is,
plainly. Not a restatement of the subtasks below.

- [ ] [`16/85` — close the optional-catalog surfaces](../../subtasks/…) — why it's here
- [x] [`13/86` — .nsd byte stability](../../subtasks/…) — **LANDED `79bb155`**

## 2 · Sign-offs
…

## Not in this plan
Explicit exclusions — kills "is X covered?" before it's asked.

## Notes

## Closed
<!-- added once, at close: date, what shipped, what was dropped and why. Then frozen. -->
````

### The cycle — the unit a plan is built from

> **A cycle is a grouped set of tasks finishable in one setting or one autonomous
> flow, closed by a review.**

Not a phase, not a milestone, not a subject. The tasks need not relate to each
other — what makes them one cycle is that they can be done **together, in one
pass**, after which the only thing between them and done is a review (the agent's
own, or a human sign-off).

**Right-sizing test: one cycle = one agent-log activity = one work branch.** Two
activities means two cycles. If you can't name what it did in one line, it isn't
a cycle yet.

| Plan | Execution record | Git |
|---|---|---|
| plan file | agent-log **group** | issue branch |
| **cycle** | one **activity** `NNN_<code>_<name>/` | one work branch |
| subtask checkbox | milestone | commit |

### Identity vs order — the rule that keeps a reorder cheap

Cycles are **ordered but largely independent**, and the order **will** change
mid-execution. That is normal; the failure is responding to it by renumbering.

- **`#` is a STABLE IDENTIFIER** — assigned once, never renumbered, never reused.
  The table's row order carries no meaning on its own.
- **The slug is identity too**, and is what a reference from *another* file cites
  — `#7` is meaningless outside the plan it lives in.
- **When the running order diverges from the numbering, add the optional
  `## Execution order` section.** Never renumber. When that section exists, **it
  wins** over the `#` order; when it is absent, the `#` order *is* the order.
- **Real dependencies live in `Depends on`**, as slugs, and are structural
  (cycle → cycle, permanent).

### The `## Execution order` section — optional, and worth it early

A second small table that holds three things a dependency column structurally
cannot:

| It holds | Example |
|---|---|
| Ordering reasons that are **not** dependencies | *"the surrounding code is freshly understood — doing it later means re-learning it"* · *"finish what is started before opening anything"* |
| Cycles deliberately **outside** the sequence | a human review track that nothing waits on and that waits on nothing |
| Cycles that **merge** into one loop | *"7 + 6 together"* — decide-and-build interleaved, not one after the other |

**`Blocked on` here is NOT `Depends on` there.** `Depends on` is structural and
permanent (cycle → cycle). `Blocked on` is what is holding this up *today*,
which is very often a person — *"one call from the owner on the dead branches"*
is not a cycle dependency, and that is exactly why it needs its own column.

**Anything left out of the order must be named as deliberately out of it** —
otherwise a cycle missing from the table reads as forgotten rather than parallel.

### Columns

| Column | Holds |
|---|---|
| `#` | **stable identifier** — assigned once, never renumbered or reused |
| `Cycle` | name + its stable slug |
| `Outcome` | **what it actually gets you** — the payoff, not a restatement of the name |
| `Owner` | who can close it: `agent`, a person, or both. Human-owned cycles are usually the real bottleneck; the column makes that visible |
| `Depends on` | cycle slugs, or `—` |
| `Subtasks` | `done/total`, **derived from the boxes below** — the linter compares them |
| `Status` | the tracker's own vocabulary (`open`/`in-progress`/`blocked`/`input-needed`/`review`/`done`) — never a private one |

`ready` is **derived** (`open` + no unmet dependency), never written — the table
computes instead of being asserted.

### Keeping a plan honest

1. **Tick boxes as work lands.** Unmaintained is worse than absent — it still
   reads as current.
2. **The subtask is always the source of truth for detail.** The plan carries
   *shape* and *order*; restating a subtask's contents guarantees drift.
3. **Trace every identifier to its defining table before acting on it.**
   Downstream summaries are not sources, and identifiers collide (two queues both
   numbering `MV-1`).

## `knowledge/` and `history/`

- **`knowledge/`** — gotchas, environment quirks, "this approach is dead
  because…", decisions not to re-litigate, expensive-to-find pointers. One topic
  per file, **named by topic**; `NN_` prefixes are pointless here (map, not
  sequence). Files sit at the root of `agent-memory/` until there are enough that
  the listing stops being readable, then move into `knowledge/`.
- **`history/`** — the chronology: what was tried, what landed, what was parked
  and why. **Write-once.** The distinction that matters: **a superseded plan is
  history, not a plan** — move it here rather than leaving it in `plans/` to
  compete with the live one. That competition is the most common way this folder
  goes wrong.

## Rules

- **Fully agent-autonomous.** Decide what to write, rewrite, or delete without
  asking (unless the user directs otherwise). **Mutable in place, not
  append-only** — wrong memories get corrected or removed, not amended.
- **What doesn't belong:** anything the repo, git history, issue body, or notes
  already record — memory complements those, never mirrors them (mirrors rot).
- **Issue-scoped.** Complements your global memory, never replaces it. When an
  issue closes its memory stays — useful if the work reopens.
- **vs `notes/`:** same free-form feel, different owner and durability — notes are
  human-curated product; memory is the AI's working state.

## Recipe

```bash
agent-ks issue new-memory-plan <issue-id> --name <three-words>
```

Creates `agent-memory/` if absent (with a `memory.md` index), writes the next
`0NN_plan-<slug>.md` from the template above, and adds its index line. **It
refuses if the current highest plan has no `## Closed` section** — the
one-open-at-a-time rule made structural rather than merely documented.
`--close` closes the active plan first; `--force` overrides.

For everything else: when you discover something the next agent would waste time
rediscovering, write it into the right bucket and add/refresh its index line.
Update stale entries in place.

`agent-ks check issues` lints the rest — two open plans, an unslugged plan file,
a `Subtasks` count that disagrees with the boxes, a `Depends on` slug matching no
cycle.
