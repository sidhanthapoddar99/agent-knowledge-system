---
title: "cache-manager dependency tracking — implement it or delete it"
status: open
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

- [ ] Read the content-embed cache issue — it may genuinely need this
- [ ] Decide: implement or delete. Write the decision down before doing either
- [ ] If deleting: remove the four unused functions and the `deps` writes
- [ ] Correct the `cache-manager.ts` header
- [ ] **Correct the project `CLAUDE.md`** — it currently states this capability as fact
- [ ] Check the same claim has not spread into `dev-docs/`

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

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
