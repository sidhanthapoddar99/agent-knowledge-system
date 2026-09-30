---
title: "Narration and actions"
description: "Beats hold the narration and one-line actions. An action shows, hides or moves an item at the start of its beat or on a spoken word, so the picture follows the voice."
---

Narration drives a video. Each slide has **beats**: one or two spoken sentences each, with the **actions** that happen while they are spoken. An action is one short line, such as `show list.2 rise @Obsidian`. It starts at the start of its beat, or on a word the voice says. agentks works out every time from the narration, so rewording a sentence never breaks the sync.

## Beats

```yaml
beats:
  - say: Everything starts with plain files on disk. The folder of markdown is the source of truth.
    do: show folder pop @plain
  - say: So every file must read well everywhere. In Obsidian, in cat and grep, and in your editor.
    do: [show list.1 @Obsidian, show list.2 @cat, show list.3 @editor]
  - say: The rendered site is just one more reader.
    wait: 0.8
```

| Key | Meaning |
|---|---|
| `say` | The narration. The voice speaks it, and the player shows it as captions and in the transcript. Keep it to one or two sentences, at most about 40 words |
| `do` | One action, or a list of actions in `[...]` |
| `wait` | Seconds of silence after the beat, up to 10 |

A beat with only `wait` and `do` is a silent moment, where the picture speaks, such as a chart finishing. A slide holds at most 12 beats.

## Actions

An action reads: verb, targets, then an optional preset, options and anchor.

```text
verb targets [preset] [option=value ...] [@anchor]

show list.2 rise @Obsidian
emph core pulse
show cli+core+app pop stagger=0.15 @three
send wire @WebSocket
```

**Targets** are item ids, or parts such as `list.2` and `src.3-5` ([Items](./20_items.md) lists the parts of each kind). Join several targets with `+`. `*` means every item on the slide. Never join targets with a comma: inside a YAML list `[...]`, a comma splits the action in two.

## The verbs

| Verb | Does | Preset when you name none |
|---|---|---|
| `show` | Brings items or parts in | The item's own entrance: `rise` for text, `pop` for an icon, and so on |
| `hide` | Takes them out | `fade` |
| `emph` | Draws the eye, then settles back | `pulse`; `mark` on a part, such as a list entry, a code line or a tree path |
| `move` | Moves an item to another place, named with `to=` | `move` |
| `send` | Moves a dot along an arrow, or along one segment of it | none |
| `focus` | Moves the camera in, so the item fills most of the stage, and dims the rest | none |
| `unfocus` | Moves the camera back. It takes no targets | none |

Exits are rare. The next slide's transition clears the screen for you.

## Presets

A **preset** is a named animation. Each preset has a role, and the verb decides which role fits: `show` takes an entrance, `hide` an exit, `emph` an emphasis and `move` a motion. The built-in presets are:

| Role | Built-in presets |
|---|---|
| Entrance, for `show` | `fade`, `rise`, `drop`, `pop`, `zoom`, `wipe`, `draw`, `type`, `grow`, `count` |
| Emphasis, for `emph` | `pulse`, `glow`, `mark`, `shake`, `lift` |
| Exit, for `hide` | `fade`, `sink`, `shrink` |
| Motion, for `move` | `move` |

The default library adds about thirty more, named `ks:…`: soft blurred entrances, text that appears word by word, a spring pop, and emphasis that draws a hand-drawn circle or underline around its target, such as `ks:circle-it`. `agentks library find --category animations circle` finds them.

A preset in the wrong role is an error, `video-preset-role`. So is a verb or preset that does not fit its target, `video-verb-kind`: `send` on an item that is not an arrow, or `count` on anything but a stat.

Use the style's defaults first. Name a preset only when it says something the default does not.

## Options

| Option | Meaning |
|---|---|
| `stagger=0.1` | Seconds between one target or part and the next |
| `dur=0.8` | The animation's length in seconds, in place of the preset's |
| `to=right` | For `move`: where to, as an area, a grid span or a frame's id |

## Anchors

An anchor says when, inside its beat, an action starts.

| Anchor | Starts at |
|---|---|
| none | The start of the beat |
| `@word` | The first time the voice says that word |
| `@word#2` | The second time it says it |
| `@40%` | 40% of the way through the beat's speech |
| `@+1.5s` | 1.5 seconds after the beat starts |
| `@end` | The end of the beat's speech |

**A word anchor matches a whole word only.** Case and punctuation do not matter. A word is a run of letters, digits and apostrophes, so a hyphen or a dot splits words: `@three` matches "three-minute", and `@yaml` matches "site.yaml". `@con` does not match "config". An anchor that matches no whole word in its beat is an error, `video-anchor-missing`, and the error lists the words the beat does say.

**Show on mention.** Make each item appear on the word that names it, so the eye and the ear agree. Word anchors also survive rewording: if the new sentence still says "WebSocket", the dot still leaves on that word.

## Pauses

- **After a beat:** `wait: 0.8`.
- **A silent moment:** a beat with only `wait` and `do`.
- **Inside a sentence:** punctuation. The voice pauses at commas and full stops on its own.
- **Between slides:** the style's pause at the end of a slide, and the transition. You rarely change them.

## Reduced motion

When a reader's system asks for reduced motion, each preset plays its calmer fallback, usually a fade. Transitions become fades, and the camera stays still. You do nothing for this.
