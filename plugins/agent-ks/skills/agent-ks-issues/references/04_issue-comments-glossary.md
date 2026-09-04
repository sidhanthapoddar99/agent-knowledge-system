# Issue body, comments and glossary

## `issue.md`

It holds the durable framing: what the issue is, for a reviewer. The order to read an issue in: [SKILL.md](../SKILL.md).

```markdown
---
title: "..."
---

# Goal
What this issue achieves, and why.

## Context
The situation that motivates the work. Links to related issues.

## Done when
What finished looks like.

## Scope decisions
What is in and what is out.
```

| Holds | Does not hold |
|---|---|
| the goal, the scope, the success criteria, the headline decisions | research, alternatives weighed, design rationale. Those are notes |
| links to related issues | a design exploration or a comparison table |

The display title comes from `settings.json`. Keep the file between 50 and 300 lines. Past 300 lines, or when deep-dives accumulate, move that material to `notes/` and leave a one-line link.

## Comments

| Holds | Does not hold |
|---|---|
| that something changed: a status, a scope, a hand-off, a supersession | the debate that produced it. That is `brainstorm/` |
| two lines and a pointer | the specification of what changed. That is `notes/` or the subtask |
| who holds the work | a run's narrative. That is the agent log's |

| Rule | Detail |
|---|---|
| append only | never rewrite a prior comment. Never change `author` or `date` on another author's comment |
| flat | no subfolders, no threads. The `NNN_` prefix is the comment id, set by the CLI |
| a second paragraph is the wrong section | debate goes to `brainstorm/`; specification goes to `notes/`. Link from the comment |
| `dropped` needs a comment first | rule 6 in [lifecycle](02_lifecycle.md) |
| working dialogue is not a comment | it is saved only on request, as a `discuss` brainstorm ([brainstorm](05_brainstorm-notes-memory.md)) |

Test: a reviewer six weeks later needs this line to follow the issue. Then it is a comment.

```yaml
---
author: claude
date: 2026-04-24
---

Two lines and a pointer.
```

Name the file `NNN_<slug>.md` or `NNN_<YYYY-MM-DD>_<author>.md`. Match what the issue uses. Skeleton: [comment.md](../../agent-ks-cli/templates/comment.md).

```bash
agent-ks issue add-comment <issue-id> --author claude --body "..."
```

The CLI picks the next prefix and writes the frontmatter. Without the CLI: list `comments/`, take the next number, and write the file with `author` and today's `date`.

## `glossary.md`

An optional file at the issue root. The Glossary panel renders it as written. It holds the terms, colour meanings and conventions of this issue. Sections and tables beat paragraphs.

```markdown
# Glossary

## Colour legend
| Colour | Meaning | Example |
|---|---|---|
| blue | option still in play | brainstorm/... |

## Key terms
| Term | Meaning |
|---|---|

## Conventions
| Pattern | Meaning |
|---|---|
```

| Rule | Detail |
|---|---|
| write a colour legend when the issue uses `color:` | `color:` has no framework meaning. Keep an Example column that points at a real file |
| scope a colour per section with `###` | when the same colour means different things in Brainstorm and Agent log. A flat table when issue-wide |
| prefer theme tokens | `var(--color-success)` survives dark and light mode |
| custom kind mappings do not live here | they are `settings.json` data. The glossary may explain what a kind means in prose |
| read it before you interpret a tinted label or an unfamiliar term | |

## The Guide panel

Every issue renders a Guide panel: an anatomy legend with one generated island, the issue's effective kind codes. The framework builds it from `@root/astro-doc-code/src/layouts/issues/default/guide.ts`. You do not write it. It is present even when the plugin is not installed. The skill is the full manual; the Guide is the map. A framework maintainer keeps `guide.ts` in step with this skill.
