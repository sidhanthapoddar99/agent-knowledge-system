---
title: "50 — The plans section (decided)"
---

# The plans section

**Decided 2026-08-02.** Graduated from
[thread 03](../brainstorm/03_options_plans-as-references.md) (what a plan *is*)
and [thread 06](../brainstorm/06_discuss_plan-file-shape.md) (what it looks
like). This is the spec [`010`](../subtasks/040_execution/010_code-the-plans-section.md)
builds against.

Sid decided items marked **(Sid)**. Everything else was decided against the
standing tie-breaker — structural over convenient — and is his to overturn in one
line.

## What a plan is

**A schedule.** Order, blocking, current focus, and the scope of this round of
work. Everything else about the work lives in the subtasks it references.

**A plan stores no status of its own about the work.** Status is already a field
on every subtask, so a plan that *references* subtasks and lets the renderer pull
their live status **cannot drift from reality, because it does not store
reality.** That is the design in one sentence, and it is why no sync rule is
needed anywhere below.

**Measured, not assumed:** `IssueSubtask` already carries `slug`, `status`,
`category` and `groupPath`, and the whole array is on the issue object the plan
page renders from. Resolving a reference is an in-memory lookup — no new read
path, no cross-file resolution, no cache work.

## Shape

```
plans/                              ← top-level issue section (Sid)
└── 01_decoder-and-retention/       ← one plan
    ├── settings.json               ← title + status
    ├── overview.md                 ← RESERVED: the plan's intro, never a stage
    ├── 10_decoder-swap.md          ← a stage. Prefix = order AND id
    ├── 20_journal-compat.md
    ├── 30_retention.md
    └── 40_concurrency.md
```

**`plans/` contains plan folders and nothing else.** No standing files, no
loose markdown, no exceptions — see *Standing questions*, below.

**`overview.md` is a reserved name**, the same way `working/` and `debrief/` are
reserved inside an agent log. It renders as the page intro and never appears as
a stage row.

## Numbering — the prefix is both the order and the id (Sid)

```
10  20  30  40 …                  ← nine free slots between any two stages
20  23  26  29  30                ← inserting: SPREAD into the gap
```

**Spread into the gap; do not fill from one end.** `21, 22, 23` exhausts the
space beside `20` while leaving `24`–`29` empty, so the next insertion there has
nowhere to go.

**"Stage 20" is the correct way to refer to a stage.** There is no indirection
layer in this tracker — a reference is a literal markdown path, and that path
contains the prefix. Renumbering is therefore a **move**, and `agent-ks move` is
link-aware: it rewrites every reference, including the ones inside frontmatter
(`scripts/docs/move.mjs:209–225`, verified).

The rule this rests on, from Sid, worth keeping because it generalises:

> **Either abstract identity completely (hashes), or do not abstract it at all
> (filenames). You cannot have it both ways.**

Filenames won, for readability. So no `id:` field, and no uniqueness check on
prefix-stripped names — there is nothing left for one to protect.

Two digits gives nine stages with nine gaps each. A plan needing more than nine
stages is usually two plans; the prefix parser accepts 2–5 digits if one
genuinely does not.

## Say "stage", not "section"

`section` already means a top-level issue folder. Reusing it inside a plan
repeats the collision that forced an agent log's `notes/` → `debrief/`, and costs
a disambiguating clause every time either word appears.

---

# A stage file

```yaml
---
title: "Journal compatibility"       # `title`, not `Name` — the framework
                                     # requires it on every markdown file
outcome: "6.7 journals still open in the new reader"
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
  - [ ] If yes, does it refuse or repair?
```

**No `# H1`.** The body starts at `## Todo`. The heading is generated as
`<prefix> <title>` — writing one here duplicates a name the frontmatter owns.

**Not every todo links to a subtask (Sid).** Small things should not be forced
into a folder of their own. Stated explicitly so nobody later "fixes" it.

