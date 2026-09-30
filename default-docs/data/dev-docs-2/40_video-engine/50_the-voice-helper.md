---
title: "The voice helper"
description: "agentks-voice: Kokoro-82M through ONNX Runtime, pronunciation without GPL code, unknown words as errors, the JSON-lines protocol, and how the helper is installed and run."
---

`agentks-voice` is a separate program that turns one beat of narration into an audio clip and the time of every word in it. It runs the Kokoro voice model on the author's machine. This page explains why it is a separate program, how it decides how a word sounds, the protocol the engine speaks to it, and how it is installed and run. Read it before you change the helper or the code that calls it.

## Why a separate program

| Option | Verdict |
|---|---|
| Inside the `agentks` binary | Rejected. ONNX Runtime adds tens of MB and minutes of build time, for a feature many projects never use |
| **A helper downloaded on request** | **Chosen.** The main binary stays lean. A crash in the native runtime cannot take the server down |
| In the reader's browser | Rejected. An 86 MB model for every reader |

## The model

The voice is **Kokoro-82M v1.0**, an 82-million-parameter text-to-speech model under Apache 2.0. The helper uses its timestamped ONNX export in 8-bit form, run by ONNX Runtime through the `ort` crate. ONNX Runtime is linked in from its prebuilt static libraries, so the helper builds in seconds.

The timestamped export adds one output: how many frames of 600 samples, 25 ms at 24 kHz, each input sound lasts. The helper turns those lengths into word times. It rounds each length to whole frames, as the model does, with at least one frame each. It refuses a clip whose frames do not add up exactly to its samples, because times that drift from the audio would be a wrong answer that looks right. Kokoro reads at most 510 sounds at once, so a longer beat is an error that asks the author to split it.

## Pronunciation without GPL code

A voice model does not read letters. A first step, called G2P (grapheme to phoneme), turns text into sounds. The helper uses **misaki-rs**, a Rust port of the G2P Kokoro was trained with, under MIT. Its default `espeak` feature compiles espeak-ng, which is GPL-3.0. So the helper builds it with that feature off, and `deny.toml` bans the crate that would bring espeak-ng in. `cargo deny` checks every licence.

misaki-rs writes most words in espeak's notation, while Kokoro learned misaki's own alphabet, which the helper reads from the model's `tokenizer.json`. So the helper maps one to the other, and any sound still outside Kokoro's alphabet is an error. A voice id starting with `a` reads American English, and one starting with `b` British English.

## Unknown words are errors

Without espeak-ng, misaki-rs cannot guess a word it does not know, and would spell it letter by letter. "agentks" read as "A-G-E-N-T-K-S" is exactly the wrong answer that looks right: the file is fine, and the video sounds broken. So the helper gives misaki-rs a fallback that marks such a word instead. It reports the word, and it refuses to speak a beat that holds one.

- **Words in capitals**, such as CLI or HTML, are spelled on purpose and never reported.
- **A number other than a plain whole number**, such as 7.8 or 09, is reported, because the helper cannot be sure how to say it. The author writes it as words.

**The fix is a pronunciation list.** `pronounce:` in `config/video.yaml` covers the project, and `pronounce:` in a video's header covers that video and wins. A value is a respelling in words the voice knows (`agentks: agent K S`) or misaki phonemes between slashes. Keys match whole words, ignoring case. The video crate sends each beat's text with the entries that apply to it. The helper rewrites those words before G2P, and maps every word time back onto the original characters, so anchors still match the text the author wrote.

## The protocol

The helper reads one JSON request per line on standard input and writes one reply per line on standard output. Diagnostics go to standard error.

```text
→ {"id":1,"op":"g2p","text":"One WebSocket.","say":{}}
← {"id":1,"ok":true,"dialect":"en-us","unknown":[[4,13]],"phonemes":"…"}
→ {"id":2,"op":"speak","text":"agentks is one binary.","say":{"agentks":"agent K S"},"voice":"af_heart","out":"/…/audio/<key>.opus"}
← {"id":2,"ok":true,"ms":2900,"words":[[0,7,354,1184],…],"bytes":8120,"elapsedMs":900}
→ {"id":3,"op":"speak","text":"One WebSocket.","voice":"af_heart","out":"/…/b.opus"}
← {"id":3,"ok":false,"code":"unknown-word","error":"…","unknown":[[4,13]]}
→ {"id":4,"op":"info"}
← {"id":4,"ok":true,"version":"…","model":"onnx/model_quantized.onnx"}
```

| Request | Does |
|---|---|
| `g2p` | Runs only the pronunciation step and lists unknown words. It never loads the model, so `agentks check video` can afford it |
| `speak` | Writes one clip to `out` and returns its length and word times |
| `info` | Returns the helper's version and the model file |

Spans are `[start, end)` in characters of the text as sent. Word times are milliseconds from the clip's first sample. A failed request returns `ok: false` with a stable `code`.

## Installing and running

`agentks voice install` shows the download size and asks first. It fetches the helper for this agentks version into `~/.agentks/tools/agentks-voice/<version>/`, and the model at a pinned revision with the chosen voices into `~/.agentks/models/kokoro-82m-v1.0-timestamped-q8/`. The SHA-256 of every file is built into `agentks`, because a model download is not checked by git the way a library is. `agentks voice status` reports what is installed, and `agentks voice remove` removes it.

The helper ships as one archive per platform on the main repository's GitHub release, with its third-party notices. The `agentks` installer never fetches it.

The engine runs it as `agentks-voice --model-dir <dir>`, one long-lived child process per running server or command, started on the first request and stopped with its parent. It uses half the CPU cores unless `--threads` says otherwise. The model loads on the first `speak`, so a caller that only runs `g2p` never waits for it.

## Related

- [Clips, streams and the audio store](./55_clips-streams-and-the-store.md): what happens to a clip next.
- [Where the code lives](./05_where-the-code-lives.md): the helper's workspace.
- [The meaning checks](./20_the-meaning-checks.md): `video-unknown-word`.
