---
title: T7b Video pages in the app — the video page kind, its layout and the player island
status: open
---

Inside the app, a video should appear like any other page, with its transcript readable and searchable. This track adds the video page kind to the site index, the transcript, the page layout and the island that wraps the player.

# 01 To Do
- [ ] **The `video` page kind** in the site index: `NN_*.video.yaml`, or an `NN_` folder whose `settings.json` says `"kind": "video"`, in a docs section or a tracker's `notes/` or `brainstorm/`, is a page of kind `video`. A video folder is one page, never a sidebar group; the index does not descend into it; its label is the controller's `title`. The slug drops the prefix, and `.video.yaml` for a file.
- [ ] **The page data:** `kind: "video"` with `video: VideoData`, `transcript_html`, `audio` state and `errors`, its types generated like every other page kind.
- [ ] **The transcript:** the narration as HTML grouped by slide heading, one anchor per beat, readable with JavaScript off and indexed by site search.
- [ ] **The layout** in `apps/packages/agentks-ui/src/layouts/pages/video/`: title, description, the stage's box at 16:9 so nothing jumps, the transcript, the errors and the player's diagnostics.
- [ ] **The island** in `apps/packages/agentks-ui/src/islands/video-player/`: about 30 lines of Preact that call `mountVideo` and `destroy`, loaded on demand.
- [ ] **Transcript sync:** the current beat is highlighted; clicking a beat seeks there.

## Guardrails
- The island only wraps the player. No player logic moves into `agentks-ui`.
- The layout consumes only the theme contract's variables and the semantic type tokens.
- The frontend holds no rules: every value comes from Rust's page data.
- Write only in the engine crates' page-kind code and the two `agentks-ui` folders above.

## Done when
- The example appears in the app's sidebar as a page, plays in place, and its transcript highlights and seeks.
- A new hash after an edit refreshes the page with no reload.
- The transcript is found by site search.

# 02 Status and Result
Not started. Waits for T7a, page kinds ([030/70](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/70_diagram-and-artifact-sources.md)), the site index ([030/40](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/40_site-index.md)) and islands ([080/50](../../2026-09-29-rust-core-engine-migration/subtasks/080_ui-and-client/50_islands.md)).

## Result
Nothing yet.

## Agent log
none

# 03 References
- [How it fits the new architecture](../brainstorm/01_video-artifact-engine/09_architecture-fit.md) — the detect step, the page data, the UI side.
- [The player](../brainstorm/01_video-artifact-engine/06_player.md) — `mountVideo`, controls and captions, how a page loads it.
- [080 T7a Standalone artifact](./080_standalone-artifact.md) — comes first.
- [030/70 Diagram, artifact and video sources](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/70_diagram-and-artifact-sources.md), [080/50 Islands](../../2026-09-29-rust-core-engine-migration/subtasks/080_ui-and-client/50_islands.md) and [100/40 Video pages](../../2026-09-29-rust-core-engine-migration/subtasks/100_layouts/40_video-pages.md) — the migration's side.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- The markdown embed, `[[./x.video.yaml]]` or `[[./x/]]`, waits for a later version; do not build it here.
