---
title: "Videos on the site"
description: "A video is a page in its section, with a player, captions and a transcript, and it has a standalone page of its own. Linking, moving and publishing a video."
---

A video appears on your site in two places. It is a **page** in its docs section, with the player, captions and a transcript. It also has a **standalone page**, where the player fills the whole browser window. Both play the same video from the same files. This page covers what the reader sees, how to link to a video, and how a video is published.

## A video as a page

A video sits among the pages of its section, in the order of its prefix. The sidebar shows the header's `title`. The address drops the prefix, and `.video.yaml` for a single file:

| On disk | Page address, in a section served at `/guide` |
|---|---|
| `data/guide/20_tours/10_tour.video.yaml` | `/guide/tours/tour` |
| `data/guide/20_tours/10_tour/`, a video folder | `/guide/tours/tour` |

A video folder is one page, never a sidebar group. Its scene files, `components/` and `assets/` never become pages of their own.

Videos also live in an issue's `notes/` and `brainstorm/` folders, beside the notes that discuss them. [Brainstorm and notes](../30_issue-tracker/35_brainstorm-and-notes.md) explains those folders.

## What the reader sees

- **The title and the description**, then the player, at the shape of the video. The space is kept before the player loads, so nothing on the page jumps.
- **Before play**, the first slide with its items shown.
- **Captions**, on by default, under the stage. In full screen they show one line at a time at the bottom.
- **The transcript** under the player: the whole narration, grouped by slide heading. It highlights the beat being spoken, and a click on a beat jumps there. It reads without JavaScript, and site search finds its words.
- **In the local app only**, any error from the check and any layout problem from the player, listed on the page.

The video follows the site's theme and its light and dark mode. A slide with an error plays as a plain slate that names the error and its line, and the other slides play as usual.

## The controls

The control bar has play and pause, a scrubber with a mark at each slide (hover it to see the slide's heading), the time, the speed from 0.75 to 2, captions on or off, the voice, and full screen.

| Key | Does |
|---|---|
| Space or K | Play or pause |
| Left, Right | One beat back or forward |
| Shift with Left or Right | One slide back or forward |
| 0 to 9 | Jump to 0% to 90% of the video |
| C | Captions on or off |
| F | Full screen |
| M | Voice off or on |

A video never starts playing with sound on its own. When the reader's system asks for reduced motion, animations become fades and the camera stays still.

## The voice on the page

The page plays the generated voice when every beat is recorded. Until then it uses the browser voice. When you open a video in the local app with the voice helper installed, agentks records the missing beats in the background. The page shows the progress and switches to the generated voice when the last beat is ready. If the reader's browser has no voice for the language, the video plays with captions only and says so. [The voice](./30_the-voice.md) covers recording.

## The standalone page

Every video also has a standalone page at `/artifacts/` followed by the video's path in the project, without `.video.yaml`, and then `.video`. Both forms get the same address:

```text
data/guide/20_tours/10_tour.video.yaml   →   /artifacts/data/guide/20_tours/10_tour.video
data/guide/20_tours/10_tour/             →   /artifacts/data/guide/20_tours/10_tour.video
```

The player fills the window there. It is the address to bookmark, send, or put in an `<iframe>`. agentks writes this page itself, so it holds none of your own HTML. It takes these options:

| Add to the address | Effect |
|---|---|
| `?sheet` | The review sheet: every slide in its final state, with the layout problems |
| `?sheet&slide=4` | Slide 4 at full size |
| `?theme=light` or `?theme=dark` | Light or dark mode |
| `?voice=none` | Captions only, no voice |

`agentks video preview` opens the same page with no server running: see [Checking and previewing](./45_checking-and-previewing.md#watch-it).

## Link to a video

Link to a video the way you link to any page: by its path on disk, relative to your page. Name the file, or name the folder:

```markdown
Watch [the three-minute tour](./20_tours/10_tour.video.yaml) first.
Watch [the three-minute tour](./20_tours/10_tour/) first.
```

Both resolve to the video's page. A link to one file inside a video folder is a link to that file, not to the video.

## Move a video

`agentks move` moves a video like any page and rewrites every link to it. It moves a video folder as one unit; nothing inside needs rewriting, because no path leaves the folder. For a single file, it also rewrites the relative image paths inside the file. Renaming a scene's prefix only reorders the video.

## Publish a video

`agentks build` writes everything a video needs into the static site:

- the video's page, with its transcript in the HTML;
- its standalone page, at `artifacts/<path>.video/`;
- its audio as one file under `_audio/`, about 160 KB for each minute of video;
- the library images it shows, under `_lib/`.

The build records any missing beat when the voice helper is installed. Without the helper and without recordings, it publishes the video with the browser voice and warns. Add `--require-voice` to make that an error, for example in CI. The host must answer range requests for `_audio/`, so the browser can start playing early and jump anywhere; every common static host does. [Publishing](../55_publishing/01_overview.md) covers the build.
