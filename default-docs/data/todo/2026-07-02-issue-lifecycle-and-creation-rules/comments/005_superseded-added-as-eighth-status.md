---
title: "Extension — `superseded` added as the eighth status (engine 0.3.6)"
---

The vocabulary decided here gained one value. **Closed now holds three statuses:
`done` · `dropped` · `superseded`.** The issue stays `done`; this comment records
the extension and the decisions taken with it. Full write-up:
[`releases/0.3.6.md`](../../../../../agent-ks-engine/releases/0.3.6.md).

## Why an eighth status

Phase-2 subtasks in a downstream tracker were closing as "moved to phase 3" and
"absorbed into the target architecture". Neither `done` nor `dropped` described
that. `done` overstates it — nothing shipped. `dropped` throws away the pointer,
which is the one fact worth keeping.

`superseded` = the work closed here because its scope moved elsewhere.

## Decisions taken during implementation

Sid chose the name and the agent ceiling; the rest were taken in the run and are
recorded here because they are reversible and were not asked about.

| Decision | What was chosen | Why |
|---|---|---|
| Name | `superseded`, not `suppressed` | "Suppressed" means silenced. The semantics are "closed here, lives on there". Sid confirmed. |
| Category | Closed | It is terminal, like `done` and `dropped`. |
| Who may set it | **Agents may**, at issue and subtask level | It certifies nothing about the work — it only records that the scope moved, which the agent that moved it is best placed to write. Sid confirmed. |
| Run statuses | **Not** added to `RUN_STATUSES` | A run's status answers *did the agent finish*. A run whose scope moved did not finish — that is `dropped`. Same reason `blocked` and `review` are already excluded. |
| The pointer | A `→ where it went` line, **warned** by `check issues`, not errored | A missing pointer makes the status a dead end, but a warning is right: existing content predates the rule and a hard error would fail a build over prose. |
| Pointer search for an issue | `issue.md` **then** `comments/` | Closing an issue by comment is common; searching only `issue.md` would warn on correctly-written issues. |
| Colour | `--status-superseded` — `#7c3aed` light, `#c678dd` dark | Violet is unused by the other seven and reads as neither success nor failure. |
| Glyph | A right arrow | Sits beside the check (`done`) and the cross (`dropped`); reads as "the scope left here". |
| Progress bars | Derived from **category**, not from named statuses | The old code counted `done` and `dropped` by name, so a new terminal status would have silently landed in the `active` remainder. |

## One defect found, and removed

The sweep turned up an **orphaned component**:
`astro-doc-code/src/layouts/issues/default/parts/detail/OverviewSubtasks.astro`.
Nothing imported it, yet its CSS, its click wiring and its live-count function
were all still present — so `updateOverviewProgress()` ran on every status
change against a selector that never matched, and did nothing.

Sid called it: **delete it.** All five pieces went together —

- the component file;
- 88 lines of `.issue-overview-subtasks__*` CSS in `styles/detail.css`;
- `updateOverviewProgress()` and its call site in `scripts/detail/subtask-state.ts`;
- the overview branch of `applySubtaskState()`;
- the `wireStateButton('.issue-overview-subtasks__state', …)` call in
  `scripts/detail/client.ts`.

Three prose references that named it were corrected too (`Comprehensive.astro`,
`server/helpers.ts`, and the Guide's subtask "Surfaces" line, which had been
advertising a progress bar no reader could see).

The live status surfaces are unaffected: sidebar tree, **Comprehensive** panel,
subtask page, and the right-rail index. Build clean at 1290 pages.

## Scope of the change

- **Two vocabulary mirrors** — `astro-doc-code/src/loaders/issue-status.ts`
  (framework) and
  `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/_lib.mjs` (CLI). Every
  other code surface reads one of those two.
- **Three hand-written spots** existed and were fixed: the icon switch
  (`server/state-icon.ts`), the two progress-bar counters, and the
  `[data-state=...]` colour rules in `styles/detail.css`.
- **No migration script.** The change is additive; `MIN_CONTENT_VERSION` stays
  at `0.2.0` and no existing content becomes invalid.
- Engine `0.3.5 → 0.3.6`; plugin `0.8.5 → 0.8.6`.
