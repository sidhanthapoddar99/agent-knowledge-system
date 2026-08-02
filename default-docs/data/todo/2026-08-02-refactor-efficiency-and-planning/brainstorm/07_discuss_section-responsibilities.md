---
title: "07 — What each section is FOR (Sid's ruling, 2026-08-02)"
---

**Resolved → [What each section is for](../notes/60_section-responsibilities.md)** — the rule set.
This thread is the provenance: the six questions put to Sid and what he answered.

# The ruling

Six questions were put to Sid because each is about his own reading behaviour —
what he opens, what he skips, what he would go back for. None is derivable from
the code or the audit. This is what he said, compressed, with his framing kept.

## Q1 — What was the annoying thing?

**The amount of writing against the amount of code.** Not findability.

Three specific complaints, in his order:

1. **A one-line change should not require a subtask or an agent log.** His
   example: changing one line on a home page.
2. **Small changes can be done without an agent at all**, and can be **grouped
   against a larger block** rather than each getting its own record.
3. **Even after that, the same content was duplicated** across several places,
   and written in more detail than was required.

So the target is **the floor and the duplication**, not prose length. That agrees
with the audit's [finding 3](../notes/10_efficiency-audit-2026-08-02.md) — the
cost is restatement, not detail — and it rules out a word budget.

## Q2 — Who is an agent log written for?

**Both of us, plus future agents, plus back-referencing.** But the audience
answer buys no length: *"two lines of code does not require twenty lines of
explanation."*

| Surface | Primary reader | What Sid does with it |
|---|---|---|
| `summary.md` | **Sid** | reads it, then asks questions |
| `working/` — iteration files | agents | looks in, to see what they are working on |
| `debrief/` | both | reads it |
| audit reports | **not Sid** | reads a simplified table in `summary.md` instead |

## The core ruling — one purpose per section

The most important thing he said, and the thing that reorganises the whole issue:

| Section | Its purpose, in his words |
|---|---|
| `brainstorm/` | initial ideation and iterativeness |
| `notes/` | finalization |
| `plans/` | grouping, structuring, and order of execution |
| `subtasks/` | actionable items, details on those items, and connecting them with notes — the **scope** |
| `agent-log/` | **the execution phase, and the outcome noted.** The scope belongs to the subtask; the run itself happens here |
| `agent-memory/` | overall knowledge of execution; what is worth remembering in this issue |

**The diagnosis, verbatim in substance:** *"currently it's a mixed bag of things
and the responsibilities are not divided properly — everything is mentioning
everything."* Two named instances:

- **`notes/` states in detail what to do.** That is the subtask's job.
- **`subtasks/` carry notes and outcomes and everything.** A subtask may carry
  the final outcome; the **specifics** belong to the agent log — unless the agent
  log was opened for that one small subtask.

## What an agent log holds, and what it must not

**It is the execution phase AND the outcome noted — not the outcome alone.** The
run is carried out here and made visible here. What belongs to the subtask is the
**scope**.

**Holds:**

- The **concern** — exactly what it is trying to solve.
- The **reason it was started.** Load-bearing for ad-hoc work such as an audit,
  which no subtask covers.
- The **execution** — each round, what it is doing, visible while it runs. Space
  for the agent to organise and continue an iterative loop.
- The **outcome** — what is solved, what is not, what broke as a result of
  solving it, and what new todos it generated. The outcome may be positive or it
  may be a list of new work.
- A **todo list that is a reference to subtasks or plan stages**, not its own
  list of micro-steps.

**Must not hold:**

- **The scope.** That belongs to the subtask.
- A restatement of the subtask's details. They are in the subtask.
- A restatement of the order. That is in the plan.
- A step-by-step account of how the code was edited — *"easier to do rather than
  to explain."*

**The form he described:** *"we are doing subtasks 1, 2, 3, 4, 5, and the overall
objective is this."* One or two lines, then the outcome.

## Q3 — Audit reports

**He does not read them.** The 46.7% of all markdown they consume is redundant
*for him*. It stays useful for agents, so the rule is not "write less audit" —
it is:

- Audit reports must be **conclusive in themselves**.
- `summary.md` carries a **simplified table** of the final audit. That is the
  only part he reads.
- Depth, file count and structure below that are **the agent's business, not his**
  — *"I don't care if it's very detailed or not, or if it's multiple files."*
- The benchmark surface is different: **he does read it**, especially while
  optimising.

## Q4 — Superseded wording

**Delete it. Correct in place and keep nothing.** Strongest answer of the six,
and he extended it beyond the question:

- Remove superseded wording **from everywhere it already exists**.
- Make "do not keep superseded wording" an **explicit rule**.
- *"Especially for skills and memory"* — those are loaded into every session, so
  a preserved old sentence is a permanent context tax.

## Q5 — Source-code comments

**Out of scope here.** One small subtask goes into the NeuraSutra refactor issue
in `neurasutra-docs` to reduce comment volume there. **Nothing else** is added to
that repo.

## Q6 — Does anything ever get deleted?

**Yes.** Content that does not contribute, was never implemented, or is redundant
**gets deleted**. There is no rule requiring it to be kept. *"It just adds the
clutter."*

# One reading that needs confirming — proceeding on it unless corrected

He said: *"each iteration is not limited to just one subtask — it's a group of
subtasks, a group of executions, a group of agents."*

Read literally that would overturn **one agent, one iteration file** from
[the agent-log spec](../notes/20_agent-log-structure.md). Read against the
already-decided `NNN_` numbering, it does not — the first two digits are the
**work unit** and the last is **which agent within it**, so a work unit already
spans several subtasks and several agents while each agent still writes into its
own file.

**Taken as: the unit of work is a group; the unit of authorship is one agent.**
The mailbox rule exists so parallel agents cannot collide in one file, which is a
mechanical constraint rather than a design preference, so it survives either way.
