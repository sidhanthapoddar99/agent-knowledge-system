---
title: "Fixing one scene"
description: "In a video folder, a problem lives in one file and the fix touches only that file. How to find the file an error names, check it, look at it, and add or move a scene."
---

In a video folder, each scene is its own file. So a problem lives in one file, and the fix should touch only that file. You read one small scene, change a few lines and check that scene, without reading or rewriting the rest. This page shows the steps, how to find the file behind each kind of error, and how to add, move or drop a scene.

## The steps

1. **Read the error.** It names the file to change.
2. **Open that file.** Open `controller.yaml` as well only when the fix is video-wide: the style, the voice, a pronunciation or the default transition.
3. **Fix it**, and check the scene:

   ```bash
   agentks check video data/guide/20_tours/10_tour/050_pipeline.yaml
   ```

4. **Look at it** on the review sheet, which opens at that scene:

   ```bash
   agentks video preview data/guide/20_tours/10_tour/050_pipeline.yaml --sheet
   ```

   For a scene that morphs, look at the scene before it too.

## Which file an error names

| The error comes from | It names | So open |
|---|---|---|
| `agentks check video` | The file, the line and the column: a scene, the controller or a component | That file |
| The player's layout check (`layout.…`) | The slide's number, its id and the item's line, but not the file | The scene whose slug is the id |

A slide's id in a folder is its scene file's slug, and slugs are unique in a folder. So for `layout-overlap  slide 3 one-binary, line 5`, the file is the one scene named `NN_one-binary.yaml`. To get its path, ask:

```bash
agentks video info data/guide/20_tours/10_tour --slide one-binary
```

## Checking one scene

`agentks check video <scene file>` still reads the whole folder, because a scene depends on the controller for its style and default transition, and on the scene before it for a morph. Every check runs. The output lists each error in that scene and in `controller.yaml` in full, then one line that counts the errors in the other files.

The command exits with 1 when the video has an error anywhere, even in another scene, because a scene never plays alone.

## Add, move or drop a scene

Only the scene files' names say what the video holds and in what order. Nothing else lists the scenes, so nothing else changes.

| To | Do |
|---|---|
| Add a scene | Create a file with a free number between its neighbours: `035_cache.yaml` between `030_` and `040_` |
| Move a scene | Rename its prefix |
| Drop a scene | Delete its file |
| Rename a slide's id | Rename the file's slug |

After a move or a drop, check the scene that now follows the change. If it morphs, it may no longer share an item with the scene before it, and the check reports `video-morph-unmatched`.

## The errors you will meet most

| Error | Fix |
|---|---|
| `video-anchor-missing` | Anchor to a word the beat really says, or change the sentence |
| An action split in two | Join targets with `+`, never with a comma |
| `video-unknown-item` | Use an item id from this slide; the error lists them |
| `video-unknown-area` | Use one of the areas the error lists for that layout |
| `video-unknown-key` in a scene | A video-wide key such as `style`, `voice` or `pronounce` belongs in `controller.yaml` |
| `video-unknown-word` | Add the word to `pronounce:`, with a respelling in plain words |
| `video-morph-unmatched` | Give the moving items the same ids as in the scene before, or drop `in: morph` |
| `video-dense-slide` | Split the slide in two, or show its items in turn |
| `library-unknown-element` | Take one of the names the error suggests, or run `agentks library find` |
| `layout-text-fit`, `layout-overflow` | Shorten the text, give the item a bigger area, or drop the slide's heading to free space |
| `layout-overlap` | Give each item its own area, or let items share one area so they arrange themselves |

## Rules for a clean fix

- **Change only the file the error names.** Rewriting other scenes risks changes nobody asked for.
- **Write the scene order only in the prefixes.** Rename a prefix to move a scene.
- **Keep images inside the folder.** Copy an image into the folder's `assets/`, never point outside it.
- **Leave no diagnostic behind.** Fix every one, or say which one remains and why.

The same steps work for a single-file video, except that the error names the one file and a path such as `slides[4]`. When fixes there start to touch many slides, move the video into the folder form: [One file or a folder](./05_one-file-or-a-folder.md#turn-a-single-file-into-a-folder) shows how.
