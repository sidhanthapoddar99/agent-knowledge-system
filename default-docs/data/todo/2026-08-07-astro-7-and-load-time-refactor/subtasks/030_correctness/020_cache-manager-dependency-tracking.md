---
title: "cache-manager dependency tracking — implement it or delete it"
status: done
---

# Overview

`cache-manager.ts` advertises dependency tracking. It does not have any. `deps` are written
by `setCache` and read only by `invalidateByDep`, **which has zero call sites**. So do
`invalidateByPattern`, `haveDepsChanged` and `hasFileChanged` — about 120 lines of API that
nothing calls.

Two things claim otherwise and both are wrong: the file's own header, and the project's
`CLAUDE.md`, which describes this as a "unified mtime-based cache with dependency
tracking".

**A false statement in the instructions is worse than the dead code.** An agent reads
`CLAUDE.md`, believes invalidation cascades, and writes code that depends on it.

Decide: implement it, or delete it and correct both descriptions.

# References

- [the loaders and cache surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/016_surface_loaders-cache-routing.md) — the zero-call-site measurement, and the `getCached` comment showing mtimes are deliberately not checked on read
- [the content-embed cache issue](../../../2026-08-07-content-embed-cache-dependencies/issue.md) — the issue that wants this capability to exist; check it before deleting

# Todo list

- [x] Read the content-embed cache issue — it may genuinely need this
- [x] Decide: implement or delete. Write the decision down before doing either
- [x] Delete the three that are genuinely dead; keep and **wire** the one that is not
- [x] Correct the `cache-manager.ts` header
- [x] **Correct the project `CLAUDE.md`** — it currently states this capability as fact
- [x] Check the same claim has not spread into `dev-docs/`

# Outcomes and Next Steps

**Decision: implement one, delete three.** Commit `36c0497`. The subtask framed this
as a single call over four functions; they turned out not to be alike.

## The decision, and the evidence for it

Zero call sites confirmed for all four by repo-wide grep, as the audit said. But
reading [the content-embed cache issue](../../../2026-08-07-content-embed-cache-dependencies/issue.md)
changed the picture: **the producer side of dependency tracking is already built and
already running.**

```
  asset-embed.ts  →  ProcessContext.embeddedFiles
                  →  LoadedContent.embeddedFiles
                  →  data.ts:290  content.flatMap(item => item.embeddedFiles)
                  →  data.ts:296  setCache('content', key, content, [...files, ...deps, ...embeddedFiles])
                  →  ✗ nothing ever reads deps
```

So this was not "120 lines nobody wanted". It was a **complete pipeline with its
last link missing** — which is exactly the audit's own phrase, *recorded and never
read*, taken at face value.

| Function | Call | Why |
|---|---|---|
| `invalidateByDep` | **keep + wire** | The missing last link. Now called from `onFileChange` |
| `invalidateByPattern` | delete | No caller, and nothing in the embed issue wants key-pattern matching |
| `hasFileChanged` | delete | No caller; a "has it changed" that mutates the registry as a side effect |
| `haveDepsChanged` | delete | **Could never return `false`.** It reads `entry.mtimes`, and `setCache` wrote that as `new Map()` with the comment *"Not used"*. Structurally broken, not merely unused |

`mtimes` was dropped from `CacheEntry` entirely once its only reader went — a struct
that advertises a field it never fills is the same defect one layer down.

## Why the wire is a real fix and not a placeholder

`invalidateByDep` now runs first in `onFileChange`, for every file type. It is the
**only** mechanism that can catch a changed file which is not itself a page:

- the type switch keys off *what the changed file is*
- an embedded `.svg` is an `'asset'`, and `'asset'` deliberately clears nothing,
  because assets normally go straight to the browser
- the consuming page's own mtime never moves

Verified firing on a real dev server, not inferred from the code:

```
[cache] File changed (theme): themes/full-width/element.css
[cache] Invalidated: theme (1 by dependency)
[cache] File changed (content): user-guide/05_getting-started/01_overview.md
[cache] Invalidated: content, sidebar (1 by dependency)
```

The `(N by dependency)` count is printed rather than inferred **on purpose**. A
dependency edit that invalidates nothing looks identical to one with no
dependents — that is precisely how [the git-ref
watcher](../060_followups/010_git-ref-watcher-is-silent.md) stayed broken and
invisible for three months. A mechanism that cannot be watched running should not
be shipped.

## Documentation corrected

- `cache-manager.ts` header now describes **two** mechanisms and says why neither
  subsumes the other, plus the deliberate no-validation-on-read.
- `CLAUDE.md`: "Unified mtime-based cache with dependency tracking" → "Unified
  cache; invalidation by dependency + by file type". The old phrasing implied
  mtime checking on read, which is the one thing `getCached` explicitly does not do.
- dev-docs `05_architecture/03_data-loading.md` said "cached using mtime-based
  validation" — same wrong implication. Rewritten.
- dev-docs `06_optimizations/02_unified-cache-system.md` gained the two-mechanism
  section. It never made the false claim, so nothing there needed retracting.

## Next steps

**This does not close the content-embed issue** — it removes one of its four steps.
Its steps 1–3 (preprocessor sink → parser → `data.ts` deps) already existed; step 4
is `issues.ts`, whose signature walk never covers `assets/` at all and which does not
use `cacheManager`. The tracker half is still stale on an embed edit.

Also worth knowing when that issue is picked up: **the current content has zero
`'asset'`-typed embeds.** Every real `[[…]]` target on disk today is `.dot`, `.mmd`,
`.mermaid` or `.json`, all of which land in the `'unknown'` branch and get the coarse
clear anyway. So the wire is correct and now load-bearing for theme deps, but the
specific embed case it was built for has no instance to demonstrate on yet.

# Details

## The evidence

`invalidateByDep`, `invalidateByPattern`, `haveDepsChanged` and `hasFileChanged` have no
call sites outside their own definitions, measured by a repo-wide grep.

Separately, `getCached` at `cache-manager.ts:194-220` carries the comment *"We don't check
mtimes here … Checking mtimes on every access was causing 10-15ms overhead"* and returns
`entry.data` unconditionally. So the architecture notes' description of a "content
(mtime-keyed) cache invalidated by file mtime check on read" is not what the code does
either.

## The decision, framed

**Deleting is the default.** ~120 lines of unreachable code, and the cascade behaviour it
implies is not load-bearing anywhere.

**Implementing wins only if** the content-embed cache issue needs it. `[[path]]` embeds
create a real reverse dependency — a change to an embedded file must invalidate every page
that embeds it. The audit counted 223 embeds across 64 files, and today's dependency lists
are recorded and never read. If that issue is going ahead, this is its foundation and
should be built rather than deleted.

Read that issue first. Do not decide from this file alone.

## Done when

- [ ] The decision is written down with its reason
- [ ] Code and comments agree with each other
- [ ] `CLAUDE.md` no longer states a capability the code does not have
- [ ] A grep for the four function names returns either real call sites or nothing at all
