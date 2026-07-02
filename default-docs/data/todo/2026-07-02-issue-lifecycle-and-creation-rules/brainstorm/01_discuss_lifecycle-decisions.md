---
title: "Discussion: lifecycle vocabulary decisions (sidhantha ↔ claude, 2026-07-02)"
---

> **Resolved →** notes/01_lifecycle-vocabulary.md

Working session settling subtask 02's open questions before execution. Explicitly
saved at sidhantha's request ("note this down in details"). Decisions below are
**decided** unless marked open. Plan of record: finish this brainstorm → update the
subtasks to match → sidhantha starts an agent loop to execute all of it end-to-end
with self-checks.

## Decided

**1. `blocked` only — no `deferred`.** One resting state, not two. `blocked` means the
issue/subtask **depends on another specific subtask or issue** — a structural
dependency, not a mood. It is *not* the state for "agent has a question" (see rule 3).
The blocking reason lives in prose (comment or issue.md/subtask body); no structured
`blocked-by` field, no upward promotion, no stale-blocked detection (carried over from
the earlier decision in subtask 02).

**2. One shared status mechanism for issues AND subtasks.** Not just the same value
list — a **common storing/validation mechanism**: one place declares the allowed
statuses, and both the issue's `settings.json` `status` and the subtask frontmatter
draw from it. (The `state` → `status` field-name unification is subtask 07; this
decision is about the shared enum + shared validation underneath it.)

**3. Agent rules — agent manages `in-progress`; questions go to `review`, not
`blocked`.**

- The agent sets `in-progress` **automatically** when it starts executing a
  subtask/issue. No human ceremony.
- If the agent **hits a wall** (needs a human answer), it does NOT use `blocked` — it
  sets `review`. **`review` now serves two purposes:** (a) work done, awaiting human
  sign-off; (b) agent stuck on a question, awaiting human input. Both are "actionable
  for the human", which is exactly what review-debt promotion surfaces.
- **The question protocol:** the agent writes its question **inside the subtask file
  itself** (or issue.md for issue-level blockers), so a fresh context/session picks it
  up on read. When answered, the agent may either delete the question and proceed, or
  keep the Q + A logged inline in the subtask — **agent's choice**.
- `closed` stays human-only (unchanged ceiling).

**4. Status values are a HARD rule; transitions are soft.**

- The status enum is **embedded / code-enforced** — a user cannot invent a status
  outside the defined set. Using an unknown status is an **error** (not a hint-warn).
  This is a deliberate departure from "convention, never code-enforced" for this one
  axis.
- **Transitions are NOT enforced.** Any jump is legal — open → closed directly, etc.
  The transition table is general guidance only, 100% at the discretion of the user or
  agent. No code checks on moves.

**5. Nomenclature: everything becomes `status`.** Subtask `state` is renamed to
`status` for uniform naming (subtask 07 — migration script + legacy-name
warning/error already specced there). Loader/CLI should warn or error when the legacy
name is encountered.

**6. Colors — decided.** open `#888888` (unchanged) · blocked `#d1854f` (burnt
orange, one step from priority-high `#e5a663`) · in-progress `#61afef` (saturated
"active" blue, distinct from priority-low `#7aa2f7`) · review `#f0c674` (unchanged) ·
closed `#7ec699` (unchanged) · cancelled `#c678dd` (magenta — red was rejected: it
collides with priority-urgent and reads as "error", wrong for a deliberate terminal
state). Three of six keep their current colors — zero visual churn for existing
trackers.

**7. Migration — decided.**

- **Field rename (`state` → `status`): a proper migration script**, modeled on the
  existing precedent `plugins/documentation-guide/skills/documentation-guide/migration/2026-06-22_done-to-state.py`
  (idempotent, stdlib-only, check/migrate modes, frontmatter-preserving) and the
  pattern documented in `references/doc-migration.md`. This is the field's second
  rename (`done` → `state` → `status`).
- **No automatic status assignment from labels.** Statuses start honest (everything
  stays `open`) and become true as work actually touches each issue. The status
  field is the **single source of truth** for in-progress from day one.
- **`wip` label: keep it, deprecate slowly.** Do NOT remove it from the vocabulary or
  strip it from issues — annotate it as deprecated in the vocabulary comment, stop
  using it for new work, let it age out. (Reversal of claude's strip-them proposal;
  sidhantha also noted labels are underused generally — "we would be using it more".)

**8. Filters are category-based, not status-based — decided.** The index UI
(tabs/filter bar) presents the three **categories**, not the six statuses — many
statuses would clutter the bar and lose the holistic picture. Category names:
**Not Started · In Progress · Closed** ("Closed" preferred over "Completed" as the
terminal category name). Status stays visible as the badge on each row; the category
is the filtering axis.

## Open — under discussion

