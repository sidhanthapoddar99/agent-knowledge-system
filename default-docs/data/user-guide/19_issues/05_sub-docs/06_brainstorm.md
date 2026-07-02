---
title: 06 · Brainstorm
description: Active deliberation — research, exploration, ideas, discussion; the process of deciding what to do
sidebar_position: 6
---

# Brainstorm

The `brainstorm/` folder holds **active deliberation** — research, exploration, ideas, trade-off discussions. It's the *process* of deciding what to do; the conclusion graduates into `notes/` (the *product*). It absorbs the old "discussion" concept entirely.

## Shape — a naming convention, nothing else

Brainstorm is thought-space: every brainstorm is shaped differently, so the framework imposes **no machinery** here — no codes, no icons, no `settings.json` registration. Just a naming convention:

```
brainstorm/
├── 01_research_prefix-grammars.md      ← NN_<kind>_<slug>.md — kind is a FULL WORD
├── 02_idea_kind-badges.md
├── 03_overall-structure.md             ← no kind word — also perfectly fine
└── 04_structure-deep-dive/             ← folder = ONE brainstorm (a multi-file thread)
    ├── 01_explore_options.md
    └── 02_discuss_tradeoffs.md
```

- **`NN_<kind>_<slug>.md`** — the kind is a **full word**, self-documenting in the sidebar (which is why full words beat codes here — nothing needs to decode them). The list is **open**; the common seed set:

  | Kind word | Use for |
  |---|---|
  | `research` | Gathering facts — prior art, external docs, comparisons. |
  | `explore` | Mapping the option space, or spelunking the codebase for feasibility. |
  | `idea` | A concrete proposal or concept sketch, argued for. |
  | `discuss` | Weighing trade-offs, open questions, recorded back-and-forth. |

  Any word that fits is valid (`spike`, `compare`, …), and omitting the kind word is valid too.
- **A folder = one brainstorm.** A multi-file exploration gets an `NN_<slug>/` folder; inner files use the same loose convention. A single-file thought stays flat. Up to two levels, like the other sections.

## The graduation marker

When a brainstorm resolves, don't delete or move it — add one line at the top:

```markdown
> **Resolved →** notes/01_decided-architecture.md
```

(or → a subtask, or → *dropped*). The brainstorm stays as the record of *why*; the distilled *what* lives in Notes. It answers the question every reader has when opening an old brainstorm: *did this go anywhere?*

**When to graduate:** at the moment something downstream needs to *cite* the conclusion as ground truth — a subtask about to be written against it, code about to implement it. "The discussion feels finished" is not the trigger; being *built upon* is. A brainstorm that resolves to "do nothing" doesn't graduate — its marker points at the closing comment (or says *dropped*) instead of at a note.

## Frontmatter

Only `title` and `color` are interpreted — same as notes. `color` tints the sidebar label; its meaning is issue-defined, so document it in the issue's `glossary.md` (per-section legends — the same colour can mean something different in Brainstorm than in Agent log).

## Boundaries

- **Brainstorm (process, in-flux) ≠ Notes (product, finalized).**
- **Comments record *that* a decision happened** — the debate that produced it lives here.
- **Intra-issue only.** Deliberation spanning multiple issues stays as separate issues linked via `Related:`.

## Rendering

Sidebar section (before Notes, lightbulb icon) with `NN` badges + clean labels; each file gets its own URL: `/<tracker>/<issue>/brainstorm/<name>`.

## See also

- [Notes](./notes) — where conclusions graduate to
- [Comments](./comments) — the evolution log
