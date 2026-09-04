# The question bank

The questions, grouped by the home their answer goes to. Each carries the reason it matters for a long run. Say the reason when you ask; the user answers better when they know what the answer unblocks. Pick the ones the story left open. Never read the whole list out.

## 1 Why: the lead paragraph

| Ask | Because |
|---|---|
| What is wrong today, in one concrete case? | An agent that knows the failing case can test its own work against it |
| What changes for whom when this is done? | Tells the agent what to protect when two fixes conflict |
| What is the thesis, the belief that makes this the right job? | The reason behind every later decision; it settles cases the user never listed |
| What triggered it now: a bug, a feature, an upgrade, a review? | Sets the size of the change the user expects |

## 2 Done when

| Ask | Because |
|---|---|
| What would you run, open or read to accept this? | Turns "done" into a test the agent can run itself |
| What must still be true afterwards that is true now? | The regression line, so the agent checks it |
| Is there a number: a size, a time, a count? | A number ends a loop; "better" does not |

## 3 To Do: the work and what it touches

| Ask | Because |
|---|---|
| Which files, folders or components does this touch? | Paths in the to-do stop the agent from guessing the surface |
| What is in scope that a reader might think is out, and the reverse? | The edge of the job is where a run drifts |
| Is there an order that matters, or none? | Order belongs to a plan; if it matters here, it becomes a nested item |
| What has been tried already, and what did it show? | Saves a repeat, and the dead end goes to `05` or a brainstorm |

## 4 Guardrails

| Ask | Because |
|---|---|
| What must I not touch, even if it looks like the fix? | The one limit that, unstated, ends a run in a revert |
| Which gate must pass after every step, not only at the end? | A gate named here runs each round instead of once |
| Is there a shared branch, a live system, a deadline, a cost ceiling? | Outward-facing limits are yours to set, never mine to assume |

## 5 Decisions with reasons

| Ask | Because |
|---|---|
| Between the two obvious approaches, which one, and why not the other? | The rejected option is the reason; without it the next agent reopens the choice |
| Which of your earlier rulings apply here? | A ruling from a note or another subtask gets linked, not rewritten |
| What do you want kept simple, even at a cost? | Names the trade the agent must not undo for a local gain |

## 6 Freedom

| Ask | Because |
|---|---|
| What may I decide alone and just record? | A decision the agent may take keeps the run moving |
| What must I bring back before acting? | Names the stop conditions, so nothing else stops the run |
| If a decision is cheap to reverse, may I take it and flag it? | Sets the default for everything the two lists above miss |

## 7 Open questions

Anything the user answers with "not sure" or "we will see" goes here, and the status becomes `input-needed`. Ask one more time whether a default would do; a default with a reason is a decision, and the question disappears.

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

## A worked example

The user says, by voice, in one breath:

> The link checker is in the engine and that is wrong, a consumer has no build so they can never run it, so move it into the plugin. It should read files only, no server. Don't touch the engine's own route parity check, that stays. I want `agent-ks check link-form` to pass on the user guide when you are done, and the engine tree should have no link-checking code left. Use the shared link walker, don't write a second regex, we had four copies once and they all disagreed. If the CI question comes up, not sure, ask me. Anything else about how you structure the script, your call.

Extracted, then played back:

````markdown
The link checker lives in the engine, so a consumer, who has no build, can never run it.
It belongs in the plugin, which needs only files on disk.

# 01 To Do
- [ ] Move the checker into the plugin under `scripts/check-link-form.mjs`, reading files only.
- [ ] Remove the link-checking code from the engine tree.

## Guardrails
- Do not touch the engine's route-parity check. It stays.
- Use the shared link walker in `_links.mjs`. Never a second regex.

## Questions
- Should the check also run in CI?

## Done when
- `agent-ks check link-form` passes on the user guide.
- The engine tree has no link-checking code left.

# 04 Decisions
## 01 One link walker
- Decided (sid, 2026-09-04): reuse the shared walker, because four private copies once
  gave four different answers.
## 02 Script structure is the agent's call
- Decided (sid, 2026-09-04): the agent decides the internal structure alone and records it.
````

Status: `input-needed`, because one question stands. Everything else the run needs is on the page.
