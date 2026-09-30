---
title: T9 Publishing — video pages, standalone pages and audio streams in agentks build
status: open
---

A published site must play videos with the generated voice and no server. This track makes agentks build write video pages, standalone pages, island props, each video's audio stream and the library images it uses.

# 01 To Do
- [ ] **Compile every video** in the build, as the server does.
- [ ] **Audio:** generate missing clips when the helper is installed, join each video's stream, copy it to `_audio/<stream key>.opus`.
- [ ] **Missing voice:** without the helper or cached clips, publish with the browser voice and warn; `--require-voice` turns the warning into an error.
- [ ] **Video pages:** HTML with the transcript, the island's markup and props, the player chunk with a content hash in its name.
- [ ] **Standalone pages** at `artifacts/<path>.video/index.html`, with T7a's shell writer.
- [ ] **Library images** a video uses, copied to `_lib/`.
- [ ] **Stable names** for every copied file, so a CDN can cache them for good.

## Guardrails
- Use T7a's shell writer; no second copy of the page.
- No MP4 or rendered video in the output: only the page, the player chunk, the audio stream and images.
- Write only in `apps/agentks-ssg/` and the engine's build code.

## Done when
- A static build of a project with the example plays it, with the generated voice, from a plain static server with range requests.
- The standalone page in the build matches the server's.
- A build with no helper and no clips publishes with the browser voice and one warning; with `--require-voice` it fails.

# 02 Status and Result
Not started. Waits for T6, T7a, T7b and the migration's Phase 3 ([150/10](../../2026-09-29-rust-core-engine-migration/subtasks/150_publishing/10_agentks-build.md)).

## Result
Nothing yet.

## Agent log
none

# 03 References
- [How it fits the new architecture](../brainstorm/01_video-artifact-engine/09_architecture-fit.md#05-publishing) — the build's five steps.
- [The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md#10-how-a-published-site-gets-the-voice) — shipping each video's stream.
- [Open questions](../notes/01_initial_discussion/09_open-questions.md) — the build without a voice, provisional.
- [150/10 agentks build](../../2026-09-29-rust-core-engine-migration/subtasks/150_publishing/10_agentks-build.md) — the build this track extends.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- A CI deploy caches `~/.agentks/audio/`, `~/.agentks/tools/agentks-voice/` and `~/.agentks/models/`, keyed by the helper version, or it downloads about 130 MB and generates every clip.
