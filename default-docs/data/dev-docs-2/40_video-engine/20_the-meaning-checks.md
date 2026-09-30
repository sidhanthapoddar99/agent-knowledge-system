---
title: "The meaning checks"
description: "The second check layer: every error and warning kind the video crate reports, the rules behind them, and how to add a check."
---

The meaning checks run after a file passes the schema. They check what a schema cannot: that every name exists, every anchor matches a spoken word, every path points at a file, and a video folder holds only what it should. This page lists every kind they report, the rules they keep, and the steps to add a check. Read it before you change a check or add one.

## Errors

| Kind | Reported when | The message lists |
|---|---|---|
| `video-unknown-key` | A key is not in the schema, or not a slot of the slide's template. A header key in a scene file, or `slides` in a controller | The nearest key, or the file where the key belongs |
| `video-invalid` | Any other shape the schema refuses | The rule that failed |
| `video-unknown-item` | An action names an item that is not on its slide | The slide's items |
| `video-unknown-part` | A part that does not exist: `list.9` on five entries, `src.12` on seven lines, a path not in the tree | The item's parts |
| `video-unknown-area` | `at:` names an area the layout does not have | The layout's areas |
| `video-anchor-missing` | `@word` matches no whole word of the beat's `say` | The beat's words |
| `video-unknown-word` | The voice cannot pronounce a word in a `say`, and no pronunciation entry covers it | Each word, and the two places a fix can go |
| `video-verb-kind` | A verb or preset does not fit its target: `send` on an item that is not an arrow, `count` on anything but a stat | What the verb accepts |
| `video-preset-role` | An exit preset used with `show`, or an entrance preset with `hide` | Presets of the right role |
| `video-duplicate-id` | Two slides share an id. In a folder, two scene files share a slug | Both places |
| `video-morph-unmatched` | A slide with `in: morph` shares no item id with the slide before it, or is the first slide | The previous slide's item ids and its file |
| `video-asset-missing` | An image path points at no file | The path |
| `video-asset-outside` | A path in a video folder leaves the folder | The path |
| `video-no-controller` | A video folder has no `controller.yaml` | |
| `video-no-scenes` | A video folder has no scene file | |
| `video-unknown-file` | A video folder holds something the form does not name | What a video folder may hold |
| `video-duplicate-prefix` | Two scene files have the same prefix value | Both files |
| `library-element-unknown` | An alias that is not in `config/dep.yaml`; a name the library or the folder's `components/` does not have in that category; or `self:` in a single-file video | Close names in the same category and the same place, and the `agentks library find` command |
| `library-bad-component` | A component the video uses breaks its category's contract, including the SVG allowlist | The rule, the element or attribute, and its line |

## Warnings

A warning never stops a build.

| Kind | Reported when |
|---|---|
| `video-file-size` | One file passes its limit: a single-file video past 4 KB, or a scene file or a controller past 2 KB |
| `video-long-video` | The narration passes 600 words, about four minutes, in either form |
| `video-long-beat` | A beat has more than 40 words |
| `video-dense-slide` | A slide shows more than six items, or more than 40 words of text, at once |
| `video-silent-slide` | A slide has no narration and no `wait` |

## The rules the checks keep

**Whole words only.** A word is a run of letters, digits and apostrophes in the beat's `say`. A hyphen or a dot splits words, so `@yaml` matches "site.yaml". Matching ignores case and punctuation, and `@word#2` picks the second match. A prefix match would let `@con` land on "config" with no error, so a prefix never matches.

**One file's size, not the video's.** `video-file-size` measures one file's bytes on disk. A folder of ten small scenes passes; one scene past 2 KB warns, which is the signal to split it.

**Words, not seconds.** `video-long-video` counts narration words, so its answer is the same with the browser voice and with generated clips.

**Morph is checked in both forms.** In a folder, the slide before a morph is another file. Renaming an item there, or reordering the scenes, could empty the morph with no sign, so the error names both files.

**`self` is reserved.** `config/dep.yaml` refuses it as an alias, and a missing `self:` name never falls back to a library component.

**Unknown words need the helper.** With the voice helper installed, `check video` sends each beat to the helper's `g2p` request, which runs only the pronunciation step. Without the helper, the command prints one note that pronunciation was not checked, because the video will play with the browser voice anyway ([the voice helper](./50_the-voice-helper.md)).

## Adding a check

1. **Add the kind** to `ErrorKind` in `agentks-core` with a stable kebab-case name, and add it to the pinned list in the same commit ([the error model](../10_engine/15_error-model.md)).
2. **Name the file to change,** and fill `line`, `column` and `path` from the node.
3. **Say what would fix it:** the names, areas or words that would have been valid, in `suggestion`.
4. **Pick the severity.** An error means the video cannot play as written. A warning means it plays, but a reader would notice.
5. **Test it** with a broken copy of a fixture video, asserting the file, line, column and path ([tests](./65_tests.md)).

A check that needs the real font belongs in the player's layout diagnostics, not here.

## Related

- [The schema and the error record](./15_schema-and-the-error-record.md): the first layer and the record's shape.
- [The compiler](./25_the-compiler.md): name resolution and the SVG allowlist.
- [Manifests and element lookup](../35_libraries/15_manifests-and-lookup.md): the library side of `alias:name`.
