---
title: T1 Player spike — the framework-free player plays the 3-minute example
status: review
---

The first gate for the video engine: the player draws hand-compiled VideoData on the fixed stage and moves it with the Web Animations API, so sidhantha can judge the look before anything else is built. Design: brainstorm/01_video-artifact-engine (06 the player, 05 the layout system, 04 scenes and timeline).

# 01 To Do
- [x] Package `apps/packages/agentks-video/` in the main repository, framework-free TypeScript, no runtime dependencies
    - [x] Vite 8.3.1 for the dev page and the library build; `bun test` for unit tests
    - [x] Wiring in `ctl` scripts: lint, typecheck, test and a size check; AGENTS.md stack and packages lines
- [x] `VideoData` types and README: the shape the Rust compiler (T3) emits
- [x] Component contracts written down for T4b: style, layout, slide template, animation preset, transition, and the SVG rules for frames, backgrounds and annotations
- [x] Stage 1920 × 1080 scaled to fit; safe area, head band, 12 × 6 body grid
- [x] Nine built-in layouts, quadrants, 9-point align, sizes, auto-flow
- [x] Item kinds: text, bullets, code, icon, image, shape, arrow, frame (plus basic tree, stat and chart, because the example uses them)
- [x] WAAPI runner with the built-in presets, `linear()` easing allowed
- [x] Transitions `cut`, `fade`, `slide`, `push`
- [x] Seek and scrub: every moment a pure function of time
- [x] `document.fonts.ready` before layout; diagnostics `layout-text-fit`, `layout-overflow`, `layout-overlap`
- [x] `?sheet` review view, `?theme=light|dark`
- [x] Browser voice with the estimated clock; captions
- [x] Dev page playing the 3-minute example from hand-compiled VideoData
- [x] Size report and cap (30 KB gzipped in total, 22 KB for what every video loads)
- [x] Text-sharpness check after `focus` and after stage scaling; choose `zoom` or `transform`
- [x] Evidence: Chromium and Firefox playback, seek-versus-play screenshots at ten times, sheet in light and dark, gzipped size
- [ ] sidhantha watches the example, looks at the sheet in both themes and judges the look

## Guardrails
- Write only in `apps/packages/agentks-video/`, its wiring in `ctl` and `scripts/`, `.gitignore` and AGENTS.md of the main repository, and this file. Never write to the library repository.
- No git command that changes anything. The orchestrator commits.
- No runtime dependency in the player. WAAPI only.
- Tests added to the gate run in under 10 seconds. Browser evidence runs once and stays out of the gate.
- When the player cannot be sure of an answer (an unknown name, a missing part), it reports an error, never a guess.
- No video file of any kind is made or stored.

