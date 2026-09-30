---
title: "Review and close"
description: "How a person finds work waiting for review, checks it, and accepts, rejects or closes it."
---

Review is where a person signs off on work an agent did. This page shows how to find what waits for you, what to check before you accept, and how to accept, send back, drop or close work. Only a person sets `done` or `dropped` on an issue or a subtask, so this is your side of the handoff.

## Why review stays with a person

An agent's claim that work is done is a claim, not proof. If agents closed their own work, a mistake would ship unseen. Review keeps one step where a person looks at the result before it counts as done. The rest of the tracker is built so that this step is quick: the result, the evidence and the record sit where you expect them.

## Find what waits for you

```bash
agentks issue review-queue
agentks issue subtasks --all --status review,input-needed
```

The review queue lists every issue in `review` or `input-needed`, and every issue not yet closed that has a subtask in either status.

## Answer `input-needed` first

An item in `input-needed` is stuck on your answer. The question is written in the item, under `## Questions`. Answer it, in the file or to the agent. The answer becomes a decision under `04 Decisions`, the question is deleted, and the item goes back to `in-progress`. Questions cost the most while they wait, so answer them before you review finished work.

## Review a subtask

1. **Read the result.** Open the subtask's `02 Status and Result`. The `## Result` should say what came out, with evidence.
2. **Read the record, if there is one.** `## Agent log` links to the log that did the work. Its `00_index.md` ends with a handover that says how the run went and what failed.
3. **Check the evidence yourself.** Look at the diff, run the tests, open the page, compare the screenshot. A result without evidence is a reason to send the work back.
4. **Check the tests for done.** Every line under `## Done when` should hold.

## Decide

`agentks issue set-state` to `done` or `dropped` asks you to type the status word at a terminal before it writes. `--yes` does not skip this question. With no terminal, which is every agent's run, the command refuses. If you have no terminal, edit the `status` line in the file yourself.

| Decision | What to do |
|---|---|
| Accept | Set `done`: `agentks issue set-state <id> done --subtask <subtask>`, then type `done` when asked |
| Send back | Set `in-progress` again, and say what is wrong: in the subtask, or in a two-line comment with a link |
| Accept part of it | Set `done` on the subtasks that pass. Send back the rest |
| Drop it | Write a comment that says why, then set `dropped` |
| The scope moved | Set `superseded`, with an arrow line that says where the scope went |

```bash
agentks issue set-state 2026-10-01-search-index done --subtask index-builder   # asks you to type: done
agentks issue add-comment 2026-10-01-search-index --author sid \
  --body "Sent the result list back: results do not update while typing. See Done when, line 2."
agentks issue set-state 2026-10-01-search-index in-progress --subtask result-list
```

## Close the issue

Close the issue after its subtasks. An issue in `review` should already have every subtask in `review` or closed, and something to inspect.

- **Done:** the work shipped. Set the issue to `done`.
- **Dropped:** a comment says why, then set `dropped`.
- **Superseded:** the scope moved to another issue or plan. `issue.md` carries the arrow line, then set `superseded`.

[Statuses, categories and review](./15_statuses-and-review.md) explains the difference between the three.

## Good review habits

- **Review in batches.** The queue makes it easy to clear several items at once.
- **Keep one bar.** Ask for the same evidence every time, so agents learn what a finished subtask looks like.
- **Ask for missing evidence** rather than checking everything yourself. Send the item back with the evidence you need.
- **Write down a hard call.** When a decision was close, record it as a decision in the subtask, with the reason.

## When review goes wrong

| You find | Do this |
|---|---|
| An agent set `done` or `dropped` itself | Set the item back to `review`, and review it as usual. Tell the agent the rule |
| The record says success, but the diff looks broken | Trust the evidence, not the record. Send it back with what you saw |
| No result and no log | Send it back and ask for the result under `02 Status and Result` |
