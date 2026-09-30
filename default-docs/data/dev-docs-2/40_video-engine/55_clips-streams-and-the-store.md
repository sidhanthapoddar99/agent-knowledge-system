---
title: "Clips, streams and the audio store"
description: "The clip format, joining clips into one Ogg Opus stream by copying packets, the machine-wide audio store and its keys, and when audio is generated."
---

A video's voice is made in two units. A **clip** is one beat's audio, the unit of generation. A **stream** is a whole video's clips joined into one file, the unit of delivery. Both live in one machine-wide store. This page explains the clip format, how the join works without a codec, how the store is keyed, and when audio is made. Read it before you change audio generation, the join or the store.

## Why two units

- **One clip per beat** keeps edits cheap. Rewording one beat regenerates one clip.
- **One stream per video** keeps playback simple. One `<audio>` element plays the whole video with one request and no gap between beats. The stream runs exactly as long as the video, so its time is the video's time, and seeking is setting one time.

## The clip format

| Choice | Value | Why |
|---|---|---|
| Container and codec | Ogg Opus | Plays in every current browser |
| Channels and rate | Mono, 24 kHz | Kokoro's own output rate |
| Bitrate | 24 kbit/s, speech mode, 20 ms frames | Clear speech at about 3 KB a second |
| Loudness | -18 LUFS (EBU R128), with a -1 dBFS peak ceiling | Every clip at one level, so the stream sounds even |
| Edges | A 5 ms fade at each end, and the Ogg end trimmed to the last real sample | No clicks, and every join falls on silence |
| Word timings | A small JSON file beside the clip | The timeline reads them |

## The audio store

```
~/.agentks/audio/
  <beat key>.opus      a clip
  <beat key>.json      its length and word timings
  <stream key>.opus    a joined stream
```

| Key | Is the BLAKE3 hash of |
|---|---|
| Beat key | The beat's text with whitespace collapsed, the pronunciation entries that apply to it, the voice, the model id and the helper's version |
| Stream key | The list of the video's beat keys with their start times |

The beat key holds everything that decides the sound, and nothing else. The video's `rate` is left out, so a speed change regenerates nothing.

- **Machine-wide, not per project.** A clip made for one project is right for any other. A second clone, a renamed folder or another branch reuses every clip.
- **Outside the engine version.** Audio does not change when the engine does, so an upgrade regenerates nothing.
- **Never in git, and never in a project's build cache.** It lives only in `~/.agentks/audio/` and in a build's output.
- **Cleaned only by hand.** `agentks cache clean` keeps the clips and streams that the videos in the scanned projects use, and removes the rest after a yes ([cleanup and metrics](../20_caching/35_cleanup-and-metrics.md)). A removed clip is made again when it is next needed. A stream is rebuilt from its clips whenever it is missing.

## Joining clips

The join lives in `agentks-ogg-opus`, the crate the helper also uses to write clips. It copies each clip's Opus packets into one stream and never decodes or re-encodes. So quality never drops, and the engine links no audio codec.

1. **Times are in 48 kHz samples,** the unit Ogg Opus uses for positions, whatever the input rate.
2. **Each clip is placed one pre-skip early.** An Opus stream begins with a few milliseconds of encoder priming. The join starts each clip's packets that much early, so its first real sample lands exactly on its start time.
3. **Gaps are filled with silence.** Pauses, transitions and slide tails are filled with fixed silent packets of 20 ms, then 2.5 ms. So every clip lands on a 2.5 ms grid.
4. **The join returns the real starts.** Each clip's actual start, after rounding down to the grid, goes back to the timeline, which uses it instead of the requested time.
5. **Pages end after about a second of audio,** because browsers seek in Ogg by bisecting pages.

The join refuses what it cannot do exactly. A clip that would start before the previous one ends is an error, and so is a total length shorter than the last clip's audio. A stream is about 150 to 160 KB a minute.

No stream is built until every beat has a clip. Until then, the video plays with the browser voice.

## When audio is made

1. **When a video is opened** in the app or on the standalone page, if the helper is installed. The server queues the beats that have no clip, first slide first. The page shows progress, such as "Generating voice: 12 of 27 beats", and offers to play at once with the browser voice. When the last clip lands, the video crate joins the stream, the page's hash changes, and the server pushes it. A player that is not playing switches to the generated voice.
2. **On request.** `agentks video voice <video>`, or `--all`, generates every missing clip and prints progress and the total size. It is for CI, or before going offline.
3. **In `agentks build`,** for any beat still without a clip, when the helper is installed ([serving and publishing](./60_serving-and-publishing.md)).

A 3-minute video's first generation takes a minute or more on a fast desktop CPU. An edited beat takes a second or two.

## In CI

A CI job that builds a site with videos caches three folders between runs: `~/.agentks/audio/`, `~/.agentks/tools/agentks-voice/` and `~/.agentks/models/`, keyed by the helper's version. A deploy then generates only the beats that changed. Without the cache, every build downloads the helper and the model and generates every clip.

## Related

- [The voice helper](./50_the-voice-helper.md): how a clip is made.
- [The timeline](./30_the-timeline.md): how the real starts become times.
- [Caching](../20_caching/01_overview.md): the other stores on the machine.
