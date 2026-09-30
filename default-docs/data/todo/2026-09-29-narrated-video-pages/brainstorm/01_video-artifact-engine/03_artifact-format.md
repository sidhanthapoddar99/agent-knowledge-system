---
title: "The artifact format"
---

**A video is data only, in YAML, in one of two forms. A short video is one file, `NN_<slug>.video.yaml`. A longer one is a folder, `NN_<slug>/`: a `settings.json` that marks it as a video, a `controller.yaml` for the whole video, and one small file per scene.** Both forms hold the same things: slides, the items on each slide, and beats of narration with the actions that go with them. One loader reads both into one model, so the checks, the timeline and the compiled data are shared. The files name library components as `alias:name`, the folder's own components as `self:name`, and built-in ones by bare name. They hold no code. The complete three-minute example is a folder with a 91-byte controller and ten scene files of 202 to 909 bytes. The engine checks every file against a JSON Schema, then checks every name, anchor and reference. Each error names the file to change, so an agent can fix it without guessing.

## 01 One file or a folder

| | One file | A folder |
|---|---|---|
| On disk | `NN_<slug>.video.yaml` | `NN_<slug>/` with `settings.json`, `controller.yaml`, one `NN_<scene>.yaml` per slide, and optionally `components/` and `assets/` |
| Use it for | A short video: about five slides, under 4 KB, with no components of its own. A teaser, or one idea | Anything longer, a video with its own components, or a video that will be fixed and extended scene by scene |
| To fix slide 6, an agent reads | The whole file | `060_<scene>.yaml`, plus `controller.yaml` when the fix is video-wide |
| A link names | `./01_tour.video.yaml` | `./01_tour/` |
| Page URL and standalone page | The same in both forms, so moving a video from one form to the other never changes its address | |

Both forms live where an HTML artifact lives: in a docs section, or in a tracker issue's `notes/` or `brainstorm/`. The `NN_` prefix orders the video among its neighbours. No generated file is ever written into either form. Audio and compiled data live in `~/.agentks/`.

**Why both forms stay.** A 30-second teaser reads best as one file, top to bottom, and a folder of three files would be ceremony. A three-minute video is easier to fix as ten small files, because an agent changes one scene without reading or rewriting the rest. One loader reads both forms into one model, and one schema document checks both. So the second form costs one branch in the loader, not a second compiler. When a single file grows past 4 KB, the check warns and suggests the folder form (section 06).

### The one file

- **Name:** `NN_<slug>.video.yaml`. The double extension tells the engine it is a video and tells editors it is YAML.
- **Content:** the header keys (section 03), then `slides:`, the list of slides.
- **Images** sit beside it in `assets/` and are named by a relative path, `./assets/shot.webp`. That keeps the video true on disk, the same rule as every document in the project.
- **No sidecar.** The title lives in the file. A `.meta.json` exists for files that cannot say things themselves; a video file can.

### The folder

```text
NN_<slug>/
  settings.json        {"kind": "video"}: this folder is one video page
  controller.yaml      the header: title, style, voice, pronunciations, default transition and background
  010_<scene>.yaml     one slide per file, played in prefix order
  020_<scene>.yaml
  …
  components/          optional: this video's own components, one folder per category
    frames/<name>.svg
    slides/<name>.json
  assets/              optional: the images the scenes name as ./assets/…
```

- **`settings.json` marks the folder.** It holds one key, `"kind": "video"`. The site index already reads every folder's settings file, so it tells a video folder from a docs folder with no extra read. The file follows the project's settings rules: JSON or JSONC, and `settings.jsonc` wins when both exist. A video folder is one page, never a sidebar group, so the group keys `label`, `collapsed` and `isCollapsible` are refused. The title is the controller's. The folder name carries no `.video`, because `settings.json` already says it and one fact has one source.
- **`controller.yaml` holds the header and nothing else.** Its keys are exactly the ones a single file has above `slides:`. It never lists the scenes, because their file names already give their order. It has no `NN_` prefix, so it can never be taken for a scene. It is YAML, not JSON, for the same reasons as the whole format (below): fewer tokens, comments allowed, and the same parser with node positions and the same schema as every other video file. `settings.json` stays JSON because it is the project's folder-settings file, read for every folder.
- **Scene files are `NN_<slug>.yaml`, one slide each, at the folder's top level.** A scene file holds the slide's keys at its top level, with no `slides:` and no leading `- `. The prefix is the scene's place in the video, and the only place its order is written. Number scenes in tens (`010_`, `020_` …), so a new scene fits between two (`035_`) without renaming the rest. The slug is the slide's id: `030_one-binary.yaml` is slide `one-binary` in errors, in `agentks video info` and in the player's diagnostics. A slug is lower-case letters, digits and hyphens.
- **Nothing else may sit in the folder.** A file the form does not name is an error, `video-unknown-file`, so a stray file is never silently ignored. That covers a YAML file without a prefix, `controller.yml`, a markdown note, and any folder other than `components/` and `assets/`. Names that start with a dot are skipped, as everywhere in the index.

