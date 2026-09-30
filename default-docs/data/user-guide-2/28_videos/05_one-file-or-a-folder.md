---
title: "One file or a folder"
description: "A short video is one .video.yaml file. A longer one is a folder with a controller and one file per scene. How each is laid out, and how to choose."
---

A video has two forms. A short video is one file. A longer video is a folder of small files, one per scene, so fixing one scene means editing one file. agentks reads both forms into the same video, checks them the same way and gives them the same address. This page shows how each form is laid out and how to choose.

## How to choose

| Write | When |
|---|---|
| A single file, `NN_<slug>.video.yaml` | The video has about five slides or fewer, stays under 4 KB, and has no components of its own. A teaser, or one idea |
| A video folder, `NN_<slug>/` | Anything longer. A video with its own components. A video you expect to fix or extend scene by scene |

When a single file grows past 4 KB, `agentks check video` warns and suggests the folder form. [Size limits and warnings](./55_limits-and-warnings.md) lists every limit.

## A single file

The name ends in `.video.yaml`. The double extension tells agentks that the file is a video, and tells your editor that it is YAML. The file starts with the **header**, the keys that are true of the whole video. The slides follow under `slides:`.

```yaml
agentks-video: 1
title: agentks in thirty seconds
style: ks:clean
voice: af_heart
slides:
  - template: ks:title
    title: agentks in thirty seconds
    subtitle: One binary, three parts
    beats:
      - say: Here is agentks in thirty seconds.
  - head: One binary, three parts
    layout: thirds
    items:
      cli: {icon: ks:terminal, at: a, label: CLI}
      core: {icon: ks:cpu, at: b, label: Rust core, tone: accent}
      app: {icon: ks:browser, at: c, label: Web app}
      link: {arrow: cli>core>app}
    beats:
      - say: agentks is one binary per machine. Inside it are three parts.
        do: show cli+core+app pop stagger=0.15 @three
  - template: ks:closing
    title: Files in, pages out
    subtitle: The docs go deeper
    beats:
      - say: Files in, pages out. Thanks for watching.
```

- Images sit beside the file in an `assets/` folder. The file names each one by a relative path, such as `./assets/shot.webp`.
- A single file has no sidecar file. Its title is inside it.
- Each slide's id is `s1`, `s2` and so on, unless the slide sets `id:`. The id names the slide in errors and in `agentks video info`.

## A video folder

```text
10_tour/
  settings.json        {"kind": "video"}: this folder is one video
  controller.yaml      the header: title, style, voice, pronunciations, defaults
  010_title.yaml       one scene per file, played in prefix order
  020_files.yaml
  030_one-binary.yaml
  components/          optional: components only this video uses
    frames/quote-card.svg
  assets/              optional: the images the scenes show
    tour-intro-page.webp
```

- **`settings.json` marks the folder as a video.** It holds one key: `{"kind": "video"}`. It may also be `settings.jsonc`. The folder is then one page, never a sidebar group, so the group keys `label`, `collapsed` and `isCollapsible` are refused. Any other `kind` value is an error. The folder's name has no `.video`, because the settings file already says it.
- **`controller.yaml` holds the header and nothing else.** Its keys are exactly the ones a single file has above `slides:`. It never lists the scenes.
- **Each scene is one slide in its own file**, `NN_<slug>.yaml`, at the folder's top level. The file holds the slide's keys at its top level, with no `slides:` and no leading `- `.
- **The prefix is the order.** It is the only place the order is written. Number scenes in tens (`010_`, `020_`), so that a new scene fits between two as `035_`. Two scenes with the same prefix value, such as `030_a` and `030_b`, are an error.
- **The slug is the slide's id.** `030_one-binary.yaml` is slide `one-binary` in errors, in `agentks video info` and in the player's messages. A slug uses lower-case letters, digits and hyphens, and starts with a letter. So a scene file cannot set `id:`, and two scenes cannot share a slug.
- **`components/`** holds components that only this video uses. A scene names one as `self:name`. [Library components](./35_library-components.md) explains them.
- **`assets/`** holds the video's images. A scene names one as `./assets/shot.webp`. A path that leaves the folder is an error, `video-asset-outside`. So the folder moves and copies as one piece.
- **Nothing else may sit in the folder.** A markdown note, a YAML file with no prefix, `controller.yml` or any other folder is an error, `video-unknown-file`. Names that start with a dot are skipped.

agentks never writes anything into either form. The voice recordings and the compiled video live in `~/.agentks/`.

## The same address for both forms

A video's address never shows its form. In a section served at `/guide`, both `data/guide/20_tours/10_tour.video.yaml` and the folder `data/guide/20_tours/10_tour/` become the page `/guide/tours/tour`. So switching a video from one form to the other keeps its address. Links on disk name the file or the folder, though, so update them when you switch. [Videos on the site](./60_videos-on-the-site.md) covers links.

## Turn a single file into a folder

No command does this. The steps are short:

1. Create a folder with the file's prefix and slug: `10_tour/` for `10_tour.video.yaml`.
2. Add `settings.json` with `{"kind": "video"}`.
3. Move the header, everything above `slides:`, into `controller.yaml`.
4. Make one scene file for each entry of `slides:`, numbered in tens. Remove the entry's leading `- ` and one level of indent. Drop any `id:`, because the file's slug is the id now.
5. Move the video's images into the folder's own `assets/`.
6. Delete the single file. Find the links that named it with `agentks find '10_tour.video.yaml' --fixed-strings`, and make them name the folder.
7. Run `agentks check video` on the folder.
