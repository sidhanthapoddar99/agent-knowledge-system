---
title: "Performance budget checks in CI"
status: open
---

Budgets that are not measured drift. This leaf builds the harness that measures every budget in [the group index](./00_overview.md) on the real corpus and fails `ctl gate` (bundle sizes) or the parity workflow (timings) when one breaks. It is the frontend half of [170/40 performance budget](../170_testing/40_performance-budget.md); the engine half (memory, start-up, render times in Rust) lives there.

# 01 To Do
- [ ] **Bundle sizes** — read `data/builds/bundle-report.json` from [40](./40_code-splitting-and-lazy-islands.md); fail `ctl gate` when the start-up JavaScript or CSS passes its budget. Print the top five chunks by growth since the last main-branch run.
- [ ] **Timings** — a Playwright script against `agentks start` on the corpus, production build, run three times, median taken:
    - [ ] cold and warm first contentful paint of five fixed pages (one per layout kind);
    - [ ] click-to-paint for 20 cached and 20 uncached navigations;
    - [ ] redraw time after touching a file on disk;
    - [ ] scroll frame times on the 5,000-row fixtures ([60](./60_large-list-virtualisation.md));
    - [ ] tab memory after 200 navigations (`performance.measureUserAgentSpecificMemory` where available).
- [ ] **Report** to `data/builds/perf-report.json` and as a table in the CI summary.
- [ ] **Thresholds** from the budget table; timing checks allow 10 percent noise before failing.

## Guardrails
- Budgets are changed only in [the group index](./00_overview.md), with a reason.
- The check runs against production builds only.

## Done when
- The parity workflow in CI runs the timing script and fails on a deliberately slowed build (a test that adds a 200 ms delay to navigation).
- `ctl gate` fails when a heavy library is imported statically into the shell (checked with a deliberate change in a test branch).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/tests/perf/` and the `ctl` gate script.
- **Read first:** [development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) (sections 04 to 06, the gate and CI).
- **Depends on:** [40](./40_code-splitting-and-lazy-islands.md), [60](./60_large-list-virtualisation.md), [70](./70_render-performance.md), [010/40 ctl and gate](../010_project-setup/40_ctl-and-gate.md), [010/50 CI workflows](../010_project-setup/50_ci-workflows.md).
- **Related:** [170/40 performance budget](../170_testing/40_performance-budget.md).

# 04 Decisions
- Proposed (claude, 2026-09-30): the budget table in [the group index](./00_overview.md).

# 05 Notes & Analysis
## Watch out
- CI machines are slower and noisier than a laptop. Calibrate thresholds on the CI runner once and record the runner type in the report.
