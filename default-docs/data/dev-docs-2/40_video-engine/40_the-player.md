---
title: "The player"
description: "The framework-free TypeScript player: why the Web Animations API, its public API, how a slide is built, how a moment is drawn, seeking and the clock."
---

The player is a small TypeScript package, `apps/packages/agentks-video`. It takes `VideoData` and plays it with DOM, CSS and inline SVG, moved only by the browser's Web Animations API (WAAPI). It lays items out, builds one paused animation per effect, and sets them all to the current time. This page explains why it is built that way, its API, and how it draws, seeks and keeps time. Read it before you change anything in the package.

## Why plain TypeScript and WAAPI

**No UI framework.** The player runs in three places: a Preact island in the app, a published page, and a standalone page with nothing else loaded. Plain TypeScript runs in all three at the smallest size. The island that wraps it is about 30 lines.

**The Web Animations API.** It is built into every current browser, so it adds nothing to the bundle. It runs `transform` and `opacity` animations on the compositor, the browser thread that draws frames, at the display's refresh rate, so motion stays smooth when the page is busy. A paused animation with a set `currentTime` shows its exact state at that time, cheaply: 600 animations seek in about 0.22 ms. GSAP was ruled out because its licence is not open source, and Motion and anime.js add weight for what WAAPI already does.

## The public API

```ts
import { mountVideo } from "agentks-video";

const video = mountVideo(element, data, { voice: "generated", captions: true });
await video.ready;                  // fonts loaded, first slide laid out
video.play(); video.pause(); video.seek(ms); video.setRate(1.5);
video.setVoice("browser");          // "generated", "browser" or "none"
const off = video.on("diagnostic", (d) => …);
video.destroy();
```

The options are `voice`, `captions`, `scale` (`transform` or `zoom`), `reducedMotion` and `controls`. The events are `ready`, `state`, `time`, `slide`, `beat`, `end`, `error` and `diagnostic`. `agentks-video/standalone` exports `start(element, data)`, which reads the page's query options, and `readData(id)`, which reads `VideoData` from a `<script type="application/json">` tag.

## Building a slide

1. **Wait for the fonts,** once per video, so every layout measures the real font.
2. **Lay out.** The stage is a fixed 1920 × 1080, scaled to its box with a CSS transform. Its body is a grid of 12 columns and 6 rows. Areas and spans become rectangles, items that share an area get equal cells, and text steps down the style's sizes until it fits.
3. **Draw.** Each item kind's module creates its DOM or inline SVG once.
4. **Animate.** Each action becomes one or more paused animations. Every animation's delay is its time from the start of the video, not of the slide. A slide's visibility is itself an animation, so a slide boundary needs no timer.
5. **Check** the slide's end state for layout problems ([diagnostics](./45_diagnostics-sheet-and-size.md)).

## How a moment is drawn

Each verb maps to animations by a fixed rule, so stacked effects combine the same way at any time:

| Action | Animation |
|---|---|
| `show` | `fill: both`. Before it starts, the first keyframe holds, so the item stays hidden |
| `hide` | `fill: forwards`, created after the entrances, so it wins once it starts |
| `emph` | `fill: none`. On the item itself, `composite: add`, so it adds to what is shown and leaves no trace |
| `move` | `fill: forwards`, `composite: add`, keyframes from the two rectangles, so later moves add up |
| `send` | A dot with `offset-path` set to the arrow's path, animating `offset-distance` from 0 to 100% |
| `focus` | Scale and translate on the slide's layer, with the other items dimmed |

Presets use only cheap properties: a line draws with `stroke-dashoffset`, and a stat counts with a registered CSS property shown through `counter()`, so no script runs per frame. A morph measures an item on both slides and animates between the two rectangles, built once and seekable like the rest.

## Seeking and playing

**Seek.** Given a time `t`, the player finds the slide by binary search. It keeps built only what `t` needs: that slide, the one before it while its transition runs, and the next one. Then it sets `currentTime` on every built animation to `t`. Nothing is replayed and no state is carried, so a long jump costs the same as a short one.

**Play.** Every animation plays from one shared `startTime`, with the playback rate as the speed, and the compositor does the motion. The one `requestAnimationFrame` loop serves the progress bar, captions and narration, never motion.

## The clock

| Voice | Clock |
|---|---|
| Generated | One `<audio>` element plays the video's stream, which runs exactly as long as the video. Its time is the video's time. Four times a second, and at each beat's start, the player compares the animations with it and re-seeks when they drift by more than 40 ms. `preservesPitch` keeps the voice natural at 1.5× |
| Browser | The document timeline, on the estimated times. The player speaks each beat as one utterance. If speech runs past the beat's estimated end, the clock holds until it ends. Speech cannot start mid-sentence, so after a seek the player moves back to the start of the sentence |
| None | The document timeline, with captions only |

With no browser voice for the language, or speech that never starts, the player reports an error and plays with captions, because a clock waiting for speech that never comes would hang the video.

## Reduced motion and access

With reduced motion, each preset uses its declared fallback, usually a fade, and the camera stays still. Captions are on by default. Every control is a labelled button, and the keys follow common players: Space or K, the arrow keys by beat, Shift with an arrow by slide, 0 to 9, C, F and M.

## Related

- [VideoData](./35_video-data.md): the input.
- [Diagnostics, the review sheet and size](./45_diagnostics-sheet-and-size.md): what the player reports, and its budget.
- [Islands](../25_frontend/20_islands.md): how the app mounts it.
