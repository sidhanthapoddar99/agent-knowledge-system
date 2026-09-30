---
title: "The loader"
description: "How the video crate reads a single-file video or a video folder into one model, and the folder rules it enforces."
---

A video comes in two forms: one file for a short video, or a folder of small files for a longer one. The loader reads either form into one model. This page explains how a video is found, how each form is read, and which folder rules the loader enforces. Read it before you change what a video folder may hold or how its files are ordered.

## Two forms, one model

| | Single-file video | Video folder |
|---|---|---|
| On disk | `NN_<slug>.video.yaml` | `NN_<slug>/` |
| Header | The keys above `slides:` | `controller.yaml` |
| Slides | The list under `slides:` | One scene file per slide, `NN_<slug>.yaml` |
| Own components | None | `components/<category>/`, named `self:name` |
| Images | `assets/` beside the file | `assets/` inside the folder |

**The loader is the only code that knows which form it read.** The checks, the timeline and `VideoData` never ask. So the second form costs one branch in the loader, not a second compiler. Both forms of the same video compile to the same `VideoData`, apart from `source`, the slide ids and the source positions.

## How a video is found

The site index finds videos while it walks a section. It needs no help from the video crate.

- **A single file.** A file named `NN_*.video.yaml`, in a docs section or in a tracker issue's `notes/` or `brainstorm/`, is a page of kind `video`. Its slug drops the prefix and `.video.yaml`.
- **A folder.** An `NN_` folder whose settings file (`settings.json` or `settings.jsonc`) says `"kind": "video"` is one page of kind `video`. The index does not descend into it, so its scene files are never pages, and its `components/` and `assets/` need no settings file. The sidebar label is the controller's `title`. The folder's rolled-up hash covers every file inside, so editing one scene changes the page's hash.
- **The settings rules.** `kind` has one value, `video`. Any other value is a `settings-invalid` error, never a guess. The group keys `label`, `collapsed` and `isCollapsible` are refused, because a video folder is never a sidebar group.

## Reading a single file

The loader parses the file with the line and column of every node. The keys above `slides:` become the header, and each entry of `slides:` a slide. A slide's id is its `id:` key, or `s1`, `s2` and so on. An id is a slug: lower-case letters, digits and hyphens, starting with a letter.

## Reading a folder

1. **The controller.** `controller.yaml` holds exactly the keys a single file has above `slides:`. It never lists the scenes. Without it, the video has a `video-no-controller` error.
2. **The scenes.** Every `NN_<slug>.yaml` file at the folder's top level is one slide, in order of its prefix's value. The slug is the slide's id, so a scene file refuses an `id:` key. No scene file at all is `video-no-scenes`.
3. **Order without ties.** Two scene files with the same prefix value, such as `030_a` and `030_b`, or `030_` and `30_`, are `video-duplicate-prefix`. Two with the same slug are `video-duplicate-id`. Order never rests on a tie-break nobody wrote.
4. **Components.** `components/` is mounted as the library `self`, through the same resolver as every library ([the compiler](./25_the-compiler.md)).
5. **Nothing else.** Any other entry is `video-unknown-file`: a YAML file without a prefix, a slug that breaks the rule, `controller.yml`, a markdown note, or a folder other than `components/` and `assets/`. Names that start with a dot are skipped, as everywhere in the index.

## The model

```
video
├── header      title, description, style, voice, rate, pronounce, in, bg, aspect
└── slides[]    in order: a single file's slides:, or the scene files by prefix
    ├── id      s1, s2 … or an id: key; a scene file's slug
    ├── head, template or layout, bg, in
    ├── items{} item id → one item, in drawing order
    └── beats[] say, do, wait
```

Every node keeps the file, line and column it came from. That is how every later error names the file to change.

## Who owns each fact

The header owns what is true of the whole video: the title, the style, the voice, the rate, the pronunciations, and the default transition and background. A slide owns its items, layout or template, heading, beats and actions, and its own transition or background when it differs. A header key written in a scene file is an error that names `controller.yaml` as its home.

## Paths inside a video

- **Images are relative paths**, such as `./assets/shot.webp`, relative to the file that names them. Every scene file sits at the folder's top level, so `./assets/` is the same folder from every scene.
- **A folder keeps its images inside itself.** A path that leaves the folder is `video-asset-outside`, and a missing file is `video-asset-missing`. So `agentks move` moves a video folder as one unit, rewrites the links to it, and rewrites nothing inside. For a single file, `move` rewrites its `image:` paths, which it gets from the video crate.
- **Links.** A link to `./01_tour/` resolves to the video's page, as a link to `./01_tour.video.yaml` does. A single file and a folder with the same slug in one place claim one URL, and the shared slug-collision pool settles them.

## One scene in context

`agentks check video <scene file>` still loads the whole folder, because a scene depends on the controller for its style and default transition, and on the scene before it for a morph. The command prints the errors in that scene and in `controller.yaml` in full, then counts the rest. It exits 1 when the video has any error, because a scene never plays alone.

## Related

- [The site index](../10_engine/30_index.md): folder settings, rolled-up hashes and the walk.
- [The schema and the error record](./15_schema-and-the-error-record.md): what runs on the model next.
- The user guide's [one file or a folder](../../user-guide-2/28_videos/05_one-file-or-a-folder.md): the two forms from the author's side.
