---
title: "The upgrade"
status: open
---

Astro 5.17.1 → 7.2.0, dragging Vite 6 → 8. Two majors in one move.

**This stage buys no measured speed.** It is currency work. The performance win already
landed in [stage 20](./20_load-time-fix.md), and Rolldown does not touch the paths that were
slow. Judge this stage on "nothing broke", not on numbers.

## Todo

- [ ] [the Astro 5 → 7 upgrade](../../subtasks/020_astro-7/010_astro-5-to-7-upgrade.md)
- [ ] Re-run the typecheck from [stage 10](./10_baseline-and-safety-net.md) and diff against the baseline
- [ ] Re-run every baseline measurement and record the deltas

## Blocked by

Stages [10](./10_baseline-and-safety-net.md) and [30](./30_de-risk-the-upgrade.md), both hard. Stage [20](./20_load-time-fix.md) by preference, so the value is banked before the risk is taken.

## Gate

The build completes at 1,229 pages or more, all six dev-toolbar apps register and open, the editor mounts and saves without echo-looping, and live theme and layout switching still work. The typecheck delta is recorded — new errors are the upgrade's and must be resolved before the stage closes.

## Questions

- [ ] **The dev toolbar is the real risk.** Six apps, 1,793 lines, on Astro's proprietary API — the largest lock-in in the repo. Astro 6.0.0–6.0.3 shipped a regression that made the toolbar vanish. Going straight to 7.2.0 should sidestep it; if you step through 6 for any reason, pin ≥ 6.0.4.
- [ ] **Can the `moduleGraph` reach-in go?** `integration.ts:206-232`, 25 lines. Astro 6.3.4+ carries upstream fix #16757, and whether it covers this project's git-ref path has been flagged as unverified since the 2026-06-09 research. Test it here. With stage 30 landed the test is clean.
- [ ] Watch RSS. Vite 8 bundles in Rust rather than on the JavaScript heap, so this is the one place the upgrade might genuinely help against the 874 MB baseline. Not predicted — measure it.
