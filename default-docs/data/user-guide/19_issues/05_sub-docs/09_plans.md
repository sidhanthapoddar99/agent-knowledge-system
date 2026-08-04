---
title: 09 · Plans
description: Where order lives — a folder of stages that reference subtasks, so a plan can never carry a stale count
sidebar_position: 9
---

# Plans

The `plans/` folder is where **order** lives: what runs when, what blocks what, who each
stage waits on, and the scope of this round of work. Everything else about the work
lives in the [subtasks](./03_subtasks.md) its stages reference.

## The design, in one sentence

> **A plan stores no status of its own about the work, so it cannot drift from reality —
> there is no reality stored in it.**

A stage *references* the subtasks it schedules; the renderer resolves those references
and pulls each subtask's live status. There is nothing to keep in sync, which is why
nothing on this page is a sync rule.

## What it holds — and what it does not

| Holds | Does not hold |
|---|---|
| The **order** stages run in | What the work *is* — that is the subtask's |
| What **blocks** what, and who each stage waits on | Any **status of the work** — stages reference subtasks and the renderer pulls their live status |
| The **outcome** each stage is aiming at, in one line | A copy of the subtask list |
| Stage-scoped todos and questions | Questions that outlive the plan — those are the issue's [notes](./04_notes.md) |

**A plan is not a second copy of the subtask list.** It is the *ordering* and the
*blocking* — exactly what a subtask cannot express, because a subtask does not know
about its siblings.

Because the plan owns order, **no other file states order.** An agent log that lists its
rounds as a schedule is re-deriving the plan.

## Shape

```
plans/                              ← contains plan folders and nothing else
└── 01_decoder-and-retention/       ← one plan
    ├── settings.json               ← title + status
    ├── overview.md                 ← RESERVED: the plan's intro, never a stage
    ├── 10_decoder-swap.md          ← a stage. The prefix is order AND id
    ├── 20_journal-compat.md
    ├── 30_retention.md
    └── 40_concurrency.md
```

**`plans/` holds plan folders only** — no standing files, no loose markdown.
`overview.md` is a **reserved name**: it renders as the page intro and never appears as
a stage row.

**Say "stage", not "section".** `section` already means a top-level issue folder, and
reusing it costs a disambiguating clause every time either word appears.

### `settings.json`

```json
{ "title": "Decoder and retention", "status": "in-progress" }
```

`status` is the canonical seven. It is the plan's *own* lifecycle — open, running,
closed — not a summary of the work inside it.

## Numbering — the prefix is both the order and the id

```
10  20  30  40 …                  ← nine free slots between any two stages
20  23  26  29  30                ← inserting: SPREAD into the gap
```

**Spread into the gap; do not fill from one end.** `21, 22, 23` exhausts the space
beside `20` while leaving `24`–`29` empty, so the next insertion there has nowhere to go.
`agent-ks issue new-stage --after 20` takes the midpoint for you.

**"Stage 20" is the correct way to refer to a stage.** There is no id field and no
indirection layer — a reference is a literal markdown path, and that path carries the
prefix. Renumbering is therefore a **move**, and `agent-ks move` is link-aware: it
rewrites every reference, including the ones inside frontmatter.

Two digits gives nine stages with nine gaps each. A plan needing more than nine stages
is usually two plans.

## A stage file

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

| Field | Purpose |
|---|---|
| `title` | The stage name. The heading renders as `<prefix> · <title>` — **don't write an `# H1`**, it would duplicate a name the frontmatter owns |
| `outcome` | One line: what "done" means for this stage |
| `notes` | One line: why it sits here, what it waits on, the caveat the other columns cannot say |
| `who` | Who the stage waits on |
| `status` | The canonical seven |
| `subtasks:` | Markdown links to the subtasks this stage schedules — **the only ref list**, and only these are rendered |

`outcome` and `notes` render as **inline markdown**, so a link, `code`, emphasis or an
emoji in either works. `notes` is the column with room to be informative — and the one
place in the table you can point somewhere from. Point with a **link**, never a number:
a note reading *"blocked on 14"* stops meaning anything the moment 14 is renumbered.

