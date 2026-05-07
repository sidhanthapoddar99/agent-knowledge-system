---
author: claude
date: 2026-05-07
---

## Verification of completion (2026-05-08)

Cross-checked each item end-to-end across code, settings, docs, plugin, and templates. Results below.

| # | Item | Code | Existing issues `settings.json` | Docs (user-guide) | Plugin (skill refs + validators) | Templates / starter | Status |
|---|---|---|---|---|---|---|---|
| 1 | **Drop `milestone`** | 0 residuals | stripped from all 36 issues + tracker vocab | all 19_issues pages clean | `list.mjs`/`show.mjs`/`check.mjs` clean; `issue-layout.md`/`writing.md` clean | `template/data/issues/settings.json` has no milestone | ✅ Complete |
| 2 | **Drop `due`** | 0 residuals (no `isOverdue`, no `--due-after`/`--due-before`) | stripped from all issues | clean | clean | clean | ✅ Complete |
| 3 | **Drop manual `updated`** | no `meta.updated`/`settings.updated` reads; derived via `getIssueDate()` cache loader | stripped from all issues | "derived from git" framing in writing.md & user-guide | `show.mjs` derives via local `git log -1`; refs updated | no `updated` field in template | ✅ Complete |
| 4 | **Priority as first-class column** | `IssuesTable.astro:36` `{ key: 'priority', sortable: true }`; default sort `priority desc, updated desc` (`client.ts:341–352`); filterable via `FILTER_FIELDS` in `IndexBody.astro:26` | n/a | `07_ui/01_list-view.md:84` calls out "**Sortable column** … default sort `priority desc, updated desc`" | n/a | n/a | ✅ Complete |
| 5 | **Best-practice: 1 component per issue** | n/a | **6 issues currently violate** (declare 2–3 components) — not yet triaged | documented in overview + 3 other pages | `check.mjs:101–103` soft hint fires when `components.length > 1` | n/a | ⚠️ Partial — doc + validator complete; existing multi-component issues NOT individually reviewed |
| 6 | **Best-practice: ≥1 subtask for AI-handoff issues** | n/a | vacuously compliant (0 issues currently AI-assigned) | documented in 3 places | `check.mjs:154–158` soft hint when `assignees ∋ {claude/gpt/codex/cursor/aider}` ∧ open/review ∧ 0 subtasks | n/a | ✅ Complete (see note) |
| 7 | **Update design philosophy** | n/a | n/a | user-guide `02_design-philosophy.md` rewritten ("Principles that shape the model"); internal note `2026-04-10-issues-layout/notes/02_design-philosophy-and-review-state.md` rewritten with "What we removed and why" historical record; CLAUDE.md tracker-mental-model paragraph in place | n/a | n/a | ✅ Complete |

### Outstanding work

- **Item 5 — triage existing multi-component issues.** 6 issues currently fire the validator hint:
  - `2026-04-26-project-rebrand` (3)
  - `2026-04-26-editor-as-standalone-product` (3)
  - `2026-04-25-framework-as-npm-package` (3)
  - `2026-04-26-framework-as-cli-tool` (2)
  - `2026-05-07-cache-isolation-cross-project` (2)
  - `2026-04-10-editor-diagrams` (3)

  Each needs a per-issue judgment call — some may be genuinely cross-cutting (the principle's explicit exception) and justified to leave; others may want to be split. A blanket sweep would be wrong. The validator keeps surfacing them every run, so they won't be forgotten.

### Semantic note on item 6

The principle as stated: "if you started working on the issue then have ≥1 subtask". The validator's operational definition: `assignees ∋ known-AI-agent-name ∧ status ∈ {open, review} ∧ subtasks == 0`. Tighter than "started working" — it specifically targets AI-handoff, not generic in-progress. That matches the rule's intent (subtasks are the AI-handoff anchor) without inventing a new "started" field.

### Subtasks ledger

- 01 (drop milestone) — closed
- 02 (drop due) — closed
- 03 (drop updated + derived cache) — closed
- 04 (priority as first-class column) — closed
- 05 (best-practice 1 component) — closed
- 06 (best-practice ≥1 subtask) — closed
- 07 (outward mental-model writeup) — closed
- 08 (update internal design-philosophy note) — closed
- 09 (dev-docs writeup of cleanup + new mechanisms) — open, deferred by design until 1–8 land (now)
- 10 (issue-dates watcher refinements — single listener + dynamic branch-ref) — closed
