---
title: "Video artifact engine — index"
---

**A video is data only, in YAML, composed from library components. A small player plays it live in the browser. No video file of any kind is ever made.** A short video is one file, `NN_<slug>.video.yaml`. A longer one is a folder: `settings.json` marks it as a video, `controller.yaml` holds what is true of the whole video, and each scene is its own small file, so an agent fixing one scene edits one file. Both forms hold slides, the items on each slide, and beats of narration with one-line actions such as `show list.2 rise @Obsidian`. One loader reads both forms into one model. The complete three-minute example is a folder with a 91-byte controller and ten scene files of 202 to 909 bytes. The check warns when one file passes its size limit, and when a video passes about four minutes of narration.

Rust reads the files, checks them, resolves their components (`alias:name` from the project's libraries, `self:name` from a folder's own `components/`), expands slide templates and computes every time from the narration. A framework-free TypeScript player of at most 30 KB draws the result with DOM, CSS and SVG. It moves things with the browser's Web Animations API (WAAPI), so every moment is a function of time and seeking is instant. Placement uses a 12 × 6 grid with named layouts, areas and quadrants, never pixels. The player owns everything that needs real font sizes, and reports text that does not fit.

The voice is Kokoro-82M, run by a separate helper program, `agentks-voice`. It makes one Opus clip per beat with the time of every word. A project pronunciation list fixes product names, and a word the voice cannot say is an error, never a silent spelling. The engine joins a video's clips into one audio stream of about 180 KB a minute. The clips are kept in a machine-wide store under `~/.agentks/audio/` and never in git.

The look lives in libraries. Every library has `components/<category>/` with fifteen categories. The default library ships the full Lucide icon set (1,857 icons) plus about 115 video components on day one. A skill, `agentks-video`, teaches agents to write good explainers and to look at every slide before calling a video done.

## Files in this thread

