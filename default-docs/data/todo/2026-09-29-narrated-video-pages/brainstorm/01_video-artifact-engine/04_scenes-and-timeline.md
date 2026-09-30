---
title: "Scenes, motion and the timeline"
---

**A video is slides; a slide is items and beats; a beat is one clip of narration with the actions that happen during it.** Seven verbs cover PowerPoint's entrance, emphasis, exit and motion, plus two explainer staples: a packet travelling along an arrow, and a camera that focuses on one item. Every verb takes a preset, which is a small piece of data from the player's built-in pack or from a library. Narration drives the clock: an action happens at the start of its beat or on a spoken word. Because every animation is placed on one timeline, the player can show any moment exactly, so seeking is instant.

## 01 Terms

| Term | Meaning |
|---|---|
| **Slide** | One screen. It has a layout (or a template), items, beats and a transition into it |
| **Item** | One thing on a slide: text, a list, code, an icon, an image, a shape, an arrow, a file tree, a frame, a chart, a stat or a table |
| **Part** | A piece of an item an action can address: a list entry, a code line, a tree path, a chart bar, a table row, an arrow segment |
| **Beat** | One or two sentences of narration, and the actions that go with them. One generated audio clip per beat |
| **Action** | One line in a beat's `do`: a verb, targets, an optional preset and an optional anchor |
| **Preset** | A named animation: keyframes, duration, easing, stagger. Data, not code |
| **Anchor** | When an action starts inside its beat: a spoken word, a percentage, an offset in seconds, or the end |

## 02 Item kinds

The kinds are built into the player, because each needs drawing code and must be seekable. Their looks (frames, icons, chart styles, backgrounds, sizes and colours) come from the style and from libraries.

