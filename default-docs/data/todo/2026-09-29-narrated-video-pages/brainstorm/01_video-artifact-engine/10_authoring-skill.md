---
title: "The authoring skill"
---

**A skill called `agentks-video` teaches an agent to make a good explainer, not only a valid file.** It teaches a fixed order of work: the message, then the narration, then one recipe per slide, then placement, then actions tied to spoken words, then the check and the timeline, and last a look at every slide. It carries a recipe table that maps each kind of message to a slide template, item kinds and presets, and hard pacing numbers. The look gate is what the artifacts skill has and a schema check cannot give: the agent sees its own slides in light and dark before it calls the video done. Three checked example videos show the patterns. A 3-minute video costs an agent about 13,000 tokens in total, of which about 2,500 are written.

## 01 Where it lives

The skill joins the agentks plugin when video pages ship. The migration's [plugin port subtask](../../../2026-09-29-rust-core-engine-migration/subtasks/130_ai-plugins/10_agentks-plugin-port.md) already says the video issue owns it.

```text
plugins/agentks/skills/agentks-video/
  SKILL.md                         about 2,000 tokens: triage, the workflow, the never-table
  references/
    format.md                      every key, the action grammar, anchors, errors
    recipes.md                     message → slide recipe; pacing; motion rules
    writing-for-the-ear.md         how narration should be written
    examples/
      01_product-tour.video.yaml     the 3-minute example in the format note
      02_concept-explainer.video.yaml  a concept with before-and-after and morph
      03_data-story.video.yaml         charts, stats and one clear conclusion
```

Like every skill in this project, it describes the current format only and carries no history.

**Trigger description (draft):** "Make a narrated explainer video in an agentks project: a `.video.yaml` file of slides, narration and actions, played live with a voiceover. Use it whenever the user asks for a video, an explainer, a walkthrough, an animated tour, a narrated presentation or slides with a voice, even without the word video. Not for MP4 files. HTML pages and dashboards belong to the artifacts skill."

## 02 What it teaches

### When a video is the right artifact

A video earns its cost when **order and timing carry the meaning**: a request flowing through a system, a pipeline, a before and after, a tour of a codebase, a number that needs a build-up. Reference material, API details and anything a reader must search belong in a docs page. A dashboard belongs in an HTML artifact.

### The order of work

1. **The message.** One sentence the viewer should remember, and who the viewer is.
2. **The outline.** One idea per slide. A 3-minute video has 8 to 12 slides.
3. **The narration, all of it, before any item.** Write every `say` first and read it aloud in your head. A 3-minute video is about 450 words.
4. **A recipe per slide** from the table below.
5. **Placement.** Use the layout's areas. Reach for a raw grid span only when no layout fits.
6. **Actions.** Show each thing on the word that names it. At most one emphasis per beat.
7. **Check.** `agentks check video <file>`, then fix every error it names. With the voice helper installed this includes `video.unknown-word`: add each word to `pronounce:` in `config/video.yaml` if the project will say it again, else in the video file.
8. **Pace.** `agentks video info <file>`: fix any slide under 8 or over 30 seconds, and every warning.
9. **Look.** Open the review sheet: `agentks video preview <file> --sheet`, or `/artifacts/<path>.video?sheet` on a running server. Take one screenshot with `?theme=light` and one with `?theme=dark`, using the Playwright tools. Read the diagnostics list, then look at every thumbnail for crowding, a tiny quadrant under a head band, code cut off in a frame, an arrow crossing an item, text too small to read, and an ugly morph midpoint. Open any doubtful slide at full size with `&slide=<n>`. Fix, and look again.
10. **Listen**, when the voice helper is installed: `agentks video voice <file>` gives the real voice and real timings. Run `video info` once more, because real timings move actions.

### The recipe table

| The slide says | Use | Motion |
|---|---|---|
| This is what the video is about | `template: ks:title` | Template default |
| We move to a new part | `template: ks:section`, `in: push` | Template default |
| Here are some points | `bullets`, `center` or `split` with an icon | `show list.N` on each point's word |
| These are the parts of a system | Icons with labels in `thirds`, `quad` or `grid6`, joined by an `arrow` | `pop` each part on mention; `draw` the arrow when the link is said |
| Something flows through steps | Pills in `full`, joined by an `arrow` | `rise` with a stagger, then `send` along the arrow on "flows" or "sends" |
| Before and after | `split` with two images or frames, or two slides joined by `in: morph` | `morph` when the same things change place |
| Here is the code | `ks:code-explain`, or `split` with a `ks:code-frame` | `type` for short code; `mark` lines on mention |
| This number matters | `ks:big-number`, or a `stat` | `count` |
| These values compare | `chart: ks:bars` or `ks:columns` | `grow`, then `glow` the one that matters |
| This changes over time | `chart: ks:line` or `ks:area` | The line draws itself |
| This is part of a whole | `chart: ks:donut` | `grow` |
| The files are laid out like this | `tree` | `mark` paths on mention |
| This is what it looks like | A `frame` holding a screenshot | `rise`, then `pulse` the frame |
| Look at this one detail | Any item already on screen | `emph` with an annotation preset: `ks:circle-it`, `ks:underline-it`, `ks:point-at` |
| A short quote or a key idea | `ks:callout-frame` or `ks:bubble-frame` holding `text` | `pop` |
| Thanks, and where next | `template: ks:closing` | Template default |

