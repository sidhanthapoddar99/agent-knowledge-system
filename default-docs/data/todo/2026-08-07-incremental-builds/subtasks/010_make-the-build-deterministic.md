---
title: "Make the build deterministic — move relative time to the client"
status: done
---

# Overview

Two builds of identical input must produce identical bytes. Today they do not, and
**exactly one thing is responsible**: a relative timestamp rendered at build time.

This is the precondition for the whole issue. You cannot skip work you cannot prove
is unchanged.

Done when two consecutive builds of an unchanged tree produce 1,290 of 1,290
byte-identical pages.

# References

- [the partial-rebuild brainstorm](../../2026-08-07-astro-7-and-load-time-refactor/brainstorm/01_partial-rebuilds.md)
  — where the 98.7% figure and the diff below come from
- `astro-doc-code/src/layouts/issues/default/server/helpers.ts` —
  `formatRelativeTime`, the whole cause
- The four files emitting `<time datetime=…>`: `blogs/default/PostBody.astro`,
  `issues/default/parts/index/IssuesTable.astro`,
  `issues/default/parts/shared/MetaPanel.astro`,
  `issues/default/parts/shared/IssueCard.astro`

# Todo list

- [x] Emit a deterministic string server-side, and compute the relative form in the
      browser from the `datetime` attribute that is already there
- [x] Decide what the server-rendered text is — see Details, this is the only real
      decision here
- [x] Check the other three `<time>` call sites, not just the issues table
- [x] Prove it: two builds of an unchanged tree, 1,290 of 1,290 identical
- [x] Check nothing else drifts once this is gone — the 98.7% is a floor measured
      twice, not a proof

# Outcomes and Next Steps

**Done. The build is deterministic, and the clock left the server entirely.**

The recommendation in Details was taken unchanged: the server renders the full
date, the browser swaps it to a relative form.

## What changed

- **`astro-doc-code/src/modules/relative-time.ts`** — new, and deliberately pure
  (no Node imports) so the same file is bundled into the client. It holds
  `fullLabel()`, `relativeLabel(iso, now)` and `hydrateRelativeTimes()`. One tier
  table, two callers — the boundaries cannot drift apart, which they would have
  done immediately with a copy on each side.
- **`server/helpers.ts`** — `formatRelativeTime`, `formatFullDateTime`,
  `formatDateOnly` and the `MONTHS` table are **deleted**, not delegated. The
  point was to remove `Date.now()` from the render path; leaving a wrapper behind
  would have left the trap in place. A comment marks the spot and says why.
- **Three render sites** now emit `fullLabel(iso)` as the text and mark the
  element `data-relative-time`: `parts/index/IssuesTable.astro`,
  `parts/shared/MetaPanel.astro`, `parts/shared/IssueCard.astro`.
- **Both client entries** call `hydrateRelativeTimes()` —
  `scripts/index/client.ts` and `scripts/detail/client.ts`.

## The fourth call site did not need touching

`blogs/default/PostBody.astro` renders an absolute date through its own
`formatDate` and never reads the clock. **It was already deterministic**, so the
todo item above closes as "checked, nothing to do" rather than as a change.

It does carry an unrelated defect worth noting somewhere: it emits
`datetime="Mon Jan 15 2024 05:30:00 GMT+0530 (India Standard Time)"`, which is
not a valid `datetime` value — it is a stringified `Date` rather than ISO 8601.
Harmless to the eye, wrong to a parser. **Not fixed here**; it is a blog-layout
bug, not a determinism one.

## Proof

**Structural, which is stronger than a sampled diff.** The clock cannot affect
output that contains no clock-derived text:

```
  <time> elements in dist        972
  containing "N <unit> ago"        0
  marked data-relative-time      968   (the 4 unmarked are blog dates)
```

**Two cold builds of an unchanged tree, separated by 75 s so a minute boundary
falls between them** — the exact condition that used to produce the diff in
Details: **1307 of 1307 pages byte-identical.**

Both halves matter. The old test passed by accident whenever two builds happened
to land inside the same minute, which is how this survived as long as it did.

## Verified in a real browser, on the built site

Headless Chrome against `./start preview` (not just dev, since dev re-renders per
request and would have hidden the original bug entirely):

```
  /todo                    110 marked · 72 rewritten to relative
  /todo/<an issue>           1 marked ·  1 rewritten
```

The 38 that stayed absolute are older than the 7-day cutoff — `relativeLabel()`
returns `null` there, so the server text is left alone and nothing flickers.

Consecutive page loads a minute apart read "16 min ago" then "17 min ago" from
**the same static HTML file**, which is the whole point: the page no longer
carries an answer, it carries the data.

## What this unblocks, and one thing it does not

[025](./025_evaluate-astros-own-incremental-build.md) recorded this as blocker 1
of 3 for turning on Astro's incremental build. It is cleared, and the staleness
gate (`scripts/check-incremental-staleness.mjs`) is now meaningful in its strict
default mode rather than flaky.

**It does not by itself justify enabling the cache.** Blockers 2 and 3 stand:
nothing runs the gate in CI, and it remains an experimental flag on a
version-gated engine.

## Cost, stated plainly

Issue pages now load a small client chunk (`_astro/relative-time.*.js`) they did
not before. **Docs pages are unaffected and still ship zero JavaScript.** A
reader without JavaScript sees a correct absolute date, which is strictly better
than the frozen relative string they used to get.

# Details

## The entire non-determinism, from a real diff

```
- <time datetime="2026-08-07T13:38:52+05:30" title="Aug 7, 2026 13:38">10 min ago</time>
+ <time datetime="2026-08-07T13:38:52+05:30" title="Aug 7, 2026 13:38">11 min ago</time>
```

The `datetime` and `title` attributes are identical. Only the text drifts, because
`formatRelativeTime` calls `Date.now()` while rendering.

## It is narrower than it looks

`formatRelativeTime` already returns a **fixed date string** for anything older than
seven days. So only recently-touched issues drift at all — which is why all 17
differing pages sat in one folder.

In a tracker where most issues are older than a week, the build is *nearly*
deterministic already. That does not make this optional: "nearly" is not a property
you can build a cache on.

## The one real decision — what does the server render?

The relative text has to come from somewhere before JavaScript runs.

| Option | First paint | No-JS reader |
|---|---|---|
| **Render the full date, swap to relative** | Shows `Aug 7, 2026 13:38`, then becomes `10 min ago` | Sees a correct absolute date |
| Render nothing, fill in on load | Empty cell briefly | Sees nothing |

**The first is better on both counts** and is the recommendation. The visible swap
is the cost, and it only affects items newer than seven days.

⚠️ **This changes what a page looks like for a moment.** It is a small visual change
and it needs eyes on it once, not a measurement.

## Do not solve this by special-casing the hash

The tempting shortcut is to leave the drift in and teach the diff step to ignore
`<time>` elements. Do not. It makes the comparison lie about what changed, and the
next thing that drifts will be silently ignored too.
