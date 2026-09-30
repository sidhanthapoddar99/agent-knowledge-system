---
title: "Videos"
description: "A video is a small YAML file or folder of slides, narration and one-line actions. agentks checks it, and the browser plays it live with a voiceover."
---

A video in agentks is a narrated explainer: slides that build up while a voice explains them. You write it as data in YAML: the slides, the items on each slide, the narration, and one-line actions that say what moves and when. agentks checks the files. Then a small program in the reader's browser, the **player**, draws and animates the slides live, with a voiceover. No video file is ever made. There is no MP4 to store, and the voice recordings stay in a cache on your machine, never in git.

## What a video looks like on disk

Here is one slide. It has a heading, three icons joined by an arrow, and two beats of narration. A **beat** is one or two spoken sentences with the actions that happen while they are spoken.

```yaml
head: One binary, three parts
layout: thirds
items:
  cli: {icon: ks:terminal, at: a, label: CLI}
  core: {icon: ks:cpu, at: b, label: Rust core, tone: accent}
  app: {icon: ks:browser, at: c, label: Web app}
  link: {arrow: cli>core>app}
beats:
  - say: agentks is one binary per machine. Inside it are three parts.
    do: show cli+core+app pop stagger=0.15 @three
  - say: The CLI runs commands. The Rust core holds every rule. And a small web app shows the result.
    do: [emph cli pulse @CLI, emph core pulse @core, show link draw @rule, emph app pulse @web]
```

Read it as a script:

- `layout: thirds` splits the slide into three areas, `a`, `b` and `c`. Each icon picks one with `at`.
- `ks:terminal` is an icon from a library. `ks` is the name the starter template gives the default library.
- `show cli+core+app pop @three` makes the three icons pop in as the voice says "three".
- No pixel, colour or keyframe appears anywhere. The layout places things, the style sets sizes and colours, and your site's theme decides light and dark.

## When a video is the right choice

A video earns its cost when order and timing carry the meaning:

- a request flowing through a system, or a pipeline of steps;
- a before and after;
- a tour of a codebase or a product;
- a number that needs a build-up.

Use something else when the reader needs to search, scan or copy:

| Content | Use instead |
|---|---|
| Reference material, API details, anything a reader searches | A markdown page |
| A dashboard, a chart to explore, a design sheet | An [artifact page](../10_writing-content/50_artifact-pages.md) |
| A topic that needs more than about four minutes | A series of short videos |

## Two forms

| Form | On disk | Use it for |
|---|---|---|
| Single file | `NN_<slug>.video.yaml` | A short video: about five slides, under 4 KB, with no components of its own |
| Video folder | `NN_<slug>/`, with `settings.json`, `controller.yaml` and one file per scene | Anything longer, or a video you will fix scene by scene |

Both forms hold the same things, pass the same checks and get the same address. [One file or a folder](./05_one-file-or-a-folder.md) shows each one.

## Where videos live

Videos live where artifact pages live: in a docs section, and in an issue's `notes/` and `brainstorm/` folders. The `NN_` prefix orders a video among its neighbours, like any page. A video's images sit in an `assets/` folder, beside a single file or inside a video folder.

## How to make one

1. **The message.** Write one sentence the viewer should remember.
2. **The outline.** One idea per slide. A three-minute video has 8 to 12 slides.
3. **The narration.** Write all of it before any item, and read it aloud in your head.
4. **The slides.** Give each a layout or a template, and place its items.
5. **The actions.** Show each thing on the word that names it.
6. **Check** with `agentks check video`, and fix every error in the file it names.
7. **Pace** with `agentks video info`. Keep every slide between 8 and 30 seconds.
8. **Look** at every slide with `agentks video preview --sheet`, in light and dark mode, and fix every layout problem it lists.

An AI agent with the agentks plugin follows the same steps through its `agentks-video` skill. [Using agentks with AI](../05_getting-started/25_using-with-ai.md) covers the plugin.

## Terms

| Term | Meaning |
|---|---|
| **Slide** | One screen of the video |
| **Scene** | One slide in its own file, in a video folder |
| **Item** | One thing on a slide: text, a list, code, an icon, an image, a chart and so on |
| **Beat** | One or two sentences of narration, with the actions that happen while they are spoken |
| **Action** | One line in a beat that moves something, such as `show list.2 rise @Obsidian` |
| **Preset** | A named animation, such as `rise` or `pulse` |
| **Layout** | A set of named areas on a slide, such as `left` and `right` |
| **Template** | A ready-made slide from a library, filled in with a few keys |
| **Component** | A reusable piece from a library: an icon, a frame, a preset, a template, a style |

## In this section

| Page | Read it to |
|---|---|
| [One file or a folder](./05_one-file-or-a-folder.md) | Lay out a video in either form, and choose between them |
| [The header and the style](./10_the-header-and-style.md) | Set the title, the style and the video-wide defaults |
| [Slides, layouts and templates](./15_slides-and-layouts.md) | Place items on the grid, use templates, transitions and backgrounds |
| [Items](./20_items.md) | Use the twelve kinds of item |
| [Narration and actions](./25_narration-and-actions.md) | Write beats and actions, and time them to spoken words |
| [The voice](./30_the-voice.md) | Install the voice, pick one, and fix how words are said |
| [Library components](./35_library-components.md) | Name components from libraries and from the video's own folder |
| [Component contracts](./40_component-contracts.md) | Write your own frames, presets, templates and styles |
| [Checking and previewing](./45_checking-and-previewing.md) | Check a video, read its timeline and look at every slide |
| [Fixing one scene](./50_fixing-one-scene.md) | Find the file an error names and fix only that |
| [Size limits and warnings](./55_limits-and-warnings.md) | Keep a video lean, and know what the check warns about |
| [Videos on the site](./60_videos-on-the-site.md) | Know what the reader sees, link to a video and publish it |
| [Worked example](./65_worked-example.md) | Read a complete three-minute video, file by file |
