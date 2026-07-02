# Subtasks — `subtasks/[<group>/[<subgroup>/]]NNN_<slug>.md`

The atomic unit of work and the **AI-handoff anchor**. Each leaf `.md` is a first-class subtask with its own state, URL, and count. Grouping folders are *labels only* — no body file.

## Shape

```yaml
---
title: "Short imperative title"
state: open
---

Body — describe the work in enough detail that someone (or an agent) can pick it up cold.
```

`state` follows the same 4-state vocabulary as issue `status` (see [03_vocabulary.md](03_vocabulary.md)), tracked independently per subtask.

A subtask may live at the root of `subtasks/`, or inside one or two levels of grouping folders (`subtasks/020_implementation/010_backend.md`, `subtasks/020_implementation/020_polish/010_styles.md`). **The folder is a label only** — no folder body file. Folders use the same numbering as leaves and sort interleaved with them. In the sidebar a group folder shows **done/total** (terminal states count as done); the section header carries the same count plus an amber review-dot when any subtask sits in `review`.

**Optional folder `settings.json`:** a group folder may carry `{ "title": "..." }` to override the slug-derived sidebar label. Skip the file when the slug already reads cleanly.

## Numbering — `NN_` or `NNN_`, gap-spaced

Subtasks use the **same shared ordering-prefix grammar as docs** (2–5 digits, ordered by *numeric value*, so widths coexist — `01_` and `010_` sort as 1 and 10; see the `documentation-guide` skill's `references/layouts/docs-layout.md`). This applies to leaf files **and** grouping folders.

Unlike docs — where 2-digit is the near-universal default — **the issue tracker treats both 2- and 3-digit as conventional** and reaches for 3-digit far more freely:

| Width | When (issues) |
|---|---|
| `NN_` (2-digit) | **Conventional** — the simple baseline for most subtask lists. |
| `NNN_` (3-digit) | **Also conventional, used freely** — when a folder holds a complex, flat-but-grouped set (the leading digit annotates a group: `110_`/`120_` = group 1, `210_` = group 2), or simply has many subtasks. Not an exception here. |
| `NNNN_` / `NNNNN_` (4–5) | **Very rare** — only when explicitly required or a genuinely exceptional case. |

**Gap-number** either width (step 10, or 5 for denser sets) so a new subtask slots *between* two existing ones without renumbering: drop `015_` between `010_` and `020_`.

**Separator:** `_` is canonical; the loader also tolerates a legacy `-` (`00-foo`) in existing folders — prefer `_` for anything new.

## How to write a subtask — readable at cold pickup

A subtask should read without prior context — the next agent (or a human reviewer)
picks it up cold. **Never a bare dump**: even a one-line task gets a sentence or two
of context-setting (what triggered it, what it serves, where the surrounding work
lives) before the checklist.

- **A short intro** saying what this subtask is and why it exists.
- **Checkboxes with a bolded lead**, then the explanation — what / where / how, with
  concrete paths and examples: `- [ ] **Move the loader.** \`src/loaders/x.ts\` → …`.
- **`##` groups** when the list outgrows a flat sequence.
- **Spell out pointers** (`<issue>/notes/02_operating-rules.md`) instead of shorthand
  ("the rules note") — shorthand rots when files move.
- **Decision markers** for anything settled mid-flight:
  `**Decided (author, YYYY-MM-DD):** …` — so decisions don't get re-litigated.

**Running-checklist pattern:** for a burst of low-nuance mechanical changes, one
subtask can serve as a running log — create it once, append a line per change, check
them off. If each change carries reasoning worth keeping, use an `it` agent-log
activity instead (see [24_agent-logs.md](24_agent-logs.md)); when ambiguous, ask.

## Create a subtask

1. **If your context on this area is thin, run the duplicate check** first (see [42_updating.md](42_updating.md)). If the search returns an existing subtask covering the same work, tell the user instead of creating.
2. Decide where it lives:
   - Single leaf → `<issue>/subtasks/NN_<slug>.md`
   - Inside a themed group → `<issue>/subtasks/NN_<group>/NN_<slug>.md`
   - Inside a sub-phase → `<issue>/subtasks/NN_<group>/NN_<subgroup>/NN_<slug>.md` (deepest the loader accepts)
3. Find the next prefix in the target folder: `ls <target-folder>/` → use the next gap-spaced value. Folders and leaves share the numbering at each level (they sort interleaved).
4. Write the file with the standard frontmatter (`title`, `state: open`).
5. Body: enough detail to pick up cold; if a related issue/subtask turned up in the duplicate check, link to it in a "Related:" line.

## Update a subtask state

Prefer the helper (it flips `state`):

```bash
docs-guide issue set-state <issue>/subtasks/NN_<slug>.md review
```

Direct file write:

```yaml
---
title: "..."
state: review
---
```

Or via the editor API if running locally: `POST /__editor/subtask-toggle`. Prefer **direct file writes / the helper** unless the user explicitly asks to use the editor API.

> **AI rule:** mark subtasks `review`, never `closed` — `closed` is a human-only transition (see the AI rules in [00_overview.md](00_overview.md)).

## vs. a loop task-list in `agent-log/`

`subtasks/` is the issue's durable **plan / decomposition** — first-class, stateful, counted. A loop's `002_task-list.md` inside `agent-log/` ([24_agent-logs.md](24_agent-logs.md)) is the agent's *working checklist for one run* — ephemeral, scoped to that loop. **Plan vs execution.** Don't recreate subtasks inside agent-log, or vice-versa.
