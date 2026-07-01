---
title: Lifecycle and Review
description: The 4-state status model — open, review, closed, cancelled — and why the review handoff is the whole point
sidebar_position: 6
---

# Lifecycle and Review

The tracker's lifecycle is deliberately minimal: four states, one diagram, one rule about who transitions what. Everything else is labels or subtasks.

## The 4 states

```
open  →  review  →  closed
            ↘
              cancelled
```

Any state can also flow to `cancelled`.

| State | Meaning | Color | Who sets it |
|---|---|---|---|
| `open` | Not started, or in progress | gray | Creation default |
| `review` | Work claims to be done — awaiting human verification | gold / yellow | Agent or author on completion |
| `closed` | Reviewed and accepted — shipped | green | **Human only** (in autonomous workflows) |
| `cancelled` | Decided not to do this | dark gray | Human, with reason |

**Deliberately missing:** `in-progress`, `blocked`, `needs-design`. Those are labels (`wip`, `blocked`) or subtask states, not primary statuses. Transient state goes stale in tracker fields; it stays fresher as a conversation or a label. See [Design Philosophy](./design-philosophy).

## The review state is the whole point

Without a dedicated `review` state, you have two bad options for AI-driven work:

1. **Over-trust the AI.** Agent closes things, silent breakage ships.
2. **Babysit every change.** Zero async leverage, you might as well type the code yourself.

`review` is the third path. The AI marks "I think this is done — evidence in agent-log, diff is clean, ready for human confirmation." The human's job becomes specifically and only to **confirm or reject**. This is how async AI work scales: the human is the quality gate, not the writer.

### Valid agent-driven transitions

- `open → review` — work claimed done, awaiting review
- `open → cancelled` — with a comment explaining why (scope change, duplicate, obsolete)
- `review → open` — if the agent gets pushback in a comment and resumes work

### Agent-driven transitions that are NEVER OK

- `open → closed` — bypasses the review gate
- `review → closed` — that's a human transition

The `review → closed` flip is *specifically* the human's job. It's the one explicit trust boundary in the whole system. The `/issues` skill (planned) is the operating manual that teaches agents this rule. See [Using with AI](./using-with-ai).

### When humans close

After flipping `review → closed`, the convention is to trigger the agent to write a **closing log entry** — final state, shipped commit / PR, any followups. This closes out the audit trail cleanly instead of leaving dangling in-progress entries.

## Subtasks have the same 4 states

Every subtask carries its own `state` in frontmatter. Same four values, same rules:

```markdown
---
title: "UI filters"
state: review
---
```

So a single issue can be `open` at the top level with subtasks in wildly different states:

```
Issue: 2026-04-19-docs-phase-2  [status: open]
├── subtask 01: closed   ← done
├── subtask 02: closed   ← done
├── subtask 03: review   ← agent shipped, waiting for human
├── subtask 04: open     ← next to pick up
├── subtask 05: open     ← not started
└── subtask 06: cancelled ← absorbed elsewhere
```

This separation is what lets long-running issues progress — subtasks close one at a time, the parent issue moves when enough have landed.

## Subtask-debt promotion — the Review tab

An issue with `status: open` and **one or more subtasks in `review`** will surface on the index page's **Review tab**, even though its own status isn't `review`. The tab counts issues where human attention is needed anywhere in the tree.

This is the cue for a human scanning the queue: *you have unconfirmed work here*, even if the top-level state hasn't changed.

The tab count on the list page reads something like:

```
Open (7)    Review (4 — includes 2 with review subtasks)    Closed (38)    Cancelled (3)
```

See [List View](./ui/list-view) for the full index-page tour.

## Typical issue lifecycle

**Scenario: agent-driven issue, 4-subtask breakdown.**

1. **Create** — human opens `2026-04-21-foo/` with `settings.json` (`status: open`), `issue.md`, and four subtasks all `open`.
2. **Pickup** — agent reads `issue.md`, reads any existing agent-log entries, writes `agent-log/001_triage.md` scoping the approach.
3. **Work subtask 01** — agent implements, writes `agent-log/002_subtask-01.md`, flips subtask 01 to `review`.
4. **Continue** — subtasks 02, 03 follow same pattern. Each gets a log entry, each advances to `review` or `closed` (if trivially safe).
5. **Hand off** — once all 4 subtasks are `review` or `closed`, agent flips the **issue** `status: open → review` and writes a summary agent-log entry.
6. **Human reviews** — reads agent log, inspects diff, spot-checks evidence.
7. **Accept** — human flips issue `review → closed`.
8. **Closing log** — agent's next pickup writes `agent-log/005_closed.md` referencing the shipped commit.

## When to mark `review` (checklist)

An agent should mark an issue (or subtask) `review` when:

- [ ] Implementation is done from the agent's perspective
- [ ] All child subtasks are `review` or `closed` (for issue-level review)
- [ ] There's a **verifiable artefact** the human can inspect — file diff, test output, screenshot, commit
- [ ] The agent log captures what was tried and what the final state is
- [ ] Dangling questions are surfaced (in a comment, if any)

## When to cancel

Cancellation is legitimate, not a failure. Valid reasons:

- Scope changed; work is no longer relevant
- Duplicate of another issue (link it in the body / comment)
- Absorbed by a larger refactor
- Turned out to be a misunderstanding on discovery

Leave the folder on disk — the audit trail is valuable. Don't `rm -rf` cancelled issues.

## Labels vs status for transient state

When you want to express "this is stuck" or "someone's actively on this":

| Intent | Use |
|---|---|
| "Stuck on external dependency" | Label `blocked-external` |
| "Stuck on internal problem" | Label `blocked` |
| "Someone's currently working on this" | Label `wip` (optional — usually not worth tracking) |
| "Waiting for review" | **`status: review`** |
| "Decided not to do" | **`status: cancelled`** |

The rule: status is for **lifecycle**; labels are for **cross-cutting state**.

## See also

- [Subtasks](./sub-docs/subtasks) — per-subtask state handling
- [Agent Log](./sub-docs/agent-log) — what iterations capture and how they support review
- [List View](./ui/list-view) — state tabs, review-debt promotion in the UI
- [Using with AI](./using-with-ai) — the full agent operating manual
- [Review and Close workflow](./workflows/review-and-close) — human's side of the handoff
