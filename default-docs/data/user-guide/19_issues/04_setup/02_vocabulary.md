---
title: Vocabulary
description: The tracker-root settings.json / settings.jsonc — enums, colors, preset views, authors, tracker-wide draft
sidebar_position: 2
---

# Vocabulary

Every tracker has a root `settings.json` that defines its **vocabulary** — the allowed values for every enum field, the colors used to render them, the authors known to the tracker, any pre-canned filter views, and (optionally) a flag that hides the whole tracker from production.

Per-issue `settings.json` files are validated against this root. Rename a value here, and every issue using it either migrates or starts warning.

## JSON or JSONC — annotate the meanings

The settings file may be plain `settings.json` **or** `settings.jsonc` — JSON that also allows `//` line comments, `/* */` block comments, and trailing commas. Both the framework loaders and the `docs-guide` toolkit read either; when both files exist for the same folder, **`.jsonc` wins**. Since JSONC is a strict superset of JSON, a comment-free `.json` file is still perfectly valid — the win is the ability to annotate.

**For the root vocabulary, prefer `.jsonc` and comment what each `component` and `label` means.** The vocabulary is the controlled list every issue picks from, so a one-line gloss per value is the single best signal for humans *and* AI agents deciding where a new issue belongs — and it keeps `component` from decaying into a junk drawer. Keep the glosses accurate as the taxonomy changes.

## Example

```jsonc
{
  "label": "Todo",
  "fields": {
    "status": {
      // Statuses are FIXED in framework code — you may override colors, not the set.
      "values": ["open", "blocked", "in-progress", "input-needed", "review", "done", "dropped"],
      "colors": {
        "open":         "#888888",
        "blocked":      "#d1854f",
        "in-progress":  "#61afef",
        "input-needed": "#e8a54b",
        "review":       "#f0c674",
        "done":         "#7ec699",
        "dropped":      "#c678dd"
      }
    },
    "priority": {
      "values": ["low", "medium", "high", "urgent"],
      "colors": {
        "low":    "#7aa2f7",
        "medium": "#f0c674",
        "high":   "#e5a663",
        "urgent": "#e06c75"
      }
    },
    "component": {
      // Layer-of-the-stack axis — pick exactly one per issue (by center of gravity).
      "values": [
        "architecture",          // engine/infra: refactors, plugin system, runtime, dev-toolbar
        "loaders-and-renderers", // content pipeline: loading, link resolution, caching, render
        "components",            // markdown-rendered elements (code blocks, diagrams, graph, wikilinks) + supplemental tools
        "layout-general",        // building presentation: layouts (docs/blog/new types) + themes
        "layout-issues",         // the issue-tracker presentation specifically
        "editor",                // the live CodeMirror+Yjs editing app
        "ai-plugin-and-docs"     // the meta-project: Claude Code plugin/skills + prose docs
      ]
    },
    "labels": {
      "values": [
        "wip",              // DEPRECATED — superseded by the `in-progress` status; kept for back-compat
        "blocked",          // DEPRECATED — superseded by the `blocked` status; kept for back-compat
        "bug",              // behaves differently from intended
        "feature",          // net-new capability
        "task",             // concrete work that isn't a feature/bug
        "performance",      // speed / memory / scaling
        "refactor",         // restructuring, no behavior change
        "docs",             // documentation/prose work (cross-cuts any component)
        "idea",             // speculative, not yet committed
        "duplicate",        // superseded by another issue
        "good-first-issue", // low-context entry point for newcomers
        "discussion",       // open design conversation, decision unsettled
        "blocked-external"  // waiting on an upstream / third-party dependency
      ]
    }
  },
  "authors": ["sidhantha", "claude"],
  "views": [
    { "name": "High priority","filters": { "priority": ["high", "urgent"] } },
    { "name": "Blocked",      "filters": { "status": ["blocked"] } },
    { "name": "By component", "group": "component" }
  ]
}
```

## Top-level fields

