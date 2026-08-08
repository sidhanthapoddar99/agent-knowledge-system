---
title: Decide what guards the route set, and when it runs
status: open
---

# Decide what guards the route set, and when it runs

## Overview

Removing the preflight build was correct. It also left the address space unguarded on a
normal day. This subtask decides what replaces it — not whether to put the build back.

The constraint that shapes the answer: **whatever guards this cannot run on every
`./start`.** That is the cost that was just deliberately removed, and re-adding it under
a different name would undo the measurement rather than answer it.

## References

- [the issue](../issue.md) — why dev structurally cannot cover this
- [010 — the leak this would have caught](./010_stop-emitting-src-pages-lib-as-routes.md)
- `scripts/checks/check-route-parity.mjs` — the existing harness, and its blind spot
- `scripts/start.mjs` — `doctor`, the candidate host
- `default-docs/data/dev-docs/20_development/08_repo-check-scripts.md` — the gate
  conventions these follow, including "it must be able to fail"

## The design question

`check-route-parity.mjs` compares **`buildStaticPaths()` against dev**. That is the
framework's idea of the route set on one side and dev on the other — so a route Astro
adds underneath the framework (which is exactly what `src/pages/lib/*.ts` is) is absent
from both sides and cannot be reported.

Comparing **what the build actually wrote into `dist/`** against dev would have caught
it on the first run. That is a different and strictly wider question, and it costs a
build to ask.

Options, to be decided rather than assumed:

| | What it compares | Catches the `dist/lib/` class? | Cost |
|---|---|---|---|
| A | keep `buildStaticPaths()` ↔ dev | no | no build |
| B | `dist/` ↔ dev | yes | one build |
| C | both — A stays as the fast check, B runs in `doctor` | yes | one build, in `doctor` only |

## Todo list

- [ ] Decide between A / B / C above. Record the decision and its reasoning in `notes/`,
      not here.
- [ ] Wire the chosen check into `./start doctor`, which already runs a full build and
      already means "check before you publish". It is the only command that has a fresh
      `dist/` by the time the check would run.
- [ ] Control the harness in both directions before trusting it — deliberately emit a
      junk route, confirm it goes red, restore. A harness that has never failed is not
      evidence; the route-parity one had a real bug found by exactly this exercise.
- [ ] Decide whether `doctor` should fail or warn on a divergence, and say so in its
      output either way.
- [ ] Update `08_repo-check-scripts.md` with whatever ships.

## Done when

- `./start doctor` reports on the route set, and its report is verifiable against a
  deliberately-introduced junk route.
- The decision between A/B/C is written down in `notes/` with its reasoning, so the next
  person does not re-derive it.
- `./start` (dev) is not measurably slower than it is today. This is the constraint, and
  it is checkable: current figures are ~2.4 s to ready, ~0.4 MB written.

## Details

There is a second, cheaper thought worth recording while deciding: a lint that simply
asserts **nothing under `src/pages/` is a non-route file** would have caught this exact
instance in milliseconds, with no build and no server. It does not generalise to
duplicate URLs or to dev/build divergence, so it is not a substitute for the above — but
it may be worth having alongside, and it could run in dev.
