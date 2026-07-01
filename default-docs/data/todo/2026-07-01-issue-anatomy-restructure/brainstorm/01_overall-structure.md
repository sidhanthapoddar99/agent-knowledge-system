# Issue structure

> **Brainstorm — working surface.** This is where we finalize the issue anatomy before it
> graduates into `notes/01_issue-anatomy-guide.md` (process → product). One heading per
> part; §1 is the whole-picture overview, §2–§7 are the per-section deep-dives we complete
> **one at a time**.

---

## 1 · Overall

An issue is a single folder (`YYYY-MM-DD-<slug>/`) capturing one coherent unit of
*thinking + execution*. Everything below lives inside it. Use whichever parts fit the
work — there's a natural flow (deliberate → write down → plan → execute) but **no required
order**; parts are organized by *what they hold*, not a fixed sequence.

### What exists

The sidebar shows two groups — **This issue** (framework views, always present) and the
**content sections** (folders you fill as needed).

**This issue** — framework-provided, on every issue:

- **Overview** — `issue.md`: the problem, context, and metadata (`settings.json`).
- **Comments** — the flat evolution log (§2).
- **Comprehensive** — every subtask on one page.
- **Guide** — an **auto-generated** reference block (mechanical, not authored markdown). It
  describes this issue's anatomy and the **options currently available**: what
  subtasks / agent-logs / agent-memory / notes / brainstorm are, the effective **agent-log
  kind options** (default set, or this issue's custom set from `settings.json`), how to set
  colours, how to add & interpret comments, and how to add more agent-log options. Same on
  every issue unless the issue customized its vocabulary.
- **Glossary** — optional per-issue `glossary.md`, rendered as-is (**pure markdown, no
  generation**). Issue-focused prose: the keywords that matter for understanding *this*
  issue, its structure if useful, and any colour / naming schemes the author wants to
  define. Blank-state prompt when absent.

**Content sections** — folders, create only what you need:

- **Brainstorm** (`brainstorm/`) — active deliberation (§3).
- **Notes** (`notes/`) — finalized output + references (§4).
- **Subtasks** (`subtasks/`) — the plan (§5).
- **Agent Log** (`agent-log/`) — execution record (§6).
- **Agent Memory** (`agent-memory/`) — AI working state (§7).

### Folder shape + nomenclature

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
  small `NN` badge. (Agent-log's `#<iteration>` overrides this — see §6.)

### Kinds within a section (metadata, never a folder)

Two sections label *what sort* of work an entry is. Kind is always **metadata**, never
encoded as a folder name:

- **Brainstorm kinds** — research · exploration · discussion · ideation. One free-form shape.
- **Agent-log kinds** — loop (`lp`) · audit (`au`) · refactor (`rf`) ·
  iteration (`it`) · workflow (`wf`). The 2-letter **code lives in the activity folder
  name** (`NNN_<code>_<name>/`); the code→`{name, icon}` **mapping is a dictionary in the
  issue's `settings.json`** (`agentLogKinds`), falling back to the framework default when
  absent. Renders as a **small symbol on the folder row** (name on hover), and the **Guide**
  lists the effective set. The mapping is *not* a glossary concern. (See §6 for the full
  layout + symbol palette.)

### Ownership + the boundaries that keep parts distinct

- **Brainstorm (process, in-flux) ≠ Notes (product, finalized).** When brainstorm resolves,
  the conclusion **graduates into Notes**; the brainstorm trail stays as the record of how.
- **Subtasks (the *what*) ≠ Agent Log (the *how*).**
- **Notes (human-curated) ≠ Agent Memory (AI scratchpad).** Same free-form feel, different
  owner and durability. **Agent Memory is agent-autonomous** — the AI decides what to write,
  edit, or delete there and maintains it continuously, *unless the user directs otherwise*.
  Issue-scoped; complements, never replaces, global agent memory.
- **Comments are a log, not a forum** — they record *that* something changed / a hand-off
  happened; the debate that produced it lives in Brainstorm.

### Cross-cutting: colour

Any subdoc file may carry an optional `color:` frontmatter that tints its sidebar label. It
has **no framework-defined meaning** — it's issue-defined. Document what your colours mean
in that issue's **`glossary.md`**; that legend is what makes them legible. Prefer values
from the theme palette so they stay readable in dark and light mode.

---

## 2 · Issue + Comments

**Scope:** the two human-curated bookends — the Issue body (problem, context, metadata) and
Comments as a lean **flat** evolution log (what changed / status shifts / hand-offs).

### To discuss
- _tbd_

### Decided
- _tbd_

---

## 3 · Brainstorm

**Scope:** active deliberation — research, exploration, discussion, ideation. The *process*
of deciding what to do; its conclusion graduates into Notes.

### To discuss
- _tbd_

### Decided
- Name is **Brainstorm** (chosen as the umbrella over "discussion" / "research" — those are
  *kinds* of brainstorming, not separate sections).

---

## 4 · Notes

**Scope:** finalized output + durable references — the decided approach you build on, plus
research/links. The *product*.

### To discuss
- _tbd_

### Decided
- _tbd_

---

## 5 · Subtasks

**Scope:** the plan — a checklist of what's to be done, each with a state
(open / review / closed / cancelled).

### To discuss
- _tbd_

### Decided
- _tbd_

---

## 6 · Agent Log

**Scope:** the execution record — autonomous loops & workflows for **long-running work**.
The first level is **activity folders** (`NNN_<code>_<name>/`): kind encoded in the folder
name, pinned meta files + milestones inside.

### Nomenclature

```
agent-log/
├── 010_lp_implement-limiter/    ← activity folder: NNN_<code>_<name>/
│   ├── 00_goal.md               ← generic name — kind is already in the folder code
│   ├── 01_summary.md            ← outcome TL;DR
│   ├── 02_task_list.md          ← the checklist
│   ├── 101_token-bucket.md      ← milestone: MNN_<name>, M≥1  → shown "#<iteration> token bucket"
│   └── 102_redis-backing.md
├── 020_au_edge-cases/
└── 030_rf_extract-helper/       ← every entry is an activity folder (the norm)
```

### How to write it

**This is the ideal structure** — the one to reach for by default: activity folders,
kind-in-the-name, symbols in the sidebar. Author it in two places:

**1 · `settings.json`** — declare only *custom* kinds (the 5 defaults come free). Each entry
is `{ name, icon }` (icon from the symbol palette), or a shorthand string for a generic icon:

```jsonc
{
  "title": "…", "status": "open", "priority": "high", "component": ["…"],
  "agentLogKinds": {
    "ex": { "name": "experiment", "icon": "flask" },  // custom code + chosen symbol
    "hf": "hotfix"                                      // shorthand → generic icon
  }
}
```

**2 · The `agent-log/` folder** — an `NNN_<code>_<name>/` folder per activity, with the
pinned meta files up top and `MNN_` milestone files below (see the tree above). A milestone
file carries its own frontmatter — `iteration` is what drives the `#N` badge:

```markdown
---
iteration: 1            # → shown as "#1"; independent of the 101_ filename prefix
agent: claude-opus-4-8
status: success         # in-progress | success | failed
date: 2026-06-30
---
# <short milestone title>
## Goal … ## Approach … ## Result … ## Next
```

**Compatibility (possible, but not ideal).** If you'd rather log directly — a flat
`agent-log/NNN_note.md` with no activity folder, or some other shape — it still **parses**
and renders; the loader is tolerant. But it's an escape hatch, **not the recommended
structure**: agent-logs are for long-running work, so the folder-per-activity shape is the
norm you should reach for by default.

### Decided

- **Activity folder:** `NNN_<code>_<name>/` — `NNN` orders (2–5 digit prefix), `<code>` is
  the kind, `<name>` describes. **Kind moves from `settings.json` into the folder name**
  (reverses the earlier "kind is metadata, never a folder" call).
- **Kind codes (in the folder name):** `lp` loop · `au` audit · `rf` refactor ·
  `it` iteration · `wf` workflow.
- **Kind mapping (in `settings.json`, not the folder).** The folder name carries the *code*;
  each code maps to `{ name, icon }` via a dictionary in the issue's `settings.json`:
  `"agentLogKinds": { "ex": { "name": "experiment", "icon": "flask" } }` (shorthand
  `"ex": "experiment"` also accepted → generic icon). **Merge semantics** — the 5 framework
  defaults are always available; the dictionary only *adds / overrides*, so an author declares
  just their custom codes. **Per-issue only** (no root-level layer). Single source of truth,
  surfaced in the **Guide** (effective set = defaults + this issue's additions). The
  **Glossary is not involved** — it stays pure author markdown.
- **Symbol palette.** Kinds render as **symbols, not text** — cleaner and compact. A curated
  palette of ~15–20 allowed icons ships in the framework
  (`layouts/issues/default/server/agent-log-icons.ts`); custom kinds pick one **by name**
  (`icon: "flask"`), falling back to a generic tag icon if unset/unknown. The **Guide** will
  list each symbol → meaning; meanwhile the sidebar shows the name on hover.
- **Badge rendering.** An activity folder renders as **`NN  <symbol>  <name>  …  <count>`** —
  numeric prefix, then the kind **symbol up front** (fast custom CSS tooltip = name; the native
  `title` delay isn't adjustable), the clean name (order prefix **and** a leading `^[a-z]{2}_`
  code stripped), and the file count on the right. If the two-letter code isn't a known kind,
  no symbol and the name keeps the code (graceful fallback). Milestones keep their
  `#<iteration>` badge.
- **Pinned meta files** (`0NN`, no `iteration`): `00_goal.md`, `01_summary.md`,
  `02_task_list.md`. Kept at the top, generic names since the kind is on the folder.
  **Badge-less** — no `NN` badge; badges are reserved for kind (folders) and `#<iteration>`
  (milestones). Ordering still follows the `0NN` prefix.
- **Milestones:** `MNN_<name>.md`, `M ≥ 1` (`1NN`, `2NN`, …). The `M≥1` leading digit is
  what separates them from the `0NN` meta files. Displayed as **`#<iteration> <name>`**,
  where `iteration` is a **frontmatter** field independent of the `MNN` prefix — the prefix
  orders on disk, `iteration` drives the badge and the iteration sort-bucket. Keep failed
  milestones — they're signal.
- **Activity folders are the norm.** Agent-logs capture long-running work, so the first
  level is folders — even small work gets an activity folder. A flat `NNN_<name>.md` at the
  `agent-log/` root still parses (**backward compatibility**) but is **not** the
  going-forward convention.

### Guide vs Glossary (settled)

- **Guide = auto-generated**, mechanical. Reflects the issue: anatomy of each section + the
  *effective* agent-log kind options (default or the issue's `settings.json` custom set), how
  colours/comments work, how to add more kinds. Same everywhere unless the issue customized.
- **Glossary = pure `glossary.md`**, author markdown. This-issue keywords, structure, and
  optional colour/naming schemes. No generation, ever.

### Implementation notes (subtask 03)

- Add an `agentLogKinds` reader (issue `settings.json`, default-fallback) → expose the
  effective mapping on the `Issue`.
- Extend the folder-label parser: strip a leading `^[a-z]{2}_` after the order prefix; emit
  the kind's **full name** as the folder badge (look up code → name in the effective mapping).
- Suppress the `NN` badge on `0NN` meta files (badge-less); keep their prefix ordering.
- **Guide becomes generated** (not the static `guide.ts` blob): its "agent-log kinds" list is
  built from the effective mapping. Most of the legend stays constant; the options list varies.
- Migrate the demo: **remove** the hand-written glossary kinds section; add `agentLogKinds`
  (the custom `ex`) to its `settings.json`.

---

## 7 · Agent Memory

**Scope:** AI-mutable working state for this issue — durable facts worth not rediscovering.
Free-form, always-on, agent-managed, issue-scoped.

### To discuss
- _tbd_

### Decided
- _tbd_
