---
title: "Engine migration and launch"
---

The order in which the migration runs, from empty repositories to the archived old repository. The design is in [the notes](../../notes/01_overview/01_index.md). The work items are in [subtasks](../../subtasks/), grouped by component; this plan groups them into stages by phase and launch step. The three NeuraLabsHQ repositories were created on 2026-09-30.

# 01 To Do
- [ ] [Stage 10: foundation](./10_foundation.md)
- [ ] [Stage 20: Phase 1, rendering](./20_phase-1-rendering.md)
- [ ] [Stage 30: Phase 2, editing and libraries](./30_phase-2-editing-and-libraries.md)
- [ ] [Stage 35: multi-user](./35_multi-user.md)
- [ ] [Stage 38: testing and hardening](./38_testing.md)
- [ ] [Stage 40: release 1.0.0](./40_release-1-0-0.md) (launch step 1)
- [ ] [Stage 50: Phase 3, publishing](./50_phase-3-publishing.md)
- [ ] [Stage 60: marketplace](./60_marketplace.md) (launch step 2)
- [ ] [Stage 70: homepage and docs](./70_homepage-and-docs.md) (launch steps 3 and 4)
- [ ] [Stage 80: hosting](./80_hosting.md) (launch step 5)
- [ ] [Stage 90: switch-over and archival](./90_archival.md) (launch step 6)

# 02 Status and Result
Wave 1 landed on 2026-09-30. Wave 2 (config, homepage, git and migrate, cache, library, CLI, server, render, UI and client, content, index) was merged into `main` on 2026-10-01 (integration commit `3e22f2d`), and the two AI plugins followed the same day (`7d0246e`). Wave 3 (contracts, site, sync, three layout tracks, the editor, embed-dev and client performance) is being built now in its own worktrees, beside a library `category` fix and a plugin trim.

Stages 10, 20, 30, 35, 40 and 70 are in progress, because the waves run work from several stages at once. Each stage's `02` says what is built and what is left. Stages 38, 50, 60, 80 and 90 are not started.

# 03 References
- [Issue](../../issue.md), [the launch order](../../comments/002_2026-09-30_launch-order.md)
- [Design notes](../../notes/01_overview/01_index.md), [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md)
- [Permissions and repositories](../../agent-memory/permissions-and-repositories.md), [toolchain versions](../../agent-memory/toolchain-versions.md)

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the six-step launch order in [the launch comment](../../comments/002_2026-09-30_launch-order.md).
- Decided (sidhantha, 2026-09-30): Claude has full autonomy in the three NeuraLabsHQ repositories (commit, branch, push). In this repository Claude edits and sidhantha commits. Hosting needs sidhantha.
- Decided (sidhantha, 2026-09-30): the latest Rust and the latest Vite; `AGENTS.md` is the only instruction file.
- Decided (sidhantha, 2026-09-30): build fast. Testing comes at the end ([stage 38](./38_testing.md)); while building, tests are basic unit tests and a little integration testing, under 10 seconds in total. Keep the tracker updated as work lands.
- Decided (claude, under sidhantha's delegation, 2026-09-30): the build runs in waves of parallel agents, one track per agent, each in its own git worktree of the main repository; an independent reviewer checks each track; the main session merges, runs the gate and commits between waves. How it runs is in [the build process](../../agent-memory/build-process.md).
- Decided (claude, under sidhantha's delegation, 2026-09-30): subtasks are grouped by component and stages by phase, so a subtask keeps one home while stages order the work.
- Decided (claude, under sidhantha's delegation, 2026-09-30): multi-user sync is stage 35, inside 1.0.0, because the per-file `yrs` documents already exist from Phase 2.
- Decided (claude, under sidhantha's delegation, 2026-09-30): Phase 3 comes after 1.0.0 and must finish before hosting, because `/docs` is built with `agentks build`. Stage 70 can run alongside it.

# 05 Notes & Analysis
## 01 Stage order and blocking

```
10 foundation ─► 20 Phase 1 ─► 30 Phase 2 ─► 35 multi-user ─► 38 testing ─► 40 release 1.0.0 ─┬─► 50 Phase 3 ──┐
                                                  └─► 60 marketplace                          └─► 70 homepage and docs ─┴─► 80 hosting ─► 90 archival
```

- Inside a stage, each group's `00_overview.md` gives the order of work. Groups in one stage run in parallel where their leaves' **Depends on** lines allow.
- Stage 60 needs only the rewritten plugins from stage 30, so it can run any time after them.

## 02 Unscheduled subtasks
Later-stage work, not part of this plan. They stay open for a later plan:
- [100/60 Roadmap and releases layouts (on demand, after 1.0.0)](../../subtasks/100_layouts/60_roadmap-and-releases.md)
- [100/70 GitHub issues layout (later stage)](../../subtasks/100_layouts/70_github-issues-layout.md)
- [130/40 Extensions: agentksx commands and site scripts (later stage)](../../subtasks/130_ai-plugins/40_extensions.md)
- [130/50 Agent hooks and fast retrieval (later stage)](../../subtasks/130_ai-plugins/50_agent-hooks-and-retrieval.md)
