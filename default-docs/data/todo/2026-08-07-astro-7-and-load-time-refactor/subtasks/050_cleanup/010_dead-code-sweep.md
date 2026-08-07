---
title: "Delete the dead code the audit enumerated"
status: done
---

# Overview

The migration audit counted roughly **1,100 lines of code that nothing calls**, plus one
dependency that handles zero files. Deleting it shrinks the surface the Astro 7 upgrade has
to carry, and it is the cheapest work in this issue.

| Dead thing | Size | Evidence |
|---|---|---|
| `@astrojs/mdx` dependency + integration | — | **Zero `.mdx` files** repo-wide. Removing it also removes a whole co-bump from the upgrade |
| Presence system | 267 lines | No client consumes it |
| Unreferenced editor code | 702 lines | Not reachable from any entry point |
| `cache-manager` unused API | ~120 lines | Four functions, zero call sites |
| Frontmatter validation | — | `getFrontmatterSchema` / `validateFrontmatter` declared on every parser, called from nowhere |

# References

- [the dev-tools surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/015_surface_dev-tools-and-live-editing.md) — the 1,009 dead lines in that surface, itemised
- [the content-pipeline surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/011_surface_content-pipeline.md) — the MDX and frontmatter-validation findings
- [the cache-manager subtask](../030_correctness/020_cache-manager-dependency-tracking.md) — owns the ~120 lines; **do not delete them here**
- [the codebase-refactoring issue](../../../2025-06-25-codebase-refactoring/issue.md) — its dead-code-sweep subtask overlaps this. Whoever runs first says so in a comment

# Todo list

- [x] Delete `@astrojs/mdx` and its `astro.config.mjs` entry — done before the upgrade, commit `033c5ff`
- [x] ~~Delete the presence system~~ — **kept.** Sid's ruling; see *The presence decision* below
- [x] Delete the unreferenced editor code — 7 files, **707 lines**
- [x] Decide on frontmatter validation — **wired up as a warning.** See below
- [x] Run a `tsc --noUnusedLocals` pass — 13 findings, all trivial, listed below
- [x] Comment on the codebase-refactoring issue saying this ran — [comment 002](../../../2025-06-25-codebase-refactoring/comments/002_2026-08-07_claude.md)

# Outcomes and Next Steps

**707 lines deleted, 1 dependency removed, 1 rule made real, and one deletion
refused.** The audit's list was right about the editor files and wrong about
presence — which is exactly the split the *"do not trust the list"* section below
predicted.

## What was deleted — 707 lines, each verified first

Every file was re-checked against all 188 source files for `from '…'`,
`import('…')`, glob imports and bare-string mentions before deletion. No file was
taken on the audit's word.

| File | Lines | Importers found |
|---|---:|---|
| `editor/core/wysiwyg-decorations.ts` | 438 | 0 |
| `editor/layout/shell.ts` | 99 | 0 |
| `editor/layout/preview-panel.ts` | 51 | 0 |
| `editor/core/codemirror-languages.ts` | 43 | 0 |
| `editor/util/lazy-import.ts` | 42 | 0 |
| `editor/util/prefix-utils.ts` | 27 | 0 |
| `editor/layout/shell-styles.ts` | 7 | 1 — only `shell.ts`, itself dead |
| **Total** | **707** | |

Plus `@astrojs/mdx` and its `astro.config.mjs` entry, in commit `033c5ff`.

> [!NOTE]
> `shell.ts` was **edited earlier in this same issue** — the theme-CSS change
> rewrote how it pulled in styles. That edit was to dead code and had no effect.
> Nothing broke; it is recorded because it shows how invisible this file was.

## The presence decision — kept, not deleted

**The audit's evidence is correct and I reproduced it:** zero `EventSource` uses,
nothing POSTs `/__editor/presence`, nothing GETs `/__editor/events`. The `users`
map is never populated, so the broadcasts are permanent no-ops.

**It is still wired**, which the one-line summary in this subtask's table got
wrong. `integration.ts` constructs it, `yjs-sync.ts` calls it for cursor and
latency handling, and the cache-inspector toolbar renders its user count. So this
was never a matter of deleting an orphan file.

**It is not deleted, because it is the server half of a feature that is wanted.**
Multi-user editing is one of the six problems that opened this whole line of work.
Presence is precisely the scaffolding for it: join/leave, cursors, stale cleanup.
Deleting 267 lines of groundwork for a wanted feature is not a cleanup — and the
audit itself said *"Port, delete, or finish — but not port as-is."*

