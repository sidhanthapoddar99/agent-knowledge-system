---
title: "Caching"
---

Everything a video needs beyond its markdown is **derived or downloaded, so it is cached, never committed**: generated narration audio, the voice model, and the libraries a project declares. All of it lives under `~/.agentks/`, next to the build cache the engine migration introduces, and can be deleted and rebuilt at any time.

# 03 References

- [The ~/.agentks home and build cache](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/07_agentks-home-and-build-cache.md)
- [Narration audio](./05_narration-audio.md)
- [Libraries and reusable elements](./07_libraries-and-reusable-elements.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): video assets are cached, not packaged and not committed.
- Decided (sidhantha, 2026-09-29): libraries are stored in the cache after download.
- Decided (sidhantha, 2026-09-30): nothing is cleaned up automatically; cleanup is a command the user starts ([the home note](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/07_agentks-home-and-build-cache.md)).

# 05 Notes & Analysis

## 01 What is cached, and where (claude, proposed layout)

```
~/.agentks/
  models/<model>-<version>/                  downloaded once per machine
  libraries/<host>/<repository path>/<commit>/    libraries, shared by projects
  build-cache/<project hash>/
    audio/<hash of text + voice + model>.opus   one clip per paragraph
```

## 02 Keys

- **Audio:** the hash of the paragraph's text, the voice and the model version. Editing one paragraph invalidates one clip; changing the voice regenerates everything.
- **Libraries:** repository and commit, as pinned in each project's `config/dep.lock`. Two projects pinned to different commits keep both.

## 03 Cleanup

Nothing is removed automatically. `agentks cache clean <root>` scans the folders the user names for agentks projects and removes library commits none of them pins and build caches whose project is gone, after showing a report ([the home note](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/07_agentks-home-and-build-cache.md)). Generated audio lives in a project's build cache, so it goes with it. A removed clip is regenerated the next time the video plays.

## 04 Before the migration

Until the Rust engine exists, the current engine can keep generated audio in a git-ignored folder in the project, and move to `~/.agentks/` with the migration.
