# Comments — `comments/NNN_<date>_<author>.md`

Chronological discussion on an issue: decisions, hand-offs, the human↔agent thread. **Append-only** — never rewrite a prior comment. `comments/` stays flat (no subfolders).

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

**A `cancelled` issue always needs a comment first** explaining why (AI rule #5 in [00_overview.md](00_overview.md)).

## vs. `agent-log/` discussion

`comments/` is the durable, issue-level thread — decisions and hand-offs meant to outlive any single run. Working dialogue *during* a dense agent run lives in the agent-log's `100_discussion/` instead (see [24_agent-logs.md](24_agent-logs.md)). When in doubt: would a reviewer skimming the issue six weeks later want to see it? → comment. Is it the texture of one execution session? → agent-log discussion.

## When NOT to edit

- Don't rewrite history — append, don't edit prior entries.
- Don't change `author` or `date` on someone else's comment.
