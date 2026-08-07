---
title: "Delete the dead code the audit enumerated"
status: open
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

- [ ] Delete `@astrojs/mdx` and its `astro.config.mjs` entry — **do this before the upgrade**
- [ ] Delete the presence system
- [ ] Delete the unreferenced editor code
- [ ] Decide on frontmatter validation: wire it up or remove it
- [ ] Run a `knip` or `tsc --noUnusedLocals` pass to catch what the audit missed
- [ ] Comment on the codebase-refactoring issue saying this ran

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

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

- [ ] `@astrojs/mdx` is gone from `package.json` and `astro.config.mjs`
- [ ] Each deleted block was grep-verified unreachable first
- [ ] The build still produces 1,229 pages or more
- [ ] The dev toolbar and editor still work
- [ ] The frontmatter-validation decision is written down either way
- [ ] The line count removed is recorded in **Outcomes**
