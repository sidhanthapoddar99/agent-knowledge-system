---
title: "Where the code lives"
description: "The video crate's place in the engine's crate layers, the player package, and the voice helper's own Cargo workspace."
---

The video engine is spread over three places: a crate in the engine workspace, a TypeScript package, and a separate Rust program. This page says what sits where and why, and which dependencies each part may take. Read it before you add a dependency to any of them.

## The video crate in the layers

The video crate lives in `apps/agentks-engine/crates/video/`. Its package name is `agentks-video-compiler`, not `agentks-video`, so it is never confused with the player package. It is the one crate whose package name does not follow the `agentks-<folder>` rule.

It sits in layer 4, beside `agentks-render`:

```toml
# apps/agentks-engine/crates/LAYERS.toml (excerpt)
agentks-render = 4
agentks-video-compiler = 4
agentks-site = 5
```

| It depends on | For |
|---|---|
| `agentks-core` (layer 0) | Paths, hashes, the error record, and the machine home layout, which names `~/.agentks/audio/` |
| `agentks-config` (1) | The loaded project, and `config/video.yaml` with the project's voice and pronunciation list |
| `agentks-cache` (1) | Atomic writes and path checks for the audio store, the same file primitives every other store uses |
| `agentks-api` (1) | The `VideoData` types, which live with every other page shape |
| `agentks-content` (2) | The folder settings reader, which recognises `"kind": "video"`, and file access through `FileSource` |
| `agentks-library` (2) | The resolver behind `alias:name`, which also reads a video folder's own `components/` as the library `self` |
| `agentks-ogg-opus` | Joining clips into one stream. It lives in the voice helper's workspace (below) |

**Why the highlighter comes through a trait.** A code item is highlighted by the same highlighter as a markdown page, so the two can never disagree. That highlighter lives in `agentks-render`, and two crates in one layer may not depend on each other. So the video crate states what it needs as a small highlighting trait, and `agentks-site` passes in render's highlighter. It is the same pattern as `LinkResolver`, described in [crate layers](../10_engine/05_crate-layers.md).

**Who calls it.** `agentks-site` calls the video crate when a request needs a video page, so the server and the CLI reach videos through one path. The CLI's `check video`, `video info`, `video preview`, `video schema` and `video voice` call the same functions. `agentks move` asks the video crate for the relative paths inside a single-file video, so moving a file and compiling it read the format the same way.

**What does not call it.** The site index needs nothing from the video crate. It knows a video from its name, `NN_*.video.yaml`, or from its folder's settings file. So `agentks-index` stays in layer 3.

## The player package

`apps/packages/agentks-video/` is TypeScript with no runtime dependencies and no UI framework. It builds with Vite.

```
apps/packages/agentks-video/
  src/
    index.ts        mountVideo(): the public entry
    standalone.ts   the standalone page's entry: start() and readData()
    data.ts         the VideoData types, generated from the engine's schema
    builtin/        pack.json: the built-in style, layouts, presets and transitions
    model/          the grid, name lookup, SVG ids, timeline lookups
    draw/           the stage, layout, one module per item kind, diagnostics
    motion/         presets to Web Animations, transitions, the camera
    ui/             the player, controls, the browser voice, the review sheet
  dev/              a harness page that plays fixture data (development only)
  scripts/size.ts   the size gate
  test/             unit tests
```

Two callers load it. The `video-player` island in `agentks-ui` wraps it in about 30 lines that call `mountVideo` and `destroy`. The standalone page loads its `standalone` entry directly. The package sits in `apps/packages/` because two apps share it, and an app never imports from another app.

## The voice helper's workspace

`apps/agentks-voice/` is its own Cargo workspace, outside the engine's.

| Crate | Folder | Owns |
|---|---|---|
| `agentks-ogg-opus` | `crates/ogg-opus/` | Reading and writing mono Ogg Opus, and joining clips by copying packets. Pure Rust over the `ogg` crate, with no codec |
| `agentks-voice` | `crates/voice/` | The helper binary: pronunciation, the Kokoro model through ONNX Runtime, loudness, fades, Opus encoding and the wire format |

**Why a separate workspace.** The helper links ONNX Runtime and libopus. In its own workspace, the engine's gate never compiles them, and the main binary never contains them. `ctl build voice`, `ctl test voice` and `ctl gate lint voice` run only when named, so the helper stays out of `ctl gate` ([ctl and the gate](../55_contributing/10_ctl-and-the-gate.md)).

**Why the join crate is shared.** The helper writes clips with `agentks-ogg-opus`, and the video crate joins them with it. One crate on both sides means the clip format and the join cannot drift apart. It links no codec, so depending on it adds no audio codec to the engine.

## On the user's machine

| Folder | Holds |
|---|---|
| `~/.agentks/tools/agentks-voice/<version>/` | The helper binary for one agentks version |
| `~/.agentks/models/kokoro-82m-v1.0-timestamped-q8/` | The voice model and its voices |
| `~/.agentks/audio/` | Clips, word timings and joined streams, shared by every project |

`agentks voice install` fills the first two. The video crate and the helper fill the third. [Clips, streams and the audio store](./55_clips-streams-and-the-store.md) explains the store.

## Related

- [The engine](../10_engine/01_overview.md): every crate and its layer.
- [Repositories and apps](../05_overview/05_repositories-and-apps.md): what each app folder owns.
- [The voice helper](./50_the-voice-helper.md): the helper binary in detail.
