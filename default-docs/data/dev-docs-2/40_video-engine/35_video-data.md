---
title: "VideoData"
description: "The contract between the video crate and the player: every field of VideoData, the video page that carries it, and the rules the data keeps."
---

`VideoData` is the compiled video: what the video crate emits and the player plays. Every name in it is resolved, and every time is computed. This page lists its fields, the video page that carries it, and the rules both sides rely on. Read it before you change either side, because a change here is a change to both.

## Where the types come from

The types are Rust structs in `agentks-api`, with every other page shape. The generator writes them into `apps/agentks-engine/schema/api.schema.json`, and the player's `src/data.ts` is generated from that schema, never written by hand. So the crate and the player cannot disagree about a field.

## The video page

A video page is an ordinary `PageData` of kind `video` ([data interface and types](../25_frontend/10_data-interface-and-types.md)). Its common fields (`url`, `hash`, `title`, `source`, `errors` and the rest) work as on any page. Its body has three fields:

| Field | Holds |
|---|---|
| `video` | The `VideoData` |
| `transcript_html` | The narration as HTML, grouped by slide heading, one anchor per beat |
| `audio` | `{ state, ready, total }`: `state` is `ready`, `partial` or `none`, and `ready` of `total` beats have clips |

## The top level

| Field | Holds |
|---|---|
| `format` | The `VideoData` format version, `1` |
| `title` | The video's title |
| `duration` | The last slide's end |
| `style` | A style name: a built-in, or a key of `components.styles` |
| `voice` | `timing`: `estimated` or `generated`. `rate`: the speaking speed the times were computed for. `lang`: the narration's language, such as `en-US`. `stream`: the joined stream's URL, when `timing` is `generated` |
| `components` | The components this video uses, by category, keyed by the name the video wrote. Only what it uses |
| `slides` | The slides, in order |
| `source` | The single file or the video folder, relative to the project |

`components` has one map per category: `styles`, `layouts`, `animations`, `transitions`, `charts`, and the SVG categories `icons`, `frames`, `backgrounds`, `annotations` and `illustrations`. JSON components keep their library shape. SVG is allowlisted text.

## A slide

| Field | Holds |
|---|---|
| `id` | The slide's id: an `id:` key, `s1` and so on, or a scene file's slug |
| `start`, `end` | Its span. The next slide's transition starts at `end` |
| `layout` | A layout name: a built-in, or a key of `components.layouts` |
| `bg` | A background, a key of `components.backgrounds`. Absent means the style's plain surface |
| `in` | The transition into it: `{ name, duration }`. The duration is already in the timeline |
| `items` | The items, in drawing order. The heading is the first, `_head` |
| `beats` | `start`, `speechEnd`, `end`, the `say` text, and `words` |
| `actions` | Sorted by time. Template actions are merged in |
| `source` | Where the slide starts in its file |
| `error` | A content error on this slide: `{ code, message, line }`. The player draws an error slate instead |

A beat's `words` holds one entry per spoken word: `[first char, char after last, start, end]`. The characters index `say`, and the times are milliseconds from the start of the video.

An action has a `verb`, its `targets` (each an `item` and an optional `part` such as `2`, `3-5`, `*` or a tree path), its time `at`, and its `source`. `show`, `hide`, `emph` and `move` carry a `preset`. `stagger` and `dur` are optional seconds; the player falls back to the preset's value, then the style's. `move` carries `to`, the place to move to.

## Items

Every item has an `id`, a `kind` and a `source`. It may have `at` (an area, a span such as `1-6/2-4`, or a frame item's id), `align`, `tone` and `label`.

| `kind` | Its own fields |
|---|---|
| `text` | `text`, `size` (which may be `head`) |
| `bullets` | `entries`, `size` |
| `code` | `lang`, and `lines`: highlighted tokens |
| `icon` | `icon`, a key of `components.icons`; `size` |
| `image` | `src`, a URL the page can load; `alt` |
| `shape` | `shape`: `box`, `pill`, `circle` or `line`; `size` |
| `arrow` | `chain`: the item ids it joins, in order |
| `frame` | `frame`, a key of `components.frames` |
| `tree` | `paths`; `size` |
| `stat` | `value`; `decimals`, the digits after the point as written; `unit`; `size` |
| `chart` | `chart`, a key of `components.charts`; `data` as `[label, value]` pairs; `unit` |
| `table` | The rows. The first row is the header |

## The rules the data keeps

- **Times are integers.** Every timeline field is whole milliseconds from the video's start. Component data copied from a library keeps its own unit, seconds, so inlining is a plain copy.
- **Names resolve or fail.** A bare name is a player built-in. Any other name is a key of `components`. A name found in neither is a player error, `player.unknown-name`, and a bug in the compiler.
- **No hidden flag.** An entrance holds its first keyframe before it starts, so an item some beat shows is hidden until then.
- **SVG ids are placeholders.** Every id is written `__vx__<id>`, and the player gives each use its own prefix.
- **Positions travel with the data.** Slides, items and actions carry `source: { line, column, path }`, so a layout diagnostic can name the line.
- **One video, one `VideoData`.** Both forms compile to the same data, apart from `source`, the slide ids and the positions.

An excerpt of the example video's third slide, shortened:

```json
{
  "id": "one-binary", "start": 33407, "end": 55636, "layout": "thirds", "bg": "ks:soft-grid",
  "in": { "name": "fade", "duration": 600 },
  "items": [
    { "id": "_head", "kind": "text", "text": "One binary, three parts", "size": "head", "at": "head", "align": "bl" },
    { "id": "cli", "kind": "icon", "icon": "ks:terminal", "at": "a", "label": "CLI" }
  ],
  "beats": [
    { "start": 34007, "speechEnd": 38265, "end": 38565,
      "say": "agentks is one binary per machine. Inside it are three parts.",
      "words": [[0, 7, 34007, 34565], [8, 10, 34565, 34775]] }
  ],
  "actions": [
    { "verb": "show", "targets": [{ "item": "cli" }, { "item": "core" }, { "item": "app" }],
      "preset": "pop", "stagger": 0.15, "at": 37427 }
  ]
}
```

## Changing the contract

1. Change the Rust type in `agentks-api`, and regenerate the schema and the player's types.
2. Change the compiler and the player in the same change.
3. Regenerate the golden `VideoData` fixtures and read the diff ([tests](./65_tests.md)).

## Related

- [The compiler](./25_the-compiler.md): how each field is filled.
- [The player](./40_the-player.md): how each field is read.
