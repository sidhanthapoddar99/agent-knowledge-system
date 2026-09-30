---
title: "Checking and previewing"
description: "Check a video with agentks check video, read its timeline with video info, and look at every slide with video preview and the review sheet."
---

Three commands tell you whether a video is right. `agentks check video` checks the files and names every error. `agentks video info` prints the timeline, so you can check the pacing without playing the video. `agentks video preview` opens the video in your browser, and its review sheet shows every slide on one screen. None of them needs a running server.

## Check the files

```bash
agentks check video data/guide/20_tours/10_tour.video.yaml     # a single file
agentks check video data/guide/20_tours/10_tour                # a video folder
agentks check video data/guide/20_tours/10_tour/050_pipeline.yaml   # one scene, checked with its folder
agentks check video data/guide                                 # every video under a folder
```

The check runs in two layers:

1. **The shape.** Every file is checked against the video schema: required keys, allowed values, exactly one kind key per item, and the size limits. In a folder, the controller and each scene are checked on their own, so an error points inside the file that has it.
2. **The meaning.** agentks then checks every name, part, area, anchor and path: an action that names an item the slide does not have, an anchor that is not a spoken word, a component no library has, an image that is not on disk.

The same checks run when the local server loads a video and when `agentks build` runs. The command exits with 1 when the video has an error. Warnings alone exit with 0; [Size limits and warnings](./55_limits-and-warnings.md) lists them.

Each error names the file to change, the line and the column, and the path of the value inside that file. It then says what is wrong and how to fix it:

```text
error[video-anchor-missing] data/guide/20_tours/10_tour/050_pipeline.yaml:14:20
  beats[1].do[0]: "@indexes" is not a word in this beat.
  The beat says: "The core reads the frontmatter, pulls in embedded files, ..."
  help: anchor to a word the narration says, for example @reads or @frontmatter.

error[video-unknown-key] data/guide/20_tours/10_tour/070_small-pages.yaml:1:1
  style: a scene cannot set the video's style.
  help: set style in controller.yaml, in this folder.
```

In a single file, the same errors name the `.video.yaml` file and a path such as `slides[4].beats[1].do[0]`. With `--json`, each error is an object with `file`, `line`, `column`, `path`, `code`, `message` and `help`.

## Read the timeline

agentks works out every time from the narration. `agentks video info` prints the result: each slide, each beat and each action, with its time.

```text
$ agentks video info data/guide/20_tours/10_tour --slide pipeline
slide 5 pipeline  050_pipeline.yaml  "The render pipeline"   24.5 s   estimated voice
  in fade                                      0.00 –  0.60
  beat 1  "A page is rendered only…"           0.60 –  4.47   10 words
     0.60  show fm+embeds+md+links+html rise stagger=0.1
     3.52  show line draw                @asks
  beat 2  "The core reads the frontmatter…"    4.77 – 10.19   14 words
     5.34  send line                     @reads
     5.97  emph fm pulse                 @frontmatter
  …
```

- `--slide` takes a slide's number or its id, and the output names the slide's file.
- Given a scene file, `video info` shows only that scene.
- Before the voice is recorded, times are an estimate of 155 words a minute, and the output says `estimated voice`. With recorded audio, times come from the recordings, and it says `generated voice`. Run it again after recording, because real timings move actions.

Keep each slide between 8 and 30 seconds. Something on screen should change every 3 to 6 seconds.

## Watch it

```bash
agentks video preview data/guide/20_tours/10_tour            # play the video
agentks video preview data/guide/20_tours/10_tour --sheet    # the review sheet
```

`video preview` writes the video's standalone page into your project's build cache and opens it in your browser. It needs no server. Given a scene file, it opens the video at that scene. On a running server, the same page is at `/artifacts/<path>.video`; [Videos on the site](./60_videos-on-the-site.md) explains the address.

## The review sheet

The **review sheet** draws every slide in its final state, with every item shown, on one screen. For a slide that morphs, it also draws the middle of the morph. Beside the slides, it lists every layout problem the player found, and it outlines each one on its slide.

| Add to the address | Effect |
|---|---|
| `?sheet` | The review sheet |
| `?sheet&slide=4` | Slide 4 at full size |
| `?theme=light` or `?theme=dark` | Light or dark mode |

The player checks each slide's final state for three problems:

| Code | Means |
|---|---|
| `layout-text-fit` | Text does not fit its area even at the style's smallest size. It is drawn at that size and spills over |
| `layout-overflow` | An item leaves its area, or the slide's safe margin |
| `layout-overlap` | Two items overlap, other than an item inside a frame |

The player finds these, not the check, because only the browser knows which font it draws. Each one names the slide by its number and id, the item, and the item's line. The local app also lists them on the video's page, beside the check's errors.

**Look before you call a video done.** A video that passes the check can still be crowded, cut off or ugly. Open the review sheet in light mode and in dark mode. Fix every problem it lists. Then look at every slide for crowding, code cut off in a frame, an arrow that crosses an item and text too small to read. Open any doubtful slide at full size, fix it and look again. An agent takes one screenshot of the sheet in each mode.

## The schema for your editor

`agentks video schema` prints the video schema. Its root checks a single file, and its `#/$defs/controller` and `#/$defs/scene` entries check a folder's files. Point your editor's YAML support at it to get errors as you type.