**The path is truth; the link text is a reading aid.** The renderer resolves the
path and pulls the subtask's live title and status, so a stale link text renders
nothing and costs nothing. This is what keeps the file consistent with *a plan
stores no status*.

## Status is the canonical seven

`open` · `blocked` · `in-progress` · `input-needed` · `review` · `done` ·
`dropped` — the same module, icons, colours and validation as issues and
subtasks (`src/loaders/issue-status.ts`). No new vocabulary.

## No `blocked-by:` field — decided against

A stage that is waiting sets `status: blocked` and says what it waits on in one
line of body text. `who:` already covers blocked-on-a-human, which is the common
case, and the stage order already carries the sequential dependency.

**Why not a field**, since the standing tie-breaker usually favours structure: a
`blocked-by` graph has to stay consistent, and nothing would maintain it. If
stage 20 declares `blocked-by: 10` and 10 completes, either something derives the
clear — in which case it was never a stored field — or it silently rots. **A
graph nobody maintains is worse than a sentence somebody reads**, and with nine
stages on one page the sentence is legible.

---

# The rendered view — one page per plan (Sid)

```
┌─ /plans/01_decoder-and-retention ─────────────────────────────────┐
│  overview.md — what this plan is for                              │
│                                                                   │
│  ┌─ THE PLAN TABLE ───────────────────────────────────────────┐   │
│  │  id   Stage            Outcome        Who    Subtasks  ▸   │   │
│  │  10   Decoder swap     …one line…     claude 0/1/0/3  done │   │
│  │  20   Journal compat   …one line…     sid    2/1/1/0  wip  │   │
│  │  30   Retention        …one line…     claude 4/0/0/0  open │   │
│  └────────────────────────────────────────────────────────────┘   │
│                                                                   │
│  # 20 Journal compatibility        ← GENERATED heading            │
│     …the stage file's body…                                       │
│  # 30 Retention                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**The table IS the index.** A separate generated index listing the same stages is
duplication in the UI, which is the same defect as duplication on disk. The Stage
cell links to the anchor; that is the index. Nothing descends into subheadings,
because there is no second list.

**Anchor on the title, not the prefix.** `#journal-compatibility`, never
`#20-journal-compatibility`. `move` rewrites paths but **not anchors**, so a
number in the anchor breaks silently on a renumber. Costs nothing to get right;
unrecoverable to get wrong.

## The Subtasks column is the framework's existing categories — measured

Sid's four buckets map **exactly** onto `CATEGORIES` in
`src/loaders/issue-status.ts`, and `IssueSubtask.category` is already derived at
load time. The column is: resolve the `subtasks:` refs, group by the category
they already carry, count.

| Bucket | Category | Statuses | Default colour |
|---|---|---|---|
| Open | `not-started` | `open`, `blocked` | `#888888` grey |
| Progress | `in-progress` | `in-progress` | `#61afef` blue |
| Review / input needed | `review` | `input-needed`, `review` | `#f0c674` yellow |
| Completed / closed | `closed` | `done`, `dropped` | `#7ec699` green |

**The colours asked for are already the defaults**, and a tracker overriding
`fields.status.colors` restyles the plan table for free.

**Only the `subtasks:` list counts.** Unlinked todos are todos, not subtasks —
counting them would make the column silently measure two different things.

## Individual stage pages stay reachable

The sub-doc machinery gives every markdown file a route for free. Keep them, link
nothing to them, and make the single plan page canonical. Two URLs for one piece
of content is tolerable; suppressing the route is work for no gain.

---

# Lifecycle

## Which plan is active — derived, never stored

**The highest-numbered plan whose status is not `done` or `dropped`.**

No field, nothing to keep in sync, and it degrades correctly: if two plans are
open, the higher number wins and the convention is visibly being broken rather
than silently ambiguous.

**One active plan at a time is convention, not enforcement (Sid).** Nothing
validates it.

## Pinned in the sidebar — and nothing on the issue body page (Sid)

