---
name: agent-ks-qna
description: Scope a subtask or a plan stage by question and answer before an agent runs it alone. Use it whenever the user starts defining a subtask or a plan, says "let me explain", "scope this" or "before you start", dictates a long story about a job, or when a subtask lacks a why, guardrails, a done-when or decisions with reasons. It writes the answers into the subtask's own sections, reason included, so an autonomous loop never stops to ask.
---

# agent-ks-qna — scope by question and answer

An autonomous run stops the moment it meets a question the subtask does not answer. This skill gets the answers out of the user's head first, reasons included, and writes them where the template already has a home. An agent that knows *why* can decide the cases the user never mentioned.

## What a work order must answer

Seven things. Each has one home in the subtask.

| # | Question | Home |
|---|---|---|
| 1 | Why does this exist: what is wrong today, what changes when done, the thesis | the lead paragraph. Longer: `05 Notes & Analysis` |
| 2 | What is the end state, and how will we know | `## Done when` |
| 3 | What is the work, and what does it touch | `# 01 To Do`, nested, with paths |
| 4 | What must not change, what must stay true, which gate must pass | `## Guardrails` |
| 5 | What is already decided, and why | `# 04 Decisions`, one `##` each, reason included |
| 6 | What may the agent decide alone, and what must it bring back | `## Guardrails` for the limits; `# 04` for the freedom |
| 7 | What is still open | `## Questions`, status `input-needed` |

When all seven hold, the run can go long. A missing one is the question to ask.

## Two ways in

**Story mode.** The user talks, often by voice, at length and out of order. Do not interrupt. When they stop: extract, do not summarise. Sort every sentence into the seven homes. Keep the user's words for reasons; a paraphrase loses the part that mattered. Then play back the draft and ask only the gaps.

**Interview mode.** The user says "help me scope this", or gives one line. Ask in rounds of three to five questions, grouped by home, each with why it matters for the run. Start with 1 and 2; the rest follow. Stop when the seven hold. Never ask what the issue, its notes, its memory or an earlier round already answered. Three rounds is the usual ceiling.

The questions, and a worked example: [question-bank.md](./references/question-bank.md).

## Play back before you write

Show the filled sections as they will be written, in the template's shape. Mark each line you inferred with `(inferred)`. The user corrects the draft, not the questions. Then write the file with `agent-ks issue new-subtask`, or edit the existing one in place, without the marks.

## Write it down

How each answer is written, and how the seven map onto a plan stage, a note or a brainstorm: [writing-rules.md](./references/writing-rules.md). Read it before the playback.

## Never

| Never | Do instead |
|---|---|
| Start the run with a question still in `## Questions` | Ask it now. Status `input-needed` until answered |
| Ask one question per turn | A round of three to five, each with its why |
| Write a decision without a reason | Ask "why that, not the other" once, then record it |
| Store the answers in a log, a comment or memory | The subtask's sections. Shape: [06_subtasks.md](../agent-ks-issues/references/06_subtasks.md) |
| Invent a guardrail or a done-when | Ask, or mark it `(inferred)` in the playback |
