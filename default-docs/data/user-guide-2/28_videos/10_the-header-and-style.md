---
title: "The header and the style"
description: "The header holds what is true of the whole video: its title, style, voice and default transition. A scene holds its own slide. The style sets the look."
---

The **header** holds what is true of the whole video: its title, its style, its voice and its defaults. In a single file, the header is the keys above `slides:`. In a video folder, it is the whole of `controller.yaml`. This page lists the header keys, says what a scene owns instead, and explains the style.

## The keys

```yaml
agentks-video: 1
title: How agentks turns files into pages
description: A three-minute tour, from a markdown file to a page.
style: ks:clean
voice: af_heart
in: fade
```

| Key | Required | Meaning |
|---|---|---|
| `agentks-video` | yes | The format version, `1`. It marks the file as a video |
| `title` | yes | The title in the sidebar, on the page and in the player |
| `description` | no | One sentence for listings and search |
| `style` | no | The look: fonts, sizes, colours and default motion. Default: the built-in `plain` |
| `voice` | no | The narrator: a voice id such as `af_heart`, or `browser`. Default: the project's voice, else the browser's voice |
| `rate` | no | Speaking speed, from 0.5 to 2. Default: 1 |
| `pronounce` | no | How to say words the voice does not know, for this video only |
| `in` | no | The transition into every slide that does not name its own |
| `bg` | no | The background of every slide that does not name its own |
| `aspect` | no | The shape of the stage. `16:9` is the only value |
| `slides` | in a single file | The slides, in order. A controller never has it |

[The voice](./30_the-voice.md) covers `voice`, `rate` and `pronounce`.

## What a scene owns

In a video folder, each fact has one home. The controller holds what is true of the whole video. A scene holds what is true of its slide.

| Fact | Home |
|---|---|
| Title, description, style, voice, rate and pronunciations | `controller.yaml` |
| The default transition and background | `controller.yaml` |
| The order of the scenes | The scene files' prefixes |
| A slide's heading, layout or template, items, narration and actions | Its scene file |
| One slide's own transition or background | That scene's `in:` or `bg:` |
| A morph into a slide | The later of the two scenes |

A header key in a scene file is an error, `video-unknown-key`, and the error says to set it in `controller.yaml`. The same holds the other way: `slides:` in a controller is an error.

Captions are the narration itself, so no key sets them. The player shows them by default, and the reader can switch them off.

## Which value wins

For the transition, `in:`, the slide's own value wins, then the header's, then the style's. For the background, `bg:`, the slide's own value wins, then its template's, then the header's, then the style's.

So a video-wide transition is written once, in the header, and every slide follows it. Only the slide that differs names its own. The same rule holds in both forms.

## The style

A style makes every slide look as if one hand made it. It sets:

- the type scale and the icon sizes, in a few steps;
- the gap between items and the corner radius;
- the colour roles, such as `accent` and `muted`;
- the fonts for text and for code;
- the easing and the base duration of motion;
- the defaults: the background, the transition, the presets and the pauses.

The built-in style is `plain`. A video with no library at all still plays with it. The default library adds three more:

| Style | Look |
|---|---|
| `ks:clean` | Calm. The usual choice |
| `ks:bold` | Large type and a strong accent |
| `ks:blueprint` | Technical, with grid lines and monospace accents |

A style maps each colour role and each font to a variable of your site's theme. So a video uses your site's colours and fonts, and it follows light and dark mode with the rest of the site. [Themes and layouts](../45_themes-and-layouts/01_overview.md) explains the theme.

## No sizes, no colours

You never write a pixel size or a colour value in a video. An item picks a size step, `s`, `m`, `l` or `xl`, and a colour role with `tone`. The style turns those into real values. [Items](./20_items.md) lists the steps and the roles.

This is what keeps a video small and consistent. It also means one video looks right under any style: change `style:` in the header, and every slide changes with it.
