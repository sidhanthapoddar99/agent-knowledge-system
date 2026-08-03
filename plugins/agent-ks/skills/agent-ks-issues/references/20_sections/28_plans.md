# Plans — `plans/NN_<name>/` — order


**A plan is a schedule:** order, blocking, current focus, and the scope of this round of
work. Everything else about the work lives in the subtasks it references.

| Holds | Does not hold |
|---|---|
| The **order** stages run in | What the work *is* — that is the subtask's |
| What **blocks** what, and who each stage waits on | Any **status of the work**. Stages reference subtasks; the renderer pulls their live status |
| The **outcome** each stage is aiming at, in one line | A copy of the subtask list |
| Stage-scoped todos and questions | Questions that outlive the plan — those are the issue's `notes/` |

**A plan stores no status of its own about the work, so it cannot drift from reality —
there is no reality stored in it.** That is the design in one sentence, and it is why
there is no sync rule anywhere below.

**A plan is not a second copy of the subtask list.** It is the *ordering* and the
*blocking* — which is exactly what a subtask cannot express, because a subtask does not
know about its siblings.

Because the plan owns order, **no other file states order.** An agent log that lists its
rounds as a schedule is re-deriving the plan.

## Shape

```
plans/
└── 01_decoder-and-retention/       ← one plan
    ├── settings.json               ← title + status
    ├── overview.md                 ← RESERVED: the plan's intro, never a stage
    ├── 10_decoder-swap.md          ← a stage. Prefix = order AND id
    ├── 20_journal-compat.md
    ├── 30_retention.md
    └── 40_concurrency.md
```

**`plans/` contains plan folders and nothing else** — no standing files, no loose
markdown. `overview.md` is a reserved name; it renders as the page intro and never
appears as a stage row.

**Say "stage", not "section".** `section` already means a top-level issue folder.

## Numbering — the prefix is both the order and the id

```
10  20  30  40 …                  ← nine free slots between any two stages
20  23  26  29  30                ← inserting: SPREAD into the gap
```

**Spread into the gap; do not fill from one end.** `21, 22, 23` exhausts the space
beside `20` while leaving `24`–`29` empty.

**"Stage 20" is how you refer to a stage.** There is no id field — a reference is a
literal markdown path and that path contains the prefix. Renumbering is therefore a
**move**, and `agent-ks move` rewrites every reference, including the ones in
frontmatter.

Two digits gives nine stages with nine gaps each. A plan needing more than nine stages
is usually two plans.

# A stage file

```yaml
---
title: "Journal compatibility"
outcome: "6.7 journals still open in the new reader"
notes: "⏸ Held until [the codec lands](../01_decoder/20_codec.md) — reader half only"
who: sid                             # who it waits on
status: in-progress                  # the canonical 7
subtasks:
  - "[Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)"
  - "[Byte stability](../../subtasks/13_memory/86_byte-stability.md)"
---

## Todo
- [ ] [Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)
  - [ ] the reader half
- [ ] rename the fixture — too small for its own subtask

## Questions
- [ ] Does the 6.7 reader need to survive a truncated tail?
```

**No `# H1`.** The body starts at `## Todo`; the heading is generated as
`<prefix> · <title>`.

**The path is truth; the link text is a reading aid.** The renderer resolves the path
and pulls the subtask's live title and status, so stale link text costs nothing.

**Not every todo links to a subtask.** Small things are not forced into a folder of
their own.

## The body is free-form, and that is the point

`## Todo` and `## Questions` are **conventions, not a schema.** A stage may carry
whatever explains it:

- why it sits at this position rather than earlier or later
- what its status means *in practice* — not that it is blocked, but on what, and
  what would unblock it
- what was tried and rejected, so the next reader does not retry it
- a caveat, a measurement, a decision taken mid-stage

**Keep it short, but do not keep it thin.** The table row is a summary: `#`,
name, status, owner, one-line outcome, one-line note. Everything a reader needs
*beyond* that summary belongs in the body, and a stage whose body is three
unexplained checkboxes has pushed its reasoning into someone's head.

