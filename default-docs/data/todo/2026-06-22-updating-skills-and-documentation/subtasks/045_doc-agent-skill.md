---
title: Add the `doc-agent` thin operating skill
done: true
state: closed
---

`documentation-guide` triggers on "I'm doing docs/tracker work." It will **not** fire when
an agent is heads-down in a loop thinking "I should record this iteration." That trigger
gap means the structured agent-log workspace (subtask `040`) won't get used precisely when
it matters most — during dense autonomous execution. Close the gap with a second, small
skill that has a **different trigger surface**.

**Shape: a thin *operating* skill, not a pure pointer.** A redirect-only skill costs an
extra hop and gets ignored; this one carries the high-frequency essentials inline and
defers depth to `documentation-guide`.

## Name & discoverability

- **Name:** `doc-agent` (kept deliberately — easy for the human to find).
- **Description (this is what drives triggering — make it explicit):** *"Use when running a
  loop / ultracode / autonomous or iterative execution on a tracked issue, or whenever you
  need to record agent progress (goals, task-lists, iterations). Directs you to log into
  the issue tracker's `agent-log/` workspace with the standard structure; load the
  `documentation-guide` skill's agent-log reference for full detail."*
- List it in the skill catalogue (`user-guide/05_getting-started/05_claude-skills.md`) and
  cross-mention from `documentation-guide` so it's discoverable.

## What the skill carries inline (~30–40 lines — the common case needs no second hop)

- **The directive:** when you run a loop / audit / refactor (or any dense autonomous
  execution) on a tracked issue, record it under `agent-log/` using the standard structure.
- **The activity shape:** `000_<activity>-goal.md` → `001_task-list.md` (live status) →
  `101_`, `102_`, … iterations; grouped under `200_loops/` · `300_audits/` ·
  `400_refactors/`; plus `000_agent-memory/` and `100_discussion/`. (Full structure =
  subtask `040`.)
- **The one critical boundary:** agent-log is the **execution record** (how the agent ran);
  the issue's `subtasks/` is the **plan** (what to do). Don't recreate subtasks inside
  agent-log, or vice-versa.
- **Pointer to depth:** the full reference lives in `documentation-guide` →
  `references/layouts/issues/24_agent-logs.md` (post-`030`). Load it for categories,
  memory, discussion, and examples.

## Boundary with `documentation-guide` (state in both skills)

- `documentation-guide` = **author / maintain** docs + the tracker (broad).
- `doc-agent` = **as an executing agent, record your run correctly** (narrow, execution-time).
- Different audiences (doc author vs autonomous executor) and different triggers, so they
  don't double-fire confusingly.

## Location & wiring

- Lives in the same plugin: `plugins/documentation-guide/skills/doc-agent/SKILL.md`
  (a plugin may ship multiple skills).
- No code change. Keep it thin (ties into subtask `050`'s lean-skill goal) and rely on
  progressive disclosure — essentials inline, depth deferred.

## Depends on

- Subtask `040` (the agent-log structure this skill points at).
- Subtask `030` (so the pointer targets `references/layouts/issues/24_agent-logs.md`).