| Field | Type | Required | Purpose |
|---|---|:---:|---|
| `label` | string | — | Human name for the tracker, shown in the sidebar + page header |
| `fields` | object | ✅ | Enum definitions for every field issues pick from |
| `authors` | string[] | — | Known authors — referenced by `author` / `assignees` in per-issue settings |
| `views` | array | — | Preset filter views (see [Preset views](#preset-views)) |
| `draft` | bool | — | `true` → entire tracker hidden in production |

## The `fields` object

Each key is a field name (`status`, `priority`, `component`, `labels`). Each value has:

```ts
{
  values: string[]           // allowed values
  colors?: { [value]: hex }  // optional, per value
}
```

### Required fields

The loader expects these four fields at minimum. Adding more is possible but the built-in layout won't surface them.

| Field | Multi-select? | Typically used for |
|---|:---:|---|
| `status` | — | Lifecycle status (seven statuses in four categories; fixed in code) |
| `priority` | — | Urgency (low / medium / high / urgent) |
| `component` | ✅ | Which part of the codebase / product. Convention is one entry per issue; multi-component is allowed for cross-cutting work |
| `labels` | ✅ | Everything orthogonal — `wip`, `blocked`, `bug`, `feature`, `docs`, `idea`, … |

The vocabulary shape is the same for single- and multi-select fields — just `values: string[]` (and optional `colors`). Whether issues consume each value singly or as a list is up to per-issue `settings.json`.

`priority` + `status` are the ordering signals — see [Design Philosophy](../design-philosophy) for why no other dimensions are wired in.

### Status — the fixed seven-status contract

```json
"status": {
  "values": ["open", "blocked", "in-progress", "input-needed", "review", "done", "dropped"],
  "colors": {
    "open":         "#888888",
    "blocked":      "#d1854f",
    "in-progress":  "#61afef",
    "input-needed": "#e8a54b",
    "review":       "#f0c674",
    "done":         "#7ec699",
    "dropped":      "#c678dd"
  }
}
```

The seven statuses group into four categories — **Not Started** (`open`, `blocked`) ·
**In Progress** (`in-progress`) · **Review** (`input-needed`, `review`) · **Closed**
(`done`, `dropped`). The UI filters by category; the status is the per-row badge. Full
meanings and transition conventions are in [Lifecycle and Review](./lifecycle-and-review).

**The status set is fixed in framework code — you cannot add, remove, or rename statuses
per tracker.** Listing `values` in `settings.json` is documentation only; the loader and
validator ignore custom values, and an unknown status is a hard error (not a silent
default). The one thing you *can* customize is the **colors**.

#### Why status is fixed, and everything else isn't

`status` looks like every other enum in `fields` — a `values` array and an optional
`colors` map — but it is **not** vocabulary-driven. The other enums (`priority`,
`component`, `labels`) are read at runtime: add a value to `settings.json` and it shows
up in filters, groupings, and chips with no code change. `status` is different by design.

| Concern | Source |
|---|---|
| Status **names** + **category grouping** | Fixed in framework code |
| Status **colors** | ✅ Vocabulary (`fields.status.colors`) overrides the code defaults |
| Category **tabs** in the index view | Derived from the fixed categories |
| Status **icons** + cycle order on subtasks | Fixed in code |
| **Subtask** statuses | Same fixed set — issues and subtasks share one vocabulary and one field name (`status`) |
| Review-debt promotion (active issue → Review tab if any subtask is in the Review category) | Derived from the fixed category grouping |
| `priority` ordering | ✅ Vocabulary (`fields.priority.values`) — drives default index sort |

**Bottom line:** the colors are tweakable from `settings.json`; the names, the count,
the categories, and the order are not. This is deliberate — see
[Design Philosophy](../design-philosophy) for why an AI-operated tracker fixes its
lifecycle vocabulary rather than letting each project drift.

#### The single source of truth (for framework maintainers)

There is exactly one place the vocabulary lives: `astro-doc-code/src/loaders/issue-status.ts`
(statuses, categories, default colors, helpers). The loader, layouts, `guide.ts` panel,
and — mirrored on the JS side — the `docs-guide` CLI all consume it. A framework
maintainer changing the lifecycle edits that one constant (and its CLI mirror in
`_lib.mjs`); a tracker author never touches it. If you find yourself wanting a new status,
that's a framework-level decision, not a per-tracker config change.

### Colors

Purely cosmetic — drive badge fills on the list view and anywhere status chips render. Omit `colors` for a field entirely, and the UI falls back to neutral text. Per-value — only provide colors for values that need them.

Use any CSS color syntax: hex, `rgb()`, `hsl()`, or CSS variables from the theme (e.g. `"var(--color-success)"`). Hex is the safest for portability across themes.

## `authors[]`

A list of known author identifiers. Used to:

- Populate the "Assignee" dropdown in the metadata sidebar
- Validate `author` and `assignees` entries in per-issue settings
- Attribute comments and agent-log entries (via filename parsing)

Extensible — add a new person to the list and they're immediately available. The field is optional; absence means no validation happens.

## Preset views

Canned filter + grouping configurations that appear as a strip above the list view. One click applies them.

```json
"views": [
  { "name": "High priority", "filters": { "priority": ["high", "urgent"] } },
  { "name": "Blocked",       "filters": { "labels": ["blocked"] } },
  { "name": "By component",  "group": "component" }
]
```

Per-view fields:

| Field | Type | Purpose |
|---|---|---|
| `name` | string | Label shown in the preset strip |
| `filters` | `{ [field]: string[] }` | Field → values to include (OR within, AND across fields) |
| `group` | string | Field to group the result list by (`component` or `priority`) |
| `sort` | `"updated" \| "created" \| "priority"` | Default sort for this view |
| `dir` | `"asc" \| "desc"` | Sort direction |

All fields except `name` are optional — a preset with just `group` applied to the default filter set is a valid "group by X" shortcut.

## Tracker-wide `draft`

```json
{
  "label": "Roadmap (internal)",
  "draft": true,
  "fields": { … }
}
```

- **In dev**: tracker loads normally, every issue visible.
- **In prod**: loader returns `{ vocabulary, rootDraft: true, issues: [] }`. The tracker's URL shows an empty index; individual issue URLs 404.

Use for trackers that are **never meant for public view** (internal roadmaps, draft trackers being staged). For per-issue dev-only, use `"draft": true` in an individual issue's `settings.json` instead. See [Drafts](/user-guide/writing-content/drafts) and [Dev Mode](/user-guide/configuration/dev-mode).

## See also

- [Per-Issue Settings](./per-issue) — what each issue fills in based on this vocabulary
- [List View](../ui/list-view) — how filters + preset views render
- [Setup a new tracker](../setup-new-tracker) — designing a new vocabulary from scratch
