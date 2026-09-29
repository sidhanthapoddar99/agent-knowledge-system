---
title: "Caching"
---

Everything a video needs beyond its markdown is **derived or downloaded, so it is cached, never committed**: generated narration audio, the voice model, and preset libraries. All of it lives under `~/.agentks/`, next to the build cache the engine migration introduces, and can be deleted and rebuilt at any time.

# 03 References

- [The ~/.agentks home and build cache](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/07_agentks-home-and-build-cache.md)
- [Narration audio](./05_narration-audio.md)
- [Libraries and reusable elements](./07_libraries-and-reusable-elements.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): video assets are cached, not packaged and not committed.
- Decided (sidhantha, 2026-09-29): preset libraries are stored in the cache after download.

# 05 Notes & Analysis

## 01 What is cached, and where (claude, proposed layout)

```
~/.agentks/
  models/<voice-model>@<version>/           downloaded once per machine
  libraries/<library>@<version>/            downloaded preset libraries, shared by projects
  build-cache/<project hash>/
    audio/<hash of text + voice + model>.opus   one clip per paragraph
```

## 02 Keys

- **Audio:** the hash of the paragraph's text, the voice and the model version. Editing one paragraph invalidates one clip; changing the voice regenerates everything.
- **Libraries:** name and exact version. Two projects pinned to different versions keep both.

## 03 Cleanup

- Project build caches follow the 15-day inactivity rule already decided for `~/.agentks/build-cache/`.
- Models and libraries are shared by projects, so they are removed only when no project has used them for the same period, or by an explicit command.

## 04 Before the migration

Until the Rust engine exists, the current engine can keep generated audio in a git-ignored folder in the project, and move to `~/.agentks/` with the migration.