### Who owns what

Every fact has one home. The controller holds what is true of the whole video. A scene holds what is true of its slide.

| Fact | Home | Why there |
|---|---|---|
| The order of the scenes | The scene files' `NN_` prefixes | The project orders everything by prefix. A list in the controller would state the order twice |
| Title, description, format version, aspect | `controller.yaml` | One of each per video |
| Style | `controller.yaml` | One style makes every slide look made by one hand |
| Voice, rate and `pronounce:` | `controller.yaml` | One consistent voice per video. A word said in scene 3 is often said again in scene 7, so pronunciations are video-wide |
| The default transition (`in:`) and background (`bg:`) | `controller.yaml` | Written once, so transitions match from scene to scene. The style supplies them when the controller does not |
| One slide's own transition or background | That scene's `in:` or `bg:` | The exception sits beside the slide it changes |
| Items, the layout or template, the heading | The scene file | They are the slide |
| Narration and actions | The scene file's `beats` | Each scene has its own voiceover and its own animation |
| Captions | The scene's `say` text | Captions are the narration. The player shows them by default and the reader can switch them off. No key sets them |
| A morph into a slide | The later scene: its `in: morph`, and the item ids it shares with the scene before it | Only the slide that morphs knows which items should glide |

**Which value wins.** For `in:`, the slide's own value, then the header's, then the style's. For `bg:`, the slide's own value, then its template's, then the header's, then the style's. A single file follows the same rule, with its header in place of the controller.

**Scene files join as smoothly as slides in one file.** The compiler puts every scene on one timeline and joins the whole video's voice into one audio stream. So the cut between two scene files is exactly the transition into the second, as it is between two slides of one file. A file boundary never reaches the player.

### The video's own components

