---
title: T2 Voice spike — Kokoro clips with word timings, joined into one stream
status: review
---

The second gate for the video engine: a first agentks-voice helper turns the example's beats into Ogg Opus clips with word timings and joins them into one stream, so sidhantha can hear the voices and the joins. Design: [01/07 The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md).

# 01 To Do
- [x] Create `apps/agentks-voice/`, its own Cargo workspace and lock file, outside the engine workspace
- [x] Kokoro-82M v1.0 timestamped ONNX export, 8-bit, at a pinned Hugging Face revision, run with `ort` and a prebuilt ONNX Runtime
- [x] English G2P with misaki-rs, `default-features = false`; check the crate and its licence by hand
- [x] Ogg Opus clips: mono, 24 kHz, 24 kbit/s, loudness-normalised, 5 ms fades
- [x] JSON lines over stdio: `g2p` (reports unknown words) and `speak` (clip path, duration, word timings `[charStart, charEnd, startMs, endMs]`)
- [x] Turn the example's 27 beats into clips
- [x] Join the clips into one stream by copying Ogg packets in pure Rust, with silent packets for pauses
- [x] List every unknown word in the example, play them aloud, and show a `pronounce:` map fixing them
- [x] Listening files for sidhantha: three voices, two ways of saying "agentks", the joined stream, the unknown words before the fix
- [x] Measure: real-time factor, clip and stream sizes, build time, every crate's licence, word-timing accuracy if cheap
- [x] Play the stream in Chromium and Firefox with Playwright; seek within 50 ms
- [x] `ctl build voice` and `ctl test voice`, kept out of the default gate; record the exception in AGENTS.md
- [ ] sidhantha listens: picks the default voice and how "agentks" is said, and judges the joins

## Guardrails
- Nothing GPL in the chain: misaki-rs builds without its `espeak` feature.
- The helper stays out of the default `ctl` gate, because it builds ONNX Runtime bindings.
- The model, voices and ONNX Runtime files live in the spike's data folder, never in `~/.agentks` and never in git.
- A word the voice cannot say is an error, never a letter-by-letter guess.
- Tests stay under 10 seconds in total.

## Questions
For sidhantha, after listening. Each has a recommendation.
1. **Which voice is the default?** Files: `data/voice-spike/listen/01_voices/` and the three full streams in `listen/03_example-*`. The design recommends `af_heart`.
2. **How is "agentks" said?** Files: `listen/02_agentks/agent-k-s.opus` and `one-word.opus`. The design recommends "agent K S".
3. **Switch the model from 8-bit to 16-bit?** The 8-bit export is 3.5 times slower on this CPU (see Result). The 16-bit export is 156 MB instead of 92 MB and runs at the full-precision speed. Recommended: 16-bit, because a 3-minute video then generates in about 25 s instead of 75 s. Not changed in the spike, because the brief named 8-bit.
4. **Is misaki-rs's dictionary acceptable?** Its author rebuilt most entries by running espeak-ng (GPL-3.0) over a word list (`expand_dicts.py` in the crate). No espeak-ng code is compiled in and the crate is MIT, but the pronunciation data is espeak-ng's output. The usual reading is that a program's output is not covered by the program's licence. Recommended: accept, and note it in the helper's third-party notices; the alternative is to ship only misaki's original Apache-2.0 dictionaries, which needs a fork.

## Done when
- All 27 beats become clips with word timings on this machine.
- The joined stream plays with no audible join and seeks to within 50 ms in Chromium and Firefox. Safari on macOS and iOS is named as untested.
- The report lists every unknown word in the example and shows the pronunciation list fixing them.
- Every dependency's licence is compatible with MIT.
- sidhantha picks a default voice and how "agentks" is said (his call, after listening).

# 02 Status and Result
Review: everything is built and measured; only sidhantha's listening and his two choices remain.

