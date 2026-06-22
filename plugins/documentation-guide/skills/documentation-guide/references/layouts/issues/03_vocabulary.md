# Tracker vocabulary (`<tracker-base>/settings.json`)

The tracker-root `settings.json` defines the enum values every issue draws from:

```json
{
  "label": "Todo",
  "fields": {
    "status":    { "values": ["open", "review", "closed", "cancelled"], "colors": {...} },
    "priority":  { "values": ["low", "medium", "high", "urgent"],       "colors": {...} },
    "component": { "values": ["live-editor", "integrations", ...] },
    "labels":    { "values": ["wip", "blocked", "feature", "bug", ...] }
  },
  "authors": ["sidhantha", "claude"],
  "views": [ ... preset views ... ]
}
```

When creating an issue, **all enum values must come from this vocabulary**. To add a new value, edit the tracker `settings.json` first, then use it.

## Three vocabulary layers

1. **Tracker-wide** — root `settings.json` (above)
2. **Per-issue** — values picked from the tracker vocabulary (see [02_settings.md](02_settings.md))
3. **Per-subtask** — `state` field uses the same 4-state vocabulary as `status`, but tracked independently per subtask (see [23_subtasks.md](23_subtasks.md))

## Don't add scheduling / milestone fields

This tracker treats scheduling, release-buckets, and single-type fields as project-management primitives that rot under continuous AI-driven shipping. **Don't add them to the vocabulary without an explicit policy reversal** — if a future change makes one genuinely useful, that's a deliberate decision, not an oversight. Transient state (actively-working-on, stuck) belongs in `labels`, not a new field.
