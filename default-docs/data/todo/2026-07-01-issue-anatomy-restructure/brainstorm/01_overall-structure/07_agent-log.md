# Agent Log

**Scope:** the execution record — autonomous loops & workflows for **long-running work**.
The first level is **activity folders** (`NNN_<code>_<name>/`): kind encoded in the folder
name, pinned meta files + milestones inside.

## Nomenclature

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

## How to write it

**This is the ideal structure** — the one to reach for by default: activity folders,
kind-in-the-name, symbols in the sidebar. Author it in two places:

**1 · `settings.json`** — declare only *custom* kinds; the 5 defaults come free:

| Code | Kind | Icon | Use for |
|---|---|---|---|
| `lp` | loop | `repeat` | Autonomous multi-iteration runs toward one goal. |
| `au` | audit | `search` | Systematic review / inspection sweeps. |
| `rf` | refactor | `wrench` | Structural rework with no behaviour change. |
| `it` | iteration | `refresh-cw` | Rapid ad-hoc change bursts. |
| `wf` | workflow | `git-branch` | Multi-stage orchestrated pipelines. |

Each custom entry is `{ name, icon }` (icon from the symbol palette), or a shorthand
string for a generic icon:

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

## Fast bursts — subtask running-log vs an `it` activity

For rapid ad-hoc changes landed in a burst, pick the logging home by how much **nuance**
each change carries (the *what vs how* boundary applied to a fast loop):

- **Low-nuance / mechanical** → one **subtask** used as a running checklist — create it
  once, append a line or two per change, check them off. (This issue's
  `06_issues-layout-restructuring` subtask is the worked example.)
- **Carries reasoning / decisions** → an agent-log activity of kind **`it` (iteration)** —
  when each change has a *why*, a weighed alternative, or a gotcha, the milestone shape
  preserves what a checklist line would lose.
- **When ambiguous, ask the user which mode they want** — don't default silently.

## Decided

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
  **Glossary is not involved** — it stays pure author markdown (see `09_guide` / `10_glossary`).
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
  (milestones). Ordering follows the `0NN` prefix. The trio is the **standard set, not a
  fixed one** — the user *or the agent* can add more `0NN` meta files as needed
  (e.g. `03_references.md`), and any of them can be **omitted** when an activity doesn't
  need it (a folder with only milestones is valid).
- **Milestones:** `MNN_<name>.md`, `M ≥ 1` (`1NN`, `2NN`, …). The `M≥1` leading digit is
  what separates them from the `0NN` meta files. Displayed as **`#<iteration> <name>`**,
  where `iteration` is a **frontmatter** field independent of the `MNN` prefix — the prefix
  orders on disk, `iteration` drives the badge and the iteration sort-bucket. A milestone
  is a **substantial completed chunk** (~3–6 per activity, *not* one per step, *not*
  synced to subtask count). Keep failed milestones — they're signal.
- **Milestone status colour.** The `#<iteration>` badge is tinted by the milestone's
  frontmatter `status`: not-started → **grey**, in-progress → **blue**, success/completed →
  **green**, failed → **red** (theme tokens `--color-text-muted / --color-info /
  --color-success / --color-error`). Makes the "keep failed milestones" signal *visible*.
- **Ordering (all subdoc trees).** Precedence: **bucket** (agent-log non-iteration first) →
  **iteration** `#N` → **numeric prefix value** (mixed widths sort by value — `70` before
  `200`, not lexically) → **lexicographic** tie-break. Unprefixed sorts last.
- **Activity folders are the norm.** Agent-logs capture long-running work, so the first
  level is folders — even small work gets an activity folder. A flat `NNN_<name>.md` at the
  `agent-log/` root still parses (**backward compatibility**) but is **not** the
  going-forward convention.

## Implementation notes (subtask 03)

- Add an `agentLogKinds` reader (issue `settings.json`, default-fallback) → expose the
  effective mapping on the `Issue`.
- Extend the folder-label parser: strip a leading `^[a-z]{2}_` after the order prefix; emit
  the kind's **full name** as the folder badge (look up code → name in the effective mapping).
- Suppress the `NN` badge on `0NN` meta files (badge-less); keep their prefix ordering.
- Migrate the demo: **remove** the hand-written glossary kinds section; add `agentLogKinds`
  (the custom `ex`) to its `settings.json`.
- Guide generation → see `09_guide`.
