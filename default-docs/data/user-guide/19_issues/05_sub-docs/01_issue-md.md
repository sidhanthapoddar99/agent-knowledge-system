---
title: issue.md
description: The main body of an issue — goal, context, motivation
sidebar_position: 1
---

# `issue.md`

The required markdown file at the root of every issue folder. It carries the **goal and context** — what this issue is about, why it exists, what "done" looks like.

## What it's for

- **Opening pitch** — 1–3 paragraphs stating the goal
- **Context** — why now, what triggered it, relevant background
- **Success criteria** — how you'll know when it's done
- **Pointers** — links to subtasks, notes, related issues

It is **not** for:
- Progress updates (use `comments/`)
- Breakdown of the work (use `subtasks/`)
- Design deliberation (use `notes/`)
- AI iteration logs (use `agent-log/`)

## No frontmatter

All metadata for the issue lives in the sibling `settings.json`. `issue.md` is pure prose — no `---` block at the top. The loader tolerates frontmatter if present (for portability from other systems), but it isn't interpreted.

## Example

```markdown
# Editor V2 — Performance Optimizations

The live editor starts to stutter past ~2000 lines in the CodeMirror pane,
especially when the Yjs presence manager is broadcasting cursor updates for
multiple users. This issue tracks the known wins, in rough order of impact.

## Goal

Smooth editing at 5000 lines with 3 concurrent users, on commodity hardware
(8 GB RAM, integrated GPU).

## Context

We've been holding this off until the feature surface stabilised — now that
v2 ships on 2026-04, it's time. See `2026-04-10-issues-layout/` subtask 01
for the profile traces.

## Success criteria

- 60 fps scroll at 5k lines, 3 cursors broadcasting
- No input lag perceivable under normal typing speeds
- RAM usage under 400 MB for the editor process

See the subtasks for the breakdown.
```

## Length

No hard limit — but if `issue.md` is drifting past a few hundred lines of prose, the signal is probably a **note** in disguise. Move deep-dive content into `notes/NN_<slug>.md` and keep `issue.md` as orientation.

## Heading anchors and sub-doc linking

Headings in `issue.md` get anchor IDs (`#goal`, `#context`, `#success-criteria`) the same as any other markdown. Other files in the issue folder (comments, subtasks) can link to them with relative fragments — `[goal](../issue.md#goal)` — though in practice the cross-links are usually maintained at the URL level (`/todo/<id>#goal`).

When rendering the **Comprehensive** tab (see [Detail View](../ui/detail-view)), all heading IDs are prefixed to prevent collisions with subtask heading IDs — but on the **Overview** tab and direct URL, IDs stay bare.

## Assets

Colocate assets inside the issue folder (conventionally `<issue>/assets/`) and reference them with relative paths from any file in the issue — `issue.md`, subtasks, notes, agent-log entries:

- **Images** — `![Flow](./assets/flow.png)` (from `issue.md`) or `![Flow](../assets/flow.png)` (from a subtask/note). At render time the relative `src` is rewritten to an absolute `/content-assets/<content-root-relative-path>` URL (the same shared mechanism docs and blog posts use), so the image works at every depth — the detail page, nested sub-doc pages, and sub-doc bodies embedded in the Comprehensive panel.
- **Content embeds** — the `[[path]]` syntax inlines a file's raw content, same as docs and blogs. Paths resolve relative to the referencing file; a bare name (`[[flow.svg]]`) resolves to `<file's folder>/assets/<name>`. Escape with `\[[...]]` to render the brackets literally.

Markdown files and `settings.json` are never served raw through `/content-assets/` — they're pages and internal metadata respectively.

## What reading `issue.md` tells an agent

For an AI agent picking up an issue, **read `issue.md` first**. It's the orientation document — everything else (comments, subtasks, notes, agent-log) makes sense in its context. Without reading the goal, subtasks look like arbitrary work items.

See [Using with AI](../using-with-ai) for the recommended read order.

## See also

- [Comments](./comments) — progress / discussion thread
- [Subtasks](./subtasks) — the work breakdown
- [Notes](./notes) — supporting design docs
- [Agent Log](./agent-log) — AI iteration audit trail
