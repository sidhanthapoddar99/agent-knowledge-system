---
name: agent-ks-qna
description: Scope a subtask or a plan stage by question and answer before an agent runs it alone. Use it whenever the user starts defining a subtask or a plan, says "let me explain", "scope this", "before you start" or "this will run unattended", dictates a long story about a job, or when a subtask lacks a why, guardrails, a done-when or decisions with reasons. It writes the answers into the subtask's own sections, reason included, so an autonomous loop never stops to ask. For the shape of a subtask file use agent-ks-issues. For a one-line idea with no run behind it use agent-ks-quick-idea-note.
---

# agent-ks-qna — scope by question and answer

An autonomous run stops at the first question that the subtask does not answer. So get the answers first, with their reasons, and write them into the sections the template already has. An agent that knows *why* a rule exists can decide the cases nobody named.

## What a work order must answer

A work order must answer seven questions. Each answer has one home.

| # | Question | Home |
|---|---|---|
| 1 | Why it exists, and the thesis behind it | the lead paragraph. Longer: `05 Notes & Analysis` |
| 2 | The end state, and how we will know | `## Done when` |
| 3 | The work, and what it touches | `# 01 To Do`, nested, with paths |
| 4 | What must not change, and which gate must pass | `## Guardrails` |
| 5 | What is already decided, and why | `# 04 Decisions`, one `##` each, reason included |
| 6 | What the agent decides alone, and what it brings back | bring back → `## Guardrails`; decide alone → `# 04`, as a decision with its reason |
| 7 | What is still open | `## Questions`, then `agent-ks issue set-state <id> input-needed --subtask <n>`. A stage takes its path: `set-state <id>/plans/<plan>/NN_<stage>.md input-needed`, because `--subtask` reads `subtasks/` only |

When all seven have an answer, the run can go long. A missing answer is the question to ask before the run starts.

## Before you ask

Pick the issue up first. The pickup block in [agent-ks-issues](../agent-ks-issues/SKILL.md) says how. Ask only what the pickup leaves open.

## Two ways in

**Story mode.** The user talks at length, out of order, often by voice. Do not interrupt. When they stop, sort every sentence into the seven homes. Keep the user's own words for reasons, because a paraphrase loses the part that mattered.

**Interview mode.** The user gives one line, or asks for help with scoping. Ask questions in rounds, grouped by home. The question bank sets the round size, the order, and when to stop.

Read [question-bank.md](./references/question-bank.md) to sort a story and to pick a round's questions. Read [writing-rules.md](./references/writing-rules.md) before the playback. It says how each answer is written, and how the seven questions map onto a plan stage, a note or a brainstorm.

## Play back, then write

Show the filled sections in the template's shape. Mark each line you inferred with `(inferred)`. The user then corrects a draft instead of answering more questions.

```markdown
<the why> (inferred)

# 01 To Do
- [ ] <the work, with paths>
## Guardrails
- <the limit, in the user's words>
## Questions
- <what is open>
## Done when
- <the test>
# 04 Decisions
## 01 <the choice>
- Decided (<author>, <today>): <what>, because <why>.
```

Then scaffold the subtask with `agent-ks issue new-subtask <id> --name <slug> --overview '<the why>'`. Or edit an existing subtask in place. The command writes the template only. Fill the rest by hand, without the `(inferred)` marks. Finish with `agent-ks check issues --template`. It catches a missing heading. It also catches an open question under any status other than `input-needed`. It reports the whole tracker, so read only the lines that name the file you wrote.

## Never

| Never | Do instead |
|---|---|
| Write a decision without a reason | Ask "why that, not the other" once, then record it |
| Invent a guardrail or a done-when the user never stated | Ask, or mark it `(inferred)` in the playback |
| Store the answers in a log, a comment or memory | Write them into the subtask's sections. A log holds only the run's path. `agent-memory/` holds facts the next run must not rediscover, not the scope of a job. The shape is in [06_subtasks.md](../agent-ks-issues/references/06_subtasks.md) |
