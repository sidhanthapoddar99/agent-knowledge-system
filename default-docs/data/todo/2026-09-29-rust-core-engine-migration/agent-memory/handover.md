---
title: "Handover — where the build stands, and what comes next"
---

Read this first when the build resumes. It was written on 2026-10-01, before a break of four or five days. Correct it in place as things change.

## Where it stands

- **Main repository** (`NeuraLabsHQ/agent-knowledge-system`, local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`): `main` is at `3328cb7`, pushed, and CI is green.
    - Waves 1 to 3 are merged: contracts, site, sync, embed-dev, the three layout tracks (tracker, pages, artifacts `f108e19`), the editor (`1e355ed`) and client-perf (`a0097c4`).
    - The fix branches are merged: library categories (`9d2aeec`), the plugin trim (`3923eaa`), the voice spike fix (`8fdf75b`) and video T5 (`96b747b`).
    - Two merge fixes followed: a duplicate React key on the homepage (`85ff6c5`), and focus after a redirect (`0e10404`).
    - `3328cb7` builds the client without source maps, which took the release binary from 78.0 to 42.2 MB.
    - Every worktree is removed, the homepage's included.
- **Library repository** (`agent-knowledge-system-library`): `main` is at `0d585ed`, pushed. It has 2,106 elements, with the video components and the polish merged.
- **Marketplace repository**: `main` is at `5c1b48d`, the empty catalogues and the brief. Nothing else has started there.
- **Nothing is running.** No agent and no workflow. On 2026-10-01 the owner asked to start none because usage was near its limit, so ask before starting one.
- **The tracker:** 50 subtask files of this issue are in `review` and wait for the owner's sign-off. The video issue has 5.

## The numbers

All in [comment 005](../comments/005_2026-10-01_performance-metrics.md), measured on a copy of this repository's data (1,512 pages).

- **Binary:** 42.2 MB release, 37.3 MB stripped, 16.7 MB with xz. The client is 51.5% of it, Rust 36.8%, symbols 11.7%.
- **Speed, release build:** start-up in 0.4 s at 39 MB of RAM. A page renders in 0.85 ms p50 and 12 ms p95 the first time. After that it answers in 0.05 ms, from memory or from the disk cache. All 1,512 pages take 1.33 s cold and 0.10 s from the disk cache.
- **Memory:** 300 MB after rendering every page cold, against a 150 MB target; 58 MB after a restart that reads the disk cache.
- **Video:** the eight preview reels are 13 to 44 KB each, 196.5 KB raw and 39.5 KB gzipped in total. The player is about 20 KB gzipped. There is no audio file: narration is captions or the browser voice.

## See it running

The three servers stop at a reboot. Start each again from its repository.

| What | Start | Open |
|---|---|---|
| The engine, on a copy of this repository's docs, tracker and blog | once: `data/bench/make-demo.sh`; then `env -u AGENTKS_CONFIG_FOLDER AGENTKS_HOME=/tmp/agentks-demo-home apps/agentks-engine/target/release/agentks start --config-dir /tmp/agentks-demo/config --port 5180 --detach` | http://localhost:5180 |
| The homepage | `./ctl dev homepage --detach` | http://localhost:3000 |
| The library's video preview | build the player (`bun run build` in the main repository's `apps/packages/agentks-video`), then in the library: `python3 scripts/preview_player.py` and `python3 -m http.server 8123 --bind 127.0.0.1` | http://127.0.0.1:8123/preview/video/ |

The benchmark kit is in the main repository's `data/bench/`. Its `README.md` says how to rerun every measurement. Git ignores `data/`, so the kit exists on this machine only.

## What the owner has to do

- **Try it and compare.** Use the demo engine on the docs, the tracker and the editor. For a like-for-like comparison, run today's engine (`./start` in this repository) on the same machine; [170/40](../subtasks/170_testing/40_performance-budget.md) wants that measurement too.
- **Sign off** the subtasks in `review`, or send them back.
- **Decide.** Each has a recommendation, so a yes or no is enough:
    - Widget size cap: one widget is 5 bytes under 15 KB. Recommendation: count the shared blocks, and raise the cap to 20 KB.
    - Element names: the Rust crate and the library's `check.py` disagree. Recommendation: the library's rule, which allows a leading digit and forbids a double hyphen. The crate then matches it.
    - Lucide icon tags: recommendation: drop brand names such as "macos" from the search tags.
    - Excalidraw's 54 language files (1.1 MB): recommendation: English only ([080/80](../subtasks/080_ui-and-client/80_binary-size.md)).
    - Still open from before, and nothing waits on them yet: the default voice, how "agentks" is pronounced, the misaki licence, voices per scene, whether videos ship in 1.0.0, and whether a breaking release moves x or y.
- **Housekeeping in the main repository:** `next dev` writes `apps/agentks-homepage/AGENTS.md` and `CLAUDE.md` on every run. They are untracked; commit them or ignore them. The folder `/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/ui-client` is 28 KB of Vite cache left from a removed worktree, and can be deleted.

## What is left

The order is the [plan's](../plans/01_engine-migration/overview.md). The next build work:

1. The server's open, save and `/_lib/` routes: [050/35](../subtasks/050_server/35_file-writes-and-echo-suppression.md) and 120/50.
2. The CLI ports: 070/20, 30, 60 and 80, and 120/40, which can now use the library crate's `Category` API.
3. The video compiler (T3) and the chart templates, in [the video issue](../../2026-09-29-narrated-video-pages/issue.md).
4. `agentks init`, which waits on the library's templates.

Found on 2026-10-01, each with its own subtask:

- [080/80 Shrink the release binary](../subtasks/080_ui-and-client/80_binary-size.md): strip symbols, drop the raw client copies, keep the gzip copies.
- [040/97 Dev builds never keep rendered pages on disk](../subtasks/040_caching/97_dev-build-disk-cache.md): `ctl build` does not set `AGENTKS_DEV_COMMIT`, although the code says it does.
- [Video 130 style picker and views](../../2026-09-29-narrated-video-pages/subtasks/130_style-picker-and-views.md): in edit mode a style saves into the video's file; readers get the play and sheet views.
- The 300 MB memory is [030/90](../subtasks/030_rust-engine/90_memory-and-concurrency.md)'s, which already names the cause: the code highlighter's compiled grammars.

Held follow-ups, none started:

- T5 annotations: the line draw breaks when `vector-effect="non-scaling-stroke"` meets `pathLength="1"` on a scaled SVG; the dash array should be `1 2`; dashes restart at every subpath, so draw paths one after another; and the fit geometry. The working reference is `data/library-scratch/annot-work/sheet.py` (`viewportLength`, `box`, `place`). Also replace the spike's fixture frames with the library's frames. The polish's line-draw notes are in the 08 design note.
- Check that the animation presets' overlays name the marks that shipped (`scribble-circle`, `tick-mark`, `cross-mark`, `star-mark` and the rest).
- The Rust SVG allowlist must admit what the shipped SVGs use: `pathLength`, gradient and pattern units, `stop-*`, `clip-path="url(#…)"`, the text attributes, the opacity and dash attributes, inner `transform`, `width` and `height`. The polish's list is in the 08 design note.
- Voice: record the 16-bit model decision in 020, and switch `MODEL_FILE` and `fetch-model.sh` to `model_fp16.onnx`. The file is in `data/voice-spike/bench/`, for its checksum.
- Homepage: replace the CSS video illustration with the real player, behind a play button.
- Decide in 120/50: should `/_lib/` serve an SVG with its `--vx-*` roles resolved, so a plain `<img>` works in an artifact?
- Rename the player's diagnostic codes `layout.text-fit`, `layout.overflow` and `layout.overlap` to kebab-case (video design decision 53), and the one dotted code left in `08_library-components.md`.
- The tracker edits the 2026-10-01 tracker pass skipped are in `data/library-scratch/tracker-and-video-docs.json`, under each agent's `skipped_edits`. Apply each once its leaf's builder is done.
- Not verified yet: the theme toggle, sidebar and outline are not wrapped as islands, so a static page does not make them interactive; nobody has stepped through every slide of the video preview with the new player; Safari is untested everywhere.

## Traps when running the demo

- The shell exports `AGENTKS_CONFIG_FOLDER` for this repository, and it wins over the current folder. Run the engine with `env -u AGENTKS_CONFIG_FOLDER` and `--config-dir`, or it serves this repository instead of the demo.
- `ctl build engine` fails with "Text file busy" while an engine runs from the binary it replaces. Stop the demo engine first.
- A dev build renders every page again after a restart ([040/97](../subtasks/040_caching/97_dev-build-disk-cache.md)). Compare restart numbers on release builds only.
- `ls` on this machine is colorls, and its output breaks `awk` and `stat` parsing. Measure sizes with `stat -c %s`.
- A Vite dev server left over from a removed worktree can hold port 5173. Find it with `ss -ltnp` and stop it.
