---
title: "Agent memory"
description: "The facts about an issue that an agent must not rediscover, kept as an index and topic files."
---

`agent-memory/` is an agent's working state for one issue: the facts that are true now, the gotchas, and the pointers that took an hour to find. The next agent reads it first and does not rediscover any of it. This page shows its shape and the rules that keep it trustworthy.

## What it holds

| Holds | Never holds |
|---|---|
| What is true and binding for this issue now | Decisions. Those are notes |
| How the work got here: what was tried, what landed, what was parked | The plan. Order is in `plans/` |
| Gotchas, environment quirks, dead approaches, pointers that were hard to find | Anything git, `issue.md` or `notes/` already records |
| An index that points to each topic | Content inside the index itself |

An agent log records what happened in one run. Agent memory holds what is still true across every run. An agent keeps it current during any work on the issue, not only inside a logged run.

## The shape

Memory grows in three tiers. Most issues stop at the second.

| Tier | Shape | When |
|---|---|---|
| 0 | `memory.md` alone | A small issue with a few facts |
| 1 | `memory.md` plus topic files beside it | Most issues |
| 2 | `memory.md` plus `knowledge/` and `history/` | When the topic files outgrow one folder |

```
agent-memory/
├── memory.md                  the index: read it first
├── knowledge/
│   ├── gotchas.md             what is true here
│   └── test-setup.md
└── history/
    └── ranking-attempts.md    how we got here
```

| File | Answers | Goes stale |
|---|---|---|
| `memory.md` | Where is everything? | As soon as one line is wrong, because a reader trusts the whole map |
| `knowledge/<topic>.md` | What is true here? | Only when nobody corrects it |
| `history/<subject>.md` | How did we get here? | Never. It is written once |

Name topic files by topic, with no number. The app always shows `memory.md` first.

## The index

`memory.md` holds one line per topic file, with a short hook that says when to read it:

```markdown
- [Gotchas](knowledge/gotchas.md) — the test server needs a fresh cache after a schema change
- [Test setup](knowledge/test-setup.md) — how to run the search tests without the network
- [Ranking attempts](history/ranking-attempts.md) — three weightings tried, and why each failed
```

An agent loads the index, then reads only the files its task needs. When `knowledge/` and `history/` disagree, `knowledge/` wins, and the agent corrects the file that is wrong.

## The rules

- **Write a fact when you find it**, then add or refresh its line in the index.
- **Correct in place.** Delete a wrong or outdated entry. Never leave it with a note that it is stale.
- **The agent decides** what to write, rewrite or delete, unless you say otherwise.
- **No folder for work still to do.** What is left, and in what order, belongs to the plan.
- **Memory belongs to one issue.** It adds to an agent's own global memory and does not replace it. It stays when the issue closes.

`agentks check issues` warns when an `agent-memory/` folder has no `memory.md`. It never asks an issue to start one.
