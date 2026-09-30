---
title: "Research notes, 2026-10-01"
---

**What was checked on the web for this design, with sizes, licences and dates.** Figures are as the sources state them in September 2026; the two spikes re-measure the ones that decide anything. The earlier comparison of Remotion, HyperFrames, Motion Canvas and Revideo is in [the research note](../../notes/01_initial_discussion/02_research-remotion-and-alternatives.md).

## 01 Animation runtimes

| Runtime | Size (gzip) | Licence | Notes |
|---|---|---|---|
| Web Animations API | 0 | Platform | Pause plus `currentTime` gives exact seeking. Measured here: 600 animations seek in 0.22 ms ([what exists today](./02_current-state.md#a-measurement-taken-for-this-design)) |
| Motion `animate` | 2.3 KB mini (WAAPI only), 17 KB hybrid | MIT | The hybrid engine switches between WAAPI and a frame loop |
| anime.js 4.5 | 3.5 KB WAAPI module, 24.5 KB full | MIT | Timelines with seek; latest release June 2026 |
| GSAP 3 | about 23 KB core | GSAP Standard License: free since April 2025, including former Club plugins, but not open source, and it restricts use in tools that compete with Webflow's visual builders | Not usable inside an MIT project without passing those terms on |
| Lottie | lottie-web 60 to 75 KB; dotLottie players about 35 KB plus a 500 KB WASM engine | MIT | Authored in After Effects, so not agent-writable |

## 02 Code-driven video and slide tools (ideas only)

| Tool | State in 2026 | Idea taken |
|---|---|---|
| HyperFrames (HeyGen) | Apache 2.0, released April 2026; HTML with timing attributes, rendered to MP4 by headless Chrome with a frozen clock; July 2026 added storyboards and media libraries | Every frame must be a function of time. Agents write HTML well, but HTML per video is not lean |
| Remotion | Source-available, paid for companies of four or more | A frame is a pure function of its number |
| Motion Canvas | Original project unmaintained; Canvas Commons is the community fork | Animation events tied to the voiceover's timing |
| Revideo | Folded into a commercial editor, Midrender | Library-first rendering API |
| PowerPoint Morph, Keynote Magic Move, reveal.js auto-animate | Established | Match the same object across two slides and animate the difference: the `morph` transition |
| PowerPoint placeholders and slide masters | Established | Layouts with named areas, and slide templates with slots |

## 03 Charts

| Library | Size (gzip) | Why not used |
|---|---|---|
| Chart.js 4 | about 67 KB | Canvas, and its animations cannot be seeked |
| uPlot | about 11 KB | Canvas, no entrance animation |
| Frappe Charts | about 18 KB | SVG and animated, but its animations run on their own clock |

The player draws six mark types itself in SVG, animated through WAAPI, in a lazy chunk of about 4 KB. Library chart templates choose the mark and the look.

## 04 Text to speech

| Model | Licence | Size | Notes |
|---|---|---|---|
| Kokoro-82M v1.0 | Apache 2.0 | ONNX: 326 MB fp32, 163 MB fp16, 92 MB 8-bit, 86 MB mixed | A timestamped ONNX export exists (`onnx-community/Kokoro-82M-v1.0-ONNX-timestamped`). The Rust project Kokoros writes per-word timings from it |
| Kitten TTS nano | Apache 2.0 | 25 MB, 15M parameters | Small, weaker voice |
| Piper | Engine GPL-3.0 since moving to OHF-Voice (v1.8.0, September 2026); voices licensed one by one | Under 100 MB | Very fast; sounds synthetic |
| Supertonic 3 | Code MIT, weights OpenRAIL-M (use restrictions, attribution) | About 400 MB, 99M parameters | 31 languages; released April 2026 |
| Chatterbox, CosyVoice, VoxCPM2 | Various | 0.5B parameters and up | Expressive; too heavy for a laptop default |

**Pronunciation (G2P).** Most Kokoro ports use espeak-ng, which is GPL-3.0, and so are `phonemizer` and `kokoro-js`, which bundle it. `misaki-rs` 0.6.0 (September 2026) ports misaki, Kokoro's own G2P, to Rust for English. Checked on crates.io on 2026-10-01: its licence is **MIT**, and its **default feature `espeak` pulls in `espeak-rs`**, which compiles espeak-ng (GPL-3.0) as the fallback for unknown words. Built with `default-features = false`, it has no fallback. `sayd_misaki_en` is another port. sherpa-onnx's Kokoro and Piper paths and Kitten TTS also pronounce through espeak-ng, so none of them is a GPL-free way around unknown words.

**Runtimes.** `ort` (ONNX Runtime for Rust) has 2.0 release candidates, the latest in July 2026, with static linking and a minimal-build option. The `sherpa-onnx` Rust crate (Apache 2.0, 1.13.5, August 2026) supports Kokoro and is the fallback candidate.

**In the browser.** kokoro-js runs Kokoro through Transformers.js: an 86 MB model at the smallest, WebGPU about 10 times faster than real time on an M1 Max with a 2.3 s cold start, WASM otherwise. Its public ONNX path gives no word timings, so JavaScript users estimate them from character counts.

**Browser speech.** The Web Speech API is in every current browser, but word boundary events are not portable: Chromium fires them per word, Safari per sentence. Edge on Windows 11 offers Microsoft's Natural voices.

**Opus in browsers.** Safari plays Ogg Opus from 18.4 (macOS 15.4 and iOS 18.4, March 2025). Before that it played Opus only in a CAF file. Some reports call the macOS support partial, so the voice spike tests Safari on macOS and iOS explicitly. Opus packets can be copied into WebM without re-encoding if Ogg proves unreliable there.

**Joining Opus clips.** Packets from several Opus encodes can be copied into one Ogg stream by rewriting granule positions. Each encode starts with priming samples (a pre-skip, 312 samples at 48 kHz by default, about 6.5 ms). Only the first is skipped by the decoder; the others play. With clips that start with a fade from silence, that is a few ms of extra silence. Opus's 20 ms silence frame is a fixed packet of a few bytes, so silence can be written with no encoder.

## 05 Rust crates for the compiler

Versions checked on crates.io on 2026-10-01.

| Need | Crate | Version | Licence | Notes |
|---|---|---|---|---|
| YAML with node positions | `saphyr` · `saphyr-parser` | 0.1.0 | MIT or Apache 2.0 | The maintained successor of `yaml-rust2`; parser events carry positions. `serde-saphyr` 1.3.0 adds serde. `serde_yaml` is deprecated and `serde_yml` unmaintained. `yaml-spanned` 0.0.3 has a non-standard licence |
| JSON Schema validation | `jsonschema` | 0.58.3 | MIT | Draft 2020-12 |
| SVG allowlist | `quick-xml` | 0.42.0 | MIT | Parse and write back |
| Hashing | `blake3` | 1.8.7 | CC0 or Apache 2.0 | Clip, stream and page keys |
| Ogg container | `ogg` | 0.9.2 | BSD-3-Clause | Joining clips; also used by the helper |
| Opus encoding (helper only) | `opus` | 0.4.0 | MIT or Apache 2.0 | Binds libopus (BSD) |
| ONNX Runtime (helper only) | `ort` | 2.0.0-rc.13 | MIT or Apache 2.0 | July 2026 |

The YAML parser choice belongs to the config loader's subtask, [030/30](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md); this design adds node positions to its requirements.

## 06 Icons and easing

- **Lucide** (`lucide-static` 1.49.0 on npm, ISC licence): 1,857 icons, each 24 × 24, stroke 2, `currentColor`, with a `tags.json` of search words. The library's 74 icons are already Lucide-derived (`LICENSES/lucide.txt`).
- **CSS `linear()` easing** lists sampled points, so springs and bounces are data. Supported since Chrome 113, Firefox 112 and Safari 17.2 (Baseline 2023).

## 07 Sources

- [Kokoro-82M ONNX, timestamped](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX-timestamped) and [plain](https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX)
- [Kokoro word timestamps](https://ryanwelch.co.uk/blog/kokoro-word-timestamps/) · [Kokoros](https://github.com/lucasjinreal/Kokoros)
- [Kokoro and espeak-ng GPL question](https://github.com/hexgrad/kokoro/issues/247) · [misaki-rs](https://github.com/yamanahlawat/misaki-rs) · [sayd_misaki_en](https://docs.rs/sayd-misaki-en/latest/sayd_misaki_en/)
- [misaki-rs on crates.io](https://crates.io/crates/misaki-rs) (licence and features) · [espeak-rs](https://crates.io/crates/espeak-rs)
- [ort](https://github.com/pykeio/ort) · [sherpa-onnx crate](https://docs.rs/sherpa-onnx/latest/sherpa_onnx/)
- [saphyr](https://crates.io/crates/saphyr) · [jsonschema](https://crates.io/crates/jsonschema) · [quick-xml](https://crates.io/crates/quick-xml)
- [Lucide](https://lucide.dev/) · [lucide-static on npm](https://www.npmjs.com/package/lucide-static)
- [MDN: linear() easing](https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear)
- [RFC 7845: Ogg encapsulation for Opus](https://www.rfc-editor.org/rfc/rfc7845) (pre-skip and granule positions)
- [KittenTTS](https://github.com/KittenML/KittenTTS) · [piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) · [Supertonic 3](https://huggingface.co/Supertone/supertonic-3)
- [Kokoro WebGPU in the browser](https://briantung.me/blog/tts-engines-in-the-browser/) · [Kokoro.js announcement](https://huggingface.co/posts/Xenova/503648859052804)
- [MDN: speech boundary event](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/boundary_event) · [Web Speech API browser support](https://textintoaudio.com/browser-support)
- [caniuse: Opus](https://caniuse.com/opus) · [Opus on the web in 2026](https://audioutils.com/guide/audio-for-web-developers)
- [GSAP Standard License](https://gsap.com/standard-license/) · [GSAP made free](https://webflow.com/updates/gsap-becomes-free)
- [Motion animate](https://motion.dev/docs/animate) · [anime.js](https://animejs.com/)
- [dotLottie players](https://docs.lottiefiles.com/en/runtimes) · [lottie-web bundle size](https://github.com/airbnb/lottie-web/issues/1184)
- [HyperFrames, HTML to video](https://www.heygen.com/research/html-to-video) · [HeyGen July 2026 updates](https://www.heygen.com/blog/heygen-july-2026-release)
- [Remotion vs Motion Canvas vs Revideo, 2026](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- [JavaScript charting in 2026](https://apexcharts.com/blog/state-of-javascript-charting-2026/)
- [serde_yaml alternatives](https://users.rust-lang.org/t/serde-yaml-deprecation-alternatives/108868)
