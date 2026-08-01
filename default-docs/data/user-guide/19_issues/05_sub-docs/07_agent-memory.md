---
title: 07 · Agent Memory
description: AI-mutable working state for the issue — a pinned memory.md index plus three lifecycle buckets, plans / knowledge / history
sidebar_position: 7
---

# Agent Memory

The `agent-memory/` folder is the AI's **issue-scoped working state** — durable facts worth not rediscovering: what's left to do, gotchas, dead ends, decisions not to re-litigate, pointers that were expensive to find. Where `agent-log/` records *what happened*, agent-memory holds *what's still true*.

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
│   ├── key-facts.md
│   ├── gotchas.md
│   └── decisions.md
│
└── history/                        HOW WE GOT HERE    · write-once, never goes stale
    └── <subject>.md
```

**The organising idea is lifecycle, not subject.** Each bucket has exactly one staleness rule, and that rule is what tells a cold reader whether to trust the file:

| Bucket | Answers | Lifecycle | Goes stale? |
|---|---|---|---|
| `memory.md` | where is everything | rewritten as the map changes | it's a map — if it's wrong, it's broken |
| `plans/` | what's left, in what order, who's blocked | updated every session | **yes, instantly** — unmaintained is worse than absent |
| `knowledge/` | what is true and binding here | corrected in place, never amended | only if not corrected |
| `history/` | how we got here | written once, then left | **no** — a record of what happened can't expire |

**Precedence when they disagree: `plans/` > `knowledge/` > `history/`**, and the loser gets corrected rather than left to contradict.

### Not every issue needs all of it

Grow into the shape; don't scaffold it empty.

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | a small issue — a handful of facts |
| 1 | `memory.md` + topic files flat at the root | most issues stop here |
| 2 | + `plans/` | work spans sessions and has an order, or a queue of things blocked on a human |
| 3 | + `history/`, and `knowledge/` once the flat topic files outgrow the root | the chronology is long enough that "what's true now" and "how we got here" start fighting |

## `memory.md` — the index

A small, cheap-to-read map: one line per topic file (`- [Gotchas](knowledge/gotchas.md) — <one-line hook>`). An agent loads the index, then reads *only* what the task needs — the same pattern as a skill (`SKILL.md` → `references/`).

- **Content never lives in the index.** It is a map, not a store. The failure mode is an index that accumulates a "current state" section, which then competes with `plans/` for the same job and loses silently.
- **When a section is superseded, delete it** — don't annotate it as stale. If it's worth keeping, it belongs in `history/`.
- **Open with a pointer to the active plan**, so the first thing any reader hits is the live picture.
- **Any bucket beyond the standard three must declare its lifecycle on its index line.** A folder whose staleness rules nobody knows is the thing this shape exists to prevent.

## `plans/` — what's left

### The numbering bands

| Band | For |
|---|---|
| **`0NN_`** | **Plan files**, sequential, each with a ~3-word slug: `001_plan-finish-the-codec.md`, `002_plan-…` |
| **`1NN_`** | **Standing files** that span every plan — the question list, and anything else permanent |

`_` is the canonical ordering separator, so these sort by numeric value and lint cleanly. Plans sit in the lower band deliberately: opening the folder shows the current plan first and the standing files after — the order you want to read them in.

### The rules

- **The highest-numbered plan file is the active one.** One open at a time, no ambiguity about which to read.
- **A new plan opens only when the previous one is COMPLETE** — not when the plan changes, not when something is added. **Mid-plan discoveries go into the current file**, because they are part of that body of work.
- **Update it in place as work lands** — tick boxes, add what you discover. **Never delete it.**
- **A closed plan file is never edited again.** It gets a short `## Closed` section — what shipped, and what was dropped rather than finished, with why — and is then frozen.
- **Answered questions move to an `Answered` section, never deleted.** A decision whose reasoning is lost gets re-litigated.

### Why numbered files rather than one file edited forever

Dated plan documents that accumulate ("execution order", "the revised plan", "the new ordering") each read as authoritative and **nothing says which is current**, so the newest is not reliably the truest and superseded orderings get followed.

The obvious fix — one undated file edited forever — trades that for a worse problem: it destroys the answer to *"what did we consider in scope back then, and what did we know?"*, which is exactly the question you ask when work turns out to have been mis-scoped.

Sequential numbering keeps both: each body of work survives intact as a record, and **highest-number-wins** removes the ambiguity. The problem was never that there were several files — it was that nothing said which one was live.

