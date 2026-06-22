---
title: "`docs:issues_layout` Author the `issues` Claude skill (+ helper Node scripts)"
state: closed
---

The `issues` skill is the operating manual that lets an AI agent treat this tracker as its own queue. It must cover *traversal, reading, writing, the review handoff,* and *agent-log discipline* — and ship with helper Node scripts so the agent can filter / scan without dumping every file into context.

> **History:** the spec for this skill originally lived in `2026-04-10-issues-layout/subtasks/06_documentation-and-skills.md` alongside the issues-layout user/dev docs. The docs portion was absorbed into `2026-04-19-docs-phase-2`; the skill + scripts portion was moved here so all skill work lives under `2025-06-25-claude-skills`.

## Reference docs — read before authoring

Every documentation-template install ships with a user-guide under `dynamic_data/data/user-guide/`. The skill spec must align with what the user-guide says — **read the relevant pages first** so the skill stays in sync with the docs (and update both together if anything is missing).

For this skill, the canonical user-guide section is:

- `dynamic_data/data/user-guide/19_issues/` — full content-type coverage:
    - `01_overview.md`, `02_design-philosophy.md`, `03_folder-structure.md`
    - `04_settings/` — per-issue + tracker-vocabulary
    - `05_sub-docs/` — `issue.md`, comments, subtasks, notes, agent-log
    - `06_lifecycle-and-review.md` — the 4-state model + review handoff
    - `07_ui/` — list view + detail view
    - `08_workflows/` — create / work / review-and-close narratives
    - `09_using-with-ai.md` — agent rules
    - `10_setup-new-tracker.md` — vocab + mounting
- `dynamic_data/data/user-guide/05_getting-started/05_claude-skills.md` — skill catalogue page (must add an `issues` row when this skill ships)

## Content checklist

Mini todo list of what the skill must cover. The detailed sections below flesh each item out.

### Properties of an issue

- [ ] All `settings.json` fields — `title`, `status`, `priority`, `component`, `milestone`, `labels`, `assignees`, `updated`, `due`, `draft`
- [ ] Type + required-vs-optional for each field
- [ ] What `null` / missing means

### Structure

- [ ] Folder-per-issue layout (`YYYY-MM-DD-<slug>/`) — naming regex + what each file means
- [ ] Task / subtask file format — frontmatter (`title`, `done`, `state`), body structure, `NNN_<slug>.md` numbering
- [ ] Supporting files — `notes/`, `agent-log/`, assets; when to use which
- [ ] Vocabulary layers —
    - [ ] Tracker-wide vocabulary (root `settings.json` → `fields`: status, priority, component, milestone, labels)
    - [ ] Per-issue values drawn from that vocabulary
    - [ ] Per-subtask `state` (same 4-state model, tracked independently per subtask)

### Rules for creating / updating

- [ ] The 4 lifecycle states and allowed transitions (open → review → closed | cancelled)
- [ ] **AI rule** — always mark `review`, never `closed` directly. `closed` is a human-only transition in autonomous mode.
- [ ] **AI rule** — default search scope is `open` + `review`. Skip `closed` / `cancelled` unless the prompt explicitly asks for them, to avoid noisy re-reads of shipped work.
- [ ] Subtask review-debt promotion — an `open` issue with any `review` subtask surfaces on the Review tab and should be treated as review-gated

### Searching and indexing

- [ ] `grep` / `find` recipes for common queries — keyword hits, `status:` scans in `settings.json`, subtask `state:` scans, comments by author
- [ ] Guidance to spawn a **Haiku subagent** for bulk scanning — summarise across many files instead of loading each into the main context
- [ ] Helper JS filter scripts — multi-filter (status + priority + component + labels + milestone), AND across fields / OR within, terse `id\tstatus\ttitle` output by default, `--json` for full records

## Skill content — what the agent needs to know

### 1. Folder & file layout

- [ ] Document the tracker root: `<base>/settings.json` (vocabulary), `<base>/<YYYY-MM-DD-slug>/` per issue
- [ ] Document the per-issue layout: `settings.json` (metadata), `issue.md` (overview body), `comments/NNN_<date>_<author>.md`, `subtasks/NNN_<slug>.md`, `notes/<slug>.md`, `agent-log/NNN_<slug>.md`
- [ ] Frontmatter conventions for each file type (issue, subtask, note, agent-log, comment)
- [ ] What a stray root-level `.md` means (it's a warning — surface it, don't ignore it)

### 2. Traversal — finding work

- [ ] How to list all issues (read `<base>/<YYYY-MM-DD-*>/settings.json` files)
- [ ] How to filter by status, label, component, milestone *without parsing every body file* — use the helper scripts (below)
- [ ] How to find "what's open and assigned to me" / "what's in review" / "what's blocked"
- [ ] How to follow a subtask reference back to its parent issue
- [ ] How to read a single issue end-to-end (overview + comments in order + subtasks in order + recent agent logs)

### 3. Reading — what each piece means

- [ ] `issue.md` = the goal / context. Read first.
- [ ] `comments/` = chronological discussion. Read in order if the issue has been touched recently.
- [ ] `subtasks/` = atomic units of work, each with its own state. Read all when planning.
- [ ] `notes/` = supporting design docs. Read when subtask references them or when the issue body links to them.
- [ ] `agent-log/` = audit trail of prior AI iterations. **Always read before starting work** — past iterations may have failed approaches you'd otherwise repeat.

