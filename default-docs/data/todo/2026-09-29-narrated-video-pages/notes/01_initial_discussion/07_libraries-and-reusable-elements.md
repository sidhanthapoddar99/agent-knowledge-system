---
title: "Libraries and reusable elements"
---

Videos draw their building blocks from the **artifact library**, which is shared engine machinery tracked in the migration issue: [the artifact library](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/09_artifact-library.md). It has three sources: built-ins in the binary, preset libraries downloaded and cached under `~/.agentks/`, and the project's own elements in git. This note covers only what video adds on top: widgets, scene templates and custom video logic.

# 03 References

- [The artifact library](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/09_artifact-library.md) — the sources, name lookup, pinning, checksums, the shared downloader, where project elements live.
- [A proper video engine](./04_video-engine.md) — the widget set and the cues.
- [Caching](./06_caching.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): preset libraries are downloaded and cached, never packaged with the engine; projects can define reusable elements that carry custom video logic. The full decisions are in [the artifact library](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/09_artifact-library.md).

# 05 Notes & Analysis

## 01 What video adds to the library

| Block | Source | Example |
|---|---|---|
| Widgets | built-ins | file tree, flow, browser frame, phone frame, chart |
| Scene templates | preset libraries | a request-flow scene, a before-and-after scene |
| Icons for scenes | preset libraries | server, database, browser, framework logos |
| Custom video logic | project elements | a widget of the team's own, as a script element |

## 02 How a video refers to a block (claude, proposed)

A scene names a block the way any page does, for example `widget: server-icon` or `panel: artifact:checkout-flow`. The library resolves the name. A video never uses a path, which keeps scripts short.

## 03 Custom video logic (claude, proposed)

A project's custom widget is a script element that follows the same contract as the built-in widgets: it receives its cue and its panel, and it animates only inside that panel. It runs in an iframe like any artifact, so it cannot reach the player around it.
