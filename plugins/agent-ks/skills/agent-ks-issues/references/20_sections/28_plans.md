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
agent-logs:
  - "[Overnight, stages 3-5](../../agent-log/030_lp_overnight/summary.md)"
---

## Todo
- [ ] [Mandatory catalog](../../subtasks/16_slide-type/80_mandatory-catalog.md)
  - [ ] the reader half
- [ ] rename the fixture — too small for its own subtask

## Questions
- [ ] Does the 6.7 reader need to survive a truncated tail?
```

**No `# H1`.** The body starts at `## Todo`; the heading is generated as
`<prefix> <title>`.

**The path is truth; the link text is a reading aid.** The renderer resolves the path
and pulls the subtask's live title and status, so stale link text costs nothing.

**Not every todo links to a subtask.** Small things are not forced into a folder of
their own.

**Only the `subtasks:` list is rendered** under the stage. Unlinked todos are todos.

**A broken `subtasks:` ref is a validator error**, and the plan page lists it in red. A
reference resolving to nothing would otherwise vanish: a stage listing four subtasks and
rendering three looks exactly like a stage that listed three.

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

## Status is the canonical seven

Same vocabulary, icons and colours as issues and subtasks. A stage that is waiting sets
`status: blocked` and says what it waits on in one line of body text — there is no
`blocked-by:` field, because a dependency graph nobody maintains is worse than a
sentence somebody reads.

## The plan table

**# · Stage · Status · Who · Outcome · Notes.** Styled as an ordinary markdown table,
because it is one that happens to be generated.

**There is no subtask count.** The same subtasks appear by name, with live status icons,
under the stage's own heading — a tally of things shown one screen down is a second copy
of one fact, and the copy is what drifts. Status hovers to name itself.

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

**You may close a plan** — on your own, or when told to. Unlike a subtask's `done`,
closing a plan ends a *schedule*; it is not a sign-off on work quality.

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
| **You** | Update stage status, todos, questions and references **as work lands**. Add a stage when you discover necessary work. Reorder. Close the plan |
| **The user** | Owns the shape — which stages exist, their order, their outcomes |

A plan that cannot absorb a discovery is a plan that gets abandoned mid-run, and an
abandoned plan is worse than an edited one. What does not change: `done` on an issue
subtask remains human-only.

## Standing questions do not live here

| Question | Home |
|---|---|
| About **this stage** | the stage's `## Questions` |
| Outlives every plan | the issue's `notes/` |

# Recipes

```bash
agent-ks issue new-plan  --issue <id> --name decoder-and-retention
agent-ks issue new-stage --issue <id> --plan 01_decoder-and-retention --name retention
agent-ks issue new-stage --issue <id> --plan 01_decoder-and-retention --name journal-compat --after 10
```

`--after NN` takes the **midpoint** of the gap above `NN`, so the space stays evenly
divided for the next insertion.
