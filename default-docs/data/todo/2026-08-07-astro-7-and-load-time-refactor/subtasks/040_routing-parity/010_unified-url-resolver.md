---
title: "One URL resolver for dev and build, plus a real 404 page"
status: open
---

# Overview

**Dev and production disagree about URLs, measurably.** Two files hold the same knowledge
and are kept in sync by hand: `pages/lib/route-match.ts` (369 lines, SSR URL resolution)
and `pages/lib/static-paths.ts` (build-time URL enumeration). They have already drifted.

Reproduced:

- `/todo/<issue>/plans/<plan>/<nonexistent>` returns a **302 redirect** in dev and a **host
  404** in the built site.
- `/user-guide/<nonexistent>` serves a **296,909-byte fully styled page** in dev, while
  `dist/` contains **no `404.html` at all**.

This is the only architectural defect the migration audit could measure. Merging the two
resolvers is the same 5–8 days in TypeScript as it would be in Go — the language is not
what makes it expensive.

# References

- [the loaders, cache and routing surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/016_surface_loaders-cache-routing.md) — the reproduction and the drift analysis
- [the structure and layout separation note](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) — the design that motivated this: URL rules belong to a structure, not to two central switches
- [the default-route-resolution issue](../../../2026-05-07-default-route-resolution/issue.md) — the issue that originally owned this; check it before starting so the work is not done twice

# Todo list

- [ ] Reproduce both divergences and record them as the baseline
- [ ] Read the default-route-resolution issue — decide whether this subtask leads or follows it
- [ ] Extract one resolver that both SSR matching and build-time enumeration call
- [ ] Enumerate build URLs **from** that resolver rather than beside it
- [ ] Add a real `404.html` to the static output
- [ ] Build a dev-versus-build URL diff harness
- [ ] Re-run both reproductions

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## This is the biggest item in the issue — treat it accordingly

At 5–8 days it is larger than everything else here combined. If the issue needs to shrink,
**this is the piece to split out**, not to squeeze. It sits in its own group so that it can
leave without disturbing anything else.

## The diff harness is the deliverable that lasts

Merging the two files fixes today's drift. Only a harness stops tomorrow's. Enumerate every
URL from the resolver, fetch each from a dev server, compare status and byte length against
the built file. It is the same technique a Go port would need, so it is not throwaway work
under any future decision.

## Why the redirect and the 404 are one subtask

Both come from the same root: build-time enumeration does not know what request-time
matching knows. The 302 exists in one path and not the other; the 404 page exists in
neither, because nothing enumerates "the set of URLs that should not resolve".

## Done when

- [ ] One resolver, called by both request matching and build enumeration
- [ ] `/todo/<issue>/plans/<plan>/<nonexistent>` behaves identically in dev and build
- [ ] `dist/404.html` exists and is served for unknown paths
- [ ] A missing docs page does not return a 296,909-byte styled 200 in dev
- [ ] The diff harness runs and reports zero divergences
- [ ] `agent-ks check link-form` and `check links` still pass
