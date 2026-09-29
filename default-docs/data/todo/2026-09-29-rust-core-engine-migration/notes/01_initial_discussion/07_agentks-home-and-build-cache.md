---
title: "The ~/.agentks home and the build cache"
---

Machine-wide state moves to **`~/.agentks/`**: global settings, other config, and a build cache kept per project. The engine either renders content on the fly or caches it per project folder. Cache folders unused for 15 days are deleted by a small check that runs when agentks starts.

# 03 References

- [Why and the prior audit](./02_why-and-prior-audit.md) — the audit found a warm restart re-derives everything in 7.8 ms, so the cache must stay simple.
- [Video and narration audio](./14_video-and-narration-audio.md) — generated audio lives in this cache.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the layout of `~/.agentks/` below, with a 15-day inactivity cleanup.
- Decided (sidhantha, 2026-09-29): the hybrid — an index of the whole site built at start-up, pages rendered on request and cached where it pays.

# 05 Notes & Analysis

## 01 Layout

```
~/.agentks/
  settings.json          global settings
  other-config.json      other machine-wide config
  build-cache.json       metadata about the build cache: entries, last use, sizes
  build-cache/           cleared after 15 days of inactivity
    <hash of the config path>/
      ...                one project's cached output
```

## 02 Cleanup

When agentks starts, a small check reads `build-cache.json`. It deletes every project cache whose last use is older than 15 days, and records the new last-use time for the current project.

## 03 Proposed additions (claude, not yet agreed)

- **Put the engine version in the cache key**, not only the config path hash. Two engine versions render different output, and with mise pinning ([versioning](./12_versioning-and-forced-migrations.md)) both can run on one machine.
- A moved project gets a new hash and a cold cache. That is fine; the old entry expires after 15 days.
- The prior audit's advice holds: cache what is expensive (git-derived dates, narration audio, highlighted code), and re-derive the rest.

## 04 Render on the fly or cache

The user named both options: "live translation" of the data, or a cache per folder. **Decided:** the hybrid. Rust builds an index of the whole site at start-up, renders a page's data when the frontend asks for it, and caches it by content hash. The frontend caches the same data in the browser, versioned by the same hashes ([the architecture note](./17_local-spa-over-websocket.md)). The index's data structure is still [open question 07](./16_open-questions.md): claude proposes an ordered map keyed by path, with Merkle-style content hashes rolled up through folders.
