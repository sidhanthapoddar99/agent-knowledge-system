---
title: "Routing parity"
status: open
---

One URL resolver serving both request matching and build enumeration, plus a real 404 page.

**This stage is larger than stages 10 through 50 combined** — 5–8 days against roughly a
week for everything before it. It is last for two reasons: nothing depends on it, and
[stage 40](./40_the-upgrade.md) touches routing, so running this first would mean doing it
twice.

## Todo

- [ ] [the unified URL resolver](../../subtasks/040_routing-parity/010_unified-url-resolver.md)

## Gate

`/todo/<issue>/plans/<plan>/<nonexistent>` behaves identically in dev and in the build, `dist/404.html` exists and is served, a missing docs page no longer returns a 296,909-byte styled 200 in dev, and the dev-versus-build diff harness reports zero divergences.

## Questions

- [ ] **This is the stage to lift out if the issue needs to shrink.** It is self-contained and nothing blocks on it. Splitting it into its own issue costs one folder move and no rework — decide before starting, not halfway through.
- [ ] [The default-route-resolution issue](../../../2026-05-07-default-route-resolution/issue.md) already owns part of this ground. Read it first and decide whether this stage leads, follows, or merges into it.
- [ ] The diff harness is the half that lasts. Merging the resolvers fixes today's drift; only the harness stops tomorrow's. It also ports unchanged to a Go runtime, so it is not throwaway work under any future decision.