### Pacing numbers

| Rule | Number |
|---|---|
| Speaking speed | 150 to 160 words a minute |
| One beat | 1 or 2 sentences, at most 40 words |
| One slide | 8 to 30 seconds; 2 to 4 beats |
| One video | At most about 4 minutes and 10 KB; a longer topic becomes a series of videos |
| On screen at once | At most 6 items and 40 words |
| Something changes | Every 3 to 6 seconds |
| Silence | Under 2 seconds, unless it is a deliberate pause |

### Motion rules

- Use the style's defaults first. Name a preset only when it says something the default does not.
- One transition for the whole video, plus at most one other for section changes.
- Exits are rare: the next slide's transition clears the screen.
- Morph only when the same things change; never as decoration.
- Nothing moves without a reason the narration gives.

### Writing for the ear

- Short sentences. One idea each.
- Numbers as they are spoken: "thirteen hundred", "eight kilobytes".
- Symbols spelled out: "site dot yaml", "slash docs".
- No brackets, no lists read aloud, no "as you can see".
- The screen shows keywords; the voice explains them. Never read the slide aloud word for word.

### Finding components

Never invent a name. Ask the installed libraries:

```bash
agentks library show ks --category slides        # every template and its slots
agentks library find --category animations blur  # presets matching a word
```

A wrong name fails the check with the closest real names, so a guess costs one round, but a lookup costs none.

### The errors agents hit most

| Error | Fix |
|---|---|
| `video.anchor-missing` | Anchor to a word the beat actually says, or change the sentence |
| A target list split in two | Join targets with `+`, never a comma |
| `video.unknown-area` | Use one of the areas the error lists for that layout |
| `video.dense-slide` | Split the slide in two, or show items in turn |
| `video.unknown-word` | Add the word to `pronounce:` with a respelling in plain words |
| `video.file-size` | Split the video into a series |
| `layout.text-fit` · `layout.overflow` | Shorten the text, give the item a bigger area, or use a layout without a head band |
| `layout.overlap` | Give each item its own area, or let items share one area so they arrange themselves |
| `library.unknown-element` | Take one of the names the error suggests, or run `library find` |

### Never

| Never | Instead |
|---|---|
| A pixel position or a colour value | An area and a `tone` |
| Code in the video file | A library `scripts` component (later) |
| An MP4, a GIF or an audio file in the project | The voice cache in `~/.agentks`, which is never committed |
| Narration longer than the pictures can carry | Split the slide |
| Call a video done before looking at every slide's end in the review sheet, in light and dark | Step 9, every time. A video that passes the check can still be crowded, clipped or ugly |
| Leave a diagnostic unfixed | Fix it, or say in the reply which one remains and why |

## 03 How the skill stays true

- The three examples are checked with `agentks check video` in the plugin's CI, so a format change that breaks them fails.
- A test compares `format.md` with the JSON Schema: every key in one must be in the other.
- The recipe table names only components that exist in the default library; the same CI run looks each one up.

## 04 Evaluation

Five prompts, run with the skill-creator's evaluation loop before the skill ships:

1. Explain the render pipeline in 90 seconds.
2. Give a 3-minute tour of a repository's folders.
3. Present three benchmark numbers and what they mean.
4. Explain content hashing with a before and after.
5. Make a 45-second teaser for a feature.

Each run is scored on: passes the check on the first try; no pacing warnings; no layout diagnostics after the look step; running time within 15% of the target; and sidhantha's judgement after watching. The runs' review-sheet screenshots, in both themes, are kept with the evaluation, so a grader can judge the look without playing every video.

## 05 What a 3-minute video costs an agent

| Step | Tokens |
|---|---|
| Load `SKILL.md` | about 2,000 |
| Read `recipes.md`, and `format.md` when needed | about 2,500, plus 2,000 |
| Look up components (`library show --category` twice) | about 1,500 |
| Write the file | about 2,000, written |
| One check and one round of fixes | about 800 |
| Read the timeline from `video info` | about 700 |
| Look: two review-sheet screenshots and one fix | about 3,500 |
| **Total** | **about 13,000 to 15,000, of which about 2,500 written** |

For comparison: the spike's markdown tour cost about 2,000 tokens for five minutes of far plainer visuals, and one hand-built HTML artifact page costs 3,000 to 8,000 written tokens. A HyperFrames-style HTML video costs tens of thousands, because every keyframe is written by hand.
