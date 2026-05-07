---
title: "TODO System — Restructure to Tag-Based Issues"
description: Replace the sprint/backlog/issues folder hierarchy with a flat, tag-driven issue tracker modeled as a new content type
sidebar_label: Issues Restructure
---

# TODO System — Restructure to Tag-Based Issues

**Type:** Refactor
**Priority:** Medium
**Component:** `src/layouts/issues/` (new first-class layout, on par with `docs/` and `blogs/`) + `src/parsers/content-types/issues.ts` + `dynamic_data/data/issues/`
**Status:** Design

> **Historical note (2026-05-07):** This design doc is the original tag-based-issues spec from 2026-04-10. Several of the field choices below — `type`, `milestone`, `due`, manually-maintained `updated` — were tried and removed in the 2026-05-07 cleanup. The current schema and rationale live in `02_design-philosophy-and-review-state.md` ("What we removed and why" section) and the user-guide pages under `default-docs/data/user-guide/19_issues/`. This file is preserved as the as-shipped record of the original thinking.

---

## Motivation

The current `todo/` tree mixes three orthogonal axes into folders:

- **When:** `01_sprints/`
- **What kind:** `02_backlog/01_bugs.md`, `02_feature-ideas.md`
- **Status:** `03_issues/01_open/`, `02_inprogress/`, `03_completed/`

Every item sits in exactly one folder, so classification fights itself — is a "bug idea" a bug, an idea, or a backlog item? The folders forced early commitment to a single axis and items ended up misfiled. Time to flatten.

## Target shape

### Top-level layout

```
dynamic_data/data/issues/
├── settings.json                              # vocabulary for all issue metadata
├── _index.json                                # generated: aggregated metadata for fast list view
├── 2026-04-17-editor-performance/
│   ├── settings.json                          # this issue's metadata + display
│   ├── issue.md                               # initial description
│   ├── comments/                              # one file per comment, ordered by filename
│   │   ├── 001_2026-04-17_sid.md
│   │   └── 002_2026-04-18_sid.md
│   └── assets/                                # diagrams, sketches (text-based — excalidraw JSON, etc.)
├── 2026-04-12-wysiwyg-mode/
│   ├── settings.json
│   ├── issue.md
│   └── comments/
├── 2026-04-05-canvas-rendering/
│   ├── settings.json
│   ├── issue.md
│   ├── design.md                              # supporting docs allowed alongside
│   ├── comments/
│   └── assets/
└── ...
```

Flat — one folder per issue, no nested status/phase folders. Everything filterable lives in `settings.json`.

### Folder naming — mandated

```
YYYY-MM-DD-<slug>
```

- Matches the blog post convention — creation date up front, slug after.
- Creation date is immutable; it anchors the folder identity.
- Slug is lowercase-kebab-case, short, describes the issue.
- **The folder name IS the issue ID.** No separate `id` field in `settings.json` — the filesystem is the source of truth.
- Cross-issue links reference the folder name (`[see](./2026-04-05-canvas-rendering/)`).
- Renaming a slug is a git-tracked move; the date prefix stays.

### Per-issue folder contents

| File | Purpose |
|---|---|
| `settings.json` | All metadata + display fields. **Required.** |
| `issue.md` | Initial description / pitch. **Required.** |
| `comments/` | Folder of comment files, one per comment, `NNN_YYYY-MM-DD_author.md`. **Optional.** |
| `*.md` | Supporting docs — design notes, references, sketches. **Optional.** |
| `assets/` | Text-based attachments — excalidraw JSON, diagram sources, reference files. **Optional.** |

Rationale for `settings.json` over frontmatter: the UI edits JSON directly, markdown stays pure prose, matches existing docs-folder convention, harder to break rendering with malformed YAML.

## When to use this (scope & positioning)

This is a **secondary, internal-first issue tracker** designed for small-to-medium projects — not a replacement for GitHub Issues or Linear on public-facing work. Position it the same way teams use `docs/adr/` or Fossil SCM's built-in tracker: the repo *is* the record.

### Best fit

