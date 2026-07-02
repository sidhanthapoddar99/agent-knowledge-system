# Comments — `comments/NNN_<slug>.md`

The lean **flat evolution log** of the issue — what changed, status shifts, scope
changes, hand-offs, supersessions. Like a changelog, **not** a discussion forum: a
comment records *that* something happened and the hand-off context, never the debate
that produced it (that's `brainstorm/` — see [25_brainstorm.md](25_brainstorm.md)).
**Append-only** — never rewrite a prior comment. `comments/` stays flat (no
subfolders, no threading); the `NNN_` prefix is the comment's `#NNN` id.

**The tripwire: a comment is a couple of lines plus a pointer.** The moment you're
writing a second paragraph you're in the wrong section — debating belongs in
`brainstorm/`, specifying belongs in `notes/`; link from the comment instead of
inlining.

## Shape

```yaml
---
author: claude
date: 2026-04-24
---

# Optional title

Body...
```

Naming convention: `NNN_<YYYY-MM-DD>_<author>.md` is the spec, but in practice many comments use `NNN_<short-slug>.md`. Either works; check what the issue already uses and match. The `NNN_` prefix is **auto-numbered sequentially by the CLI** (3-digit) — you never hand-number comments, and gap-numbering doesn't apply here.

## Add a comment

Prefer the helper:

```bash
docs-guide issue add-comment <issue-id> --author claude --body "..."
```

It finds the next `NNN_` prefix and writes valid frontmatter.

Direct file write (when the helper isn't available):

1. Find the next prefix: `ls <issue>/comments/`
2. Write `<issue>/comments/NNN_<slug>.md` (or `NNN_<date>_<author>.md`)
3. Frontmatter: `author`, `date` (today, `YYYY-MM-DD`)

**A `dropped` issue always needs a comment first** explaining why (AI rule #6 in [00_overview.md](00_overview.md)).

## vs. working dialogue

`comments/` is the durable, issue-level log — decisions and hand-offs meant to
outlive any single run. Working dialogue *during* a dense agent session is saved
**only when the user explicitly asks**, and then as a `discuss` brainstorm entry
(see [25_brainstorm.md](25_brainstorm.md)). When in doubt: would a reviewer skimming
the issue six weeks later need this line to follow the issue's evolution? → comment.
Is it deliberation or session texture? → brainstorm (on request), or nowhere.

## When NOT to edit

- Don't rewrite history — append, don't edit prior entries.
- Don't change `author` or `date` on someone else's comment.
