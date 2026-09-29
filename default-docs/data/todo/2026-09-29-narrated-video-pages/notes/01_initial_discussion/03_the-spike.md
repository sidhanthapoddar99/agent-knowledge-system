---
title: "The spike on branch spike/narrated-video"
---

The first implementation lives on **branch `spike/narrated-video`**, commit `8874d1f` on top of `main`. It proves the format: a normal markdown page with `video: true` plays as a narrated video in the browser. A five-minute tour costs a 6.3 KB file (about 1,600–2,000 tokens to write). The user judged it suitable but too basic, which led to [the proper engine](./04_video-engine.md).

# 03 References

- [A proper video engine](./04_video-engine.md)
- [Narration audio](./05_narration-audio.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the spike stays on its own branch, off `main`, until the video work is ready to merge.

# 05 Notes & Analysis

## 01 The format

- `video: true` in frontmatter marks the page.
- The `#` title and the paragraphs before the first `##` are the intro scene.
- Each `##` heading starts a scene.
- A mermaid or graphviz diagram, code block, list, table or lone image is a visual. The stage shows the latest visual above the paragraph being spoken.
- Each paragraph is one beat, spoken in turn.
- **Bold** text in a beat focuses the matching part of the visual: diagram nodes, code lines, list items, table rows. Diagrams also zoom in; lists and tables reveal each item when it is first named.

On disk, in Obsidian or on GitHub, the file reads as an ordinary document. In the site the same text appears below the player as its transcript.

## 02 The files on the branch

| File | Job |
|---|---|
| `agent-ks-engine/src/parsers/postprocessors/video-page.ts` | Marks a `video: true` page: adds the player mount, wraps the transcript |
| `agent-ks-engine/src/scripts/video.ts` | Loads the player only on video pages |
| `agent-ks-engine/src/scripts/video/scenes.ts` | Reads the rendered transcript into scenes and beats |
| `agent-ks-engine/src/scripts/video/stage.ts` | Shows visuals, dims and highlights, moves the camera |
| `agent-ks-engine/src/scripts/video/narrator.ts` | Speaks through the Web Speech API; silent timed fallback |
| `agent-ks-engine/src/scripts/video/player.ts` | Controls, progress by scene, keyboard, voice and speed |
| `agent-ks-engine/src/styles/video.css` | Styles, theme contract variables only |
| dev-docs `05_architecture/07_architecture-tour.md` | The demo: a five-minute architecture tour |

About 900 lines of engine code, shared by every video.

## 03 What was verified

- Screenshots of every scene type in headless Chromium, in light and dark mode; playback advancing on its own; no page errors.
- The theme contract check and `agent-ks check section` pass; the CLI's embedded theme includes `video.css`.
- Not verified: the actual voice. Headless Chromium has no voices, so the silent fallback ran. The user listened in their own browser.

## 04 Known limits

- Voice quality depends on the browser: decent in Chrome and Edge, robotic in Firefox on Linux (espeak-ng).
- Timing is estimated from word counts; the browser gives no durations in advance.
- One visual at a time; focus and zoom are the only motion.
