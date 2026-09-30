---
title: T3 Format and compiler — the Rust crate checks a .video.yaml file and emits VideoData
status: open
---

Rust owns every value that could be wrong, so a video file must be parsed, checked, resolved and timed in the engine before anything plays. This track builds the video compiler crate and the check and inspection commands that every later track calls.

# 01 To Do
- [ ] **The final JSON Schema** for `.video.yaml`, from the draft in the format note, fixed against the `VideoData` shape the player spike settles.
- [ ] **The crate** `apps/agentks-engine/crates/video`, package `agentks-video-compiler`, above the core, using the render crate's highlighter and the libraries crate's resolver.
    - [ ] Parse with the line and column of every node, with the YAML parser [030/30](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md) chooses.
    - [ ] Layer 1: the schema check with `jsonschema` (draft 2020-12), each failure mapped to the error record with line, column and path. Never print raw validator output.
    - [ ] Layer 2: the meaning checks and warnings in the format note's tables (`video.unknown-item`, `video.anchor-missing`, `library.unknown-element`, `video.file-size` and the rest).
    - [ ] The built-in pack: the nine layouts, the minimal presets and transitions, the plain default style, under bare names.
    - [ ] Resolve `alias:name` by field category through the library resolver; bare names to the built-in pack; `./assets/…` to files on disk.
    - [ ] The SVG allowlist: parse, write back only allowed elements and attributes, reject `<style>`, animation elements, links and outside references, prefix every id per use.
    - [ ] Slide template expansion and style defaults.
    - [ ] The pronunciation list: `pronounce:` from `config/video.yaml` and the video, the entries that apply to each beat.
    - [ ] The timeline: every beat, whole-word anchor (`@word`, `#2` for a repeat), percentage and offset, from the estimate until clips exist.
    - [ ] `VideoData` as a serde struct; its JSON Schema through `schemars` generates the player's TypeScript types.
- [ ] **The CLI:** `agentks check video [path]`, `agentks video info <file> [--slide n]`, `agentks video schema [--component <category>]`, each with `--json`.

## Guardrails
- Rust compiles; the player lays out. The compiler never estimates text size or overlap, because only the browser knows the real font.
- When the compiler cannot be sure (an anchor that matches no whole word, an unknown name), it returns an error, never a guess.
- The video file is data. Nothing in it is ever run.
- Until Phase 2's libraries exist, tests pass a library folder through the same resolver interface. No second code path.
- Tests for this track run in under 10 seconds.

## Done when
- The 3-minute example in the format note compiles to `VideoData` that the player spike plays unchanged.
- A broken copy of the example gives each listed error with the right line, column and help.
- `agentks check video`, `video info` and `video schema` work with and without `--json`.
- The player's TypeScript types are generated from the schema, not written by hand.

# 02 Status and Result
Not started. Waits for T1's `VideoData` shape and the parser choice in 030/30.

## Result
Nothing yet.

## Agent log
none

# 03 References
- [The artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md) — the keys, the example, the checks, the error record, the draft schema.
- [Scenes, motion and the timeline](../brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md) — kinds, actions, anchors, how times are computed.
- [How it fits the new architecture](../brainstorm/01_video-artifact-engine/09_architecture-fit.md) — the compiler's steps, the CLI, the page data.
- [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md) — names, the categories, the SVG allowlist.
- [The voiceover](../brainstorm/01_video-artifact-engine/07_voiceover.md) — the pronunciation list.
- [010 T1 Player spike](./010_player-spike.md) — fixes `VideoData`.
- [030/30 Config loader and settings schema](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md) — the YAML parser with node positions.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- The render hash of a video page covers the file, every component it uses, every image, its style, the engine version and each beat's audio state.
