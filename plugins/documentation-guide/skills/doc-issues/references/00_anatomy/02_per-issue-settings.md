# Properties of an issue (`<issue>/settings.json`)

Per-issue metadata. Values are drawn from the tracker vocabulary (see [03_overall-issue-tracker-vocabulary.md](03_overall-issue-tracker-vocabulary.md)).

```json
{
  "title": "Human-readable issue title",
  "description": "1-3 sentence summary",
  "status": "open",
  "priority": "medium",
  "component": ["live-editor"],
  "labels": ["feature", "wip"],
  "author": "sidhantha",
  "assignees": []
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Display label |
| `description` | string | optional | Short summary; longer detail goes in `issue.md` |
| `status` | enum | ✅ | One of the 7 fixed lifecycle statuses / 4 categories (see [00_overview.md](00_overview.md)) |
| `priority` | enum | ✅ | From tracker vocabulary (`fields.priority.values`) |
| `component` | **string[]** | ✅ | Multi-select; values from `fields.component.values`. Convention: prefer one |
| `labels` | string[] | ✅ | Multi-select; values from `fields.labels.values` (often `[]`) |
| `author` | string | ✅ | Must be in tracker `authors` list |
| `assignees` | string[] | ✅ | Often `[]`; otherwise members of `authors` |
| `agentLogKinds` | object | optional | Custom agent-log kind codes — `{ "ex": { "name": "experiment", "icon": "flask" } }` or shorthand `"hf": "hotfix"`. Adds to / overrides the 5 framework defaults (see [24_agent-logs.md](../20_sections/24_agent-logs.md)) |
| `draft` | boolean | optional | If `true`, hidden from the tracker UI |

## Derived vs stored

**Dates are derived, not stored.** `created` is parsed from the folder slug (`YYYY-MM-DD-<slug>`); `updated` is the most-recent git commit date touching any file under the issue folder. Do **not** write `updated` into `settings.json` — the loader ignores it and the field rots.

**`null` / missing handling:** Missing `labels` / `assignees` → treat as `[]`. Missing `component` → treat as `[]` and surface as a validation issue (it's required).

## Assignees — who's on it (not a status)

`assignees` records who is currently responsible; it can change as responsibility
moves. It is **not** the in-progress signal — that's the explicit `in-progress` status.
(An earlier convention derived "in-progress" from `assignees.length > 0`; that policy was
reversed on 2026-07-02 and the derivation is gone from the code — being assigned no longer
implies work is underway.)

The tracker exposes assignees as a two-tier filter:

- **Coarse** — pseudo-values `assigned` / `unassigned` ("is anybody on it?")
- **Fine** — specific names from the tracker root's `authors[]` ("what is X working on?")

Both compose AND across fields, OR within a field — same as every other filter dimension.
