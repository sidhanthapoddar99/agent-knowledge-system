---
title: 'Wave 2: the compiler, the component set and rich motion'
status: in-progress
outcome: The example compiles in Rust, in both its forms, to the data the player plays, the default library ships the day-one set, and the rich kinds and motion play seekably
subtasks:
- '[T3 Format and compiler — the Rust crate reads a video file or folder and emits VideoData](../../subtasks/040_format-and-compiler.md)'
- '[T4b Video component set — the default library ships the day-one components](../../subtasks/050_video-component-set.md)'
- '[T5 Rich kinds and motion — charts, stats, trees, tables, annotations, send, focus and morph](../../subtasks/060_rich-kinds-and-motion.md)'
---

The three tracks that need only the spikes' contracts. T1 fixes the component contracts first, so T4b builds against them. The compiler also needs the migration's config loader with node positions and its folder settings reader.

# 01 To Do
- [x] Start T4b and T5 (2026-10-01).
- [ ] Start T3.

# 02 Status and Result
Running. T5 and T4b are being built now, against the contracts T1 fixed. T3 has not started, and it can start now. It waited for the folder form, which is settled (decisions 41 to 52 in [the design index](../../brainstorm/01_video-artifact-engine/01_index.md#the-folder-form)): one loader reads two forms, a single `.video.yaml` file and a video folder. The engine's config crate (030/30) already reads YAML with `saphyr-parser`, which keeps the line of every node; T3 needs the column as well.

# 03 References
- [030/30 Config loader and settings schema](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md) — the YAML parser T3 uses.
- [020/50 Ordering, settings and frontmatter](../../../2026-09-29-rust-core-engine-migration/subtasks/020_content-contract/50_ordering-settings-frontmatter.md) — the folder settings reader T3's loader uses for a video folder.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## 01 Why these three together
None of them needs another's output: the compiler needs `VideoData`, the component set needs the contracts, and rich motion needs the player. All three come from stage 10.
