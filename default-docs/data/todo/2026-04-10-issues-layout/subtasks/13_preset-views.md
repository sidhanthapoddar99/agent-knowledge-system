---
title: "Preset views defined in `settings.json`"
status: done
---

Define named view presets in the tracker's root `settings.json` so common scans ("phase-2 open work", "what's blocked", "my high-priority items") become one-click switches.

## Schema (settings.json)

```jsonc
{
  "views": [
    {
      "name": "Phase 2 — Open",
      "filters": { "milestone": ["phase-2"] },
      "state": "open",
      "group": "component",
      "search": ""
    },
    {
      "name": "Blocked",
      "filters": { "labels": ["blocked"] },
      "state": "open"
    }
  ]
}
```

A view can include any combination of: `state` tab, field `filters`, `search` term, `group` dimension, `sort` / `dir`.

## UI surfaces

To be decided — iterate later. Likely a "Saved views" dropdown next to the state tabs, or a horizontal preset strip above them. Worth considering whether presets should *replace* the hardcoded state tabs entirely (state tabs become defaults shipped in `settings.json`).

## Behaviour

- Selecting a preset writes its filters / state / group to URL params (everything stays shareable)
- Clearing returns to default view (open + no filters)
- Presets are read-only at first — editing in-app comes later

## Out of scope (for now)

- User-saved views (in addition to settings.json-defined ones) — could land in localStorage later
