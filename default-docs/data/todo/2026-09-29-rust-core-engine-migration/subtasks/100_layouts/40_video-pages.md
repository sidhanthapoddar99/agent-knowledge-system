---
title: "Video pages: layout and player island"
status: open
---

A video artifact is an `NN_<slug>.video.yaml` file, or a video folder of scene files, that Rust compiles to `VideoData` and a small player plays live in the browser, with a generated voiceover. The format, the player, the voice and the components belong to [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). This leaf is the migration's side of it: the `video` page layout and the video-player island in `agentks-ui`, so the same player runs in the local client, in the standalone page and on a published site. The video issue builds it as [T7b video pages in the app](../../../2026-09-29-narrated-video-pages/subtasks/090_video-pages-in-the-app.md), after [T7a the standalone artifact](../../../2026-09-29-narrated-video-pages/subtasks/080_standalone-artifact.md).

# 01 To Do
- [ ] **The payload** with [030/80](../030_rust-engine/80_page-data-interface.md): `kind: "video"` page data carries `video: VideoData` (the compiled video), `transcript_html` and `audio` (its voice state), with types generated from the engine's JSON Schema like every other page kind.
- [ ] **Video page layout** (`agentks-ui/src/layouts/pages/video/`): title, description, the stage's box at 16:9 so nothing jumps when the player mounts, the transcript with one anchor per beat (readable with JavaScript off), the Rust errors and the player's layout diagnostics.
- [ ] **Player island** (`agentks-ui/src/islands/video-player/`): about 30 lines of Preact that call `mountVideo` and `destroy` from `apps/packages/agentks-video`, loaded on demand. The player only plays: it never parses the YAML or resolves names.
- [ ] **The standalone page** at `/artifacts/<path>.video` comes first, written by the engine's shell writer; this layout and the standalone page run the same player.
- [ ] **Narration.** The video's joined audio stream when it exists; otherwise the browser's Web Speech voice, with estimated timing. The reader can always switch to the browser voice.
- [ ] **Errors.** Unknown names, anchors or components are errors Rust reports with file, line and column; the page shows them, never a silent gap.
- [ ] **Static build.** The player is the only island on a published video page; `agentks build` writes the page, the standalone page and the audio stream ([150/10](../150_publishing/10_agentks-build.md)).

## Guardrails
- The format, the item kinds and the component set are the video issue's decisions; do not settle them here.
- Audio is never committed to git.
- The player loads only on video pages ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).
- The island only wraps the player; no player logic moves into `agentks-ui`.

## Done when
- The video issue's example plays in the local client as a page, with the browser voice, and its transcript is readable with JavaScript off.
- With the joined audio stream present, the player uses it and actions land on the timed words.

# 02 Status and Result
Open. Not started. Starts after the video issue's player spike ([T1](../../../2026-09-29-narrated-video-pages/subtasks/010_player-spike.md)) and its standalone artifact.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/layouts/pages/video/`, `apps/packages/agentks-ui/src/islands/video-player/`; the player in `apps/packages/agentks-video/`.
- **Read first:** [video artifacts](../../notes/04_ecosystem/05_video-pages.md) (the migration's summary), the video issue's [architecture fit](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/09_architecture-fit.md) and [player](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/06_player.md).
- **Depends on:** [080/10](../080_ui-and-client/10_ui-framework-decision.md), [080/50](../080_ui-and-client/50_islands.md), [030/70](../030_rust-engine/70_diagram-and-artifact-sources.md), [030/80](../030_rust-engine/80_page-data-interface.md), the video issue's [T1 player spike](../../../2026-09-29-narrated-video-pages/subtasks/010_player-spike.md) and [T7a standalone artifact](../../../2026-09-29-narrated-video-pages/subtasks/080_standalone-artifact.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): video is rendered in the browser from source; no MP4 files and no media in git.
- Decided (sidhantha, 2026-09-30): library elements are used only in video artifacts and artifact pages; a video names them in typed fields of its YAML file as `alias:name`.
- Decided (claude, 2026-10-01): Rust compiles the video file and sends `VideoData`; the frontend only plays ([video artifacts](../../notes/04_ecosystem/05_video-pages.md)).
- Decided (claude, 2026-10-01): the video issue's T7b builds this leaf, because one track should own the layout and the island; this leaf stays in the layouts group so the group lists every page kind.

# 05 Notes & Analysis
## Watch out
- The player is its own package, `apps/packages/agentks-video`, not part of `agentks-ui`, because the standalone page loads it with nothing else.
