---
title: "Serving and publishing"
description: "How a video reaches the reader: the video page over /api, the island, the /_audio/ route, the standalone page and its one writer, and what agentks build writes."
---

A compiled video reaches a reader in three ways: as a page in the local app, as a standalone page at its own address, and as static files on a published site. All three play the same `VideoData` with the same player. This page explains each path, and what the server and `agentks build` add for videos. Read it before you change a video route, the video page, or the build's video steps.

## In the local app

1. **The index.** The site index lists the video as a page of kind `video`, with its URL and hash ([the loader](./10_the-loader.md)).
2. **The page data.** When the client asks for the page over `/api`, `agentks-site` calls the video crate and answers with a video page: the usual page fields, plus `video`, `transcript_html` and `audio` ([VideoData](./35_video-data.md)). The answer is cached by its hash, like every page.
3. **The layout.** The video page layout in `agentks-ui` draws the title, the description, the stage's box at 16:9 so nothing jumps when the player mounts, the transcript, and any errors and diagnostics.
4. **The island.** The `video-player` island loads the player chunk on demand and mounts it with the page's `VideoData`. The transcript highlights the current beat, and clicking a beat seeks there ([islands](../25_frontend/20_islands.md)).

**The page's hash.** A video page's render hash covers the video's own bytes (the single file, or the folder's rolled-up hash), every library component it uses, every image it names, `config/video.yaml`, the engine version, and the audio state of each beat. So editing one scene, moving a library pin or finishing a clip each gives the page a new hash, and the server pushes it. An open page refetches and switches to the new data.

## The audio route

| Route | Serves |
|---|---|
| `/_audio/<key>.opus` | A joined stream from `~/.agentks/audio/` |

- **Only hash names.** The route accepts only `<64 hex characters>.opus`. Any other name is a `404`. It cannot reach any other file.
- **Range requests.** It honours `Range`, so the browser streams and seeks.
- **Reserved.** `_audio` is a reserved first URL segment, like `_lib`, so no content page can take it ([HTTP routes](../15_server-and-protocol/05_http-routes.md)).

## The standalone page

Every video also has its own page at `/artifacts/<path>.video`. For a single file, `<path>` is the file's path without `.video.yaml`. For a folder, it is the folder's path. So both forms get the same address.

The page is a small HTML shell that the engine writes: the site's theme CSS, one element, the compiled `VideoData` in a `<script type="application/json">` tag, and the player's `standalone` entry, which calls `start(element, readData(id))`. It fills the window. It is the address to bookmark or to put in an iframe, and it takes the query options of [the review sheet](./45_diagnostics-sheet-and-size.md): `?sheet`, `?sheet&slide=4`, `?theme=light` or `dark`.

**One writer, three callers.** One function in the video crate writes the shell. Three callers share it, and none keeps a copy:

| Caller | Does |
|---|---|
| The server | Answers `/artifacts/<path>.video` |
| `agentks video preview <video> [--sheet]` | Writes the page into the build cache and opens it in a browser, with no server running. Given a scene file, it opens the page at that scene |
| `agentks build` | Writes the page into the output |

The shell is engine HTML, not author HTML. So a video adds nothing to the trust question of `/artifacts/`, where a project's own HTML runs.

## On a published site

`agentks build` handles videos in the same steps as every page ([the build pipeline](../45_publishing/05_build-pipeline.md)):

1. **Compile** every video, as the server does. Any error fails the build.
2. **Voice.** When the helper is installed, generate every missing clip and join each video's stream. When a video still lacks clips and no helper is installed, publish it with the browser voice and print one warning. `--require-voice` turns the warning into an error, for CI.
3. **Pages.** The static renderer writes each video page as HTML: the transcript, the island's markup and props, and the player chunk with a content hash in its name.
4. **Standalone pages** go to `artifacts/<path>.video/index.html`, from the same shell writer.
5. **Files.** Each stream is copied to `_audio/<stream key>.opus`, and each library image a video shows to `_lib/`.

The output gains two folders:

```
dist/
  _audio/<stream key>.opus          one stream per video
  artifacts/<path>.video/index.html one standalone page per video
```

Every copied file has a name that changes only when its content does, so a CDN can cache it for good. A static host must serve range requests for `_audio/`; every common host does. The build writes no MP4 and no rendered frame: only the page, the player chunk, the stream and the images.

## Security

- **A video's files are data.** The engine never runs anything from them.
- **Inlined SVG passes the allowlist,** whether it comes from a library or the folder's own `components/` ([the SVG allowlist](./27_the-svg-allowlist.md)).
- **The standalone page is written by the engine,** so `/artifacts/` serves no author HTML for a video.
- **`/_audio/` serves only files named by their hash.**

## Related

- [What the output holds](../45_publishing/15_output.md): the rest of the build's output.
- [Clips, streams and the audio store](./55_clips-streams-and-the-store.md): where the streams come from.
- [The player](./40_the-player.md): what runs on every one of these pages.