## Result
**What exists** (main repository, branch `wave2/video-voice`):
- `apps/agentks-voice/`: its own Cargo workspace. `crates/ogg-opus` (pure Rust: read, write and join Ogg Opus by copying packets), `crates/voice` (the `agentks-voice` binary), `crates/spike` (`agentks-voice-spike`: `words`, `stream`, `say`, `check`). `spike/` holds the example (6,983 bytes, 27 beats), `pronounce.yaml`, `fetch-model.sh` (pinned revision `dd4401a9…`, SHA-256 per file), `make-samples.sh` and the browser seek check. `deny.toml` holds the licence policy and bans `espeak-rs`.
- `ctl build voice`, `ctl test voice` (40 unit tests, 0.3 s to run), `ctl gate lint voice`. None of them runs in `ctl gate` or in `ctl build` with no app; AGENTS.md records the exception.
- Listening files and evidence: `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system/data/voice-spike/` with a README listing each file.

**Numbers** (Intel i9-13900K, 32 threads, Linux):

| Measure | Result |
|---|---|
| Unknown words in the example | 3 in 437 words (about one a minute): agentks (4 beats), frontmatter (2), WebSocket (1). The 3-entry `pronounce:` map fixes all of them |
| Speed, 8-bit model | 2.2 to 2.4 times faster than real time. The example (163 s of speech) takes 67 to 75 s. More than 8 threads does not help |
| Speed, full and 16-bit models | About 8.2 times faster than real time at 16 threads (6.9 s of speech in 0.84 s) |
| Start-up | Ready for `g2p` in 0.28 s; the model loads on the first `speak` in about 0.5 s |
| Clips | 23.1 kbit/s on average; 471 KB for the example's 27 clips |
| Joined stream | 473 KB for 3:04 (af_heart): 150 to 159 KB a minute across the three voices |
| Joins | Loudest sample within 20 ms of any join: -84 dBFS. The stream's audio is sample-identical to each clip decoded alone |
| Seeking | Chromium 153: lands exactly on the target at all 10 targets. Firefox 155: 6.5 ms early at all 10 (the Opus pre-skip). Both play to the end. Safari on macOS and iOS could not be tested on Linux |
| Word starts | At the 78 to 98 pause boundaries per voice: median 35 to 45 ms late, 90% within 65 to 110 ms |
| Word ends before a pause | Median 150 ms late, worst 590 ms: the model folds the pause into the last sound's duration |
| Helper binary | 64 MB; 58.5 MB stripped; 17.4 MB gzipped (the dictionaries are about 30 MB of it) |
| Build | Clean release build in 9.1 s with ONNX Runtime cached; the ONNX Runtime download is 10 MB and 1.5 s |
| Licences | `cargo deny check licenses bans`: ok. 55 crates in the binary: MIT, Apache-2.0, BSD-3-Clause, Zlib, Unicode-3.0, Unlicense, and one WTFPL (language-tokenizer). Build-time only: ISC and CDLA-Permissive-2.0. No espeak-rs anywhere in `Cargo.lock`. Native: ONNX Runtime 1.28.0 (MIT), libopus (BSD-3-Clause), Kokoro weights and voices (Apache-2.0) |

**How word timing was measured.** The only boundaries a waveform shows without a speech recogniser are pauses. `agentks-voice-spike check` finds the silent run around each pause of 100 ms or more, and each clip's first onset and last offset, and compares them with the reported times. It says nothing about boundaries inside running speech; a forced aligner would be the next step if that matters.

**Missing fields.** The spike driver now stops with an error that names the field and the beat when a timeline field or a helper reply field is missing or not a number. Before, it read such a field as 0.

## Agent log
none

