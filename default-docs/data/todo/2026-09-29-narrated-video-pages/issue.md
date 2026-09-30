---
title: "Video artifacts"
---

# Goal

Let an agent explain the system the way a good video does: pictures that move with a voice that explains them. A video is **an independent artifact**, one `NN_<slug>.video.yaml` file of slides, narration and one-line actions. It is about 7 KB for three minutes, and the check warns past 10 KB. The file composes library components (frames, icons, charts, layouts, presets, slide templates) instead of building them itself. It is **played live in the browser** by a small player, with a generated voiceover. No rendered video file of any kind is made, cached or stored, and no media is committed to git.

## Context

- **Where this came from.** A discussion on 2026-09-29 about adding Remotion to agentks so architecture could be explained by video. Research showed Remotion is a poor fit (licence, React build, headless Chrome and FFmpeg to render). A lighter design was built and tested instead. See [the research note](./notes/01_initial_discussion/02_research-remotion-and-alternatives.md).
- **A first spike exists on branch `spike/narrated-video`**, commit `8874d1f` on top of `main`. It played a markdown page as a narrated video with the browser's voice. That markdown format is retired; the spike's narrator carries over as the browser-voice fallback. See [the spike](./notes/01_initial_discussion/03_the-spike.md).
- **The direction.** On 2026-09-30 sidhantha asked for videos as independent artifacts rather than markdown ([comment 001](./comments/001_2026-09-30_video-artifacts-direction.md)), lean and library-driven, with a grid and quadrant system, PowerPoint-level motion, a good voiceover and a strong authoring skill ([comment 002](./comments/002_2026-09-30_lean-library-driven-video.md)).
- **The design** is [the video artifact engine](./brainstorm/01_video-artifact-engine/01_index.md): the format, the layout system, the player, the voiceover, the library components, how it fits the new architecture, the authoring skill and the build tracks. Its open questions for sidhantha are recorded in [open questions](./notes/01_initial_discussion/09_open-questions.md).
- **Relation to the engine migration.** Everything is built in the new repositories, nothing in today's Astro engine. The player is its own package, `apps/packages/agentks-video`; the compiler is a Rust crate in the engine; the voice runs in a separate helper, `agentks-voice`. Libraries are shared engine machinery, declared in `config/dep.yaml` and tracked in the migration's [library system note](../2026-09-29-rust-core-engine-migration/notes/04_ecosystem/01_library-system.md); this issue owns only the video side. See [2026-09-29-rust-core-engine-migration](../2026-09-29-rust-core-engine-migration/issue.md) and [the relation note](./notes/01_initial_discussion/08_relation-to-the-engine-migration.md).
- **The build** runs in four waves, in [the build plan](./plans/01_video-build/overview.md).

## Done when

The design is settled when:

- the questions in [open questions](./notes/01_initial_discussion/09_open-questions.md) are decided by sidhantha or parked with a reason;
- the player spike and the voice spike are judged good enough to build on.

The issue is done when every stage of [the build plan](./plans/01_video-build/overview.md) has met its outcome: an agent writes a video with the `agentks-video` skill, it plays in the standalone page, in the app and on a published site with the generated voice, and the tests pass.

## Scope decisions

- **In:** the video artifact format and its schema; the standalone player page; the player; the layout system and its diagnostics; the item kinds; PowerPoint-level motion; the voice helper, the pronunciation list and the audio store; the video component categories; the authoring skill.
- **Out:** MP4 or any other rendered video file, cached or stored; storing media in git; film-level motion (free keyframing, character animation, 3D); a markdown embed in the first version (it comes later); packaging libraries inside the agentks binary; the library machinery itself (`dep.yaml`, pinning, the cache, manifests), which the migration issue owns.

Related: [2026-09-29-rust-core-engine-migration](../2026-09-29-rust-core-engine-migration/issue.md) · [2026-04-10-editor-diagrams](../2026-04-10-editor-diagrams/issue.md)