What still does not belong here: the work itself (that is the subtask), and
questions that outlive the plan (those are the issue's `notes/`).


**Only the `subtasks:` list is rendered** under the stage. Unlinked todos are todos.

**A broken `subtasks:` ref is a validator error**, and the plan page lists it in red. A
reference resolving to nothing would otherwise vanish: a stage listing four subtasks and
rendering three looks exactly like a stage that listed three.

## The frontmatter ref list is for SUBTASKS only

`subtasks:` is the one structured reference list a stage carries. **There was an
`agent-logs:` list beside it; it is retired** (`agent-ks check issues` errors on
one), and a run that carried the stage out goes in the **body**, as an ordinary
markdown link:

```markdown
## The run

Carried out by [010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md).
```

Two reasons, and the second is the one that matters:

| | |
|---|---|
| The frontmatter answers **one** question | *Which subtasks does this stage schedule?* A second structured list made it look like the place for every link a stage wants — which is exactly what frontmatter must not become |
| A body link is **just a link** | It gets the ordering label, `agent-ks move` rewrites it, and it can sit in a sentence that says *why* the run matters. A frontmatter entry can only sit in a list |

**Give the link an [ordering label](../10_writing/10_writing.md#linking)** —
`[010/01 the section loop](…)` — so the number survives and `move` keeps it
honest.

## `outcome` and `notes` are inline markdown

Both are one-liners, and both render as **inline markdown** — a link, `code`, emphasis
or an emoji in either works.

| Field | Answers |
|---|---|
| `outcome` | What does "done" mean here? |
| `notes` | Why does it sit here, what is it waiting on, what would surprise a reader? |

`notes` is the column with room to be informative, and the one place in the table where
you can point somewhere. **Point with a link, never a number** — see
[Linking](../10_writing/10_writing.md#linking); a note reading *"blocked on 14"* is
unreadable the moment 14 is renumbered.

## Stage status — what the canonical seven mean on a stage

Same seven values, same icons and colours as everywhere else; their general definitions
live in [00_overview.md](../00_anatomy/00_overview.md) and are not repeated here. What is
specific to a stage is the subject: **a stage's status describes the SCHEDULE, never the
work.** The subtasks it references render their own live status underneath it, so the
stage row and the subtask rows answer different questions and cannot contradict one
another.

| Status | On a stage |
|---|---|
| `open` | Scheduled, not started. The default `new-stage` writes |
| `blocked` | Cannot start until something outside this stage moves. Name that thing in one line of body text — there is no `blocked-by:` field, because a dependency graph nobody maintains is worse than a sentence somebody reads |
| `in-progress` | The stage being worked right now. **One at a time** is the convention; a second usually means the plan is really two plans, or that the first one stalled without saying so |
| `input-needed` | Stalled part-way on an answer only the user can give. The question goes in the stage's `## Questions`, written out in full — never "waiting on an answer" |
| `review` | The stage's work is finished and what remains is the user's — signing off its subtasks, or taking a decision. Use it when the `outcome` is not yours to declare met |
| `done` | The `outcome` line is met and nothing further is scheduled here |
| `dropped` | This stage will not run — superseded, folded into another stage, or the work was abandoned. One line of body says which. **Never delete it**; the plan is the record of what was in scope at the time |

**Who may set `done` or `dropped` on a stage:**
[Closing authority](../00_anatomy/00_overview.md#closing-authority) — the answer is not
the same as for the subtasks the stage references, so read it rather than reasoning from
the word.

**A stage does not wait for its subtasks to reach `done` before it can be `done`.**
Requiring that would make the stage a running tally of its subtasks' statuses — the one
thing a plan must not hold. Set the stage from the schedule's point of view and let the
subtask rows speak for themselves.

## The plan table

**# · Stage · Status · Who · Outcome · Notes.** Styled as an ordinary markdown table,
because it is one that happens to be generated.

**There is no subtask count.** The same subtasks appear by name, with live status icons,
under the stage's own heading — a tally of things shown one screen down is a second copy
of one fact, and the copy is what drifts. Status hovers to name itself.

## One plan, one page

A stage is a **section** of the plan page — an anchored heading with the stage's body
under it — and has **no page of its own**. The heading reads `<prefix> · <title>` at one
size — `# 20 · Journal compatibility`, the number and the name as a single heading.

**Link a stage file the same way you link anything else.** `…/plans/<plan>/<stage>`
redirects to `…/plans/<plan>#<stage>`, so an ordinary relative link lands on the stage's
heading instead of a dead URL.

# Lifecycle

## Which plan is active — derived, never stored

> **The highest-numbered plan whose status is not `done` or `dropped`.**

No field, nothing to keep in sync. One active plan at a time is convention, not
enforcement.

In the sidebar, plans list as `<status icon> NN <name>` in plain ascending prefix order.
The active one is **marked in bold, not hoisted** — the number is the only ordering a
reader can predict, so nothing derived is allowed to reorder the list.
Nothing renders above the issue body.

## Closing a plan

Closing a plan ends a *schedule*, not a piece of work: a plan holds no status of the
work, so closing one asserts nothing about its quality. **Who may close it, and when you
need to be told to:** [Closing authority](../00_anatomy/00_overview.md#closing-authority).

The closing record goes in `overview.md` as a `## Closed` section, written once and
never edited after:

- what shipped,
- **what was dropped rather than finished, and why**,
- a pointer to the successor plan if there is one.

**A closed plan is never deleted.** Numbering rather than editing one file forever is
what answers *"what did we think was in scope back then?"*

**Superseded is `dropped` plus the pointer** — no separate status.

## Ownership

| Who | Does what |
|---|---|
| **You** | Update stage status, todos, questions and references **as work lands**. Add a stage when you discover necessary work. Reorder. Close a stage, and close the plan |
| **The user** | Owns the shape — which stages exist, their order, their outcomes |

A plan that cannot absorb a discovery is a plan that gets abandoned mid-run, and an
abandoned plan is worse than an edited one. What does not change: closing the *subtasks*
a stage references is a separate question with a separate answer —
[Closing authority](../00_anatomy/00_overview.md#closing-authority).

## Standing questions do not live here

| Question | Home |
|---|---|
| About **this stage** | the stage's `## Questions` |
| Outlives every plan | the issue's `notes/` |

# Recipes

```bash
agent-ks issue new-plan <id> --name decoder-and-retention
agent-ks issue new-stage <id> --plan 01_decoder-and-retention --name retention
agent-ks issue new-stage <id> --plan 01_decoder-and-retention --name journal-compat --after 10
```

`--after NN` takes the **midpoint** of the gap above `NN`, so the space stays evenly
divided for the next insertion.
