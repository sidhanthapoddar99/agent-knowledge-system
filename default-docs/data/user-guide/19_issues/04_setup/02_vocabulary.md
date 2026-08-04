---
title: Vocabulary
description: The tracker-root settings.json / settings.jsonc — enums, colors, preset views, authors, tracker-wide draft
sidebar_position: 2
---

# Vocabulary

Every tracker has a root `settings.json` that defines its **vocabulary** — the allowed values for every enum field, the colors used to render them, the authors known to the tracker, any pre-canned filter views, and (optionally) a flag that hides the whole tracker from production.

Per-issue `settings.json` files are validated against this root. Rename a value here, and every issue using it either migrates or starts warning.

## JSON or JSONC — annotate the meanings

The settings file may be plain `settings.json` **or** `settings.jsonc` — JSON that also allows `//` line comments, `/* */` block comments, and trailing commas. Both the framework loaders and the `agent-ks` toolkit read either; when both files exist for the same folder, **`.jsonc` wins**. Since JSONC is a strict superset of JSON, a comment-free `.json` file is still perfectly valid — the win is the ability to annotate.

**For the root vocabulary, prefer `.jsonc` and annotate freely.** Each value's *meaning* now lives in a required `descriptions` map alongside `component` and `labels` (see [Value descriptions](#value-descriptions)) — that map is the controlled gloss every issue author and AI agent reads to decide where a new issue belongs, and it renders verbatim in the tracker's **Guide** modal. It keeps `component` from decaying into a junk drawer, so keep it accurate as the taxonomy changes. JSONC comments remain handy for rationale the descriptions don't cover.

## Example

```jsonc
{
  "label": "Todo",

  // NOTHING about status appears here. The seven statuses and their four
  // categories are FIXED in framework code, and their COLOURS are theme CSS
  // variables. Both a `fields.status` block and a `statusColors` map are hard
  // errors — see "Status colors" below.

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
        "bug", "feature", "task", "performance", "refactor",
        "docs", "idea", "duplicate", "good-first-issue", "discussion", "blocked-external"
      ],
      // REQUIRED — same rule as component: every value carries a description.
      "descriptions": {
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
    { "name": "Blocked",      "filters": { "labels": ["blocked"] } },
    { "name": "By component", "group": "component" }
  ]
}
```

## Top-level fields

