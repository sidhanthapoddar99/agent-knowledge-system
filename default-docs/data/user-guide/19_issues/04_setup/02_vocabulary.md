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
      "values": ["open", "review", "closed", "cancelled"],
      "colors": {
        "open":      "#888888",
        "review":    "#f0c674",
        "closed":    "#7ec699",
        "cancelled": "#666666"
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
        "wip",              // actively being worked on (transient — not a status)
        "blocked",          // waiting on another issue/decision inside this repo
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
    { "name": "Blocked",      "filters": { "labels": ["blocked", "blocked-external"] } },
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
| `status` | — | Lifecycle state (the 4-state review model) |
| `priority` | — | Urgency (low / medium / high / urgent) |
| `component` | ✅ | Which part of the codebase / product. Convention is one entry per issue; multi-component is allowed for cross-cutting work |
| `labels` | ✅ | Everything orthogonal — `wip`, `blocked`, `bug`, `feature`, `docs`, `idea`, … |

The vocabulary shape is the same for single- and multi-select fields — just `values: string[]` (and optional `colors`). Whether issues consume each value singly or as a list is up to per-issue `settings.json`.

`priority` + `status` are the ordering signals — see [Design Philosophy](../design-philosophy) for why no other dimensions are wired in.

### Status — the 4-state contract

```json
"status": {
  "values": ["open", "review", "closed", "cancelled"],
  "colors": {
    "open":      "#888888",
    "review":    "#f0c674",
    "closed":    "#7ec699",
    "cancelled": "#666666"
  }
}
```

**These exact four values are required.** The layout's state-tabs, the Review tab's subtask-debt promotion, and the agent-log review handoff all assume `open / review / closed / cancelled`. Renaming them will break the UI.

If you need finer-grained intermediate states (`in-progress`, `blocked`, `needs-design`), use **labels**, not statuses. See [Design Philosophy](../design-philosophy).

#### Why it's a contract, not a vocabulary

`status` looks like every other enum in `fields` — `values` array, optional `colors` map — but it isn't truly vocabulary-driven. The other enums (`priority`, `component`, `labels`) are read at runtime: add a new value to `settings.json` and it shows up in filters, groupings, and chips with no code change. `status` is **special-cased** end-to-end.

Here's what *is* vs. *isn't* driven by the vocabulary:

| Concern | Source |
|---|---|
| State **names** (`open` / `review` / `closed` / `cancelled`) | Hardcoded in TS + Astro |
| State **colors** | ✅ Vocabulary (`fields.status.colors`) |
| State **tabs** in the index view | Hardcoded as a static array |
| State **icons** + cycle order on subtasks | Hardcoded |
| **Subtask** states | Same hardcoded set — issue and subtask share one literal union |
| Filter / progress-bar segments | Hardcoded (4 segments) |
| Subtask-debt promotion (open issue → Review tab if any subtask is `review`) | Keyed off the literal string `'review'` |
| `priority` ordering | ✅ Vocabulary (`fields.priority.values`) — drives default index sort |

**Bottom line:** the colors are tweakable from `settings.json`. The names, the count, and the order are not.

#### Adding a 5th state (`blocked`, `deferred`, …)

Possible, but it's a code change in **7 files**, not a config change. Edit:

| File | What to change |
|---|---|
| `src/loaders/issues.ts` | State validation in the frontmatter parse — extend the literal `===` check |
| `src/layouts/issues/default/scripts/detail/types.ts` | `SubtaskState` union and `CYCLE` array |
| `src/layouts/issues/default/scripts/index/types.ts` | `StateTab` union and `CLOSED_STATUSES` if the new state is terminal |
| `src/layouts/issues/default/parts/index/StateTabs.astro` | Add a 5th `<button>` for the new tab |
| `src/layouts/issues/default/parts/detail/Comprehensive.astro` | Add a 5th `data-comprehensive-tab` button |
| `src/layouts/issues/default/server/state-icon.ts` | Add a `case` in the switch (icon SVG + `aria-label`) |
| `src/dev-tools/server/middleware.ts` | Add the new value to the `VALID` set in the subtask-toggle handler |
| `src/layouts/issues/default/scripts/detail/subtask-state.ts` | Update the regex that strips state class names from DOM |

The changes are mechanical (no algorithmic shift), but they touch enough surfaces that a future "make `status` truly vocabulary-driven" refactor would be a worthwhile cleanup. Until then, treat the 4 states as a **schema constraint** — and use **labels** for any extra dimensions you'd otherwise reach for a new state to express.

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
