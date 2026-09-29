---
title: "Open questions"
---

What to settle before the video work is split into subtasks. Each gets a decision line here when answered.

# 03 References

- [Index](./01_index.md)
- [The artifact library's open points](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/09_artifact-library.md) — where project elements live, and how preset libraries are hosted and trusted.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the reusable library is not video-only. It is shared engine machinery, tracked in [the artifact library](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/09_artifact-library.md), and its open points moved there.

# 05 Notes & Analysis

## 01 Build the second spike now?

The grid, cues, motion style and four widgets, remaking the tour's request-flow scene ([engine](./04_video-engine.md)). Claude recommends it before building the full library.

## 02 Which voice model?

Kokoro is the first candidate. Size, quality, languages and licence need checking before it is chosen.

## 03 The cue syntax

HTML comments (`<!-- flow: a -> b -->`), a fenced `scene` block, or both. Whichever it is, it must read well on disk and cost few tokens.

## 04 Do the widgets use a UI framework?

The spike is plain TypeScript and SVG. The migration's open question on the frontend's UI framework decides what widgets are written in after the migration.
