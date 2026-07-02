---
title: "Task list — lifecycle implementation loop (running checklist)"
---

Running checklist for the loop. Tick items as they land; add discovered work under
the matching phase rather than silently doing it. Detail lives in the subtask
files — this list is the flight plan, not the spec.

## Phase 1 — Code + migration (subtasks 03 + 07, one wave) ✅ DONE (iter 1)

- [x] Exported status/category/color constant — `src/loaders/issue-status.ts`
      (loader re-exports; CLI mirrors in `_lib.mjs`); old `SubtaskState` union now
      a deprecated alias
- [x] Shared issue+subtask validation against the constant (hard error, detailed
      copy-pasteable message; silent default-to-open removed). Legacy values are
      *mapped* not rejected, so the hard error is safe & already active
- [x] Migration script `2026-07-02_state-to-status.py` (detect/locate/migrate/
      verify, idempotent, per the precedent)
- [x] Ran migration on `data/todo/` — 248 files (229 field renames + 19 settings
      remaps); `verify` exits 0. (No `todo-testing/`; only one live tracker.)
- [x] Hard validation active + tested (`banana` → rejected with the 7-value msg)
- [x] Root `settings.jsonc`: values→fixed-comment + 7 colors, `wip`/`blocked`
      labels annotated DEPRECATED, Blocked view → status, Assigned view removed
- [x] CLI (repo + cache identical): set-state (7 statuses, both levels,
      **subtask-targeting bug fixed** via `--subtask`), list `--include-closed` +
      non-closed default scope, check/subtasks/show/review-queue category-aware
- [x] Frontend: category tabs (+Active default), 7-status badges/icons/colors,
      review-debt via Review category, Comprehensive category tabs, subtask cycle,
      Blocked view by status
- [x] Build green + `docs-guide check issues` green + manual exercise

**Subtasks 03 + 07 → review.** Record: milestone `101_code-and-migration.md`.
Revisit-in-sweep flags: "Active" default tab; click-cycle happy-path subset.

## Phase 2 — Descriptions (subtasks 04, 05, 06)

- [x] 04: user-guide `19_issues/` rewritten — 11 pages (lifecycle, vocabulary,
      design-philosophy reversal, assignee-signal removal, subtasks, using-with-ai,
      list-view/detail-view, all 3 workflows, per-issue, setup-new-tracker). Build
      green, sweep clean. Milestone `102_user-guide-docs.md`. → review (iter 2)
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
