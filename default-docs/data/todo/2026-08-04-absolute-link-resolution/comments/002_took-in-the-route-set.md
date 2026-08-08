---
title: "Took in the route set — group 300"
---

# Took in the route set — group 300

Added [300_the-route-set](../subtasks/300_the-route-set/00_overview.md), two
subtasks.

It was opened as its own issue (`2026-08-08-route-correctness-without-a-build`)
and folded in here the same day, before any work started. The standalone folder is
deleted; git history keeps it.

**Why here.** This issue owns the final URL — that is its whole premise. *"Which
addresses does this site publish, and do dev and the build agree on them?"* is the
same question from outside, and the two harnesses that would answer it
(`check-links.mjs`, `check-route-parity.mjs`) already belong to this issue. A
separate issue would have meant two issues editing the same two files for the same
reason.

**What it brings.** `./start` no longer runs a build, so nothing enumerates the
route set on a normal day. One instance is already shipping: `src/pages/lib/*.ts`
are emitted as five `dist/lib/` addresses that all serve the 404 page, which dev
refuses — and `check-route-parity.mjs` cannot see them, because it enumerates from
`buildStaticPaths()` rather than from what the build actually wrote.

That blind spot is a finding about **this issue's own harness**, which is the
clearest argument that the two belong together.
