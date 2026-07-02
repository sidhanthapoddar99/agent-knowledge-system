---
title: Refactor the documentation-guide tracker's own issues
state: open
---

Dogfood the finalized anatomy (`notes/01_issue-anatomy/`) on our own backlog: the
existing issues in `default-docs/data/todo/` were written under the old conventions
and need migrating. Content-only — the loader tolerates both shapes, so this can land
incrementally. `docs-guide check issues` now flags most of the drift, so run it to get
the live work-list.

## Mechanical migration

- [ ] **Flat agent-logs → activity folders.** Old issues log directly as
      `agent-log/NNN_<name>.md`; the norm is now `NNN_<code>_<name>/` activity folders
      (kind code in the name, `0NN_` meta + milestone files inside). Pick the right code
      per activity (`lp`/`au`/`rf`/`it`/`wf`). Validator-flagged offenders:
      `issue-link-resolution`, `sidebar-state-persistence`,
      `numeric-ordering-prefix-convention`, `docs-phase-2`, `framework-as-cli-tool`,
      `tracker-mental-model-alignment`, `sidebar-cache-v2`, `claude-skills`,
      `issues-layout`.
- [ ] **Code-less activity folders.** `cli-toolkit-consolidation` has `200_loops/`
      (needs a kind code) and `000_agent-memory/` — the latter is agent-memory
      mis-filed inside agent-log; move it to a real `agent-memory/` section.
- [ ] **Mis-filed deliberation → `brainstorm/`.** Pre-decision thinking parked under
      `notes/discussion/` is *process*, not *product* — relocate it (e.g.
      `runtime-stack-migration/notes/discussion/`).
- [ ] **Split mixed Notes.** Where `notes/` blends finalized output with deliberation,
      keep the product in `notes/` and move the rest to `brainstorm/` (with
      `**Resolved →**` markers where the thread concluded).

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

- [ ] Assess the cancelled migration-direction issues →
      `runtime-stack-migration/brainstorm/` (pick a / b / c above)
- [ ] Distil the decision into the general **issue vs brainstorm-file rule** — when
      does a thought get its own issue vs a brainstorm inside an existing one? Feeds
      subtask 02's rules.