## Done when
- The example plays from start to end in Chromium and Firefox (Safari cannot run on Linux; the report says so).
- Seeking to a time shows the same frame as playing to it, compared by screenshot at ten times.
- The review sheet shows all ten slides and lists no diagnostic.
- The player is under 30 KB gzipped, and `ctl gate` checks it.
- Text is sharp after a `focus`.
- sidhantha judges the look good enough to build on (his call, not this subtask's).

# 02 Status and Result
Review: everything but sidhantha's own look at the example is done. Safari is untested, because it cannot run on Linux.

## Result
- **The package:** `apps/packages/agentks-video/` in the main repository, merged into `main` on 2026-10-01 by merge commit `2519f9e`. `src/data.ts` is the VideoData contract; `src/builtin/pack.json` holds the built-in style, nine layouts, presets and four transitions; `README.md` has the rules the compiler follows and the component contracts. `dev/fixture/tour.json` is the 3-minute example compiled by hand: the golden file for T3.
- **The dev page:** `cd apps/packages/agentks-video && bun install && bun run dev`, then open http://localhost:5199/. Add `?sheet`, `?sheet&slide=4`, `?theme=dark`, `?voice=none` or `?scale=zoom`.
- **Plays start to end:** Chromium and Firefox both reached the end at 2× speed in 97 s with no page error (`dev/checks/play-through.ts`).
- **Seek equals play:** at ten times, one per slide, each in the middle of a motion, Chromium's played and seeked frames match at 0.000% of pixels at all ten. Firefox matches at eight; at the camera focus 0.28% of pixels differ and at the chart 0.02%, all at edges away from the zoom centre: Firefox settles a pause a few milliseconds from the time it reports. Running animations were in exact step (0 ms apart) in both browsers (`dev/checks/seek-vs-play.ts`).
- **Review sheet:** all ten slides, "No diagnostics", in light and dark, in both browsers.
- **Size:** 19.17 KB gzipped for what every video loads, 20.09 KB for the whole player; caps 22 KB and 30 KB. `ctl test video` fails over either cap. The compiled example is 10.4 KB gzipped, at the low end of the design's 10 to 15 KB estimate.
- **Text sharpness**, edge energy against the same text drawn natively (1.00 is native): after stage scaling 1.07 to 1.09; after a focus, seeked or while playing, 1.00 in Chromium and 0.99 in Firefox with a transform, 0.94 in Firefox with CSS zoom. The player scales with a transform.
- **Voice:** headless Chromium has no voices, so the player waits 1.2 s, reports `voice.unavailable` and plays with captions. Firefox here speaks with the system voice and the clock ran in step for 30 s. That voice was faster than the 155-words-a-minute estimate, so the hold-for-speech path was never needed and is untested live.
- **Gate:** `ctl gate lint video`, `ctl gate typecheck video`, `ctl test video` (26 unit tests in about 11 ms, then a production build and the size check), `ctl check` green.
- **Evidence** is in `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system/data/player-spike/`: `sheet-light.png`, `sheet-dark.png` (and `-firefox`), `seek-vs-play/` with `report.md`, `sharpness/` with `report.md`, `play-through/`, `size.md`.

## Agent log
none

# 03 References
- [The design index](../brainstorm/01_video-artifact-engine/01_index.md)
- [The player](../brainstorm/01_video-artifact-engine/06_player.md)
- [The layout system](../brainstorm/01_video-artifact-engine/05_layout-system.md)
- [Scenes, motion and the timeline](../brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md)
- [The artifact format and the 3-minute example](../brainstorm/01_video-artifact-engine/03_artifact-format.md)
- [Library components and their contracts](../brainstorm/01_video-artifact-engine/08_library-components.md)
- [sidhantha's direction, comment 002](../comments/002_2026-09-30_lean-library-driven-video.md)

# 04 Decisions
## 01 VideoData
- Decided (claude, 2026-10-01): timeline values are integer milliseconds from the video's start, while component JSON keeps the library's seconds, because the player's API seeks in milliseconds and inlining a component should stay a plain copy.
- Decided (claude, 2026-10-01): VideoData carries library components in `components.<category>` keyed by `alias:name`, and a bare name always means a built-in, because one lookup rule then serves every category and a missing name is an error in one place.
- Decided (claude, 2026-10-01): the built-in pack is one JSON file, `src/builtin/pack.json`, that the Rust compiler should read too, because a second list of built-in names in Rust would drift.
- Decided (claude, 2026-10-01): the compiler fills every preset (kind defaults, `mark` for parts, the style's defaults) and turns a slide's `head` into a text item `_head` shown at the slide's start, because the player should never guess a default and a head is then laid out and checked like any item.
- Decided (claude, 2026-10-01): which items start hidden is not in the data, because an entrance animation that fills backwards already hides its item until it starts.
## 02 Playing
- Decided (claude, 2026-10-01): every animation sits on one absolute timeline (its delay is its time from the video's start), and each slide's visibility is itself a visibility animation, because then a seek is one line (set every `currentTime`) and play is one shared `startTime`, with no timers at slide boundaries.
- Decided (claude, 2026-10-01): the stage scales with a CSS transform, not CSS zoom, because the sharpness check found the transform as sharp as native text in both browsers and zoom lost 6% in Firefox after a focus.
- Decided (claude, 2026-10-01): the player sets no `will-change` at all, because the measurement showed text at native sharpness without it, and the browser promotes running transform animations on its own.
- Decided (claude, 2026-10-01): the spike also draws basic tree, stat (a CSS counter on a registered `--vx-n`), horizontal bar charts, `send` and `focus`, because the example uses them and the look could not be judged without them. T5 deepens them.
- Decided (claude, 2026-10-01): with no browser voice, or one that never starts within 2.5 s, the player reports an error and plays with captions, because a clock waiting for speech that never comes would hang the video.
## 03 Look
- Decided (claude, 2026-10-01): the dev page's theme uses the agentks homepage's tokens (paper, ink, link blue, Source Serif 4 and IBM Plex Mono), because a video should look like the site it lives on; the player itself only reads the theme's variables.
- Decided (claude, 2026-10-01): lists and trees default to size `l`, icon and stat labels use `m`, list markers and icon strokes scale with the text, and shapes in a shared row leave a fifth of their cell for arrows, because at the design's defaults the slides read as small and the pipeline's arrows had no room.
- Decided (claude, 2026-10-01): captions sit in the stage's bottom margin on a scrim, on a page and in full screen, and the controls sit under the stage, because the stage then never hides content and the spike needs no page layout.
## 04 Structure
- Decided (claude, 2026-10-01): `src/` is split into `model/`, `draw/`, `motion/` and `ui/`, because the flat list in the design crossed the brief's 10-files-per-folder tripwire.
- Decided (claude, 2026-10-01): the fixture is made by a dev-only script, `dev/fixture/build.ts`, from the example's YAML and hand-written components, because 57 hand-typed action times would be error-prone; the compiler's output replaces it.
- Decided (claude, 2026-10-01): the size gate runs inside `ctl test video` (unit tests, then a production build and the caps), because the gate ladder has no build rung and the build takes about a second.

# 05 Notes & Analysis
## Issues hit
- The first seek-versus-play runs showed differences that were the check's own faults: it read the time from a finished animation, which holds its end time, and before a pause had settled, which Chromium applies on the next frame. The check now reads a running animation after every pause has settled.
- Captions dropped the punctuation after a line's last word; a unit test caught it and it is fixed.
## Watch out
- **Design changes for other tracks.** The style contract gains a `stat` size scale. SVG components must be well-formed XML (`data-slot=""`, never a bare `data-slot`), and role colours go in a `style` attribute (`style="fill:var(--vx-surface)"`), because presentation attributes do not accept `var()`. A frame slot's `rx` rounds the bottom corners of a covering image. Presets may use three tokens, `$n`, `$dx` and `$dy`. The chart template's `data.min` and `max` from the design are not used: the player scales bars from 0 to the largest value.
- The `glow` preset animates `filter: drop-shadow(… var(--vx-accent))`, which both browsers resolved; recheck it in Safari.
- Safari (macOS and iOS) is untested: it cannot run on Linux.
