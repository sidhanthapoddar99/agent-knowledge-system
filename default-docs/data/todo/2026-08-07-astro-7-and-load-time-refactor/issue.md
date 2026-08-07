## Goal

Stay on Astro, get current, and fix the thing that actually hurts. Two committed pieces:

1. **Move the engine from Astro 5.17.1 to 7.2.0** — two majors, dragging Vite 6 → 8 and a Node 22.12 floor.
2. **Fix the index loader** so the first request stops rendering every document body it will never show.

They are one issue because they touch the same code and the second de-risks the first, not because either needs the other.

## Why

**The measured problem.** The first request to `/todo` takes **3,207 ms** on this repo (53 issue folders, 861 tracker markdown files). The second takes 32 ms. On a larger tracker it reaches 10 s, and it grows linearly with the corpus.

**The cause is not the framework.** The server itself is ready in 378 ms. `loadIssues` renders all 861 tracker files through `marked` + `shiki` to build an index that displays only titles, statuses and dates — a grep for `.html` across every issues-index component returns zero hits. We render bodies nobody reads.

**Astro 7 does not fix it, and that matters for how this issue is framed.** Rolldown makes JavaScript bundling faster; this path reads files and renders markdown. The upgrade contributes ~0 ms here. Both pieces of work are worth doing; only one of them is the performance fix.

**How big the fix is.** The frontmatter-only walk that replaces body-rendering was benchmarked in both languages over 1,038 files: **~15 ms in JavaScript, 12.4 ms in Go.** There is no meaningful gap — Bun's file I/O is fast, and the 3.2 s is markdown rendering, not I/O. So the fix lands the same win here as it would after a rewrite.

**Why upgrade at all, given it buys no speed.** Astro 5 is two majors behind and drifting toward end of life. The upgrade is currency and maintenance, not performance — and the audit found the blast radius is far smaller than the earlier Astro 6 study assumed, because most of the co-bump surface is inert in this codebase.

**Why this is not the Go migration.** See [the Astro 7 versus Go comparison](../2026-05-08-runtime-stack-migration/notes/astro-7-vs-go/01_comparison.md). Go wins 6 of 13 items — memory, live reload with partial builds, production-like feel, cache control. Speed is not one of them once this issue's fix lands. This issue takes the cheap 90% and leaves that decision open.

## Scope

The audit's defect list was pulled in here rather than scattered across six issues. Eleven subtasks in five groups. Groups are **areas, not order** — the running order lives in a plan, and none exists yet.

| Group | Subtasks | What it covers |
|---|---|---|
| [load time](./subtasks/010_load-time/) | 2 | Both halves of the measured problem: the 3.2 s index loader, and 64,938 bytes of theme CSS inlined into every page |
| [Astro 7](./subtasks/020_astro-7/) | 2 | The 5.17.1 → 7.2.0 bump, and the typecheck baseline that makes it diffable |
| [correctness](./subtasks/030_correctness/) | 4 | Module-level cache state, the cache-manager API that nothing calls, two theme-loader bugs, 44 undeclared CSS variables |
| [routing parity](./subtasks/040_routing-parity/) | 1 | One URL resolver for dev and build, and a real 404 page |
| [cleanup](./subtasks/050_cleanup/) | 2 | ~1,100 dead lines, and two small correctness fixes |

**Sequencing that is not negotiable**, and the reasons are written in the subtasks:

- Delete `@astrojs/mdx` **before** the upgrade — it removes an entire co-bump.
- Move the cache state to `globalThis` **before** the upgrade — it takes moving parts out of the riskiest area and makes the `moduleGraph` deletion test meaningful.
- Record the typecheck baseline **before** the upgrade — otherwise there is nothing to diff against.
- Land the index-loader fix **before** the upgrade — it gives a verified known-good baseline, and it is where the value is.

**The one piece that could leave.** [Routing parity](./subtasks/040_routing-parity/010_unified-url-resolver.md) is 5–8 days, larger than everything else here combined. It sits alone in its own group so it can be split out without disturbing anything. If this issue needs to shrink, that is the piece to move — not to squeeze.

**What is deliberately not here.** Loader hygiene — splitting large files, error-handling patterns, tightening types — stays with the codebase-refactoring issue. See the boundary section below.

## Boundary with the loader-hygiene issue

[The codebase-refactoring issue](../2025-06-25-codebase-refactoring/issue.md) owns *internal quality* in `src/loaders/` — splitting large files, error-handling patterns, tightening types, dead code. This issue owns a *version upgrade* and a *measured performance defect*. They overlap in one place only: the dead-code sweep. Whoever runs first should say so in a comment rather than both touching it.

## Related

- **[The runtime-stack-migration issue](../2026-05-08-runtime-stack-migration/issue.md)** — the Go alternative. This issue does not close it. It removes speed from its case and leaves memory, partial builds, production-like feel and cache control standing.
- **[The migration audit](../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/01_summary.md)** — every number quoted above, with its measurement.
- **The earlier Astro 6 study**, at [the Astro 6 research thread](../2026-05-08-runtime-stack-migration/brainstorm/03_research_astro-6-upgrade/01_overview.md) — it was rejected because the Go migration was the adopted plan. The audit says do not schedule that migration, so the rejection's stated reason no longer holds. Its upgrade steps and impact notes are the starting point for the upgrade subtask.
