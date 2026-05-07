---
title: "Design philosophy: tracker shape for the 1–4 person AI-augmented team"
---

# Design philosophy — why this tracker is shaped the way it is

This note captures the design conversations behind the tracker's data model and UX. The short version: this isn't a generic project management tool. It's deliberately narrow — built for a 1–4 person team that uses AI agents heavily and ships continuously.

## The team profile we're optimising for

The "one-person unicorn" / micro-company:

- **1 to 4 humans** doing all the development work
- **AI agents do the bulk of the implementation** — the humans steer and review
- **Long-running autonomous tasks** are the norm, not the exception (Ralph-loop-style: an agent runs for hours, iterates, leaves an audit trail)
- **Plans change every few hours** when an agent ships something or a new requirement appears
- **Coordination is one chat away** — no need for ceremony

For this team, a generic tracker (GitHub Issues, Jira, Linear's full feature set) is wrong on two axes: it has too much process for the team size, and not enough AI-native primitives for the workflow.

## What we deliberately *don't* have

### No sprints, no agile cycles

Sprints solve coordination problems that 1–4 person teams don't have. They assume:

- Many people who need a planning ritual to align
- Capacity bottlenecked by people-hours over a fixed window
- A retro cadence to improve process

In a 1–4 person AI-heavy team:

- Coordination is one Slack message
- The bottleneck isn't capacity — it's *deciding what's worth doing next*
- Plans go stale in hours when an agent finishes mid-day

Sprints would become **theatre** — you'd plan Monday, AI ships half by Tuesday, you re-plan. The artefact rots.

The original instinct here was to keep a `milestone` field as a long-horizon north star ("phase-2") that said "we're working toward this big chunk of value", not "we promised to ship X by Friday". After ~50 issues lived in the tracker we reversed: even the long-horizon framing rotted into noise. **Priority + status are the only ordering signals.** Cross-issue links handle "this bundle of work is related" without a structured field. See "What we removed and why" below for the full list.

### No `type` field

Real work is composite (a perf fix is bug + perf + refactor). Forcing a single primary type was lossy and required a daily decision that didn't pay off — almost every issue ended up `feature` or `task`. Type values moved into multi-select **labels**, where they belong.

### No `in-progress`, no `blocked` as primary statuses

Transient state ("someone is actively working on this", "this is stuck") is a conversation, not a tracker field. It goes stale instantly. If we need it, it's a label (`wip`, `blocked`) that can stack with anything else and doesn't churn the primary status.

## What we *do* have (and why)

### 4-state status with `review` as a first-class state

```
open  →  review  →  closed
                ↘
                  cancelled
```

The `review` state is the **missing primitive for AI-driven workflows**. Without it, you have two bad options:

1. **Over-trust the AI** — agent marks things done, silent breakage ships
2. **Babysit every change** — no async leverage, you might as well do it yourself

`review` is the third path: AI marks the work as "I think this is done", and the human's job becomes specifically and only *to confirm or reject*. The state is a deliberate handoff. It's the only way async AI work scales — the human becomes a quality gate, not a writer.

In the UI:

- **Issue level**: a `Review` state tab on the index, in yellow / gold to draw the eye. Issues stay in `review` until a human flips them to `closed`.
- **Subtask level**: same 4 states. A subtask in `review` shows a yellow dot in the sidebar; the parent issue's overview surfaces "subtasks awaiting review".
- **Visual hierarchy**: `review` reads as "needs your eyes". `closed` reads as "shipped, done, audit trail". `cancelled` reads as "decided not to do this".

### Agent logs as a first-class section

Every issue can have an `agent-log/` folder. Each iteration of an autonomous agent run produces a numbered markdown file (`001_initial-triage.md`, `002_incremental-parse-spike.md`, …) with frontmatter capturing:

- `iteration` — which loop iteration this is
- `agent` — which agent / model wrote it
- `status` — in-progress / success / failed
- `date` — when

This is what makes long-running AI work auditable. The human reviewing a `review`-flagged issue doesn't have to ask "what did the AI try?" — they read the agent log. Failed iterations are kept; they're as informative as successes.

The combination is the workflow:

1. Issue opens
2. Agent picks it up → writes `agent-log/001_*.md` describing approach
3. Agent iterates, possibly across many subtasks, logging each iteration
4. Agent flips to `review` when it believes the work is done
5. Human reads the agent log, reviews the diff, flips to `closed` (or back to `open` with a comment)

No sprints. No standups. Just a clean queue of "here's what's planned (open) → here's what needs your review (review) → here's what shipped (closed)". The agent does the writing; the human does the reading and the deciding.

### Why this matters

Most trackers are built for the team that *was* — the 10-50 person scrum team where the bottleneck is coordination. The team that's emerging — 1-4 humans plus a fleet of agents — has a totally different bottleneck: **review capacity**. The tracker that wins for that team is the one that makes the review handoff explicit, the audit trail trivial, and everything else as quiet as possible.

That's what this is.

## What we removed and why

This is the historical record of fields the tracker tried and dropped. Each was added with the best of intentions and removed once it was clear the abstraction wasn't earning its keep.

### Sprints / agile cycles — never added

Already covered above. The 1–4 person AI-heavy team has no coordination problem sprints solve.

### `type` field — dropped early

Real work is composite (a perf fix is bug + perf + refactor). Forcing a single primary type was lossy; almost every issue ended up `feature` or `task`. Type values moved into multi-select **labels** where they belong.

### Transient statuses (`in-progress`, `blocked`) — never added

Transient state goes stale instantly. They're labels, not statuses. `assignees.length > 0` doubles as the "in-progress" signal — see the per-issue settings page for the rationale.

### `milestone` — dropped 2026-05-07

Originally framed as a long-horizon north star, not a sprint commitment. After lived experience: even at the long-horizon level, the field rotted. Issues got assigned `phase-2` and stayed there forever; "phases" never resolved cleanly. The team-shape this tracker is built for (1–4 humans + AI agents) doesn't run release planning the way milestones expect. Cross-issue links handle "this bundle of work is related" without a structured field. **Priority + status are the only ordering signals.**

### `due` — dropped 2026-05-07

Author-maintained future date, never enforced. Audit on 2026-05-07: 9 of 10 issues with `due` set were past their date with new subtasks still landing. 90% rot rate. Without a UI badge that nags or CI that alerts, the field has no enforcement, so people stop trusting it. External hard deadlines belong in prose ("Blocks external launch on 2026-06-15"), not a structured field.

### Manually-maintained `updated` — dropped 2026-05-07

Same rot pattern as `due`. Every issue's `updated` field was stuck at its creation date even after multiple subtasks had shipped. Replaced with a value derived from git history — the most recent commit author-date touching any file under the issue folder. Honest signal beats a stale promise. The cache loader (`astro-doc-code/src/loaders/issue-dates.ts`) walks `git log` once on cold start and incrementally on `.git/HEAD` change. Issues never committed yet (or in a non-git checkout) fall back to the folder's `created` date.

### Why we keep this section

The user-guide pages are for new readers — they tell the current story. This note is the *historical* record: what the tracker's design philosophy looked like at each major revision, written conversationally. Future readers diving into this issue's notes need the post-cleanup context to read the rest of the design accurately.

## Open design questions still being worked

- Should issue status auto-flip to `review` when any subtask is in `review`? (Currently leaning: soft indicator only, not a status flip)
- Combined subtask view — full inline rendering vs summary + expand? (Currently: 50-line cap, expand on demand)
- Preset views — replace state tabs entirely with config-driven views, or keep tabs as defaults? (Deferred)