# 03 References
- [01/01 Video artifact engine — index](../brainstorm/01_video-artifact-engine/01_index.md)
- [01/07 The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md)
- [01/03 The artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md) — the example and its 27 beats
- [01/12 Research notes](../brainstorm/01_video-artifact-engine/12_research.md) — sources and licences
- [Kokoro-82M ONNX, timestamped](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX-timestamped) · [misaki-rs](https://github.com/MicheleYin/misaki-rs) · [ort](https://github.com/pykeio/ort)

# 04 Decisions
- Decided (claude, 2026-10-01): three crates in the helper's workspace, with the join in its own codec-free crate, `agentks-ogg-opus`, because the engine must join clips without linking a codec, and one crate that both the helper (writing clips) and the engine (joining them) use cannot drift.
- Decided (claude, 2026-10-01): the helper finds unknown words by giving misaki-rs its own fallback (`G2P::with_fallback`) that marks the word instead of spelling it, because misaki-rs does not report which words fell back. This answers the design's open question: misaki-rs does not expose it, and the helper does not need its own word-list check.
- Decided (claude, 2026-10-01): the helper rewrites misaki-rs's phonemes from espeak notation to misaki's alphabet (misaki's own espeak-to-misaki map, plus `ɚɹ` → `əɹ`), because misaki-rs 0.6's dictionary is mostly espeak output, with tied diphthongs Kokoro never saw in training. Any character still outside Kokoro's alphabet is an error.
- Decided (claude, 2026-10-01): a voice id picks the dialect (`a…` American, `b…` British), and `g2p` takes an optional `voice`, because bf_emma read with American pronunciation would be a false sample. Without a voice, `g2p` reads American English and says so in its reply.
- Decided (claude, 2026-10-01): a number other than a plain whole number (7.8, 09) is an unknown word, because misaki-rs reads "7.8" as "seven eight". Words in capitals are spelled on purpose, stressed on the last letter as misaki does for CLI.
- Decided (claude, 2026-10-01): word times use the model's durations rounded to whole frames, at least one, and the helper refuses a clip whose frames do not add up exactly to its samples, because the timestamped output is the value before rounding: unrounded, the times drift (323.5 frames against 319 drawn).
- Decided (claude, 2026-10-01): word times are reported as the model gives them, with no trimming from the waveform, because a threshold-based trim is a guess that could cut quiet final sounds. Starts are good; ends before a pause are late (see Result).
- Decided (claude, 2026-10-01): clips are normalised to -18 LUFS (EBU R128) with a -1 dBFS peak ceiling, encoded in 20 ms frames in speech mode, with the Ogg end trimmed to the last real sample, because one level for every clip is what makes the joined stream even.
- Decided (claude, 2026-10-01): the join places each clip's packets one pre-skip early, so its first real sample lands on its start time, and fills gaps with fixed silent CELT packets of 20 ms and 2.5 ms, so starts land on a 2.5 ms grid and the join returns the real starts. The design said the priming would play as extra silence that offsets account for; placing it early is simpler and exact.
- Decided (claude, 2026-10-01): pages end after about 1 s of audio, because browsers seek Ogg by bisecting pages.
- Decided (claude, 2026-10-01): libopus builds with CMake 4.4.3 fetched by mise and pinned once in `scripts/build/_voice.sh`, because the machine has no CMake and system packages are not allowed.
- Decided (claude, 2026-10-01): the model folder mirrors the Hugging Face repository's layout (`onnx/model_quantized.onnx`, `tokenizer.json`, `voices/`), and the helper reads Kokoro's alphabet from that `tokenizer.json` rather than keeping a copy.
- Decided (claude, 2026-10-01): the spike's stand-in timeline uses a 400 ms lead, 250 ms between beats, 700 ms tail and 600 ms transition, because the real timeline is the compiler's (T3) and the stream only needs times to join against.
- Decided (claude, 2026-10-01): the helper loads the model on the first `speak` and uses half the cores by default, as the design says; more than 8 threads gains nothing with this model.

# 05 Notes & Analysis
## Issues hit
- The timestamped export's `durations` are not rounded, so the first stream failed its own length check. Fixed by rounding as the model does.
- misaki-rs's repository is `MicheleYin/misaki-rs`, not the one the research note links.

## Watch out
- **The 8-bit model misses the design's speed target.** "Well under a minute" for a 3-minute video is not met: 67 to 75 s here, on a fast desktop CPU. The 16-bit export meets it (question 3).
- **Word ends before pauses are late** by a median 150 ms. Anchors use word starts, so the timeline is fine. Captions that highlight a word until its end will linger into pauses; T6 can trim ends to the voiced part if that shows.
- **Word starts run about 35 ms late** against the waveform's onset. A player that fires an action 30 ms early would sit on the sound; that is a player choice for T6.
- **Third-party notices.** A released helper must ship ONNX Runtime's own notices (it bundles Eigen, MPL-2.0, and others), libopus's BSD notice, the Kokoro licence and misaki's dictionary notice.
- **`ctl setup` fetches the helper's crates** (it runs `cargo fetch` for every Cargo workspace). It does not build them.
- **Firefox reports the stream's time 6.5 ms off** from its own decoder: harmless at a 50 ms target.
- Safari on macOS and iOS still needs a test on a Mac and an iPhone before T6 relies on one Ogg Opus stream there.
