## Goal

Restructure the issue folder anatomy around the **work lifecycle** rather than an
ad-hoc pile of sub-folders. The spine:

```
Brainstorm  →  Notes  →  Subtasks  →  Agent-log (loops)  →  update Subtasks
 (decide       (record    (plan the    (run the work,         (close them out;
  what to        what we     to-dos)      milestone by           add Notes if new
  do)            decided)                 milestone)             output appears)
```

The full design lives in **`brainstorm/01_overall-structure/`** (one file per section —
the working surface). When it stabilizes it graduates into `notes/` as the finalized
issue-anatomy guide.

## What changes

- **Brainstorm** — new first-class section: active deliberation (ideation, options,
  iterations). Absorbs the old "discussion" concept. Notes-shaped, 2-level.
- **Notes** — redefined as the *finalized* output + durable research/references (the
  product you build on), vs brainstorm's in-flux *process*.
- **Agent Memory** — new sibling section: AI-mutable working state for the issue.
- **Comments** — kept **lean and flat** (no threading, no substructure): an evolution
  log of the issue, not a forum.
- **Agent Logs** — `NNN_<code>_<name>/` activity folders (kind code in the folder
  name, mapped via issue-level `agentLogKinds`), pinned meta files + `MNN_` milestones,
  milestone-not-step logging.
- `notes/`, `subtasks/`, and `brainstorm/` may all use the same `NNN_<name>/`
  folder-with-files pattern as agent-log (loader already walks 2 levels).

## Why

The current `agent-log/`-everything model over-nests (a category folder *and* a
per-activity folder), has no home for pre-decision deliberation, conflates the
discussion-forum and changelog roles in comments, and leaves AI working state buried
as a `000_` prefix. This realigns each section to a single owner + lifecycle.

## Settled so far

- Brainstorm vs Notes: **separate** (process vs product).
- Comments: **flat**, no threading — removes the only expensive framework change.
- "Discussion": **gone**, folded into Brainstorm.
- Cancelled migration-direction issues: **not merged** — stay separate, linked via
  `Related:`.
- Agent-log activity **kind**: 2-letter code in the folder name
  (`NNN_<code>_<name>/`), code → `{name, icon}` mapping in the issue's
  `settings.json` (`agentLogKinds`, merged over framework defaults).

## Related

- **`2026-05-07-tracker-mental-model-alignment`** (closed) — direct parent; codified
  the tracker's purpose and dropped PM residue. This issue extends that thinking into
  the folder anatomy.
- **`2026-06-22-numeric-ordering-prefix-convention`** (closed) — the `NNN_` grammar
  the new folders rely on.
- **`2026-05-08-runtime-stack-migration`** (open) — its architecture-update model is
  the substrate the structure should survive; some of its `notes/discussion/` content
  is really brainstorm under the new model.
