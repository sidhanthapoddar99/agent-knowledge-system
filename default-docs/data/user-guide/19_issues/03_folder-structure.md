---
title: Folder Structure
description: How a tracker is laid out on disk — folder-per-issue, six file types, URL shapes
sidebar_position: 3
---

# Folder Structure

Everything about an issue lives on disk. No database, no schema migrations. This page describes the exact layout.

## The tracker root

A tracker is a directory under `data/` with a root `settings.json`:

```
data/todo/              ← one tracker
├── settings.json                    ← tracker vocabulary (required)
├── 2026-04-19-docs-phase-2/         ← one issue
├── 2026-04-10-issues-layout/        ← another issue
└── 2025-06-25-dev-only-content/
```

You can have multiple trackers in one project — e.g. `data/bugs/`, `data/roadmap/`. Each is mounted under its own base URL in `site.yaml`. See [Setup a new tracker](./setup-new-tracker).

### Tracker root `settings.json`

Defines the vocabulary that every issue in the tracker must use — allowed status values, priorities, labels, colors, preset views, authors. Full schema in [Vocabulary](./settings/vocabulary).

## The issue folder

Each issue is a folder. The folder name **is** the issue's identity — no separate `id` field in metadata.

### Folder naming — mandated

```
YYYY-MM-DD-<slug>
```

- **`YYYY-MM-DD`** — creation date, immutable. Anchors the folder's identity.
- **`<slug>`** — lowercase kebab-case, must start with an alphanumeric character, otherwise `a-z0-9-`.
- Matches the blog-post convention — date prefix up front, slug after.

The loader's exact regex: `^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$`. Folders that don't match are silently skipped.

Examples:

| ✅ Valid | ❌ Invalid | Why |
|---|---|---|
| `2026-04-19-docs-phase-2` | `docs-phase-2` | No date prefix |
| `2025-06-25-dev-only-content` | `2025-6-25-foo` | Month/day must be 2 digits |
| `2026-04-10-issues-layout` | `2026-04-10--foo` | Slug must start with alphanumeric |
| | `2026-04-10-Foo` | Must be lowercase |

**Renaming a slug** is a git-tracked `mv` — the date prefix stays, the slug changes. Cross-issue links update through the planned phase-3 knowledge-graph rewrite (see `2026-04-19-knowledge-graph-and-wiki-links`).

### Per-issue folder contents

```
2026-04-19-docs-phase-2/
├── settings.json                    ← metadata (required)
├── issue.md                         ← body (required)
├── comments/                        ← thread, flat (optional)
│   ├── 001_2026-04-19_sidhantha.md
│   └── 002_2026-04-19_claude.md
├── subtasks/                        ← checklist items, up to 2 subfolder levels (optional)
│   ├── 01_issues-layout-docs.md
│   ├── 02_implementation/                    ← level-1 group (folder = label only)
│   │   ├── 01_backend.md
│   │   └── 02_polish/                        ← level-2 group
│   │       ├── 01_styles.md
│   │       └── 02_a11y.md
│   └── 03_editor-v2-docs.md
├── notes/                           ← supporting docs, up to 2 subfolder levels (optional)
│   ├── 01_proposed-file-structure.md          ← root-level note
│   ├── design/                                ← level-1 group
│   │   ├── api-shape.md
│   │   └── phase-1/                           ← level-2 subgroup
│   │       └── kickoff.md
│   └── research/
│       └── prior-art.md
└── agent-log/                       ← AI audit trail, up to 2 subfolder levels (optional)
    ├── 001_initial-triage.md                  ← root-level entry
    └── exploration/                           ← level-1 subgroup
        ├── 001_approach-a.md
        └── phase-1/                           ← level-2 subgroup
            ├── 001_kickoff.md
            └── 002_decisions.md
```

