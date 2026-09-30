---
title: "Build process — waves of parallel agents"
---

How the build runs, so a later session can pick it up without rediscovering it.

## One wave

1. **Pick the tracks.** Each track is one agent with a scope of folders nobody else writes in that wave. Contracts first: parallel implementation only starts once the interfaces between the parts exist.
2. **Make a worktree per main-repository track**, from the main session (subagents run no git that changes anything): `git worktree add -b wave<N>/<track> /home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/<track> main`, then `mise trust <path>`. A track in the library or marketplace repository works directly in that repository when it is the only agent there.
3. **Run a Workflow**: build → an independent quick review → a fix only for blocking findings. Builders set their subtasks to `in-progress` at the start and `review` at the end, and fill `02 Status and Result`.
4. **Integrate after every agent has finished** (the user's rule: no checkout or merge while a subagent runs): merge each `wave<N>/<track>` branch into `main` with `--no-ff`, resolve conflicts (usually `AGENTS.md`, `.mise.toml`, `scripts/gate/`), run `./ctl gate`, commit, push, check CI, then `git worktree remove` and delete the branch.
5. **Update the tracker**: group `00_overview.md` status tables and statuses, the plan stage's `02`, note corrections the agents listed under `notes_to_update`. The user commits this repository; Claude never does.

## Rules every agent gets

- Tests while building: basic unit tests and a little integration testing, under 10 seconds for the whole run. Heavy suites wait for [stage 38](../plans/01_engine-migration/38_testing.md).
- Latest stable versions of every tool and dependency (see [toolchain versions](toolchain-versions.md)).
- Record design choices in the subtask's `04 Decisions`; list note corrections for the orchestrator instead of editing shared notes.

## Where things are

- Worktrees: `/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/`.
- Workflow scripts and transcripts: under the session's `workflows/` folder; the wave 1 script is `agentks-wave-1`.
