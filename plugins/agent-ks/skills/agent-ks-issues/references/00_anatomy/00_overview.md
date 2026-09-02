# Lifecycle, closing authority, AI rules — and the reference index

What the tracker is for, the one rule underneath it, and the section table are in the
skill's `SKILL.md`. This page owns three things: the **lifecycle in full**, **closing
authority** (who may set a Closed status, on anything), and the **AI rules**. The index
of every reference file is at the bottom.

**Canonical source of truth:** the framework's bundled
`@root/default-docs/data/user-guide/19_issues/` — read those pages when this
reference is unclear or you need depth this folder doesn't cover.

**Best-practice rules** (convention, not enforcement):
- **One component per issue.** Multi-component is allowed for genuinely cross-cutting
  work but is the exception. When tempted to list two, ask "should this be two issues?"
- **AI-handoff-bound issues declare ≥1 subtask.** The subtask is the handoff anchor.
- **Ordering is `priority` desc, then `updated` desc.** `updated` is derived from git
  (most recent commit under the folder); `created` comes from the folder slug.
  Execution state is carried by the **status**, never by a label.

---

## Lifecycle — 8 statuses, 4 categories

One field, one vocabulary, across issues, subtasks, plans, plan stages, agent logs and
iteration files. Fixed in framework code (`issue-status.ts`); colours are theme CSS
variables (`--status-<name>`). A `fields.status` block or a `statusColors` map in the
tracker root is a hard error.

