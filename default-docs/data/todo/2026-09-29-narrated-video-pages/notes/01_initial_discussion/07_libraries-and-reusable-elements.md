---
title: "Libraries and reusable elements"
---

Videos draw their building blocks from **libraries**, which are shared engine machinery tracked in the migration issue: [libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md). A project lists them in `config/dep.yaml`: GitHub repositories, pinned and cached under `~/.agentks/`, or local folders in the project. Each library's manifest describes its elements; agentks does not sort them into kinds. The video widgets themselves are built into the binary. This note covers only what video adds on top: widgets, scene templates and custom video logic.

# 03 References

- [Libraries, dep.yaml and dep.lock](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md) — sources, pinning, the cache, manifests, how pages name elements.
- [A proper video engine](./04_video-engine.md) — the widget set and the cues.
- [Caching](./06_caching.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-30): library elements are used only in video pages and artifact pages, never in ordinary markdown, so content stays portable to other note apps.

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the engine; projects can define reusable elements that carry custom video logic. The full decisions are in [libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md).

# 05 Notes & Analysis

## 01 What video adds to the library

| Block | Source | Example |
|---|---|---|
| Widgets | built into the binary | file tree, flow, browser frame, phone frame, chart |
| Scene templates | any library whose manifest offers them | a request-flow scene, a before-and-after scene |
| Icons for scenes | any library whose manifest offers them | server, database, browser, framework logos |
| Custom video logic | a local library in the project | a widget of the team's own, as a script element |

The categories above are how a video uses elements, not kinds agentks enforces. A library's manifest decides what it offers.

## 02 How a video refers to a block (claude, proposed)

A scene names a block **inside a cue**, as `alias:element`, for example `<!-- panel: icons:server -->`. The alias from `dep.yaml` says which library. A video never uses a path, which keeps scripts short.

**Never in the prose.** Library names appear only in cues, which other markdown apps hide (HTML comments) or show as code (a fenced block). The narration paragraphs stay plain markdown, so a video page still reads as a clean transcript in Obsidian or any other note app. This follows the decision that markdown carries no library syntax ([libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md), section 06).

## 03 Custom video logic (claude, proposed)

A project's custom widget is a script element that follows the same contract as the built-in widgets: it receives its cue and its panel, and it animates only inside that panel. It runs in an iframe like any artifact, so it cannot reach the player around it.
