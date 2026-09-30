---
title: "Relation to the engine migration"
---

The video work is built in the new repositories, beside the migration, and does not block the migration's 1.0.0. Nothing is built in today's Astro engine, so nothing is built twice. The **player** is browser code in its own package, `apps/packages/agentks-video`, which a video island wraps. The **compiler** is a Rust crate in the engine. The **voice** runs in a separate helper, `agentks-voice`. Audio, the voice model and library downloads live in the `~/.agentks` machine home the migration defines. The full fit is [how it fits the new architecture](../../brainstorm/01_video-artifact-engine/09_architecture-fit.md).

# 03 References

- [2026-09-29-rust-core-engine-migration](../../../2026-09-29-rust-core-engine-migration/issue.md)
- [The migration's architecture note](../../../2026-09-29-rust-core-engine-migration/notes/01_overview/03_architecture.md)
- [How it fits the new architecture](../../brainstorm/01_video-artifact-engine/09_architecture-fit.md)

# 04 Decisions

- Decided (claude, 2026-10-01): video work does not block the migration's 1.0.0, and nothing is built in today's Astro engine, because the player, compiler and voice all belong in the new repositories and building them twice wastes work.

# 05 Notes & Analysis

## 01 What lives where

| Part | Side |
|---|---|
| Compiling a video (one `.video.yaml` file or a video folder, read by one loader): checks, library resolution, templates, the timeline | Rust, the video compiler crate. It sends the video as `VideoData`, like every other page kind |
| The player, stage, layout, item kinds, motion | Frontend, the `apps/packages/agentks-video` package, wrapped by an island in the shared UI package, so the local app, the standalone page and a published site use the same code |
| Browser voice | Frontend |
| Generated audio, the voice model, word timings | The `agentks-voice` helper, driven by Rust; clips in `~/.agentks/audio/` |
| Library downloads (git, pinned by commit), component lookup | Rust |
| Unknown-name, anchor and pronunciation checks | Rust, shared with the CLI (`agentks check video`) |
| A published video | `agentks build` writes the page and transcript as HTML, the standalone page, and each video's audio stream; the player is an island, the only part that ships JavaScript |

Rust compiles and the frontend only plays, which matches the migration's rule that the frontend holds no rules. The player alone measures real text, so it reports layout problems as diagnostics.

## 02 What can start now

The two spikes, in the new main repository: the player spike and the voice spike. The library restructure runs beside them, before the library's first tag. See [the build plan](../../plans/01_video-build/overview.md).

## 03 What waits

- The compiler waits for the core's config loading and site index.
- Video pages in the app wait for the client and its islands.
- Publishing waits for `agentks build`.