### 4. Writing — how the agent updates the tracker

- [ ] How to create a new subtask file (frontmatter shape, numeric prefix, state)
- [ ] How to update a subtask's `state` (open → review → closed → cancelled) — directly via file write OR via the `POST /__editor/subtask-toggle` endpoint
- [ ] How to add a comment (next sequence number, today's date, agent identifier)
- [ ] How to write an agent-log entry (when to start a new file vs. extend existing)
- [ ] When NOT to edit: don't touch closed / cancelled issues without an explicit human prompt; don't rewrite history in `comments/` or `agent-log/`

### 5. The review handoff — when to mark `review` vs `closed`

This is the most important thing the skill teaches.

- [ ] **Mark `review`** (not `closed`) when:
  - The implementation is done from the agent's perspective
  - All subtasks in the issue are `review` or `closed`
  - There's a verifiable artefact for the human to inspect (PR, file diff, screenshot, test output)
  - The agent-log captures what was tried and what the final state is
- [ ] **Never mark `closed` directly from `open`** in autonomous mode — that bypasses the review gate. Closed is a *human* transition.
- [ ] Acceptable agent-driven transitions: `open → review`, `open → cancelled` (with a comment explaining why), `review → open` (if the agent gets pushback in a comment and resumes work)
- [ ] **When the human flips to `closed`**, the agent's next action is to close out the agent-log with a final entry summarising the shipped state. Do not leave dangling in-progress logs.

### 6. Agent-log discipline — how to use the per-issue audit trail

- [ ] One file per *iteration*, not per minute. An iteration is "I attempted approach X; here's what happened"
- [ ] Frontmatter fields: `iteration` (sequential int), `agent` (model name), `status` (in-progress | success | failed), `date` (YYYY-MM-DD)
- [ ] Body structure: **Goal** (what was being attempted) → **Approach** (the plan) → **Result** (what actually happened, with evidence) → **Next** (what to try next, if any)
- [ ] **Failed iterations are kept**, not deleted. Future iterations read them to avoid repeating bad approaches.
- [ ] When picking up an issue with existing agent-logs, the first action is to read them all (cheap with the helper scripts) before starting fresh
- [ ] When the issue is closed, the final agent-log entry should reference the shipped commit / PR

## Helper Node scripts (`scripts/issues/`)

Plain Node CLI scripts so the agent can filter / scan without loading every issue file into context. Each script reads the tracker's filesystem directly (no HTTP), prints JSON or terse human output.

- [ ] `list.mjs [--status open|review|closed|cancelled] [--label foo,bar] [--component X] [--milestone phase-2] [--has-review-subtasks]` — list issues matching filters as `id\tstatus\ttitle`
- [ ] `show.mjs <issue-id>` — print one issue's metadata + subtask state summary + agent-log heads (no full bodies). Optional `--full` for everything.
- [ ] `subtasks.mjs <issue-id> [--state open|review|closed]` — list subtasks for an issue with state and 1-line title
- [ ] `agent-logs.mjs <issue-id> [--last N]` — print the last N agent-log entries (default 3) — for catching up before resuming work
- [ ] `set-state.mjs <issue-id-or-subtask-path> <state>` — update status (issue) or state (subtask) frontmatter; safe path-allow-list against `dynamic_data/`
- [ ] `add-comment.mjs <issue-id> --author <name> --body <md>` — append a comment file with the next sequence number
- [ ] `add-agent-log.mjs <issue-id> --status <s> [--iteration N] --body <md>` — append an agent-log file; auto-increments iteration if omitted
- [ ] `review-queue.mjs` — list everything currently awaiting human review (issues + parent issues of review subtasks)

The scripts share a thin loader module (`scripts/issues/_lib.mjs`) that mirrors the production `loadIssues()` shape but stays read-light (no HTML rendering, no caching gymnastics — they're CLI tools, not the app).

## How an agent uses this end-to-end

The skill should walk through a worked example:

1. Agent gets a prompt: "work on issue `2025-06-25-foo`"
2. `node scripts/issues/show.mjs 2025-06-25-foo` → reads metadata + subtask states + log heads
3. `node scripts/issues/agent-logs.mjs 2025-06-25-foo --last 5` → reads recent iterations to avoid repeats
4. Plans the next iteration → starts work
5. While working: `node scripts/issues/set-state.mjs subtasks/02_*.md review` as each subtask completes
6. After working: `node scripts/issues/add-agent-log.mjs 2025-06-25-foo --status success --body "$(cat next-iteration.md)"`
7. If all subtasks are `review` or `closed`: `node scripts/issues/set-state.mjs 2025-06-25-foo review` → hand off to human
8. Human reviews, flips to `closed` → agent's next pickup writes a closing log entry referencing the shipped state

## Done when

- `.claude/skills/issues/SKILL.md` exists and covers every item in the **Content checklist** above
- `scripts/issues/*.mjs` helper CLI is in place — includes the multi-filter scripts called out in the checklist, and the skill links to it
- Search / indexing section of the skill documents the Haiku-subagent bulk-scan pattern + the `grep` / `find` recipes
- The user-guide skill catalogue (`2026-04-19-docs-phase-2/subtasks/06_claude-skills-maintenance.md`) is updated to include a row for `issues`

## Out of scope

- A web UI for the helper scripts — they stay CLI-only; the live editor + tracker UI is the human surface, the scripts are the agent surface
