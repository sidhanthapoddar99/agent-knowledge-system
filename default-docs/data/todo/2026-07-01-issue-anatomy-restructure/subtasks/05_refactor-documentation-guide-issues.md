---
title: Refactor the documentation-guide tracker's own issues
status: done
---

Dogfood the finalized anatomy (`notes/01_issue-anatomy/`) on our own backlog: the
existing issues in `default-docs/data/todo/` were written under the old conventions
and need migrating. Content-only — the loader tolerates both shapes, so this can land
incrementally. `docs-guide check issues` now flags most of the drift, so run it to get
the live work-list.

## Mechanical migration

- [x] **Flat agent-logs → activity folders.** Done across all nine offenders. Six were
      genuine execution records and became activity folders (`lp` for the autonomous
      runs in `sidebar-cache-v2`, `issue-link-resolution`, `sidebar-state-persistence`,
      `numeric-ordering-prefix-convention`, `claude-skills`; `au` for
      `tracker-mental-model-alignment`'s mechanism write-up; `rf` for `issues-layout`'s
      refactor log). Two were deliberation in disguise and moved to `brainstorm/`
      instead (`docs-phase-2`'s scope braindump, `framework-as-cli-tool`'s
      distribution thinking-log — both with `**Resolved →**` markers). Multi-`iter-N`
      files grouped as milestones in one folder; git sees renames, prose untouched.
      `issues-layout`'s depth-cap fixtures (`agent-log/exploration/phase-1/deeper/`,
      `notes/design/phase-1/deeper/`) were **kept deliberately** — still the only
      coverage for the loader's depth-cap warning (demo-showcase stays within the cap);
      its `test-color-absent.md` was deleted (demo-showcase covers colour-less rendering).
- [x] **Code-less activity folders.** `cli-toolkit-consolidation`: `000_agent-memory/`
      → real `agent-memory/` (memory.md index + `toolkit-facts.md`); `200_loops/`
      wrapper dissolved → `200_lp_cli-consolidation/` at the agent-log root, meta trio
      renamed to `00_goal` / `01_summary` / `02_task_list`.
- [x] **Mis-filed deliberation → `brainstorm/`.**
      `runtime-stack-migration/notes/discussion/` (5 files) moved verbatim to
      `brainstorm/04_discuss_stack-and-migration/` with a resolved marker on
      `01_frameworks.md` ("decided on Go + Vite; formalized in notes/architecture/");
      14 pointers fixed in-issue plus a broken cross-issue link in
      `update-date-time-optimization/notes/04`.
- [x] **Split mixed Notes.** Tracker-wide sweep done (read-only): most notes are clean
      decision-record product. Three moves remain, ranked:
      1. `knowledge-graph-and-wiki-links/notes/01_original-layered-scope.md` →
         `brainstorm/` (superseded original framing + open questions;
         `**Resolved →** issue.md`);
      2. `updating-skills-and-documentation/notes/050_skill-review-ideation.md` →
         `brainstorm/` (proposal-weighing; its Outcome section is the graduation);
      3. `editor-advanced/notes/01_canvas-rendering.md` → `brainstorm/` (kind
         `research`; Status: Research with an unresolved options table).
      Deferred: `update-date-time-optimization/comments/001+002` are notes-grade spec
      walkthroughs — move only when that issue is next touched. Cosmetic: five
      editor-*/view-modes notes carry dead pre-migration `Type/Priority/Status` header
      blocks.

## Issues that are really brainstorms

Some *entire issues* are deliberation that would, under the new model, live inside one
issue's `brainstorm/`. The clearest case: the cancelled migration-direction cluster —
`2026-04-25-framework-as-npm-package`, `2026-06-09-astro-6-upgrade`,
`2026-04-26-editor-as-standalone-product` — one "distribution/runtime direction"
thread that converged on `2026-05-08-runtime-stack-migration`.

Options for the fold-in: (a) move the substance into
`runtime-stack-migration/brainstorm/NN_discuss_*.md` and delete the cancelled issues
(git history keeps them); (b) same move but leave one-paragraph husks pointing at the
new home; (c) leave standing. Note the within-issue "graduation doesn't delete" rule
does **not** apply here — that rule is about brainstorm files inside an issue, not
about issues themselves.

- [x] Assess the cancelled migration-direction issues →
      `runtime-stack-migration/brainstorm/` — **done, option (a): fold in + delete.**
      Three parallel agents migrated each issue into a brainstorm thread
      (`01_explore_framework-as-npm-package/`, `02_idea_editor-as-standalone-product/`,
      `03_research_astro-6-upgrade/` — 12 files, each overview opening with a
      `**Resolved →**` marker and source-slug provenance), then the source folders were
      deleted (git history keeps them; zero markdown links pointed at them, only prose
      mentions). Tracker: 49 → 46 issues, validator clean, build green.
- [x] **`2026-04-26-framework-as-cli-tool`** — fourth member of the same cluster
      (middle of the supersession chain npm-package → cli-tool → runtime migration).
      **Decided: keep.** Unlike the three deleted issues it is not pure deliberation —
      real work shipped under it and is still in force (consumer-mode refactor: `@root`
      alias, `dynamic_data/`→`default-docs/` rename, starter template, `/docs-init`,
      plugin `_env.mjs`), so it is the provenance record for running code. Its
      superseded *direction* half is already graduated in place: comment 003 carries a
      question-by-question resolution table pointing into the runtime migration.
      Its flat `agent-log/001_distribution-brainstorm.md` gets fixed by the mechanical
      agent-log pass above, not by moving issues around.
- [x] **`2026-05-07-cache-isolation-cross-project`** — fourth fold-in, same rule
      (nothing ever shipped under it; pure problem + proposed design). Superseded by
      sidhantha's proposal that the Go runtime dissolves the problem: dev-mode UI state
      moves server-side into a per-project cache folder keyed by the invoking project
      dir, so browser-storage collisions can't occur. Absorbed into
      `runtime-stack-migration/brainstorm/05_idea_backend-side-cache-isolation.md`
      (problem + superseded browser-side design + proposal + assessment); five inbound
      references repointed (sidebar-state-persistence ×3, sidebar-cache-v2, dev-docs
      sidebar-state-cache page); folder deleted.
- [x] Distil the decision into the general **issue vs brainstorm-file rule** — when
      does a thought get its own issue vs a brainstorm inside an existing one? Feeds
      subtask 02's rules. The cluster refactor supplies it: **an issue that shipped
      work stays an issue** (close with a supersession comment mapping open questions
      to their fates — see cli-tool's comment 003); **an issue that is pure
      deliberation converging elsewhere folds into the winner's `brainstorm/`** (with
      a `**Resolved →**` overview + source-slug provenance) **and is deleted** — git
      history keeps the original.

      **Graduated →** the broader threshold question (when a thought deserves a full
      issue at all vs a subtask vs a brainstorm entry, plus the expanded lifecycle
      states) got its own issue:
      `2026-07-02-issue-lifecycle-and-creation-rules`. The distilled rule above is
      its starting input.

Closed 2026-07-02 — refactor confirmed done by sidhantha; remaining thought-work
graduated to the issue above.
