---
title: "Lifecycle vocabulary — final decided model (ground truth)"
---

The decided lifecycle model, graduated from `brainstorm/01_discuss_lifecycle-decisions.md`
(sidhantha ↔ claude, 2026-07-02). Every downstream subtask (03–09) implements against
THIS file. If anything here conflicts with the issue body or a subtask, this note wins.

## The model — 4 hardcoded categories, 7 hardcoded statuses

Both levels are **fixed in framework code** (Variant 2). Users cannot add categories
OR statuses — the app simplifies, like GitHub's open/closed; the line between
customization and what's allowed is drawn here deliberately. The only permitted
customization is **color override** in root `settings.jsonc` (presentation only).

| Category (display) | Status id | Color | Meaning |
|---|---|---|---|
| **Not Started** | `open` | `#888888` | Default entry state. |
| **Not Started** | `blocked` | `#d1854f` | Structurally dependent on another issue/subtask. Reason in prose (comment / body). Not for "agent has a question" — that's `input-needed`. |
| **In Progress** | `in-progress` | `#61afef` | Actively being worked. Agents set this automatically when they start executing. |
| **Review** | `input-needed` | `#e8a54b` | Agent (or human) is stuck and needs **user input to proceed**. The question is written inline in the subtask/issue body; after it's answered the agent may delete it or keep the Q+A logged inline — agent's choice. |
| **Review** | `review` | `#f0c674` | Work completed, awaiting human verification/sign-off. |
| **Closed** | `done` | `#7ec699` | Terminal: shipped/accepted. Human-only transition. |
| **Closed** | `dropped` | `#c678dd` | Terminal: deliberately abandoned. Human-only; requires an explaining comment first. |

Category ids: `not-started` · `in-progress` · `review` · `closed`. Notes on naming:
Review was **promoted from status-within-In-Progress to its own category** — it is
the "needs a human" bucket, and its two statuses disambiguate *why* (stuck vs
verify). `done`/`dropped` replace `closed`/`cancelled` so no status duplicates a
category name. The trimmed sketch candidates `pending`, `not-started` (as status)
and `waiting` were rejected as synonyms of `open` / `blocked` / `input-needed`.

## Storage & enforcement

- **One exported constant** in the framework (issues loader) declares statuses,
  their category grouping, and default colors. UI, CLI (`docs-guide`), and validator
  all consume that single constant — this ends today's three-copies drift
  (loader type + `_lib.mjs` + `check.mjs` each hardcoding their own list).
- **Issues and subtasks share the field name `status`** (subtask `state` is renamed —
  subtask 07) and share the same enum + validation. Files store ONLY the status;
  the category is always derived, never stored, never written in an issue file.
- **Unknown status = hard error.** Loader/server startup fails (dev overlay/build
  error) with a **detailed, copy-pasteable message**: offending file(s), offending
  value, the legal vocabulary, and the instruction to run the migration check /
  hand the message to the AI. Migration tooling *reports*; the AI fixes judgement
  calls manually. No silent defaulting (today invalid subtask states silently become
  `open` — that behavior is removed).
- **Transitions are NOT enforced.** Any jump is legal (open → done directly, etc.).
  The transition guidance is convention, 100% at user/agent discretion.
- Root `settings.jsonc` `fields.status`: `values` no longer user-definable — the
  section shrinks to optional `colors` overrides. Priority / component / labels
  stay user-defined as today.

## Agent rules under the new model

1. Agent sets `in-progress` automatically when it starts executing. No ceremony.
2. Agent hits a wall → `input-needed` + the question written **inside the
   subtask/issue file itself** (survives context resets). Never `blocked` for
   questions; `blocked` is only for structural dependency on another item.
3. Work finished → `review` with a verifiable artefact. **Agent ceiling is the
   Review category**: `done`/`dropped` are human-only; `dropped` needs a comment.
4. Default agent search scope: categories Not Started + In Progress + Review
   (i.e. everything not Closed).
5. Review-debt promotion: an issue with any subtask in the **Review category**
   (either status) surfaces as needing attention. `blocked` does NOT promote —
   it rests; its reason is read in place.

## UI

- **Filter tabs are the 4 categories, not the 7 statuses** — status-level tabs
  would clutter and lose the holistic picture. Status stays visible as the badge
  (with its color) on each row/card. Category tab order: In Progress · Review ·
  Not Started · Closed (Review highlighted as today).
- Subtask counts/badges use the same statuses + colors.

## Migration (rides subtask 07's script, one pass)

- Field rename `state:` → `status:` in all subtask frontmatter (all trackers:
  `data/todo/`, `data/todo-testing/`, demo issues).
- Value maps: `closed` → `done`, `cancelled` → `dropped` (issues AND subtasks).
  `open`/`review` unchanged. Mechanical, idempotent, modeled on
  `migration/2026-06-22_done-to-state.py`.
- **No automatic status assignment from labels** — statuses start honest; the
  status field is the single source of truth for in-progress from day one.
- **`wip` label: kept, deprecated slowly** — annotate as deprecated in the
  vocabulary comment; don't strip it from issues. The one `blocked`-labeled issue
  gets a human glance (if a real dependency, hand-set `status: blocked`).