- Internal / solo / small-team projects.
- Documentation-heavy workflows where issues and docs live next to each other.
- Text-first assets — excalidraw JSON, diagram sources, sketches, references.
- Projects that benefit from AI-readable history (Claude / agents can grep and reason over every issue natively — no API layer needed).
- Projects with a practical ceiling around **~100 issues** in active rotation at any time. Scales beyond that if discipline holds, but the list UI is designed for this range.
- Scenarios where offline access, git-tracked history, and self-contained backups are features not limitations.

### Poor fit

- Public-facing issue tracking where external contributors file bugs (they'd need repo write access).
- Heavy binary asset workflows — screenshots in every issue, video bug reports. Git is unhappy with that at scale.
- Cross-project boards spanning multiple repos.
- Large teams needing per-issue access control.

### Pros

- **AI-native** — every issue is a markdown file a tool can read. No API, no auth, no schema.
- **Zero infra** — no database, no hosting, no migrations, no downtime. A `git clone` is a full backup.
- **Offline-first** — works on planes and trains, syncs via normal git workflow.
- **Free history** — every status transition is a diff; `git blame` tells you who moved the card when.
- **Branch-scoped work** — WIP issues live on feature branches and merge with the work.
- **Editor already handles it** — the Yjs-backed live editor, the `settings.json` pattern, the live preview — all of it works for issues with no extra infra.
- **Forever format** — markdown outlives SQL schemas.

### Cons

- **Concurrent edits** — merge conflicts on simultaneous edits of the same issue across checkouts. Mitigated by the live editor's Yjs sync while the dev server is running, but cross-session / cross-branch edits still conflict.
- **Search at scale** — grep-speed, not indexed. Fine for ~100 issues, uncomfortable at 1,000+.
- **No per-issue access control** — anyone with repo access sees everything.
- **External contributions need repo access** — no "anyone can file a bug" flow.
- **Repo growth** — undisciplined asset use bloats clone/CI times for everyone.

### Future: best-of-both with GitHub Issues integration

The filesystem schema is explicitly designed so the same data could later sync with an external tracker:

- One-way mirror (git → GitHub Issues) via a CI job that `POST`s new/changed issues to the GitHub API using a mapping from `settings.json` fields to GitHub's label/milestone/assignee model.
- Two-way sync (GitHub ↔ git) via a webhook that writes GitHub comments back into `comments/NNN_*.md`.
- Either mode turns this into the primary internal record and GitHub into the public-facing front door — the opposite of the usual setup, and quite a pleasant one. Deferred until someone actually needs it.

## Schema

### Root `settings.json` — vocabulary

Defines allowed values for every enum field. The issue editor UI reads this to render dropdowns / filter chips and validates issue `settings.json` against it.

```json
{
  "label": "Issues",
  "fields": {
    "status": {
      "values": ["open", "in-progress", "blocked", "done", "cancelled", "archived"],
      "colors": {
        "open":        "#888888",
        "in-progress": "#f0c674",
        "blocked":     "#e06c75",
        "done":        "#7ec699",
        "cancelled":   "#666666",
        "archived":    "#444444"
      }
    },
    "priority": {
      "values": ["low", "medium", "high", "urgent"],
      "colors": {
        "low":    "#7aa2f7",
        "medium": "#f0c674",
        "high":   "#e5a663",
        "urgent": "#e06c75"
      }
    },
    "type": {
      "values": ["bug", "feature", "task", "performance", "refactor", "docs"]
    },
    "component": {
      "values": ["editor-v2", "layouts", "loaders", "dev-toolbar", "parsers", "infra", "docs"]
    },
    "milestone": {
      "values": ["v1", "v2", "v3", "unassigned"]
    },
    "labels": {
      "values": ["idea", "documentation", "duplicate", "good-first-issue", "discussion", "blocked-external"]
    }
  },
  "authors": ["sidhantha"]
}
```

**Field semantics:**

- `status`, `priority`, `type`, `component`, `milestone` — single value from enum.
- `labels` — multi-value from enum (cross-cutting tags).
- `authors` — known list, extensible.
- `"Due"` is **derived** (`due < today && status != done/cancelled/archived`), not stored.
- `"Overdue"` badge rendered by the UI, not a stored field.

### Per-issue `settings.json`

```json
{
  "title": "Editor V2 — Performance Optimizations",
  "description": "Outstanding performance wins in the live editor (CM6 + Yjs + middleware).",
  "status": "open",
  "priority": "medium",
  "type": "performance",
  "component": "editor-v2",
  "milestone": "v2",
  "labels": [],
  "author": "sidhantha",
  "assignees": ["sidhantha"],
  "updated": "2026-04-17",
  "due": null
}
```

- **No `id` field** — the folder name (`YYYY-MM-DD-<slug>`) is the canonical identity. Single source of truth, nothing to keep in sync.
- **No `created` field** — the date prefix on the folder name carries creation date. One source of truth per fact.
- `title` / `description` — shown on list view.
- All enum fields validated against root `settings.json` at load time.
- Dates as ISO `YYYY-MM-DD`. `due` is `null` if unset.
- `updated` auto-bumped by the editor on any settings or content change.

## Content conventions

### `issue.md`

Opens with the pitch — 1–3 paragraphs of context and goal. No metadata in frontmatter; all metadata lives in `settings.json`. Sub-sections as needed (Motivation, Proposal, Tradeoffs, Open questions).

### `comments/` — one file per comment

Each comment is its own markdown file under the issue's `comments/` folder, named:

```
NNN_YYYY-MM-DD_<author>.md
```

- `NNN` — zero-padded sequence number (`001`, `002`, …), enforces ordering independent of filesystem quirks.
- `YYYY-MM-DD` — date the comment was written.
- `<author>` — short author slug.

Example:

```
2026-04-17-editor-performance/comments/
├── 001_2026-04-17_sid.md
├── 002_2026-04-18_sid.md
└── 003_2026-04-19_claude.md
```

Each file is pure prose — no frontmatter needed; the filename carries the metadata. The UI concatenates them in filename order to render the thread.

Rationale: diffs stay clean (no single huge file changing with every comment), history is per-comment in git, AI agents can cite a specific comment by filename, and adding a comment is a new file rather than a surgical insertion into a shared document.

### Supporting docs

Anything named `*.md` that isn't `issue.md` or `comments.md` shows up as a sidebar list on the detail view (design notes, references, sketches). Authors pick the names.

### Assets

`assets/` holds **text-based** attachments by default — excalidraw JSON, mermaid sources, reference files, exported diagram definitions. Referenced from markdown with relative paths (`![diagram](./assets/flow.excalidraw)`).

Heavy binaries (screenshots, videos) should stay out. If a screenshot is essential, link to an external host rather than committing it. This keeps the repo light and preserves the ~100-issue / 10–15 MB budget indefinitely.

## Build-time behavior

### Reuse the existing `draft` flag — no new mechanism

The project already has a production-exclusion flag. In `src/loaders/data.ts:115`:

```ts
includeDrafts = !import.meta.env.PROD
```

Any content with `draft: true` is filtered out in production builds and kept in dev. Documented in `user-guide/15_content/03_docs/04_frontmatter.md`. Applies to regular docs today, and we extend the same contract to issues.

**Two ways a project can opt issues in or out of production:**

- **Per-issue:** set `"draft": true` in the issue's `settings.json`. That specific issue is dev-only.
- **Whole tracker:** set `"draft": true` in the root `issues/settings.json` (or in the `site.yaml` page config for the issues section). The entire tracker becomes dev-only.

Default posture for new projects: **whole tracker marked draft**, since the primary use case is internal tracking. Flip it off per-project or per-issue if a public-facing view is wanted (changelog, public roadmap). No bespoke "exclude from build" code to maintain — the loader already honours `draft`.

### Dev / editing / viewing mode

- On dev-server startup (and on file watcher events under `issues/`), a small indexer scans every issue folder, reads each `settings.json`, and writes an aggregated `issues/_index.json` containing just the fields the list view needs (title, description, status, priority, type, component, milestone, labels, updated, due, folder name).
- The list view loads `_index.json` once — no per-issue fetches for filtering / sorting. Detail view still loads `issue.md` + `comments/` on demand.
- The index lives in-memory in the dev server with mtime-based invalidation (same pattern as `cache-manager.ts`), and is also written to disk so a cold reload has instant filter UI.
- Even at 1,000 issues this scales linearly at a few hundred KB of JSON — filters / sorts are in-memory array operations, not filesystem walks.

### Why not always pre-build?

Pre-building on every edit keeps filter UI snappy and means editing one issue doesn't require re-reading every issue. The index is cheap (~100 KB at 100 issues) and rebuilt incrementally on file-watcher events.

## Claude / AI integration

This tracker is designed to be AI-readable, but unstructured access ("read the folder, figure it out") wastes context and is error-prone. We need a dedicated **Claude Code skill** for traversing, querying, and updating issues — plus a documentation section explaining how to use it.

### Skill: `/issues` (or similar)

A skill file at `.claude/skills/issues.md` (exact path TBD) that teaches Claude:

- **How to discover issues** — read `dynamic_data/data/issues/settings.json` for the vocabulary, then list issue folders.
- **How to filter efficiently** — use `_index.json` (if present) instead of reading every `settings.json` individually. Falls back to per-folder reads if the index is missing or stale.
- **How to read an issue** — always read `issue.md` first; read `comments/` only when context requires thread history; read `settings.json` for current state.
- **How to update an issue** — rewrite `settings.json` (the whole file, never partial) so enum validation stays intact; append new comments as new files `comments/NNN_YYYY-MM-DD_claude.md` with incremented sequence.
- **How to create an issue** — mint the folder name (`YYYY-MM-DD-<slug>`), write `settings.json` and `issue.md`, invoke the indexer.
- **How to cross-reference** — link to other issues by folder name using a stable internal URL scheme.
- **When NOT to use it** — skill should refuse to traverse in production builds where `issues/` is excluded; prompt the user to switch to dev mode.

### Documentation section

After this restructure ships, the documentation needs a new top-level section (likely under `user-guide/` and `dev-docs/`) covering:

- **User guide:** how the issue tracker works from the editor UI — creating an issue, filtering, commenting, moving through statuses.
- **Dev docs:** the filesystem contract (folder naming, `settings.json` schema, index generation, build behavior).
- **Skill docs:** how the `/issues` skill works, when to invoke it, what it reads and writes. Keep the skill file and the documentation in sync — if one changes, update the other.

**Plan-of-record:** do not ship the issues restructure without the skill and the documentation updates. The whole value proposition rests on Claude being able to reason over this tracker, and without the skill every interaction burns context re-discovering the format.

## UI — new first-class `issues` content type

**Not a `custom/` layout — a peer of `docs/` and `blogs/`.** Lives at `src/layouts/issues/default/`, follows the same conventions:

- Standard `Layout.astro` / `IndexLayout.astro` split (like `blogs/`).
- Its own entry in `src/parsers/content-types/issues.ts`.
- Its own glob in `src/pages/[...slug].astro` (`builtinIssuesIndexLayouts`, `builtinIssuesDetailLayouts`).
- Declared in `site.yaml` with `layout_index: "@issues/default"` and `layout_detail: "@issues/default"`.

Modeled on `blog` (index + detail), not `docs`.

### `/issues` — list view

- Filter chips across the top: `Status`, `Priority`, `Type`, `Component`, `Milestone`, `Labels`. Values driven by root `settings.json`.
- List rows: title, short description, status badge, priority badge, component, labels, assignees, updated date.
- Sort options: updated (default), created, priority, due.
- Optional "grouped by status" Kanban view later.
- Ideas surface via `labels: [idea]` filter — not a separate page, just a chip.

### `/issues/<id>` — detail view

- Left/main column: `issue.md` rendered, followed by `comments.md`.
- Right sidebar: all `settings.json` fields as editable badges. Save writes back to the file.
- Supporting docs listed under the sidebar as a linked list.
- Breadcrumb back to list, filters preserved.

### Live editor integration

The existing dev-toolbar editor already handles `settings.json` (folders in docs). Extend to open / edit per-issue `settings.json` via a richer form UI (dropdowns from vocabulary, date pickers) instead of raw JSON editing.

## Development phases

Development is split into **two distinct phases**. Do not interleave. Complete Phase 1 and sign off on it against a throwaway testbed before touching any real TODO content in Phase 2.

### Phase 1 — Build the layout + system against a testbed

1. **Create the first-class layout** at `src/layouts/issues/default/` (see [Implementation sketch](#implementation-sketch) below).
2. **Add `issues` as a content type** in `src/parsers/content-types/issues.ts` (settings.json-driven, not frontmatter).
3. **Register the layout** in `src/pages/[...slug].astro` (new globs + resolution branch).
4. **Create a testbed data folder** — `dynamic_data/data/issues-test/` with a root `settings.json` (vocabulary) and 3–5 hand-crafted sample issues covering the main status/type/priority combinations. This is throwaway data — it exists so the layout can be exercised without risking real TODO content.
5. **Declare the test section in `site.yaml`** — `pages.issues-test` pointing at `@data/issues-test` with base URL `/issues-test`.
6. **Build the indexer** — a dev-server-side process that scans `issues-test/` on startup and on file watcher events, writing `issues-test/_index.json`.
7. **Iterate on the list view** — filter chips, sort controls, URL-persisted state, visual design.
8. **Iterate on the detail view** — `issue.md` rendering, `comments/` thread, `settings.json` metadata panel, editing affordances.
9. **Build the Claude skill** for issue traversal (see the [Claude / AI integration](#claude--ai-integration) section).
10. **Write the user-guide and dev-docs sections** for the new content type.

Exit criteria for Phase 1: the layout works end-to-end against `issues-test/`, including creating / editing / commenting / filtering, and the skill can read and update issues.

### Phase 2 — Migrate real TODO content

Only after Phase 1 is signed off:

1. **Create the real data folder** at `dynamic_data/data/issues/` with its own root `settings.json`.
2. **Point `site.yaml` pages.issues** at `@data/issues` with base URL `/issues`.
3. **Migrate existing TODO items** — one folder per item, move content to `issue.md`, extract metadata to `settings.json`. Candidates:
   - `03_issues/01_open/01_wysiwyg-mode.md` → `issues/2026-xx-xx-wysiwyg-mode/`
   - `03_issues/01_open/02_excalidraw-integration.md` → `issues/2026-xx-xx-excalidraw-integration/`
   - `03_issues/01_open/03_canvas-rendering.md` → `issues/2026-xx-xx-canvas-rendering/`
   - `03_issues/01_open/04_editor-performance.md` → `issues/2026-04-17-editor-performance/`
   - `03_issues/01_open/05_issues-restructure.md` → `issues/2026-04-17-issues-restructure/` (this doc)
   - `02_backlog/01_bugs.md` → split each bug into its own folder, label `bug`
   - `02_backlog/02_feature-ideas.md` → split each into its own folder, label `idea`
   - `01_sprints/*` → extract items, set `milestone` from the sprint name, discard the sprint folder
   - `04_testing.md`, `01_overview.md` → keep as docs, not issues (they describe project state, not work items)
   - For historical items without known creation dates, use the earliest commit date touching that file (`git log --follow --diff-filter=A`).
4. **Delete `dynamic_data/data/docs/todo/`** once migration is verified.
5. **Delete `dynamic_data/data/issues-test/`** once real data is flowing and the layout is confirmed stable.

## Implementation sketch

Concrete guidance for the next session building this. Mirror the blog layout — it's the closest precedent (index + detail, flat folder, date prefix).

### `src/layouts/issues/default/` structure

```
src/layouts/issues/default/
├── index.ts                  # barrel export
├── IndexLayout.astro         # /issues — filterable list view
├── IndexBody.astro           # filter chips + results list + sort controls
├── IssueCard.astro           # single row in the list (title, badges, meta)
├── DetailLayout.astro        # /issues/<id> — single issue view
├── DetailBody.astro          # issue.md + comments/ rendered thread
├── MetaPanel.astro           # sidebar showing settings.json as badges
├── StatusBadge.astro         # shared: colored pill for status/priority/type
├── README.md                 # component contract for external layouts
└── styles.css                # scoped styles
```

**Why not reuse `blogs/default/` components directly?** Blogs are content-first (title + body). Issues are metadata-first (the sidebar badges and filter chips are load-bearing UI). Enough divergence to warrant a separate tree; steal patterns, not files.

### `src/parsers/content-types/issues.ts` — new parser

Model on `blog.ts` but with these differences:

- **Folder-per-item, not file-per-item.** Scan `dataPath` for directories matching `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$`.
- **Metadata source is `<folder>/settings.json`, not frontmatter.** Read and validate against root `settings.json` vocabulary.
- **Body is `<folder>/issue.md`.** Pure markdown, no frontmatter required (but tolerate if present for portability).
- **Comments are `<folder>/comments/NNN_*.md`.** Sorted by filename.
- **Supporting docs are `<folder>/*.md` excluding `issue.md`.** Surface as a list on the detail view.
- **Parse filename** extracts `{ date, slug }` from folder name — reuse blog's `parseFilename` shape.
- **Asset resolution** works like blog's (`[[diagram.excalidraw]]` → `<folder>/assets/diagram.excalidraw`).

### `src/pages/[...slug].astro` — routing additions

Mirror the blog pattern at `[...slug].astro:21-25`:

```ts
const builtinIssuesIndexLayouts = import.meta.glob('/src/layouts/issues/*/IndexLayout.astro');
const extIssuesIndexLayouts = import.meta.glob('@ext-layouts/issues/*/IndexLayout.astro');

const builtinIssuesDetailLayouts = import.meta.glob('/src/layouts/issues/*/DetailLayout.astro');
const extIssuesDetailLayouts = import.meta.glob('@ext-layouts/issues/*/DetailLayout.astro');
```

Merge them like the existing `blogIndexLayouts` / `blogPostLayouts`. Add an `issues` branch to the page-type resolver that loads index layout for the base URL and detail layout for `/<id>`.

### `site.yaml` — declaring the section

```yaml
paths:
  data: "./dynamic_data/data"

pages:
  issues:
    base_url: "/issues"
    data: "@data/issues"
    content_type: "issues"
    layout_index: "@issues/default"
    layout_detail: "@issues/default"
```

For Phase 1, declare `issues-test` with the same shape pointing at `@data/issues-test`. Both can coexist during Phase 1 and Phase 2 cutover.

### Alias additions

Add `@issues/` to the layout alias resolver (mirroring `@docs/`, `@blog/`, `@custom/`) in the config loader so `@issues/default` resolves to `src/layouts/issues/default/`.

### The indexer — where it lives

Runs in the **dev-toolbar integration** (`src/dev-toolbar/integration.ts`), alongside the editor store and presence manager. Pattern:

- On `configureServer`, scan each configured issues data path once, build `_index.json`.
- On Vite watcher `change`/`add`/`unlink` for any `settings.json` under an issues dir, rebuild the index incrementally (update just the affected entry).
- Written to disk at `<issues-dir>/_index.json` so cold reloads have instant filter UI.
- Use the existing `cache-manager.ts` for mtime-based invalidation.

**For production builds:** the index is regenerated at build time (from `astro:build:start` hook) if any issues section is not marked `draft: true`. Otherwise skipped entirely.

### `_index.json` schema

```json
{
  "generated": "2026-04-17T14:22:11.000Z",
  "issues": [
    {
      "id": "2026-04-17-editor-performance",
      "title": "Editor V2 — Performance Optimizations",
      "description": "Outstanding performance wins in the live editor.",
      "status": "open",
      "priority": "medium",
      "type": "performance",
      "component": "editor-v2",
      "milestone": "v2",
      "labels": [],
      "author": "sidhantha",
      "assignees": ["sidhantha"],
      "created": "2026-04-17",
      "updated": "2026-04-17",
      "due": null,
      "draft": false
    }
  ]
}
```

`created` is derived from the folder name prefix (not stored in `settings.json`).

### List-view UX spec

- **Filter chips:** one per enum field (`status`, `priority`, `type`, `component`, `milestone`, `labels`). Multi-select within a field is OR, across fields is AND.
- **URL state:** filters serialize to query params (`?status=open,in-progress&type=bug`). Shareable, back/forward navigable.
- **Sort:** default `updated desc`. Options: `updated`, `created`, `priority`, `due`. Sort control persists via query param too.
- **Empty states:** "No issues match these filters — clear filters" button.
- **Counts per chip:** show `(N)` next to each filter value representing matches under current other filters.
- **"New issue" button:** top-right. Opens a modal that creates the folder + boilerplate files and immediately opens in detail view.

### Detail-view UX spec

- **Header:** title, status badge, key metadata chips inline.
- **Main:** rendered `issue.md`, followed by `comments/` thread in chronological order, followed by list of supporting docs as links.
- **Sidebar (right, sticky):** all `settings.json` fields as editable dropdowns / date pickers / chip selectors. Save-on-change, debounced writes to `settings.json`.
- **"Add comment" input:** at the bottom of the thread. Submits as `comments/NNN_YYYY-MM-DD_<author>.md`.
- **Breadcrumb / back:** preserves list-view filter state when returning.

### Editor integration

The existing dev-toolbar editor already handles markdown files. Extensions needed:

- **Open `issue.md`:** existing flow.
- **Open `comments/NNN_*.md`:** same.
- **`settings.json` editing:** wire a richer form (not raw JSON) using the vocabulary in root `settings.json` for dropdown values. Validation against enum values.
- **Create issue:** a command that mints `<today>-<slug>/`, writes the boilerplate `settings.json` + empty `issue.md`, then opens it.

## Tradeoffs / decisions made

- **Folder-per-issue (not single-file)** — room to grow supporting docs and assets. Simple issues are still just `settings.json` + `issue.md`.
- **settings.json (not frontmatter)** — metadata/content separation, UI-editable, matches docs-folder convention.
- **`YYYY-MM-DD-<slug>` folder naming is mandated** — date prefix carries creation date (one source of truth), slug is the stable identity.
- **Folder name IS the issue ID** — no `id` or `created` field in `settings.json`. The filesystem is the canonical record.
- **Comments are one-file-per-comment under `comments/`** — clean diffs, git history per comment, AI agents can cite individual comments, adding a comment is a new file not a surgical insertion.
- **`idea` is a label, not a status** — an idea can be any type (feature idea, bug idea); labels are multi-value and orthogonal. Status tracks lifecycle only.
- **`Due` is derived, not stored** — only `due` date is stored; overdue state is computed at render time.
- **Assets are text-only by default** — excalidraw / diagram sources / reference files. Heavy binaries stay out, link externally.
- **Dev-only behavior reuses the existing `draft` flag** — no bespoke exclusion code. `draft: true` on the root tracker settings (or a specific issue) is enough; the loader already filters drafts out of production builds.
- **Pre-built `_index.json`** for fast filter/sort in the editor UI; scales past the ~100-issue primary target without performance anxiety.
- **No folder-level ordering in the sidebar** — ordering happens at render time via `priority` + `updated`. Tradeoff: can't eyeball the sidebar for "what's next" — but the list view filters make up for it.

## Open questions

- Closed issues — keep in the same `issues/` dir filtered by `status`, or move to `issues/archive/`? **Keep in-place**, filter by status. Simpler. Archive folder only if the list ever gets unwieldy.
- Supporting docs as a subfolder (`docs/`) or sibling `.md` files? **Sibling for now** — less nesting, easier to discover.
- Exact skill path — `.claude/skills/issues.md` or `dynamic_data/data/.claude/...` or a user-invocable plugin skill? Decide during skill implementation.
- GitHub Issues sync — one-way or two-way, and who triggers it (CI vs dev-server)? Deferred until someone actually needs the bridge.
- Does the issues layout need its own `compact` variant (like `docs/compact/`) for dense list views? Defer until one style feels insufficient.
- `_index.json` on disk vs memory-only — on-disk means faster cold starts, but it's a generated file that wants a `.gitignore` entry. Lean on-disk + gitignore it; regenerate on startup anyway.

## References for the next session

Key files to read before starting implementation:

- `src/layouts/blogs/default/` — the closest structural precedent (index + detail split, flat folder, date-prefixed items).
- `src/parsers/content-types/blog.ts` — the parser pattern to mirror, especially `parseFilename` and asset resolution.
- `src/pages/[...slug].astro:1-90` — how layouts are discovered and routed. Need to add issues globs and a resolution branch.
- `src/loaders/data.ts:75-250` — content loading with mtime caching and draft filtering. New `loadIssues` helper mirrors `loadContent` but scans folders not files.
- `src/loaders/config.ts` — where aliases are resolved at load time. Add `@issues/` to the alias table.
- `src/dev-toolbar/integration.ts` — where the indexer runs. Parallel to existing `editorStore.startBackgroundSave()`, `presenceManager.startCleanup()`, `yjsSync.startEviction()`.
- `src/loaders/cache-manager.ts` — mtime-based caching with dependency tracking. Issues get a new category alongside content/config/asset/theme.
- `dynamic_data/data/user-guide/15_content/04_blogs/` — user-facing docs for the blog content type; the issues docs should follow the same structure.
- `src/loaders/data.ts:115` — where `includeDrafts = !import.meta.env.PROD` lives; the draft filter we're reusing.
