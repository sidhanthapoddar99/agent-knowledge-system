# Brainstorm

**Scope:** active deliberation — research, exploration, discussion, ideation. The *process*
of deciding what to do; its conclusion graduates into Notes.

## Shape — vocabulary, not architecture

Agent-log earned real machinery (codes, `settings.json` mapping, icons, status colours)
because it's *machine-shaped*: long-running, repetitive, agent-written, summarized at a
glance. Brainstorm is the opposite — thought-space, every brainstorm shaped differently.
Prescribing an architecture here would make authors fight the structure instead of
thinking. So brainstorm gets a **naming convention and nothing else**:

```
brainstorm/
├── 01_research_prefix-grammars.md      ← NN_<kind>_<slug>.md — kind is a FULL WORD
├── 02_idea_kind-badges.md
├── 03_overall-structure.md             ← no kind word — also perfectly fine
└── 04_structure-deep-dive/             ← folder = ONE brainstorm (a multi-file thread)
    ├── 01_explore_options.md
    └── 02_discuss_tradeoffs.md
```

- **`NN_<kind>_<slug>.md`** — the kind is a full word, and the list is **open**: any word
  that fits is valid (`spike`, `compare`, …), and omitting it is valid too. Full words
  beat codes here because nothing needs to decode them — the word is self-documenting
  right in the sidebar label. The common seed set:

  | Kind word | Use for |
  |---|---|
  | `research` | Gathering facts — prior art, external docs, comparisons. |
  | `explore` | Mapping the option space, or spelunking the codebase for feasibility. |
  | `idea` | A concrete proposal or concept sketch, argued for. |
  | `discuss` | Weighing trade-offs, open questions, recorded back-and-forth. |

- **No machinery.** No 2-letter codes, no `settings.json` registration, no icons, no
  parsing, no badges beyond the standard `NN`. The existing generic rendering (prefix
  badge + clean label + optional `color:`) already covers it. If we ever find ourselves
  wanting kind icons here, that's the signal the vocabulary hardened into a grammar —
  decide *then*, not preemptively.
- **Folder = one brainstorm.** A multi-file exploration gets an `NN_<slug>/` folder whose
  inner files follow the same loose convention; a single-file thought stays flat. Both
  first-class siblings, ordered by prefix.

## Graduation marker

When a brainstorm resolves, it is **not** deleted or moved — it gets one line at the top:

```markdown
> **Resolved →** notes/01_issue-anatomy-guide.md
```

(or → a subtask, or → *dropped*). The brainstorm stays as the record of *why*; Notes hold
the distilled *what*. This is the single piece of light process worth writing into the
guide — it answers the question every reader has opening an old brainstorm: *did this go
anywhere?*

## Decided

- Name is **Brainstorm** (chosen as the umbrella over "discussion" / "research" — those are
  *kinds* of brainstorming, not separate sections). "Discussion" as a concept is gone —
  folded in.
- **Convention, not grammar:** `NN_<kind>_<slug>.md` with a full-word kind from an **open
  vocabulary** (research · explore · idea · discuss as the seed set); kind word optional.
  No framework machinery of any sort.
- **Folder = one brainstorm thread**; flat file = one single-file thought.
- **Graduation marker** (`**Resolved →** …`) on resolved brainstorms instead of
  moving/deleting them.
- **Intra-issue only.** Deliberation spanning *multiple* issues stays as separate issues
  linked via `Related:` — brainstorm is the within-an-issue version of the same activity.
- **Ordering stays ascending** — a newest-first feed (+ "show more" cap) was considered
  and rejected in favour of one consistent ordering rule across all sections.
