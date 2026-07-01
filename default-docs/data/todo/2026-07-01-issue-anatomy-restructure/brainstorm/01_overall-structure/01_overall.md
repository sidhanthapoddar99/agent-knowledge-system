---
color: var(--color-success)
---

# Overall — the issue structure

> **Brainstorm — working surface.** One file per part of the anatomy: this file is the
> whole-picture overview; the siblings are the per-section deep-dives. **All ten are now
> settled (green)** — next step is graduating the conclusions into `notes/` (process →
> product, subtask 01).

An issue is a single folder (`YYYY-MM-DD-<slug>/`) capturing one coherent unit of
*thinking + execution*. Everything below lives inside it. Use whichever parts fit the
work — there's a natural flow (deliberate → write down → plan → execute) but **no required
order**; parts are organized by *what they hold*, not a fixed sequence.

## What exists

The sidebar shows two groups — **This issue** (framework views, always present) and the
**content sections** (folders you fill as needed).

**This issue** — framework-provided, on every issue:

- **Overview** — `issue.md`: the problem, context, and metadata (`settings.json`).
  (→ `02_issue`)
- **Comments** — the flat evolution log. (→ `03_comments`)
- **Comprehensive** — every subtask on one page, filterable by state.
- **Guide** — a static template with **generated islands** (this issue's effective
  agent-log kind set). Sections ordered **most-complex-first** — Agent log → Subtasks →
  Agent memory → Brainstorm → Notes → Comments → Issue — pointer-style, inline
  frontmatter tables, the one combined full-issue tree, right-rail "On this page"
  outline (`#guide-<slug>` deep links). (→ `09_guide`)
- **Glossary** — optional per-issue `glossary.md`, rendered as-is (**pure markdown,
  never generated**). Suggested skeleton: *Colour legend* · *Key terms* ·
  *Conventions* — tables over paragraphs, **scoped per anatomy section** (`###`
  sub-headings) when a meaning differs by section. Blank-state prompt (with the
  skeleton) when absent. (→ `10_glossary`)

**Content sections** — folders, create only what you need:

| Section | Owner | Lifecycle | Holds |
|---|---|---|---|
| **Brainstorm** (`brainstorm/`) | human + AI | in-flux | Active deliberation (→ `04_brainstorm`). |
| **Notes** (`notes/`) | human + AI | finalized | Finalized output + references (→ `05_notes`). |
| **Subtasks** (`subtasks/`) | both | plan | The checklist of what's to be done (→ `06_subtasks`). |
| **Agent Log** (`agent-log/`) | AI | append-only | Execution record (→ `07_agent-log`). |
| **Agent Memory** (`agent-memory/`) | AI | mutable | AI working state (→ `08_agent-memory`). |
| **Comments** (`comments/`) | both | append, flat | Evolution log (→ `03_comments`). |

## Folder shape + nomenclature

- Content is `*.md` files inside the section folders; `settings.json` carries metadata.
- **Ordering prefix `NN_`** — numeric, **2–5 digits**, sorted by value (`01_`, `02_`, …;
  widths coexist — gap-space to leave insert room). Separator is `_` (issue subdocs also
  tolerate a legacy `-`). Same grammar everywhere, defined once in `order-prefix.ts`.
- **Prefix is optional for issue subdocs** — notes / brainstorm / agent-memory / subtasks /
  agent-log sort by filename; an unprefixed file just shows its label (no badge). It's
  *required by convention* for docs pages.
- **Folder-with-files, up to 2 levels.** Every content section can nest: a flat file and an
  `NN_<name>/` folder sit as siblings, ordered by the same prefix. The loader walks two
  levels deep; anything deeper is warned and ignored.
- **The label** strips the prefix and turns separators into spaces; the prefix renders as a
  small `NN` badge. (Agent-log's `#<iteration>` overrides this — see `07_agent-log`.)
- **Sidebar counts:** subtask group folders show **done/total**; other sections show the
  plain descendant count. **Ordering is ascending everywhere** — one consistent rule
  (a newest-first feed for logs/brainstorm was considered and rejected).

## Kinds within a section (in the entry name, never a grouping folder)

Two sections label *what sort* of work an entry is. Kind never becomes a **grouping
folder** (no `brainstorm/research/…` buckets); it rides in the entry's own name:

- **Brainstorm kinds** — a **full word** in the filename, `NN_<kind>_<slug>.md`:
  research · explore · idea · discuss. An **open, unenforced vocabulary** — convention,
  not grammar; self-documenting in the sidebar, so no mapping and no icons.
  (See `04_brainstorm`.)
- **Agent-log kinds** — loop (`lp`) · audit (`au`) · refactor (`rf`) ·
  iteration (`it`) · workflow (`wf`). The 2-letter **code lives in the activity folder
  name** (`NNN_<code>_<name>/`); the code→`{name, icon, desc}` **mapping is a dictionary
  in the issue's `settings.json`** (`agentLogKinds`), merged over the framework defaults.
  Renders as a **small symbol on the folder row** (name on hover), and the **Guide**
  lists the effective set as a generated table (symbol · code · name · use-for). The
  mapping is *not* a glossary concern. (See `07_agent-log`.)

## Ownership + the boundaries that keep parts distinct

- **Brainstorm (process, in-flux) ≠ Notes (product, finalized).** When brainstorm resolves,
  the conclusion **graduates into Notes** (marked `**Resolved →** <target>`); the
  brainstorm trail stays as the record of how.
- **Subtasks (the *what*) ≠ Agent Log (the *how*).** For fast change-bursts, pick by
  nuance — see "Fast bursts" in `07_agent-log`.
- **Notes (human-curated) ≠ Agent Memory (AI scratchpad).** Same free-form feel, different
  owner and durability. **Agent Memory is agent-autonomous** — the AI decides what to write,
  edit, or delete there and maintains it continuously, *unless the user directs otherwise*.
  Issue-scoped; complements, never replaces, global agent memory.
- **Comments are a log, not a forum** — they record *that* something changed / a hand-off
  happened; the debate that produced it lives in Brainstorm.
- **Guide (generated, mechanical) ≠ Glossary (authored, this-issue voice).**

## Cross-cutting: colour

Any subdoc file may carry an optional `color:` frontmatter that tints its sidebar label. It
has **no framework-defined meaning** — it's issue-defined. Document what your colours mean
in that issue's **`glossary.md`** as a per-section legend (the same colour may mean
different things in Brainstorm than in Agent log); that legend is what makes them legible.
Prefer theme tokens (`var(--color-success)`, …) so tints stay readable in dark and light
mode. Separately, agent-log **milestone `#N` badges** are tinted by `status` — that one is
framework-defined (see `07_agent-log`).
