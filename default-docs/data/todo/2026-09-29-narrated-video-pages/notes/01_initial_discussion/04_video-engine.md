---
title: "A proper video engine"
---

The user wants **5–10x richer visuals** than the spike, looking good, but still lightweight, rendered in the frontend, and cheap for an AI to write. Not film-level motion, but real explainers: several panels at once, a phone screen running a demo while the voice explains it, a file tree beside a flow, markdown visibly turning into HTML, packets moving from file to server to browser, charts. **The design that meets this is [the video artifact engine](../../brainstorm/01_video-artifact-engine/01_index.md)**: a small YAML file composes library components, and a framework-free player draws it on a 12 × 6 grid and moves it with the Web Animations API. This note keeps the user's requirements; the design lives there.

# 03 References

- [The spike](./03_the-spike.md)
- [The video artifact engine](../../brainstorm/01_video-artifact-engine/01_index.md) — the design: [the format](../../brainstorm/01_video-artifact-engine/03_artifact-format.md), [scenes and motion](../../brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md), [the layout system](../../brainstorm/01_video-artifact-engine/05_layout-system.md), [the player](../../brainstorm/01_video-artifact-engine/06_player.md), [library components](../../brainstorm/01_video-artifact-engine/08_library-components.md).
- [Libraries and reusable elements](./07_libraries-and-reusable-elements.md) — where frames, icons, charts and templates come from.
- [Narration audio](./05_narration-audio.md) — word timings for actions on a spoken word.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): richer scenes are in: multi-panel grids, artifacts as panels (for example a phone screen), file trees, data-transform views, flows with server and browser icons, browser frames, request flows end to end, and charts — "the general PPT stuff".
- Decided (sidhantha, 2026-09-29): it should look good and stay lightweight, rendered in the frontend, with no stored video.
- Decided (sidhantha, 2026-09-29): not motion graphics.
- Decided (sidhantha, 2026-09-29): React components are acceptable where reusable, but not required.

# 05 Notes & Analysis

## 01 The user's examples

- A demo phone screen, as an artifact, playing an action while the narration explains it.
- A multi-grid layout: while a component in a flow is explained, the file tree shows beside it.
- Showing how markdown is split into frontmatter and content, processed, and what it looks like after each phase.
- A basic browser element showing the rendered result.
- A file read by the server, with icons (server, Astro), to show how the engine and its core work and how a request flows from start to end.
- Analytics charts with explanations.

## 02 How the design answers each example

| Example | In the video artifact engine |
|---|---|
| A phone screen playing a demo | A `frame` item with a library frame such as `ks:phone-frame`; its screen is a layout area that holds an image or code |
| A file tree beside a flow | A two-area layout: a `tree` item in one area, `arrow` and `icon` items in the other |
| Markdown split into frontmatter and body | `code` items per phase, with `morph` between slides so shared items glide |
| A browser showing the result | `ks:browser-frame` with an image from the video's `assets/` |
| A request flowing from file to server to browser | Icons and arrows, with `send` moving a packet along each arrow on a spoken word |
| Analytics charts | A `chart` item fed with `data` through a library chart template, beside `stat` items that count up |