| Path | Required | Contents |
|---|---|---|
| `settings.json` | ✅ | All metadata — status, priority, labels, dates. See [Per-Issue Settings](./settings/per-issue). |
| `issue.md` | ✅ | The goal / pitch / context. Pure markdown, no frontmatter. See [issue.md](./sub-docs/issue-md). |
| `comments/` | — | One file per comment, named `NNN_YYYY-MM-DD_<author>.md`. Flat — no subfolders. See [Comments](./sub-docs/comments). |
| `subtasks/` | — | Atomic units of work with `NN_<slug>.md` naming, frontmatter-driven state. **Up to 2 levels of grouping subfolders** — folder = label only, leaves are first-class subtasks. See [Subtasks](./sub-docs/subtasks). |
| `notes/` | — | Supporting design docs. **Up to 2 levels of freeform subfolders.** See [Notes](./sub-docs/notes). |
| `agent-log/` | — | AI iteration records. **Up to 2 levels of freeform subfolders.** `NNN_` prefix on filenames is optional. See [Agent Log](./sub-docs/agent-log). |

### Subfolder rules (`subtasks/`, `notes/`, `agent-log/`)

`subtasks/`, `notes/`, and `agent-log/` accept up to **two levels of subfolders** for grouping. Folder and file names follow each type's existing conventions.

- Mix files and folders freely at the root and at level-1. Level-2 is files-only — folders found at depth 3 are warned and silently skipped.
- The same filename can appear in different folders (`notes/design/intro.md` and `notes/research/intro.md` coexist with distinct URLs).
- Subgroups render as collapsible nested sections in the detail-page sidebar; each level shows a count of descendants.
- If you find yourself reaching for a third level, that's usually a signal to split into a sibling group at level-1, or — if the content has outgrown a single issue — into a separate issue.

**Subtasks specifics:**
- The folder is a **grouping label only** — no body file. Every `.md` leaf is a first-class subtask with its own state, URL, and count. URL: `/<tracker>/<issue>/subtasks/<group>/<subgroup>/<slug>`.
- The `NNN_` prefix on the folder name preserves group ordering and is rendered in the sidebar.
- Folders may ship an optional `settings.json` with at minimum a `title` field — overrides the slug-derived label. Absent file → fall back to slug → human-label.

**Notes / agent-log specifics:**
- Folder + file names are freeform — no naming convention required.

`comments/` stays flat — it doesn't accept subfolders.

### Stray files warned, not crashed

Any `.md` file at the issue root other than `issue.md` produces a **warning** (visible in the error-logger dev-toolbar app). The loader doesn't fail the build, but the file won't be rendered anywhere — move it into `notes/`, `subtasks/`, or rename it to `issue.md`.

## URL shapes

| Route | Renders | Layout |
|---|---|---|
| `/<base>` | Index of all issues in the tracker | `IndexLayout.astro` |
| `/<base>/<YYYY-MM-DD-slug>` | One issue's detail page | `DetailLayout.astro` |

Where `<base>` comes from the `base_url` declared in `site.yaml`. See [Setup](./setup-new-tracker).

### Sub-doc URLs

Subtasks, notes, and agent-log entries currently render **inside** the issue's detail page (Comprehensive tab + sidebar-linked anchors). Separate URLs per sub-doc are planned — tracked in `2026-04-10-issues-layout/subtasks/17_subdoc-separate-urls.md`. Today's behaviour:

- Detail page has two tabs: **Overview** (issue.md + comments + subtask summary) and **Comprehensive** (all subtask bodies concatenated with heading-id prefixing to prevent anchor collisions)
- Left sidebar links jump to anchors within the Comprehensive view
- Each sub-doc gets its own anchor (`#subtask-01-foo`, `#note-design`, `#agentlog-001`)

Full detail-page tour in [Detail View](./ui/detail-view).

## Draft flag at two levels

The standard `draft: true` filter (see [Drafts](/user-guide/writing-content/drafts)) applies in two ways for issues:

| Scope | Where | Effect in production |
|---|---|---|
| **One issue** | `"draft": true` in `<issue-folder>/settings.json` | That issue disappears from index + its URL 404s |
| **Whole tracker** | `"draft": true` in `<tracker-root>/settings.json` | Entire tracker is empty — useful while staging a new tracker before going live |

Both visible in dev, hidden in prod. See [Drafts](/user-guide/writing-content/drafts) for the broader semantics.

## See also

- [Per-Issue Settings](./settings/per-issue) — what `settings.json` holds
- [Vocabulary](./settings/vocabulary) — the tracker-root `settings.json`
- [Sub-Documents](./sub-docs/issue-md) — each file type's format
- [Setup a new tracker](./setup-new-tracker) — site.yaml wiring
