---
title: "Video pages: what the engine provides"
---

A **video page** is an ordinary markdown file with `video: true` in its frontmatter. The browser plays it as a narrated video: each `##` heading is a scene, each paragraph is one spoken beat, and short **cues** (HTML comments or a fenced block) drive the visuals. Nothing is rendered to MP4, and no media is committed to git. The video feature is owned by its own issue, [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). This note records only what the engine migration provides for it. The Rust engine reads the page into scenes, beats and cues, and sends them as data like every other page. It checks every cue and every library element a cue names. It generates and caches narration audio with an optional local voice model. The player and its widgets live in the shared UI package, so the local app and a published site play the same way. On a published page the player is an island, the only part of the page that ships JavaScript. Video pages are one of the two places where library elements may be used, always as `alias:element` inside a cue.

# 03 References

- The video issue: [issue.md](../../../2026-09-29-narrated-video-pages/issue.md), and its notes on [the spike](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/03_the-spike.md), [the video engine](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/04_video-engine.md), [narration audio](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/05_narration-audio.md), [caching](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/06_caching.md), [libraries and reusable elements](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md), [the relation to this migration](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/08_relation-to-the-engine-migration.md) and [its open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md).
- [Video and narration audio](../../brainstorm/01_initial-discussion/14_video-and-narration-audio.md): this issue's side of the discussion.
- [Open questions](../../brainstorm/01_initial-discussion/16_open-questions.md), questions 11 and 13: audio belongs to the video issue; markdown stays plain.
- Sibling notes: [library system](./01_library-system.md), [content format](../02_engine/01_content-format.md), [Rust engine](../02_engine/03_rust-engine.md), [machine home and build cache](../02_engine/06_machine-home-and-build-cache.md), [shared UI package](../03_frontend/01_shared-ui-package.md), [publishing](../05_delivery/02_publishing-ssg.md), [AI plugins and skills](./02_ai-plugins-and-skills.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): video stays rendered in the browser from source. No MP4 files, no media in git.
- Decided (sidhantha, 2026-09-29): generated narration audio may live in the local build cache and be embedded in a build, as long as it is never uploaded to GitHub.
- Decided (sidhantha, 2026-09-29): libraries are shared engine machinery, not video-only.
- Decided (sidhantha, 2026-09-30): narration audio and the voice model belong to the video issue. The voice model is a separate download, not a library.
- Decided (sidhantha, 2026-09-30): library elements are used only in video pages and artifact pages. A video names them inside its cues; the narration prose stays plain markdown.
- Decided (sidhantha, 2026-09-30), on claude's proposal: pages name an element as `alias:element`.
- Decided (claude, 2026-09-30): after the migration, Rust reads the scenes, beats and cues and sends them as data; the frontend only plays. The video issue's relation note proposed it, and it follows the rule that the frontend holds no rules.

# 05 Notes & Analysis

## 01 The format, in short

The full format belongs to the video issue. What the engine must parse:

| Part | Meaning |
|---|---|
| `video: true` in frontmatter | Marks the page as a video |
| The `#` title and paragraphs before the first `##` | The intro scene |
| Each `##` heading | Starts a scene |
| Each paragraph | One beat, spoken in turn |
| A diagram, code block, list, table or lone image | A visual the stage shows |
| **Bold** text in a beat | Focuses the matching part of the visual |
| A cue: `<!-- flow: browser -> server -->`, or a fenced `scene` block | An action or a layout for the scene. The only place a video names a library element: `<!-- panel: icons:server -->` |

On disk, in Obsidian or on GitHub, the file reads as an ordinary document, and the site shows the same text as the video's transcript. Cues are hidden (HTML comments) or shown as code (a fenced block) by other apps. The cue syntax is still open in the video issue.

## 02 What each side owns

