---
title: "Libraries and reusable elements"
---

Videos draw their looks from **libraries**, which are shared engine machinery tracked in the migration issue: [libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md). A project lists them in `config/dep.yaml`: GitHub repositories, pinned and cached under `~/.agentks/`, or local folders in the project. Every library keeps its components in `components/<category>/`, with fifteen fixed categories, and each manifest entry names its `category`. **The player holds the mechanics; libraries hold the looks** ([who owns what](../../brainstorm/01_video-artifact-engine/08_library-components.md#01-who-owns-what)). This note covers only what video takes from libraries.

# 03 References

- [Libraries, dep.yaml and dep.lock](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md) — sources, pinning, the cache, manifests, how pages name elements.
- [Library components](../../brainstorm/01_video-artifact-engine/08_library-components.md) — the categories, the manifest's `category`, each category's contract, the day-one set.
- [A proper video engine](./04_video-engine.md) — the user's requirements.
- [Caching](./06_caching.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-30): library elements are used only in video artifacts and HTML artifacts, never in ordinary markdown, so content stays portable to other note apps.

- Decided (sidhantha, 2026-09-29): libraries are downloaded and cached, never packaged with the engine; projects can define reusable elements that carry custom video logic. The full decisions are in [libraries](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/09_libraries-and-dependencies.md).

# 05 Notes & Analysis

## 01 Who owns what

| The player owns (built in, bare names) | Libraries own (`alias:name`) |
|---|---|
| The stage, the grid and the layout engine | Layouts beyond the nine built in |
| The twelve item kinds and how each draws | Frames, icons, illustrations, images, backgrounds, annotations |
| The chart marks | Chart templates |
| The animation runner and a minimal preset pack | Most presets and transitions |
| A plain default style | Styles |
| Slide building from items | Slide templates with slots |

A project that removes every library still plays its videos with the built-in set. The full split and the fifteen categories are in [library components](../../brainstorm/01_video-artifact-engine/08_library-components.md).

## 02 How a video names a component

A video names a component in a **typed field** of the `.video.yaml` file, as `alias:name`: `frame: ks:phone-frame`, `icon: ks:server`, `in: ks:dissolve`. The field gives the category, so no path is needed, and the alias from `dep.yaml` says which library. A bare name is a player built-in. Markdown never names a library component.

## 03 How the engine uses them

Most video components are data (JSON) or SVG. The Rust compiler reads the ones a video uses, checks them against their category's contract and inlines them into the compiled video, so a video plays with no extra requests and no library code runs. Inlined SVG passes an allowlist first. Images load from `/_lib/`. Code components (`scripts`) have a contract but wait for a later version; when they come, they run sandboxed and are driven by `seek` messages.
