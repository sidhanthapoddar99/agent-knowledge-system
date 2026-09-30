---
title: "Caching"
---

Everything a video needs beyond its own files (one `.video.yaml` file or a video folder) and their `assets/` is **derived or downloaded, so it is cached, never committed**: generated narration audio, the voice helper and its model, and the libraries a project declares. All of it lives under `~/.agentks/`, the machine home the engine migration introduces, and can be deleted and rebuilt at any time. Audio has its own machine-wide store, `~/.agentks/audio/`, outside the build cache, because a clip is keyed by its content and is right for every project ([the voiceover](../../brainstorm/01_video-artifact-engine/07_voiceover.md#08-the-store)).

# 03 References

- [The ~/.agentks home and build cache](../../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md)
- [The machine home and build cache](../../../2026-09-29-rust-core-engine-migration/notes/02_engine/06_machine-home-and-build-cache.md)
- [The voiceover's store](../../brainstorm/01_video-artifact-engine/07_voiceover.md#08-the-store)
- [Narration audio](./05_narration-audio.md)
- [Libraries and reusable elements](./07_libraries-and-reusable-elements.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): video assets are cached, not packaged and not committed.
- Decided (sidhantha, 2026-09-29): libraries are stored in the cache after download.
- Decided (sidhantha, 2026-09-30): nothing is cleaned up automatically; cleanup is a command the user starts ([the home note](../../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md)).
- Decided (claude, 2026-10-01): audio lives in a machine-wide store, `~/.agentks/audio/`, not in a project's build cache, because a clip is keyed by everything that decides its sound, so it is right for every project and every engine version.

# 05 Notes & Analysis

## 01 What is cached, and where

```
~/.agentks/
  tools/agentks-voice/<version>/                  the voice helper, installed on request
  models/kokoro-82m-v1.0-timestamped-q8/          the model and its voices/, once per machine
  libraries/<host>/<repository path>/<commit>/    libraries, shared by projects
  audio/
    <beat key>.opus      one clip per beat
    <beat key>.json      its duration and word timings
    <stream key>.opus    a video's joined stream, rebuilt from clips whenever it is missing
```

## 02 Keys

- **A beat's clip:** the BLAKE3 hash of the beat's text (whitespace collapsed), the pronunciation entries that apply to it, the voice, the model id and the helper's version. The playback rate is left out, because it is applied at playback. Editing one beat invalidates one clip; changing the voice regenerates the video's clips.
- **A joined stream:** the hash of the list of beat keys and their start times.
- **Machine-wide, not per project.** A second clone, a renamed folder or a branch checkout reuses every clip. Audio does not change with the engine version, so an engine upgrade regenerates nothing.
- **Libraries:** repository and commit, as pinned in each project's `config/dep.lock`. Two projects pinned to different commits keep both.

## 03 Cleanup

Nothing is removed automatically. `agentks cache clean <root>` scans the folders the user names for agentks projects. It removes library commits none of them pins, build caches whose project is gone, and audio clips and streams that no video in the scanned projects still uses, after showing a report ([the home note](../../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md)). A removed clip is generated again the next time it is needed.

## 04 In CI

A CI build with videos caches `~/.agentks/audio/`, `~/.agentks/tools/agentks-voice/` and `~/.agentks/models/`, keyed by the helper version, so a deploy generates only the beats that changed.