| Part | Side | Why |
|---|---|---|
| Reading the markdown into scenes, beats and cues | Rust engine | A rule. It is sent as page data, like a sidebar or an outline |
| Checking cues and `alias:element` names | Rust engine, shared with the CLI | An unknown widget, cue target, alias or element is an error naming the page and line, never a silent miss. `agentks check libraries` runs the same check |
| Resolving an element to its file | Rust engine | Through `dep.lock` and the library's manifest ([library system](./01_library-system.md)) |
| Generated audio, the voice model, word timings | Rust engine | Machine-level work, cached under `~/.agentks/` |
| The player, stage, widgets and motion | Frontend, in `apps/packages/agentks-ui` | Display. The same code plays in the local app and on a published site |
| The browser's built-in voice | Frontend | The fallback when no generated audio exists |
| A published video page | `agentks build` | The page and its transcript become static HTML; the player is an island |

The spike on branch `spike/narrated-video` reads the scenes in the browser from the rendered page. After the migration that moves to Rust, and the player only plays.

## 03 Library elements in videos

- **Built-in widgets** (file tree, flow, browser frame, phone frame, chart, code, terminal, diagram) are part of the player in the shared UI package. They are not library elements and need no `dep.yaml` entry.
- **Library elements** fill widgets and panels: icons, scene templates, HTML artifacts shown in a frame, and a team's own script widgets. A cue names them as `alias:element`. The alias says which library, so no search order is needed.
- **A script element** follows the widget contract: it receives its cue and its panel, and animates only inside that panel. It runs in a sandboxed frame like other library HTML, so it cannot reach the player around it.
- **A published video** gets every element it names copied into the static output at `/_lib/<alias>/<element>` by `agentks build`, so it plays with no library installed.

## 04 Narration audio

| Voice | Where it comes from | Notes |
|---|---|---|
| The browser's built-in voice | The Web Speech API | Always available, no setup. Quality varies by browser. Timing is estimated |
| A generated voice | A local text-to-speech model, run by the binary | An optional download into `~/.agentks/models/<model>-<version>/`, tens to hundreds of MB, never in the base binary. Kokoro, run through ONNX, is the first candidate |

- **One clip per paragraph.** A clip's length sets its beat's length, and rewording one paragraph regenerates one clip.
- **Word timings** come from the model or from aligning the clip, so a cue can land on the spoken word.
- **Format:** Opus at about 48 kbps, roughly 0.35 MB per minute.
- **Choosing the voice:** the page's frontmatter, else the project default, else the browser voice. The reader can always switch to the browser voice.

## 05 Caching

```
~/.agentks/
  models/<model>-<version>/                        the voice model, once per machine
  libraries/<host>/<repository path>/<commit>/     libraries the videos use
  build-cache/<project key>/
    audio/<hash of text + voice + model>.opus      one clip per paragraph
```

- An audio clip's key is the hash of the paragraph's text, the voice and the model version. Editing one paragraph invalidates one clip. Changing the voice regenerates the whole video.
- Audio lives in the project's build cache, so it goes when that cache is cleaned. A removed clip is regenerated the next time the video plays.
- Nothing here is cleaned automatically ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)).

## 06 Publishing

- `agentks build` writes the video page and its transcript as static HTML. The player is the only island on the page.
- Generated audio is copied into the build output when it exists. A build machine without the voice model either downloads it and generates the audio, or publishes without generated audio, and the player falls back to the browser voice. Audio is never committed to git either way.

## 07 Timing against the migration

- **Can start now:** the player, scenes, widgets and motion style, as browser code in today's engine. They move into the shared UI package unchanged. The video issue plans a second spike (grid scenes, cues, the first widgets) before the full widget set.
- **Waits for the migration:** generated audio and its cache, the voice model download, library downloads and element lookup. They need the `~/.agentks/` home (Phase 1) and libraries (Phase 2). Building them in today's engine would mean building them twice.

## 08 Open

The video issue owns these ([its open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md)): the cue syntax, the voice model, whether to build the second spike first, and what the widgets are written in, which depends on this migration's UI framework choice ([open questions and risks](../01_overview/05_open-questions-and-risks.md)).
