---
title: "The upgrade"
outcome: "Astro 7.2.0 builds 1,229+ pages with the toolbar, the editor and live theme switching all intact"
notes: "Landed on 7.2.0 / Vite 8.2.1. **Build 2× faster and 38% lighter** — I predicted no speed win and was wrong. One break, and it was ours"
who: sid
status: review
subtasks:
  - "[Astro 5.17.1 → 7.2.0](../../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md)"
  - "[Typecheck baseline](../../subtasks/020_astro-7/020_typecheck-baseline.md)"
---

Astro 5.17.1 → 7.2.0, dragging Vite 6 → 8. Two majors in one move.

**I wrote that this stage would buy no measured speed. That was wrong**, and the
correction matters because it changes what the upgrade is worth. It is right about warm
request time, which is what [stage 20](./20_load-time-fix.md) fixed and which Rolldown
does not touch. It is wrong about the build, and wrong about memory — which is the
problem Sid named first.

| Measured, quiet machine, 3 runs each | Astro 5.17.1 / Vite 6.4.1 | Astro 7.2.0 / Vite 8.2.1 |
|---|---|---|
| Build, wall | 13.7–15.1 s | **7.1–7.3 s** (~2×) |
| Build, peak RSS | 2,049 MB | **1,239 MB** (−38%) |
| `/todo` first request | 1.039 s | **0.590 s** |
| Detail page, first request | 1.576 s | **1.245 s** |
| `/todo` warm | 0.033 s | 0.034 s |
| Dev server ready | ~400 ms | ~1,057 ms — **slower** |
| Built HTML, total | 73.8 MB | 79.7 MB — **+8%** |
| Pages | 1,265 | 1,265 |
| Typecheck errors | 27 | 27, same files, same codes |

## The one thing that broke was ours

`paths.ts` found the framework root by counting levels: `resolve(__dirname, '../..')`.
Astro 5 bundled chunks to `dist/chunks/`, where that lands on the framework root. Astro 7
bundles to `dist/.prerender/chunks/`, one level deeper, so it resolved to `dist/` and every
theme lookup hunted for `dist/src/styles`. The build died on the first page.

It now walks up looking for `src/styles/theme.yaml` instead of counting, so a source-tree
fact no longer rides on a bundler layout detail. **This was a latent defect, not an Astro 7
bug** — the old code was correct only by coincidence.

## Behaviour changes that need no code, but do need knowing

- **`astro dev` runs in the BACKGROUND** when it detects an AI-agent environment, with
  `astro dev stop | status | logs`. It also writes a per-project lock, so a second dev
  server refuses to start rather than choosing another port.
- **The ready line is JSON now**, not `astro v5.17.1 ready in 428 ms`. Anything grepping
  for the old text hangs rather than failing — which cost me two bogus measurements
  before I noticed.
- **Dev-only endpoints prerender into `dist/api/dev/*`.** They are guarded and emit
  `{"error":"Not available in production"}`, so it is three stray files, not a leak.

⚠️ **`./start` and `start.ps1` have not been checked against any of this.** They are the
documented way to run this project and they parse dev-server output. That is the first
thing to look at.

## What was verified, and what was not

Verified by request: all three dev API routes, `/editor`, the yjs socket, editor
middleware, presence cleanup, and dev theme switching — which incidentally proves the
content-hashed stylesheet URL busts correctly (`t=full-width&v=c1225328` →
`t=styles&v=8ec1c5cf`).

**Not verified: how any of it looks.** The toolbar apps were checked by their
registration and their routes answering, not by opening them. That check is Sid's.

## Todo

- [ ] [the Astro 5 → 7 upgrade](../../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md)
- [ ] Re-run the typecheck from [stage 10](./10_baseline-and-safety-net.md) and diff against the baseline
- [ ] Re-run every baseline measurement and record the deltas

## Blocked by

Stages [10](./10_baseline-and-safety-net.md) and [30](./30_de-risk-the-upgrade.md), both hard. Stage [20](./20_load-time-fix.md) by preference, so the value is banked before the risk is taken.

## Gate

The build completes at 1,229 pages or more, all six dev-toolbar apps register and open, the editor mounts and saves without echo-looping, and live theme and layout switching still work. The typecheck delta is recorded — new errors are the upgrade's and must be resolved before the stage closes.

## Questions

- [x] **The dev toolbar was the predicted risk. It was not the one that bit.** Going
      straight to 7.2.0 skipped the 6.0.0–6.0.3 window; the toolbar's server side
      registers and every route answers. The break came from our own path arithmetic.
- [x] **Watch RSS** — done, and it is the best result here. Build peak RSS
      2,049 MB → 1,239 MB, a 38% cut against the problem Sid named first.
- [ ] 🔴 **The git-ref watcher did not fire on a real commit.** The commit for this stage
      was made with the dev server running, and nothing appeared in its log — no
      `git ref changed`, no `SSR module invalidated`. The paths ARE registered at boot
      (`[HMR] Watching git ref: …/refs/heads/go-astro7-migration`), so it registers and
      then stays silent. If that is right, derived `updated` dates go stale in dev until
      a restart. **Not yet a confirmed regression:** the same watcher could not be made
      to fire on Astro 5 either, so there is no control. Getting one is the next step.
- [ ] **Can the `moduleGraph` reach-in go?** `integration.ts:215-232`. Stage 30 removed
      its reason for existing by sharing the caches, and the API still exists in Vite 8.
      But it is unsafe to delete while the watcher above is silent — the reach-in only
      ever runs inside that handler, so its behaviour is currently unobservable. **Settle
      the watcher first; this question is downstream of it.**
- [ ] **`./start` / `start.ps1` against the new CLI.** Background mode, the lock file and
      the JSON ready line all land on the wrapper, and none of it has been tried.
