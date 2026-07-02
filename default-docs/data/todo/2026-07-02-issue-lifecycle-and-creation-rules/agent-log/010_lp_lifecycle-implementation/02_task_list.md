---
title: "Task list — lifecycle implementation loop (running checklist)"
---

Running checklist for the loop. Tick items as they land; add discovered work under
the matching phase rather than silently doing it. Detail lives in the subtask
files — this list is the flight plan, not the spec.

## Phase 1 — Code + migration (subtasks 03 + 07, one wave)

- [ ] Exported status/category/color constant in `src/loaders/issues.ts`; old
      `SubtaskState` union + scattered lists replaced
- [ ] Shared issue+subtask validation against the constant (hard error, detailed
      copy-pasteable message; silent default-to-open removed) — implemented but
      NOT yet fatal for legacy values
- [ ] Migration script (new, dated, per `2026-06-22_done-to-state.py` precedent):
      `state:`→`status:` rename + `closed`→`done` + `cancelled`→`dropped`, all
      trackers, idempotent, check/migrate modes, validation pass as exit criterion
- [ ] Run migration on `data/todo/`, `data/todo-testing/`, demo issues; verify
      zero legacy fields/values remain
- [ ] Hard validation confirmed active + tested with a deliberate bad status
- [ ] Root `settings.jsonc`: values→fixed-comment, new colors, `wip` deprecation
      annotation
- [ ] CLI: set-state (7 statuses, both levels, **subtask-targeting bug fixed**),
      list/review-queue category filters + not-Closed default scope, check issues
      against the constant
- [ ] Frontend: category tabs, 7-status badges w/ decided colors, FilterBar,
      review-debt via Review category, views (Blocked by status; Assigned
      revisited), subtask counts
- [ ] Build green + validators green + manual exercise (tabs, badges, error msg)

## Phase 2 — Descriptions (subtasks 04, 05, 06)

- [ ] 04: user-guide `19_issues/` rewritten (lifecycle page, vocabulary page,
      design-philosophy reversal, assignee-signal removal, subtasks page,
      using-with-ai, full sweep)
- [ ] 05: guide.ts legend updated + build-checked
- [ ] 06: skill plugin (both skills) updated, CLAUDE.md paragraph, version bump,
      cache mirrored + diff-verified

## Phase 3 — Verification (subtask 08)

- [ ] Re-read shipped code, diff against every describing surface
- [ ] Fix drifts / file gaps; spot-run documented CLI commands
- [ ] All trackers validator-green, build green

## Phase 4 — Plugin restructure (subtask 09, LAST)

- [ ] References foldered + all links rewritten + external-pointer sweep
- [ ] documentation-guide prerequisite note at top of doc-issues SKILL.md
- [ ] Scripts/migration home rule decided + executed (07's script relocated if
      the rule demands)
- [ ] Cache mirror + single version bump + skill sanity-load

## Wrap-up

- [ ] All subtasks → review (or input-needed with inline question)
- [ ] Milestones (`1NN_`) + `01_summary.md` written; agent-memory updated
- [ ] Issue left open for sidhantha's sign-off