**Decided 2026-08-02.** `Plans` is a collapsible sidebar group like `Notes` and
`Subtasks`, with the **active plan pinned at its top** and marked. Clicking it
swaps the main panel to the plan page.

**Nothing renders above the issue body.** The issue body keeps the full panel;
the plan costs one click, not vertical space.

This satisfies the section's original non-negotiable — *reachable in one click
from the issue page* — which in this UI means: from the state you land in
(sidebar left, `issue.md` in the main panel), the active plan is one sidebar
click away.

Rejected: rendering the plan table, or a summary strip, above the issue body. It
buys zero clicks at the cost of pushing the issue body down on every visit —
including the majority of visits that are not about the schedule.

## Closing a plan

**The agent may close a plan (Sid)** — on its own, or when told to. Unlike a
subtask's `done`, closing a plan ends a *schedule*; it is not a sign-off on work
quality, so the human-only rule does not apply.

**The closing record goes in `overview.md`, as a `## Closed` section**, written
once and never edited after:

- what shipped,
- **what was dropped rather than finished, and why** — the half people omit,
- a pointer to the successor plan if there is one.

It sits in `overview.md` because that renders at the top of the plan page, so a
reader opening a closed plan sees the outcome before the stages.

**A closed plan is never deleted.** Numbering rather than editing one file
forever exists to answer *"what did we think was in scope back then?"* — which is
the question you ask when work turns out to have been mis-scoped.

**Superseded is `dropped` plus the pointer.** No separate status. A plan
abandoned mid-flight and a plan deliberately replaced are the same thing to a
reader: closed, unfinished, here is where the work went.

## Ownership — shared, and what that means concretely

| Who | Does what |
|---|---|
| **Agent** | Updates stage status, todos, questions, and the subtask/agent-log references **as work lands**. May add a stage when it discovers necessary work. May close the plan |
| **Sid** | Owns the shape — which stages exist, their order, their outcomes. Overturns anything |

**The agent may add and reorder stages.** A plan that cannot absorb a discovery
is a plan that gets abandoned mid-run, and an abandoned plan is worse than an
edited one. What does not change: `done` on an *issue subtask* remains human-only.

## Standing questions do NOT live in `plans/`

The old `agent-memory/plans/` convention had a `1NN_` band for files spanning
every plan — `101_questions-to-answer.md`. **That band is retired.**

- A question about **this stage** → the stage's `## Questions`.
- A question that **outlives every plan** → **the issue's `notes/`.**

This is the decision-routing rule already in force: anything affecting more than
one run belongs to the issue, not to a run or a schedule. It also keeps `plans/`
containing plan folders and nothing else, so there is no "is this a plan or a
standing file?" read at load time.

---

# Migration — none (Sid)

One live consumer, migrated by hand. Nothing is written, nothing is maintained,
and the loader gets **no compatibility branch**. The old `agent-memory/plans/`
shape is dropped outright.

# The section registry — sequenced, not skipped

A plans section makes it **eleven framework files that must agree on one string**.
That is a real smell and the registry is the more structural fix.

**Do it as its own change, after plans lands** —
[`090`](../subtasks/040_execution/090_section-registry.md). Not a deferral: doing
both at once means that when the section fails to render, you cannot tell which
change broke it. Sequencing is the structural choice here, skipping would not be.

# Fully decided — nothing open

Both remaining questions were answered by Sid on 2026-08-02: the sidebar pin
(above), and the iteration-file status vocabulary
([the framework spec](./40_agent-log-settings-framework-spec.md)).

**The second one collapsed a split that ran through the whole design.** With
iteration files on the canonical seven, there is now **exactly one status
vocabulary in the tracker** — issues, subtasks, plan stages, agent logs and
iteration files share one module, one palette, one validator. Nothing to
translate, and a tracker overriding `fields.status.colors` restyles all five
surfaces together.

This spec is complete. Build it: [`010`](../subtasks/040_execution/010_code-the-plans-section.md).
