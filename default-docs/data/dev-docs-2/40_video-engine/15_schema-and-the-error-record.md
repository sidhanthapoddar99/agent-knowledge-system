---
title: "The schema and the error record"
description: "The three check layers, the one JSON Schema document with its three entries, and how a schema failure becomes a record an agent can act on."
---

A video is checked in three layers. This page covers the first: the JSON Schema that checks every file's shape. It also covers the error record that every layer shares, because the record is what an agent reads to fix a video. Read it before you change the schema or the way video errors are printed.

## Three layers

| Layer | Runs in | Checks |
|---|---|---|
| 1. The schema | The video crate | Shape: required keys, allowed values, sizes |
| 2. The meaning checks | The video crate | Names, anchors, references and the folder rules ([the meaning checks](./20_the-meaning-checks.md)) |
| 3. Layout | The player, in the browser | Text that does not fit, items that leave their area or overlap ([diagnostics](./45_diagnostics-sheet-and-size.md)) |

Layers 1 and 2 run in `agentks check video`, whenever the server builds a video page, and in `agentks build`. Layer 2 runs only on files that pass layer 1. Layer 3 needs the real font, so only the player can run it.

## One schema document

The schema is JSON Schema draft 2020-12, with the `$id` `https://agentks.neuralabs.org/schemas/video-1.json`. One document checks both forms, through three entries:

| Entry | Checks |
|---|---|
| The root | A single-file video: the header and `slides`, 1 to 80 of them |
| `#/$defs/controller` | `controller.yaml`: the header alone. `slides` is refused |
| `#/$defs/scene` | A scene file: one slide. `id` is refused, because the file's slug is the id |

All three are built from two shared definitions, `header` and `slide`, so the forms cannot drift apart. `agentks video schema` prints the document, and an editor can point at each entry by its fragment. `agentks video schema --component <category>` prints the schema of one component category instead.

**What the schema enforces.** `agentks-video: 1` and a `title` in every header. `aspect` accepts only `16:9`. `rate` is 0.5 to 2, and `pronounce` holds at most 40 entries. Each item has exactly one kind key. A slide may have a `template` or a `layout`, not both. The limits keep slides small: 7 bullets, 12 beats a slide, 400 characters a beat, 1,200 characters a code block, 8 table rows, 24 tree paths and 12 chart values. An action must have the rough form `verb targets … @anchor`, with one of the seven verbs.

**Template slots.** A slide's extra keys are the slots of its template. The schema accepts a string, a number or a list there. The compiler checks them against the template's declared slots. On a slide without a template, any extra key is `video-unknown-key`.

**What the schema cannot see.** File names. The loader checks the scene prefixes and slugs, the controller's name and the settings file's `kind` ([the loader](./10_the-loader.md)).

## From a validator failure to a record

The video crate parses YAML with `saphyr-parser`, the parser the config crate uses, and keeps the line and column of every node. It validates with the `jsonschema` crate.

**It never prints the validator's output.** For a broken action, a standard validator says `/slides/2/beats/0/do must match a schema in anyOf`. That tells an agent nothing it can act on. So the crate maps each failure to one record:

- at the failing node's line and column;
- with the path inside the file, such as `beats[0].do`;
- with a message in plain English, and a fix when the crate knows one.

A key the schema does not name is `video-unknown-key`, with the nearest key suggested. A header key found in a scene file, such as `style`, names `controller.yaml` as the place it belongs. Every other shape failure is `video-invalid`.

## The error record

A video problem is an ordinary `ErrorRecord` ([the error model](../10_engine/15_error-model.md)), and each video check has its own `ErrorKind`. Two things matter more for videos than elsewhere.

- **`file` is always the file to change.** It is the single file, the scene file, `controller.yaml`, or a file in the folder's `components/`. It is never the folder, because an agent cannot edit a folder.
- **The record carries the position inside that file.** Besides `line`, a video record sets `column` and `path`. The path starts inside the file named: `beats[1].do[0]` in a scene file, `slides[4].beats[1].do[0]` in a single file.

People read it as one line, with the fix below:

```
data/dev-docs/05_arch/01_tour/050_pipeline.yaml:14:20: video-anchor-missing: beats[1].do[0]: "@indexes" is not a word in this beat. The beat says: "The core reads the frontmatter, pulls in embedded files, …"
  fix: anchor to a word the narration says, for example @reads or @frontmatter.
```

With `--json`, the same record is an object:

```json
{
  "file": "data/dev-docs/05_arch/01_tour/050_pipeline.yaml",
  "line": 14,
  "column": 20,
  "path": "beats[1].do[0]",
  "type": "video-anchor-missing",
  "severity": "error",
  "message": "\"@indexes\" is not a word in this beat.",
  "suggestion": "Anchor to a word the narration says, for example @reads or @frontmatter."
}
```

## Where records go

| Caller | What it does with them |
|---|---|
| `agentks check video [path]` | Prints them. Exits 1 on any error. On a scene file it prints that scene's and the controller's in full and counts the rest |
| The video page | Carries them in the page's `errors`. A slide with an error also carries `error: { code, message, line }` in `VideoData`, so the player draws an error slate for that slide and plays the others |
| `agentks build` | Fails on any error, like every other content error |

A warning never stops a build and never makes `check video` exit 1.

## Related

- [The meaning checks](./20_the-meaning-checks.md): the second layer, and every kind.
- [The error model](../10_engine/15_error-model.md): the record, the kinds and the sink.
- [Config](../10_engine/20_config.md): the YAML parser with positions.
