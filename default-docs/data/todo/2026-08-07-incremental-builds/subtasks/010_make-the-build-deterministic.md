---
title: "Make the build deterministic — move relative time to the client"
status: open
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

- [ ] Emit a deterministic string server-side, and compute the relative form in the
      browser from the `datetime` attribute that is already there
- [ ] Decide what the server-rendered text is — see Details, this is the only real
      decision here
- [ ] Check the other three `<time>` call sites, not just the issues table
- [ ] Prove it: two builds of an unchanged tree, 1,290 of 1,290 identical
- [ ] Check nothing else drifts once this is gone — the 98.7% is a floor measured
      twice, not a proof

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
