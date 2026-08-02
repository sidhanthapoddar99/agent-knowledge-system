---
title: "60 — What each section is FOR (the responsibility split)"
---

# What each section is for

**Decided by Sid, 2026-08-02.** Provenance:
[thread 07](../brainstorm/07_discuss_section-responsibilities.md).

The volume problem is a **responsibility** problem. Every section is currently
permitted to hold everything, so every section holds everything — the same fact
written eight to twelve times because no file was ever told it was not that
fact's home. Fix the split and the volume falls out as a consequence.

This note is the source the skill, `guide.ts` and the user-guide are all
rewritten from. It replaces nothing else; it is what those three restate.

## The split, in one table

| Section | What it is for | In a word |
|---|---|---|
| `brainstorm/` | Initial ideation, and the iterating that follows it | **thinking** |
| `notes/` | Finalization — what is settled and binding | **conclusions** |
| `plans/` | Grouping, structuring, and the order of execution | **order** |
| `subtasks/` | Actionable items, the detail on those items, and the link to the notes that scope them | **scope** |
| `agent-log/` | Where the run is carried out and made visible, and where its outcome is recorded | **execution + outcome** |
| `agent-memory/` | Overall knowledge of execution — what is worth remembering across this issue | **memory** |
| `comments/` | That something happened, and when | **events** |

**The test for any sentence you are about to write: which of those purposes is
it?** If it is two, it is going in the wrong file, or it is being written twice.

`agent-log/` is the one that legitimately carries two, and they are sequential
rather than overlapping — the run is executed there, and its outcome is recorded
there when it lands.

## Per section — what belongs, and what must leave

### `agent-log/` — execution and outcome

**Where the run is carried out and where it lands.** Two things, in sequence:
the execution, made visible round by round while it happens, and the outcome
recorded when it finishes.

It is also the agent's own workspace — somewhere to organise, and to continue an
iterative loop across rounds.

| Holds | Does not hold |
|---|---|
| The **concern** — what this run is trying to solve | **The scope.** That is the subtask's, and restating it is the duplication |
| The **reason it was started** — essential for ad-hoc work like an audit, which no subtask covers | The subtask's details, re-typed |
| The **execution** — each round, what it is doing, visible while it runs | The **order** of the rounds as a plan — that is the plan's |
| **What is solved**, and what is not | How the code was edited, step by step |
| **What broke as a result**, and what future problems now exist | Twenty lines explaining two lines of code |
| **New todos** the run generated | |
| A todo list that is **a reference to subtasks or plan stages** | Its own list of micro-steps |

**The line that matters:** the agent log carries **execution**, not **scope**.
Recording that a round ran, what it was doing and how it came out is the section
working correctly. Re-stating what the subtask already says the work *is*, or
narrating how the code was edited, is not.

**Why:** the details are already in the subtask and the order is already in the
plan, so restating either is a second copy. And code is easier to do than to
explain — two lines of code do not require twenty lines of explanation.

### `subtasks/` — scope

Holds the actionable item, the detail needed to execute it, the link to the notes
that scope it, and the **final outcome**.

**A subtask is where the work is defined; the agent log is where it is carried
out.** That is the whole boundary between the two sections, and every case below
is an instance of it.

**It does not hold the specifics of how the outcome was reached.** Those are the
agent log's — unless the agent log was opened for that one small subtask, in
which case there is only one place and no duplication to avoid.

Today subtasks carry notes, outcomes, specifics and rationale all at once. Only
the first and last of those belong.

### `notes/` — conclusions

What is settled and binding. **Not a detailed account of what to do** — that is
the subtask's job, and `notes/` currently does it, which is half of why subtasks
and notes both read as complete duplicates of each other.

A note states the conclusion and the one clause of *why* that stops it reading as
arbitrary. It does not carry the deliberation that produced it (that stays in
`brainstorm/`) or the steps that will act on it (those are subtasks).

### `plans/` — order

Grouping, structuring and execution order. Nothing else. Spec:
[the plans section](./50_plans-section-spec.md).

Because the plan owns order, **no other file states order.** An agent log that
lists its stages in sequence is re-deriving the plan.

### `brainstorm/` — thinking

Initial ideation and the iterating on it. Unbounded by design; this is where
argument, rejected options and reversals live. Graduates to `notes/` when
something downstream needs to cite a conclusion.

### `agent-memory/` — memory

Overall knowledge of execution and anything worth remembering across this issue.
Not a second home for decisions (those are `notes/`) and not a plan.

**It loses `plans/`, and does not replace it.** The framework documents
`agent-memory/` today as an index plus **three** lifecycle buckets — `plans/`
(live), `knowledge/` (mutable), `history/` (write-once). `plans/` is now a
top-level section, so:

```
agent-memory/
├── memory.md      ← INDEX ONLY — routes, stores nothing. Pinned first.
├── knowledge/     ← what is true and binding here · corrected in place
└── history/       ← how we got here · write-once, never goes stale
```

