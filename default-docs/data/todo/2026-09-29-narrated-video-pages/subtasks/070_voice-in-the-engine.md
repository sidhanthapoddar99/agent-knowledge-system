---
title: T6 Voice in the engine — the helper lifecycle, the audio store, the joined stream and word sync
status: open
---

The voice spike proves Kokoro can speak the example. This track makes it part of agentks: installing the helper, generating clips in the background, storing them machine-wide, joining one stream per video, serving it, and timing the video from real clips.

# 01 To Do
- [ ] **`agentks voice install` · `status` · `remove`.** Install shows the size and asks, then fetches the helper for this `agentks` version, the model at a pinned revision and the chosen voices into `~/.agentks/tools/agentks-voice/<version>/` and `~/.agentks/models/kokoro-82m-v1.0-timestamped-q8/`. Every file's SHA-256 is built into `agentks`.
- [ ] **The helper's lifecycle:** one long-lived child process per server or command, started on the first request, JSON lines over standard input and output, a queue that generates first-slide-first.
- [ ] **The audio store** `~/.agentks/audio/`: clips and word timings keyed by BLAKE3 of the text, the applying pronunciation entries, the voice, the model id and the helper version.
- [ ] **The stream join** in `crates/video`: copy each clip's Opus packets into one Ogg Opus stream, fill pauses with silent packets, key it by the beat keys and start times. No re-encoding.
- [ ] **`/_audio/<key>.opus`** on the server, only `<64 hex>.opus` names, with range requests.
- [ ] **Background generation and push:** opening a video queues its missing clips; when the last lands, the stream is joined and the page's new hash is pushed.
- [ ] **Timelines from real clips** replace the estimate once every beat has a clip.
- [ ] **The unknown-word check** through the helper's `g2p` request: `video-unknown-word` in `agentks check video`, and the helper refuses to speak a beat with an unknown word.
- [ ] **`agentks video voice <video>` · `--all`** with progress and total size.
- [ ] **In the player:** `clock.ts` and `audio.ts` play the stream, keep animations in step (re-seek past 40 ms drift) and time captions by word from the real clips. `setVoice('generated')` switches to the stream; today it reports an error.
- [ ] **The browser voice's hold-for-speech path**, where the clock waits when speech runs past the estimate. T1 wrote it but never ran it live, because the only voice it had was faster than the estimate. Run it with a slow voice or a lowered rate.
- [ ] **Safari on macOS and iOS**, on a Mac and an iPhone, because T1 and T2 ran on Linux, where Safari cannot run. Check that the joined Ogg Opus stream plays and seeks within 50 ms, and recheck the player's `glow` preset (`var()` inside filter keyframes) and the CSS `round()`/`mod()` counter for decimal stats. If Safari cannot play the stream, it gets one clip per beat.
- [ ] **Speed on sidhantha's laptop and on a CI runner.** T2 measured speed only on an i9-13900K desktop.
- [ ] **Third-party notices** ship with the released helper: ONNX Runtime's bundled notices (including Eigen, MPL-2.0), libopus (BSD), Kokoro (Apache-2.0) and the misaki dictionary data.

## Guardrails
- The helper stays outside the engine's workspace build, so the engine's gate never compiles ONNX Runtime.
- The main binary gains no audio codec: joining is packet copying in pure Rust.
- Audio is never committed and never lives in a project's build cache.
- No GPL code in the chain: misaki-rs without its `espeak` feature.
- A word the voice cannot say is an error, never a spelled-out guess.
- If T2 found that a browser cannot play the joined stream, delivery for that case uses one clip per beat, as the voiceover design says.
- Tests for this track run in under 10 seconds and do not need the model.

## Done when
- On a machine with the helper installed, opening the example generates its clips in the background, and the page switches to the generated voice when they land.
- The joined stream plays and seeks to within 50 ms in the browsers T2 cleared.
- `agentks check video` reports every unknown word, and a pronunciation entry fixes it.
- `voice status` reports what is installed and the store's size; `voice remove` removes it.

# 02 Status and Result
Not started. T2 is built and was merged on 2026-10-01. Waits for T3 and the server ([050/10](../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md)).

## Result
Nothing yet.

## Agent log
none

# 03 References
- [The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md) — the helper, clips, the stream, the store, when audio is generated.
- [How it fits the new architecture](../brainstorm/01_video-artifact-engine/09_architecture-fit.md) — audio, the server routes, the CLI.
- [The player](../brainstorm/01_video-artifact-engine/06_player.md#05-the-clock) — the clock.
- [020 T2 Voice spike](./020_voice-spike.md) — the first helper and its measurements.
- [040 T3 Format and compiler](./040_format-and-compiler.md) — the compiler this track extends.
- [050/10 HTTP and routes](../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md) — the server that serves `/_audio/`.
- [Open questions](../notes/01_initial_discussion/09_open-questions.md) — the default voice, how "agentks" is said, automatic generation.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- The video's `rate` is applied at playback, so it is not in the clip key.
- T2 measured word timing only at pauses: word starts land a median 35 to 45 ms late, and a word before a pause ends a median 150 ms late (worst 590 ms). Timing inside running speech is unmeasured; a forced aligner (a tool that matches each word to its place in the audio) would measure it. If captions visibly lag at word ends, trim each word's end to the voiced part of the waveform.
- T2 fixed the helper's bitrate at 24 kbit/s, so clip sizes at 32 kbit/s are unmeasured.
