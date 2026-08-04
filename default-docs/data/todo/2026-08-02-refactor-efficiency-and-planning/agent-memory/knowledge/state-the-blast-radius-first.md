---
title: "Open with what you are about to touch — six layers, in a table"
---

# The rule

**Before proposing or starting any change on this issue, say which layers it
touches — as a table, with the untouched ones listed too.** Sid asked for this
on 2026-08-04, after several rounds where "fix the checker" or "close the
subtask" could have meant a code change, a content sweep, or a paragraph in a
record, and the reply did not say which.

The six layers of this project, and they are never interchangeable:

| Layer | What lives there |
|---|---|
| **agent-ks skill text** | `plugins/agent-ks/skills/**/*.md` — what an agent reads and obeys |
| **agent-ks skill tool-code** | `plugins/agent-ks/skills/**/scripts/**` — the CLI and the gates |
| **engine code** | `astro-doc-code/src/**` — the renderer, loaders, layouts |
| **docs / issues / blog content** | `default-docs/data/**` — the documents themselves |
| **comments in code** | headers and rationale inside either code tree |
| **this issue's records** | `subtasks/`, `agent-log/`, `notes/`, this folder |

Write it as a table with every layer present and a plain **yes / no**, so the
absent ones are visible rather than merely unmentioned. Then the work.

# Why

**The layers have completely different costs and blast radii, and the same
sentence can mean any of them.** *"Fix the link checker"* could be: an edit to a
gate script, a sweep of 334 content links, a renderer change, or a corrected
number in a record. One of those is reversible in a keystroke and one is the
mistake that cost this issue a day and 341 files.

Naming them up front is also the cheapest place to catch a category error. **The
341-link rewrite was exactly a wrong-layer decision** — a rendering defect
answered with a content sweep. Had the plan opened with *"content: 341 files.
engine code: none"*, the imbalance would have been visible before anything was
edited, not after it was pushed.

An unstated layer also reads as "not affected", and that inference is wrong often
enough to matter: this issue has twice found a change reaching content or code
that was described as a documentation edit.

# How to apply

- **The table comes before the work, not with the summary.** Its whole value is
  that it can be rejected cheaply.
- **List every layer, including the untouched ones.** *"engine code: no"* is
  information; silence is not.
- **Count what you can count.** *"content: 4 files"* beats *"content: some
  pages"*, and if the number is unknown, say it is unknown — see the counting
  rule in the global `CLAUDE.md`.
- **Content and engine code are the two that earn a pause.** Skill text, code
  comments and this issue's own records are cheap to reverse; a content sweep and
  a renderer change are not.
- **If a change spans more than two layers, say why in one line.** Usually it is
  legitimate — a gate fix that makes an existing content defect visible reaches
  tool-code *and* content — but it is worth naming rather than discovering
  halfway through.
