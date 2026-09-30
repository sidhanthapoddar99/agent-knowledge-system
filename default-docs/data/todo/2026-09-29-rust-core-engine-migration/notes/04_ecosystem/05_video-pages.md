---
title: "Video artifacts: what the engine provides"
---

A **video artifact** is data in YAML: one `NN_<slug>.video.yaml` file for a short video, or a folder of small files for a longer one. It holds slides, the items on them, narration beats and one-line actions. It composes library components, and a small player plays it live in the browser with a generated voiceover. No video file of any kind is ever made, and no media is committed to git. The video feature is owned by its own issue, [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md), whose design is [the video artifact engine](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/01_index.md). This note records only what the engine provides for it. A compiler crate in the Rust engine loads either form, checks it, resolves its components, computes every time and emits typed video data. The engine first serves it as a standalone player page at `/artifacts/<path>.video`, then as a page of kind `video` in the app. A separate helper, `agentks-voice`, generates the voice; clips live in a machine-wide store, `~/.agentks/audio/`. Video artifacts are one of the two places where library elements may be used, always as `alias:name` in a typed field of its YAML.

# 03 References

- The video issue: [issue.md](../../../2026-09-29-narrated-video-pages/issue.md) and its design, [the video artifact engine](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/01_index.md): [the format](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/03_artifact-format.md), [the player](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/06_player.md), [the voiceover](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/07_voiceover.md), [library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md), [how it fits the new architecture](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/09_architecture-fit.md), [the authoring skill](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/10_authoring-skill.md).
- The video issue's [open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md) and [build plan](../../../2026-09-29-narrated-video-pages/plans/01_video-build/overview.md).
- [Video and narration audio](../../brainstorm/01_initial-discussion/14_video-and-narration-audio.md): this issue's side of the first discussion.
- [Open questions](../../brainstorm/01_initial-discussion/16_open-questions.md), questions 11 and 13: audio belongs to the video issue; markdown stays plain.
- Sibling notes: [library system](./01_library-system.md), [content format](../02_engine/01_content-format.md), [project config](../02_engine/02_project-config.md), [Rust engine](../02_engine/03_rust-engine.md), [Rust CLI](../02_engine/05_rust-cli.md), [machine home and build cache](../02_engine/06_machine-home-and-build-cache.md), [shared UI package](../03_frontend/01_shared-ui-package.md), [client application](../03_frontend/02_client-application.md), [publishing](../05_delivery/02_publishing-ssg.md), [AI plugins and skills](./02_ai-plugins-and-skills.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): video stays rendered in the browser from source. No MP4 files, no media in git.
- Decided (sidhantha, 2026-09-29): generated narration audio may live in the local build cache and be embedded in a build, as long as it is never uploaded to GitHub.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not video-only.
- Decided (sidhantha, 2026-09-30): narration audio and the voice model belong to the video issue. The voice model is a separate download, not a library.
- Decided (sidhantha, 2026-09-30): library elements are used only in video artifacts and artifact pages. A video names them in typed fields of its YAML file; markdown never names them.
- Decided (sidhantha, 2026-09-30), on claude's proposal: pages name an element as `alias:element`.
- Decided (sidhantha, 2026-09-30): a video is first an independent artifact, not a markdown page; a markdown embed comes later ([the video issue's comment 001](../../../2026-09-29-narrated-video-pages/comments/001_2026-09-30_video-artifacts-direction.md)).
- Decided (sidhantha, 2026-10-01): a video can also be a folder with a `settings.json`, a controller and one file per scene ([the design](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/01_index.md#the-folder-form)).
- Decided (claude, 2026-10-01): Rust compiles the video and sends typed video data; the frontend only plays, and the player alone measures real text, so it reports layout problems as diagnostics. It follows the rule that the frontend holds no rules.
- Decided (claude, 2026-10-01): generated audio lives in a machine-wide store, `~/.agentks/audio/`, not in the build cache, because a clip is keyed by everything that decides its sound. The 2026-09-29 decision that audio "may live in the build cache" allows this.
- Decided (claude, 2026-10-01): the voice runs in a separate helper, `agentks-voice`, downloaded on request, so the main binary stays lean and a native crash cannot take the server down.

# 05 Notes & Analysis

## 01 The format, in short

The full format belongs to the video issue ([the format](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/03_artifact-format.md)). What the engine must know:

| Part | Meaning |
|---|---|
| `NN_<slug>.video.yaml` | A video as one file, in a docs section or a tracker's `notes/` or `brainstorm/`. Images sit beside it in `assets/` |
| `NN_<slug>/` with `settings.json` `{"kind": "video"}` | A video as a folder: `controller.yaml` (the header), one `NN_<slug>.yaml` per slide in prefix order, optional `components/<category>/` named `self:name`, and `assets/`. One page, never a sidebar group |
| `slides` | Each slide picks a layout (or a slide template) and lists its items: 12 built-in kinds, placed by named areas and quadrants on a 12 × 6 grid, never by pixels |
| `beats` | Narration, one or two sentences each, with actions such as `show list.2 rise @Obsidian` tied to a spoken word, a percentage or an offset |
| Typed fields (`icon:`, `frame:`, `in:`, `style:` …) | Name library components as `alias:name`; the field gives the category. A bare name is a player built-in |
| `pronounce:` | One-off pronunciations; the project's list is in `config/video.yaml` |

The files read as a script on disk. The 3-minute example is a folder of a 91-byte controller and ten scenes under 1 KB each. `agentks check video` warns when one file passes its limit (4 KB for a single file, 2 KB for a scene or the controller) and when narration passes 600 words, about four minutes.

## 02 What each side owns

| Part | Side | Why |
|---|---|---|
| Loading both forms, checking, resolving, expanding templates, the SVG allowlist, the timeline | Rust, `crates/video` (package `agentks-video-compiler`) | A rule. Every error names the file to change, with its line and column. An unknown name or an anchor that matches no whole word is an error, never a guess |
| Resolving a component to its file | Rust | Through `dep.lock`, the library's manifest and the component's category ([library system](./01_library-system.md)) |
| Generating clips, word timings | The `agentks-voice` helper, driven by Rust | Kokoro-82M through ONNX Runtime, in its own process |
| Joining clips into one stream per video | Rust, `crates/video` | Packet copying, no re-encoding, so the main binary gains no audio codec |
| The player: stage, layout, kinds, motion, captions, layout diagnostics | Frontend, `apps/packages/agentks-video` | Display. Framework-free TypeScript using the Web Animations API, 30 KB gzipped at most |
| The video page and its island | Frontend, `apps/packages/agentks-ui` | The layout and a small island that wraps the player |
| The browser's built-in voice | Frontend | The fallback when clips are missing |
| Standalone pages, published pages and audio | Rust and `agentks build` | One shell writer serves the route, `agentks video preview` and the build |

## 03 Library components in videos

- **The player holds the mechanics; libraries hold the looks.** Built-in: the stage, the grid, nine layouts, the item kinds, a minimal preset pack, a plain style. Libraries: frames, icons, illustrations, backgrounds, annotations, chart templates, layouts, slide templates, presets, transitions and styles, in `components/<category>/`.
- **Most components are data (JSON) or SVG**, read by the compiler and inlined into the compiled video, so a video plays with no extra requests and no library code runs. Inlined SVG passes an allowlist first ([library system](./01_library-system.md), section 14).
- **Images** load from `/_lib/<alias>/<name>`; `agentks build` copies the ones a video uses into the static output.
- **Script components** have a contract but wait for a later version. When they come, they run sandboxed and are driven by `seek` messages.

## 04 Narration audio

| Voice | Where it comes from | Notes |
|---|---|---|
| Generated | Kokoro-82M v1.0, timestamped, 8-bit (92 MB, Apache 2.0), run by `agentks-voice` | Installed with `agentks voice install`. Exact durations and word times. English only in version 1 |
| The browser's built-in voice | The Web Speech API | The fallback. Quality varies by browser. Timing is estimated and the clock waits for speech |

- **Pronunciation:** misaki-rs (MIT) built without its `espeak` feature, so no GPL code enters the chain. A word the voice cannot say is an error, `video.unknown-word`, fixed by `pronounce:` in `config/video.yaml` or in the video.
- **One clip per beat:** Ogg Opus, mono, 24 kHz, 24 kbit/s, with its word timings beside it. Rewording one beat regenerates one clip.
- **One stream per video:** the engine joins the clips and fills pauses with silent packets, so one audio element plays the whole video and seeking is exact. About 180 KB a minute.
- **Choosing the voice:** the video's `voice`, else `config/video.yaml`, else the browser voice. The reader can always switch to the browser voice.
- **When:** in the background when a video is opened and the helper is installed; `agentks video voice` on request; and in `agentks build`.

## 05 Where things live

```
~/.agentks/
  tools/agentks-voice/<version>/                 the helper, installed on request
  models/kokoro-82m-v1.0-timestamped-q8/         the model and its voices, once per machine
  libraries/<host>/<repository path>/<commit>/   libraries the videos use
  audio/<beat key>.opus · .json                  clips and word timings, shared by every project
  audio/<stream key>.opus                        each video's joined stream
```

- A clip's key is the BLAKE3 hash of the beat's text, the pronunciation entries that apply, the voice, the model id and the helper's version. The playback rate is not in it.
- The store is outside the engine version, so an upgrade regenerates nothing.
- Nothing here is cleaned automatically. `agentks cache clean` keeps the clips the videos in the scanned projects still use ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)).

## 06 Routes, commands and publishing

- **Routes:** `/artifacts/<path>.video` (the standalone page, with `?sheet` for the review sheet and `?theme`), `/_audio/<key>.opus` (streams, with range requests), the page over `/api` as `kind: "video"` ([client application](../03_frontend/02_client-application.md)).
- **Commands:** `check video`, `video info`, `video preview`, `video schema`, `video voice`, `voice install · status · remove` ([Rust CLI](../02_engine/05_rust-cli.md)).
- **Publishing:** `agentks build` writes each video page with its transcript and island, each standalone page to `artifacts/<path>.video/`, and each video's stream to `_audio/`. Without the helper or cached clips, a video publishes with the browser voice.

## 07 Timing against the migration

- **Can start now:** the player spike and the voice spike in the new main repository, and the library restructure before the library's first tag.
- **Waits for the migration:** the compiler needs the core's config loading and site index; video pages need the client and its islands; audio in the app needs the machine home; publishing needs `agentks build`. Nothing is built in today's engine.
- Video work does not block the migration's 1.0.0.

## 08 Open

The video issue owns these ([its open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md)): the default voice and how the voice says "agentks", both waiting on sidhantha's listening test, plus four answers claude took provisionally.
