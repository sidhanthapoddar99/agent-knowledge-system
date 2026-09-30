---
title: "The voiceover"
---

**The good voice is Kokoro-82M, run on the author's machine by a small helper program, `agentks-voice`.** It makes one Opus clip per beat, with the time of every word. Kokoro is an 82-million-parameter text-to-speech model under Apache 2.0. Its timestamped ONNX export reports how long each sound lasts, so the helper knows when each word starts. The English pronunciation step is misaki-rs (MIT), built without its espeak-ng feature, so nothing GPL enters the chain. A word the voice cannot say is an error that a pronunciation list fixes. The engine joins a video's clips into one audio stream of about 180 KB a minute. Clips live in a machine-wide store under `~/.agentks/audio/` and are never committed. The browser's own voice is the fallback whenever clips are missing.

## 01 Two voices

| | Generated voice (the good path) | Browser voice (the fallback) |
|---|---|---|
| Where it comes from | Kokoro, run by `agentks-voice` on the author's machine | The reader's browser and operating system (Web Speech API) |
| Setup | `agentks voice install`, once per machine, about 130 MB | None |
| Sounds | The same everywhere; natural for its size | Good in Edge and Chrome, robotic in Firefox on Linux |
| Timing | Exact durations and word times | Estimated; the clock holds when speech runs long |
| Seeking | Anywhere, to the millisecond | To the start of a sentence |
| Used when | Clips exist for every beat | No clips, or the reader chooses it |

## 02 Choosing the model

| Model | Licence | Size | Fit |
|---|---|---|---|
| **Kokoro-82M v1.0** | Apache 2.0 | 92 MB as 8-bit ONNX (326 MB full precision) | **Chosen.** The best-sounding model at its size; a timestamped ONNX export exists; runs on a CPU; several English voices |
| Kitten TTS nano | Apache 2.0 | 25 MB, 15M parameters | Much smaller, audibly weaker. Its pronunciation step is espeak-ng, so it is not a GPL-free fallback |
| Piper | Engine GPL-3.0 since the move to OHF-Voice (voices licensed one by one) | Under 100 MB | Fastest, but sounds synthetic, and the GPL engine is a poor match for an MIT tool |
| Supertonic 3 | Code MIT; weights OpenRAIL-M, with use restrictions and an attribution duty | About 400 MB | 31 languages. Worth a look only if non-English narration becomes a goal |
| Chatterbox, CosyVoice, VoxCPM2 | Various | 0.5B parameters and up | Better at expression, which the user said is not needed; too heavy for a laptop default |

The user asked for plain, clear narration, not expressive acting ([narration audio](../../notes/01_initial_discussion/05_narration-audio.md)). Kokoro fits that exactly.

## 03 Pronunciation, and the licence trap

A text-to-speech model like Kokoro does not read letters. A first step, called G2P (grapheme to phoneme), turns text into sounds. Most Kokoro ports use espeak-ng for that step, and espeak-ng is GPL-3.0. So are `phonemizer` and `kokoro-js`, which bundle it.

**misaki-rs** (version 0.6.0, MIT) is a Rust port of misaki, the G2P Kokoro was trained with. It covers English with a word list and part-of-speech rules for words spelled alike but said differently. **Its default `espeak` feature compiles espeak-ng** through the `espeak-rs` crate, to pronounce words that are not in its list. The crate is MIT, but the code it compiles is GPL-3.0. So the helper builds misaki-rs with `default-features = false`. Version 1 then narrates in **English only**, with no GPL code anywhere.

**The cost of turning espeak-ng off.** Without it, misaki-rs cannot guess a word it does not know, and would spell it letter by letter. A technical explainer is full of such words: "agentks", "WebSocket", "Preact", "frontmatter". A product name read as "A-G-E-N-T-K-S" is exactly the wrong answer that looks right: the file is fine, the check passes, and the video sounds broken. So version 1 treats an unknown word as an error, and gives the author a simple fix.