**Nothing takes over the live bucket.** The temptation is to let `memory.md` grow
a "current state" section to fill the gap, and the framework's own docs already
warn against exactly that — an index that accumulates state competes with the
plan for the same job and loses silently. The plan is one click away; the index
stays a map.

The graduated levels shrink with it: `memory.md` alone → plus flat topic files →
plus `knowledge/` and `history/` when the flat files outgrow the root.

**Precedence when two disagree: `knowledge/` > `history/`**, and the loser gets
corrected rather than left to contradict.

Shipped by
[`120`](../subtasks/040_execution/120_agent-memory-after-plans.md), which is
larger than it sounds: the user-guide page currently spends about 150 lines
documenting the plan-file format inside the agent-memory page, and all of it
moves.

## Two rules that are now overturned

### 1. "One agent, one iteration file" — **overturned by Sid**

An iteration is **not** one agent and **not** one subtask. It is a group — of
subtasks, of executions, of agents.

| | Was | Is |
|---|---|---|
| What a file in `02_working/` covers | one agent's assignment | **one iteration** — a coherent round of work |
| Who writes it | the agent, as its mailbox | **the orchestrator**, from what the round produced |
| How many files a round makes | one per agent | **one**, plus a file per agent that produced something substantial |

**What replaces the mailbox rule.** An agent that produces something
substantial — an audit, a research survey, a measured comparison — still writes
its own file, using the folder form `02_working/NNN_<name>/` already in
[the agent-log spec](./20_agent-log-structure.md). An agent that does a small
piece of work returns, and the orchestrator records the outcome in the iteration
file.

**File count now scales with what was produced, not with how many agents ran.**
That is the point: the old rule guaranteed a file per agent regardless of whether
the agent had anything to say, which is the same defect as the six-slot floor.

The one thing the mailbox rule was actually protecting — two agents cannot write
one file concurrently without corrupting it — is unaffected: concurrent
producers each get their own file, and the orchestrator's iteration file is
written by exactly one writer.

### 2. "Subtasks are the *what*, the agent log is the *how*" — **contradicted**

`guide.ts` states this today, and both halves need correcting — but not in the
same direction, so the fix is easy to get wrong:

- **"Subtasks are the plan" is wrong.** `plans/` is the plan. A subtask is
  **scope** — one actionable item and the detail to execute it. Order is not its
  business.
- **"The agent log records the *how*" is wrong in the sense the word carries
  there** — method, how the code gets written. The agent log *does* record **how
  it went**: the execution, round by round, and the outcome. It does not record
  how to do the work, because that is the subtask's.

The distinction to preserve when rewriting: **execution is the agent log's;
scope and method are not.**

## Superseded wording is deleted, never kept

**Correct in place and keep nothing.** No struck-through text, no *"this
previously said…"*, no annotated-stale sections.

- **Remove superseded wording wherever it already exists**, not just going
  forward.
- **Most important in skills and `memory/`**, which load into every session — a
  preserved old sentence there is a permanent context tax on every run.
- **Where the history genuinely matters, it goes in the tracker** — the issue
  that made the change — never in the shipped rule.

This overturns *"answered questions move to an Answered section, never deleted"*
and *"corrected in place with the superseded wording kept"*, which the audit
named as the reason files only ever grow. It also resolves a contradiction the
skill already had: `26_agent-memory.md` says a superseded section is deleted
rather than annotated on one line and never deleted on another.

## Content that does not contribute is deleted

There is no rule requiring anything to be kept. Delete it when it does not
contribute to the issue, was never implemented, or is redundant. It adds clutter.

## No record for small work

A one-line change does not earn a subtask or an agent log. Small changes are done
without an agent, and are **grouped against a larger block** rather than each
getting its own folder.

This is the size input the audit asked for, and it is structural rather than
measured: **an agent log opens when work is delegated or runs over multiple
rounds.** Nothing else opens one.

## Audit reports

Sid does not read them. The rule is therefore not *write less audit* — depth,
file count and structure below the summary are the agent's business.

- Audit reports must be **conclusive in themselves**.
- **`01_summary.md` carries a simplified table** of the final audit. That is the
  only part written for a human.
- The **benchmark** surface is different — he does read it, especially while
  optimising. It keeps its detail.

## Where this lands

Every place the split is stated. Each of these **restates this note** — none of
them is the source.

| Where | What changes |
|---|---|
| `astro-doc-code/src/layouts/issues/default/guide.ts` | The section one-liners (~L96–103), the routing line (~L114), the `## Subtasks` opener (~L183) which states the overturned rule, the `## Agent log` block, and the anatomy tree |
| `plugins/agent-ks/skills/agent-ks-issues/` | `SKILL.md`'s section table and routing box; `references/20_sections/2N_*.md`, one per section |
| `default-docs/data/user-guide/19_issues/` | The anatomy overview and the per-section pages |
| The scaffolders — `new-agent-log.mjs`, `new-subtask.mjs` | The emitted headings, which is where the split gets enforced rather than remembered |

Subtask: [`050`](../subtasks/040_execution/050_docs-update-plans-section.md),
broadened from plans-only to every section.