## The plan file

```markdown
---
title: "Plan 001 — <what this body of work is>"
plan: open              # open | closed — the CLI enforces one-open-at-a-time on this
opened: 2026-08-01
---

> [!IMPORTANT]
> **This plan is OPEN.** Update it in place as work lands; never delete it. A new
> `002_plan-…` opens only when this one is COMPLETE. If this file disagrees with
> anything else in `agent-memory/`, this file wins and the other gets corrected.

## Goal

One paragraph — what "done" means for this whole plan.

## Scope

Where the shape came from (the user's words, an audit, a decision), then the table:

| # | Cycle | Outcome | Owner | Depends on | Subtasks | Status |
|---|-------|---------|-------|------------|----------|--------|
| 1 | **Bug fixing** `bug-fixing` | the known-wrong code stops being wrong | agent | — | 2/4 | in-progress |
| 2 | **Sign-offs** `sign-offs` | eight finished things stop being parked | **human** | — | 0/13 | input-needed |
| 3 | **The write lease** `write-lease` | the actual restructure | agent | `sign-offs` | 0/1 | blocked |

## Execution order — what actually happens next
<!-- OPTIONAL. Omit while the `#` order IS the running order; add it the moment
     the two diverge. When present, THIS TABLE WINS. -->

| Order | Cycle | Why it sits here | Blocked on |
|---|---|---|---|
| **1st** | **1** — bug fixing | finish what is started before opening anything | nobody |
| **2nd** | **3 + 2 together** — the lease loop | they interleave as one loop, not a sequence | nobody |
| **last** | **4** — cleanup | optimising code that 3 is about to move means doing it twice | 3 |

**Cycle N is not in this order — it is a parallel track.** Say so for anything
deliberately outside the sequence, or it reads as forgotten.

## 1 · Bug fixing

The objective and the outcome, in prose a human reads once and gets. What this
is, plainly — not a restatement of the subtasks below.

- [ ] [`16/85` — close the optional-catalog surfaces](../../subtasks/…) — why it's here
- [x] [`13/86` — .nsd byte stability](../../subtasks/…) — **LANDED `79bb155`**

## 2 · Sign-offs

…

## Not in this plan

Explicit exclusions — kills the "is X covered?" question before it's asked.

## Notes

## Closed
<!-- added once, at close: date, what shipped, what was dropped and why. Then frozen. -->
```

### The cycle — the unit a plan is built from

> **A cycle is a grouped set of tasks finishable in one setting or one autonomous flow, closed by a review.**

Not a phase, not a milestone, and not a subject. The tasks in a cycle need not be related to each other — what makes them one cycle is that they can be *done together, in one pass*, after which the only thing standing between them and done is a review (an agent's own, or a human's sign-off).

**Right-sizing test:** a cycle is right if it maps to exactly **one agent-log activity** and, if you use per-work-unit branches, **one branch**. If it needs two activities, it's two cycles. If you can't name what it did in one line, it isn't a cycle yet.

That gives the plan a clean correspondence with the rest of the tracker:

| Plan | Execution record | Git |
|---|---|---|
| plan file | agent-log **group** | issue branch |
| **cycle** | one **activity** `NNN_<code>_<name>/` | one work branch |
| subtask checkbox | milestone | commit |

### Identity vs order — the rule that keeps a reorder cheap

Cycles are **ordered but largely independent**, and the order **will** change mid-execution. That is normal. The failure is responding to it by renumbering — which is expensive precisely because the numbers work: people write "blocked on #7" in subtasks, milestones and chat, and every one of those references breaks silently.

- **`#` is a STABLE IDENTIFIER** — assigned once, never renumbered, never reused. The table's row order carries no meaning on its own.
- **The slug is identity too**, and is what a reference from *another* file should cite — `#7` is meaningless outside the plan it lives in.
- **When the running order diverges from the numbering, add the optional `## Execution order` section.** Never renumber. When that section exists **it wins** over the `#` order; when it's absent, the `#` order *is* the order.
- **Real dependencies go in `Depends on`**, as slugs — structural, cycle → cycle, permanent.

### The `## Execution order` section — optional, and worth adding early

A second small table holding three things a dependency column structurally cannot:

| It holds | Example |
|---|---|
| Ordering reasons that are **not** dependencies | *"the surrounding code is freshly understood — doing it later means re-learning it"* · *"finish what is started before opening anything"* |
| Cycles deliberately **outside** the sequence | a human review track that nothing waits on and that waits on nothing |
| Cycles that **merge** into one loop | *"7 + 6 together"* — decide-and-build interleaved, not one after the other |