| Piece | Design |
|---|---|
| **The pronunciation list** | A map from a word to how it is said. Project-wide in `config/video.yaml` under `pronounce:`, and per video under the video's own `pronounce:` key (in a single file's header, or in a folder's `controller.yaml`), which wins for that video. A value is either a respelling in known words (`agentks: agent K S`) or phonemes between slashes in misaki's alphabet (`/ˈeɪdʒənt keɪ ɛs/`). Matching is on whole words, ignoring case |
| **How it reaches the model** | The compiler sends the helper each beat's original text plus the entries that apply to it. The helper rewrites those words with misaki's inline override form before G2P, and maps the word timings back onto the original characters. So anchors still match the text the author wrote |
| **Finding unknown words** | The helper has a fast `g2p` request that runs only the pronunciation step, with no audio. It returns every word that fell back to spelling. Words written in capitals, such as CLI or HTML, are spelled on purpose and are not reported |
| **The error** | `agentks check video` sends each beat to `g2p` when the helper is installed and reports `video-unknown-word` with the words and a fix hint. Without the helper it prints one note that pronunciation was not checked, because the browser voice will be used anyway. At generation, the helper refuses a beat with an unknown word, so no clip ever spells a word by mistake |
| **The starter template** | Ships `config/video.yaml` with a `pronounce:` entry for "agentks" (how it is said is question 2 in [the index](./01_index.md#questions-for-sidhantha)) |

**The other road.** The helper could instead be released as a separate GPL-3.0 program that includes espeak-ng. It talks to `agentks` only over standard input and output, so the main binary's MIT licence would not change, and most unknown words would be said on their own. The cost is that agentks would distribute GPL code. This is a licensing choice for sidhantha, so it is question 4 in [the index](./01_index.md#questions-for-sidhantha). The design recommends staying GPL-free unless the voice spike finds more than about one unknown word per minute of typical technical narration.

## 04 Where generation runs

| Option | Verdict |
|---|---|
| Inside the `agentks` binary | Rejected. ONNX Runtime adds tens of MB and minutes of build time to a binary every user downloads and every developer compiles, for a feature many projects never use |
| **A helper binary, `agentks-voice`, downloaded on request** | **Chosen.** The main binary stays lean and builds fast. The native runtime lives in its own process, so a crash cannot take the server down. It updates on its own schedule |
| In the author's browser (kokoro-js) | Rejected. Needs an 86 MB model in every browser, WebGPU for speed, and brings the GPL phonemizer |
| Python through `uv run` | Rejected. The Python Kokoro stack pulls in PyTorch, gigabytes on disk |

## 05 The helper: `agentks-voice`

| Aspect | Design |
|---|---|
| Source | The main repository, `apps/agentks-voice/`, its own crate, outside the engine's workspace build so the engine's gate never compiles ONNX Runtime |
| Built with | `ort` (Rust bindings for ONNX Runtime, MIT or Apache 2.0; 2.0 release candidates, the latest in July 2026), with ONNX Runtime linked in from its prebuilt static libraries so the build stays short; `misaki-rs` without default features for G2P; libopus (BSD) through the `opus` crate (MIT or Apache 2.0); the `ogg` crate (BSD) for the container |
| Released as | One archive per platform on the main repository's GitHub release, with checksums, beside the `agentks` archive |
| Installed by | `agentks voice install`. It shows the download size and asks. It fetches the helper for this `agentks` version, the model from Hugging Face at a pinned revision, and the chosen voices. Every file's SHA-256 is built into `agentks`, because a model download is not verified by git the way a library is |
| Installed into | `~/.agentks/tools/agentks-voice/<version>/` and `~/.agentks/models/kokoro-82m-v1.0-timestamped-q8/` (with `voices/`) |
| Other commands | `agentks voice status` (what is installed, its size, the audio store's size, whether it works), `agentks voice remove` |
| Runs as | One long-lived child process per running `agentks` server or command, started on the first request and stopped with it. It uses half the CPU cores by default |
| Talks over | JSON lines on standard input and output |

```text
→ {"id":"9c1e…","op":"speak","text":"agentks is one binary per machine.","say":{"agentks":"agent K S"},"voice":"af_heart","out":"/home/sid/.agentks/audio/9c1e….opus"}
← {"id":"9c1e…","ok":true,"ms":2410,"words":[[0,7,40,610],[8,10,610,700],…]}
→ {"id":"a71b…","op":"g2p","text":"The watcher pushes hashes over one WebSocket.","say":{}}
← {"id":"a71b…","ok":true,"unknown":[[35,44]]}
```

Each entry in `words` is `[first character, last character, start ms, end ms]` in the text that was sent, before any pronunciation rewrite. The compiler matches anchors by character position, so the helper and the compiler never have to split words the same way. `unknown` lists the character spans of words that would be spelled.

## 06 Clips

A clip is the unit of generation: one per beat.

| Choice | Value | Why |
|---|---|---|
| One clip per beat | 1 to 2 sentences, at most about 40 words | Rewording one beat regenerates one clip. Short inputs keep Kokoro in its best range |
| Container and codec | Ogg Opus | Plays in Chrome, Edge, Firefox and Safari 18.4 or newer |
| Channels and rate | Mono, 24 kHz | Kokoro's own output rate; Opus supports it directly |
| Bitrate | 24 kbit/s, speech mode | Clear speech; about 3 KB a second |
| Loudness | Every clip normalised to one level, with 5 ms fades at each end | Beats sound even and never click, and joins fall on silence |
| Word timings | In a small JSON file beside the clip | The compiler reads them into the timeline |

## 07 One stream per video

A stream is the unit of delivery: one per video.

**What it is.** The engine joins a video's clips into one Ogg Opus stream, in timeline order. It copies each clip's Opus packets and rewrites only their positions; nothing is decoded or re-encoded, so quality does not drop and the main binary needs no audio codec. Pauses, transitions and each slide's tail are filled with a fixed silent Opus packet, a few bytes per 20 ms. The stream therefore runs exactly as long as the video, and its time is the video's time.

**Why.** One `<audio>` element plays the whole video. Seeking is setting one time. There is one request, no gap between beats, and no second element to unlock on iOS. The clock has one source from start to end ([the player](./06_player.md#05-the-clock)).

| Aspect | Design |
|---|---|
| Built by | The video compiler crate, in pure Rust with the `ogg` crate, when every beat has a clip |
| Key | BLAKE3 of the list of beat keys and their start times. Any change to text or timing gives a new stream |
| Size | About 550 KB for a 3-minute video; the silence adds about 150 bytes a second |
| Joins | Each clip starts with the encoder's priming samples (about 6.5 ms). In a joined stream they play as a little extra silence, which the offsets account for. The 5 ms fades put every join on silence |
| Partly generated | No stream is built until every beat has a clip. Until then the video plays with the browser voice, and the page shows progress |

**The voice spike decides whether this holds.** It builds the example's stream and plays it in Chrome, Firefox, Safari on macOS and Safari on iOS. It listens for clicks at the joins and measures seek accuracy (target: within 50 ms). If a browser fails, delivery for that case falls back to one clip per beat, with two alternating `<audio>` elements. If Safari's Ogg Opus support proves unreliable, the same packets can be copied into a WebM container instead, still with no re-encoding. Safari older than 18.4 uses the browser voice.

## 08 The store

```text
~/.agentks/audio/
  <beat key>.opus      a clip
  <beat key>.json      its duration and word timings
  <stream key>.opus    a joined stream, rebuilt from clips whenever it is missing
```

- **The beat key** is the BLAKE3 hash of the beat's text (whitespace collapsed), the pronunciation entries that apply to it, the voice, the model id and the helper's version. The video's `rate` is applied at playback, so changing the speed never regenerates anything.
- **Machine-wide, not per project.** The key holds everything that decides the sound, so a clip made for one project is right for any other. A second clone, a renamed folder or a branch checkout reuses every clip.
- **Outside the engine version.** Audio does not change when the engine does. Regenerating every video after each upgrade would cost minutes of CPU for nothing.
- **Never in git.** It lives only in `~/.agentks/` and in a build's output folder, which the starter template ignores.
- **Cleaned only by hand**, with the rest of the machine home ([the machine home](../../../2026-09-29-rust-core-engine-migration/notes/02_engine/06_machine-home-and-build-cache.md)). `agentks cache clean` keeps the clips that the videos in the scanned projects still use. A removed clip is generated again when it is next needed.
- **In CI**, a workflow caches `~/.agentks/audio/`, `~/.agentks/tools/agentks-voice/` and `~/.agentks/models/` (for example with `actions/cache`, keyed by the helper version). Then a deploy generates only the beats that changed. Without that cache, a CI build downloads about 130 MB and generates every clip.

## 09 When audio is generated

1. **When a video is opened** in the local app or the standalone page, if the helper is installed. The server queues the beats with no clip, first slide first. The page shows "Generating voice: 12 of 27 beats" and offers to play now with the browser voice. When the last clip lands, the stream is joined, the page's hash changes and the server pushes it. A player that is not playing switches to the generated voice.
2. **On request:** `agentks video voice <file>` or `--all`, for CI or before going offline. It prints progress and the total size.
3. **In `agentks build`**, for any beat still missing a clip, when the helper is installed.

The first run for a 3-minute video should take well under a minute on a laptop CPU; an edited beat, a second or two. The voice spike measures the real numbers.

## 10 How a published site gets the voice

| Option | The reader downloads | Quality | Word sync | Verdict |
|---|---|---|---|---|
| **Ship each video's stream** | About 180 KB a minute, streamed with range requests, with a content-hashed name cached for good | The generated voice, identical for everyone | Exact | **Chosen** |
| Synthesise in the reader's browser | An 86 MB model and its runtime, on every new device | Good on a fast machine | Approximate | Rejected: about 150 times the size, slow to start, poor on phones |
| The reader's browser voice | Nothing | Varies from good to robotic; Chrome's online voices send the text to Google | Estimated | The fallback only |

`agentks build` copies each video's stream to `_audio/<stream key>.opus`. The browser starts playing after the first few KB and fetches the rest as it plays or seeks. Every common static host serves range requests.

## 11 The browser voice, as the fallback

The spike's narrator carries over:

- It ranks English voices, preferring names that contain "Natural", "Neural" or "Online", then known good ones, and remembers the reader's choice.
- It speaks one sentence per utterance, because Chrome cuts long utterances off after about fifteen seconds.
- Timing is the compiler's estimate. At a beat's estimated end, if speech is still going, the clock waits for it.
- Word-boundary events are not used: Chromium fires them per word, Safari per sentence, and remote voices not at all.
- The browser voice has its own pronunciation and ignores the pronunciation list.

## 12 What makes the voice sound good

| Lever | Owner |
|---|---|
| Writing for the ear: short sentences, numbers as spoken ("thirteen hundred"), symbols spelled out ("site dot yaml"), no brackets | The authoring skill |
| Beats of one or two sentences | The format's limits and the skill |
| Product names and jargon said right | The pronunciation list, enforced by `video-unknown-word` |
| One consistent voice per project, set once | `voice:` in `config/video.yaml` (see question 1 in [the index](./01_index.md#questions-for-sidhantha)) |
| Even loudness, no clicks, no gaps | The helper's normalising and fades, and the joined stream |

## 13 What the voice spike must measure

- **Quality:** the example video in three voices (`af_heart`, `am_michael`, `bf_emma`), judged by sidhantha.
- **Speed:** times faster than real time on sidhantha's laptop and on a CI runner.
- **Word timing accuracy:** spot checks against the waveform; the target is within 50 ms.
- **Unknown words:** built with `default-features = false`, the list of words the example's narration cannot say, played aloud. Whether misaki-rs exposes which words fell back, or whether the helper must check each word against misaki's word list itself. The pronunciation list fixing each one.
- **The joined stream:** clicks at joins, seek accuracy and playback in Chrome, Firefox, Safari on macOS and Safari on iOS.
- **Sizes:** the helper binary, the clips at 24 and 32 kbit/s.
- **Build time** of the helper, and the licence of every crate it pulls in, with `cargo deny`.

If Kokoro through `ort` and misaki-rs falls short on quality or speed, the next candidate runtime is sherpa-onnx (Apache 2.0, a Rust crate that supports Kokoro), fed with misaki-rs's phonemes. It is only a candidate if it accepts phonemes directly, because its own text path uses espeak-ng. There is no GPL-free candidate model that sounds as good as Kokoro, which is why the pronunciation list, not a model swap, is the fix for unknown words.
