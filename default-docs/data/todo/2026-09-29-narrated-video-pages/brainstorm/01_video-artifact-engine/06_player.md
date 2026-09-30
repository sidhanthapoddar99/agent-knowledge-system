---
title: "The player"
---

**The player is a small TypeScript package with no dependencies, `apps/packages/agentks-video` in the main repository.** It draws with DOM, CSS and inline SVG, and moves things only with the browser's own Web Animations API (WAAPI). It takes compiled video data from Rust and only plays it: it lays items out on the grid, builds one paused animation per action, and sets them all to the current time. So any moment can be shown exactly and seeking is instant. The budget is 30 KB gzipped in total. The same package runs in the local app, in a published page's island, in the standalone video page and, later, inside a markdown page. It never produces a video file.

## 01 Where it lives and what it exposes

```text
apps/packages/agentks-video/
  src/
    index.ts        mountVideo(): the public entry
    data.ts         the VideoData types, generated from the engine's JSON Schema
    stage.ts        the fixed 1920 × 1080 stage, scaled to its box
    layout.ts       areas and grid spans to rectangles, auto-flow, text fitting
    diagnostics.ts  text-fit, overflow and overlap checks on each slide's end state
    sheet.ts        the review sheet: every slide's end state on one screen (lazy)
    kinds/          one module per item kind: text, bullets, code, icon, image,
                    shape, arrow, tree, frame, chart, stat, table
    anim.ts         presets to Web Animations; seek; play in step
    transition.ts   two-layer transitions; morph (measure, invert, play)
    camera.ts       focus and unfocus
    clock.ts        the master clock: the audio stream's time, or estimated
    audio.ts        the video's audio stream; the browser-voice fallback
    captions.ts     caption lines from word timings
    controls.ts     play, scrub, speed, captions, voice, full screen, keys
  dev/              a harness page that plays fixture data (development only)
```

```ts
export function mountVideo(el: HTMLElement, data: VideoData, opts?: PlayerOptions): VideoHandle;

interface VideoHandle {
  play(): void; pause(): void; seek(ms: number): void; setRate(rate: number): void;
  setVoice(voice: "generated" | "browser"): void;
  on(event: "time" | "beat" | "slide" | "end" | "error" | "diagnostic", fn: (e: unknown) => void): () => void;
  destroy(): void;
  readonly duration: number; readonly time: number;
}
```

**Why no UI framework.** The client uses Preact, but the player must also run on a standalone page and inside a published page with nothing else loaded. Plain TypeScript runs everywhere at the smallest size. The Preact island in `agentks-ui` is a wrapper of about 30 lines that calls `mountVideo` and `destroy`.

**Why the player does not parse the YAML.** The engine's rule is that Rust computes every value that could be wrong. So Rust reads the video, whether it is one file or a folder, validates it, resolves library names, expands templates, inlines the presets and SVG a video uses, highlights code and computes every time ([architecture fit](./09_architecture-fit.md)). The player receives finished data. It computes only rectangles on the stage, which is a question of how things look.

## 02 Why the Web Animations API

| Option | Size (gzip) | Seekable to any time | Licence | Verdict |
|---|---|---|---|---|
| **Web Animations API** | 0 KB, built into every current browser | Yes: pause, set `currentTime` | Platform | **Chosen** |
| Motion `animate` mini | 2.3 KB | Yes, it wraps WAAPI | MIT | Adds nothing we need over WAAPI |
| Motion hybrid | 17 KB | Yes | MIT | Springs and sequencing we can express as data |
| anime.js 4 (WAAPI module · full) | 3.5 KB · 24.5 KB | Yes, timelines seek | MIT | A good library, but its timeline duplicates ours |
| GSAP 3 | about 23 KB core | Yes | Free, but the Standard License is not open source and forbids use in tools that compete with Webflow's visual builders | Ruled out: it cannot ship inside an MIT project without passing on those terms |
| Lottie (dotLottie player) | 35 to 75 KB, plus a 500 KB WASM engine for dotLottie | Yes | MIT | Needs After Effects to author; an agent cannot write it |
| Canvas engines (Motion Canvas, Revideo) | Large; canvas only | Yes | MIT | Drawn pixels: no DOM text, no theme CSS, no crisp scaling; built to render MP4 |

