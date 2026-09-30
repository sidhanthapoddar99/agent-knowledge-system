---
title: "Initial discussion — index"
---

The 2026-09-29 discussion of narrated video, one note per point, corrected to the video artifact design of 2026-10-01. Lines marked **Decided (sidhantha, …)** are the user's decisions; lines marked **Decided (claude, …)** are claude's, which sidhantha can overturn. The full design is [the video artifact engine](../../brainstorm/01_video-artifact-engine/01_index.md); it graduates to its own notes group once sidhantha agrees it after the two spikes.

# 03 References

- [issue.md](../../issue.md)
- [The video artifact engine](../../brainstorm/01_video-artifact-engine/01_index.md)
- [The build plan](../../plans/01_video-build/overview.md)

# 04 Decisions

The headline ones; each note holds its own.

- Decided (sidhantha, 2026-09-29): videos are rendered live in the browser from source. No MP4.
- Decided (sidhantha, 2026-09-29): narration can be simple and plain; no expressive voice needed.
- Decided (sidhantha, 2026-09-29): authoring must take few tokens, like artifacts but better.
- Decided (sidhantha, 2026-09-29): the target is 5–10x richer visuals than the spike, looking good, while staying lightweight and rendered in the frontend.
- Decided (sidhantha, 2026-09-29): a proper video engine, a better audio model, and caching.
- Decided (sidhantha, 2026-09-29): libraries are downloadable and cached, never packaged with the engine.
- Decided (sidhantha, 2026-09-29): users can define reusable elements in their project configuration.
- Decided (sidhantha, 2026-09-29): the library is shared engine machinery, not video-only, and is tracked in the migration issue.

# 05 Notes & Analysis

## 01 The notes

| Note | What it covers |
|---|---|
| [01/02 Research: Remotion and alternatives](./02_research-remotion-and-alternatives.md) | Remotion's licence and rendering, file sizes, HyperFrames and others, why none is used |
| [01/03 The spike](./03_the-spike.md) | What exists on branch `spike/narrated-video`: the retired markdown format, the narrator that carries over, what was verified |
| [01/04 A proper video engine](./04_video-engine.md) | The user's requirements for richer visuals, and how the design answers each example |
| [01/05 Narration audio](./05_narration-audio.md) | Kokoro through the `agentks-voice` helper, the pronunciation list, clips and one stream per video, the browser voice as fallback |
| [01/06 Caching](./06_caching.md) | The machine-wide audio store, the helper, the model and libraries under `~/.agentks` |
| [01/07 Libraries and reusable elements](./07_libraries-and-reusable-elements.md) | What the player owns and what libraries own; typed `alias:name` fields |
| [01/08 Relation to the engine migration](./08_relation-to-the-engine-migration.md) | What lives in the player, the compiler and the helper; what can start now |
| [01/09 Open questions](./09_open-questions.md) | The questions for sidhantha: two open until the voice spike, four decided provisionally |
