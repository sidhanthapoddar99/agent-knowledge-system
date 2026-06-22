---
name: doc-agent
description: How to use a tracked issue's `agent-log/` — the execution-record workspace in the tracker (under `data/todo/` or any issue tracker). Triggers on the work verbs themselves: whenever you or the user says **audit this**, **refactor this**, run a **loop** / ultracode / autonomous iteration, or **"let's discuss this point"** on an issue — and whenever you should record agent progress (goals, task-lists, iterations) or maintain issue-scoped **agent memory**. Records into `agent-log/` with the standard structure (loops · audits · refactors · agent-memory · discussion). Agent-memory is always in play. **Discussion is saved only when the user explicitly asks** — you may *offer* to save a dense, information-rich discussion, but never auto-save it. Narrow execution-time companion to `documentation-guide`; load that skill's agent-log reference for full detail.
---

# doc-agent — using an issue's `agent-log/`

This skill is about **how to use the `agent-log/`** of a tracked issue (a folder under `data/todo/` or any issue tracker). It's the execution-record half of an issue — *how* the work was actually run, kept so the next agent (or you, tomorrow) can resume without repeating failed approaches. The broad `documentation-guide` skill triggers on "I'm authoring docs"; this one triggers on the **execution verbs**, which is exactly when the broad skill won't fire on its own.

## When this fires

Treat these as the trigger words — when you or the user uses one against a tracked issue, this skill applies:

- **"audit this …"** → an audit activity under `300_audits/`.
- **"refactor this …"** → a refactor activity under `400_refactors/`.
- **a loop / ultracode / autonomous or iterative run** → a loop activity under `200_loops/`.
- **"let's discuss this point" / a dense working dialogue** → discussion (special rules — see below).
- **anything you learn worth keeping for this issue** → agent memory (always; see below).

## The structure

`agent-log/` groups activity by kind. **Loops, audits, and refactors share one shape** — a small `0xx` meta block, then `1xx` iterations:

```
agent-log/
├── 000_agent-memory/      ← durable facts learned while working THIS issue (always-on)
├── 100_discussion/        ← in-run agent↔human dialogue (dated; EXPLICIT save only)
├── 200_loops/
│   └── 010_<name>/
│       ├── 001_<activity>-goal.md   ← what this run is trying to achieve
│       ├── 002_task-list.md         ← live checklist / status (update as you go)
│       ├── 003_summary.md           ← post-run summary: what landed, written when it wraps
│       ├── 004_attention-needed.md  ← (optional) pointers / mid-run issues a human must weigh in on
│       └── 101_…, 102_…             ← one file per iteration (keep failed ones — they're signal)
├── 300_audits/            ← same goal → task-list → summary → iterations shape
└── 400_refactors/         ← …and extensible: 500_migrations/ drops in the same way
```

Ordering is purely by the **leading numeric prefix** (same index grammar as the rest of the tracker): `0xx` meta sorts ahead of `1xx` iterations, no special frontmatter needed. Create categories **on demand** — never scaffold empty ones. For a quick one-off fix, skip the activity shape and drop a single flat `101_fix.md` in `agent-log/`.

Per-iteration file body: **Goal → Approach → Result (with evidence) → Next.** Prefer the helper when it's on PATH (works for any category — swap the `--group`):

```bash
docs-add-agent-log <issue-id> --group 300_audits/010_<name> \
  --status success --body "Goal: …  Approach: …  Result: …  Next: —"
```

## Agent memory — always on

`000_agent-memory/` holds durable facts you learn while working **this** issue (a gotcha, a decision, why an approach is dead). Maintain it continuously — not only during a named loop/audit/refactor. It's issue-scoped and **complements, never replaces,** your global memory. When you discover something the next agent would waste time rediscovering, write it here.

## Discussion — explicit save only

`100_discussion/` is in-run agent↔human dialogue. **Do not auto-save discussion.** It is case-specific and noisy by default, so:

- **Save a discussion only when the user explicitly asks** ("save this", "record these points", "add this to the issue").
- When a discussion gets **dense, information-rich, or decision-bearing**, you *may* **offer**: "This is getting substantial — want me to save it (or the key points) to the issue's discussion?" Then wait for the yes. Don't persist it on your own initiative.
- Durable decisions and hand-offs that should outlive the run belong in the issue's `comments/` (via `documentation-guide`), not here — `100_discussion/` is the working texture of one session.

## The one boundary that matters

`agent-log/` is the **execution record** (*how* you ran the work). The issue's `subtasks/` is the **plan** (*what* is to be done). Don't recreate subtasks as loop task-lists, or promote a task-list into a subtask. Likewise `100_discussion/` ≠ `comments/`, and `000_agent-memory/` is issue-scoped. Hold *plan vs execution* and the pieces stay complementary.

## Going deeper

This skill carries the common case inline. For the full model — category semantics, agent-memory vs global memory, worked examples, the "a loop is almost a mini-issue" tension — load the `documentation-guide` skill and read `references/layouts/issues/24_agent-logs.md`. That skill is the broad author/maintain companion; this one is the narrow execution-time nudge.
