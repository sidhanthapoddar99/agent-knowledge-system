---
title: "Video pages and narration audio"
---

The migration does **not** make video playback faster, because the player runs in the browser either way. It helps with **audio**: the binary can offer a local text-to-speech voice as an optional download, generate narration per paragraph, and keep it in the build cache. The audio is embedded in the build output when needed and never committed to git.

# 03 References

- The video player spike on branch `spike/narrated-video`: a `video: true` markdown page plays as a narrated video in the browser, using the browser's built-in voice. The demo is the Architecture Tour page in dev-docs, under Architecture, on that branch only; link it here once the branch is merged.
- [The ~/.agentks build cache](./07_agentks-home-and-build-cache.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): generated narration audio may live in the local build cache and be embedded in a build, as long as it is not uploaded to GitHub.
- Decided (sidhantha, 2026-09-29): video stays rendered in the browser from source. No MP4 files.

# 05 Notes & Analysis

## 01 What the user asked for

- Would the migration improve the video feature?
- Ship a good audio engine with agentks.
- Cache audio in the build cache, and embed it in the build if required.

## 02 Clarification: text-to-speech, not a transcriber

Narration needs **text-to-speech** (text in, voice out), for example Kokoro run through ONNX (a standard format for running AI models locally). A **transcriber** (speech-to-text, like whisper) is only needed for recorded voice, or to get exact word timings from audio.

## 03 Why pre-generated audio helps

- The browser's built-in voices vary a lot. Chrome and Edge sound decent, while Firefox on Linux uses espeak-ng and sounds robotic.
- Generated audio has known durations and word timings, so animations can land on the exact spoken word.

## 04 Costs to plan for

- The voice model is a download of tens to hundreds of MB. It should be optional, not part of the base binary.
- A site deployed from CI needs the audio in its build output, so CI must download the model and generate the audio there.

## 05 The player survives the migration

The video player is browser TypeScript. It moves into the Vite frontend unchanged. Video work does not need to wait for this migration.

## 06 Richer visuals discussed

The user wants 5–10x richer visuals than the spike: multi-panel grid layouts, a file tree, a markdown-to-HTML transform view, a server and browser flow with icons, a browser frame, a phone frame running an HTML artifact, and charts. The proposed design is a fixed library of widgets built once in the engine, plus per-paragraph cues, keeping each video at about 3,000–5,000 tokens. That design belongs to the video work, not this migration.
