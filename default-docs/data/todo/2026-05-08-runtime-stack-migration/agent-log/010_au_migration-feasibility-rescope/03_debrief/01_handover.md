---
title: "Handover — what leaves this run"
---

# Handover

Three things leave this audit: a decision for the user, a set of corrections owed to this
issue's own notes, and ten defects in the current code that have nothing to do with the
migration. **None of them has been filed as a subtask** — the audit's scope was the
report, and filing work across six other issues is a bigger move than the run was asked
to make. Each item below carries its proposed home so the filing is a decision, not a
research job.

## 1 · The decision that needs the user

**Do not schedule the migration; keep the issue as design capture at low priority — which
is exactly what its `settings.json` already says.** The audit's recommendation is to ship
a 16–22 day package against the current Astro codebase instead, detailed in
[the deep-questions round](../02_working/020_deep-questions.md#the-alternative-package-it-recommends-instead--1622-days).

The re-open condition, stated so it can be tested rather than felt: **re-open only if
Astro SSR in production measures badly *and* `bun build --compile` fails *and* real
external consumers exist.** Two of those three are 2-day spikes. The third is currently
zero — the GitHub API returns 0 stars, 0 forks, 0 watchers and 0 release-asset downloads.

If the goal behind this issue was never product velocity — if it is learning Go, or
building a portfolio artefact — then the opportunity-cost argument that carries the
verdict does not apply and the decision should be re-taken on those grounds. The audit
cannot settle that; only the user can.

## 2 · Corrections owed to this issue's own notes

The notes under `notes/architecture/` and `notes/architecture-update/` contain claims that
measurement refutes. They are the input to any future migration decision, so leaving them
uncorrected means the next reader re-derives a wrong picture. The full list is in
[the surface-inventory round](../02_working/010_surface-inventory.md#the-rounds-finding-the-design-notes-describe-a-system-we-do-not-have);
the ones that would change a decision:

| Note | What needs correcting |
|---|---|
| [architecture/06 performance comparison](../../../notes/architecture/06_performance-comparison.md) | Every performance row overstates how slow Astro is — first byte by 6–20x, markdown re-render by ~150x. The footprint rows understate the other way (419 MB, not 150–250 MB; 874 MB RSS, not 150–300 MB) |
| [architecture/01 overview](../../../notes/architecture/01_overview.md) | "The 11 plugin commands" — there are 37. The "what this requires us to write" list omits the editor server entirely |
| [architecture/03 vite frontend and dist](../../../notes/architecture/03_vite-frontend-and-dist.md) | Plans to replace hydration directives and a ~30 KB island runtime. There are zero islands and zero directives in the codebase |
| [architecture/04 distribution](../../../notes/architecture/04_distribution-single-binary.md) | Embedded `dist/` budgeted at 1–2 MB; measured 6.1 MB gzipped / 24 MB raw. The Hugo size comparison is misleading — Hugo embeds no editor, no CodeMirror, no draw.io viewer, no Excalidraw, no mermaid, no CRDT |
| [architecture/05 runtime config surface](../../../notes/architecture/05_runtime-config-surface.md) | "The user-editable surface is identical" is false for external layouts, which today can run server-side code and get a bundled island for free. Also shows `pages:` as a list; it is a map |
| [architecture/02 go runtime](../../../notes/architecture/02_go-runtime.md) | Names `y-crdt-go (y-go)` as the CRDT candidate; no such module exists. The real candidates are `reearth/ygo` and `Deln0r/ygo` |
| [architecture-update/02 known issues](../../../notes/architecture-update/02_known-issues-content-pipeline.md) | Two of its four symptoms are already fixed (issue asset embeds, `<img src>` rewriting); `src/custom-tags/` does not exist at all |

There is also an internal contradiction to settle before any estimate means anything:
`03_vite-frontend-and-dist.md` says the dev toolbar may be "dropped from v1" while
`06_performance-comparison.md` calls it "part of the framework's value". **That single
disagreement swings the dev-tools estimate by about three weeks.**

## 3 · Ten defects in the current code

Found while auditing the current system to price a rewrite. All are live today and none
waits on a migration decision.

> **Filed 2026-08-07 — every row below now lives in
> [the Astro 7 and load-time refactor issue](../../../../2026-08-07-astro-7-and-load-time-refactor/issue.md).**
> They were pulled into one issue rather than scattered across the six homes proposed here,
> because most of them touch the same files as the Astro 5 → 7 upgrade and several are
> prerequisites for it. The "proposed home" column is kept as the record of where each one
> would otherwise have gone — check that issue before working any of them there, or the
> work gets done twice.

| Defect | Severity | Proposed home |
|---|---|---|
| Circular theme `extends` recurses to stack exhaustion — the cycle check only calls `addError()` under DEV and never throws, and the cache entry is written after the recursive call. The user guide claims it errors at startup | high — hangs the build | [the theme-system refactor issue](../../../../2026-04-10-theme-system-refactor/issue.md) |
| Dev and production disagree on URLs: plan sub-URLs 302 in dev and 404 in the build; a missing docs page serves a 296,909-byte styled page in dev while `dist/` has no `404.html` | high — the only measured architectural defect | [the default-route-resolution issue](../../../../2026-05-07-default-route-resolution/issue.md) |
| `cache-manager` dependency tracking does not exist — `deps` are written and never read; `invalidateByDep`, `invalidateByPattern`, `haveDepsChanged`, `hasFileChanged` have zero call sites. The file header **and the project `CLAUDE.md`** both describe this cache as having dependency tracking | high — a false claim in the instructions | [the content-embed cache issue](../../../../2026-08-07-content-embed-cache-dependencies/issue.md) |
| The two bare module-level caches that cause the trigger bug (`issue-dates.ts:40`, `issues.ts:462`) while four sibling files already use `globalThis` | high — one day's work | [the update-date-time issue](../../../../2026-05-08-update-date-time-optimization/issue.md) |
| `--color-text-tertiary` is used in `markdown.css` with frozen `#888`/`#999` fallbacks and declared by nothing, so task-checkbox borders already ignore dark mode. 44 variables total are referenced but undeclared | medium — the exact failure the theming rule exists to prevent | [the theme-system refactor issue](../../../../2026-04-10-theme-system-refactor/issue.md) |
| A user theme folder named `default` is unreachable — `theme.ts:57` short-circuits the literal name before any directory scan | medium | [the theme-system refactor issue](../../../../2026-04-10-theme-system-refactor/issue.md) |
| `subtask-state.ts:14` POSTs to `/__editor/subtask-toggle` with no dev guard; its catch rolls the UI back, so it fails silently in production | medium | [the issues-layout issue](../../../../2026-04-10-issues-layout/issue.md) |
| 139 fenced code blocks render unhighlighted — `astro` 104, `env` 13, `jsonc` 11, `nginx` 6, `text` 3, `diff` 2 — because those languages are requested nowhere in the Shiki config | low, but 104 of them are in our own docs | [the docs phase-2 issue](../../../../2026-04-19-docs-phase-2/issue.md) |
| Frontmatter validation is dead code — `getFrontmatterSchema` / `validateFrontmatter` are declared on every parser and called from nowhere, so the "title required" rule is unenforced | low | [the codebase-refactoring issue](../../../../2025-06-25-codebase-refactoring/issue.md) |
| Dead weight: `@astrojs/mdx` with zero `.mdx` files, a 267-line presence system with no client, 702 unreferenced editor lines, ~120 lines of dead cache API | low — 3–5 days of deletion | [the codebase-refactoring issue](../../../../2025-06-25-codebase-refactoring/issue.md) |

Plus one gap rather than a defect: **there is no typecheck anywhere** — no `astro check`,
`@astrojs/check` not installed, no `tsc --noEmit` in any script or workflow. Running it by
hand produces 27 errors.

## 4 · Two things this run could not settle

- **The trigger bug was not reproduced live.** The running dev server showed a correct
  fresh timestamp. The exposed module-level state is unambiguous in the source, but
  "already fixed by accident" and "still broken, cache was cold" are indistinguishable
  from outside. Anyone acting on the one-day fix should reproduce first.
- **Two auditors measured `marked` + `marked-alert` + `shiki` 4.8x apart** — 1.36 ms per
  file against 6.57 ms per file, same libraries, same corpus. It moves no verdict, since
  Go wins at either figure, but **neither number should be quoted in a decision until the
  gap is explained.**