**Sid ruled on 2026-08-07: keep it.** Multi-user editing is wanted, later rather
than now, and the server half should not have to be written twice.

Handed to the issue that owns the feature —
[Yjs sync and multi-user presence](../../../2026-04-10-sync-and-presence/comments/001_2026-08-07_claude.md)
— with what is on disk, what is missing, and the caution that a code path with zero
call sites has never actually run.

Cost of keeping it meanwhile: one cleanup timer and one always-empty toolbar row.

## Frontmatter validation — wired up, as a warning

`validateFrontmatter` existed on every parser and **was called from nowhere**, so
the documented rule *"`title` required in every doc file"* was enforced by nothing.
A page with no title shipped silently titled after its own filename.

It is now called from `parseMarkdownFile`. Three decisions, all deliberate:

**It warns, it does not throw.** A missing title is a content mistake in somebody's
markdown; stopping their whole build over one page is out of proportion. This
engine reserves hard stops for configuration it cannot proceed without, like the
engine-version gate.

**It also prints to the console.** `addWarning` alone fills the dev toolbar's
in-memory panel — which does not exist during a build, so a build reported nothing
at all. Caught by testing it; the first wiring was silent where it mattered most.
It now matches how the asset-embed preprocessor surfaces the same class of problem.

**The cost of enforcing it was measured, not assumed.** This subtask warned that
wiring it up *"will surface existing violations, which is work this subtask has not
budgeted"*. Measured: **1 violation across 162 files**, and it is
`default-docs/data/README.md`, which has no `NN_` prefix and is not routed as a
page. **Real violations: zero.** The budgeting worry was unfounded.

Control-tested both ways:

```
  with a file missing `title`   → [frontmatter] 05_getting-started/99_probe-no-title.md
                                    - missing required field "title"
  on the real tree              → 0 warnings
```

## The `--noUnusedLocals` pass — 13 findings, none worth acting on

All are unused locals or parameters, not dead features: `_activePreview`,
`canvas`, `Decoration`, `text`, `store`, `needsReview`, `CLOSED_STATUSES`,
`fileType` (×3), `fileDir`, `blockStartLine`, `match`. Spread across 12 files.

**Not deleted.** Touching 12 files for zero behaviour change is churn, and several
are deliberately-named or destructured signature parameters. Recorded so the next
sweep does not re-derive the list.

## Next steps

- [x] **Presence: Sid ruled keep**, handed to [the sync-and-presence issue](../../../2026-04-10-sync-and-presence/comments/001_2026-08-07_claude.md).
- [x] Commented on [the codebase-refactoring issue](../../../2025-06-25-codebase-refactoring/comments/002_2026-08-07_claude.md)
      so its own sweep does not redo this.
- [ ] `cache-manager`'s ~120 unused lines stay with
      [their own subtask](../030_correctness/020_cache-manager-dependency-tracking.md)
      — untouched here, as this subtask instructed. Note that
      [the partial-rebuild note](../../brainstorm/01_partial-rebuilds.md) now argues
      for *implementing* rather than deleting them.

# Details

## Frontmatter validation is a decision, not a deletion

The other rows are unambiguously dead. This one is different: the project rule *"`title`
frontmatter required in every doc file"* is real and currently **unenforced** — the build
falls back to the slug, so a page ships silently titled `_my-file`.

So either wire the existing validators in, or delete them and accept that the rule lives
only in `agent-ks check`. Wiring them in is the better answer, but it will surface existing
violations, which is work this subtask has not budgeted. Decide deliberately and write it
down.

## Verify each deletion, do not trust the list

The audit's counts are `read`, not `measured` by execution. Before deleting any block,
grep for its symbols yourself. A dead-code list is exactly the kind of finding that is
90% right and expensive in the 10%.

## Done when

- [x] `@astrojs/mdx` is gone from `package.json` and `astro.config.mjs`
- [x] Each deleted block was grep-verified unreachable first — all 188 source files
      searched for every import form, plus bare-string mentions
- [x] The build still produces 1,229 pages or more — **1,292 `.html`**, build clean
- [ ] The dev toolbar and editor still work — **server side verified** (routes answer,
      middleware and sockets register); **how they look is unverified** and is Sid's check
- [x] The frontmatter-validation decision is written down either way
- [x] The line count removed is recorded in **Outcomes** — 707 lines, 7 files
