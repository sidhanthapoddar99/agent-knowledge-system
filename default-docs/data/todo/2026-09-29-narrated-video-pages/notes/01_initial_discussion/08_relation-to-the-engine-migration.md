---
title: "Relation to the engine migration"
---

The video work does not have to wait for the Rust migration. The **player, scenes and widgets are browser code**: they are built in the current engine now and move into the new Vite frontend unchanged. The **heavy, machine-level parts** — generated audio, the voice model, library downloads and the `~/.agentks` cache — fit the Rust side and land with or after the migration's Phase 1.

# 03 References

- [2026-09-29-rust-core-engine-migration](../../../2026-09-29-rust-core-engine-migration/issue.md)
- [The migration's architecture note](../../../2026-09-29-rust-core-engine-migration/brainstorm/01_initial-discussion/17_local-spa-over-websocket.md)

# 04 Decisions

None yet.

# 05 Notes & Analysis

## 01 What lives where after the migration

| Part | Side |
|---|---|
| Reading the markdown into scenes, beats and cues | Rust. It sends the video as data, like every other page |
| The player, stage, widgets, motion | Frontend, in the shared UI package, so the local app and a published site use the same code |
| Browser voice | Frontend |
| Generated audio, voice model, word timings | Rust |
| Library downloads (git, pinned by commit), element lookup | Rust |
| Unknown-name and cue checks | Rust, shared with the CLI |
| A published video page | `agentks build` writes the page and transcript as HTML; the player is an island, the only part that ships JavaScript |

In the spike the browser reads the scenes from the rendered page. After the migration, Rust reads them and the frontend only plays, which matches the migration's rule that the frontend holds no rules.

## 02 What can start now

- The second spike (grid, cues, first widgets) on the current engine.
- The widget contract and the motion style.

## 03 What waits

- Generated audio and its cache, the library downloader and `~/.agentks/`: the migration defines that home. Building them twice would waste work.
