---
title: "Create and work an issue"
description: "From an idea to a hand-off: decide whether it earns an issue, create the folder, work the subtasks, and hand off for review."
---

This page walks one issue from the first idea to the hand-off for review. It starts with the question most people skip, whether the idea earns an issue at all, then creates the folder, adds subtasks, works them and hands off. The steps are the same whether you or an agent do the work.

## 1. Does it earn an issue?

Apply one test: **can you name its component and its first subtask right now?** If you can, it may be an issue. If not, it has a better home:

| The thought | Its home |
|---|---|
| Belongs to an existing issue | A subtask in that issue. A one-prompt fix always lands here |
| Informs a decision in an existing issue | A brainstorm entry in that issue |
| Has no home yet | An entry in a dump issue: an issue with the `issue-dump` component, one subtask per idea |
| Is a one-line change | Nothing. Just make the change |

An existing issue that already holds most of the related work beats a new issue.

Before you create one, check that it does not exist already. Search closed issues too:

```bash
agentks issue list --search 'search|index' --include-closed --quiet-tips
agentks issue list --component search --priority high,urgent
```

| Result | Do this |
|---|---|
| No match | Create the issue |
| A strong match that is not closed | Do not create one. Add a subtask or a comment to the match |
| A partial match | Create the issue, and link the related one in `issue.md` |
| Only a closed match | Create the issue, and mention the old one if it matters |

## 2. Create the folder

Name the folder with today's date and a short slug of lowercase letters, digits and hyphens:

```bash
mkdir data/todo/2026-10-01-search-index
```

Write `settings.json`. Every value of `priority`, `component` and `labels` must come from the tracker's vocabulary ([Tracker settings and vocabulary](./25_tracker-vocabulary.md)):

```json
{
  "title": "Search index for the docs",
  "description": "Full-text search over every docs section.",
  "status": "open",
  "priority": "high",
  "component": ["search"],
  "labels": ["feature"],
  "author": "sid",
  "assignees": []
}
```

Write `issue.md` with the goal, the context, when it is done, and what is in and out of scope ([The issue body, comments and glossary](./30_issue-comments-glossary.md)).

## 3. Add subtasks

If an agent will pick the issue up, give it at least one subtask. The subtask is the agent's anchor: a clear item the next session can resume from.

```bash
agentks issue new-subtask 2026-10-01-search-index --name index-builder \
  --title "Build the index for each docs section" \
  --overview "The search page needs one index per docs section."
```

Fill in the sections the command leaves as placeholders: the To Do items, the guardrails, and the tests under `## Done when` ([Subtasks](./40_subtasks.md)). When the order of subtasks matters, add a plan ([Plans and stages](./45_plans-and-stages.md)).

Then check the issue:

```bash
agentks check issues
```

## 4. Work a subtask

1. **Start.** Set the subtask to `in-progress`:

   ```bash
   agentks issue set-state 2026-10-01-search-index in-progress --subtask index-builder
   ```

2. **Do the work.** Tick the To Do items as they land. Record each decision under `04 Decisions` with who, when and why.
3. **When a question blocks you**, write it under `## Questions` and set `input-needed`. Move on to another subtask while you wait.
4. **When a long run needs a record**, open an agent log ([Agent logs](./50_agent-logs.md)). Link it from the subtask's `## Agent log`.
5. **Finish.** Write the result, with evidence, under `02 Status and Result`, then set `review`:

   ```bash
   agentks issue set-state 2026-10-01-search-index review --subtask index-builder
   ```

Add a comment when something changes that a later reader must know: the scope moved, the work changed hands, a subtask was split. Keep it to two lines and a link.

## 5. Add work you find along the way

Found work that belongs to this issue? Add a subtask with `new-subtask`. Found work that belongs somewhere else? Put it in that issue, or in the dump. Do not widen the current subtask to hold it.

## 6. Hand off the issue

Set the issue itself to `review` only when all of these hold:

- the implementation is done;
- every subtask is in `review` or closed;
- there is something to inspect: a diff, test output, a screenshot or a page;
- the record says what was tried, in the subtasks or the agent log.

```bash
agentks issue set-state 2026-10-01-search-index review
```

A person then reviews the work and closes it ([Review and close](./75_review-and-close.md)).

## Restructuring an issue

Always move files with `agentks move`, so every link follows.

| Change | Steps |
|---|---|
| Promote a subtask to an issue | Create the issue and carry the subtask's framing into `issue.md`. Leave the subtask behind as a pointer, "Promoted to <new issue>", with status `superseded` and its arrow line |
| Split an issue | Create the second issue. Move the relevant notes and subtasks into it. Add a comment in each issue pointing to the other |
| Merge two issues | Pick the one that stays. Move the other's notes and subtasks into it. Comment the merge in both. A person sets the emptied issue to `dropped` |
| Regroup subtasks | Move each subtask into or out of its group folder. Add a group `settings.json` title when the folder name does not read well as a label |
