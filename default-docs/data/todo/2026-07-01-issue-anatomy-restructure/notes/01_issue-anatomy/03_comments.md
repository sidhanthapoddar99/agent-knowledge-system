# Comments

**Scope:** the lean **flat** evolution log — what changed, status shifts, hand-offs.
Like a changelog for the issue, **not** a discussion forum.

Boundary: a comment records *that* something happened and the hand-off context — never
the debate that produced it (that's Brainstorm).

## Structure (current — kept as-is)

```
comments/
├── 001_opened.md            ← NNN_<slug>.md — 3-digit sequence = the "#001" id
├── 002_scope-narrowed.md
└── 003_handoff.md
```

A comment file — attribution frontmatter, body free-form (usually a line or two):

```markdown
---
author: claude
date: 2026-07-01
---
Handed to claude to populate all agent-log kinds and the nested trees.
```

- **Rendering:** the **Comments** panel is the GitHub-style thread — issue body as the
  opening post, comments in sequence below — with a per-comment index (`#NNN` + author
  · date) in the right rail. Panel-based, hash-addressable (`#comments` /
  `#comment-N`), single sidebar entry in the "This issue" group.
- Sequence comes from the `NNN_` prefix; the slug after it is a human hint, not
  displayed as the id.

## Decided

- **Works as-is** — no changes.
- **Flat. No threading, no sub-comments, no substructure.** One file per comment.
  Removes the costliest framework change from scope.
- Frontmatter stays **`author:` + `date:` only** — a `type:` field (status-change /
  hand-off / note) is exactly the kind of taxonomy that rots; the text says what it is.
- `NNN_` sequence prefix is the norm (it *is* the comment id); append-only in practice —
  comments record history, so they don't get renumbered or rewritten.
