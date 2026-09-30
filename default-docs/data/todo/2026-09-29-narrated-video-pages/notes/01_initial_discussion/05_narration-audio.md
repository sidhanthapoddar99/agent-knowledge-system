---
title: "Narration audio"
---

Narration has two voices. The good one is a **generated voice**: Kokoro-82M, run on the author's machine by a separate helper program, `agentks-voice`, downloaded on request. It sounds the same everywhere and gives the time of every word, so actions can land on the spoken word. The fallback is the **browser's built-in voice**, used whenever clips are missing. The voice only needs to be plain and clear. The full design is [the voiceover](../../brainstorm/01_video-artifact-engine/07_voiceover.md).

# 03 References

- [The voiceover](../../brainstorm/01_video-artifact-engine/07_voiceover.md) — the full design.
- [Caching](./06_caching.md) — where generated audio lives.
- [The engine migration's audio note](../../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/14_video-and-narration-audio.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): narration is simple; no tones or expressive voices needed.
- Decided (sidhantha, 2026-09-29): a better audio model is wanted.
- Decided (sidhantha, 2026-09-29): generated audio may be cached locally and embedded in a build, as long as it is never uploaded to GitHub.

# 05 Notes & Analysis

## 01 The browser voice, the fallback

- Chrome has Google's online voices, which sound decent. Edge has Microsoft's "Natural" voices, the best free option.
- Firefox on Linux uses espeak-ng through speech-dispatcher, which sounds robotic.
- With no voice at all, the player shows captions at speaking pace and says so. The spike's narrator carries over for this voice.
- Durations are unknown in advance, so the clock uses the compiler's estimate and waits when speech runs long.

## 02 The generated voice

- **Text-to-speech, not a transcriber.** The job is text in, voice out. A transcriber (speech to text, like whisper) matters only for recorded voice.
- **Model:** Kokoro-82M v1.0, the timestamped export, 8-bit (92 MB, Apache 2.0). The English pronunciation step is misaki-rs (MIT), built without its `espeak` feature, because that feature compiles espeak-ng, which is GPL-3.0. Version 1 narrates in English only.
- **The helper, `agentks-voice`**, runs the model with `ort` in its own process. `agentks voice install` downloads it with the model, never the installer, so the main binary stays lean.
- **Unknown words are an error**, `video-unknown-word`. Without espeak-ng, a word the voice does not know would be spelled letter by letter. The fix is a pronunciation list: `pronounce:` in `config/video.yaml` for the project, and the video's own `pronounce:` for one-off words. Words in capitals, such as CLI, are spelled on purpose and never flagged.
- **One clip per beat**, Ogg Opus, mono, 24 kHz, 24 kbit/s, with its word timings beside it. Rewording one beat regenerates one clip.
- **One joined stream per video.** The engine joins the beat clips by copying their packets, with no re-encoding, and fills pauses with silent packets. The stream runs as long as the video: about 180 KB a minute.

## 03 Choosing the voice per video

The video's `voice` key wins; without it, the project default in `config/video.yaml` applies; without that, the browser voice. The reader can still switch to the browser voice.

## 04 Publishing

A published site ships each video's joined stream under `_audio/`. `agentks build` generates missing clips when the helper is installed. In-browser synthesis is rejected: it needs an 86 MB model per reader.
