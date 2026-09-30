---
title: "Testing and hardening"
status: open
outcome: "The new engine is proven against today's output, end to end and within its budgets"
notes: "Testing comes at the end (sidhantha, 2026-09-30). Needs [multi-user](./35_multi-user.md)"
who: "claude"
subtasks:
  - "[020/10 Golden fixtures — capture today's output so the new engine can be proved equal](../../subtasks/020_content-contract/10_golden-fixtures.md)"
  - "[170/20 Route and content parity — the new engine against today's](../../subtasks/170_testing/20_route-and-content-parity.md)"
  - "[170/30 End-to-end tests in a real browser, with the default library](../../subtasks/170_testing/30_end-to-end.md)"
  - "[170/40 Performance budget — engine start-up, memory, render, build and size](../../subtasks/170_testing/40_performance-budget.md)"
  - "[090/80 Performance budget checks in CI](../../subtasks/090_frontend-performance/80_perf-budget-checks.md)"
  - "[060/95 Collaboration tests — convergence, reconnect, conflicts, access and load](../../subtasks/060_collaboration/95_collaboration-tests.md)"
  - "[190/60 Homepage: checks in the gate](../../subtasks/190_homepage/60_homepage-checks.md)"
---

The full test suites, run once the features exist. While building, every stage keeps only basic unit tests and a little integration testing, under 10 seconds for the whole run.

# 01 To Do
- [ ] **Golden corpus and parity:** capture today's output from the pinned commit and compare the new engine with it (020/10 corpus part, 170/20).
- [ ] **End to end** in a browser, with the default library (170/30).
- [ ] **Performance budgets** for the engine, the binary and the browser (170/40, 090/80).
- [ ] **Two-client collaboration suite** (060/95).
- [ ] **Homepage checks:** Lighthouse, accessibility, links, screenshots (190/60).
- [ ] **Fix what the suites find** before tagging 1.0.0.

# 02 Status and Result
Not started.

# 03 References
- [The plan overview](./overview.md)
- [Testing notes](../../notes/05_delivery/05_development-workflow-and-testing.md)

# 04 Decisions
- Decided (sidhantha, 2026-09-30): testing comes at the end. During the build, tests are basic unit tests plus a little integration testing, and the whole run stays under 10 seconds.

# 05 Notes & Analysis
## 01 Why here
Running the heavy suites while the code still changes every hour would slow the build and test code that is about to move. Here the features are in place, so a failure is a real defect.
