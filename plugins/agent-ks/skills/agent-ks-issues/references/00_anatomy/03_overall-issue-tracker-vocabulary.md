# Tracker vocabulary (`<tracker-base>/settings.json` or `settings.jsonc`)

The tracker-root settings file defines the enum values every issue draws from:

```jsonc
{
  "label": "Todo",

  // NOTHING about status appears here. The 7 statuses / 4 categories are FIXED
  // in framework code, and their COLOURS are theme CSS variables. Both a
  // `fields.status` block and a `statusColors` map are hard errors.

  "fields": {
    "priority":  { "values": ["low", "medium", "high", "urgent"], "colors": {...} }, // descriptions optional
    "component": { "values": ["architecture", "components", "..."], "descriptions": {...} }, // descriptions REQUIRED
    "labels":    { "values": ["feature", "bug", "..."], "descriptions": {...} } // descriptions REQUIRED
  },
  "authors": ["sidhantha", "claude"],
  "views": [ "...preset views..." ]
}
```

When creating an issue, **all enum values must come from this vocabulary**. To add a new value to `component` / `labels` / `priority`, edit the tracker settings file first (add both the `values` entry **and**, for `component`/`labels`, its `descriptions` entry), then use it.

**`status` is the exception, and nothing about it is configurable here.** Its seven values are fixed in framework code, and its colours are theme CSS. An unknown status value is a hard error, not a new value.

| You want to… | Where |
|---|---|
| Change what the statuses **are** | Nowhere — fixed in `issue-status.ts`. Seven values, four categories |
| Change what a status **looks like** | Your theme's `color.css` — override `--status-<name>` |
| Anything in `settings.json` | **Neither.** `fields.status` and `statusColors` are both hard errors |

### Restyling the lifecycle

One CSS variable per status, in the theme. This is also the only place light and dark can differ, which the old JSON map could not express:

```css
:root               { --status-dropped: #dc2626; }
[data-theme="dark"] { --status-dropped: #ef4444; }
```

The seven tokens are `--status-open` · `--status-blocked` · `--status-in-progress` · `--status-input-needed` · `--status-review` · `--status-done` · `--status-dropped`, all listed under `required_variables.colors` in `theme.yaml`.

**A leftover `statusColors` map fails the build rather than being ignored.** That is deliberate: an override that silently stops applying shows up much later as *"the colours look wrong somehow"*, with nothing pointing at the cause. Run `migration/0.1.3_status-colors-to-css.py` — it reports any non-default colour it removes so you can re-declare it in CSS. The same goes for an old `fields.status` block; run the migration chain per the `agent-ks-docs` skill's `doc-migration.md` rather than hand-editing.

## Prefer `settings.jsonc` for the root vocabulary — annotate the meanings

Any `settings.json` in the project (tracker root, per-issue, or docs folders) may instead be authored as **`settings.jsonc`** — JSON with `//` line comments, `/* */` block comments, and trailing commas. Both the framework loaders and the `agent-ks` toolkit read either; **when both files exist for the same folder, `.jsonc` wins.**

**Each `component` and `labels` value needs a description — a required, parallel `descriptions` map** (`"<value>": "<meaning>"`, one entry per value). A missing description is a **hard error** at startup and fails `agent-ks check issues`; `priority` descriptions are optional. These glosses are the single best signal for humans *and* AI agents deciding where a new issue belongs, they keep `component` from drifting into a junk drawer, and they render verbatim in the tracker's **Guide** modal (the **Guide** button beside the table/card toggle on the index). `component` is a **layer-of-the-stack** axis — tag by center of gravity, exactly one per issue. Example:

```jsonc
"component": {
  "values": [
    "architecture",
    "loaders-and-renderers",
    "components",
    "layout-general",
    "layout-issues",
    "editor",
    "ai-plugin-and-docs"
  ],
  "descriptions": {
    "architecture":          "Engine/infra under everything: refactors, plugin system, runtime, dev-toolbar.",
    "loaders-and-renderers": "The content pipeline: loading, link resolution, caching, render-to-frontend.",
    "components":            "Markdown-rendered elements (code blocks, diagrams, graph, wikilinks) + supplemental tools.",
    "layout-general":        "Building presentation: layouts (docs/blog/new types) + themes.",
    "layout-issues":         "The issue-tracker presentation specifically.",
    "editor":                "The live CodeMirror+Yjs editing app (core, sync/presence, view modes, server).",
    "ai-plugin-and-docs":    "The meta-project: the Claude Code plugin/skills + prose docs."
  }
}
```

Keep the descriptions accurate as the taxonomy evolves — a stale gloss is worse than none. To backfill them on an older tracker, run the repo-root `migration/` chain — its detect passes find every missing description. **Prefer `.jsonc` for the root** so you can still annotate structure/rationale with comments; `settings.jsonc` is a strict superset of JSON, so a plain `.json` file is valid too — the meanings live in the `descriptions` data either way.

## Four vocabulary layers

1. **Tracker-wide** — root `settings.json` (above)
2. **Per-issue** — values picked from the tracker vocabulary (see [02_per-issue-settings.md](02_per-issue-settings.md))
3. **Per-subtask** — the `status` field uses the same seven-status vocabulary as issue `status` (one shared field name), tracked independently per subtask (see [23_subtasks.md](../20_sections/23_subtasks.md))
4. **Per-plan-stage, per-agent-log, per-iteration-file** — the same seven, with agent
   logs and iteration files using the five that mean something for a run (see
   [28_plans.md](../20_sections/28_plans.md), [24_agent-logs.md](../20_sections/24_agent-logs.md))

## Don't add scheduling or release-bucket fields

This tracker treats scheduling, release-buckets and single-type fields as
project-management primitives that rot under continuous AI-driven shipping. **Don't add
them to the vocabulary without an explicit policy reversal.**

**Execution state is a status, never a label** — `in-progress`, `blocked` and
`input-needed` carry it. **Order is a plan**, never a field
([28_plans.md](../20_sections/28_plans.md)).
