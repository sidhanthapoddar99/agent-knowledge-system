---
title: Design Philosophy
description: Why the tracker is shaped this way — the 1–4 person AI-augmented team, no sprints, review as a first-class state
sidebar_position: 2
---

# Design Philosophy

This isn't a generic project-management tool. It's deliberately narrow — built for a 1–4 person team that uses AI agents heavily and ships continuously. Read this page before deciding whether the tracker fits your workflow.

## The team profile

The "one-person unicorn" / micro-company:

- **1 to 4 humans** doing the development
- **AI agents do the bulk of the implementation** — humans steer and review
- **Long-running autonomous tasks** are the norm (Ralph-loop-style: an agent runs for hours, iterates, leaves an audit trail)
- **Plans change every few hours** when an agent ships something new
- **Coordination is one chat away** — no need for ceremony

For this team, a generic tracker (GitHub Issues, Jira, Linear's full feature set) is wrong on two axes: too much process for the team size, not enough AI-native primitives for the workflow.

## Principles that shape the model

### Priority + status are the only ordering signals

The index sorts by `priority desc, updated desc`. That's the whole signal stack. There's no extra release-bucket dimension, no scheduled-date dimension, no per-issue type — those layers either rot under continuous shipping or duplicate what `priority` and `labels` already carry.

### Recency is derived, not declared

`updated` comes from git — the most recent commit touching any file under the issue folder. Honest signal beats a stale promise; an author-maintained timestamp drifts the moment someone forgets.

### `created` is the folder slug

Every issue folder is named `YYYY-MM-DD-<slug>`. The date IS the creation date — no separate `created` field, no possibility of disagreement. One source, parsed at load time.

### Progress and blocking are statuses (a deliberate policy reversal)

This tracker originally held a stricter line: the only primary statuses were
`open / review / closed / cancelled`, and "actively working" / "stuck" were **labels**
(`wip`, `blocked`), on the theory that transient state goes stale in a tracker field.

That doctrine was **revised** (2026-07-02) for exactly two signals — in-progress and
blocked — which are now first-class statuses. Two things forced the reversal:

- **The old "in-progress" signal was derived from `assignees.length > 0`, and that never
  matched practice.** Assigning someone doesn't mean work started; work often starts with
  nobody assigned. A derived signal that lies is worse than an explicit one.
- **For an AI-operated tracker, a fixed shared vocabulary matters more than field
  minimalism.** Agents read a manual and key their behavior off status names; "the agent
  is running" and "this is waiting on another item" are load-bearing enough to deserve
  real statuses rather than optional labels that drift.

The general principle still holds for *genuinely* cross-cutting tags — `bug`, `feature`,
`docs`, `blocked-external` remain labels. What changed is that lifecycle position (now
seven statuses in four categories) is the single source of truth for where work stands,
and it is **fixed in framework code** rather than user-definable — see below.

### Composite work uses multi-select labels

Real work is rarely one type — a perf fix is `bug + performance + refactor`. Multi-select labels handle that without a forced primary. Status answers "where in the lifecycle"; labels answer "what kind of work".

### Cross-issue work uses links, not buckets

When several issues form a bundle, link them in prose. A bundle that earns a structured field today is a bundle that wants to be a single issue with subtasks tomorrow.

## What we do have

### Seven statuses in four categories, with Review as a first-class category

```
Not Started      In Progress    Review              Closed
  open             in-progress    input-needed        done
  blocked                         review              dropped
```

The **Review category** is the missing primitive for AI-driven workflows. Without a
dedicated "a human needs to look at this" bucket, you have two bad options:

1. **Over-trust the AI** — agent marks things done, silent breakage ships
2. **Babysit every change** — no async leverage, you might as well do it yourself

Review is the third path, and it holds two signals: `review` ("I think this is done —
confirm or reject") and `input-needed` ("I'm stuck on a question, answer inline"). The
agent's ceiling is this category; `done`/`dropped` are human-only. It's a deliberate
handoff — the only way async AI work scales.

**The statuses and categories are fixed in framework code — not user-definable.** A
tracker can override the colors but cannot add or rename statuses. This is a conscious
departure from the tracker's usual "convention over enforcement" stance, made for one
axis only: when an AI agent is the primary operator, everyone (the loader, the UI, the
CLI, the skill manual, every agent) has to speak *exactly* the same lifecycle language.
Letting each tracker invent its own status names would reintroduce the drift the fixed
vocabulary exists to kill. Transitions between statuses remain unenforced guidance — it's
the *set* that's fixed, not the *moves*.

Full treatment in [Lifecycle and Review](./lifecycle-and-review).

### Agent logs as a first-class section

Every issue can have an `agent-log/` folder. Each iteration of an autonomous agent run produces a numbered markdown file with frontmatter capturing `iteration`, `agent`, `status`, `date`.

This is what makes long-running AI work **auditable**. The human reviewing a `review`-flagged issue doesn't have to ask "what did the AI try?" — they read the agent log. Failed iterations are kept; they're as informative as successes.

See [Sub-Documents → agent-log](./sub-docs/agent-log).

### Subtasks share the issue status vocabulary

An issue isn't a single unit of work — it's a collection. Each subtask carries its own
`status` in the subtask file's frontmatter — the **same seven statuses** as issues, under
the **same field name** (`status:`; subtasks used to use a separate `state:` field, now
unified). That means:

- Parent issue can be `open` while 3 of 5 subtasks are already `done`
- A subtask in the Review category (`review` or `input-needed`) bubbles up — the parent
  issue shows "subtasks awaiting review" on the Review tab
- AI can complete subtasks autonomously, parking each in `review` for human inspection,
  without ever flipping the parent to `done`

See [Subtasks](./sub-docs/subtasks).

## When this tracker is a good fit

- Internal / solo / small-team projects
- Documentation-heavy workflows where issues and docs live next to each other
- Text-first assets (excalidraw JSON, diagram sources, references)
- Projects that benefit from AI-readable history
- Active rotation of around ~100 issues (scales further with discipline)
- Scenarios where offline access, git-tracked history, and self-contained backups are features, not limitations

## When it's a poor fit

- Public-facing issue tracking where external contributors file bugs
- Heavy binary asset workflows (screenshots in every issue, video bug reports)
- Cross-project boards spanning multiple repos
- Large teams needing per-issue access control

## Pros / cons

| Pros | Cons |
|---|---|
| **AI-native** — every issue is markdown an agent can read | **Merge conflicts** on simultaneous cross-branch edits |
| **Zero infra** — no DB, no hosting, no migrations | **Grep-speed search** — fine at ~100 issues, slow at 1000+ |
| **Offline-first** — works on planes, syncs via git | **No per-issue access control** — anyone with repo access sees all |
| **Free history** — every status transition is a diff (`git blame`) | **External contributions need repo access** |
| **Branch-scoped WIP** — issues live on feature branches and merge with the work | **Repo growth** — undisciplined asset use bloats clone/CI for everyone |
| **Editor already handles it** — the live editor edits `settings.json` and markdown natively | |
| **Forever format** — markdown outlives SQL schemas | |

## Why this matters

Most trackers are built for the team that *was* — the 10–50 person scrum team where the bottleneck is coordination. The team that's emerging — 1–4 humans plus a fleet of agents — has a totally different bottleneck: **review capacity**. The tracker that wins for that team is the one that makes the review handoff explicit, the audit trail trivial, and everything else as quiet as possible.

That's what this is.

## See also

- [Lifecycle and Review](./lifecycle-and-review) — how the seven statuses / four categories and the review handoff work in practice
- [Sub-Documents → agent-log](./sub-docs/agent-log) — iteration discipline
- [Using with AI](./using-with-ai) — the skill + agent workflows
