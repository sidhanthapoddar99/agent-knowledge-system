---
title: "Routing parity"
outcome: "Proven: dev and the build agree on all 1285 URLs, zero divergences. The 404 page ships. The resolver merge did not happen here — it moved to the absolute-link-resolution issue, where the path map gives it a reason better than drift insurance"
notes: "Closed. Sid accepted the recommendation and rehomed the merge to [100/100 unify the route resolvers](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/100_unify-the-route-resolvers.md), gated on that issue's path map. Deleting the duplicated traversal is the last step there, not the first"
who: claude
status: done
subtasks:
  - "[One URL resolver for dev and build](../../subtasks/040_routing-parity/010_unified-url-resolver.md)"
---

One URL resolver serving both request matching and build enumeration, plus a real 404 page.

**This stage is larger than stages 10 through 50 combined** — 5–8 days against roughly a
week for everything before it. It is last for two reasons: nothing depends on it, and
[stage 40](./40_the-upgrade.md) touches routing, so running this first would mean doing it
twice.

## Todo

- [x] [the unified URL resolver](../../subtasks/040_routing-parity/010_unified-url-resolver.md) — harness + 404 done; the merge itself is recommended cancelled

## Gate

Three of the four clauses pass; the fourth had already been fixed and the premise of the first turned out to be correct behaviour.

| Clause | Result |
|---|---|
| The diff harness reports **zero divergences** | ✅ 1285 URLs — 1273 agree, 12 explained, 0 diverge |
| `dist/404.html` exists and is served | ✅ Added — `src/pages/404.astro`, 9,916 bytes |
| A missing docs page no longer returns a 296,909-byte styled **200** | ✅ Already true before this stage. It is a **404**, 133,998 bytes. The shell body is deliberate — the sidebar stays navigable while a file is mid-edit |
| `/todo/<issue>/plans/<plan>/<nonexistent>` behaves identically in dev and build | ❌ **Rewritten as not-a-defect.** Dev 302s to the plan page for *any* file under a plan folder, so a relative link to `overview.md` resolves; the build cannot enumerate names that do not exist. Deliberate leniency, not drift |

Both harnesses were controlled in both directions. The route-parity one **failed its own control on the first attempt** — it compared a path against a path-plus-anchor and reported 17 correct plan-stage redirects as broken.

## Questions

- [x] **Is this the stage to lift out?** No longer the right question — most of it is recommended cancelled rather than deferred. What remains (harness, 404) is done and small.
- [x] **Does this lead, follow, or merge into [the default-route-resolution issue](../../../2026-05-07-default-route-resolution/issue.md)?** **Neither.** That issue is `done` and covers a hierarchical-sort bug that sent `/user-guide` to a stub. No overlap.
- [x] **Is the harness the half that lasts?** Yes, and more so than the plan assumed. It is now the *whole* recommendation rather than the durable half of a bigger job.

## ➡️ Where the merge went

**Settled: not cancelled, rehomed.** It is now
[100/100 unify the route resolvers](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/100_unify-the-route-resolvers.md).

The reasoning that moved it, in one line: **that issue builds a path map — every source file to its published URL — which is the same knowledge `static-paths.ts` already derives.** Landing the map without unifying the route resolvers means three places produce a URL instead of two. That is a real reason to merge; "the two might drift" was not, because measurement says they have not.

So the merge waits on that issue's
[100/010 path map](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/010_thread-base-url-and-build-the-map.md),
and removing the duplicated traversal is the **last** step there rather than the first.
