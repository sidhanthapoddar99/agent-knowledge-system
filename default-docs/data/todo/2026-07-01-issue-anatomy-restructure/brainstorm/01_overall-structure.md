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
- **Guide** — the static anatomy legend, bundled in the framework, identical everywhere.
- **Glossary** — optional per-issue `glossary.md`: key terms, semantics, and any colour
  conventions this issue uses. Shows a blank-state prompt when absent.

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
- **Agent-log kinds** — loop · workflow · audit · refactor · fast-iteration. Declared in
  each activity folder's `settings.json` (`{ "kind": "loop" }`) → renders as a sidebar
  badge; each kind seeds a goal file.

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

**Scope:** the execution record — autonomous loops & workflows as `NNN_<name>/` activity
folders (kind in `settings.json`, milestone files, `#<iteration>` badge), with a trivial
one-off allowed as a flat file.

### To discuss
- _tbd_

### Decided
- _tbd_

---

## 7 · Agent Memory

**Scope:** AI-mutable working state for this issue — durable facts worth not rediscovering.
Free-form, always-on, agent-managed, issue-scoped.

### To discuss
- _tbd_

### Decided
- _tbd_