| Field | Type | Required | Purpose |
|---|---|:---:|---|
| `label` | string | — | Human name for the tracker, shown in the sidebar + page header |
| `fields` | object | ✅ | Enum definitions for `priority`, `component`, `labels`. **Status is not defined here, and neither are its colours** — see [Status colors](#status-colors) |
| `authors` | string[] | — | Known authors — referenced by `author` / `assignees` in per-issue settings |
| `views` | array | — | Preset filter views (see [Preset views](#preset-views)) |
| `draft` | bool | — | `true` → entire tracker hidden in production |

## The `fields` object

Each key is a field name — `priority`, `component`, `labels`. (`status` is **not** a `fields` entry: it's fixed in framework code, and its colours are [theme CSS](#status-colors), not settings.) Each value has:

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
| `labels` | ✅ | Everything orthogonal to lifecycle — `bug`, `feature`, `docs`, `idea`, … Execution state is a **status**, never a label |

The vocabulary shape is the same for single- and multi-select fields — `values: string[]`, an optional (or, for `component` / `labels`, required) `descriptions` map, and optional `colors`. Whether issues consume each value singly or as a list is up to per-issue `settings.json`.

`priority` + `status` are the ordering signals — see [Design Philosophy](../02_design-philosophy.md) for why no other dimensions are wired in.

### Status colors

**Status colours are theme CSS, not settings.** Nothing about status is configurable in
this file — not the values, not the colours.

| You want to… | Where |
|---|---|
| Change what the statuses **are** | Nowhere. Fixed in framework code: seven values, four categories |
| Change what a status **looks like** | Your theme's `color.css` — override `--status-<name>` |
| Put either in `settings.json` | **Neither works.** `fields.status` and `statusColors` are both hard errors |

One variable per status, and this is the only place light and dark can differ:

```css
:root {
  --status-open: #6b7280;         --status-blocked: #c2410c;
  --status-in-progress: #2563eb;  --status-input-needed: #d97706;
  --status-review: #ca8a04;       --status-done: #16a34a;
  --status-dropped: #dc2626;
}

[data-theme="dark"] {
  --status-dropped: #e06c75;      /* brighter on a dark background */
}
```

Override only what you want to change — the rest inherit from the default theme. All
seven are listed under `required_variables.colors` in `theme.yaml`.

#### Why they moved out of `settings.json`

They used to live here as a `statusColors` map, and that had two problems CSS doesn't:

- **One value had to serve both colour modes.** The shipped hexes were dark-mode colours
  rendered unchanged on a light background, and JSON had nowhere to put a second value.
- **The palette got copied.** A second hand-written map inside the bundled Guide drifted
  from the real one and disagreed on two statuses.

**A leftover `statusColors` map now fails the build rather than being ignored.** An
override that silently stops applying surfaces weeks later as *"the colours look wrong
somehow"*, with nothing pointing at the cause. Run
`migration/0.2.0_status-colors-to-css.py` — it reports every non-default colour it removes
so you can re-declare it in CSS, and tells you to check the comments left behind.

The seven statuses group into four categories — **Not Started** (`open`, `blocked`) ·
**In Progress** (`in-progress`) · **Review** (`input-needed`, `review`) · **Closed**
(`done`, `dropped`). The UI filters by category; the status is the per-row badge. Full
meanings and transition conventions are in [Lifecycle and Review](./06_lifecycle-and-review.md).

**The status set is fixed in framework code — you cannot add, remove, or rename statuses
per tracker.** A `fields.status` block in the root settings is a **hard error** at
build/dev startup (and fails `agent-ks check issues`): a stray `values` list there would
read as authoritative and silently redefine the vocabulary, so the loader rejects it loudly
rather than ignoring it. An unknown status *value* on an issue is likewise a hard error, not
a silent default. Migrating an old `fields.status` block? Run
`migration/2026-07-03_root-settings-schema.py` — it detects the block and guides the rewrite.

#### Why status is fixed, and everything else isn't

The other enums (`priority`, `component`, `labels`) are true vocabulary — read at runtime:
add a value to `settings.json` and it shows up in filters, groupings, and chips with no
code change. `status` is different by design: it isn't declared in `fields` at all, and
nothing about it is per-tracker — the values are code, the colours are theme CSS.

| Concern | Source |
|---|---|
| Status **names** + **category grouping** | Fixed in framework code |
| Status **colors** | Theme CSS — override `--status-<name>` in `color.css` |
| Category **tabs** in the index view | Derived from the fixed categories |
| Status **icons** + cycle order on subtasks | Fixed in code |
| **Subtask** statuses | Same fixed set — issues and subtasks share one vocabulary and one field name (`status`) |
| Review-debt promotion (active issue → Review tab if any subtask is in the Review category) | Derived from the fixed category grouping |
| `priority` ordering | ✅ Vocabulary (`fields.priority.values`) — drives default index sort |

**Bottom line:** the colors are tweakable from `settings.json`; the names, the count,
the categories, and the order are not. This is deliberate — see
[Design Philosophy](../02_design-philosophy.md) for why an AI-operated tracker fixes its
lifecycle vocabulary rather than letting each project drift.

#### The single source of truth (for framework maintainers)

There is exactly one place the vocabulary lives: `astro-doc-code/src/loaders/issue-status.ts`
(statuses, categories, default colors, helpers). The loader, layouts, `guide.ts` panel,
and — mirrored on the JS side — the `agent-ks` CLI all consume it. A framework
maintainer changing the lifecycle edits that one constant (and its CLI mirror in
`_lib.mjs`); a tracker author never touches it. If you find yourself wanting a new status,
that's a framework-level decision, not a per-tracker config change.

### Value descriptions

`component` and `labels` each require a parallel `descriptions` map — one `"<value>": "<meaning>"` entry for **every** value in `values`. A missing description is a **hard error** at build/dev startup (and fails `agent-ks check issues`). An extra description for a value that isn't in `values` is silently ignored. `priority` descriptions are **optional**, and status carries its own fixed, built-in glosses (you don't write them).

```jsonc
"component": {
  "values": ["architecture", "editor"],
  "descriptions": {
    "architecture": "Engine/infra: refactors, plugin system, runtime, dev-toolbar.",
    "editor":       "The live CodeMirror+Yjs editing app."
  }
}
```

Why required: these glosses are the controlled definition every issue author and AI agent reads when deciding where a new issue belongs, and they render verbatim in the tracker's **Guide** modal (the **Guide** button beside the table/card toggle on the [list view](../07_ui/01_list-view.md)). Keeping them mandatory stops `component` from silently drifting into a junk drawer. To backfill descriptions on an older tracker, run `migration/2026-07-03_root-settings-schema.py`.

### Colors

Purely cosmetic — drive badge fills on the list view and anywhere chips render. Set them with a per-field `colors` map inside `fields.priority` / `component` / `labels`; omit it and those values render as neutral text. **Status is the exception and is not set here at all** — its colours are theme CSS variables ([above](#status-colors)). Per-value: only provide colors for values that need them.

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
| `filters` | `{ [field]: string[] }` | Field → values to include (OR within, AND across fields). Filterable fields: `priority`, `component`, `labels`, `assignees` — **not** `status`, which is filtered by the category tabs instead |
| `group` | string | Field to group the result list by (`component` or `priority`) |
| `search` | string | Pre-fills the free-text search box |
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

Use for trackers that are **never meant for public view** (internal roadmaps, draft trackers being staged). For per-issue dev-only, use `"draft": true` in an individual issue's `settings.json` instead. See [Drafts](../../15_writing-content/05_drafts.md) and [Dev Mode](../../10_configuration/06_dev-mode.md).

## See also

- [Per-Issue Settings](./01_per-issue.md) — what each issue fills in based on this vocabulary
- [List View](../07_ui/01_list-view.md) — how filters + preset views render
- [Setup a new tracker](./10_setup-new-tracker.md) — designing a new vocabulary from scratch
