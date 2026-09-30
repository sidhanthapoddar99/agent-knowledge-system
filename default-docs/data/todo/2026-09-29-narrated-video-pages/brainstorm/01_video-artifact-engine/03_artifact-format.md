---
title: "The artifact format"
---

**A video is one YAML file, `NN_<slug>.video.yaml`, holding data only.** The file is the script: slides, the items on each slide, and beats of narration with the actions that go with them. It names library components as `alias:name` and built-in ones by bare name. It holds no code. A three-minute example is 6,983 bytes. The engine checks it against a JSON Schema, then checks every name, anchor and reference, and reports errors an agent can fix without guessing.

## 01 One file, beside its assets

- **File:** `NN_<slug>.video.yaml`, in a docs section or in a tracker issue's `notes/` or `brainstorm/`, the same homes as an HTML artifact. The `NN_` prefix orders it in the sidebar. The double extension tells the engine it is a video and tells editors it is YAML.
- **Images** it uses sit beside it in an `assets/` folder and are named by a relative path, `./assets/shot.webp`. That keeps the video true on disk, the same rule as every document in the project.
- **No sidecar.** The title lives in the file. A `.meta.json` exists for files that cannot say things themselves; a video file can.
- **No generated file is ever written next to it.** Audio and compiled data live in `~/.agentks/`.

### Why YAML and data only

| Option | Verdict |
|---|---|
| **YAML, data only** | Chosen. Reads as a script in any editor, Obsidian or `cat`. Cheapest for an agent: no quotes, no braces unless wanted, block text for code. A JSON Schema checks its shape, and editors can use the same schema |
| JSON | Same model, about 25% more tokens (quotes and braces), and harder to read on disk |
| Markdown with cues (the old plan) | The prose and the visuals fight for the same lines. Cues in comments are invisible to the reader who needs them most: the agent editing the file |
| HTML plus script (HyperFrames style) | 10 to 50 times the tokens, and nothing can check it before it runs |
| A custom language | Needs its own parser, highlighter and docs. YAML already has all three |

**Why no code in the file.** Data can be checked completely before anything plays, and it stays tiny. Anything that needs code, such as an unusual animated diagram, is a library `scripts` component with a contract ([library components](./08_library-components.md)). The video only names it.

## 02 The model in one picture

```
video
├── title, style, voice
└── slides[]
    ├── head               the slide's heading (optional)
    ├── template | layout  a slide template, or a layout of named areas
    ├── bg, in             background, transition into this slide
    ├── items{}            id → one item: text, bullets, code, icon, image, shape,
    │                      arrow, tree, frame, chart, stat or table
    └── beats[]            one spoken unit each
        ├── say            the narration: one or two sentences
        ├── do             actions: "show list.2 rise @Obsidian"
        └── wait           a pause after the beat, in seconds
```

The scene and timing rules are in [scenes and timeline](./04_scenes-and-timeline.md). Placement is in [the layout system](./05_layout-system.md).

## 03 The keys

### Video

