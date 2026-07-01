---
title: 02 · Comments
description: The thread — one markdown file per comment, ordered by sequence number
sidebar_position: 2
---

# Comments

Comments live in `<issue-folder>/comments/` — one markdown file per comment. The UI concatenates them into a chronological thread on the issue's detail page.

## File naming

Two accepted shapes — the 3-digit sequence **is** the comment id either way:

```
NNN_<slug>.md                  ← the norm: slug describes, author/date in frontmatter
NNN_YYYY-MM-DD_<author>.md     ← strict form: date + author parsed from the filename
```

- **`NNN`** — zero-padded sequence number (`001`, `002`, …). Enforces ordering independent of filesystem sort quirks; rendered as `#001` in the right-rail comment index.
- **`<slug>`** — kebab-case, describes the comment (`001_opened.md`, `002_scope-narrowed.md`). With this shape, `author:` + `date:` come from frontmatter.
- The strict `NNN_YYYY-MM-DD_<author>.md` form still parses (filename is authoritative for date + author; frontmatter overrides).

Example folder:

```
comments/
├── 001_opened.md
├── 002_scope-narrowed.md
└── 003_handoff.md
```

Comments are **append-only in practice** — they record history, so they don't get renumbered or rewritten. Keep them a **lean evolution log** (what changed, status shifts, hand-offs), not a forum: the debate that produced a decision lives in [Brainstorm](./brainstorm).

## Why one file per comment

- **Clean diffs.** A new comment is a new file. No surgical edits to a single monster document, no merge conflicts on unrelated threads.
- **Per-comment git history.** `git log` on `comments/002_…md` tells you exactly when that comment was written or edited.
- **AI agents can cite by filename.** "See `comments/003_2026-04-19_claude.md`" is a stable reference that doesn't rot when other comments are added.
- **Appending is a new file**, not surgery. For agents, `echo "…" > comments/NNN_DATE_AUTHOR.md` is the entire write path.

## Frontmatter

Comments support optional frontmatter. The filename carries sequence / date / author already; frontmatter is for overrides or additional context:

```markdown
---
author: claude
date: 2026-04-19
---

The testbed under `data/issues-test/` looks good for an initial pass. I
propose we migrate the three open items from `2026-04-10-issues-layout` …
```

Supported fields:

| Field | Type | Effect |
|---|---|---|
| `author` | string | Overrides the author parsed from the filename |
| `date` | ISO date | Overrides the date parsed from the filename |

Both optional. If absent, the filename is authoritative.

## Body

Pure markdown — no length cap, though most comments are a line or two. For design deliberation, use **[Brainstorm](./brainstorm)** — comments record *that* something happened (a decision, a status shift, a hand-off), never the debate that produced it.

## Rendering

Comments live on the detail page's **Comments panel** (`#comments`) — a GitHub-style thread with the issue body as the opening post, each comment a styled card with author + date header. The right rail carries a per-comment index (`#NNN` · author · date); `#comment-N` deep-links to one. On the list page, the comment count per issue surfaces as a small indicator.

## Adding a comment manually

1. Find the highest existing `NNN` in `comments/` (`ls comments/ | sort -n | tail -1`)
2. Pick the next sequence number
3. Create `NNN_<slug>.md` with `author:` + `date:` frontmatter (or the strict `NNN_YYYY-MM-DD_<you>.md` form, no frontmatter needed)
4. Write your comment.

The live editor + planned `/issues` skill automate all of this — see [Using with AI](../using-with-ai).

## When NOT to comment

- **Progress updates on subtasks** — update the subtask's state instead (`open → review`). Subtask state changes are more precise than comments about them.
- **Agent iterations** — use `agent-log/`, not comments. Agent logs have richer frontmatter (iteration / status) and are meant to be audit-read in bulk.
- **Changes to metadata** — edit `settings.json` directly. `git blame` tells the story.

## See also

- [issue.md](./issue-md) — the initial pitch
- [Subtasks](./subtasks) — atomic work units with their own state
- [Agent Log](./agent-log) — audit trail for AI iterations