| File | Answers |
|---|---|
| [01/02 What exists today](./02_current-state.md) | What is built and planned for video; how video and audio are made today; a measurement of seeking |
| [01/03 The artifact format](./03_artifact-format.md) | What an agent writes, as one file or a folder; who owns each fact; the complete 3-minute example; library names; the schema; the errors |
| [01/04 Scenes, motion and the timeline](./04_scenes-and-timeline.md) | Item kinds, actions, anchors, presets, transitions, morph, how times are computed, seeking |
| [01/05 The layout system](./05_layout-system.md) | The stage, the grid, layouts, areas, quadrants, auto-flow, text fitting, why it looks good |
| [01/06 The player](./06_player.md) | The runtime, why WAAPI, how a moment is drawn, the clock, layout diagnostics, the review sheet, the size budget |
| [01/07 The voiceover](./07_voiceover.md) | The model, pronunciation and licences, the helper, clips, the joined stream, the store, publishing |
| [01/08 Library components](./08_library-components.md) | `components/<category>/`, the fifteen categories, the manifest, each category's contract, SVG safety, the day-one set |
| [01/09 How it fits the new architecture](./09_architecture-fit.md) | The compiler crate, the loader, the routes, the CLI, the site index, links and moves, the page data, publishing, security, the later markdown embed |
| [01/10 The authoring skill](./10_authoring-skill.md) | What the skill teaches, one file or a folder, fixing one scene, the look-at-every-slide gate, examples, evaluation, token cost |
| [01/11 What this changes elsewhere](./11_changes-to-existing-design.md) | Every note, subtask and decision to correct, with the change |
| [01/12 Research notes](./12_research.md) | Sizes, licences and dates of what was weighed, with sources |
| [01/13 Review response](./13_review-response.md) | Each finding of the independent review, what changed and where, and the two points not taken as written |
| [The example video's controller](./assets/example-video/controller.yaml) | The 3-minute example as a folder: `settings.json`, the controller and ten scene files, listed with their sizes in [01/03 section 05](./03_artifact-format.md#05-a-complete-three-minute-video) |

## Decisions

Claude decided these on 2026-10-01 under sidhantha's direction of 2026-09-30 ([comment 002](../../comments/002_2026-09-30_lean-library-driven-video.md)), then revised them after an independent review ([01/13](./13_review-response.md)). Decisions 42 to 52 carry out sidhantha's own decision 41, the folder form. Each is inside the design rules. sidhantha can overturn any of them.

### The format

1. **A video is data only, in YAML, in one of two forms: one file, `NN_<slug>.video.yaml`, or a folder, `NN_<slug>/`, of small files (decisions 41 to 52).** It reads as a script on disk and costs the fewest tokens. A schema can check all of it before anything plays. Code belongs in library components.
2. **Videos live where HTML artifacts live:** docs sections and a tracker issue's `notes/` and `brainstorm/`. Images are colocated in `assets/`, beside a single file or inside a video folder, and named by relative paths, like every document.
3. **Library components are named `alias:name` in typed fields. Bare names are player built-ins.** The field (`icon:`, `frame:`, `in:` …) gives the category, so no path is needed. A project with no library still plays its videos.
4. **Lean is checked, not hoped for, per file and per video.** `video-file-size` warns when one file passes its limit: 4 KB for a single-file video, 2 KB for a controller or a scene file. It measures one file's bytes on disk. `video-long-video` warns when a video's narration passes 600 words, about four minutes, in either form. It counts words, not seconds, so the warning does not change when generated clips arrive. The skill moves a growing video into the folder form and splits a longer topic into a series of videos.
5. **Narration drives the clock.** Each action starts at its beat's start or on a spoken word (`@word`), a percentage or an offset. Rewording never breaks the sync.
6. **A word anchor matches a whole word only**, ignoring case and punctuation, with `#2` for a repeat. An anchor that matches no whole word is an error. A prefix match would land on the wrong word with no error.
7. **Seven verbs:** `show`, `hide`, `emph`, `move`, `send`, `focus`, `unfocus`. They cover PowerPoint's entrance, emphasis, exit and motion, plus a packet along an arrow and a camera focus. Targets join with `+`, because a comma splits a YAML list.
8. **An item that some beat shows starts hidden. Everything else arrives with the slide.** Simple slides then need no actions.
9. **Twelve built-in item kinds**, including arrows, file trees, frames, charts and counting stats. Mermaid is not in the player: it is too heavy and cannot be animated item by item.

### Layout and motion

10. **A fixed 1920 × 1080 stage, scaled to fit, with a 12 × 6 body grid, named layouts and areas.** Quadrants are `tl tr bl br`. Several items in one area arrange themselves. A frame's screen is an area. No pixels in the file.
11. **Version 1 is 16:9 only.** The `aspect` key and per-aspect layouts are designed in for 1:1 and 9:16 later.
12. **Rust compiles; the player plays and owns everything measured.** Rust checks, resolves, expands templates, inlines components, highlights code and computes every time. The player lays out, fits text and detects overlap, because only the browser knows the real font. Styles use the site's font stacks, so Rust cannot know which font the reader's browser picks. A Rust estimate would be a wrong answer that looks right.
13. **The player reports layout problems as diagnostics** (`layout-text-fit`, `layout-overflow`, `layout-overlap`), and waits for fonts to load before it lays out. Text never shrinks below the style's floor. Below that it overflows visibly and a diagnostic names it.
14. **The player is framework-free TypeScript in `apps/packages/agentks-video`, using only WAAPI.** WAAPI is native, runs on the compositor at the screen's refresh rate and seeks exactly. GSAP's licence is not open source. Motion and anime.js add weight for what WAAPI already does.
15. **Presets are data, and may use CSS `linear()` easing**, so springs and bounces stay smooth without code.
16. **Size cap: 30 KB gzipped for the whole player**, 22 KB for what every video loads. The gate enforces it.
17. **Transitions run on two layers, and `morph` is opt-in per slide.** Same-id items glide between slides. An accidental id reuse never moves anything.

### The voice

18. **Voice: Kokoro-82M v1.0, timestamped, 8-bit (92 MB, Apache 2.0), with misaki-rs (MIT) for English, built with its default `espeak` feature turned off.** That feature compiles espeak-ng, which is GPL-3.0. With it off, nothing GPL enters the chain.
19. **A word the voice cannot pronounce is an error, `video-unknown-word`.** Without espeak-ng, misaki-rs would spell such a word letter by letter, which sounds wrong but looks fine in the file. The fix is a pronunciation list: `pronounce:` in `config/video.yaml` for the project, and in the video's header (a single file's top, or a folder's controller) for one-off words. Deliberate acronyms in capitals, such as CLI, are spelled on purpose and never flagged.
20. **Generation runs in a separate helper, `agentks-voice`**, a Rust program built with `ort`, downloaded on request with the model. The main binary stays lean and fast to build, and a native crash cannot take the server down.
21. **The unit of generation is one clip per beat**: Ogg Opus, mono, 24 kHz, 24 kbit/s, with a word-timing file beside it. Rewording one beat regenerates one clip.
22. **The unit of delivery is one audio stream per video.** The engine joins the beat clips into one Ogg Opus stream by copying their packets, with no re-encoding, and fills pauses and transitions with silent packets. The stream then runs as long as the video, so its time is the video's time: one audio element, exact seeking, one request, no gaps between beats. If the voice spike hears the joins, delivery falls back to one clip per beat.
23. **Audio store: `~/.agentks/audio/`, machine-wide and keyed by content** (text, pronunciations, voice, model, helper version). A second clone or a moved project reuses every clip. A CI build caches that folder. Audio is never committed.
24. **A published site ships each video's stream.** In-browser synthesis is rejected (86 MB per reader). The browser's own voice is the fallback, with estimated timings and a clock that waits for speech.

### The library

25. **Every library has `components/<category>/` with fifteen categories:** icons, illustrations, images, backgrounds, frames, annotations, widgets, charts, layouts, slides, animations, transitions, styles, scripts, fonts. The manifest gains a required `category` that matches the folder. Names stay unique per library, so `/_lib/` does not change.
26. **Frames cover both meanings of the word:** device and window chrome (browser, phone, terminal) and containers (card, callout, speech bubble, sticky note). Each is an SVG with a screen slot that becomes a layout area. Motion quality ("many good frames" in the animation sense) comes from compositor animation at the display's refresh rate.
27. **Annotations are their own category:** hand-drawn circles, underlines, brackets, highlight boxes and arrows that an emphasis preset draws around an item. Explainers use them constantly.
28. **Icons: the full Lucide set (1,857 icons, ISC licence) joins the 74 curated icons**, with Lucide's own tags for `library find`. A video inlines only the icons it uses, so the size cost is on disk only. A curated icon wins a name clash.
29. **Most video components are data (JSON) or SVG, inlined by the compiler.** Nothing is fetched at play time except images, and no library code runs.
30. **Inlined SVG passes an allowlist, not a denylist.** The compiler parses each SVG and writes back only allowed elements and attributes. It rejects `<style>`, animation elements, links and any outside reference, and prefixes every id per use. Anything else is an error. This is the one sanctioned exception to "library files are sandboxed": after the allowlist, the SVG is drawing data, not code.
31. **Per-category contracts are checked by one piece of Rust code.** `agentks check libraries` runs it, and the library's own CI calls that command instead of copying the rules into Python.
32. **Frames become SVG with a screen slot, the one source.** The HTML artifact frames become `<device>-view` widgets whose chrome is copied from the SVG by the library's sync step.
33. **Script components are designed but not in version 1.** When they come, they run sandboxed and are driven by `seek` messages. The folder keeps the name `scripts`, the word sidhantha used.
34. **The default library's alias in the starter template is `ks`.**

### Pages, publishing and the skill

35. **The independent artifact comes first.** One piece of engine code writes the standalone player page. Three callers share it: the server's `/artifacts/<path>.video` route, `agentks video preview <video>`, and `agentks build`. Video pages inside the app and the markdown embed come after.
36. **The standalone page has a review mode, `?sheet`.** It shows every slide's end state, and the middle of each morph, on one screen, with the player's diagnostics beside it. One screenshot per theme lets an agent see the whole video.
37. **Captions are on by default**, and reduced motion swaps presets for fades.
38. **The markdown `video: true` format and HTML-comment cues are dropped.** The spike's narrator carries over as the browser-voice fallback.
39. **Video work does not block the migration's 1.0.0**, and nothing is built in today's Astro engine.
40. **The skill `agentks-video` has a look gate.** An agent never calls a video done before it has looked at the review sheet in light and dark and fixed every diagnostic.

### The folder form

41. **Decided (sidhantha, 2026-10-01): a video can also be a folder.** In his words: "for the video component, it can also be a folder with a settings.json because the settings.json tells its a video artifact it can be split into multiple files with primary being controller.json or something that controls all scenes and all scenes can have their own voice overs and animations and the controller ensures smooth transitions there could be components folder as well inside it basically multiple files so ai does not end up editing a single file in case of issue".
42. **Both forms stay, and one loader reads both into one model.** A short video reads best as one file, and a long one is easier to fix as small files. The loader is the only code that knows the form. The schema, the checks, the timeline and `VideoData` are shared, so the second form is one branch in the loader, not a second compiler. The skill's rule: one file for a video of up to about five slides and 4 KB with no components of its own; a folder for anything longer, for a video with its own components, or for one that will be edited scene by scene.
43. **`settings.json` with `"kind": "video"` marks the folder, and the folder is one page.** The site index already reads every folder's settings file, so the marker costs nothing. The folder is named `NN_<slug>/` with no `.video` suffix, because the settings file already says it and one fact has one source. The group keys `label`, `collapsed` and `isCollapsible` are refused: a video folder is never a sidebar group, and its title is the controller's. Another `kind` value is an error, never a guess.
44. **The controller is `controller.yaml`, and it holds exactly the header a single file has above `slides:`.** YAML, not JSON, for the reasons the format chose YAML: fewer tokens, comments, and the same parser with node positions and the same schema as every other video file. It has no `NN_` prefix, so it is never taken for a scene, and it never lists the scenes.
45. **Scenes are `NN_<slug>.yaml` files at the folder's top level, one slide each.** The prefix is the only place the order is written, and the slug is the slide's id. Scenes are numbered in tens so a new one fits between two. Two scenes with the same prefix value, or the same slug, are errors, because the order or the name would otherwise rest on a tie-break nobody wrote.
46. **The controller owns what is true of the whole video; a scene owns its slide.** The controller holds the title, the style, the voice, the rate, the pronunciations and the default transition and background. A scene holds its items, its layout or template, its narration, its actions, and its own transition or background when it differs. Captions are the narration: on by default in the player, with no key. The header gains `in:` and `bg:` in both forms, so a video-wide transition is written once, not once per scene. The slide's value wins, then the header's, then the style's.
47. **A morph belongs to the later scene, and a morph with nothing to move is an error, `video-morph-unmatched`.** In a folder the slide before a morph is another file, so renaming an item there or reordering scenes could empty the morph with no sign. The check runs in both forms.
48. **A folder's own components live in `components/<category>/` and are named `self:name`.** The compiler reads that folder as a library with no manifest, through the same resolver and the same Rust contract checks as every library, including the SVG allowlist. `self` is reserved, so a name needs no path and no search order. A missing `self:` name is an error and never falls back to a library. Images stay in `assets/`, and widgets, scripts and fonts are refused.
49. **A folder video keeps its images inside itself.** A path that leaves the folder is an error, `video-asset-outside`. So the folder moves and copies as one piece, and `agentks move` never rewrites a path inside it.
50. **Every error names the file to change.** The error record's `file` is the scene, the controller or the component, and its path starts inside that file. `agentks check video <scene file>` checks one scene in the context of the whole folder: it prints that scene's errors and the controller's, counts the rest, and exits 1 when the video has any error, because a scene never plays alone.
51. **The form never shows in an address.** `01_tour.video.yaml` and a folder `01_tour/` get the same page URL and the same standalone page, `/artifacts/<path>.video`. A link or a later embed names the folder, `[the tour](./01_tour/)`. `agentks move` moves the folder as one unit. The site index does not descend into a video folder, and the sidebar shows the controller's title.
52. **`VideoData` does not change.** Both forms compile to the same data. `source` holds the file or the folder. A folder's slide ids are its scene slugs. So the slide id is now a slug in both forms: hyphens are allowed and underscores are not, the same rule as a scene file's slug. A player diagnostic carries the slide id and the line, not the file. The scene file is the one file `NN_<id>.yaml` in the folder, and `agentks video info <video> --slide <id>` prints its path.
53. **Error and diagnostic codes are kebab-case, such as `video-anchor-missing` and `layout-text-fit`.** Decided (claude, 2026-10-01). The engine's one error model already names every kind this way and a test pins the names, so a video error reads the same in the CLI, the app and the player. The player's three layout diagnostics move from `layout.text-fit`, `layout.overflow` and `layout.overlap` when T5 is merged.

## Build plan

### Tracks

| # | Track | Delivers | Repository and folders | Depends on | Spike |
|---|---|---|---|---|---|
| T1 | **Player spike** | Stage and scaling; the grid and nine built-in layouts; kinds text, bullets, code, icon, image, shape, arrow and frame; the WAAPI runner with built-in presets and `linear()` easing; `cut`, `fade`, `slide`, `push`; seek and scrub; layout diagnostics and the `?sheet` view; the browser voice with the estimated clock; a dev page playing the example from hand-compiled `VideoData`; a size report; a text-sharpness check after `focus` and stage scaling | Main repository: `apps/packages/agentks-video/`, plus Bun, Node and Vite pins in `.mise.toml` | Nothing | **Yes** |
| T2 | **Voice spike** | A first `agentks-voice`: Kokoro timestamped 8-bit, misaki-rs without `espeak`, `ort`, Ogg Opus. Turns the example's 27 beats into clips and word timings, and joins them into one stream. Lists the words it could not say and plays them aloud; tests the pronunciation list. Plays the joined stream in Chrome, Firefox, Safari on macOS and Safari on iOS. Reports speed, sizes, timing accuracy and every crate's licence. sidhantha listens to three voices | Main repository: `apps/agentks-voice/` | Nothing | **Yes** |
| T4a | **Library restructure** | `components/<category>/`; `category` in the manifest; the folder-matches-category rule in `scripts/check.py`; the Lucide import script and the 1,857 icons with tags | Library repository: `components/`, `manifest.json`, `scripts/` | Coordination with the agent filling the library now. Must land before the library's first tag | No |
| T3 | **Format and compiler** | The final JSON Schema, one document with three entries (single file, controller, scene); the Rust crate: one loader for both forms (a `.video.yaml` file, or a folder with its settings file, controller, scenes in prefix order and `components/` as the `self` library), parse with positions, both check layers including the folder checks, the error record naming the file to change, the built-in pack, template expansion, the SVG allowlist, the pronunciation list, the timeline, `VideoData` with generated types; `check video` on a file, a folder or one scene, `video info`, `video schema` | Main repository: `apps/agentks-engine/crates/video/`, `crates/cli/` | T1's `VideoData` shape; a YAML parser with node positions ([030/30](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md)); the folder settings reader ([020/50](../../../2026-09-29-rust-core-engine-migration/subtasks/020_content-contract/50_ordering-settings-frontmatter.md)) | No |
| T4b | **Video component set** | The day-one set: styles, layouts, slide templates, presets, transitions, backgrounds, frames and containers, annotations, charts, twelve illustrations; SVG frames and the generated `-view` widgets; a preview page that plays components with the player build | Library repository: `components/`, `preview/`, `AGENTS.md` | T1's contracts; T4a | No |
| T5 | **Rich kinds and motion** | Chart marks and templates, counting stats, trees, tables, annotations, `send`, `focus`, `morph`; the review sheet names each slide by number and id | `apps/packages/agentks-video/` | T1 | No |
| T6 | **Voice in the engine** | `voice install` · `status` · `remove`; the helper's lifecycle and queue; the audio store; the stream join; `/_audio/`; background generation and push; timelines from real clips; the unknown-word check; `video voice`; stream playback and word sync in the player | Engine: `crates/video`, the server crate; player: `clock.ts`, `audio.ts` | T2, T3, the server ([050/10](../../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md)) | No |
| T7a | **The standalone artifact** | The shell writer; `agentks video preview <video> [--sheet]`, which works with no server and opens a scene file at that scene; the `/artifacts/<path>.video` route, the same for both forms | Engine: `crates/video`, `crates/cli`, the server crate | T1, T3; the route also needs [050/10](../../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md) | No |
| T7b | **Video pages in the app** | The `video` page kind in the site index, from a `.video.yaml` file or a folder marked `"kind": "video"`, which is one page and never a sidebar group; the transcript, the video page layout and island in `agentks-ui` | Engine crates; `apps/packages/agentks-ui/src/layouts/pages/video/`, `src/islands/video-player/` | T7a; page kinds ([030/70](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/70_diagram-and-artifact-sources.md)); the site index ([030/40](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/40_site-index.md)); islands ([080/50](../../../2026-09-29-rust-core-engine-migration/subtasks/080_ui-and-client/50_islands.md)) | No |
| T8 | **Authoring skill** | `agentks-video` with its references, one file or a folder, fixing one scene, the look gate, three checked examples (a folder, a folder with its own component, a single file) and the evaluation | Main repository: `plugins/agentks/skills/agentks-video/` | T3, T4b, T5, T7a | No |
| T9 | **Publishing** | Pages, standalone pages, island props, the `_audio/` streams and library images in `agentks build` | `apps/agentks-ssg/`, the engine's build | T6, T7a, T7b, Phase 3 ([150/10](../../../2026-09-29-rust-core-engine-migration/subtasks/150_publishing/10_agentks-build.md)) | No |
| T10 | **Tests, last** | Rust tests for the compiler, the loader's folder rules and the SVG allowlist; golden `VideoData` fixtures, with the example in both forms compiling to the same data apart from `source`, slide ids and positions; seek determinism by screenshot, the size gate, end-to-end in the client and a static build | All of the above | All | No |

### Waves

1. **Wave 1: T1, T2 and T4a in parallel.** sidhantha watches the example in the player, looks at its review sheet and listens to the voices. This is the gate for everything else: if the look or the voice is not good enough, the design changes here, cheaply. T4a runs now because the rename is free only until the library's first tag.
2. **Wave 2: T3, T4b and T5 in parallel.** T1 fixes the component contracts first, so T4b builds against them. T3 builds both forms through one loader.
3. **Wave 3: T6 and T7a, then T7b and T8.** T7a gives sidhantha the first real artifact he can open.
4. **Wave 4: T9 with the migration's Phase 3, then T10.**

**The folder form changes nothing in wave 1.** Both forms compile to the same `VideoData`, so the player spike keeps playing its single-file fixture, and the voice spike reads the same 27 beats.

**Why the build stays fast.** The player builds with Vite in about a second and has no dependencies. The helper sits outside the engine's workspace, so the engine's gate never compiles ONNX Runtime, and the helper links a prebuilt one. Joining clips is packet copying in pure Rust, so the main binary gains no audio codec. Each track takes the latest stable release of every tool it adds.

### Done when, for the two spikes

- **T1:** the example plays from start to end in Chrome, Firefox and Safari. Seeking to any time shows the same frame as playing to it, compared by screenshot at ten times. The review sheet shows all ten slides and lists no diagnostic. The player is under 30 KB gzipped. Text is sharp after a `focus`. sidhantha judges the look good enough to build on.
- **T2:** all 27 beats become clips with word timings on sidhantha's laptop. The joined stream plays with no audible join and seeks to within 50 ms in all four browsers, or the report says which fall back to per-beat clips. The report lists every unknown word in the example and shows the pronunciation list fixing them. Every dependency's licence is compatible with MIT. sidhantha picks a default voice.

### What waits

- The markdown embed, `[[./x.video.yaml]]` or `[[./x/]]`.
- A command that turns a single-file video into a folder and back. Until then the skill shows the steps, and the check proves the result.
- Script components; library images and fonts. In version 1, images come from the project's own `assets/`.
- Portrait and square videos.
- Languages other than English.
- Background music and sound effects.
- Node-and-edge diagrams laid out by Rust.
- Feeding browser diagnostics back into `agentks check video`.
- A visual editor or timeline editor for videos.

## Questions for sidhantha

Product questions only. Each has a recommendation, and the design works with either answer.

1. **Which voice should be the default?** Recommended: `af_heart` (US English, female), Kokoro's best-rated voice, with `am_michael` and `bf_emma` offered. You choose after the voice spike. A project can set its own default.
2. **How should the voice say "agentks"?** The starter template's pronunciation list needs one answer. Recommended: "agent K S", spoken as three parts. The alternative is "agent-ks" as one word, which sounds like "agentics".
3. **Is English-only narration acceptable for version 1?** Recommended: yes. Other languages need another pronunciation step, and the common one, espeak-ng, is GPL-3.0.
4. **Should the voice helper stay free of GPL code, or ship espeak-ng for automatic pronunciation of unknown words?** A GPL-3.0 helper, released separately and talking to `agentks` only over standard input and output, would not change the main binary's MIT licence. It would say most unknown words on its own, but agentks would then distribute GPL code. Recommended: stay GPL-free and rely on the pronunciation list. Revisit if the voice spike finds more than about one unknown word per minute of typical technical narration.
5. **Should the voice be generated automatically when a video is opened?** It uses the CPU for up to a minute the first time a 3-minute video is opened, and a second or two after an edit. Recommended: yes, when the helper is installed, with `agentks video voice` for CI.
6. **When `agentks build` runs without the voice helper or cached clips, should it fail or publish with the browser voice?** Recommended: publish with the browser voice and warn, with a `--require-voice` flag that turns the warning into an error for CI.
7. **Should one scene be able to speak with a different voice?** The design reads "all scenes can have their own voice overs" as each scene having its own narration, spoken in the video's one voice. Recommended: one voice per video, set in the controller, because a consistent voice is part of what makes the narration sound good. A scene-level `voice:` would fit the voice pipeline unchanged, since the voice is already part of each clip's key, so it can be added later without a format change.

## What this changes

This thread writes only inside its own folder. The corrections it needs in the video issue, the migration's notes and subtasks, and the library repository are listed in [01/11 What this changes elsewhere](./11_changes-to-existing-design.md).
