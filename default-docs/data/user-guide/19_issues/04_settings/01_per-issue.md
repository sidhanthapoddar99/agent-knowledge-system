---
title: Per-Issue Settings
description: The settings.json schema for a single issue — fields, types, examples
sidebar_position: 1
---

# Per-Issue Settings

Every issue folder has a `settings.json` at its root. It holds the metadata — status, priority, labels, authors. The body (`issue.md`) stays pure prose; metadata lives here so the editor UI can render a structured form instead of parsing frontmatter.

## Minimal example

```json
{
  "title": "Editor V2 — Performance Optimizations",
  "description": "Outstanding performance wins in the live editor.",
  "status": "open",
  "priority": "medium",
  "component": ["live-editor"],
  "labels": ["performance"],
  "author": "sidhantha",
  "assignees": ["sidhantha"]
}
```

## Full schema

| Field | Type | Required | Notes |
|---|---|:---:|---|
| `title` | string | ✅ | Shown on list + detail views |
| `description` | string | — | Shown under the title on list + detail |
| `status` | enum | ✅ | Single value from `fields.status.values` in the tracker root |
| `priority` | enum | ✅ | Single value from `fields.priority.values` |
| `component` | string[] | ✅ | Multi-select from `fields.component.values`. Convention is one entry; multiple is allowed for genuinely cross-cutting work. A bare string (`"x"`) is accepted and normalised to `["x"]` |
| `labels` | string[] | ✅ | Multi-select from `fields.labels.values` — any subset |
| `author` | string | ✅ | The person who filed it. From `authors[]` in the tracker root |
| `assignees` | string[] | ✅ | From `authors[]`. Empty array is fine |
| `draft` | bool | — | `true` → issue hidden in prod builds (see [Drafts](/user-guide/writing-content/drafts)) |

All enum fields are validated at load time against the tracker's root `settings.json` vocabulary. An unknown value produces a warning (visible in the error-logger dev-toolbar app); the issue still loads, but the value may not render cleanly.

## Fields that are NOT stored

| Concept | Where it comes from |
|---|---|
| **`id`** | Derived from the folder name — `YYYY-MM-DD-<slug>`. The filesystem is the source of truth. |
| **`created`** | The `YYYY-MM-DD` prefix of the folder name. |
| **`updated`** | Most recent git commit date touching any file under the issue folder (author date, ISO 8601). Falls back to `created` when no git history exists. |
| **Subtask counts** | Read from the `subtasks/` folder on load. |

One source of truth per fact. The folder carries identity and creation date; git carries the recency signal; nothing duplicates them into `settings.json`.

## Field semantics

### `status` · `priority`

Single-select. Each picks exactly one value from the corresponding enum. Colors (optional) come from the tracker root — the UI uses them to render badges.

### `component`

Multi-select, but the convention is **one component per issue**. Cross-cutting work that genuinely touches several components (a refactor that hits loaders + layouts + plugin scripts) can list more than one. When tempted to list two, ask "should this be two issues instead?" — usually the answer is yes.

```json
"component": ["live-editor"]
```

Backward-compatible: `"component": "live-editor"` is still accepted and normalised to `["live-editor"]` at load time. Empty array (`[]`) is fine — the issue just won't appear in any component group. The validator emits an info-level hint when an issue declares more than one component, never an error.

### `labels`

Multi-select. Use labels for anything orthogonal to status — `wip`, `blocked`, `bug`, `feature`, `refactor`, `docs`, `idea`, etc. You can stack any number.

Labels carry the categorical signal — `bug`, `feature`, `refactor`, `docs`, etc. — alongside the orthogonal flags. Real work is usually composite (a perf fix is `bug + performance + refactor`), so multi-select beats a single primary category. See [Design Philosophy](../design-philosophy).

### `author` vs `assignees`

- **`author`** — who filed the issue. One person. Doesn't change.
- **`assignees`** — who's currently working on it. Zero or more. Can change as responsibility moves. Often same as `author` in solo projects.

#### `assignees` doubles as the "in-progress" signal

There's no separate `in_progress` boolean — and there shouldn't be. An issue with `assignees.length > 0` is being worked on; an empty `assignees` array means nobody has picked it up yet. Two sources of truth for the same fact would inevitably drift, so the framework derives the in-progress state from the array.

The filter bar exposes this as a two-tier picker:

- **Coarse** — pseudo-values `assigned` / `unassigned`. "Is anybody on this?" Use this for the broad "what's actively being worked on" view, or its inverse "what's idle, waiting for an owner."
- **Fine** — the specific names from the tracker root's `authors[]`. "What is X working on?"

Both modes compose the same way as every other filter — AND across fields, OR within a field. The same model holds at the CLI: `list.mjs --assignee unassigned` is the coarse filter; `list.mjs --assignee sid` is the fine filter; `list.mjs --assignee assigned,sid` ORs them.

### `draft`

Same flag used by docs and blogs (see [Drafts](/user-guide/writing-content/drafts)). Per-issue `"draft": true` hides the one issue in production while keeping it visible in dev. To hide a whole tracker, set `"draft": true` in the tracker's **root** `settings.json` (see [Vocabulary](./vocabulary)).

## Bigger example

```json
{
  "title": "Documentation update — phase 2",
  "description": "Rewrite user-guide around 4 content types; add issues / dev-mode / drafts coverage.",
  "status": "open",
  "priority": "high",
  "component": ["docs"],
  "labels": ["docs", "task", "wip"],
  "author": "sidhantha",
  "assignees": ["sidhantha", "claude"]
}
```

## Validation

Load-time validation covers:

- **Required fields present** — missing `title`, `status`, etc. produces a warning; the issue is skipped (won't appear in the index).
- **Enum values known** — unknown `status`, `priority`, `component[i]`, or `labels[i]` produces a warning but doesn't block the load.
- **`authors[]` membership** — `author` and each entry in `assignees` should be in the tracker-root `authors[]`. Extensible — new people can be added to the root list at any time.

Warnings surface in the **error-logger** dev-toolbar app. Builds succeed; the loader errs on the side of not crashing when metadata drift is the only problem.

### Schema-drift detection (validator script)

The plugin's tracker validator (`bun plugins/.../scripts/issues/check.mjs <tracker>`) also reports **unknown keys** — anything in a `settings.json` or markdown frontmatter that isn't part of the documented schema. Useful when upgrading the framework, when a recent cleanup may have left stale fields behind, or before merging a downstream consumer's tracker into a newer template.

Three flags shape the output:

- **`--quiet`** / **`--no-warnings`** — suppress all warnings; print only errors. For CI gates that care about hard failures only.
- **`--verbose`** — for each unknown-key warning, append the canonical key list inline so a reader knows what was expected without grepping.
- **`--strict`** — promote unknown-key warnings to **errors** (exit 1). Other warnings (component-count hint, AI-handoff hint, vocabulary-mismatch) stay as warnings even under strict — those are conventions, not contract violations. Strict targets schema drift specifically.

## See also

- [Vocabulary](./vocabulary) — the tracker-root `settings.json` that defines enum values and colors
- [Folder Structure](../folder-structure) — where this file sits
- [Drafts](/user-guide/writing-content/drafts) — the draft flag in the broader framework
