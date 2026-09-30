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

## Where the build stands

- Main repository, `main` pushed, CI green:
  - Wave 3 merged on 2026-10-01: contracts, site, sync, embed-dev, layout-tracker, layout-pages, layout-artifacts (`f108e19`), editor (`1e355ed`), client-perf (`a0097c4`).
  - `agentks-fixes-1` merged: library category (`9d2aeec`), the plugin trim (`3923eaa`), the voice spike fix (`8fdf75b`), video T5 (`96b747b`). The docs minors are in this checkout, for the owner to commit.
  - Every wave-3 and fix worktree is removed. Only `homepage-3` is left, because the homepage session may still use it.
- Library repository, `main` pushed: the video components (`afbe103`, `6eb6c53`, `e21d6e7`; 2,106 elements), the preview player kept out of git (`0a06883`, `f858a86`), and the polish (`0d585ed`). Its worktrees are removed.
- No agent or workflow is running. The owner asked to start none for now.
- Next: the server's open, save and `/_lib/` routes (050/35, 120/50), the CLI ports (070/20, 30, 60, 80 and 120/40, which now has the library crate's `Category` API to adopt), the video compiler (T3), and the chart templates.
- Held follow-ups, none started:
  - T5 annotations: the line draw breaks when `vector-effect="non-scaling-stroke"` meets `pathLength="1"` on a scaled SVG; the dash array should be `1 2`; dashes restart at every subpath, so draw paths one after another; and the fit geometry. The working reference is `data/library-scratch/annot-work/sheet.py` (`viewportLength`, `box`, `place`). Also replace the spike's fixture frames with the library's frames. The polish's line-draw notes are in the 08 design note.
  - Check that the animation presets' overlays name the marks that shipped (`scribble-circle`, `tick-mark`, `cross-mark`, `star-mark` and the rest).
  - The Rust SVG allowlist must admit what the shipped SVGs use: `pathLength`, gradient and pattern units, `stop-*`, `clip-path="url(#…)"`, the text attributes, the opacity and dash attributes, inner `transform`, `width` and `height`. The polish's list is in the 08 design note.
  - Voice: record the 16-bit model decision in 020, and switch `MODEL_FILE` and `fetch-model.sh` to `model_fp16.onnx`. The file is in `data/voice-spike/bench/`, for its checksum.
  - Homepage: replace the CSS video illustration with the real player, behind a play button.
  - Decide in 120/50: should `/_lib/` serve an SVG with its `--vx-*` roles resolved, so a plain `<img>` works in an artifact?
  - Rename the player's diagnostic codes `layout.text-fit`, `layout.overflow` and `layout.overlap` to kebab-case (video design decision 53), and the one dotted code left in `08_library-components.md`.
  - The widget size cap: sparkline-card is 5 bytes under 15,360. Decide whether shared blocks count toward it.
  - The tracker edits the 2026-10-01 tracker pass skipped are in `data/library-scratch/tracker-and-video-docs.json`, under each agent's `skipped_edits`. Apply each once its leaf's builder is done.
  - The site crate's memory is 279 MB against the 150 MB target (subtask 90).

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
- Work that runs beside the waves (started 2026-10-01):
  - The new docs: workflow `agentks-docs-2` finished. Eight writers wrote this repository's `default-docs/data/user-guide-2/` and `dev-docs-2/` ([180/00](../subtasks/180_documentation/00_overview.md) has the outline); every review passed after one blocking fix.
  - The plugins: workflow `agentks-plugins` finished and is merged; the trim runs in `agentks-fixes-1` on the same branch `wave3/plugins`.
  - Library components: workflow `agentks-library-components`, seven worktrees `lib-<batch>` of the library repository (branches `comp/<batch>`), and three more for the video JSON components (`comp/video-*`). Every batch adds entries to `manifest.json`, so merge the manifests entry by entry, then run `scripts/check.py`.
  - The video folder form: workflow `agentks-video-folder-form` finished. Its decisions are 41 to 52 in the video design's index; its tracker edits run in `agentks-tracker-and-video-docs`.
  - The homepage redesign: a separate forked session, not a subagent. It works in worktree `homepage-3` (branch `wave3/homepage-3`, based on `wave2/homepage-2`), messages this session when done, and sends the `190_homepage` tracker lines. Merge it after or in place of `wave2/homepage-2`.
- A workflow's results: read `journal.jsonl` in its transcript folder (one JSON line per event; the `result` lines carry each agent's return value). The workflow's output file is not plain JSON.