- **The path is truth; the link text is a reading aid.** The renderer resolves the path
  and pulls the subtask's live title and status, so stale link text renders nothing and
  costs nothing.
- **Not every todo links to a subtask.** Small things are not forced into a folder of
  their own.
- **Only the `subtasks:` list is rendered** under the stage. Unlinked todos are todos.
- **A broken `subtasks:` reference is a validator error**, and the plan page lists the
  broken refs in red. A reference resolving to nothing would otherwise just vanish: a
  stage listing four subtasks and rendering three looks exactly like a stage that
  listed three.

### The body is free-form

`## Todo` and `## Questions` are conventions, not a schema. A stage may carry whatever
explains it: why it sits at this position, what its status means *in practice* (not that
it is blocked, but on what and what would unblock it), what was tried and rejected, a
caveat or a measurement.

Keep it short, but do not keep it thin — the table row is the summary, and anything a
reader needs beyond that summary belongs here. A stage whose body is three unexplained
checkboxes has pushed its reasoning into somebody's head.

What still does not belong: the work itself (that is the subtask) and questions that
outlive the plan (those are the issue's notes).

### The frontmatter ref list is for subtasks only

`subtasks:` is the one structured reference list a stage carries. An `agent-logs:`
list used to sit beside it; it is **retired**, and `agent-ks check issues` errors on
one. Link the run from the stage **body** instead, like anything else the stage wants
to point at:

```markdown
## The run

Carried out by [010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md).
```

The frontmatter answers exactly one question — *which subtasks does this stage
schedule?* — and a second structured list made it read as the place to put every link,
which is what frontmatter must not become. A body link is also strictly more useful: it
takes an **ordering label**, `agent-ks move` rewrites it, and it can sit inside a
sentence that says why the run matters, which a list entry cannot.

### No `blocked-by:` field

A stage that is waiting sets `status: blocked` and says what it waits on in one line of
body text. `who:` already covers blocked-on-a-person, and the stage order already
carries the sequential dependency.

A dependency graph has to stay consistent and nothing would maintain it: if stage 20
declares `blocked-by: 10` and 10 completes, either something derives the clear — in
which case it was never a stored field — or it silently rots. **A graph nobody maintains
is worse than a sentence somebody reads.**

## The rendered view — one page per plan

```
┌─ /plans/01_decoder-and-retention ─────────────────────────────────┐
│  overview.md — what this plan is for                              │
│                                                                   │
│  ┌─ THE PLAN TABLE ───────────────────────────────────────────┐   │
│  │  #   Stage           ▸     Who    Outcome      Notes     │   │
│  │  10  Decoder swap    done  claude …one line…   …one line… │   │
│  │  20  Journal compat  prog  sid    …one line…   …one line… │   │
│  │  30  Retention       open  claude …one line…   …one line… │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  # 20 · Journal compatibility      ← GENERATED heading            │
│     …the stage file's body…                                       │
│  # 30 Retention                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**The table IS the index.** A separate generated list of the same stages would be
duplication in the UI, which is the same defect as duplication on disk. The Stage cell
links to the stage's anchor; that is the index.

**Headings anchor on the title, not the prefix** — `#journal-compatibility`, never
`#20-journal-compatibility`. `move` rewrites paths but not anchors, so a number in the
anchor would break silently the first time a stage is inserted above it.

### It looks like a markdown table because it is one

The table is rendered inside the same `.markdown-content` styles as the prose around it,
so its borders, header fill, striping and **link colour** are whatever an ordinary
markdown table in this site looks like. Nothing about it is restated in the issues
stylesheet, so it cannot drift away from the tables beside it.

The **Status** column is one icon, centred, coloured from the `--status-<name>` CSS
variables — a theme overriding those restyles the plan table for free. **Hover it and it
names itself** ("In progress", "Input needed"): a coloured glyph is fast to scan once you
know the vocabulary and opaque until you do.

### There is no subtask count

An earlier version of this table carried a `0/1/0/3` tally per stage. It was removed.

The same subtasks appear **by name, with their live status icons, under the stage's own
heading** — one screen down. A count of things listed just below is a second copy of one
fact, and in every case where two places hold one fact, it is the copy that goes wrong.
The names are also more useful: *which* subtask is blocked is the question a schedule
actually has to answer.

### A stage has no page of its own

**One plan, one page.** A stage is a *section* of it — a heading with the stage's body
under it — not a document you navigate to. There is no second rendering carrying its own
header, breadcrumb and subtask list to keep in step with the first.

`/plans/<plan>/<stage>` still **resolves**, as a redirect to `/plans/<plan>#<stage>`. The
address is kept because a stage is a *file*, and a relative markdown link to a file
resolves to that file's path — so a link written the ordinary way lands on the stage's
heading rather than on a 404 that no gate would have caught.

## Lifecycle

### Which plan is active — derived, never stored

> **The highest-numbered plan whose status is not `done` or `dropped`.**

No field, nothing to keep in sync, and it degrades correctly: if two plans are open, the
higher number wins and the convention is *visibly* being broken rather than silently
ambiguous.

**One active plan at a time is convention, not enforcement.** Nothing validates it.

In the sidebar, plans list as `<status icon> NN <name>` in **plain ascending prefix order**, and
the active one is **marked in bold rather than hoisted to the top** — a list whose order
depends on a derived value puts the same set of plans in two different orders depending
on which one is open, and the number down the left is the only ordering a reader can
predict. Nothing
renders above the issue body — the plan costs one click, not vertical space on every
visit.

### Closing a plan

**An agent may close a plan**, on its own or when told to. Unlike a subtask's `done`,
closing a plan ends a *schedule*; it is not a sign-off on work quality, so the
human-only rule does not apply.

The closing record goes in `overview.md` as a `## Closed` section, written once and
never edited after:

- what shipped,
- **what was dropped rather than finished, and why** — the half people omit,
- a pointer to the successor plan if there is one.

It sits in `overview.md` because that renders at the top of the plan page, so a reader
opening a closed plan sees the outcome before the stages.

**A closed plan is never deleted.** Numbering rather than editing one file forever is
what answers *"what did we think was in scope back then?"* — the question you ask when
work turns out to have been mis-scoped.

**Superseded is `dropped` plus the pointer.** No separate status: a plan abandoned
mid-flight and a plan deliberately replaced look the same to a reader — closed,
unfinished, here is where the work went.

### Ownership — shared

| Who | Does what |
|---|---|
| **Agent** | Updates stage status, todos, questions and references **as work lands**. May add a stage when it discovers necessary work. May reorder. May close the plan |
| **Human** | Owns the shape — which stages exist, their order, their outcomes. Overturns anything |

**The agent may add and reorder stages.** A plan that cannot absorb a discovery is a
plan that gets abandoned mid-run, and an abandoned plan is worse than an edited one.
What does not change: `done` on an issue subtask remains human-only.

## Standing questions do not live here

| Question | Home |
|---|---|
| About **this stage** | the stage's `## Questions` |
| Outlives every plan | the issue's [notes](./04_notes.md) |

This keeps `plans/` containing plan folders and nothing else, so there is never an "is
this a plan or a standing file?" read at load time.

## Scaffolding

```bash
agent-ks issue new-plan  <issue-id> --name decoder-and-retention
agent-ks issue new-stage <issue-id> --plan 01_decoder-and-retention --name retention
agent-ks issue new-stage <issue-id> --plan 01_decoder-and-retention --name journal-compat --after 10
```

`--after NN` takes the **midpoint** of the gap above `NN`, so the space stays evenly
divided for the next insertion. `--subtask a.md,b.md` seeds the `subtasks:` list.

## See also

- [Subtasks](./03_subtasks.md) — the scope a stage schedules; filed by category, never by order
- [Agent Log](./05_agent-log.md) — where the stages are actually carried out
- [Agent Memory](./07_agent-memory.md) — what is still true; it holds no plan
- [Lifecycle and Review](../04_setup/06_lifecycle-and-review.md) — the seven-status vocabulary
