---
title: "Move the two bare module-level caches onto globalThis"
status: open
---

# Overview

Two caches hold state at module level: `issue-dates.ts:40` and `issues.ts:462`, each a bare
`const cache = new Map()`. Vite can split module state between the plugin context and the
SSR context, so a watcher event clears one copy while requests read the other — the cache
sticks on stale data.

**Four sibling files in the same folder already solve this** by parking their state on
`globalThis`: `cache-manager.ts:44`, `paths.ts:131`, `cache.ts` and `theme.ts`.
`paths.ts`'s own comment names Vite module splitting as the reason. Do the same to these
two.

This is the bug that triggered the whole Go-migration proposal. It is roughly ten lines per
file.

# References

- [the loaders and cache surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/016_surface_loaders-cache-routing.md) — the grep that found two exposed caches against four already-fixed siblings
- [the case against the migration](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/024_question_case-against.md) — why this one-day fix removes the migration's stated justification
- [the update-date-time issue](../../../2026-05-08-update-date-time-optimization/issue.md) — where this defect was originally proposed to live; it moved here because it de-risks the Astro 7 upgrade
- [the Astro 7 upgrade subtask](../020_astro-7/010_astro-5-to-7-upgrade.md) — run this **before** it

# Todo list

- [ ] **Reproduce the bug first** — see Details. Do not fix what you have not seen
- [ ] Move `issue-dates.ts:40` cache onto `globalThis`, matching the sibling pattern
- [ ] Move `issues.ts:462` cache onto `globalThis`, same pattern
- [ ] Confirm the bug no longer reproduces
- [ ] Try deleting the 25-line `moduleGraph` reach-in at `integration.ts:206-232`

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## Reproduce before you fix — this is not optional

**The audit could not reproduce this bug live.** The running dev server showed a correct
fresh timestamp. The exposed state is unambiguous in the source, but "already fixed by
accident" and "still broken, the cache was cold" look identical from outside.

So: start a dev server, load a page showing a derived `updated` date, commit a change to a
tracked file, reload, and see whether the date moves. If it does move, the bug is not live
and the fix becomes hygiene rather than a repair — write that down, because it changes what
the migration issue can claim.

## Why it belongs here rather than in its original issue

It takes moving parts out of exactly the area the Astro 7 upgrade is riskiest in. Doing it
first also makes the `moduleGraph` deletion test clean: that 25-line workaround exists to
compensate for these two caches, so with them fixed you can tell whether Astro 6.3.4's
upstream fix (#16757) covers this project's git-ref path.

## Done when

- [ ] Both caches follow the same `globalThis` pattern as the four siblings
- [ ] The reproduction attempt is recorded in **Outcomes**, with its result either way
- [ ] The `moduleGraph` reach-in is deleted with evidence, or kept with the reason written down
- [ ] Derived `updated` dates refresh correctly after a commit, verified by hand
