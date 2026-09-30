---
title: "The issue body, comments and glossary"
description: "What goes in issue.md, how comments work, and when an issue needs a glossary."
---

Three parts of an issue frame everything else: `issue.md` says what the issue is, `comments/` records what changed, and the optional `glossary.md` explains the issue's own terms. This page shows the shape of each and the rules that keep them short.

## `issue.md`: the goal

`issue.md` is the first file a reader opens. It holds the lasting frame of the issue, written for someone who reviews the work later.

```markdown
# Goal
Full-text search over every docs section, from the navbar.

## Context
Readers cannot find pages by keyword today. Related: the site-wide search idea in the dump.

## Done when
- A search for any heading text finds its page.
- Results appear while the reader types.

## Scope decisions
- In: docs sections. Out: the blog and the tracker, for now.
```

| Holds | Never holds |
|---|---|
| The goal, the context, what "done" means, what is in and out of scope | Research, options weighed, design reasoning. Those are notes |
| Links to related issues | A design exploration or a comparison table |

The title shown in the app comes from `settings.json`, so `issue.md` needs no frontmatter. Keep the file short: past about 300 lines, move the detail into `notes/` and leave a one-line link behind.

## `comments/`: what changed

A comment records that something changed: a status, the scope, a hand-off, a decision to drop. It is two lines and a link, not a discussion.

```markdown
---
author: claude
date: 2026-10-01
---

Moved the ranking work to its own subtask, [ranking](../subtasks/030_ranking.md).
The search page now waits on it.
```

Add one with the CLI, which picks the next number and writes the frontmatter:

```bash
agentks issue add-comment 2026-10-01-search-index --author claude \
  --body "Handed subtask 20 to review. The result and test output are in the subtask."
```

This writes `comments/003_2026-10-01_claude.md`: the next number, the date, then a slug that defaults to the author. `--slug` sets a different slug, and `--date` a different date.

| Rule | Why |
|---|---|
| Comments are flat files, never subfolders | The number is the comment's id, and the list reads in order. `agentks check issues` warns about a nested comment |
| Never rewrite an earlier comment, or its `author` and `date` | The comments are the history of the issue |
| A second paragraph means the wrong place | A debate goes to `brainstorm/`. A specification goes to `notes/` or the subtask. The comment links to it |
| Dropping an issue needs a comment first | The comment says why. A person then sets `dropped` |

The test for a comment: would a reviewer six weeks from now need this line to follow the issue? If yes, it is a comment.

Working conversation with an agent is not a comment. It is saved only when you ask, as a brainstorm entry ([Brainstorm and notes](./35_brainstorm-and-notes.md)).

## `glossary.md`: the issue's own terms

`glossary.md` is an optional file at the issue root. The issue page shows it as written. Use it when the issue has its own vocabulary, or when its files use `color:` and a reader needs to know what each colour means.

```markdown
# Glossary

## Colour legend
| Colour | Meaning | Example |
|---|---|---|
| blue | An option still in play | brainstorm/02_ranking-options.md |
| grey | A rejected option | brainstorm/01_prefix-search.md |

## Key terms
| Term | Meaning |
|---|---|
| shard | One part of the index, one per docs section |
```

| Rule | Detail |
|---|---|
| Write a colour legend when the issue uses `color:` | `color:` has no built-in meaning. The legend gives it one, with an example file |
| Scope a colour by section when meanings differ | Use a `###` heading per section when blue means one thing in brainstorm and another in the agent log |
| Prefer theme colours | A theme colour works in both light and dark mode |
| Custom agent-log kinds are not defined here | They live in `agentLogKinds` in `settings.json` ([Issue settings](./20_issue-settings.md)). The glossary may explain them in words |

`color:` works on notes, brainstorm, agent-memory and agent-log files. It does nothing on a subtask or a plan stage.

## The Guide

Every issue page also shows a Guide: a short legend of the issue anatomy, with the agent-log kinds this issue knows. agentks builds it, so you never write it. The tracker's Guide shows the eight statuses and this tracker's vocabulary with its descriptions.
