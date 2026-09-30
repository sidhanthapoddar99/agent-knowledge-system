---
title: "Open questions"
---

The questions for the video work, and the answers so far. Two stay open until sidhantha hears the voice spike: the default voice, and how the voice says "agentks". Five more are decided provisionally with the design's recommendation, until sidhantha confirms them. Each answered question becomes a decision line here.

# 03 References

- [Index](./01_index.md)
- [The design's questions for sidhantha](../../brainstorm/01_video-artifact-engine/01_index.md#questions-for-sidhantha)
- [The voiceover](../../brainstorm/01_video-artifact-engine/07_voiceover.md) — the model, pronunciation, licences, publishing.
- [T2 Voice spike](../../subtasks/020_voice-spike.md) — where sidhantha listens to the voices.
- [Libraries, dep.yaml and dep.lock](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md) — where libraries come from and how they are pinned and trusted.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the reusable library is not video-only. It is shared engine machinery, tracked in [libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md), and its open points moved there.
- Decided (sidhantha, 2026-09-30): libraries are git repositories or local folders listed in `config/dep.yaml`, so hosting needs no release pipeline, and the project's own elements live wherever `dep.yaml` points.
- Decided (claude, 2026-10-01): asked whether to build a second spike (grid, cues, first widgets) on the current engine. Instead there are two spikes in the new main repository, the player spike and the voice spike, because the look and the voice are the two things that can fail cheaply, and nothing is built in today's engine.
- Decided (claude, 2026-10-01): asked which voice model to use. Kokoro-82M v1.0, the timestamped 8-bit export, with misaki-rs built without `espeak`, because it is the best-sounding model at its size, gives word times and keeps GPL code out. It stands pending sidhantha's listening test in [the voice spike](../../subtasks/020_voice-spike.md).
- Decided (claude, 2026-10-01): asked what the cue syntax should be. There are no cues: actions sit in the video's YAML beside the narration they belong to, because the video is no longer markdown and a YAML field can be checked by a schema.
- Decided (claude, 2026-10-01): asked whether the widgets use a UI framework. The player is framework-free TypeScript using only the Web Animations API, because WAAPI is native, seeks exactly and adds no weight; the video island in the shared UI package wraps it.
- Decided (claude, 2026-10-01), provisional until sidhantha confirms: asked whether English-only narration is acceptable for version 1. Yes, because other languages need another pronunciation step, and the common one, espeak-ng, is GPL-3.0.
- Decided (claude, 2026-10-01), provisional until sidhantha confirms: asked whether the voice helper stays free of GPL code or ships espeak-ng for unknown words. It stays GPL-free and relies on the pronunciation list, because shipping espeak-ng would make agentks distribute GPL code. Revisit if the voice spike finds more than about one unknown word per minute of typical technical narration.
- Decided (claude, 2026-10-01), provisional until sidhantha confirms: asked whether the voice is generated automatically when a video is opened. Yes, when the helper is installed, with `agentks video voice` for CI, because the first run costs under a minute of CPU for a 3-minute video and an edit costs a second or two.
- Decided (claude, 2026-10-01), provisional until sidhantha confirms: asked whether `agentks build` fails or publishes with the browser voice when the helper or cached clips are missing. It publishes with the browser voice and warns, with a `--require-voice` flag that turns the warning into an error for CI, because a missing voice should not block a docs deploy, while a CI that promises the voice can still enforce it.
- Decided (claude, 2026-10-01), provisional until sidhantha confirms: asked whether one scene may speak with its own voice. No: one voice per video, set in the header (the controller in a folder video), because a consistent voice is part of what makes narration sound good. A scene-level `voice:` would fit the voice pipeline unchanged, so it can be added later without a format change.

# 05 Notes & Analysis

## 01 Which voice should be the default?

Open until sidhantha hears the voice spike. Recommended: `af_heart` (US English, female), Kokoro's best-rated voice, with `am_michael` and `bf_emma` offered. A project can set its own default in `config/video.yaml`.

## 02 How should the voice say "agentks"?

Open until sidhantha hears the voice spike. The starter template's pronunciation list needs one answer. Recommended: "agent K S", spoken as three parts. The alternative is "agent-ks" as one word, which sounds like "agentics".
