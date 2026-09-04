# Writing the answers down

The answers go into the subtask's own sections, in the shape the template already has: [06_subtasks.md](../../agent-ks-issues/references/06_subtasks.md). These rules keep what is written usable by the next agent, who has none of the conversation.

## Rules

| Rule | Why |
|---|---|
| A decision carries its reason and its author: `Decided (sid, 2026-09-04): what, because why`. When it answered a question, say what was asked | The reason is what lets the next agent apply the ruling to a case the user never named. The question shows what was uncertain |
| A guardrail is the user's, in their words. Never add one they did not state | A guardrail an agent invented binds the user to a limit they never set, and they cannot tell it from their own |
| `Done when` is a test a stranger could run, not the to-do list restated | A test ends a loop. A restated checklist only says the work was attempted |
| A reason for the whole job goes in the lead paragraph. A reason for one choice goes with that decision. Never both | One home per fact. Two copies drift |
| The freedom level is explicit: "decide alone anything that keeps X; bring back anything that changes Y" | Without it the agent either stops at every fork or takes a decision that was the user's |
| An answer that changes an earlier decision replaces it in place. No history of wording | The tracker is history-free. Git holds the old wording |
| Do not save the conversation. The subtask is the record; a run's path goes in the log | A transcript is not a scope. What was extracted is |
| Paths in the to-do, links in the references. Never a bare description of a file | A path stops the agent guessing the surface; a link survives `agent-ks move` |

## A plan stage

A stage takes four of the seven, at the stage level. The stage's work lives in its subtasks; scope each of those on its own. Shape: [07_plans.md](../../agent-ks-issues/references/07_plans.md).

| Question | Home in the stage |
|---|---|
| 1, why | the lead line: why this stage sits here |
| 2, done | the `outcome` frontmatter line, one sentence |
| 6, freedom | `04 Decisions` |
| 7, open | `05 Notes & Analysis › ## Questions`, in full, status `input-needed` |

A plan overview takes question 1 for the whole plan, plus the stage order and what blocks what. Nothing about the work itself; that is the subtasks'.

## A note or a brainstorm

A note takes question 1 and the conclusion: what is now settled, and why. A brainstorm takes none; it is scratch, and a story that is still deliberating goes there untouched. When a story yields a conclusion that several subtasks will cite, it is a note, and each subtask links it from `03 References` instead of restating it.
