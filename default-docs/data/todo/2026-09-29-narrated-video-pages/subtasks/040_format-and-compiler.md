---
title: T3 Format and compiler — the Rust crate reads a video file or folder and emits VideoData
status: open
---

Rust owns every value that could be wrong, so a video, one file or a folder, must be loaded, parsed, checked, resolved and timed in the engine before anything plays. This track builds the video compiler crate and the check and inspection commands that every later track calls.

# 01 To Do
- [ ] **The final JSON Schema**: one document with three entries (the root for a single `.video.yaml` file, `#/$defs/controller`, `#/$defs/scene`), built from shared `header` and `slide` definitions, from the draft in the format note, fixed against the `VideoData` shape the player spike settles.
- [ ] **The crate** `apps/agentks-engine/crates/video`, package `agentks-video-compiler`, above the core, using the render crate's highlighter and the libraries crate's resolver.
    - [ ] **One loader for both forms**: a `.video.yaml` file; or a folder whose `settings.json` says `"kind": "video"` (read by the shared folder-settings reader of [020/50](../../2026-09-29-rust-core-engine-migration/subtasks/020_content-contract/50_ordering-settings-frontmatter.md)), its `controller.yaml`, its `NN_<slug>.yaml` scenes in prefix order with the slug as slide id, and `components/` mounted as the manifest-less library `self` through the libraries crate's resolver. Every node keeps its file, line and column. The loader is the only code that knows the form.
    - [ ] Parse with the line and column of every node, with `saphyr-parser`, the YAML parser [030/30](../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md) uses.
    - [ ] Layer 1: the schema check with `jsonschema` (draft 2020-12), each failure mapped to the error record with line, column and path. Never print raw validator output.
    - [ ] Layer 2: the meaning checks and warnings in the format note's tables (`video-unknown-item`, `video-anchor-missing`, `library-unknown-element` and the rest). The folder checks: `video-no-controller`, `video-no-scenes`, `video-unknown-file`, `video-duplicate-prefix`, `video-duplicate-id`, `video-asset-outside`; `video-morph-unmatched` in both forms; `self:` in a single file as `library-unknown-alias`. The warnings: `video-file-size` per file (4 KB for a single file, 2 KB for a scene or the controller) and `video-long-video` past 600 words of narration. The error record's `file` is the file to change, and its path starts inside that file.
    - [ ] The built-in pack: the nine layouts, the minimal presets and transitions, the plain default style, under bare names.
    - [ ] Resolve `alias:name` by field category through the library resolver; bare names to the built-in pack; `./assets/…` to files on disk.
    - [ ] The SVG allowlist: parse, write back only allowed elements and attributes, reject `<style>`, animation elements, links and outside references, prefix every id per use.
    - [ ] Slide template expansion and style defaults.
    - [ ] Header `in:` and `bg:`: the slide's value wins, then the template's (`bg` only), then the header's, then the style's.
    - [ ] The pronunciation list: `pronounce:` from `config/video.yaml` and the video, the entries that apply to each beat.
    - [ ] The timeline: every beat, whole-word anchor (`@word`, `#2` for a repeat), percentage and offset, from the estimate until clips exist.
    - [ ] `VideoData` as a serde struct; its JSON Schema through `schemars` generates the player's TypeScript types.
- [ ] **The CLI:** `agentks check video [path]` on a file, a folder or any file inside one (on a scene file: that scene's and the controller's errors in full and a count of the rest; exit 1 when the video has any error), `agentks video info <video> [--slide n]` (a scene file shows that scene), `agentks video schema [--component <category>]`, each with `--json`.

## Guardrails
- Rust compiles; the player lays out. The compiler never estimates text size or overlap, because only the browser knows the real font.
- When the compiler cannot be sure (an anchor that matches no whole word, an unknown name), it returns an error, never a guess.
- A video's files are data. Nothing in them is ever run.
- Until Phase 2's libraries exist, tests pass a library folder through the same resolver interface. No second code path.
- Tests for this track run in under 10 seconds.

## Done when
- [The 3-minute example folder](../brainstorm/01_video-artifact-engine/assets/example-video/) compiles to `VideoData` that the player spike plays unchanged. Its single-file copy (the spike fixture `tour.video.yaml`) compiles to the same `VideoData` apart from `source`, slide ids and source positions, with one `video-file-size` warning.
- A broken copy of the example gives each listed error with the right line, column and help.
- A broken copy of the folder gives each folder error with the scene file's name, line and column, and `check video` on one scene prints only that scene's and the controller's errors.
- `agentks check video`, `video info` and `video schema` work with and without `--json`.
- The player's TypeScript types are generated from the schema, not written by hand.

# 02 Status and Result
Not started. T1 settled the `VideoData` shape and was merged on 2026-10-01. The folder form is designed (decisions 41 to 52 in [the design index](../brainstorm/01_video-artifact-engine/01_index.md#the-folder-form)). It can start. The engine's config crate (030/30) already reads YAML with `saphyr-parser`, which keeps the line of every node; this track needs the column as well.

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
- [020/50 Ordering, settings and frontmatter](../../2026-09-29-rust-core-engine-migration/subtasks/020_content-contract/50_ordering-settings-frontmatter.md) — the folder settings reader.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- The render hash of a video page covers the video's files (every file of a folder), every component it uses, every image, its style, the engine version and each beat's audio state.
