---
title: "Open questions"
---

What to settle before the video work is split into subtasks. Each gets a decision line here when answered.

# 03 References

- [Index](./01_index.md)

# 04 Decisions

None yet.

# 05 Notes & Analysis

## 01 Build the second spike now?

The grid, cues, motion style and four widgets, remaking the tour's request-flow scene ([engine](./04_video-engine.md)). Claude recommends it before building the full library.

## 02 Where do project elements live?

The user's working path is `config/artifacts/`. Alternatives: a `library/` folder under `config/`, or a top-level folder beside the content sections. Config today holds settings, not content; reusable elements are content. See [libraries](./07_libraries-and-reusable-elements.md).

## 03 How are preset libraries hosted and trusted?

GitHub Releases of this repository, a separate repository, or another static host. Who publishes them, how they are versioned alongside the engine, and whether checksums or signatures are required.

## 04 Which voice model?

Kokoro is the first candidate. Size, quality, languages and licence need checking before it is chosen.

## 05 The cue syntax

HTML comments (`<!-- flow: a -> b -->`), a fenced `scene` block, or both. Whichever it is, it must read well on disk and cost few tokens.

## 06 Do the widgets use a UI framework?

The spike is plain TypeScript and SVG. The migration's open question on the frontend's UI framework decides what widgets are written in after the migration.

## 07 Is the reusable library only for video?

Claude suggests no: docs pages and issues could reuse the same elements ([libraries](./07_libraries-and-reusable-elements.md)).
