---
title: "Closed 2026-08-04 — the shipped work stands, the decision carries forward"
---

Closed on Sid's instruction. Everything this issue shipped is in the tree and
working: the issues-only re-rooting postprocessor, the `/issue` → detail-root
redirect, colocated issue assets, dual-slug URL resolution, and plans
auto-resolution.

**The one open subtask was not a loose end — it was a whole issue's premise.**
Subtask `03` recorded the decision, taken here on 2026-06-09, to stop depending
on browser relative resolution and resolve every internal link to root-absolute
at render time. Two years of that decision being right was confirmed the hard way
on 2026-08-04, when a `../` depth shift and then `trailingSlash: 'always'` were
both tried as alternatives and both reverted within a day.

That subtask has moved, with its Comprehensive-panel worked example intact, to
[the issue that owns the fix](../../2026-08-04-absolute-link-resolution/issue.md)
— specifically
[the Comprehensive panel case](../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md).

**Why it moved rather than staying here.** The Comprehensive panel is not a
tracker bug. It is the clearest instance of a general rule — *a relative link is
a claim about the reader's location, and the renderer is not entitled to make
one* — and the fix is one shared resolver for docs, blog and the tracker alike.
Owned from the tracker, it would have been built for the tracker.

The interim `issue-body-links.ts` postprocessor this issue shipped stays in place
until that resolver lands, and is deleted by it.
