# Tracker vocabulary (`<tracker-base>/settings.json` or `settings.jsonc`)

The tracker-root settings file defines the enum values every issue draws from:

```jsonc
{
  "label": "Todo",

  // Status COLORS only — the 7 statuses / 4 categories are FIXED in framework
  // code. No `values` here, and a `fields.status` block is a hard error. Keys
  // are a subset of the seven; omit any you keep at the default.
  "statusColors": { "review": "#f0c674", "done": "#7ec699", "...": "..." },

  "fields": {
    "priority":  { "values": ["low", "medium", "high", "urgent"], "colors": {...} }, // descriptions optional
    "component": { "values": ["architecture", "components", "..."], "descriptions": {...} }, // descriptions REQUIRED
    "labels":    { "values": ["wip", "blocked", "feature", "bug", "..."], "descriptions": {...} } // REQUIRED; wip/blocked DEPRECATED
  },
  "authors": ["sidhantha", "claude"],
  "views": [ "...preset views..." ]
}
```

When creating an issue, **all enum values must come from this vocabulary**. To add a new value to `component` / `labels` / `priority`, edit the tracker settings file first (add both the `values` entry **and**, for `component`/`labels`, its `descriptions` entry), then use it. **`status` is the exception:** its seven values are fixed in framework code and cannot be extended per-tracker — there is **no `fields.status` block** (adding one is a hard error at startup and fails `docs-guide check issues`), and the only override is colors, via a top-level `statusColors` map (keys a subset of the seven). An unknown status value is a hard error, not a new value. An old `fields.status` block is migration territory: the documentation-template's repo-root `migration/` scripts cover the reshape (and the required descriptions below) — run the migration chain per the `documentation-guide` skill's `doc-migration.md`, don't hand-edit.

## Prefer `settings.jsonc` for the root vocabulary — annotate the meanings

Any `settings.json` in the project (tracker root, per-issue, or docs folders) may instead be authored as **`settings.jsonc`** — JSON with `//` line comments, `/* */` block comments, and trailing commas. Both the framework loaders and the `docs-guide` toolkit read either; **when both files exist for the same folder, `.jsonc` wins.**

**Each `component` and `labels` value needs a description — a required, parallel `descriptions` map** (`"<value>": "<meaning>"`, one entry per value). A missing description is a **hard error** at startup and fails `docs-guide check issues`; `priority` descriptions are optional. These glosses are the single best signal for humans *and* AI agents deciding where a new issue belongs, they keep `component` from drifting into a junk drawer, and they render verbatim in the tracker's **Guide** modal (the **Guide** button beside the table/card toggle on the index). `component` is a **layer-of-the-stack** axis — tag by center of gravity, exactly one per issue. Example:

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

## Three vocabulary layers

1. **Tracker-wide** — root `settings.json` (above)
2. **Per-issue** — values picked from the tracker vocabulary (see [02_per-issue-settings.md](02_per-issue-settings.md))
3. **Per-subtask** — the `status` field uses the same seven-status vocabulary as issue `status` (one shared field name), tracked independently per subtask (see [23_subtasks.md](../20_sections/23_subtasks.md))

## Don't add scheduling / milestone fields

This tracker treats scheduling, release-buckets, and single-type fields as project-management primitives that rot under continuous AI-driven shipping. **Don't add them to the vocabulary without an explicit policy reversal** — if a future change makes one genuinely useful, that's a deliberate decision, not an oversight. (Progress and blocking *were* label-only on this same reasoning, until a deliberate 2026-07-02 reversal promoted them to the `in-progress` and `blocked` statuses — the `wip`/`blocked` labels are now deprecated.)
