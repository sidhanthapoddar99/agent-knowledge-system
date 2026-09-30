---
title: "Tracker settings and vocabulary"
description: "The tracker's root settings file: priorities, components, labels, authors, preset views, drafts, and adding a second tracker."
---

A tracker's root settings file declares the values its issues may use: the priorities, the components and the labels. It also lists the authors, the preset views of the issue list, and two switches. This page shows the file, its rules, and how to add a second tracker to a project.

## The file

The root settings file sits in the tracker folder, beside the issue folders:

```
data/todo/
├── settings.jsonc               the vocabulary
├── 2026-09-28-docs-refresh/
└── 2026-10-01-search-index/
```

It may be `settings.json` or `settings.jsonc`. Prefer `.jsonc`, because it allows comments, and a comment next to each value helps every author. When both files exist, agentks reads `.jsonc`.

```jsonc
{
  "label": "Todo",
  "fields": {
    "priority": { "values": ["low", "medium", "high", "urgent"] },
    "component": {
      "values": ["search", "editor", "docs", "issue-dump"],
      "descriptions": {
        "search": "The search index and the search page.",
        "editor": "Editing pages in the app.",
        "docs": "The user guide and the developer docs.",
        "issue-dump": "A holding place for ideas that have no home yet."
      }
    },
    "labels": {
      "values": ["bug", "feature", "refactor"],
      "descriptions": {
        "bug": "Something is broken.",
        "feature": "New behaviour.",
        "refactor": "A change in structure with no change in behaviour."
      }
    }
  },
  "authors": ["sid", "claude", "codex"],
  "views": [
    { "name": "Urgent", "filters": { "priority": ["high", "urgent"] } },
    { "name": "Bugs", "filters": { "labels": ["bug"] } }
  ]
}
```

## The keys

| Key | Meaning |
|---|---|
| `label` | The tracker's display name |
| `fields` | The vocabulary: `priority`, `component` and `labels`. Required; a missing `fields` is an error |
| `authors` | The people and agents who write in this tracker. Issues draw `author` and `assignees` from it |
| `views` | Preset views for the issue list. See below |
| `draft` | `true` keeps the whole tracker out of a published build. The local app still shows it |
| `template` | `true` makes every `agentks check issues` also check the template sections of subtasks, stages and plan overviews, as `--template` does |

Any other key is a warning.

## The rules for `fields`

| Rule | Detail |
|---|---|
| Every value an issue uses comes from here | Add a value here first, then use it in an issue |
| `component` and `labels` need a description for every value | A missing description is an error. The tracker's Guide shows the descriptions, and they steer where a new issue belongs, so keep them accurate |
| `priority` descriptions are optional | |
| Status is not configurable | A `fields.status` block is an error. So is a `statusColors` map. Status colours are theme variables, `--status-<name>` |
| Only these three fields | Any other field name is a warning and is ignored |

## Designing the vocabulary

| Field | Think of it as | Typical values |
|---|---|---|
| `priority` | How urgent is it? | Four levels are plenty: `low`, `medium`, `high`, `urgent` |
| `component` | Which part of the system holds most of the work? | Your team's own map: `frontend`, `backend`, `infra`, or `auth`, `payments` |
| `labels` | What kind of work is it? | `bug`, `feature`, `docs`, `good-first-issue`. Never a stage of the work: that is a status |

Start small. Adding a value later is easy. Removing one means changing every issue that uses it.

Do not add fields for scheduling, release buckets or a single issue type. They go stale under continuous shipping, and priority, status and labels already carry that information. [Why the tracker is shaped this way](./05_design-philosophy.md) explains this.

### The dump component

Many trackers keep an `issue-dump` component. An issue with that component collects ideas that have no home yet, one subtask per idea. When an idea earns its own issue, it moves out of the dump. [Create and work an issue](./70_create-and-work-an-issue.md) shows when that happens.

## Preset views

A preset view is a saved filter for the issue list. Each one has a `name` and `filters`:

```json
"views": [
  { "name": "Urgent", "filters": { "priority": ["high", "urgent"] } },
  { "name": "Search work", "filters": { "component": ["search"] } }
]
```

Within one field, any listed value matches. Across fields, every field must match. The app lists the presets on the issue list, and one click applies a preset.

## Adding a second tracker

Most projects need one tracker. Add a second only when its issues need a different vocabulary, such as customer bug reports next to engineering work.

1. Create the folder and its root settings file, for example `data/bugs/settings.jsonc`, with its own `fields`.
2. Declare it under `pages:` in `config/site.yaml`, with `type: issues`:

   ```yaml
   pages:
     bugs:
       base_url: "/bugs"
       type: issues
       layout: "@issues/default"
       data: "@data/bugs"
   ```

3. Check it with `agentks check issues --tracker data/bugs`.

Every `agentks issue` command takes `--tracker <path>` to work on a tracker other than the project's default one. [Configuration](../35_configuration/01_overview.md) covers `site.yaml` in full.

Every folder directly inside a tracker must be an issue folder named `YYYY-MM-DD-<slug>`. The only exceptions are hidden folders and `assets/`. Any other folder is an error.