| Key | Required | Meaning |
|---|---|---|
| `agentks-video` | yes | The format version, `1`. It makes the file self-identifying, and a later format change gets a migration |
| `title` | yes | Shown in the sidebar, the page and the player |
| `description` | no | One sentence for listings and search |
| `style` | no | A style pack: fonts, sizes, palette roles and default presets. Default: the built-in `plain` |
| `voice` | no | A Kokoro voice id such as `af_heart`, or `browser`. Default: the project default, else the browser voice |
| `rate` | no | Speaking speed, 0.5 to 2. Default 1 |
| `pronounce` | no | How the voice says words it does not know, for this video only: a map from a word to a respelling (`Preact: pree act`) or to phonemes between slashes. Project-wide words go in `config/video.yaml` instead ([the voiceover](./07_voiceover.md#03-pronunciation-and-the-licence-trap)) |
| `aspect` | no | `16:9`, the only value in version 1. The key exists so 1:1 and 9:16 can come later without a format change |
| `slides` | yes | The slides, in order |

### Slide

| Key | Meaning |
|---|---|
| `id` | Optional. Used in errors, in `agentks video info` and by the morph transition. Default `s1`, `s2`, … |
| `head` | The heading, drawn in the header band by the style |
| `template` | A slide template, such as `ks:title`. It brings a layout, placed items and a default choreography. Its slots are filled by other keys on the slide (`title:`, `subtitle:`, `points:` …) |
| `layout` | A layout of named areas, such as `split` or `quad`. Not allowed together with `template` |
| `bg` | A background. Default from the style |
| `in` | The transition into this slide. Default from the style |
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
- **A bare name** (`rise`, `fade`, `split`, `plain`) is a player built-in. Built-ins are a small set that makes a video play with no library installed. Libraries add to them; they never replace one, because the alias keeps the two apart.
- **A missing name is an error**, never a blank. The error lists close names in the same category.

## 05 A complete three-minute video

This file is the reference example for the player spike, the compiler and the skill. Its measured size:

| Measure | Value |
|---|---|
| Bytes on disk | **6,983** |
| Bytes gzipped | about 2,660 (2,658 to 2,690 depending on the gzip tool) |
| Slides · items · beats · actions | 10 · 29 · 27 · 45 (42 anchored to a spoken word) |
| Narration | about 440 words |
| Running time | about 3:04 at 155 words a minute, with transitions and pauses (2:58 at 160, 3:09 at 150) |
| Tokens to write | about 2,000 |

It passes the draft schema in section 07 with a standard validator. Every `@anchor` matches a whole word in its beat. All three counts were re-measured on 2026-10-01 with a script in `/tmp`.

**How far 10 KB goes.** The example spends about 2.3 KB a minute, and narration is most of it. So 10 KB holds about four minutes. The check warns past 10 KB (`video.file-size`), and the skill splits a longer topic into a series of short videos. A series also suits viewers better than one long video.

```yaml
agentks-video: 1
title: How agentks turns files into pages
style: ks:clean
voice: af_heart
slides:
  - template: ks:title
    title: How agentks turns files into pages
    subtitle: A three-minute tour
    beats:
      - say: This is a three-minute tour of agentks. We will follow one markdown file from your disk all the way to a page in your browser.

  - head: The files are the document
    layout: split
    items:
      folder: {icon: ks:folder, at: left, size: xl, label: Your project}
      list: {bullets: [Obsidian, cat and grep, Your editor, An AI agent, The rendered site], at: right}
    beats:
      - say: Everything starts with plain files on disk. The folder of markdown is the source of truth, not the website.
        do: show folder pop @plain
      - say: So every file must read well everywhere. In Obsidian, in cat and grep, in your editor, and to an AI agent walking the tree.
        do: [show list.1 @Obsidian, show list.2 @cat, show list.3 @editor, show list.4 @agent]
      - say: The rendered site is just one more reader.
        do: [show list.5, emph list.5 mark @reader]

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
      - say: If a value could be wrong, Rust computes it. The browser only decides how things look. That keeps every rule in one place.
        do: focus core @Rust

  - head: Start-up builds an index
    layout: split
    items:
      tree: {tree: [config/site.yaml, data/docs/01_intro.md, data/docs/02_setup.md, data/blog/2026-09-30-hello.md], at: left}
      pages: {stat: 1300, label: pages indexed, at: right}
      speed: {stat: 7.8, unit: ms, label: to rebuild the index, at: right}
    beats:
      - say: When you run agentks start, the core walks your folder once.
        do: show tree rise @walks
      - say: It records each file's path, its title, its order and a content hash.
        do: emph tree.data/docs/01_intro.md mark @path
      - say: Folder hashes roll up from their children, so one edit only touches its own branch.
        do: emph tree.data/docs mark @roll
      - say: On this repository that is about thirteen hundred pages, rebuilt in under eight milliseconds.
        do: [show pages count @thirteen, show speed count @eight]

  - head: The render pipeline
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

  - head: From markdown to a page
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

  - head: Small pages, measured
    layout: full
    items:
      chart: {chart: ks:bars, data: {Preact: 8.0, Solid: 11.1, Svelte: 16.5}, unit: KiB}
    beats:
      - say: The web app draws every layout with Preact.
        wait: 0.4
      - say: We measured three frameworks on the same page. Preact shipped eight kilobytes of script, Solid eleven, and Svelte sixteen and a half.
        do: [show chart grow @measured, emph chart.1 glow @eight]
      - say: Less script means the page is ready sooner, on every device. Heavy parts, like the diagram editors, load only on the pages that use them.

  - head: Live updates
    layout: full
    items:
      save: {icon: ks:document, label: You save}
      watch: {icon: ks:refresh, label: Watcher}
      push: {icon: ks:sync, label: WebSocket}
      view: {icon: ks:browser, label: Browser, tone: accent}
      wire: {arrow: save>watch>push>view}
    beats:
      - say: Now edit that file in any editor and save it.
        do: show save pop @save
      - say: The watcher notices, re-hashes the file and its folders, and pushes the new hashes over one WebSocket.
        do: [show watch pop @watcher, show push pop @pushes, show wire draw @pushes, send wire @WebSocket]
      - say: The browser fetches only what changed, and redraws in place. Your scroll position stays where it was.
        do: [show view pop @browser, emph view glow @redraws]

  - head: Publishing
    layout: quad
    items:
      build: {icon: ks:build, at: tl, label: agentks build}
      html: {icon: ks:document, at: tr, label: Static HTML}
      island: {icon: ks:plugin, at: bl, label: Small islands of script}
      cdn: {icon: ks:cdn, at: br, label: Any static host}
    beats:
      - say: To publish, agentks build renders every page to static HTML, once.
        do: [show build pop @build, show html pop @HTML]
      - say: Only the interactive parts, like search, filters and this video player, ship any script.
        do: show island pop @interactive
      - say: The output is plain files. Any static host or CDN can serve it, with no server running.
        do: show cdn pop @host

  - template: ks:closing
    title: Files in, pages out
    subtitle: agentks.neuralabs.org/docs
    beats:
      - say: Files in, pages out. That is the whole idea. The docs go deeper into each part. Thanks for watching.
```

**What the example shows.** Every visual comes from a library name or a built-in kind. No coordinate, colour or keyframe appears anywhere. An item or part that a beat shows starts hidden; everything else, such as each slide's `head`, arrives with the slide. A 3-minute video of this richness would be 10 to 40 MB as an MP4.

## 06 How it is checked

Two layers run in Rust and share one error record. Both run in `agentks check video`, on every page load in the local server, and in `agentks build`. A third layer, layout, runs in the player, for the reason given below.

### Layer 1: the JSON Schema

The schema checks shape: required keys, allowed values, exactly one kind key per item, the action line's rough form, size limits (7 bullets, 12 beats a slide, 400 characters a beat). It is published with the binary (`agentks video schema` prints it) and at a stable URL, so editors can check a file as it is typed.

The raw output of a schema validator is not good enough for an agent. For the broken copy of the example used in testing, a standard validator said `/slides/2/beats/0/do must match a schema in anyOf`. So the engine never prints validator output as is. It maps each failure to the error record below, with the file's line and column The YAML parser must therefore keep the position of every node. The video crate uses the parser the config loader chooses in [030/30](../../../2026-09-29-rust-core-engine-migration/subtasks/030_rust-engine/30_config-loader-and-settings-schema.md), and this design adds node positions to that subtask's requirements now, so the gap is not found late. `saphyr` (MIT or Apache 2.0) reports them. The schema validator is the `jsonschema` crate (MIT), which supports draft 2020-12.

### Layer 2: the meaning checks

Run by the Rust video compiler, after the schema passes:

| Code | Error when |
|---|---|
| `video.unknown-key` | A key is not in the schema, or not a slot of the slide's template. Suggests the nearest key |
| `video.unknown-item` | An action names an item that is not on this slide. Lists the slide's items |
| `video.unknown-part` | `list.9` on a five-item list, `src.12` on seven lines, a tree path that is not in the tree |
| `video.unknown-area` | `at:` names an area the layout does not have. Lists the layout's areas |
| `video.anchor-missing` | `@word` matches no whole word of this beat's `say`, ignoring case and punctuation. `@con` does not match "config". Lists the beat's words |
| `video.unknown-word` | The voice cannot pronounce a word in a `say`, and no pronunciation entry covers it. Checked when the voice helper is installed; otherwise the check prints one note that pronunciation was not checked. Lists every such word and the two places a fix can go |
| `video.verb-kind` | A verb or preset does not fit the target: `send` on an item that is not an arrow, the `count` preset on anything but a stat |
| `video.preset-role` | An exit preset used with `show`, an entrance preset with `hide` |
| `video.asset-missing` | `./assets/x.webp` does not exist on disk |
| `library.unknown-alias` | `xx:rise` names no library in `config/dep.yaml` |
| `library.unknown-element` | The library has no component of that name in that category. Suggests close names and the `agentks library find` command |
| `library.bad-component` | A component the video uses breaks its category contract, including the SVG allowlist (section 06 of [library components](./08_library-components.md)) |

Warnings, which never stop a build:

| Code | Warning when |
|---|---|
| `video.file-size` | The file is larger than 10 KB. Split the topic into a series |
| `video.long-beat` | A beat has more than 40 words |
| `video.dense-slide` | A slide shows more than 6 items or more than 40 words of text at once |
| `video.silent-slide` | A slide has no narration and no `wait` |

### Layer 3: the player's layout diagnostics

Whether text fits, whether items overlap and whether a quadrant is too small depend on the real font. Styles use the site's font stacks, so only the reader's browser knows which font is drawn. Rust could only guess, and a guess that says "fits" when it does not is worse than no answer. So the player owns these checks and reports them:

| Code | Reported when |
|---|---|
| `layout.text-fit` | Text still does not fit its area at the style's smallest size. It is drawn at that size and overflows visibly; it is never clipped |
| `layout.overflow` | An item's box leaves its area or the safe area |
| `layout.overlap` | Two items' boxes overlap, other than an item placed inside a frame |

The player lists them in the review sheet (`?sheet`, see [the player](./06_player.md#07-layout-diagnostics-and-the-review-sheet)), in the local app beside the Rust errors, and as `diagnostic` events. The authoring skill makes the review sheet a gate ([the authoring skill](./10_authoring-skill.md)).

### The error record

The same record the rest of the engine uses, plus the path inside the file:

```text
error[video.anchor-missing] data/dev-docs/05_arch/01_tour.video.yaml:57:31
  slides[4].beats[1].do[0]: "@indexes" is not a word in this beat.
  The beat says: "The core reads the frontmatter, pulls in embedded files, ..."
  help: anchor to a word the narration says, for example @reads or @frontmatter.

error[library.unknown-element] data/dev-docs/05_arch/01_tour.video.yaml:34:37
  slides[2].beats[0].do: "ks:bounce-up" is not an animation in library ks.
  help: close names: ks:bounce-in, ks:rise-up. Run: agentks library find --category animations bounce
```

With `--json`, each error is `{file, line, column, path, code, message, help}`.

## 07 The draft JSON Schema

The example above validates against this draft (checked with a standard 2020-12 validator in `/tmp`). The compiler track owns the final version.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentks.neuralabs.org/schemas/video-1.json",
  "title": "agentks video, format 1",
  "type": "object",
  "required": ["agentks-video", "title", "slides"],
  "additionalProperties": false,
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
    "slides": { "type": "array", "minItems": 1, "maxItems": 80, "items": { "$ref": "#/$defs/slide" } }
  },
  "$defs": {
    "name": { "type": "string", "pattern": "^([a-z][a-z0-9-]*:)?[a-z][a-z0-9-]*$" },
    "id": { "type": "string", "pattern": "^[a-z][a-z0-9_]*$" },
    "place": { "type": "string", "pattern": "^([a-z][a-z0-9_]*|([1-9]|1[0-2])(-([1-9]|1[0-2]))?/[1-6](-[1-6])?)$" },
    "path": { "type": "string", "pattern": "^\\.\\.?/[^\\s]+$" },
    "slot": { "anyOf": [ { "type": "string" }, { "type": "number" }, { "type": "array", "items": { "type": "string" } } ] },
    "slide": {
      "type": "object",
      "required": ["beats"],
      "not": { "required": ["template", "layout"] },
      "properties": {
        "id": { "$ref": "#/$defs/id" },
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
        "code": { "type": "string", "maxLength": 2000 },
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

A slide's extra keys are template slots. The schema accepts any string, number or list there; the compiler checks them against the template's declared slots, and without a template any extra key is `video.unknown-key`.
