---
title: "Project + docs sweep — documentation-template → agent-knowledge-system"
status: open
---

The wide rename: every reference to "documentation-template" / "docs framework"
framing on live surfaces moves to **agent-knowledge-system** — CLAUDE.md project
overview, root README, user-guide, dev-docs, plugin references, in-code error
messages and comments, the CLI's self-description (`agent-ks help` header),
page frontmatter descriptions.

Scope guards:

- The framework folder name (`astro-doc-code/`) and repo directory name are
  handled by the repo move ([50](50_new-repo.md)), not this sweep.
- Tracker history stays untouched; open-issue consistency is
  [subtask 30](30_open-issues-consistency.md).
- Positioning language should follow the issue's framing: a knowledge + task
  system designed for AI consumers, with human-readable docs as one first-class
  output — not "an Astro docs framework".

## Tasks

- [ ] Inventory: grep live surfaces for `documentation-template` and "docs
      framework" phrasing; classify each hit (rename / reword / keep as path).
- [ ] CLAUDE.md + root README repositioning paragraphs.
- [ ] user-guide + dev-docs sweep (page bodies, frontmatter descriptions).
- [ ] In-code strings/comments (`agent-ks help` header, loaders, start script
      messages).
