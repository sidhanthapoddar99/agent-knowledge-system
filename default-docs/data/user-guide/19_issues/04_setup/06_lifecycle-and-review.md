---
title: Lifecycle and Review
description: The seven-status, four-category lifecycle model — and why the review handoff is the whole point
sidebar_position: 6
---

# Lifecycle and Review

The tracker's lifecycle is **seven statuses grouped into four categories**. Both the
statuses and the categories are fixed in framework code — a tracker cannot invent its
own (it can only override the colors). The categories are what the UI filters by; the
status is the precise signal on each row.

## The four categories, seven statuses

```
Not Started        In Progress      Review                 Closed
  open               in-progress      input-needed           done
  blocked                             review                 dropped
```

| Category | Status | Meaning | Color | Who sets it |
|---|---|---|---|---|
| **Not Started** | `open` | Default entry state — not started | `#888888` | Creation default |
| **Not Started** | `blocked` | Structurally depends on another issue/subtask; reason lives in prose | `#d1854f` | Anyone, with the dependency named |
| **In Progress** | `in-progress` | Actively being worked | `#61afef` | Agent sets it automatically when work starts |
| **Review** | `input-needed` | Stuck — needs a human answer to proceed; the question is written inline | `#e8a54b` | Agent (or human) when blocked on input |
| **Review** | `review` | Work claims to be done — awaiting human sign-off | `#f0c674` | Agent or author on completion |
| **Closed** | `done` | Reviewed and accepted — shipped | `#7ec699` | **Human only** |
| **Closed** | `dropped` | Deliberately abandoned — needs a comment saying why | `#c678dd` | **Human only** |

Statuses are **hard-enforced**: a value outside these seven is a build/loader error, not
a silent default. Transitions, by contrast, are **unenforced guidance** — any jump is
legal (you can go `open → done` directly). The rules below are convention, not a state
machine.

`blocked` is specifically for a *structural dependency* on another item — it is **not**
the "agent has a question" state. That's `input-needed`.

## The Review category is the whole point

Without a dedicated place for "a human needs to look at this", AI-driven work has two
bad options:

1. **Over-trust the AI.** The agent closes things; silent breakage ships.
2. **Babysit every change.** Zero async leverage — you might as well type the code yourself.

The **Review category** is the third path, and it holds two distinct "needs a human"
signals:

- **`review`** — "I think this is done. Evidence is in the agent-log, the diff is clean,
  ready for your confirmation." The human's job is specifically to **confirm or reject**.
- **`input-needed`** — "I hit a wall and can't proceed without your answer." The agent
  writes the actual question **inline in the subtask/issue body** so a fresh session
  picks it up on read; once answered, the agent may delete the question or keep the
  Q&A logged inline, then continue.

Both roll up to the Review category, so both surface in the same "needs you" queue — but
the status tells you *why* at a glance.

### The agent ceiling is the Review category

The one hard trust boundary: an agent's terminal move is `review` (or `input-needed`).
**`done` and `dropped` are human-only.** The agent never marks its own work shipped;
the human does, after inspecting the artefact. `dropped` additionally requires a comment
explaining the decision.

### Agent transition conventions

- Agent starts executing → sets `in-progress` automatically (no ceremony).
- Work claimed done → `review`, with a verifiable artefact (diff, test output, screenshot).
- Stuck on a question → `input-needed`, question written inline. (Not `blocked` — that's
  for dependencies.)
- Depends on another item → `blocked`, dependency named in a comment or the body.
- **Never** `→ done` or `→ dropped` — those are the human's flips.

### When humans close

After flipping `review → done`, the convention is to trigger the agent to write a
**closing log entry** — final state, shipped commit / PR, any followups — so the audit
trail closes cleanly instead of leaving dangling in-progress entries.

## Subtasks share the same vocabulary

Every subtask carries its own `status` in frontmatter — the **same seven statuses** as
issues, under the **same field name**. (Subtasks previously used a separate `state:`
field; that has been unified to `status:`.)

```markdown
---
title: "UI filters"
status: review
---
```

So a single issue can be `open` at the top level with subtasks in wildly different
statuses:

```
Issue: 2026-04-19-docs-phase-2  [status: open]
├── subtask 01: done         ← shipped
├── subtask 02: done         ← shipped
├── subtask 03: review       ← agent shipped, waiting for human
├── subtask 04: in-progress  ← being worked now
├── subtask 05: input-needed ← agent stuck, question inline
├── subtask 06: open         ← not started
└── subtask 07: dropped      ← absorbed elsewhere
```

