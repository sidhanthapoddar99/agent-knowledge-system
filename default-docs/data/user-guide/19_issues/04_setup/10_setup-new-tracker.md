---
title: Setup a New Tracker
description: Spinning up a fresh issues tracker — data folder, vocabulary, site.yaml mount, path alias
sidebar_position: 10
---

# Setup a New Tracker

Multiple trackers can coexist — `todo/` for engineering tasks, `bugs/` for customer-reported bugs, `roadmap/` for public plans. Each is a separate folder under your `data/` directory with its own vocabulary, mounted at its own URL.

This page walks the setup of a new tracker from scratch. For most projects, the default `todo/` tracker is enough — only follow this if you genuinely need a second one.

## 1. Create the data folder

```bash
mkdir -p data/bugs/
```

Pick a folder name that matches the tracker's purpose — `todo`, `bugs`, `roadmap`, `ideas`, etc. This name becomes part of the default URL.

## 2. Write the root `settings.json`

This is the tracker's vocabulary. Every issue in this tracker must use these enum values.

Minimum viable:

```json
{
  "label": "Bugs",
  "fields": {
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
    },
    "priority": {
      "values": ["low", "medium", "high", "urgent"]
    },
    "component": {
      "values": ["frontend", "backend", "infra"]
    },
    "labels": {
      "values": ["reproduced", "needs-repro", "regression", "enhancement"]
    }
  },
  "authors": ["sidhantha"]
}
```

### Rules

- **The seven statuses are fixed in framework code** — `open / blocked / in-progress / input-needed / review / done / dropped`. You may override their colors but not the set: listing `values` is documentation only (the loader ignores custom values and hard-errors on an unknown status). The UI's category tabs and review handoff depend on this fixed vocabulary.
- **Other fields are yours to design.** Pick values that match how you actually triage.
- **Colors are optional** but useful — they drive badge fills on the list view.
- **Don't over-specify up front.** It's easier to add values than to remove them once issues use them.

Full schema: [Vocabulary](./settings/vocabulary).

### Designing the vocabulary

Some guidance:

| Field | Think of it as | Typical values |
|---|---|---|
| `priority` | "How urgent is this?" | `low / medium / high / urgent` — 4 levels is plenty |
| `component` | "Which part of the system?" | Match your team's mental model — `frontend / backend / infra`, or `auth / payments / profile`, etc. |
| `labels` | "Cross-cutting tags" | Status-adjacent flags (`wip`, `blocked`), type tags (`bug`, `feature`), quality (`good-first-issue`) |

Stick to the four enum fields above. The schema is intentionally narrow — `priority` + `status` are the ordering signals; `labels` carry composite categorical work; `updated` is derived from git. Don't add scheduling or release-bucket fields without an explicit policy reversal — they tend to rot under continuous AI-driven shipping. See [Design Philosophy](./design-philosophy).

### Preset views

Optional but useful. Add canned filter views to the tracker:

```json
"views": [
  { "name": "Critical",  "filters": { "priority": ["urgent", "high"] } },
  { "name": "Regressions", "filters": { "labels": ["regression"] } },
  { "name": "By component", "group": "component" }
]
```

See [Vocabulary — preset views](./settings/vocabulary#preset-views).

### Authors

List the people and agents who'll write comments, issues, and logs:

```json
"authors": ["sidhantha", "claude", "support-team"]
```

Extensible — add more when new people join.

## 3. Declare the path alias (optional)

If you want `@bugs/` as a path alias usable from layouts or site.yaml, add it in `site.yaml`:

```yaml
paths:
  bugs: "@data/bugs"
```

Not required — you can reference the folder directly with `@data/bugs`. The alias is a convenience.

## 4. Mount the tracker in `site.yaml`

Add a page entry under `pages:` declaring the URL, layout, and data path:

```yaml
# site.yaml
pages:
  bugs:
    base_url: "/bugs"
    type: issues
    layout_index: "@issues/default"
    layout_detail: "@issues/default"
    data: "@data/bugs"
```

| Field | Purpose |
|---|---|
| `base_url` | The URL the tracker renders at. Index = `/bugs`, detail = `/bugs/<YYYY-MM-DD-slug>` |
| `type: issues` | Routes through the issues layout system |
| `layout_index` | Layout for the index / list page |
| `layout_detail` | Layout for the single-issue page |
| `data` | Path alias resolving to the tracker's folder |

Full page-entry schema: [Page Configuration](/user-guide/configuration/site/page).

## 5. (Optional) Add to the navbar

If the tracker should show up in navigation:

```yaml
# navbar.yaml
items:
  - label: "Bugs"
    href: "/bugs"
```

See [Navbar Configuration](/user-guide/configuration/navbar).

## 6. Run dev and verify

```bash
./start dev
```

Navigate to the tracker's base URL (`/bugs`). You should see an empty list view — your vocabulary drives the filter dropdowns, and the fixed lifecycle categories drive the tabs across the top.

Create a test issue:

```bash
cd data/bugs/
mkdir 2026-04-21-test-issue
cat > 2026-04-21-test-issue/settings.json <<EOF
{
  "title": "Test issue",
  "description": "Validate the tracker is wired correctly",
  "status": "open",
  "priority": "low",
  "component": ["frontend"],
  "labels": [],
  "author": "sidhantha",
  "assignees": []
}
EOF

cat > 2026-04-21-test-issue/issue.md <<EOF
# Test issue

First issue in this tracker — just to verify the pipe is working.
EOF
```

Refresh `/bugs`. The issue should appear. Click through, check the detail page renders.

## 7. Hide while staging (optional)

If you're setting up a new tracker but don't want it visible in production yet:

```json
// data/bugs/settings.json
{
  "label": "Bugs",
  "draft": true,
  "fields": { … }
}
```

`"draft": true` at the **root** hides the whole tracker from production builds while keeping it visible in dev. Flip to `false` when ready to ship.

For per-issue draft behaviour (one specific issue hidden in prod, rest of tracker visible), use `"draft": true` in that issue's own `settings.json`. See [Drafts](/user-guide/writing-content/drafts).

## Multiple trackers — when and why

Most projects need exactly one tracker (`todo/`). Cases where two makes sense:

| Tracker | Purpose |
|---|---|
| `todo/` | Internal engineering queue — features, refactors, tasks |
| `bugs/` | Customer-reported bugs with reproduction steps |
| `roadmap/` | Public-facing roadmap — what's planned, what's shipping |
| `ideas/` | Idea parking lot — `draft: true` at root, never promoted to prod |

Each tracker has its own vocabulary. A bug tracker might have `labels: [reproduced, needs-repro, regression]` — semantically different from the engineering `labels: [wip, blocked, feature]`.

**Don't split unnecessarily.** If you can't articulate a reason the same vocabulary wouldn't serve both, keep them together.

## See also

- [Vocabulary](./settings/vocabulary) — full root `settings.json` schema
- [Page Configuration](/user-guide/configuration/site/page) — `site.yaml pages:` details
- [Navbar Configuration](/user-guide/configuration/navbar) — adding nav entries
- [Drafts](/user-guide/writing-content/drafts) — draft flag semantics at both levels
