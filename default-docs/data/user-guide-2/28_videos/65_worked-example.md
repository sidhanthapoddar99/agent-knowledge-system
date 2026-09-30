---
title: "Worked example: a three-minute tour"
description: "A complete three-minute video as a folder of eleven small files: what each file holds, four scenes in full, and how to check and preview it."
---

This page walks through a complete video: "How agentks turns files into pages", a three-minute tour that follows one markdown file from disk to a page in the browser. It is a video folder of eleven small files and one screenshot. Four of its scenes are shown in full, each for what it teaches.

## The folder

```text
data/guide/20_tours/10_tour/
  settings.json
  controller.yaml
  010_title.yaml … 100_closing.yaml    ten scenes
  assets/
    tour-intro-page.webp                the screenshot scene 6 shows
```

| File | Bytes | Holds | Teaches |
|---|---|---|---|
| `settings.json` | 22 | `{"kind": "video"}` | The marker that makes the folder one video |
| `controller.yaml` | 91 | The title, the style and the voice | The header |
| `010_title.yaml` | 234 | The title slide | A template filled by slots |
| `020_files.yaml` | 702 | The files are the document | Showing list entries on mention |
| `030_one-binary.yaml` | 722 | One binary, three parts | Areas of a layout, an arrow, a camera focus |
| `040_index.yaml` | 834 | Start-up builds an index | A file tree, and stats that count up |
| `050_pipeline.yaml` | 909 | The render pipeline | Items that arrange themselves, a packet along an arrow |
| `060_markdown-to-page.yaml` | 796 | From markdown to a page | Items inside frames, typed code, a screenshot |
| `070_small-pages.yaml` | 559 | Small pages, measured | A chart, and a pause |
| `080_live-updates.yaml` | 739 | Live updates | A flow of icons |
| `090_publishing.yaml` | 666 | Publishing | The four quadrants |
| `100_closing.yaml` | 202 | The closing slide | A second template |

In numbers: 10 slides, 29 items, 27 beats, 45 actions and 439 words of narration. That runs about three minutes. All the YAML is 6.5 KB, and the largest scene is 909 bytes. The same video as a single file would be about 7 KB, past the 4 KB limit, which is why it is a folder.

## The header

```yaml
# controller.yaml
agentks-video: 1
title: How agentks turns files into pages
style: ks:clean
voice: af_heart
```

## A template: 010_title.yaml

```yaml
template: ks:title
title: How agentks turns files into pages
subtitle: A three-minute tour
beats:
  - say: This is a three-minute tour of agentks. We will follow one markdown file from your disk all the way to a page in your browser.
```

The template brings the layout, the placed title and subtitle, a background and their motion. The slide only fills the two slots and speaks. It has no items and no actions of its own.

## Arranging and sending: 050_pipeline.yaml

```yaml
head: The render pipeline
layout: full
items:
  fm: {shape: pill, label: Frontmatter}
  embeds: {shape: pill, label: Embeds}
  md: {shape: pill, label: Markdown}
  links: {shape: pill, label: Links}
  html: {shape: pill, label: HTML, tone: accent}
  line: {arrow: fm>embeds>md>links>html}
beats:
  - say: A page is rendered only when someone asks for it.
    do: [show fm+embeds+md+links+html rise stagger=0.1, show line draw @asks]
  - say: The core reads the frontmatter, pulls in embedded files, and turns markdown into HTML.
    do: [send line @reads, emph fm pulse @frontmatter, emph embeds pulse @embedded, emph md pulse @markdown]
  - say: Then it resolves every relative link to a real address, and sets the heading ids.
    do: emph links pulse @resolves
  - say: The result is cached by its hash, so the second request costs almost nothing. Nothing is rendered twice.
    do: emph html glow @cached
```

- No item has an `at`. All five pills land in `main`, the only area of `full`, and arrange themselves into one even row.
- The arrow takes no place of its own. It draws between the pills, on the word "asks".
- `send line @reads` moves a dot along the arrow as the voice says "reads". Each stage then pulses as it is named.

## Frames and code: 060_markdown-to-page.yaml

```yaml
head: From markdown to a page
layout: split
items:
  editor: {frame: ks:code-frame, at: left, label: 01_intro.md}
  src:
    at: editor
    lang: markdown
    code: |
      ---
      title: Intro
      ---

      # Getting started

      Read the [setup guide](./02_setup.md).
  browser: {frame: ks:browser-frame, at: right, label: /docs/intro}
  shot: {image: ./assets/tour-intro-page.webp, at: browser}
beats:
  - say: Here is the file on disk. A title in the frontmatter, a heading, and a relative link.
    do: [show editor fade, show src type @file, emph src.2 mark @title, emph src.7 mark @link]
  - say: And here is the same page in the browser, inside the docs layout, with the link already pointing at the right place.
    do: [show browser+shot rise @browser, emph browser pulse @link]
```

- `at: editor` puts the code on the screen of the frame `editor`, and `at: browser` puts the screenshot on the browser's screen.
- `show src type` types the code in, line by line. `emph src.2 mark` highlights line 2, the title, on the word "title".
- The screenshot sits in the folder's own `assets/`, so the folder moves as one piece.

## A chart and a pause: 070_small-pages.yaml

```yaml
head: Small pages, measured
layout: full
items:
  chart: {chart: ks:bars, data: {Preact: 8.0, Solid: 11.1, Svelte: 16.5}, unit: KiB}
beats:
  - say: The web app draws every layout with Preact.
    wait: 0.4
  - say: We measured three frameworks on the same page. Preact shipped eight kilobytes of script, Solid eleven, and Svelte sixteen and a half.
    do: [show chart grow @measured, emph chart.1 glow @eight]
  - say: Less script means the page is ready sooner, on every device. Heavy parts, like the diagram editors, load only on the pages that use them.
```

- The chart waits for the word "measured", because a beat shows it. Then `emph chart.1 glow` lights the first bar as the voice says "eight".
- The numbers are spoken as words, "sixteen and a half", while the chart shows the figures.
- `wait: 0.4` leaves a short pause after the first beat. The last beat has no actions: the picture holds while the voice explains.

## Pronunciations

The narration says three words the voice does not know: agentks, frontmatter and WebSocket. The starter template's `config/video.yaml` already says how to pronounce agentks. The project adds the other two:

```yaml
# config/video.yaml
pronounce:
  frontmatter: front matter
  WebSocket: web socket
```

Without these entries, the check reports each word as `video-unknown-word` when the voice helper is installed.

## Check and watch it

```bash
agentks check video data/guide/20_tours/10_tour
agentks video info data/guide/20_tours/10_tour
agentks video preview data/guide/20_tours/10_tour --sheet
```

With the pronunciations in place, the check finds nothing to report. `video info` prints each slide's length, so you can see the pacing. The review sheet shows all ten slides and lists no layout problem, in light and dark mode.

## What to take from it

- Every picture comes from a built-in kind or a library name. No coordinate, colour or keyframe appears anywhere.
- Items that a beat shows start hidden. Everything else, such as each slide's heading, arrives with the slide.
- 42 of the 45 actions sit on a word the voice says, so the picture follows the narration however it is reworded.
- Each scene is small enough to read, fix and check on its own.
