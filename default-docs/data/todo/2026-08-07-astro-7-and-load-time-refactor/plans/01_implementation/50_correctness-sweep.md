---
title: "Correctness sweep"
outcome: "Closed. Both live defects fixed and proven end to end; both decisions taken and written down — `default` is reserved, dependency tracking is built. Three of the four audit findings were partly wrong about their own subject, which is recorded per subtask"
notes: "Left behind a gate rather than four fixes: `scripts/check-theme-contract.mjs`, each of its three gates deliberately broken and confirmed to fail alone. One new finding filed — the dev editor ships in production builds, 10.8 MB no reader can reach"
who: claude
status: done
subtasks:
  - "[Theme loader bugs](../../subtasks/030_correctness/030_theme-loader-bugs.md)"
  - "[Undeclared CSS variables](../../subtasks/030_correctness/040_undeclared-css-variables.md)"
  - "[cache-manager dependency tracking](../../subtasks/030_correctness/020_cache-manager-dependency-tracking.md)"
  - "[Small correctness fixes](../../subtasks/050_cleanup/020_small-correctness-fixes.md)"
---

The remaining audit findings. Four subtasks, none large, all applied to the post-upgrade
state rather than to a state [stage 40](./40_the-upgrade.md) was about to change.

Two of these are live user-visible defects, not hygiene: dark mode is already broken on
task-checkbox borders, and a circular theme `extends` hangs the build rather than erroring.

## Todo

- [x] [theme loader bugs](../../subtasks/030_correctness/030_theme-loader-bugs.md) — the `extends` cycle hang and the unreachable `default` name
- [x] [undeclared CSS variables](../../subtasks/030_correctness/040_undeclared-css-variables.md) — 44 of them, including one live dark-mode defect
- [x] [cache-manager dependency tracking](../../subtasks/030_correctness/020_cache-manager-dependency-tracking.md) — implement it or delete it, and correct `CLAUDE.md` either way
- [x] [small correctness fixes](../../subtasks/050_cleanup/020_small-correctness-fixes.md) — the unguarded production POST, and 139 unhighlighted fences

## Gate — passed

Commit `36c0497`. Every check below was run, not read:

| Check | Result |
|---|---|
| Production build | ✅ 1279 pages, 6.69 s |
| `scripts/check-theme-contract.mjs` | ✅ all three gates, 5 cycle fixtures |
| Each gate broken deliberately | ✅ fails alone, no cross-talk, tree restores |
| Real circular `extends`, real build | ✅ exit 1 in 5.5 s naming the chain |
| Real theme directory named `default` | ✅ exit 1 with the reserved-name message |
| `invalidateByDep` on a live dev server | ✅ `Invalidated: theme (1 by dependency)` |
| `/__editor/*` in shipped JS | ✅ 0 chunks |
| Unhighlighted fences | ✅ 137 → 0 |
| `agent-ks-dev check issues` | ✅ 55 folders, 0 errors, 7 pre-existing warnings |

**Both written decisions were taken**, which this stage required explicitly:

- **A theme directory may not be called `default`.** The subtask recommended the
  opposite; that recommendation missed that `@theme/default` is the base *both*
  shipped themes extend, so letting a directory claim it retargets every chain.
- **Dependency tracking is built, not deleted.** Its producer side already existed
  end to end and terminated in an array nothing read.

## What the stage found that the plan did not expect

**Three of the four audit findings were partly wrong about their own subject** — the
counts were right, the conclusions were not. Recorded per subtask; the pattern is
worth carrying forward:

- **"44 undeclared variables"** — 42 were fine (dev-only namespaces, component
  parameters, run-time vars). The scan had only looked for declarations in
  `.astro`/`.css`, missing a `.ts` file holding 20 of them. The real gap was the
  *inverse*: 12 variables layouts read that the contract did not require.
- **"~120 lines of dead API"** — one of the four was the missing last link of a
  pipeline that was otherwise complete and running.
- **"Adding grammars costs every reader"** — Shiki runs server-side here; the chunks
  belong to the dev editor and reach 0 published pages.

## Questions — answered

- [x] **Read the content-embed cache issue before deleting.** Done, and it changed
      the decision. Its steps 1–3 are already built; only `issues.ts` remains.
- [x] **Mirror any `required_variables` change into the artifacts skill.** Done —
      53 → 65, mirrored into repo source and the installed `0.8.5` cache,
      verified in sync beforehand and byte-identical after.
- [x] **Check whether grammar chunks load eagerly before adding.** They load for
      nobody: 0 published pages reference the chain. Cost was +0.49 s build,
      +1 MB `dist/`, 0 reader bytes.

## Filed out of this stage

[The dev editor is built into the production site](../../subtasks/060_followups/050_editor-ships-in-production-builds.md)
— 10.8 MB across 427 chunks, 49% of `_astro`, reachable from no published page.
Found by tracing the grammar-chunk question above.
