---
title: "The tracker in the app"
description: "The issue list and the issue page in the local app, and which of your files each part comes from."
---

The local app shows a tracker as three kinds of page: the issue list, one page per issue, and one page per file inside an issue. This page says which of your files each part comes from, so you know what to edit when something looks wrong.

## Open the tracker

Start the local server from your project folder:

```bash
agentks start --open
```

Then go to the tracker's `base_url`, such as `/todo`, at the address `agentks start` prints. [Getting started](../05_getting-started/01_overview.md) covers starting agentks.

The app follows your files. When you or an agent change a file on disk, the open page updates. When you commit, the `updated` dates follow.

agentks works out every tracker rule itself: the status categories, the order, the derived statuses and the `updated` dates. The app only draws the results. So what the app shows always matches what `agentks issue` and `agentks check issues` report.

## The issue list

The issue list shows one entry per issue, ordered by priority, highest first, then by `updated`, newest first.

| Part | Where it comes from |
|---|---|
| Each issue's title, status, priority, component and labels | The issue's `settings.json` |
| The `created` and `updated` dates | The folder name, and the last commit that touched the folder |
| How many subtasks the issue has, how many are closed, and how many wait for review | The statuses of its subtasks |
| Filters by status, category, priority, component and labels | The eight fixed statuses, and the values in the tracker's root settings |
| Preset views | `views` in the root settings |

Within one filter, any selected value matches. Across filters, every filter must match.

## The issue page

An issue's page opens at the tracker's base URL plus the folder name, such as `/todo/2026-10-01-search-index`.

| Part | Where it comes from |
|---|---|
| The title and metadata: status, priority, component, labels, dates | `settings.json`, and the dates agentks derives |
| The body, with an outline of its headings | `issue.md` |
| The comments, in order | `comments/` |
| The glossary | `glossary.md`, when the issue has one |
| Every section the issue has, with its files in order | The folders and files on disk |
| The Guide: a short map of the issue anatomy | Built by agentks, with your `agentLogKinds` |

Subtasks and plan stages show their status. An index leaf shows the status agentks derives from its siblings. Agent logs show their kind and their run status.

Each subtask, note, brainstorm entry, memory file and log file opens as its own page. Diagrams and HTML artifacts inside an issue open as their own pages too.

## Drafts

An issue or a whole tracker with `"draft": true` still shows in the local app. It is left out only when you publish the site ([Publishing](../55_publishing/01_overview.md)).

## Colours

Each status has a colour from the theme, in a variable named `--status-<name>`. To change one, override the variable in your theme's CSS ([Themes and layouts](../45_themes-and-layouts/01_overview.md)). The tracker's settings hold no colours.

## When something looks wrong

| You see | Look at |
|---|---|
| An issue is missing from the list | Its `settings.json`: it must exist and hold a known `status`. Run `agentks check issues` |
| `agentks check issues` reports a priority, component or label | The value must be in the tracker's root settings ([Tracker settings and vocabulary](./25_tracker-vocabulary.md)) |
| A subtask shows the wrong status | The `status:` line in its frontmatter |
| A group's index leaf shows a different status than its file says | agentks derives an index leaf's status from its siblings ([Subtasks](./40_subtasks.md)) |
| A file does not appear on the issue page | It may be in an `assets/` folder, too deep, or of a kind that section does not allow ([Inside an issue folder](./10_the-issue-folder.md)) |
