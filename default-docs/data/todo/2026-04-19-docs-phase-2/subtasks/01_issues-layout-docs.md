---
title: "Issues layout — docs"
state: open
---

Absorbed from `2026-04-10-issues-layout/subtasks/06_documentation-and-skills.md`. User-guide and dev-docs coverage for the **issues** content type.

## User guide — `19_issues/` ✅ shipped 2026-04-21

Restructured from the original flat 6-file plan into 10 top-level entries (3 subfolders) after re-reading the design notes and design-philosophy note. Added `design-philosophy`, `lifecycle-and-review`, `workflows/*`, and `using-with-ai` as standalone pages — the 4-state review handoff and AI discipline needed their own surface, not buried inside a sub-docs page.

- [x] `01_overview.md` — what it is · 4-content-types table · file-types map
- [x] `02_design-philosophy.md` — **new** · 1–4 person AI-augmented team · no sprints · why `review` · pros/cons
- [x] `03_folder-structure.md` — folder naming regex · per-issue contents · URL shapes · draft at two levels
- [x] `04_settings/01_per-issue.md` — full metadata schema · field semantics · validation
- [x] `04_settings/02_vocabulary.md` — tracker-root `settings.json` · preset views · tracker-wide draft
- [x] `05_sub-docs/01_issue-md.md`
- [x] `05_sub-docs/02_comments.md` — NNN_YYYY-MM-DD_author naming · rationale
- [x] `05_sub-docs/03_subtasks.md` — 4-state frontmatter · rendering
- [x] `05_sub-docs/04_notes.md` — supporting design docs · vs issue.md vs comments
- [x] `05_sub-docs/05_agent-log.md` — iteration discipline · 4-section body · subgroups
- [x] `06_lifecycle-and-review.md` — 4-state model · review handoff · subtask-debt promotion
- [x] `07_ui/01_list-view.md` — state tabs · preset strip · filter bar · URL state
- [x] `07_ui/02_detail-view.md` — 3-column layout · Overview/Comprehensive tabs · meta sidebar
- [x] `08_workflows/01_create-an-issue.md` — step-by-step
- [x] `08_workflows/02_work-an-issue.md` — pickup / advance subtask / comment / hand off
- [x] `08_workflows/03_review-and-close.md` — human's side of the review handoff
- [x] `09_using-with-ai.md` — `/issues` skill (planned) · mental model · 4 rules · helper scripts (planned)
- [x] `10_setup-new-tracker.md` — vocabulary design · site.yaml mount · multiple trackers

## Dev docs — `15_layout-system/09_issues-layout/` (new)

- [ ] `01_overview.md`
- [ ] `02_data-interface.md` — folder-per-item, `settings.json`, vocabulary
- [ ] `03_components.md` — IndexLayout + DetailLayout + `parts/` split pattern
- [ ] `04_sub-doc-urls.md` — subtasks / notes / agent-log routes, legacy-hash redirect
- [ ] `05_conventions.md` — `<script type="application/json">` config pattern, `:global()` gotcha for JS-rendered nodes

## Out of scope for this subtask

- Claude skill `.claude/skills/issues.md` — separate workstream, lives under the source subtask's "Skill content" section.
- Helper Node scripts (`scripts/issues/*.mjs`) — source subtask's "Helper Node scripts" section.
