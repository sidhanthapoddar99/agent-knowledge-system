---
title: "What exists today"
---

**Short answer: one working spike, a lot of notes, and no generated media anywhere.** The spike plays a markdown page as a narrated slideshow with the browser's own voice. Nothing renders a video file, and nothing generates audio. The notes planned a richer version of the same markdown design. The user's direction of 2026-09-30 replaces that design: a video becomes its own artifact file, lean, library-driven and played live.

## What is built

### The spike on branch `spike/narrated-video`

Commit `8874d1f`, on top of `main`. About 1,100 added lines across 12 files, of which about 900 are player code. Details are in [the spike note](../../notes/01_initial_discussion/03_the-spike.md).

| Part | What it does |
|---|---|
| Format | A markdown page with `video: true`. Each `##` heading is a scene. Each paragraph is one spoken beat. **Bold** words focus the matching part of the scene's visual |
| Visuals | One at a time: a mermaid or graphviz diagram, a code block, a list, a table or an image, taken from the rendered page |
| Motion | Dim everything except the focused parts, and ease a "camera" in on them. Lists and tables reveal items as they are named |
| Voice | The browser's Web Speech API, one sentence at a time. A silent timed fallback when no voice exists |
| Timing | Estimated from word counts at 160 words per minute. Seeking works by scene, not inside a beat |
| Demo | A five-minute architecture tour, 6.3 KB of markdown |

The spike proved the cheap part: a few KB of text can drive minutes of explanation. It also showed the limits the user called "too basic": one visual at a time, focus as the only motion, and a voice that sounds robotic on Linux Firefox.

### How video and audio are generated today

- **Video:** nothing is generated. The browser builds the scenes from the rendered page and plays them. There is no renderer, no MP4, and no cache.
- **Audio:** nothing is generated either. The spike speaks through `speechSynthesis`. The voice is whatever the reader's browser and operating system provide: decent in Chrome and Edge, robotic in Firefox on Linux (espeak-ng).
- **Word timings:** none. Durations are guessed from word counts.

### Around it

| Place | State on 2026-10-01 |
|---|---|
| Old repository, Astro engine | Artifact pages: self-contained `.html` served at `/artifacts/<path>`, embedded in an iframe, with a `.meta.json` sidecar and `site` or `self` theme modes. They run unsandboxed as first-party code. See the [artifacts skill](../../../../../../plugins/agent-ks/skills/agent-ks-artifacts/SKILL.md) and the [artifact loader](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts) |
| New main repository `NeuraLabsHQ/agent-knowledge-system` | `ctl`, the gate and an engine skeleton with two crates (`core`, `cli`). No frontend yet. mise pins Rust 1.98.1; Bun, Node and Vite join when the first frontend package lands |
| Library repository `NeuraLabsHQ/agent-knowledge-system-library` | Version 0.1.0, untagged, 83 elements: 74 icons in `icons/`, six HTML frames in `frames/`, three HTML widgets in `widgets/`, a check script and a preview page. No `components/` folder yet. Another agent is filling it now |

## What was planned before this design

| Where | What it said |
|---|---|
| [issue.md](../../issue.md) | A video is an ordinary markdown file with cues. Motion graphics are out |
| [The video engine note](../../notes/01_initial_discussion/04_video-engine.md) | Grid scenes, cues in HTML comments (`<!-- flow: a -> b -->`), a widget library built into the engine, morphing between diagram states |
| [Narration audio](../../notes/01_initial_discussion/05_narration-audio.md) | Browser voice first, then Kokoro through ONNX, one Opus clip per paragraph at 48 kbps, word timings |
| [Caching](../../notes/01_initial_discussion/06_caching.md) | Audio in the build cache, keyed by text, voice and model |
| [Libraries](../../notes/01_initial_discussion/07_libraries-and-reusable-elements.md) | Widgets built into the binary; templates, icons and custom logic from libraries, named inside cues |
| Migration note [04/05 video pages](../../../2026-09-29-rust-core-engine-migration/notes/04_ecosystem/05_video-pages.md) | Rust parses scenes, beats and cues; the player is an island in `agentks-ui`; audio under the engine-version level of the build cache |
| Migration subtask [100/40](../../../2026-09-29-rust-core-engine-migration/subtasks/100_layouts/40_video-pages.md) | Open. Video layout and player island; waits for the second spike |
| Migration subtask [120/75](../../../2026-09-29-rust-core-engine-migration/subtasks/120_libraries/75_elements-frames-and-widgets.md) | In review. Six HTML frames and three widgets for artifacts, each a sandboxed iframe |
| Migration subtask [120/80](../../../2026-09-29-rust-core-engine-migration/subtasks/120_libraries/80_elements-video-cue-kit.md) | Open, blocked on the cue syntax. Scene templates and script widgets |
| Migration subtask [030/70](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/70_diagram-and-artifact-sources.md) | Open. A `kind: video` hook on markdown pages |

## Where the old plan and the new direction disagree

| Old plan | New direction (sidhantha, 2026-09-30) |
|---|---|
| A video is a markdown page | A video is an independent artifact. A markdown embed comes later |
| Cues hidden in HTML comments inside prose | The video file is the script. Actions sit beside the narration they belong to |
| Widgets built into the binary; libraries add a few extras | The visual power lives in libraries: frames, icons, charts, slides, presets, transitions, backgrounds, images |
| Library visuals are sandboxed iframes | Iframes cannot be seeked in step with a timeline, and each one costs a document. Video components must be inline and seekable |
| "Not motion graphics" | PowerPoint-level motion is in: entrance, emphasis, exit, simple motion and slide transitions, smooth and good-looking. Film-level keyframing stays out |
| Opus at 48 kbps | Lean matters more: speech at 24 kbps is clear |

## A measurement taken for this design

A throwaway test in headless Chromium (Playwright's headless shell 1243) checked the one claim the whole player rests on: that the Web Animations API can compute any moment from a time value.

- One element with an entrance (`fill: both`), an emphasis (`composite: add`) and an exit (`fill: forwards`), all paused. Setting `currentTime` to 0, 1250, 1600, 2200, 3250 and 4000 ms, then back to 1250 and 0, gave the same computed opacity and transform each time, in any order.
- 600 paused animations on 200 elements: seeking all of them and reading a style took **0.22 ms**.
- A registered `@property --n: <integer>` animated from 0 to 1300 counted up and seeked correctly (492 at 25% with ease-out). That gives seekable number counters with no script per frame.
- `stroke-dashoffset` (line drawing), `clip-path: inset()` (wipes) and a FLIP transform (`translate + scale` to `none`, for morphs) all seeked exactly.

The test lived in `/tmp` and was not kept.
