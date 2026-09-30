---
title: "Brainstorm and notes"
description: "Where an issue works things out, and where it keeps the conclusions."
---

Two sections hold an issue's thinking. `brainstorm/` holds what you are still working out. `notes/` holds what is settled. This page shows how to name files in each, how a brainstorm graduates into a note, and what each section never holds.

## Brainstorm: working it out

| Holds | Never holds |
|---|---|
| The argument: the options, the trade-offs, the ones rejected | The conclusion as settled fact. That goes to `notes/` |
| Dead ends, reversals and changes of mind | Anything other work relies on directly |
| Deliberation about what to do | The work itself, or its order |

A brainstorm file carries a `title`, and may carry a `color`. The body is free.

### Naming

Use `brainstorm/NN_<kind>_<slug>.md` for one thought, and a folder `brainstorm/NN_<slug>/` for a thread of several files. The kind is optional, and it is a full word:

| Kind | Use for |
|---|---|
| `research` | Facts: prior art, outside docs, comparisons |
| `explore` | The range of options, or the codebase to check what is feasible |
| `idea` | A concrete proposal, argued for |
| `discuss` | Trade-offs, open questions, or a recorded conversation |

```
brainstorm/
├── 01_research_search-engines.md
├── 02_idea_prefix-index.md
└── 03_ranking/
    ├── 01_options.md
    └── 02_discuss_weights.md
```

A conversation with an agent is saved only when you ask for it, as a `discuss` entry. An agent offers once when a conversation starts to carry decisions. It never saves one on its own.

### Graduation

When a brainstorm reaches a conclusion, it graduates. You do not delete it and you do not move it. You add one line at its top that points to where the conclusion now lives:

```markdown
> **Resolved →** notes/search-design.md
```

The target may be a note, a subtask, a closing comment, or the word *dropped*. Graduate a brainstorm when later work needs to rely on its conclusion.

## Notes: what is settled

| Holds | Never holds |
|---|---|
| The conclusion, and a short reason for it | The deliberation. That stays in `brainstorm/` |
| Decisions that outlive one run of work | The steps that carry the decision out. Those are subtasks |
| The research and measurements a decision rests on | A step-by-step account of what to do |
| Contracts other work builds against: data shapes, schemas, who owns what | The story of a run. That is the agent log's |

The test for a note: will a future reader need it to answer "why did we do it this way?", or to build against it? Then it is a note. A note that reads like a work order is a subtask. A note that keeps changing is still a brainstorm, so move it back.

Write a note when its content is produced, not at the end of the work.

### Placement

| You have | Put it at |
|---|---|
| One design document | `notes/<slug>.md` |
| Part of a set | `notes/<group>/<slug>.md` |
| A sub-part of a set | `notes/<group>/<subgroup>/<slug>.md`. Deeper than that, split into a sibling group or a new issue |
| Files whose reading order matters | Number them: `010_context.md`, `020_design.md`. Leave the rest unnumbered |

A note carries a `title` and may carry a `color`. A note that records decisions uses three sections, so readers find the same things in the same places:

```markdown
---
title: "Search design"
---

The search index is built per docs section and merged at query time.

# 03 References
- The options weighed: brainstorm/03_ranking/

# 04 Decisions
- Decided (sid, 2026-10-01): one index per section, because sections change independently.

# 05 Notes & Analysis
## Index size
Measured on the user guide: 2 MB for 300 pages.
```

A decision line always has the form `- Decided (<who>, <date>): <what>, because <why>.`

## Diagrams and HTML artifacts

A note or a brainstorm entry need not be markdown.

- A diagram file (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) in `notes/` or `brainstorm/` shows as its own page. Use this when the diagram is the content.
- A self-contained `.html` file shows as its own page too, embedded in the issue with a link to open it full size. Its title comes from a `<name>.meta.json` file beside it, or else from the file name.

Use an artifact for a report, a dashboard or a set of design options. When a design settles, move it into a docs section. [Writing content](../10_writing-content/01_overview.md) covers diagrams and artifacts in full.
