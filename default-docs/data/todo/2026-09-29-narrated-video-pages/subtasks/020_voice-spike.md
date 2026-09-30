---
title: T2 Voice spike — Kokoro clips with word timings, joined into one stream
status: in-progress
---

The second gate for the video engine: a first agentks-voice helper turns the example's beats into Ogg Opus clips with word timings and joins them into one stream, so sidhantha can hear the voices and the joins. Design: brainstorm/01_video-artifact-engine/07_voiceover.md.

# 01 To Do
- [ ] Create `apps/agentks-voice/`, its own Cargo workspace and lock file, outside the engine workspace
- [ ] Kokoro-82M v1.0 timestamped ONNX export, 8-bit, at a pinned Hugging Face revision, run with `ort` and a prebuilt ONNX Runtime
- [ ] English G2P with misaki-rs, `default-features = false`; check the crate and its licence by hand
- [ ] Ogg Opus clips: mono, 24 kHz, 24 kbit/s, loudness-normalised, 5 ms fades
- [ ] JSON lines over stdio: `g2p` (reports unknown words) and `speak` (clip path, duration, word timings `[charStart, charEnd, startMs, endMs]`)
- [ ] Turn the example's 27 beats into clips
- [ ] Join the clips into one stream by copying Ogg packets in pure Rust, with silent packets for pauses
- [ ] List every unknown word in the example, play them aloud, and show a `pronounce:` map fixing them
- [ ] Listening files for sidhantha: three voices, two ways of saying "agentks", the joined stream, the unknown words before the fix
- [ ] Measure: real-time factor, clip and stream sizes, build time, every crate's licence, word-timing accuracy if cheap
- [ ] Play the stream in Chromium and Firefox with Playwright; seek within 50 ms
- [ ] `ctl build voice` and `ctl test voice`, kept out of the default gate; record the exception in AGENTS.md

## Guardrails
- Nothing GPL in the chain: misaki-rs builds without its `espeak` feature.
- The helper stays out of the default `ctl` gate, because it builds ONNX Runtime bindings.
- The model, voices and ONNX Runtime files live in the spike's data folder, never in `~/.agentks` and never in git.
- A word the voice cannot say is an error, never a letter-by-letter guess.
- Tests stay under 10 seconds in total.

## Done when
- All 27 beats become clips with word timings on this machine.
- The joined stream plays with no audible join and seeks to within 50 ms in Chromium and Firefox. Safari on macOS and iOS is named as untested.
- The report lists every unknown word in the example and shows the pronunciation list fixing them.
- Every dependency's licence is compatible with MIT.
- sidhantha picks a default voice and how "agentks" is said (his call, after listening).

# 02 Status and Result
In progress.

## Result
Not yet.

## Agent log
none

# 03 References
- [01/01 Video artifact engine — index](../brainstorm/01_video-artifact-engine/01_index.md)
- [01/07 The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md)
- [01/03 The artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md) — the example and its 27 beats
- [01/12 Research notes](../brainstorm/01_video-artifact-engine/12_research.md) — sources and licences

# 04 Decisions

# 05 Notes & Analysis
## Issues hit
## Watch out