**`Blocked on` here is not `Depends on` there.** `Depends on` is structural and permanent (cycle → cycle). `Blocked on` is what's holding this up *today*, which is very often a person — *"one call from the owner on the dead branches"* is not a cycle dependency, and that's exactly why it needs its own column.

**Anything left out of the order must be named as deliberately out of it.** A cycle missing from the table otherwise reads as forgotten rather than parallel.

### The table columns

| Column | Holds |
|---|---|
| `#` | **stable identifier** — assigned once, never renumbered or reused |
| `Cycle` | name + its stable slug |
| `Outcome` | **what it actually gets you** — the plainest statement of the payoff, not a restatement of the name |
| `Owner` | who can close it — `agent`, a person's name, or both. Human-owned cycles are usually the real bottleneck; the column makes that visible |
| `Depends on` | cycle slugs, or `—` |
| `Subtasks` | `done/total`, **derived from the checkboxes below** — the linter compares them |
| `Status` | the tracker's own vocabulary (`open` · `in-progress` · `blocked` · `input-needed` · `review` · `done`) — never a private one |

`ready` is **derived** (`open` + no unmet dependency), never written — so the table computes rather than being asserted.

### Keeping a plan honest

1. **Tick boxes as work lands.** An unmaintained plan is worse than none, because it still reads as current.
2. **The subtask is always the source of truth for detail.** The plan carries the *shape* and the *order*; if it restates a subtask's contents it will drift from it.
3. **Trace every identifier to its defining table before acting on it.** Downstream summaries are not sources — and identifiers collide (two different queues both numbering `MV-1`).

## `knowledge/` — what's true

The classic agent-memory content: gotchas, environment quirks, "this approach is dead because…", decisions not to re-litigate, expensive-to-find pointers. One coherent topic per file, named by topic — `NN_` prefixes are pointless here, since this is a map, not a sequence.

Until it outgrows the root, these files just sit at the root of `agent-memory/` next to `memory.md`; promote them into `knowledge/` when there are enough that the folder listing stops being readable.

## `history/` — how we got here

The chronology: what was tried, what landed, what was parked and why. **Write-once** — a record of what happened doesn't expire, which is exactly what makes it safe to leave alone.

The distinction that matters: **a plan that has been superseded is history, not a plan.** Move it here rather than leaving it in `plans/` to compete with the live one — that competition is the single most common way this folder goes wrong.

## The rules

- **Fully agent-autonomous.** The agent decides what to write, rewrite, or delete — without asking — unless the user directs otherwise.
- **Mutable in place, not append-only.** Wrong memories get corrected or removed, not amended. (This is the lifecycle difference that makes it a sibling of, not part of, `agent-log/`.)
- **Always-on.** Maintained during *any* work on the issue, not only inside a named agent-log activity.
- **What doesn't belong:** anything the repo, git history, issue body, or notes already record — memory complements those, it never mirrors them (mirrors rot).
- **Issue-scoped.** Complements global agent memory, never replaces it. When an issue closes, its memory stays as part of the record — useful if the work reopens.

## Scaffolding

```bash
agent-ks issue new-memory-plan <issue-id> --name <three-words>
```

Creates `agent-memory/` if absent (with a `memory.md` index), writes the next `0NN_plan-<slug>.md` from the template, and adds its index line. **It refuses if the current highest plan has no `## Closed` section** — which is the one-open-at-a-time rule made structural instead of merely documented. `--force` overrides; `--close` closes the active plan first.

`agent-ks check issues` lints the rest: two open plans, an unslugged plan file (`001_plan.md`), a `Subtasks` count that disagrees with the checkboxes, a `Depends on` slug that matches no cycle.

## Rendering

Sidebar section after Agent log (database icon); **`memory.md` pins first**, everything else follows the normal ordering — so `plans/` sorts above `knowledge/` above `history/` only by name, and the index is what does the real routing. Each file gets its own URL: `/<tracker>/<issue>/agent-memory/<path>`.

## See also

- [Agent Log](./agent-log) — what happened (vs what's still true)
- [Subtasks](./subtasks) — the source of truth for detail; a plan links them, never restates them
- [Notes](./notes) — human-curated output; same free-form feel, different owner and durability
- [Using with AI](../using-with-ai) — agent discipline
