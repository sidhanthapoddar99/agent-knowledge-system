---
title: "Issue settings"
description: "The fields of an issue's settings.json, which ones are checked, and which values agentks derives for you."
---

Each issue's `settings.json` holds its metadata: everything the issue list shows, sorts and filters by. This page lists every field, says what `agentks check issues` does when a field is wrong or missing, and lists the values you never write because agentks derives them.

## An example

```json
{
  "title": "Search index for the docs",
  "description": "Full-text search over every docs section.",
  "status": "in-progress",
  "priority": "high",
  "component": ["search"],
  "labels": ["feature"],
  "author": "sid",
  "assignees": ["sid", "claude"]
}
```

The file may also be `settings.jsonc`, which allows `//` comments and trailing commas. When both exist, agentks reads `settings.jsonc`.

## The fields

| Field | Type | If missing or wrong |
|---|---|---|
| `title` | text | Missing: an error. The list shows the folder name instead |
| `status` | one of the [eight statuses](./15_statuses-and-review.md) | Missing: an error. Unknown: an error, and the app does not show the issue |
| `description` | text, one to three sentences | Optional. Detail belongs in `issue.md` |
| `priority` | one value from the tracker's priorities | A value not in the vocabulary is an error |
| `component` | a list of values from the tracker's components | Anything other than exactly one value is a warning. A value not in the vocabulary is a warning |
| `labels` | a list of values from the tracker's labels | A value not in the vocabulary is a warning |
| `author` | a name, usually from the tracker's `authors` list | Not checked |
| `assignees` | a list of names, usually from `authors` | Not checked |
| `draft` | `true` or `false` | Optional. See below |
| `agentLogKinds` | an object of custom agent-log kinds | Optional. See below |

A list field also accepts a single text value, which reads as a list of one. A key that is not in this table is a warning, because it usually means a typo or a leftover field. `agentks check issues --strict` turns those warnings into errors.

The vocabulary that `priority`, `component` and `labels` draw from lives in the tracker's root settings file. [Tracker settings and vocabulary](./25_tracker-vocabulary.md) describes it.

## One component per issue

Give each issue exactly one component: the part of the system that holds most of the work. Do this even when the work touches several parts. If two components feel equally central, that usually means the work is two issues.

## Values agentks derives

Never write these into `settings.json`. agentks works them out, so they cannot disagree with the files.

| Value | Where it comes from |
|---|---|
| The issue's id | The folder name, `YYYY-MM-DD-<slug>` |
| `created` | The date at the start of the folder name |
| `updated` | The date of the last git commit that touched anything in the folder. Before the first commit, it equals `created` |
| Status category | The status, through the fixed list |
| Subtask counts | The files under `subtasks/`: how many there are, how many are closed, how many wait for review |
| Whether the issue is in the review queue | Its status and its subtasks' statuses |

The issue list sorts by priority, highest first, then by `updated`, newest first.

## `author` and `assignees`

- `author` is the person or agent who filed the issue. It does not change.
- `assignees` lists who is working on it now. It may be empty, and it changes as work moves between people.

Neither field says whether work has started. That is the `in-progress` status. To find work nobody holds:

```bash
agentks issue list --assignee unassigned --priority high,urgent
```

`--assignee` takes a name, `assigned` or `unassigned`.

## `draft`

`"draft": true` keeps the issue out of a published build of the site. The local app still shows it. To keep a whole tracker out of a published build, set `draft` in the tracker's root settings instead. [Publishing](../55_publishing/01_overview.md) covers the build.

## `agentLogKinds`

Every issue knows six agent-log kinds: `lp`, `au`, `rf`, `re`, `it` and `wf` ([Agent logs](./50_agent-logs.md)). `agentLogKinds` adds a kind for this issue only, or renames a built-in one.

```json
"agentLogKinds": {
  "ex": { "name": "experiment", "icon": "flask", "desc": "One-off spikes to test an idea." },
  "hf": "hotfix"
}
```

| Rule | Detail |
|---|---|
| The key | Two lowercase letters. It is the code in the log folder's name, such as `030_ex_cache-spike/` |
| The value | A name, or an object with `name`, `icon` and `desc` |
| `icon` | One of: `repeat`, `search`, `wrench`, `refresh-cw`, `git-branch`, `flask`, `zap`, `flag`, `star`, `book`, `shield`, `layers`, `clock`, `target`, `check-circle`, `bug`, `tag`. A kind with no icon shows `tag` |
| `desc` | One line on what the kind is for. The issue's Guide panel shows it |

A log folder whose kind code is neither built in nor declared here gets a warning from `agentks check issues`.
