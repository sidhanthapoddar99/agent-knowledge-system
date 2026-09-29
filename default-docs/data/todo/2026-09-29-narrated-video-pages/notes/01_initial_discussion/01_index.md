---
title: "Initial discussion — index"
---

The 2026-09-29 discussion of narrated video pages, one note per point. Lines marked **Decided** are the user's decisions. Anything marked as proposed by claude is not agreed yet.

# 03 References

- [issue.md](../../issue.md)

# 04 Decisions

The headline ones; each note holds its own.

- Decided (sidhantha, 2026-09-29): videos are rendered live in the browser from source. No MP4.
- Decided (sidhantha, 2026-09-29): narration can be simple and plain; no expressive voice needed.
- Decided (sidhantha, 2026-09-29): authoring must take few tokens, like artifacts but better.
- Decided (sidhantha, 2026-09-29): the target is 5–10x richer visuals than the spike, looking good, while staying lightweight and rendered in the frontend.
- Decided (sidhantha, 2026-09-29): a proper video engine, a better audio model, and caching.
- Decided (sidhantha, 2026-09-29): preset libraries are downloadable and cached, never packaged with the engine.
- Decided (sidhantha, 2026-09-29): users can define reusable elements in their project configuration.
- Decided (sidhantha, 2026-09-29): the library is shared engine machinery, not video-only, and is tracked in the migration issue.

# 05 Notes & Analysis

## 01 The notes

| Note | What it covers |
|---|---|
| [01/02 Research: Remotion and alternatives](./02_research-remotion-and-alternatives.md) | Remotion's licence and rendering, file sizes, HyperFrames and others, why none is used |
| [01/03 The spike](./03_the-spike.md) | What exists on branch `spike/narrated-video`: format, player, files, what was verified |
| [01/04 A proper video engine](./04_video-engine.md) | Grid scenes, widgets, cues, artifacts as panels, motion style, morphing, token cost |
| [01/05 Narration audio](./05_narration-audio.md) | Browser voice now, a generated voice later, word timings |
| [01/06 Caching](./06_caching.md) | Generated audio and downloaded libraries under `~/.agentks` |
| [01/07 Libraries and reusable elements](./07_libraries-and-reusable-elements.md) | What video adds to the shared artifact library: widgets, scene templates, custom video logic |
| [01/08 Relation to the engine migration](./08_relation-to-the-engine-migration.md) | What lives in the frontend, what in Rust, what can start now |
| [01/09 Open questions](./09_open-questions.md) | What to settle next |
