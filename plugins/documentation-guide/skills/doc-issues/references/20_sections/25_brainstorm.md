# Brainstorm — `brainstorm/NN_[<kind>_]<slug>.md`

Active deliberation — research, exploration, discussion, ideation. The *process* of
deciding what to do; its conclusion graduates into `notes/`. Defined by contrast:
brainstorm is *what we're figuring out*, notes are *what we know*.

## Shape — vocabulary, not architecture

Brainstorm is thought-space — every brainstorm is shaped differently, so it gets a
**naming convention and nothing else**. No codes, no `settings.json` registration, no
icons, no machinery.

```
brainstorm/
├── 01_research_prefix-grammars.md      ← NN_<kind>_<slug>.md — kind is a FULL WORD
├── 02_idea_kind-badges.md
├── 03_overall-structure.md             ← no kind word — also perfectly fine
└── 04_structure-deep-dive/             ← folder = ONE brainstorm (a multi-file thread)
    ├── 01_explore_options.md
    └── 02_discuss_tradeoffs.md
```

- **Kind is a full word, from an open vocabulary** — self-documenting in the sidebar,
  so nothing needs to decode it. Seed set (any fitting word is valid, omitting is valid):

  | Kind word | Use for |
  |---|---|
  | `research` | Gathering facts — prior art, external docs, comparisons. |
  | `explore` | Mapping the option space, or spelunking the codebase for feasibility. |
  | `idea` | A concrete proposal or concept sketch, argued for. |
  | `discuss` | Weighing trade-offs, open questions, recorded back-and-forth. |

- **Folder = one brainstorm thread** (multi-file exploration); a single-file thought
  stays flat. Both are first-class siblings, ordered by prefix.
- **Intra-issue only.** Deliberation spanning multiple issues stays as separate issues
  linked via `Related:` — brainstorm is the within-an-issue version of that activity.
- **Not just markdown.** A `.html` artifact or a diagram file (`.excalidraw`/`.mmd`/…)
  dropped here renders **embedded** as a first-class sub-doc — an iframe with an
  open-full-page link for artifacts — exactly as in `notes/` (see
  [22_notes.md](22_notes.md#first-class-artifacts--diagrams)). Handy for a visual
  option-sketch mid-deliberation.

## Graduation — the one piece of process

When a brainstorm resolves, it is **not deleted or moved** — it gets one line at the top:

```markdown
> **Resolved →** notes/01_issue-anatomy/
```

(or → a subtask, or → *dropped*, or → a closing comment). The brainstorm stays as the
record of *why*; the note holds the distilled *what*. Graduate **at the moment
something downstream needs to cite the conclusion as ground truth** — not when the
discussion merely "feels finished". A "do nothing" resolution doesn't produce a note —
the marker points at the closing comment instead.

## What belongs here (vs elsewhere)

- Deliberation about *what to do* — always here, never a standalone issue. If a whole
  issue turns out to be pure deliberation converging elsewhere, fold it into the
  winner's `brainstorm/` (with a `**Resolved →**` overview + source provenance) and
  delete the source issue — git history keeps it.
- Debate that would bloat a comment (the two-paragraph tripwire — see
  [21_comments.md](21_comments.md)).
- Dense working dialogue from an agent session the user asked to save — as a
  `discuss` entry (explicit-save-only; offer, never auto-save).

## Add a brainstorm

1. Next prefix: `ls <issue>/brainstorm/` → next gap-spaced `NN_`.
2. Single thought → `NN_[<kind>_]<slug>.md`; multi-file thread → `NN_<slug>/` folder
   with the same loose convention inside.
3. Frontmatter: `title` (required). Body free-form.
4. When it resolves, add the `**Resolved →**` marker — don't delete, don't move.
