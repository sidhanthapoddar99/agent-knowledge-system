---
title: Create an Issue
description: Step-by-step — from empty to a well-formed issue ready for work
sidebar_position: 1
---

# Create an Issue

Three ways to create an issue, depending on how you're working:

- **Via the live editor** — point-and-click in the dev-toolbar editor (usually fastest)
- **By hand in the filesystem** — the canonical form; everything else ends up here anyway
- **Via the `doc-issues` Claude Code skill** — for AI agents doing autonomous creation

This page walks the filesystem path. The editor path does the same thing behind a form.

## 0. First — does this thought earn an issue at all?

The ceremony of an issue folder must be earned, or the tracker bloats with
folders that aren't issues. All convention, never code-enforced:

**Litmus test: can you name the issue's component and its first subtask in one
breath?** An issue is fundamentally a coherent unit of thinking + execution that
decomposes into subtasks — if you can't name even one, it isn't an issue yet.
Route it instead:

- **A subtask on an existing issue** — one-prompt fixes and small features attach
  to the issue whose center of gravity they belong to, never a new folder. Work
  that would merely deepen an existing issue's scope extends that issue.
- **A brainstorm entry** — deliberation about *what to do* (research, direction
  weighing, migration proposals) lives in `brainstorm/` inside the issue it
  informs, never as its own issue. When a standalone issue turns out to be pure
  deliberation converging elsewhere, fold it into the winner's `brainstorm/` (with
  a `**Resolved →**` overview) and delete it — git history keeps it. An issue that
  *shipped work* stays, closed with a supersession comment.
- **A dump entry** — an unhomed half-formed thought goes to a **dump issue**
  (component `issue-dump`; each entry a subtask). Capture with
  `/docs-quick-idea-note`. A dump entry graduates to a real issue exactly when it
  passes the litmus test — and is then **deleted from the dump**, not ticked off.

If the thought passes the test, continue below.

## 1. Decide the slug

The folder name sets the issue's identity forever. Pick a slug that:

- Is lowercase kebab-case
- Starts with an alphanumeric (not a hyphen)
- Reads well to a human scanning the folder list
- Is stable — renames are possible but rippling

Example: `docs-phase-2`, `editor-v2-perf`, `issues-layout`.

The full folder name is `YYYY-MM-DD-<slug>` — today's date, then the slug:

```
2026-04-21-editor-v2-perf
```

## 2. Create the folder

```bash
cd data/todo/
mkdir 2026-04-21-editor-v2-perf
cd 2026-04-21-editor-v2-perf
```

## 3. Write `settings.json`

Minimum required fields:

```json
{
  "title": "Editor V2 — Performance Optimizations",
  "description": "Stuttering past 2000 lines with 3 concurrent Yjs users.",
  "status": "open",
  "priority": "medium",
  "component": ["live-editor"],
  "labels": ["performance"],
  "author": "sidhantha",
  "assignees": ["sidhantha"]
}
```

Every enum value (`status`, `priority`, `component`, each label) must exist in the tracker's root `settings.json` vocabulary. If you're reaching for a value that isn't in the vocab, **don't invent** — either pick the closest existing value, or edit the root vocabulary to add it (see [Vocabulary](../settings/vocabulary)).

The convention is **one component per issue**; multi-component is allowed for genuinely cross-cutting work but should be the exception. `created` is parsed from the folder slug; `updated` is derived from git history at render time — don't write either by hand.

Full schema: [Per-Issue Settings](../settings/per-issue).

## 4. Write `issue.md`

No frontmatter. Just the goal, context, success criteria:

```markdown
# Editor V2 — Performance Optimizations

The live editor stutters past ~2000 lines in the CodeMirror pane, especially
when the Yjs presence manager broadcasts cursor updates for multiple users.
This issue tracks the known wins.

## Goal

Smooth editing at 5000 lines with 3 concurrent users on commodity hardware.

## Context

v2 shipped on 2026-04 — time to profile and optimise.

## Success criteria

- 60 fps scroll at 5k lines, 3 cursors broadcasting
- No input lag under normal typing
- RAM under 400 MB for the editor process
```

Keep it short. If deep design material is piling up, push it into `notes/` (see step 6).

## 5. (Optional) Break into subtasks

Create `subtasks/` and write one file per atomic unit of work. The numeric prefix drives ordering on the detail page.

```
subtasks/
├── 01_profile-baseline.md
├── 02_decorations-incremental-refresh.md
├── 03_presence-batching.md
└── 04_yjs-update-coalescing.md
```

Each file:

```markdown
---
title: "Profile baseline"
status: open
---

Capture baseline metrics before any changes. Target scenarios:

- 1k / 2k / 5k lines, single user
- 5k lines with 2nd user broadcasting cursor
- 5k lines with 3 users, all editing

Capture: FPS during scroll, input-to-render latency, RAM usage.
```

Full conventions: [Subtasks](../sub-docs/subtasks).

Leave subtasks out if the issue is small enough to be a single unit of work.

## 6. (Optional) Add notes / agent-log folders

Create these only when you have content for them:

- `notes/<slug>.md` — for design docs, proposals, research
- `agent-log/NNN_<slug>.md` — for AI iteration records

See [Notes](../sub-docs/notes) and [Agent Log](../sub-docs/agent-log).

## 7. Verify — open in dev

```bash
./start dev
```

Navigate to `/todo` (or your tracker's base URL). The new issue should appear in the list. Click through to the detail page. Check:

- Title + description render correctly
- `issue.md` body renders
- Status badge shows (right color)
- All subtasks appear in the sidebar with correct state icons
- Metadata sidebar has the right enums

Any warnings (missing fields, unknown enum values, stray files) surface in the **error-logger** dev-toolbar app.

## Boilerplate

For quick starts, use this minimum viable issue:

```
YYYY-MM-DD-<slug>/
├── settings.json    ← only required fields
└── issue.md         ← one paragraph of context
```

Everything else (`comments/`, `subtasks/`, `notes/`, `agent-log/`) grows as the issue grows. Don't preemptively create empty folders — the loader skips missing optional folders cleanly.

## Common mistakes

| Mistake | What goes wrong |
|---|---|
| Folder name without date prefix (`editor-perf/`) | Loader's regex rejects it; issue is silently skipped |
| Enum value not in vocabulary | Loader warns; chip renders without color |
| Frontmatter in `issue.md` | Tolerated but unused — metadata lives in `settings.json` |
| Stray `.md` file at issue root | Loader warns; file isn't rendered anywhere |
| Missing `settings.json` | Loader skips the issue entirely (no warning — just silent absence) |

## See also

- [Folder Structure](../folder-structure) — the full layout reference
- [Per-Issue Settings](../settings/per-issue) — full metadata schema
- [Work an Issue](./work-an-issue) — what to do once it's created
