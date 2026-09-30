---
title: "Video pages: layout and player island"
status: open
---

A narrated video page is a markdown file with `video: true` that the browser plays live as scenes, beats and cues, with narration. The format, the player's design, the widgets and the audio belong to [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). This leaf is the migration's side of it: the `video` page layout and the video-player island in `agentks-ui`, fed by scene data Rust computes, so the same player runs in the local client and on a published site.

# 01 To Do
- [ ] **Agree the payload** with [030/80](../030_rust-engine/80_page-data-interface.md) and the video issue: `kind: video` page data carries the intro scene and scenes, each with beats (one per paragraph, with its body HTML and spoken text), visuals, bold focus targets, cues with resolved library elements (`alias:element` → a `/_lib/` URL), the chosen voice and, when generated audio exists, a clip URL and word timings per beat.
- [ ] **Video page layout** (`agentks-ui/src/layouts/pages/video/`): the section frame, the player at the top, and the transcript below it (the page's normal body HTML, so the page reads as a document without JavaScript).
- [ ] **Player island** (`agentks-ui/src/islands/video-player/`): port the player, stage, built-in widgets and motion from the video issue's spike into the chosen UI framework ([080/10](../080_ui-and-client/10_ui-framework-decision.md)). The player only plays: it never parses markdown or resolves names.
- [ ] **Narration.** Generated clips when the payload has them; otherwise the browser's Web Speech voice, with estimated timing. The reader can always switch to the browser voice.
- [ ] **Library elements** in panels load from `/_lib/<alias>/<element>`; script elements run in a sandboxed frame and follow the widget contract ([120/50](../120_libraries/50_lib-route-and-sandbox.md)).
- [ ] **Errors.** Unknown widgets, cue targets, aliases or elements are errors Rust reports with page and line; the player shows the page's error marker, never a silent gap.
- [ ] **Static build.** The player is the only island on a published video page; elements are copied into the output by `agentks build` ([150/10](../150_publishing/10_agentks-build.md)).

## Guardrails
- The cue syntax and the widget set are the video issue's decisions; do not settle them here.
- Audio is never committed to git.
- The player loads only on video pages ([090/40](../090_frontend-performance/40_code-splitting-and-lazy-islands.md)).

## Done when
- A fixture video page from the video issue plays in the local client with the browser voice, showing each scene, visual and cue in order, and its transcript is readable with JavaScript off.
- With generated audio present in the build cache, the player uses the clips and lands cues on the timed words.

# 02 Status and Result
Open. Not started. Starts after the video issue's second spike settles the player and widget contract.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/layouts/pages/video/`, `apps/packages/agentks-ui/src/islands/video-player/`.
- **Read first:** [video pages](../../notes/04_ecosystem/05_video-pages.md) (the migration's summary), the video issue's [video engine](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/04_video-engine.md), [the spike](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/03_the-spike.md), [relation to the engine migration](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/08_relation-to-the-engine-migration.md), [its open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md).
- **Code to port:** the player on branch `spike/narrated-video` of this repository.
- **Depends on:** [080/10](../080_ui-and-client/10_ui-framework-decision.md), [080/50](../080_ui-and-client/50_islands.md), [030/80](../030_rust-engine/80_page-data-interface.md), [120/50](../120_libraries/50_lib-route-and-sandbox.md), the video issue's second spike.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): video is rendered in the browser from source; no MP4 files and no media in git.
- Decided (sidhantha, 2026-09-30): library elements are used only in video and artifact pages; a video names them inside its cues as `alias:element`.
- Decided (claude, 2026-09-30): Rust reads scenes, beats and cues and sends them as data; the frontend only plays ([video pages](../../notes/04_ecosystem/05_video-pages.md)).

# 05 Notes & Analysis
## Watch out
- Built-in widgets (file tree, flow, browser frame, phone frame, chart, code, terminal, diagram) are part of the player, not library elements, and need no `dep.yaml` entry.
