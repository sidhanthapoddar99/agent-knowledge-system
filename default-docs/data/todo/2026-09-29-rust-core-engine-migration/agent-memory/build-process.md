---
title: "Build process — waves of parallel agents"
---

How the build runs, so a later session can pick it up without rediscovering it. Where the build stands and what comes next are in the [handover](handover.md).

## One wave

1. **Pick the tracks.** Each track is one agent with a scope of folders nobody else writes in that wave. Contracts first: parallel implementation only starts once the interfaces between the parts exist.
2. **Make a worktree per main-repository track**, from the main session (subagents run no git that changes anything): `git worktree add -b wave<N>/<track> /home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/<track> main`, then `mise trust <path>`. A track in the library or marketplace repository works directly in that repository when it is the only agent there.
3. **Run a Workflow**: build → an independent quick review → a fix only for blocking findings. Builders set their subtasks to `in-progress` at the start and `review` at the end, and fill `02 Status and Result`.
4. **Integrate after every agent has finished** (the user's rule: no checkout or merge while a subagent runs): merge each `wave<N>/<track>` branch into `main` with `--no-ff`, resolve conflicts (usually `AGENTS.md`, `.mise.toml`, `scripts/gate/`), run `./ctl gate`, commit, push, check CI, then `git worktree remove` and delete the branch.
5. **Update the tracker**: group `00_overview.md` status tables and statuses, the plan stage's `02`, note corrections the agents listed under `notes_to_update`. The owner commits this repository; Claude commits here only when the owner asks.

## Merging a wave: what bit before

- Run the merge loop under bash, not zsh: zsh does not split a variable on newlines, so a loop over conflicted files runs once with all of them.
- `AGENTS.md` and `Cargo.toml` conflict on added lines. Keep both sides, then remove the old copy of any line a branch rewrote, and keep one entry per crate in `[workspace.dependencies]` (a duplicate key breaks the TOML).
- `Cargo.lock`: take one side, then run `cargo metadata` so cargo adds the missing packages without moving existing pins.
- Parallel tracks drift on struct fields: wave 2's CLI built `ServeOptions` without the field the server track added. The gate on the merged `main` catches it; fix it in the integration commit.
- Resolve a conflict block from both sides' own lines, passed as lists of lines. A string where a list belongs writes one character per line (it broke `ctl` once, caught before the push).
- Read the auto-merged lines too. Git took the voice branch's help line "(none) engine, then homepage" from an older base, which dropped the client.
- A fresh worktree has no `node_modules`, so the lint rung fails with `oxlint: command not found`. Run `./ctl setup` there, or `bun install --frozen-lockfile` in the app. CI runs `ctl setup` itself.
- Parallel tracks build the same thing twice. Wave 3 had two sidebar folder memories and two per-project UI stores. Before resolving a track's merge, look for a module in `main` with the same job (the same storage prefix, a context with the same purpose) and keep one. Two stores under one `aks:<key>:` prefix in different formats are a bug, not just a copy: one store's start-up prune deletes the other's blobs.
- A prop one track adds to a shared contract (the editor's `bodySlot`) does not reach layouts another track added. A test over the registry (`tests/body-slot.test.tsx`) catches the next one. The same goes for islands: a hydrating island drawn as a bare component has no marker on a static page, so draw it through `Island`.
- `git merge --no-edit` writes git's default message with no co-author line. Pass `-m "Merge <branch>"` and the co-author line.
- In the zsh tool shell, `./ctl $t` passes `"gate lint ui"` as one word. Use `${=t}`.
- The editor test prints a happy-dom `NotSupportedError` for the artifact iframe. It is noise; the tests pass.
- Library: a batch that carries a built copy of the player, or fixtures that embed components, goes stale when another batch changes them. After merging, run `preview/video/fixtures/build.py --check`, rebuild what it names, and rebuild `animations.json` with `build_animations.py`.

## Tracker commands that took a try to get right

- A plan stage's status: `agent-ks issue set-state 2026-09-29-rust-core-engine-migration/plans/01_engine-migration/<NN_stage>.md <status>`. The path is relative to the tracker folder and keeps its `.md`; a path from the repository root is "not found".
- A subtask's status: `agent-ks issue set-state 2026-09-29-rust-core-engine-migration <status> --subtask <slug>`, run from this repository's root. A slug shared by several files (such as `overview`) is ambiguous; use the group and the file name with `.md`, such as `--subtask 180_documentation/00_overview.md`.

## Rules every agent gets

- Tests while building: basic unit tests and a little integration testing, under 10 seconds for the whole run. Heavy suites wait for [stage 38](../plans/01_engine-migration/38_testing.md).
- Latest stable versions of every tool and dependency (see [toolchain versions](toolchain-versions.md)).
- Record design choices in the subtask's `04 Decisions`; list note corrections for the orchestrator instead of editing shared notes.

## Where things are

- Worktrees: `/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/`.
- Workflow scripts and transcripts: under the session's `workflows/` folder; the wave scripts are `agentks-wave-1` and `agentks-wave-2`.
- The video engine builds in its own waves beside the engine's, tracked in [the video issue](../../2026-09-29-narrated-video-pages/issue.md) (design: its `brainstorm/01_video-artifact-engine/`). Video wave 1 (`agentks-video-wave-1`) uses the worktrees `video-player` and `video-voice` (branches `wave2/video-player`, `wave2/video-voice`) and works directly in the library repository for the restructure. Spike output for the user goes to the main checkout's `data/player-spike/` and `data/voice-spike/`, which git ignores.
- Work that ran beside the waves on 2026-10-01, all finished and merged:
  - The new docs: workflow `agentks-docs-2`. Eight writers wrote this repository's `default-docs/data/user-guide-2/` and `dev-docs-2/` ([180/00](../subtasks/180_documentation/00_overview.md) has the outline).
  - The plugins: workflow `agentks-plugins`; the trim ran in `agentks-fixes-1` on the same branch `wave3/plugins`.
  - Library components: workflow `agentks-library-components`, one worktree per batch. Every batch adds entries to `manifest.json`, so a merge takes the manifests entry by entry, then runs `scripts/check.py`.
  - The video folder form: workflow `agentks-video-folder-form`. Its decisions are 41 to 52 in the video design's index.
  - The homepage redesign: a separate forked session in worktree `homepage-3`. It is merged and the worktree is removed.
- A workflow's results: read `journal.jsonl` in its transcript folder (one JSON line per event; the `result` lines carry each agent's return value). The workflow's output file is not plain JSON.
