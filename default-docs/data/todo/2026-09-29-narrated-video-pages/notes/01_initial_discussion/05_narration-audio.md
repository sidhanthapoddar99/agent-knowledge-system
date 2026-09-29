---
title: "Narration audio"
---

Narration starts with the **browser's built-in voice** (no files, no setup) and grows into a **generated voice**: a local text-to-speech model that agentks downloads on request, renders narration per paragraph, and keeps in the cache. Generated audio sounds the same everywhere and comes with word timings, so animations can land on the spoken word. The voice only needs to be plain and clear.

# 03 References

- [Caching](./06_caching.md) — where generated audio lives.
- [The engine migration's audio note](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/14_video-and-narration-audio.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): narration is simple; no tones or expressive voices needed.
- Decided (sidhantha, 2026-09-29): a better audio model is wanted.
- Decided (sidhantha, 2026-09-29): generated audio may be cached locally and embedded in a build, as long as it is never uploaded to GitHub.

# 05 Notes & Analysis

## 01 The browser voice (today)

- Chrome has Google's online voices, which sound decent. Edge has Microsoft's "Natural" voices, the best free option.
- Firefox on Linux uses espeak-ng through speech-dispatcher, which sounds robotic.
- With no voice at all, the spike plays captions at speaking pace and says so.
- Durations are unknown in advance, so the clock is an estimate.

## 02 A generated voice (claude, proposed)

- **Text-to-speech, not a transcriber.** The job is text in, voice out. A transcriber (speech to text, like whisper) matters only for recorded voice, or to extract word timings from audio.
- **Model:** Kokoro (Apache 2.0) run through ONNX, a standard format for running models locally. It is an optional download of tens to hundreds of MB, never part of the base binary.
- **One clip per paragraph.** A clip's length sets its beat's length. Rewording one paragraph regenerates one clip.
- **Word timings** come from the model or from aligning the clip, and drive word-level cues.
- **Compressed as Opus** at about 48 kbps: roughly 0.35 MB per minute.

## 03 Choosing the voice per page

A page could name its voice in frontmatter; without one, the project default applies; without that, the browser voice. The reader can still switch to the browser voice.

## 04 Publishing

A published site needs the audio in its build output. A site built in CI must download the model and generate audio there, or publish without generated audio and fall back to the browser voice.