A folder video may carry components that only it uses, in `components/<category>/`, the same structure as a library. The compiler reads that folder as a library with no manifest: a file's category is its folder, and its name is its file name without the extension. It uses the same library resolver and the same Rust contract checks as every library, so a local component must meet its category's contract ([library components](./08_library-components.md#06-the-contract-of-each-category)). SVG passes the same allowlist.

- **A typed field names one as `self:name`**, for example `frame: self:quote-card` or `template: self:versus`. `self` always means this folder's `components/`. There is no path and no search order. A `self:` name that the folder does not have is an error, and the compiler never falls back to a library component of the same name.
- **Allowed categories** are the ones a video can name: icons, illustrations, backgrounds, frames, annotations, charts, layouts, slides, animations, transitions and styles. `images` is refused because images go in `assets/`. `widgets` is refused because videos do not use them. `scripts` and `fonts` wait for a later version.
- **A local component follows the library contract.** Inside it, `self:` names another of the video's components and a bare name is a built-in. It cannot name a library component; the scene that uses it can.
- **`self` is reserved.** `config/dep.yaml` refuses it as an alias. A single-file video has no `components/`, so `self:` in one is an error that suggests the folder form.
- A local component worth sharing moves to a library unchanged. Its uses change from `self:name` to `alias:name`.

### Images in a folder

A folder video keeps its images inside itself, in its own `assets/`. A scene names one as `./assets/shot.webp`. Paths are relative to the scene file, and every scene file sits at the folder's top level, so `./assets/` means the same folder from every scene. A path that leaves the folder is an error, `video-asset-outside`. That keeps the folder whole: it moves, copies and gets reviewed as one piece, and `agentks move` never has to rewrite a path inside it.

### Why YAML and data only

| Option | Verdict |
|---|---|
| **YAML, data only** | Chosen. Reads as a script in any editor, Obsidian or `cat`. Cheapest for an agent: no quotes, no braces unless wanted, block text for code. A JSON Schema checks its shape, and editors can use the same schema |
| JSON | Same model, about 25% more tokens (quotes and braces), no comments, and harder to read on disk |
| Markdown with cues (the old plan) | The prose and the visuals fight for the same lines. Cues in comments are invisible to the reader who needs them most: the agent editing the file |
| HTML plus script (HyperFrames style) | 10 to 50 times the tokens, and nothing can check it before it runs |
| A custom language | Needs its own parser, highlighter and docs. YAML already has all three |

**Why no code in the files.** Data can be checked completely before anything plays, and it stays tiny. Anything that needs code, such as an unusual animated diagram, is a library `scripts` component with a contract ([library components](./08_library-components.md)). The video only names it.

## 02 The model in one picture

```
video                     one model, from either form
├── header                title, style, voice, rate, pronounce, in, bg
│                         a single file's top keys, or controller.yaml
└── slides[]              a single file's slides:, or one NN_<slug>.yaml each, in prefix order
    ├── id                s1, s2 … or an id: key in a single file; the file's slug in a folder
    ├── head              the slide's heading (optional)
    ├── template | layout a slide template, or a layout of named areas
    ├── bg, in            background, transition into this slide
    ├── items{}           id → one item: text, bullets, code, icon, image, shape,
    │                     arrow, tree, frame, chart, stat or table
    └── beats[]           one spoken unit each
        ├── say           the narration: one or two sentences
        ├── do            actions: "show list.2 rise @Obsidian"
        └── wait          a pause after the beat, in seconds
```

Every node keeps the file, line and column it came from, so an error always names the file to change. The scene and timing rules are in [scenes and timeline](./04_scenes-and-timeline.md). Placement is in [the layout system](./05_layout-system.md).

## 03 The keys

### Header

In a single file these keys sit above `slides:`. In a folder they are the whole of `controller.yaml`.

| Key | Required | Meaning |
|---|---|---|
| `agentks-video` | yes | The format version, `1`. It makes the file self-identifying, and a later format change gets a migration |
| `title` | yes | Shown in the sidebar, the page and the player |
| `description` | no | One sentence for listings and search |
| `style` | no | A style pack: fonts, sizes, palette roles and default presets. Default: the built-in `plain` |
| `voice` | no | A Kokoro voice id such as `af_heart`, or `browser`. Default: the project default, else the browser voice |
| `rate` | no | Speaking speed, 0.5 to 2. Default 1 |
| `pronounce` | no | How the voice says words it does not know, for this video only: a map from a word to a respelling (`Preact: pree act`) or to phonemes between slashes. Project-wide words go in `config/video.yaml` instead ([the voiceover](./07_voiceover.md#03-pronunciation-and-the-licence-trap)) |
| `in` | no | The transition into every slide that does not name its own. Default: the style's |
| `bg` | no | The background of every slide that does not name its own. Default: the style's |
| `aspect` | no | `16:9`, the only value in version 1. The key exists so 1:1 and 9:16 can come later without a format change |
| `slides` | in a single file | The slides, in order. A controller has no `slides`: each scene is its own file |

### Slide

A slide is one entry of `slides:` in a single file, or the whole of one scene file in a folder.

| Key | Meaning |
|---|---|
| `id` | In a single file, optional; default `s1`, `s2`, … In a folder, the scene file's slug is the id, so the key is refused. The id is a slug in both forms: lower-case letters, digits and hyphens, starting with a letter. Hyphens are allowed and underscores are not, the same rule as a scene file's slug. Used in errors, in `agentks video info` and in the player's diagnostics |
| `head` | The heading, drawn in the header band by the style |
| `template` | A slide template, such as `ks:title`. It brings a layout, placed items and a default choreography. Its slots are filled by other keys on the slide (`title:`, `subtitle:`, `points:` …) |
| `layout` | A layout of named areas, such as `split` or `quad`. Not allowed together with `template` |
| `bg` | A background. Default: the template's, then the header's `bg`, then the style's |
| `in` | The transition into this slide. Default: the header's `in`, then the style's |
| `items` | A map from item id to item. The order is the drawing order |
| `beats` | The narration and its actions, in order |

### Item

An item has exactly one **kind key**, which also carries its main content. The other keys are shared.

| Kind key | Value | Parts an action can address |
|---|---|---|
| `text` | a string | none |
| `bullets` | a list of strings, 1 to 7 | `list.2`, `list.*` |
| `code` | a block of text; `lang:` names the language | lines: `src.3`, `src.3-5` |
| `icon` | a library icon, `ks:server` | none |
| `image` | `./assets/x.webp`, or a library image | none |
| `shape` | `box`, `pill`, `circle` or `line`; `label:` is its text | none |
| `arrow` | a chain of item ids, `a>b>c` | segments: `line.1` (a to b), `line.*` |
| `tree` | a list of file paths; folders are built from them | a path: `tree.data/docs` |
| `frame` | a library frame, `ks:browser-frame` | none; other items can sit inside it |
| `chart` | a library chart, `ks:bars`, with `data:` and `unit:` | marks: `chart.1`, `chart.*` |
| `stat` | a number, with `unit:` and `label:` | none |
| `table` | a list of rows; the first row is the header | rows: `table.2` |

| Shared key | Meaning |
|---|---|
| `at` | Where: an area name from the layout, a grid span such as `1-6/2-4`, or the id of a frame item |
| `align` | Inside the area: `tl t tr l c r bl b br`. Default `c` |
| `size` | `s`, `m`, `l` or `xl`, from the style's scale |
| `tone` | A colour role: `accent`, `muted`, `good`, `warn`, `bad`, `info` |
| `label` | A caption under an icon, stat or frame; the text inside a shape |
| `lang`, `unit`, `data` | Kind-specific, as above |

### Beat

| Key | Meaning |
|---|---|
| `say` | The narration, spoken and shown as captions and transcript. Up to about 40 words |
| `do` | One action, or a list of actions |
| `wait` | Seconds of silence after the beat. A beat with only `wait` is a silent pause |

### Action

One short line. The full grammar and the verbs are in [scenes and timeline](./04_scenes-and-timeline.md#03-actions).

```
verb targets [preset] [key=value ...] [@anchor]

show list.2 rise @Obsidian
emph core pulse
show cli+core+app pop stagger=0.15 @three
send wire @WebSocket
```

Targets join with `+`, never a comma, because a comma inside a YAML `[...]` list splits the action in two. The schema test below caught exactly that mistake in the first draft of the example.

## 04 Naming library components

- **Typed fields carry the category.** `icon:` looks in icons, `image:` in images and illustrations (names are unique within a library, so this is never ambiguous), `frame:` in frames, `chart:` in charts, `bg:` in backgrounds, `in:` in transitions, a preset in animations, `template:` in slides, `layout:` in layouts, `style:` in styles. So a name never needs a path or a category prefix.
- **`alias:name`** names a library component. The alias is the key in the project's `config/dep.yaml`. The default library's alias in the starter template is `ks`.
- **`self:name`** names a component in a folder video's own `components/` (section 01). `self` is reserved and never names a library.
- **A bare name** (`rise`, `fade`, `split`, `plain`) is a player built-in. Built-ins are a small set that makes a video play with no library installed. Libraries add to them; they never replace one, because the alias keeps the two apart.
- **A missing name is an error**, never a blank. The error lists close names in the same category and the same place: the same library, or the folder's own `components/`.

## 05 A complete three-minute video

This folder is the reference example for the compiler and the skill. It sits in this design's `assets/` so that it is not itself a page.

| File | Bytes | Holds |
|---|---|---|
| [settings.json](./assets/example-video/settings.json) | 22 | `{"kind": "video"}` |
| [controller.yaml](./assets/example-video/controller.yaml) | 91 | The title, the style and the voice |
| [010_title.yaml](./assets/example-video/010_title.yaml) | 234 | The title slide, from the `ks:title` template |
| [020_files.yaml](./assets/example-video/020_files.yaml) | 702 | The files are the document |
| [030_one-binary.yaml](./assets/example-video/030_one-binary.yaml) | 722 | One binary, three parts |
| [040_index.yaml](./assets/example-video/040_index.yaml) | 834 | Start-up builds an index |
| [050_pipeline.yaml](./assets/example-video/050_pipeline.yaml) | 909 | The render pipeline |
| [060_markdown-to-page.yaml](./assets/example-video/060_markdown-to-page.yaml) | 796 | From markdown to a page, with a screenshot |
| [070_small-pages.yaml](./assets/example-video/070_small-pages.yaml) | 559 | Small pages, measured: a bar chart |
| [080_live-updates.yaml](./assets/example-video/080_live-updates.yaml) | 739 | Live updates |
| [090_publishing.yaml](./assets/example-video/090_publishing.yaml) | 666 | Publishing |
| [100_closing.yaml](./assets/example-video/100_closing.yaml) | 202 | The closing slide, from the `ks:closing` template |
| [assets/tour-intro-page.webp](./assets/example-video/assets/tour-intro-page.webp) | 27,544 | The screenshot that slide 6 shows in its browser frame |

| Measure | Value |
|---|---|
| YAML on disk | 6,454 bytes in eleven files. The largest scene is 909 bytes |
| All the YAML, gzipped together | about 2,620 bytes |
| Slides · items · beats · actions | 10 · 29 · 27 · 45 (42 anchored to a spoken word) |
| Narration | 439 words |
| Running time | about 3:04 at 155 words a minute, with transitions and pauses (2:58 at 160, 3:09 at 150) |
| Tokens to write | about 2,000 |

The controller passes the draft schema in section 07 as a controller, and each scene passes as a scene, with a standard validator. Every `@anchor` matches a whole word in its beat. Read into one model, the folder equals the same video written as one file, key for key. All of this was checked on 2026-10-01 with a script in `/tmp`.

**A known duplication:** `010_title.yaml` repeats the controller's `title` word for word, so renaming the video means changing both files, and the example keeps it so the folder stays equal to the single-file fixture key for key.

**The same video as one file** is 6,983 bytes. It is the player spike's fixture. It is past the 4 KB limit for one file, so `agentks check video` warns about it and suggests the folder form. Both forms compile to the same `VideoData`, apart from `source`, the slide ids and the source positions.

**controller.yaml**

```yaml
agentks-video: 1
title: How agentks turns files into pages
style: ks:clean
voice: af_heart
```

**030_one-binary.yaml**

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
  - say: If a value could be wrong, Rust computes it. The browser only decides how things look. That keeps every rule in one place.
    do: focus core @Rust
```

**060_markdown-to-page.yaml**

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

The other eight scenes have the same shape. Each is linked in the table above.

**What the example shows.** Every visual comes from a library name or a built-in kind. No coordinate, colour or keyframe appears anywhere. An item or part that a beat shows starts hidden; everything else, such as each slide's `head`, arrives with the slide. The example uses no component of its own, so it has no `components/` folder; the skill's second example has one ([the authoring skill](./10_authoring-skill.md)). A 3-minute video of this richness would be 10 to 40 MB as an MP4.

### A short video as one file

A 25-second teaser, adapted from three of the example's scenes. It is 1,058 bytes and 49 words. It passes the draft schema, and its five anchors match whole words.

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
      - say: The CLI runs commands. The Rust core holds every rule. And a small web app shows the result.
        do: [emph cli pulse @CLI, emph core pulse @core, show link draw @rule, emph app pulse @web]
  - template: ks:closing
    title: Files in, pages out
    subtitle: agentks.neuralabs.org/docs
    beats:
      - say: Files in, pages out. The docs go deeper into each part. Thanks for watching.
```

**How big a file may grow.** The example spends about 2.1 KB of YAML a minute, most of it narration, and no scene reaches 1 KB. So the limits are 4 KB for a single-file video (about five slides), 2 KB for a scene file or a controller, and 600 words of narration (about four minutes) for a whole video in either form. The warnings are in section 06.

## 06 How it is checked

Two layers run in Rust and share one error record. Both run in `agentks check video`, on every page load in the local server, and in `agentks build`. A third layer, layout, runs in the player, for the reason given below.

### Loading

One loader reads a video into the model of section 02 before either layer runs. Given a `.video.yaml` file, it reads the header and the slides from that file. Given a folder whose `settings.json` says `"kind": "video"`, or any file inside one, it reads `controller.yaml`, then every scene file in prefix order, and mounts `components/` as the `self` library. Every node keeps its file, line and column. The loader is the only code that knows which form it read: the layers below, the timeline and the compiled data never ask.

### Layer 1: the JSON Schema

The schema checks shape: required keys, allowed values, exactly one kind key per item, the action line's rough form, size limits (7 bullets, 12 beats a slide, 400 characters a beat, 1,200 characters a code block). In a folder, the controller and each scene are checked on their own against their entry in the schema, so a schema error's path starts inside the file that has it. The schema is published with the binary (`agentks video schema` prints it) and at a stable URL, so editors can check a file as it is typed.

The raw output of a schema validator is not good enough for an agent. For the broken copy of the example used in testing, a standard validator said `/slides/2/beats/0/do must match a schema in anyOf`. So the engine never prints validator output as is. It maps each failure to the error record below, with the file's line and column. The YAML parser must therefore keep the position of every node. The video crate uses the parser the config loader chooses in [030/30](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md), and this design adds node positions to that subtask's requirements now, so the gap is not found late. `saphyr` (MIT or Apache 2.0) reports them. The schema validator is the `jsonschema` crate (MIT), which supports draft 2020-12.

### Layer 2: the meaning checks

Run by the Rust video compiler, after the schema passes:

| Code | Error when |
|---|---|
| `video-unknown-key` | A key is not in the schema, or not a slot of the slide's template. Suggests the nearest key. A header key in a scene file (`style`, `voice`, `pronounce` …) or `slides` in a controller names the file where it belongs |
| `video-unknown-item` | An action names an item that is not on this slide. Lists the slide's items |
| `video-unknown-part` | `list.9` on a five-item list, `src.12` on seven lines, a tree path that is not in the tree |
| `video-unknown-area` | `at:` names an area the layout does not have. Lists the layout's areas |
| `video-anchor-missing` | `@word` matches no whole word of this beat's `say`, ignoring case and punctuation. `@con` does not match "config". Lists the beat's words |
| `video-unknown-word` | The voice cannot pronounce a word in a `say`, and no pronunciation entry covers it. Checked when the voice helper is installed; otherwise the check prints one note that pronunciation was not checked. Lists every such word and the two places a fix can go |
| `video-verb-kind` | A verb or preset does not fit the target: `send` on an item that is not an arrow, the `count` preset on anything but a stat |
| `video-preset-role` | An exit preset used with `show`, an entrance preset with `hide` |
| `video-duplicate-id` | Two slides share an id. In a folder, two scene files have the same slug |
| `video-morph-unmatched` | A slide with `in: morph` shares no item id with the slide before it, or is the first slide. Lists the previous slide's item ids and its file |
| `video-asset-missing` | `./assets/x.webp` does not exist on disk |
| `video-asset-outside` | A path in a folder video leaves the folder |
| `video-no-controller` | A folder marked as a video has no `controller.yaml` |
| `video-no-scenes` | A video folder has no scene file |
| `video-unknown-file` | A video folder holds something the form does not name: a YAML file without an `NN_` prefix or with a slug that breaks the rule, `controller.yml`, a markdown file, a folder other than `components/` and `assets/`. Lists what a video folder may hold |
| `video-duplicate-prefix` | Two scene files have the same prefix value (`030_a` and `030_b`, or `030_` and `30_`). Order must never depend on a tie-break by name |
| `library-unknown-alias` | `xx:rise` names no library in `config/dep.yaml`; or a single-file video uses `self:`, which only a video folder has |
| `library-unknown-element` | The library, or the folder's own `components/`, has no component of that name in that category. Suggests close names and the `agentks library find` command |
| `library-bad-component` | A component the video uses, from a library or from its own `components/`, breaks its category contract, including the SVG allowlist (section 06 of [library components](./08_library-components.md)) |

Warnings, which never stop a build:

| Code | Warning when |
|---|---|
| `video-file-size` | One file is past its limit: a single-file video past 4 KB (move it to the folder form), or a scene file or a controller past 2 KB (split the scene). It measures one file's bytes on disk, never the whole video. A `code` item holds at most 1,200 characters, about 30 lines, so one code block leaves room for the rest of its scene inside 2 KB. A longer block belongs in an image or a trimmed excerpt |
| `video-long-video` | The narration passes 600 words, about four minutes, in either form. Split the topic into a series. It counts words, not seconds, so it gives the same answer with the browser voice and with generated clips |
| `video-long-beat` | A beat has more than 40 words |
| `video-dense-slide` | A slide shows more than 6 items or more than 40 words of text at once |
| `video-silent-slide` | A slide has no narration and no `wait` |

### Checking one scene

`agentks check video <scene file>` is how an agent checks the scene it just changed. The loader still reads the whole folder, because a scene depends on the controller (its style and its default transition) and on the scene before it (for a morph). Every check runs. The output lists every error in that scene file and in `controller.yaml` in full, then one line that counts the errors in the other files. The exit status is 1 when the video has any error, wherever it is, because a scene never plays alone. `agentks video info` and `agentks video preview` also take a scene file, and show that scene.

### Layer 3: the player's layout diagnostics

Whether text fits, whether items overlap and whether a quadrant is too small depend on the real font. Styles use the site's font stacks, so only the reader's browser knows which font is drawn. Rust could only guess, and a guess that says "fits" when it does not is worse than no answer. So the player owns these checks and reports them:

| Code | Reported when |
|---|---|
| `layout-text-fit` | Text still does not fit its area at the style's smallest size. It is drawn at that size and overflows visibly; it is never clipped |
| `layout-overflow` | An item's box leaves its area or the safe area |
| `layout-overlap` | Two items' boxes overlap, other than an item placed inside a frame |

The player lists them in the review sheet (`?sheet`, see [the player](./06_player.md#07-layout-diagnostics-and-the-review-sheet)), in the local app beside the Rust errors, and as `diagnostic` events. Each names the slide by its number and id, and the item's line. It does not name the file. In a folder video the slide id is the scene file's slug, so the scene file is the one file `NN_<id>.yaml` in the folder, and `agentks video info <video> --slide <id>` prints its path. The authoring skill makes the review sheet a gate ([the authoring skill](./10_authoring-skill.md)).

### The error record

The same record the rest of the engine uses, plus the path inside the file. `file` is always the file to change: a single file, a scene, the controller or a component. The path starts inside that file.

```text
error[video-anchor-missing] data/dev-docs/05_arch/01_tour/050_pipeline.yaml:14:20
  beats[1].do[0]: "@indexes" is not a word in this beat.
  The beat says: "The core reads the frontmatter, pulls in embedded files, ..."
  help: anchor to a word the narration says, for example @reads or @frontmatter.

error[library-unknown-element] data/dev-docs/05_arch/01_tour/030_one-binary.yaml:10:27
  beats[0].do: "ks:bounce-up" is not an animation in library ks.
  help: close names: ks:bounce-in, ks:rise-up. Run: agentks library find --category animations bounce

error[video-unknown-key] data/dev-docs/05_arch/01_tour/070_small-pages.yaml:1:1
  style: a scene cannot set the video's style.
  help: set style in controller.yaml, in this folder.
```

In a single file the same errors name `01_tour.video.yaml` and a path such as `slides[4].beats[1].do[0]`. With `--json`, each error is `{file, line, column, path, code, message, help}`.

## 07 The draft JSON Schema

One schema document checks both forms. Its root checks a single file. `#/$defs/controller` checks a controller and `#/$defs/scene` checks a scene file. All three are built from the same two definitions, `header` and `slide`, so the forms cannot drift apart. `agentks video schema` prints the document, and an editor can point at each entry by its fragment. The example folder and the teaser above validate against this draft (checked with a standard 2020-12 validator in `/tmp`, which also refused a controller with `slides`, a scene with `id` and a single file with an unknown key). The compiler track owns the final version.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentks.neuralabs.org/schemas/video-1.json",
  "title": "agentks video, format 1",
  "$ref": "#/$defs/file",
  "$defs": {
    "file": {
      "description": "A single-file video, NN_<slug>.video.yaml: the header and its slides",
      "$ref": "#/$defs/header",
      "required": ["slides"],
      "properties": {
        "slides": { "type": "array", "minItems": 1, "maxItems": 80, "items": { "$ref": "#/$defs/slide" } }
      },
      "unevaluatedProperties": false
    },
    "controller": {
      "description": "controller.yaml in a video folder: the header alone",
      "$ref": "#/$defs/header",
      "unevaluatedProperties": false
    },
    "scene": {
      "description": "NN_<slug>.yaml in a video folder: one slide; its id is the file's slug",
      "$ref": "#/$defs/slide",
      "not": { "required": ["id"] }
    },
    "header": {
      "type": "object",
      "required": ["agentks-video", "title"],
      "properties": {
        "agentks-video": { "const": 1 },
        "title": { "type": "string", "minLength": 1, "maxLength": 120 },
        "description": { "type": "string", "maxLength": 300 },
        "aspect": { "enum": ["16:9"] },
        "style": { "$ref": "#/$defs/name" },
        "voice": { "type": "string", "pattern": "^(browser|[a-z]{2}_[a-z]+)$" },
        "rate": { "type": "number", "minimum": 0.5, "maximum": 2 },
        "pronounce": {
          "type": "object", "maxProperties": 40,
          "propertyNames": { "pattern": "^[A-Za-z][A-Za-z0-9'.-]*$" },
          "additionalProperties": { "type": "string", "minLength": 1, "maxLength": 60 }
        },
        "bg": { "$ref": "#/$defs/name" },
        "in": { "$ref": "#/$defs/name" }
      }
    },
    "name": { "type": "string", "pattern": "^([a-z][a-z0-9-]*:)?[a-z][a-z0-9-]*$" },
    "id": { "type": "string", "pattern": "^[a-z][a-z0-9_]*$" },
    "slug": { "type": "string", "pattern": "^[a-z][a-z0-9-]*$" },
    "place": { "type": "string", "pattern": "^([a-z][a-z0-9_]*|([1-9]|1[0-2])(-([1-9]|1[0-2]))?/[1-6](-[1-6])?)$" },
    "path": { "type": "string", "pattern": "^\\.\\.?/[^\\s]+$" },
    "slot": { "anyOf": [ { "type": "string" }, { "type": "number" }, { "type": "array", "items": { "type": "string" } } ] },
    "slide": {
      "type": "object",
      "required": ["beats"],
      "not": { "required": ["template", "layout"] },
      "properties": {
        "id": { "$ref": "#/$defs/slug" },
        "template": { "$ref": "#/$defs/name" },
        "layout": { "$ref": "#/$defs/name" },
        "head": { "type": "string", "maxLength": 80 },
        "bg": { "$ref": "#/$defs/name" },
        "in": { "$ref": "#/$defs/name" },
        "items": {
          "type": "object",
          "propertyNames": { "$ref": "#/$defs/id" },
          "additionalProperties": { "$ref": "#/$defs/item" }
        },
        "beats": { "type": "array", "minItems": 1, "maxItems": 12, "items": { "$ref": "#/$defs/beat" } }
      },
      "additionalProperties": { "$ref": "#/$defs/slot" }
    },
    "item": {
      "type": "object",
      "additionalProperties": false,
      "oneOf": [
        { "required": ["text"] }, { "required": ["bullets"] }, { "required": ["code"] },
        { "required": ["icon"] }, { "required": ["image"] }, { "required": ["shape"] },
        { "required": ["arrow"] }, { "required": ["tree"] }, { "required": ["frame"] },
        { "required": ["chart"] }, { "required": ["stat"] }, { "required": ["table"] }
      ],
      "properties": {
        "text": { "type": "string", "maxLength": 300 },
        "bullets": { "type": "array", "minItems": 1, "maxItems": 7, "items": { "type": "string", "maxLength": 90 } },
        "code": { "type": "string", "maxLength": 1200 },
        "icon": { "$ref": "#/$defs/name" },
        "image": { "anyOf": [ { "$ref": "#/$defs/path" }, { "$ref": "#/$defs/name" } ] },
        "shape": { "enum": ["box", "pill", "circle", "line"] },
        "arrow": { "type": "string", "pattern": "^[a-z][a-z0-9_]*(>[a-z][a-z0-9_]*)+$" },
        "tree": { "type": "array", "minItems": 1, "maxItems": 24, "items": { "type": "string" } },
        "frame": { "$ref": "#/$defs/name" },
        "chart": { "$ref": "#/$defs/name" },
        "stat": { "type": "number" },
        "table": { "type": "array", "minItems": 2, "maxItems": 8, "items": { "type": "array", "items": { "type": ["string", "number"] } } },
        "data": { "type": "object", "minProperties": 1, "maxProperties": 12, "additionalProperties": { "type": "number" } },
        "lang": { "type": "string", "pattern": "^[a-z0-9+#-]+$" },
        "unit": { "type": "string", "maxLength": 12 },
        "label": { "type": "string", "maxLength": 60 },
        "at": { "$ref": "#/$defs/place" },
        "align": { "enum": ["tl", "t", "tr", "l", "c", "r", "bl", "b", "br"] },
        "size": { "enum": ["s", "m", "l", "xl"] },
        "tone": { "enum": ["accent", "muted", "good", "warn", "bad", "info"] }
      }
    },
    "beat": {
      "type": "object",
      "minProperties": 1,
      "additionalProperties": false,
      "properties": {
        "say": { "type": "string", "minLength": 1, "maxLength": 400 },
        "do": {
          "anyOf": [
            { "$ref": "#/$defs/action" },
            { "type": "array", "minItems": 1, "items": { "$ref": "#/$defs/action" } }
          ]
        },
        "wait": { "type": "number", "minimum": 0, "maximum": 10 }
      }
    },
    "action": { "type": "string", "pattern": "^(show|hide|emph|move|send|focus|unfocus)( [^ @]+)*( @[^ ]+)?$" }
  }
}
```

A slide's extra keys are template slots. The schema accepts any string, number or list there; the compiler checks them against the template's declared slots, and without a template any extra key is `video-unknown-key`. The schema cannot see file names, so the loader checks them: the scene prefix and slug, the controller's name and the settings file's `kind`.