| Kind | Draws | Default entrance | Notes |
|---|---|---|---|
| `text` | A paragraph or a title | `rise` | Fits its area; shrinks down to the style's smallest size, then overflows visibly and reports `layout.text-fit` |
| `bullets` | A list, up to 7 entries | `rise`, entries staggered | `list.3` addresses one entry |
| `code` | Highlighted code | `type` up to 8 lines, else `fade` | Rust highlights it into CSS classes, the same highlighter as pages. `src.3-5` addresses lines; `mark` highlights them |
| `icon` | A library icon with an optional label | `pop` | Takes `tone` as its colour |
| `image` | A colocated or library image | `fade` | Cover or contain from the area's shape. Useful for before and after states |
| `shape` | A box, pill, circle or line, with a label | `rise` | For pipeline steps and callouts |
| `arrow` | Connectors along a chain of items | `draw` | Routed between item edges, straight or with one elbow. `send` moves a packet along it |
| `tree` | A file tree built from paths | `rise` | `tree.data/docs` addresses a folder or a file |
| `frame` | A device or window frame | `rise` | Its screen is an area: other items use `at: <frame id>` |
| `chart` | A library chart template fed with `data` | `grow` | Bars, columns, lines, areas, donuts, funnels. `chart.2` addresses a mark |
| `stat` | A big number with unit and label | `count` | Counts up with no script per frame (see [the player](./06_player.md#04-how-a-moment-is-drawn)) |
| `table` | A small table, up to 8 rows | `rise`, rows staggered | `table.2` addresses a row |

Diagrams are built from these kinds: icons or shapes placed on the layout, joined by arrows. Mermaid is not in the player: it is several hundred KB and its layout cannot be animated item by item. A later version may lay out node-and-edge graphs in Rust.

## 03 Actions

### The grammar

```text
action   = verb " " targets [" " preset] {" " option} [" @" anchor]
verb     = "show" | "hide" | "emph" | "move" | "send" | "focus" | "unfocus"
targets  = target {"+" target} | "*"
target   = item-id ["." part]
part     = number | number "-" number | "*" | path
preset   = name | alias ":" name
option   = "stagger=" seconds | "dur=" seconds | "to=" place | "tone=" role
anchor   = word ["#" n] | percent "%" | "+" seconds "s" | "end"
```

`unfocus` takes no targets. `*` means every item on the slide.

### The verbs

| Verb | PowerPoint name | Does | Preset role | Default preset |
|---|---|---|---|---|
| `show` | Entrance | Brings items or parts in | `enter` | The kind's default above, or the style's |
| `hide` | Exit | Takes them out | `exit` | `fade` |
| `emph` | Emphasis | Draws the eye, then settles back | `emph` | `pulse`; `mark` for code lines, list entries, tree paths and table rows |
| `move` | Motion path | Moves an item to another place (`to=`) | `move` | `move` |
| `send` | none | A packet travels along an arrow, or one segment of it | none | Duration from the arrow's length |
| `focus` | Zoom | The camera scales the slide so the item fills about 60% of the stage; the rest dims | none | The style's camera timing |
| `unfocus` | none | The camera returns | none | |

### Anchors

| Anchor | Starts at |
|---|---|
| none | The start of the beat |
| `@word` | The first spoken word that is exactly `word`, ignoring case and punctuation. `@word#2` for the second |
| `@40%` | 40% of the way through the beat's speech |
| `@+1.5s` | 1.5 seconds after the beat starts |
| `@end` | The end of the beat's speech |

**What counts as a word.** A word is a run of letters, digits and apostrophes in the beat's `say`. A hyphen or a dot splits words, so `@three` matches "three-minute" and `@yaml` matches "site.yaml". Matching is on whole words only. A prefix match would let `@con` land on "config" or `@Rust` on "Rusty" with no error, which breaks the rule that an unsure answer must be an error. The compiler matches on the characters of the original `say`, and the voice helper reports each word's character span in the same text, so the two never have to split words the same way.

**Show on mention** is the core rhythm. An item appears on the word that names it, so the eye and the ear agree. Word anchors also survive rewording: if the sentence changes but still says "WebSocket", the packet still leaves on that word.

### Which items start hidden

**An item or part that some beat `show`s starts hidden. Everything else arrives with the slide.** So a simple slide needs no actions at all, and a build-up slide needs one `show` per item. The slide's `head` and a template's fixed parts arrive with the slide too, with the style's head entrance.

## 04 Presets

A preset is JSON: its role, keyframes, duration, easing, and optionally a stagger, a text split and a reduced-motion fallback. The player turns each one into Web Animations with no other code. The format is in [library components](./08_library-components.md#06-the-contract-of-each-category).

**Built into the player** (bare names; enough for a video with no library):

| Role | Presets |
|---|---|
| `enter` | `fade`, `rise`, `drop`, `pop`, `zoom`, `wipe`, `draw`, `type`, `grow`, `count` |
| `emph` | `pulse`, `glow`, `mark`, `shake`, `lift` |
| `exit` | `fade`, `sink`, `shrink` |
| `move` | `move` |

**From the default library** (`ks:` names), the day-one set adds about 24 more: blurred entrances, masked reveals, word-by-word and letter-by-letter text, directional slides, a spring pop, a stamp; emphasis such as underline, spotlight, colour shift and heartbeat; matching exits. The list is in [library components](./08_library-components.md#08-the-day-one-set).

**Rules every preset follows:**

- **Only cheap, smooth properties:** `opacity`, `transform`, `filter` (blur and brightness), `clip-path` (inset and circle), `stroke-dashoffset`, `offset-distance`, colours through theme roles, and the counter property. These run on the compositor or cost one paint. Layout properties (width, top, margin) are refused by the check.
- **Small distances and one easing family.** Entrances travel 16 to 32 stage pixels. The style sets the easing and the base duration, so every preset in a video feels like one hand made it.
- **Springs as data.** An easing may be a `cubic-bezier()` or a CSS `linear()` curve. `linear()` lists sampled points, so a spring, a bounce or a heartbeat is a short list of numbers, not code. Every current browser supports it (Chrome 113, Firefox 112, Safari 17.2). Presets such as `spring-pop` and `heartbeat` use it, so they do not feel stiff.
- **Annotations.** An emphasis preset may draw an annotation from the library around its target, such as a hand-drawn circle or an underline, with a line-draw animation ([library components](./08_library-components.md#03-the-categories)).
- **Stagger** spreads a preset across parts: `show list.* rise stagger=0.08`.
- **Text split.** A preset may animate by word or by letter. The player wraps words or letters in spans once, when it builds the slide.
- **Reduced motion.** When the reader's system asks for reduced motion, each preset uses its declared fallback, usually `fade`. Transitions become fades. The camera does not zoom.

## 05 Transitions

A transition runs on two layers at once: the old slide goes out and the new one comes in. It is JSON with `out` and `in` keyframes, a duration and an easing.

| Built in | Library (`ks:`), day one |
|---|---|
| `cut`, `fade`, `slide`, `push`, `wipe`, `zoom`, `morph` | `dissolve`, `slide-up`, `push-up`, `iris`, `blinds`, `split`, `zoom-through`, `flip`, `cover`, `reveal` |

**Morph** is the one that makes explainers look designed (PowerPoint calls it Morph, Keynote calls it Magic Move). With `in: morph`, every item whose id also exists on the previous slide glides from its old place, size and colour to its new ones. Items only on the old slide fade out; items only on the new slide follow their `show` actions or fade in. The player measures both layouts and builds the keyframes once (the FLIP technique: measure first and last, invert, play), so a morph is seekable like everything else. Morph is opt-in per slide, so an id reused by accident never moves anything.

**Style default.** The style names the default transition, usually `fade`. The skill teaches one default plus at most one other in a video.

## 06 The timeline

The compiler in Rust computes every time before the player sees the video. The player never works out a duration.

```text
slide start  = previous slide end
beat 1 start = slide start + transition duration
beat length  = speech length + wait (default: the style's gap, 0.3 s)
speech length = the clip's duration        with generated audio
              = words ÷ 155 per minute ÷ rate   with the browser voice (an estimate)
slide end    = last beat end + tail (default 0.6 s)
action time  = beat start + anchor offset
word offset  = the word's start in the clip          with generated audio
             = speech length × (characters before the word ÷ characters in the beat)   estimated
```

An action whose animation would run past the slide's end is cut by the transition, and the check warns when more than half of it is lost.

`agentks video info` prints the result, so an agent can check its pacing without playing the video. Slide 5 of the example, with the browser voice's estimate (times relative to the slide):

```text
slide s5 "The render pipeline"                24.5 s   estimated voice
  in fade                                      0.00 –  0.60
  beat 1  "A page is rendered only…"           0.60 –  4.47   10 words
     0.60  show fm+embeds+md+links+html rise stagger=0.1
     3.52  show line draw                @asks
  beat 2  "The core reads the frontmatter…"    4.77 – 10.19   14 words
     5.34  send line                     @reads
     5.97  emph fm pulse                 @frontmatter
     7.35  emph embeds pulse             @embedded
     8.99  emph md pulse                 @markdown
  beat 3  "Then it resolves every…"           10.49 – 16.30   15 words
    11.06  emph links pulse              @resolves
  beat 4  "The result is cached…"             16.60 – 23.57   18 words
    17.54  emph html glow                @cached
  tail                                        23.87 – 24.47
```

With generated audio the numbers come from the clips and the word timings, and the output says `generated voice`.

## 07 Pauses

- **After a beat:** `wait: 0.8`.
- **A silent beat:** a beat with only `wait` and `do`, for a moment where the picture speaks, such as a chart finishing.
- **Inside a sentence:** punctuation. The voice model pauses at commas and full stops on its own, and the word timings include those pauses.
- **Between slides:** the style's tail and the transition. An agent rarely changes them.

## 08 Seeking

**Any moment is a pure function of time.** Given a time `t`:

1. Find the slide whose span holds `t` (a binary search over slide start times).
2. Build that slide's items if they are not built yet (the current slide and the next one are kept built).
3. Set every animation on that slide, and the transition's, to `t − slide start`.
4. Set the video's audio stream to `t`. The stream runs as long as the video, with silence in pauses and transitions, so no beat lookup is needed ([the voiceover](./07_voiceover.md#07-one-stream-per-video)).

There is no replay from the start and no state carried from earlier slides, so a jump from 0:10 to 2:40 costs the same as a jump of one second. The measurement in [what exists today](./02_current-state.md#a-measurement-taken-for-this-design) shows 600 animations seeking in 0.22 ms.

**With the browser voice**, speech cannot start mid-sentence. After a seek the player restarts speech at the start of the sentence that holds `t` and moves the clock back to that sentence's estimated start. The jump is at most one sentence.

## 09 What waits

- Portrait (9:16) and square (1:1) videos. The `aspect` key and per-aspect layouts are designed in; version 1 allows 16:9 only.
- Script components from libraries, run sandboxed ([library components](./08_library-components.md#06-the-contract-of-each-category)).
- Node-and-edge diagrams laid out by Rust.
- Background music and sound effects.
- Branching or interactive videos, such as a quiz between slides.
