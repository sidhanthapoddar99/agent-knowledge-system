---
title: "Absolute resolution — the renderer produces the URL"
status: open
---

# What this group is

**Everything needed to stop emitting browser-relative hrefs.** The design is
[the path map](../../notes/30_the-path-map.md); this group is the work that lands
it, plus the pieces of the old link-integrity round that only make sense as part
of it.

The order that actually matters is small — the map and the threading come first,
everything else consumes them:

```
010 thread base_url + build the map
        │
        ├── 020 the shared resolver, docs
        │        │
        │        ├── 030 the Comprehensive panel  (the case relative can never fix)
        │        └── 050 unify the tracker + blog onto one resolver
        │
        ├── 040 base_url vs folder name           (an assumption the map must not inherit)
        ├── 060 the link checkers, once the URLs are the renderer's
        └── 100 unify the ROUTE resolvers onto the same map
```

**100 is the routing-side twin of 020**, and it exists because the map this group
builds holds the knowledge `static-paths.ts` already derives — so landing the map
without it means three places produce a URL instead of two. It came from
[stage 60 of the Astro 7 issue](../../../2026-08-07-astro-7-and-load-time-refactor/plans/01_implementation/60_routing-parity.md),
which measured the two route resolvers as agreeing on all 1285 URLs and correctly
declined to merge them for their own sake. **Do not start it before 010.**

# What lands elsewhere

- **The hosting prefix** is [its own group](../200_path-prefix/00_overview.md) —
  it consumes this one and cannot start before `020`.
- **Content-side link form** — the rule that markdown links stay relative on disk
  — is not in scope and does not change. It is enforced by
  `agent-ks check link-form`, and the outstanding work on it stays in the
  [link-integrity group](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/00_overview.md).

# The standing constraint on every subtask here

**Dev must keep working.** This project is used in `./start dev`, so no change
lands that trades dev correctness for production correctness — that is what both
reverted attempts did. Every subtask that touches URL generation reports
`scripts/checks/check-links.mjs` against **both** a dev server and a real static host,
before and after. One number is not a measurement here; it is how this went wrong
twice.