| Category | Statuses | Notes |
|---|---|---|
| **Not Started** | `open` · `blocked` | `blocked` = depends on another issue/subtask; reason in prose |
| **In Progress** | `in-progress` | You set it when work starts |
| **Review** | `input-needed` · `review` | `input-needed` = stuck on a question (written inline); `review` = done, awaiting sign-off |
| **Closed** | `done` · `dropped` · `superseded` | Terminal. Who may set them: [Closing authority](#closing-authority) |

Transitions are **unenforced** — any jump is legal. The category is what the UI filters
by; the status is the per-row badge.

### `superseded` — closed because the scope moved

`done` claims the work shipped. `dropped` claims the idea was abandoned. `superseded`
claims neither: **the work closed here because its scope moved elsewhere** — absorbed
into another design, folded into a later phase, or reshaped into a different item.

**A `superseded` file must name where the scope went.** Write a line that opens with an
arrow, in the file's own body:

```
→ absorbed into phase-3 notes/10, decision D2
```

`agent-ks check issues` warns when the line is missing. Both `→` and `->` count, and the
line may be a list item or a blockquote. For an **issue**, the arrow line may sit in
`issue.md` or in a comment.

Pick between the three by asking what a reader needs to do next. After `done` they read
the artefact. After `dropped` they read why, and stop. After `superseded` they **follow
the arrow**.

### Runs use five of the eight

An agent log, a child agent log and an iteration file carry `open` · `in-progress` ·
`input-needed` · `done` · `dropped`. `blocked`, `review` and `superseded` describe a
*work item*: a run does not wait on another run, a run is never signed off (the subtask
is), and a run whose scope moved elsewhere did not finish, which is `dropped`. Fixed as
`RUN_STATUSES` in `issue-status.ts`. Plans and plan stages carry all eight.

## Closing authority

**Who may set a Closed-category status. This section is that rule's only home** — every
other file in the skill links here instead of restating it.

**`superseded` is the exception, and it is the same at every level: you may set it.**
It records only where the scope went, and you are the one who moved it. Write the `→`
line in the same edit. `done` and `dropped` follow the table below.

The discriminator is **what the status is attached to**: a thing that carries the *work*,
or a thing that carries a *record of* or a *schedule for* the work.

| The status sits on | Who may close it | Why |
|---|---|---|
| An **issue** or a **subtask** | **The user, only.** Your ceiling is `review` — or `input-needed` with the question written inline, or `superseded` with the `→` line | Closing signs off the work. The user inspects the artefact (PR, diff, screenshot, test output) and flips it |
| An **agent log**, a child agent log, or an **iteration file** | **You.** You close your own run | It records what *you* did. Nobody else can say whether the run finished |
| A **plan** or a **plan stage** | **You.** Closing ends a *schedule*, not a piece of work | A plan stores no status of the work — the subtasks it references render their own live status — so closing one certifies nothing about it ([28_plans.md](../20_sections/28_plans.md)) |

**Never self-certify a subtask by closing the agent log that worked on it.** The two
`done`s are the same word with opposite authority; the log's `done` is not evidence for
the subtask's.

**An agent log's `status` answers *did the agent finish its assignment*, never *was the
news good*.** An audit that ran to completion and found five defects is `done`; the
defects are prose in its `01_summary.md`. `dropped` means the run did not deliver: it
crashed, was refused, or was superseded. A `dropped` run needs no comment; its
`01_summary.md` says what happened.

## AI rules — the most important rules in the whole skill

1. **Manage `in-progress` yourself; hand off at the Review category.** Set `in-progress`
   when you start executing, and hand off with a verifiable artefact (PR, diff,
   screenshot, test output). Before setting `done` or `dropped` on *anything*, read
   [Closing authority](#closing-authority) — the answer differs by what carries the
   status. The one status you may close with is `superseded`, when the scope moved.

2. **Hit a wall → `input-needed`, not `blocked`.** Write the actual question **inline in
   the subtask/issue body** so a fresh session picks it up. Reserve `blocked` for a
   structural dependency on another issue/subtask, named in prose.

3. **Default search scope is everything not Closed** (`open`, `blocked`, `in-progress`,
   `input-needed`, `review`). Skip the Closed category (`done`, `dropped`, `superseded`)
   unless the prompt asks for closed history.

4. **Subtask review-debt promotion.** An active issue with **any** subtask in the Review
   category (`review` or `input-needed`) surfaces as "needs review": it lands on the
   Review tab and shows a `review` badge on the index (display-only; the stored status is
   unchanged). `blocked` never promotes — it rests, reason read in place.

5. **Mark an issue `review` only when** implementation is done from your perspective,
   all subtasks are `review`/`done`, there is a verifiable artefact, and the record
   captures what was tried.

6. **`dropped` on an issue or subtask requires a comment first.** Write
   `comments/NNN_….md` explaining why, before the flip — and the flip itself is the
   user's ([Closing authority](#closing-authority)).

---

## Where to find what

Read **only the file(s) you need** — each is self-contained. Files live in five band
folders; the folder listing reads as this table of contents.

| File | Read it for |
|---|---|
| **`00_anatomy/` — orientation** | |
| [00_overview.md](00_overview.md) | *(this file)* lifecycle, **closing authority**, AI rules, this index |
| [01_folder-layout.md](01_folder-layout.md) | the `<issue>/` folder tree, the 5-level nesting cap, URL shapes |
| [02_per-issue-settings.md](02_per-issue-settings.md) | per-issue `settings.json`; derived vs stored; `agentLogKinds` |
| [03_overall-issue-tracker-vocabulary.md](03_overall-issue-tracker-vocabulary.md) | the tracker-root `settings.json(c)` — `fields` vocabulary, authors, views; the fields not to add |
| **`10_writing/` — writing inside issues** | |
| [10_writing.md](../10_writing/10_writing.md) | per-subdoc frontmatter, body conventions, tracker linking, diagrams and artifacts in an issue, prefixes |
| **`20_sections/` — sub-document types** | |
| [20_issue-md.md](../20_sections/20_issue-md.md) | `issue.md` — the goal/context body |
| [21_comments.md](../20_sections/21_comments.md) | comments — flat evolution log, **+ add-a-comment recipe** |
| [22_notes.md](../20_sections/22_notes.md) | notes — finalized output, **+ add-a-note recipe** |
| [23_subtasks.md](../20_sections/23_subtasks.md) | subtasks — **categories**, numbering, the work-order template, **+ create/update recipes** |
| [24_agent-logs.md](../20_sections/24_agent-logs.md) | agent-log — when one opens, the folder shape, iteration files, **+ worked examples** |
| [25_brainstorm.md](../20_sections/25_brainstorm.md) | brainstorm — kinds, threads, the graduation marker |
| [26_agent-memory.md](../20_sections/26_agent-memory.md) | agent-memory — index + topic files, always-on rules |
| [27_guide-and-glossary.md](../20_sections/27_guide-and-glossary.md) | the Guide panel + per-issue `glossary.md` |
| [28_plans.md](../20_sections/28_plans.md) | plans — stages, references, the active plan |
| **`40_operations/` — tools and operations** | |
| [41_searching.md](../40_operations/41_searching.md) | search scope, the no-`Grep` rule, subagent patterns |
| [42_updating.md](../40_operations/42_updating.md) | creation rules (litmus test, dump), duplicate-check, validating |
| [43_moving-restructuring.md](../40_operations/43_moving-restructuring.md) | `agent-ks move` + promoting/splitting/merging issues |
| **`60_examples/` — worked examples** | |
| [61_multiple-subtasks.md](../60_examples/61_multiple-subtasks.md) | a standard implementation issue with several subtasks |
| [62_research-focused.md](../60_examples/62_research-focused.md) | a research/design issue — heavy deliberation, few code subtasks |
| [63_agent-loops.md](../60_examples/63_agent-loops.md) | an issue worked across many rounds of agent work |
| [64_phase-index.md](../60_examples/64_phase-index.md) | the phase / index issue — subtasks promoted to their own issues |

## Cross-references

- `@root/default-docs/data/user-guide/19_issues/` — the canonical user-guide section
- `…/19_issues/02_design-philosophy.md` — why the tracker is shaped this way
- `…/19_issues/04_setup/06_lifecycle-and-review.md` — deep dive on the eight-status / four-category model
- `…/19_issues/09_using-with-ai.md` — agent-facing rules
