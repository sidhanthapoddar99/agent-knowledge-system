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

**For the root vocabulary, prefer `.jsonc` and annotate freely.** Each value's *meaning* now lives in a required `descriptions` map alongside `component` and `labels` (see [Value descriptions](#value-descriptions)) — that map is the controlled gloss every issue author and AI agent reads to decide where a new issue belongs, and it renders verbatim in the tracker's **Guide** modal. It keeps `component` from decaying into a junk drawer, so keep it accurate as the taxonomy changes. JSONC comments remain handy for rationale the descriptions don't cover.

## Example

```jsonc
{
  "label": "Todo",

  // Status COLORS only. The seven statuses and their four-category grouping are
  // FIXED in framework code — a tracker can't add/rename statuses and there is
  // deliberately no `values` list here. Keys must be a subset of the seven; omit
  // any you keep at the default. A `fields.status` block is a hard error.
  "statusColors": {
    "open":         "#888888",
    "blocked":      "#d1854f",
    "in-progress":  "#61afef",
    "input-needed": "#e8a54b",
    "review":       "#f0c674",
    "done":         "#7ec699",
    "dropped":      "#c678dd"
  },

  "fields": {
    "priority": {
      "values": ["low", "medium", "high", "urgent"],
      // `descriptions` optional for priority.
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
        "architecture",
        "loaders-and-renderers",
        "components",
        "layout-general",
        "layout-issues",
        "editor",
        "ai-plugin-and-docs"
      ],
      // REQUIRED — every component value needs a description (a missing one is a
      // hard error). Rendered verbatim in the tracker Guide modal.
      "descriptions": {
        "architecture":          "Engine/infra: refactors, plugin system, runtime, dev-toolbar.",
        "loaders-and-renderers": "Content pipeline: loading, link resolution, caching, render.",
        "components":            "Markdown-rendered elements (code blocks, diagrams, graph, wikilinks) + supplemental tools.",
        "layout-general":        "Building presentation: layouts (docs/blog/new types) + themes.",
        "layout-issues":         "The issue-tracker presentation specifically.",
        "editor":                "The live CodeMirror+Yjs editing app.",
        "ai-plugin-and-docs":    "The meta-project: Claude Code plugin/skills + prose docs."
      }
    },
    "labels": {
      "values": [
        "wip", "blocked", "bug", "feature", "task", "performance", "refactor",
        "docs", "idea", "duplicate", "good-first-issue", "discussion", "blocked-external"
      ],
      // REQUIRED — same rule as component: every value carries a description.
      "descriptions": {
        "wip":              "DEPRECATED — superseded by the `in-progress` status; kept for back-compat.",
        "blocked":          "DEPRECATED — superseded by the `blocked` status; kept for back-compat.",
        "bug":              "Behaves differently from intended.",
        "feature":          "Net-new capability.",
        "task":             "Concrete work that isn't a feature/bug.",
        "performance":      "Speed / memory / scaling.",
        "refactor":         "Restructuring, no behavior change.",
        "docs":             "Documentation/prose work (cross-cuts any component).",
        "idea":             "Speculative, not yet committed.",
        "duplicate":        "Superseded by another issue.",
        "good-first-issue": "Low-context entry point for newcomers.",
        "discussion":       "Open design conversation, decision unsettled.",
        "blocked-external": "Waiting on an upstream / third-party dependency."
      }
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
| `statusColors` | object | — | Per-status colour overrides for the fixed lifecycle — `{ "<status>": "<hex>" }`, keys a subset of the seven statuses. A **top-level** key, sibling of `fields` (not inside it). See [Status colors](#status-colors) |
| `fields` | object | ✅ | Enum definitions for `priority`, `component`, `labels`. **Status is not defined here** — it's fixed in code (only its colors are overridable, via `statusColors`) |
| `authors` | string[] | — | Known authors — referenced by `author` / `assignees` in per-issue settings |
| `views` | array | — | Preset filter views (see [Preset views](#preset-views)) |
| `draft` | bool | — | `true` → entire tracker hidden in production |

## The `fields` object

Each key is a field name — `priority`, `component`, `labels`. (`status` is **not** a `fields` entry: it's fixed in framework code, with colors overridden separately via the top-level [`statusColors`](#status-colors) map.) Each value has:

```ts
{
  values: string[]                    // allowed values
  descriptions?: { [value]: string }  // REQUIRED for component + labels; optional for priority
  colors?: { [value]: hex }           // optional, per value
}
```

### Required fields

The loader expects these three fields under `fields` at minimum. Adding more is possible but the built-in layout won't surface them. (Lifecycle `status` is the fourth field every issue carries, but it's fixed in code — see [Status colors](#status-colors) — not declared here.)

| Field | Multi-select? | Typically used for |
|---|:---:|---|
| `priority` | — | Urgency (low / medium / high / urgent) |
| `component` | ✅ | Which part of the codebase / product. Convention is one entry per issue; multi-component is allowed for cross-cutting work |
| `labels` | ✅ | Everything orthogonal — `wip`, `blocked`, `bug`, `feature`, `docs`, `idea`, … |

The vocabulary shape is the same for single- and multi-select fields — `values: string[]`, an optional (or, for `component` / `labels`, required) `descriptions` map, and optional `colors`. Whether issues consume each value singly or as a list is up to per-issue `settings.json`.

`priority` + `status` are the ordering signals — see [Design Philosophy](../design-philosophy) for why no other dimensions are wired in.

### Status colors

Statuses aren't declared under `fields` at all. The **only** per-tracker status
customization is colors, via a top-level `statusColors` map (a sibling of `fields`):

```json
"statusColors": {
  "open":         "#888888",
  "blocked":      "#d1854f",
  "in-progress":  "#61afef",
  "input-needed": "#e8a54b",
  "review":       "#f0c674",
  "done":         "#7ec699",
  "dropped":      "#c678dd"
}
```

Keys must be a **subset of the seven fixed statuses** — a color for an unknown status is a
hard error (it's a typo, not an override). Omit any status you're happy to leave at its
default; the map merges over the built-in defaults. There is deliberately **no `values`
field** for status.

The seven statuses group into four categories — **Not Started** (`open`, `blocked`) ·
**In Progress** (`in-progress`) · **Review** (`input-needed`, `review`) · **Closed**
(`done`, `dropped`). The UI filters by category; the status is the per-row badge. Full
meanings and transition conventions are in [Lifecycle and Review](./lifecycle-and-review).

**The status set is fixed in framework code — you cannot add, remove, or rename statuses
per tracker.** A `fields.status` block in the root settings is a **hard error** at
build/dev startup (and fails `docs-guide check issues`): a stray `values` list there would
read as authoritative and silently redefine the vocabulary, so the loader rejects it loudly
rather than ignoring it. An unknown status *value* on an issue is likewise a hard error, not
a silent default. Migrating an old `fields.status` block? Run
`migration/2026-07-03_status-colors-only.py` — it detects the block and guides the rewrite.

#### Why status is fixed, and everything else isn't

The other enums (`priority`, `component`, `labels`) are true vocabulary — read at runtime:
add a value to `settings.json` and it shows up in filters, groupings, and chips with no
code change. `status` is different by design: it isn't declared in `fields` at all, and
only its **colors** are overridable (via the top-level `statusColors` map).

| Concern | Source |
|---|---|
| Status **names** + **category grouping** | Fixed in framework code |
| Status **colors** | ✅ Top-level `statusColors` map overrides the code defaults (colors only) |
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

### Value descriptions

`component` and `labels` each require a parallel `descriptions` map — one `"<value>": "<meaning>"` entry for **every** value in `values`. A missing description is a **hard error** at build/dev startup (and fails `docs-guide check issues`); an extra description for a value that isn't in `values` is flagged too. `priority` descriptions are **optional**, and status carries its own fixed, built-in glosses (you don't write them).

```jsonc
"component": {
  "values": ["architecture", "editor"],
  "descriptions": {
    "architecture": "Engine/infra: refactors, plugin system, runtime, dev-toolbar.",
    "editor":       "The live CodeMirror+Yjs editing app."
  }
}
```

Why required: these glosses are the controlled definition every issue author and AI agent reads when deciding where a new issue belongs, and they render verbatim in the tracker's **Guide** modal (the **Guide** button beside the table/card toggle on the [list view](../ui/list-view)). Keeping them mandatory stops `component` from silently drifting into a junk drawer. To backfill descriptions on an older tracker, run `migration/2026-07-03_vocabulary-descriptions.py`.

### Colors

Purely cosmetic — drive badge fills on the list view and anywhere chips render. Two maps set them: a per-field `colors` map (inside `fields.priority` / `component` / `labels`) and, for the fixed lifecycle, the top-level `statusColors` map. Omit either and the UI falls back to the built-in defaults (status) or neutral text (other fields). Per-value — only provide colors for values that need them.

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
