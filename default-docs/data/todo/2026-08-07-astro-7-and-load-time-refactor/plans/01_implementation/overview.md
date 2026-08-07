---
title: "Implementation"
---

Six stages covering all eleven subtasks. The order is not arbitrary — four of the six
constraints below are hard, and breaking them makes later work either impossible to verify
or expensive to redo.

**The shape of it.** Measure first, then take the win, then remove hazards, then take the
risk, then clean up, then the big one.

```
  10 baseline ──┬──────────────────────────────────► 40 upgrade ──► 50 correctness ──► 60 routing
                │                                        ▲
  20 load-time ─┴──► (value lands here, independently) ───┤
                                                          │
  30 de-risk ─────────────────────────────────────────────┘
```

## The four hard constraints

| Rule | Why |
|---|---|
| Stage 10 before stage 40 | You cannot diff a typecheck against a baseline you never recorded |
| Stage 30 before stage 40 | Deleting `@astrojs/mdx` removes a whole co-bump; moving cache state to `globalThis` takes moving parts out of the riskiest area and is what makes the `moduleGraph` deletion test meaningful |
| Stage 20 before stage 40 | Not a dependency — a hedge. The measured value lands before the risky bump, and it leaves a verified known-good state to compare against afterwards |
| Stage 50 after stage 40 | The theme and CSS fixes should be applied to the post-upgrade state, not to a state the upgrade is about to change |

Stage 60 is last because it is the largest and it stands alone. Stage 40 touches routing,
so doing 60 first would mean touching it twice.

## Where this can stop

**After stage 20 the issue has already paid for itself** — the 3.2 s first request and the
65 KB per-page CSS block are both gone. Everything after that is currency and correctness.

If time runs short, [stage 60](./60_routing-parity.md) is the piece to lift out into its own
issue. It is 5–8 days, larger than stages 10 through 50 combined, and nothing else depends
on it.

## What this plan does not decide

Nothing here commits to the Go runtime, and nothing here forecloses it. The relationship is
recorded in [the parent issue](../../issue.md) and argued in
[the Astro 7 versus Go comparison](../../../2026-05-08-runtime-stack-migration/notes/astro-7-vs-go/01_comparison.md).