**9. Where the category grouping lives.** Pending a code audit sidhantha requested
("check whether the categories/statuses are hardcoded inside the code or not — then
I'll tell you my decision"). Audit findings (2026-07-02):

- **Subtask states are hardcoded** — loader `issues.ts:114`
  (`type SubtaskState = 'open' | 'review' | 'closed' | 'cancelled'`, invalid values
  silently default to `open` at :630) and CLI (`_lib.mjs:65 VALID_STATES`,
  `set-state.mjs`, `check.mjs:130`).
- **Issue status is nominally settings-driven but behaviorally hardcoded.** The
  allowed values are declared in root `settings.jsonc` (`fields.status.values`) and
  `check.mjs:120` validates against that (falling back to the canonical four) — but
  the loader does NOT validate issue status at all (free `string`), and the UI
  hardcodes the four canonical values in its logic (`StateTabs` tab list,
  `IndexBody.astro:63 CLOSED_STATUSES`, review-debt promotion checks). A custom
  status added to settings.jsonc today would pass `check issues` yet render as a
  ghost — no tab, no counts.
- Net: the system is a hybrid; the hard-enum decision (4) would make honest what the
  UI already assumes. If the enum moves fully into code, root `settings.jsonc` keeps
  colors only, and the grouping naturally lives beside the enum in the same constant.

The original question, preserved verbatim below as a **format exemplar** — sidhantha:
"this is a good format for asking — a bit of description etc. lets me understand the
context way better; reuse this structure for future questions":

> **Where the category lives.** Stored field per issue vs a `groups` annotation on
> the status vocabulary in root `settings.jsonc`. I'd recommend the vocabulary
> annotation strongly: no per-issue migration, single source of truth, and it matches
> the "don't add fields without a policy reversal" doctrine — the reversal here is
> about *states*, not about a new stored field.
>
> The UI needs to know that `in-progress` and `review` belong under the **In
> Progress** heading. There are two ways to record that mapping:
>
> **Option A — every issue stores it.** Each issue's `settings.json` would get a
> second field: `"status": "review", "category": "in-progress"`. That means 27+
> files each carry a value that is 100% derivable from the status they already have,
> every future issue must set both, and the two can drift apart (status says
> `closed`, category still says `in-progress`).
>
> **Option B — the mapping is declared once, next to the enum.** Nothing new in any
> issue file. Wherever the six allowed statuses are defined, the grouping sits
> beside them, once:
>
> ```jsonc
> "status": {
>   "values": ["open", "blocked", "in-progress", "review", "closed", "cancelled"],
>   "groups": {
>     "not-started": ["open", "blocked"],
>     "in-progress": ["in-progress", "review"],
>     "closed":      ["closed", "cancelled"]
>   }
> }
> ```
>
> An issue only ever says `"status": "review"`; the UI looks up which group `review`
> belongs to. Category is *computed*, never stored.

## Round 2 — sidhantha's category/status structure proposal (2026-07-02)

Responding to the code audit in §9, sidhantha proposed **four hardcoded categories**
(a change from the earlier three — **Review is promoted to its own category**):
**Not Started · In Progress · Review · Closed**. Two variants floated:

- **Variant 1 — categories hardcoded, statuses user-definable within them.** Root
  `settings.jsonc` maps user statuses into the fixed categories; if a category has no
  statuses, the category name itself acts as the status. If the mapping is missing or
  malformed, **server startup fails** with a detailed, copy-pasteable error message
  the user can hand to the AI; the migration tooling only *reports* — the AI fixes
  the file manually. Sketch of statuses: Not Started → Pending / Blocked /
  Not Started · In Progress → In Progress / Waiting · Review → "user input required"
  (agent needs human input to proceed) / "completed, needs review" · Closed → Done /
  Dropped.
- **Variant 2 — statuses hardcoded too.** One fixed, ideal-for-agentic-workflow
  vocabulary, decided now, uniform for everyone. Rationale: the app is meant to
  *simplify* (GitHub gets by with open/closed); we're already more feature-rich than
  GitHub issues, and the line between customization and what's allowed has to be
  drawn deliberately — little legroom for user experimentation.

Constants across both variants: nomenclature is declared **once at tracker level**
(root `settings.jsonc` and/or code) — individual issues and subtasks carry **only the
status**, never the category.

**Resolution (sidhantha, 2026-07-02): Variant 2 with claude's trimmed 7-status
structure — agreed, final.** Categories: Not Started (`open`, `blocked`) ·
In Progress (`in-progress`) · Review (`input-needed`, `review`) · Closed (`done`,
`dropped`). Cuts from the sketch: `pending`/`not-started` were synonyms of `open`;
`waiting` overlapped `blocked`/`input-needed`. `done`/`dropped` chosen over
`closed`/`cancelled` so no status duplicates a category name (migration maps the old
values). The startup-hard-fail idea survives relocated: it validates issue/subtask
*files* against the fixed enum (there is no user mapping left to validate).
Review-as-category also supersedes the `review`-dual-purpose overload from decision
3 — the two meanings become two statuses. Full ground truth:
`notes/01_lifecycle-vocabulary.md`.

## Process notes

- Plan staleness (subtask 04/06 file lists predate the skill split) is acknowledged
  as inevitable — it gets fixed in the "update the subtasks" pass after this
  brainstorm, not as a separate pre-step.
- Sequencing of execution is delegated to the agent.
- Related work created mid-discussion: subtask 07 (state/status unification +
  migration script) and issue `2026-07-02-doc-issues-skill-structure` (skill
  reference restructuring, documentation-guide prerequisite, scripts' home).
