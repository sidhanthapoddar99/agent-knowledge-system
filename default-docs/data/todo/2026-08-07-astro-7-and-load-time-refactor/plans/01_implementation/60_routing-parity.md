---
title: "Routing parity"
outcome: "Proven: dev and the build agree on all 1285 URLs, zero divergences. The 404 page ships. The resolver merge is recommended CANCELLED — it was insurance against drift that does not exist and that the harness now detects for free"
notes: "🟡 **One decision for Sid** — accept or reverse cancelling the merge. It was scoped at 5–8 days; the harness cost hours and catches the same class. Nothing done here is wasted either way: a merge would need this harness in front of it"
who: claude
status: input-needed
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

## 🟡 The one thing for Sid

The subtask carries the argument in full. In short: the two resolvers already share every URL spelling by import, and measurement says they agree on all 1285 addresses. **Merging them was 5–8 days of unrested refactor to prevent drift the harness detects in three minutes** — and the harness is what a merge would need in front of it anyway, so nothing is wasted if you reverse this.

Accept, or say the word and the merge goes back on.