WAAPI runs `transform` and `opacity` animations on the browser's compositor thread, at the display's refresh rate (60 or 120 frames a second), so they stay smooth even when the page is busy. That is where "many good frames" comes from: the browser draws every frame, and the file never lists frames. Paused animations with a set `currentTime` are exact and cheap: the [measurement](./02_current-state.md#a-measurement-taken-for-this-design) put 600 of them at 0.22 ms per seek.

## 03 How a slide is built

1. **Lay out.** Wait for `document.fonts.ready` once per video, so every layout uses the real font. Then resolve each item's area to a rectangle on the stage, run auto-flow, fit text, and run the layout diagnostics ([the layout system](./05_layout-system.md)).
2. **Draw.** Each kind module creates its DOM or inline SVG once. Icons, frames and backgrounds arrive as SVG strings in the data; images arrive as URLs.
3. **Animate.** Each action becomes one or more WAAPI animations with `delay` set to the action's time from the slide's start, then paused.
4. **Keep two.** Only the current and the next slide exist in the DOM. Earlier slides are removed; later ones are built when needed. Building a slide takes a few milliseconds.

## 04 How a moment is drawn

Every action maps to animations with fixed rules, so stacked effects combine the same way whatever the time:

| Action | Animation | Why |
|---|---|---|
| `show` | `fill: both` | Before its start the first keyframe holds, so the item is hidden until it enters |
| `emph` | `fill: none`, `composite: add` | Adds on top of whatever the item already shows, then leaves no trace |
| `hide` | `fill: forwards`, created after the entrances | Wins over the entrance once it starts, and does nothing before it |
| `move` | `fill: forwards`, `composite: add`, keyframes from the two rectangles | Later moves add to earlier ones |
| `send` | A small dot with `offset-path` set to the arrow's path, animating `offset-distance` from 0 to 100% | A packet that follows any curve, seekable |
| `focus` | Scale and translate on the slide layer; dim the other items | A camera move with no extra DOM |
| Line draw | `stroke-dashoffset` from 1 to 0 with `pathLength="1"` | Any SVG path draws itself |
| Wipe | `clip-path: inset()` | A clean edge, no masks |
| Count | A registered CSS property `--n` of type integer, shown with `counter()` | The number counts with no script per frame. A decimal counts a scaled integer and shows the point |
| Typing | `clip-path: inset()` per code line with a `steps()` easing, lines staggered | Monospace typing with no per-letter DOM |
| Morph | Measure the item on both slides, then animate from the old rectangle to identity | Built once when the next slide is laid out, then seekable like the rest |

`seek(t)` finds the slide, builds it if needed, and sets `currentTime` on each of its animations and on the transition's. That is the whole seek.

## 05 The clock

| Voice | Clock | Behaviour |
|---|---|---|
| Generated voice | One `<audio>` element playing the video's joined stream. The stream runs as long as the video, with silence in pauses and transitions, so its `currentTime` is the video's time from start to end | `preservesPitch` keeps the voice natural at 1.25× or 1.5×. The animations run by themselves with a shared `startTime` and `playbackRate`. Four times a second and at every beat start the player compares them with the audio's time and re-seeks if they drift by more than 40 ms. Seeking sets the audio's time and the animations' time to the same value. On iOS one tap on play unlocks the one element for the whole video |
| Generated voice, per-beat fallback | Used only if the voice spike finds the joined stream fails in a browser ([the voiceover](./07_voiceover.md#07-one-stream-per-video)) | Two `<audio>` elements alternate, one clip per beat; `performance.now()` runs the clock in pauses and transitions |
| Browser voice | `performance.now()` on the estimated timeline | If speech is still going at the estimated end of a beat, the clock holds until speech ends, so actions never run ahead of the voice. Word anchors are estimates |
| No voice at all | `performance.now()` on the estimated timeline | Captions only, and the player says so |

No `requestAnimationFrame` loop runs while playing, apart from the progress bar and the drift check. The compositor does the motion.

## 06 Controls and captions

- **Controls:** play and pause; a scrubber with a tick at each slide and the slide's head on hover; the time; speed (0.75 to 2); captions on or off; the voice (generated or browser, and which browser voice); full screen.
- **Keys:** Space or K plays and pauses. Left and Right step one beat. Shift with Left or Right steps one slide. 0 to 9 jump to 0% to 90%. C toggles captions, F full screen, M mute.
- **Captions** are on by default. They show the current beat's words, one line at a time, timed by the word timings.
- **The transcript** under the player on the page highlights the current beat. Clicking a beat seeks there.
- **Poster:** before play, the stage shows the first slide with its items shown. No image is generated for it.

## 07 Layout diagnostics and the review sheet

**Diagnostics.** After laying out a slide, the player checks its end state, with every item that will be shown drawn in its final place. It reports three problems: text that does not fit at the style's smallest size (`layout-text-fit`), an item that leaves its area or the safe area (`layout-overflow`), and two items that overlap, other than an item inside a frame (`layout-overlap`). Each diagnostic names the slide by its number and its id, the item, and the item's line, which Rust passes in `VideoData`. It does not name the file, because `VideoData` holds one `source` for the whole video. In a folder video the slide id is the scene file's slug, and slugs are unique in a folder. So for `layout-overlap  slide 3 one-binary, line 5`, the scene file is the one file `NN_one-binary.yaml` in the folder. `agentks video info <video> --slide one-binary` prints that file's path, `030_one-binary.yaml`. `VideoData` does not change. The player never hides or fixes a problem on its own: it draws the slide as written and reports it. In the local app the diagnostics show beside the Rust errors. On a published page they go only to the `diagnostic` event.

**The review sheet.** The standalone page with `?sheet` draws every slide at its end state, plus the middle of each `morph`, as a grid of thumbnails on one screen. The diagnostics are listed beside the grid, each with its slide's number and id, and outlined on the thumbnails. `?theme=light` or `?theme=dark` sets the mode. So an agent, or sidhantha, sees a whole video in one screenshot per theme, and can open any slide at full size by its number (`?sheet&slide=4`). This is what makes the authoring skill's look gate cheap ([the authoring skill](./10_authoring-skill.md)).

## 08 Size budget

| Part | Budget, gzipped |
|---|---|
| Core: stage, layout, clock, animation runner, transitions, audio, captions | 14 KB |
| Kinds loaded with every video: text, bullets, code, icon, image, shape, arrow, frame, stat | 4 KB |
| Controls | 4 KB |
| Loaded only when a video uses them: chart, tree, table | 4 KB |
| Loaded only when a video uses them: morph, camera | 2 KB |
| Loaded only on the review sheet | 1 KB |
| **Cap for everything** | **30 KB** |

The gate measures the production build and fails a change that crosses a line. For scale: a static docs page with two Preact islands ships 8 KB; the Excalidraw island ships about 410 KB. A 3-minute video's compiled data is estimated at 10 to 15 KB gzipped (icons and presets are inlined; to be measured in the spike).

## 09 How a page loads it

| Where | How |
|---|---|
| **Standalone page** `/artifacts/<path>.video` | The same address for both forms: `<path>` is a single file's path without `.video.yaml`, or a video folder's path. A small HTML shell: the site's theme CSS, one `<div>`, the compiled data in a `<script type="application/json">` tag and the player module. It fills the window. It is the address to bookmark or to put in an iframe. One piece of engine code writes it, for three callers: the server's route, `agentks video preview <video>` (which writes it to the build cache and opens it, with no server running) and `agentks build`. This is the first thing that ships: the independent artifact |
| **Local app** (states 1 and 2), after the standalone page | The video page layout draws the title, the stage's frame and the transcript. The `video-player` island loads the `agentks-video` chunk on demand and mounts it with the page's video data |
| **Published site** (state 3) | `agentks build` writes the page's HTML (title, transcript, the stage's frame), the island markup with its props, the player chunk with a content hash in its name, the standalone page, and each video's audio stream under `_audio/` |
| **Inside a markdown page** (later) | `[[./01_tour.video.yaml]]`, or `[[./01_tour/]]` for a video folder, in the existing embed form, becomes the same island inline. No new markdown syntax |

The player is theme-aware in the same way as a `site` artifact: it reads the theme contract's variables. In the app and on a published page it inherits them; the standalone shell links the theme CSS.

## 10 Accessibility and reduced motion

- Captions on by default, and a full transcript on the page that works without JavaScript.
- Every control is a labelled button, reachable by keyboard, with a visible focus ring.
- When the reader's system asks for reduced motion, presets use their fallbacks (usually a fade), transitions become fades and the camera stays still.
- No autoplay with sound. Autoplay, where a page asks for it, starts muted with captions.

## 11 Errors

Rust attaches content errors to the page, as for every page kind. A slide with an error plays as a visible error slate that names the error and its line; the other slides play. The player never skips a broken slide silently and never shows it half-drawn.
