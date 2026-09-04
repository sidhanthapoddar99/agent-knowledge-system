# The question bank

This file lists the questions, grouped by the home their answer goes to. Each question carries the reason it matters for a long run. Say the reason when you ask, because the user answers better when they know what the answer unblocks. Pick only the questions the story left open. Never read the whole list out.

## How a round runs

Ask three to five questions at a time, grouped by home. Start with homes 1 and 2, because a why and a done-when settle most of what follows. Never ask again what an earlier round answered, because that tells the user you did not listen. Stop when all seven have an answer, or after three rounds. After three rounds the user is answering an interrogation instead of talking.

## 1 Why: the lead paragraph

| Ask | Because |
|---|---|
| What is wrong today, in one concrete case? | An agent that knows the failing case can test its own work against it |
| What changes for whom when this is done? | Tells the agent what to protect when two fixes conflict |
| What is the thesis, the belief that makes this the right job? | This is the reason behind every later decision. It settles cases the user never listed |
| What triggered it now: a bug, a feature, an upgrade, a review? | Sets the size of the change the user expects |

## 2 Done when

| Ask | Because |
|---|---|
| What would you run, open or read to accept this? | Turns "done" into a test the agent can run itself |
| What must still be true afterwards that is true now? | The regression line, so the agent checks it |
| Is there a number: a size, a time, a count? | A number ends a loop. The word "better" does not |

## 3 To Do: the work and what it touches

| Ask | Because |
|---|---|
| Which files, folders or components does this touch? | Paths in the to-do stop the agent from guessing the surface |
| What is in scope that a reader might think is out, and the reverse? | The edge of the job is where a run drifts |
| Is there an order that matters, or none? | Order belongs to a plan. When it matters here, it becomes a nested item |
| What has been tried already, and what did it show? | This saves a repeat. The dead end goes to `05` or a brainstorm |

## 4 Guardrails

| Ask | Because |
|---|---|
| What must I not touch, even if it looks like the fix? | An unstated limit of this kind ends a run in a revert |
| Which gate must pass after every step, not only at the end? | A gate named here runs each round instead of once |
| Is there a shared branch, a live system, a deadline, a cost ceiling? | These limits reach outside the repo. They are yours to set. I never assume one |

## 5 Decisions with reasons

| Ask | Because |
|---|---|
| Between the two obvious approaches, which one, and why not the other? | The rejected option is the reason. Without it, the next agent reopens the choice |
| Which of your earlier rulings apply here? | I link a ruling from a note or another subtask instead of rewriting it |
| What do you want kept simple, even at a cost? | Names the trade the agent must not undo for a local gain |

## 6 Freedom

| Ask | Because |
|---|---|
| What may I decide alone and just record? | A decision the agent may take keeps the run moving |
| What must I bring back before acting? | Names the stop conditions, so nothing else stops the run |
| If a decision is cheap to reverse, may I take it and flag it? | Sets the default for everything the two lists above miss |

## 7 Open questions

Every answer of "not sure" or "we will see" goes here, and the status becomes `input-needed`. Ask one more time whether a default would do. A default with a reason is a decision, and then the question disappears.

## Story mode: extraction cues

Sort by what the sentence does, not by where it came in the story.

| The sentence | Goes to |
|---|---|
| names a pain, a user, a "because", a belief about how it should work | 1, the lead paragraph |
| says "when", "so that we can", "I want to see", a number | 2, `Done when` |
| names a file, a component, a step, "first", "then" | 3, `To Do` |
| says "don't", "never", "keep", "must still", "not on main" | 4, `Guardrails` |
| says "I decided", "let's go with", "not X because" | 5, `04 Decisions` |
| says "you decide", "ask me before", "up to you" | 6, freedom |
| says "not sure", "maybe", "we'll see", "what do you think" | 7, `Questions`, or ask now |

Split a sentence that is both a limit and a ruling in two. The limit goes to 4, `## Guardrails`. The reason goes to 5, `# 04 Decisions`, which points back at the guardrail. Never write the limit twice. Two copies drift, and then the next agent cannot tell which one binds.

Split a sentence that is both the work and its test in two as well. The change goes to 3, `# 01 To Do`. The thing a person can observe goes to 2, `## Done when`. Phrase it as what a stranger would run, open or read. One such sentence is "Collapsed by default with the done/total count on the row, click expands". The to-do is the collapse and the count. The test is what the row shows before and after a click. Split it, because a to-do that serves as its own test is never checked. Then the run has nothing to stop on.

## A worked example

The user says, by voice, in one breath:

> The tracker check prints every warning in the tracker, so I write one subtask and get four hundred lines back and I cannot find my own file. Give `check issues` a scope flag, the same shape `issue list --scope` already has. It should filter the findings, not walk a smaller tree. Don't change what counts as a warning, that stays. I want `agent-ks check issues --scope <path>` to print only the findings under that path when you are done, and the unscoped run to print exactly what it prints today. Use the path matcher `issue list` already has, don't write a second one, private copies of one matcher drift and then nothing tells you which one binds. Whether it should apply to `--json` too, not sure, ask me. Anything else about how you structure the flag, your call.

Extracted, then played back:

````markdown
`check issues` reports the whole tracker, so a writer who just wrote one subtask cannot
find their own file in the output. The findings need a scope filter.

# 01 To Do
- [ ] Add `--scope <subpath>` to `check issues`, filtering the findings it prints.
- [ ] Reuse the path matcher `issue list --scope` uses.

## Guardrails
- Do not change what counts as a warning. That stays.
- Use the existing path matcher. Never a second copy.

## Questions
- Should `--scope` apply to `--json` output as well?

## Done when
- `agent-ks check issues --scope <path>` prints only the findings under that path.
- The unscoped run prints what it prints today.

# 04 Decisions
## 01 One path matcher
- Decided (sid, 2026-09-04): the matcher guardrail above stands, because private copies
  of one matcher drift, and then nothing tells you which one binds.
## 02 Flag structure is the agent's call
- Decided (sid, 2026-09-04): the agent decides the internal structure alone and records it.
````

The status is `input-needed`, because one question is still open. Everything else the run needs is on the page.