This separation is what lets long-running issues progress — subtasks advance one at a
time, the parent issue moves when enough have landed.

## Review-debt promotion — the Review tab

An issue whose own status is **not** in the Review category, but which has **one or more
subtasks in the Review category** (`review` or `input-needed`), still surfaces on the
index page's **Review tab** — as long as the issue isn't Closed. The tab counts anywhere
a human is needed in the tree.

On the index (table and cards), such a promoted issue also **displays a `review` status
badge**, not just a Review-tab placement — so the badge agrees with the tab it's filed
under. This is **display-only**: the stored status in `settings.json` is untouched (the CLI
and `--json` report the real status), and the displayed badge reverts on its own once the
review subtask moves on. Closed issues never inherit it, and an issue already in the Review
category shows its own status.

This is the cue for a human scanning the queue: *you have unconfirmed work (or an
unanswered question) here*, even if the top-level status hasn't changed. Note that
`blocked` does **not** promote upward — it's a resting state, not a call to action; its
reason is read in place.

The list page filters by **category**, so the tabs read something like:

```
Active (13)   In Progress (4)   Review (5 — includes 2 with review subtasks)   Not Started (6)   Closed (41)   All
```

See [List View](./ui/list-view) for the full index-page tour.

## Typical issue lifecycle

**Scenario: agent-driven issue, 4-subtask breakdown.**

1. **Create** — human opens `2026-04-21-foo/` with `settings.json` (`status: open`),
   `issue.md`, and four subtasks all `open`.
2. **Pickup** — agent reads `issue.md` + existing agent-log, sets the issue and the first
   subtask to `in-progress`, writes `agent-log/…` scoping the approach.
3. **Work subtask 01** — agent implements, logs a milestone, flips subtask 01 to `review`.
4. **Continue** — subtasks 02, 03 follow the same pattern; each advances to `review`.
   If the agent needs a decision, it sets that subtask `input-needed` and writes the
   question inline, then moves to the next unblocked subtask.
5. **Hand off** — once all four subtasks are `review`, the agent flips the **issue** to
   `review` and writes a summary agent-log entry.
6. **Human reviews** — reads the agent log, inspects the diff, answers any `input-needed`
   questions, spot-checks evidence.
7. **Accept** — human flips the issue `review → done` (subtasks likewise).
8. **Closing log** — the agent's next pickup writes a closing entry referencing the
   shipped commit.

## When to mark `review` (checklist)

An agent should mark an issue (or subtask) `review` when:

- [ ] Implementation is done from the agent's perspective
- [ ] All child subtasks are `review` or `done` (for issue-level review)
- [ ] There's a **verifiable artefact** the human can inspect — file diff, test output, screenshot, commit
- [ ] The agent log captures what was tried and what the final state is
- [ ] Any dangling questions are surfaced as `input-needed` with the question inline

## When to drop

Dropping (abandoning) is legitimate, not a failure — but it's a **human** transition and
needs a comment. Valid reasons:

- Scope changed; the work is no longer relevant
- Duplicate of another issue (link it in the body / comment)
- Absorbed by a larger refactor
- Turned out to be a misunderstanding on discovery

Leave the folder on disk — the audit trail is valuable. Don't `rm -rf` dropped issues.

## Status vs labels

Progress and blocking are now **statuses**, not labels. The old `wip` and `blocked`
labels are **deprecated** (kept so historical issues still validate, but superseded):

| Intent | Use |
|---|---|
| "Someone's actively on this" | **`status: in-progress`** (not the `wip` label) |
| "Stuck on another issue/subtask" | **`status: blocked`** (not the `blocked` label) |
| "Stuck on a human's answer" | **`status: input-needed`** (question inline) |
| "Stuck on an external/third-party dependency" | Label `blocked-external` (still a label — outside the repo) |
| "Waiting for sign-off" | **`status: review`** |
| "Decided not to do" | **`status: dropped`** (human, with a comment) |

The rule: the lifecycle status is now the single source of truth for where a piece of
work stands. Labels remain for genuinely cross-cutting tags (`bug`, `feature`, `docs`,
`blocked-external`, …).

## See also

- [Design Philosophy](./design-philosophy) — why the label-vs-status doctrine was revised for in-progress/blocked
- [Subtasks](./sub-docs/subtasks) — per-subtask status handling
- [Agent Log](./sub-docs/agent-log) — what iterations capture and how they support review
- [List View](./ui/list-view) — category tabs, review-debt promotion in the UI
- [Using with AI](./using-with-ai) — the full agent operating manual
- [Review and Close workflow](./workflows/review-and-close) — the human's side of the handoff
