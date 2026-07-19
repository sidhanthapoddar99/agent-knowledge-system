---
title: Folder Structure
description: How a tracker is laid out on disk — folder-per-issue, the content sections, URL shapes
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

Defines the vocabulary that every issue in the tracker must use — priorities, components, labels (with their descriptions), plus status colors, preset views, and authors. (The lifecycle statuses themselves are fixed in framework code, not defined here.) Full schema in [Vocabulary](./settings/vocabulary).

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
├── glossary.md                      ← per-issue glossary (optional)
├── comments/                        ← evolution log, flat (optional)
│   ├── 001_opened.md
│   └── 002_scope-narrowed.md
├── brainstorm/                      ← active deliberation, up to 5 levels (up to 3 recommended) (optional)
│   ├── 01_research_prior-art.md               ← NN_<kind>_<slug>.md — full-word kind, optional
│   └── 02_options/                            ← folder = one multi-file brainstorm
│       └── 01_explore_approach-a.md
├── notes/                           ← finalized output + references, up to 5 levels (up to 3 recommended) (optional)
│   ├── 01_decided-architecture.md
│   └── 02_reference/
│       └── 01_links.md
├── subtasks/                        ← the plan, up to 5 subfolder levels (up to 3 recommended) (optional)
│   ├── 01_setup.md
│   └── 02_implementation/                     ← group (folder = label only, shows done/total)
│       ├── 01_backend.md
│       └── 02_polish/                         ← level-2 group
│           └── 01_styles.md
├── agent-log/                       ← execution record (optional)
│   └── 010_lp_implement-x/                    ← activity folder: NNN_<code>_<name>/
│       ├── 00_goal.md                         ← pinned meta files
│       ├── 01_summary.md
│       └── 101_milestone.md                   ← MNN_ + iteration frontmatter → "#1"
└── agent-memory/                    ← AI working state (optional)
    ├── memory.md                              ← pinned index — read first
    └── gotchas.md                             ← topic files, edited in place
```

| Path | Required | Contents |
|---|---|---|
| `settings.json` | ✅ | All metadata — status, priority, labels, plus optional `agentLogKinds`. See [Per-Issue Settings](./settings/per-issue). |
| `issue.md` | ✅ | The goal / pitch / context. Pure markdown, no frontmatter. See [issue.md](./sub-docs/issue-md). |
| `glossary.md` | — | Per-issue glossary, rendered as-is on the **Glossary** panel (never generated). Suggested sections: *Colour legend* · *Key terms* · *Conventions*, scoped per section where meanings differ. |
| `comments/` | — | One file per comment — `NNN_<slug>.md` (author/date in frontmatter) or the strict `NNN_YYYY-MM-DD_<author>.md`. Flat — no subfolders. See [Comments](./sub-docs/comments). |
| `brainstorm/` | — | Active deliberation — the *process* of deciding. `NN_<kind>_<slug>.md` with optional full-word kinds; folder = one brainstorm. See [Brainstorm](./sub-docs/brainstorm). |
| `notes/` | — | Finalized output + durable references — the *product*. **Up to 5 levels (up to 3 recommended).** See [Notes](./sub-docs/notes). |
| `subtasks/` | — | The plan — atomic units of work with `NN_<slug>.md` naming and frontmatter state. **Up to 5 levels of grouping subfolders (up to 3 recommended)** — folder = label only (sidebar shows its **done/total**), leaves are first-class subtasks. See [Subtasks](./sub-docs/subtasks). |
| `agent-log/` | — | Execution record — `NNN_<code>_<name>/` **activity folders** (kind code in the name), pinned `0NN_` meta files + `MNN_` milestones inside. Flat files parse for backward compat only. See [Agent Log](./sub-docs/agent-log). |
| `agent-memory/` | — | AI-mutable working state — pinned `memory.md` index + topic files. See [Agent Memory](./sub-docs/agent-memory). |

### Subfolder rules (`subtasks/`, `notes/`, `brainstorm/`, `agent-memory/`, `agent-log/`)

All content sections except `comments/` accept nested subfolders up to 5 levels deep for grouping; the recommended convention is up to 3 levels — keep trees shallow. Folder and file names follow each type's conventions.

- Mix files and folders freely at every level that allows folders. Folders may nest up to 5 levels deep; a folder nested beyond level 5 is warned by the loader and ignored. Files may live at any level, and the recommended convention is up to 3 levels.
- The same filename can appear in different folders (`notes/design/intro.md` and `notes/research/intro.md` coexist with distinct URLs).
- Subgroups render as collapsible nested sections in the detail-page sidebar; each level shows a count of descendants.
- If you find yourself reaching past the recommended three levels, that's usually a signal to split into a sibling group at level 1, or — if the content has outgrown a single issue — into a separate issue. The hard cap is 5.

**Subtasks specifics:**
- The folder is a **grouping label only** — no body file. Every `.md` leaf is a first-class subtask with its own state, URL, and count. URL: `/<tracker>/<issue>/subtasks/<group>/<subgroup>/<slug>`.
- The `NNN_` prefix on the folder name preserves group ordering and is rendered in the sidebar.
- Folders may ship an optional `settings.json` with at minimum a `title` field — overrides the slug-derived label. Absent file → fall back to slug → human-label.

**Notes / brainstorm / agent-memory specifics:**
- Folder + file names are freeform; the `NN_` prefix is optional. Brainstorm files can carry a full-word kind (`NN_<kind>_<slug>.md`); agent-memory's `memory.md` pins first in the sidebar.

**Agent-log specifics:**
- The first level is **activity folders** `NNN_<code>_<name>/` — the 2-letter code is the kind (symbol in the sidebar; mapping via `agentLogKinds` in `settings.json`). Inside: `0NN_` meta files pin to the top (badge-less), `MNN_` milestones show `#<iteration>` tinted by `status`.

`comments/` stays flat — it doesn't accept subfolders.

### Stray files warned, not crashed

Any `.md` file at the issue root other than `issue.md` and `glossary.md` produces a **warning** (visible in the error-logger dev-toolbar app). The loader doesn't fail the build, but the file won't be rendered anywhere — move it into `notes/`, `subtasks/`, or rename it to `issue.md`.

## URL shapes

| Route | Renders | Layout |
|---|---|---|
| `/<base>` | Index of all issues in the tracker | `IndexLayout.astro` |
| `/<base>/<YYYY-MM-DD-slug>` | One issue's detail page | `DetailLayout.astro` |

Where `<base>` comes from the `base_url` declared in `site.yaml`. See [Setup](./setup-new-tracker).

### Sub-doc URLs

Every sub-doc has **its own page**:

| Sub-doc | URL |
|---|---|
| Subtask | `/<base>/<issue>/subtasks/<group>/<slug>` |
| Note | `/<base>/<issue>/notes/<group>/<name>` |
| Brainstorm | `/<base>/<issue>/brainstorm/<group>/<name>` |
| Agent-memory | `/<base>/<issue>/agent-memory/<name>` |
| Agent-log | `/<base>/<issue>/agent-log/<folder>/<file>` |

(Group segments only when nested.) The detail page itself is panel-based and hash-addressable: `#comments`, `#comprehensive`, `#guide` (and `#guide-<section>` deep links), `#glossary`. Full detail-page tour in [Detail View](./ui/detail-view).

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
