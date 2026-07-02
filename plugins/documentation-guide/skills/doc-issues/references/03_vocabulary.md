# Tracker vocabulary (`<tracker-base>/settings.json` or `settings.jsonc`)

The tracker-root settings file defines the enum values every issue draws from:

```jsonc
{
  "label": "Todo",
  "fields": {
    // status is FIXED in framework code (7 statuses / 4 categories) — colors overridable, values are not
    "status":    { "values": ["open", "blocked", "in-progress", "input-needed", "review", "done", "dropped"], "colors": {...} },
    "priority":  { "values": ["low", "medium", "high", "urgent"],       "colors": {...} },
    "component": { "values": ["architecture", "components", ...] },
    "labels":    { "values": ["wip", "blocked", "feature", "bug", ...] } // wip/blocked labels DEPRECATED (superseded by statuses)
  },
  "authors": ["sidhantha", "claude"],
  "views": [ ... preset views ... ]
}
```

When creating an issue, **all enum values must come from this vocabulary**. To add a new value to `component` / `labels` / `priority`, edit the tracker settings file first, then use it. **`status` is the exception:** its seven values are fixed in framework code and cannot be extended per-tracker (you may override the colors) — an unknown status is a hard error, not a new value.

## Prefer `settings.jsonc` for the root vocabulary — annotate the meanings

Any `settings.json` in the project (tracker root, per-issue, or docs folders) may instead be authored as **`settings.jsonc`** — JSON with `//` line comments, `/* */` block comments, and trailing commas. Both the framework loaders and the `docs-guide` toolkit read either; **when both files exist for the same folder, `.jsonc` wins.**

**For the tracker-root vocabulary, use `.jsonc` and comment what each `component` and `label` means.** The vocabulary is the controlled list every issue picks from — a one-line gloss per value is the single best signal for humans *and* AI agents deciding where a new issue belongs, and it keeps `component` from drifting into a junk drawer. `component` is a **layer-of-the-stack** axis — tag by center of gravity, exactly one per issue. Example:

```jsonc
"component": {
  "values": [
    "architecture",          // engine/infra under everything: refactors, plugin system, runtime, dev-toolbar
    "loaders-and-renderers", // the content pipeline: loading, link resolution, caching, render-to-frontend
    "components",            // markdown-rendered elements (code blocks, diagrams, graph, wikilinks) + supplemental tools
    "layout-general",        // building presentation: layouts (docs/blog/new types) + themes
    "layout-issues",         // the issue-tracker presentation specifically
    "editor",                // the live CodeMirror+Yjs editing app (core, sync/presence, view modes, server)
    "ai-plugin-and-docs"     // the meta-project: the Claude Code plugin/skills + prose docs
  ]
}
```

Keep the comments accurate as the taxonomy evolves — a stale gloss is worse than none. **`settings.jsonc` is a strict superset of JSON**, so a plain `.json` file with no comments is still valid; the win is purely the ability to annotate.

## Three vocabulary layers

1. **Tracker-wide** — root `settings.json` (above)
2. **Per-issue** — values picked from the tracker vocabulary (see [02_settings.md](02_settings.md))
3. **Per-subtask** — the `status` field uses the same seven-status vocabulary as issue `status` (one shared field name), tracked independently per subtask (see [23_subtasks.md](23_subtasks.md))

## Don't add scheduling / milestone fields

This tracker treats scheduling, release-buckets, and single-type fields as project-management primitives that rot under continuous AI-driven shipping. **Don't add them to the vocabulary without an explicit policy reversal** — if a future change makes one genuinely useful, that's a deliberate decision, not an oversight. (Progress and blocking *were* label-only on this same reasoning, until a deliberate 2026-07-02 reversal promoted them to the `in-progress` and `blocked` statuses — the `wip`/`blocked` labels are now deprecated.)
