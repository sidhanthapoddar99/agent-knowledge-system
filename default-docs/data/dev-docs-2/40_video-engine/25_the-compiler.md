---
title: "The compiler"
description: "How the video crate turns a checked model into VideoData: resolving component names, templates and defaults, inlining, and code highlighting."
---

After the checks, the video crate turns the model into `VideoData`, the finished data the player plays. This page explains each step except two that have pages of their own: the SVG allowlist and the timeline. Read it before you change how a name is resolved or what the compiler fills in for the author.

## The steps

| Step | Does |
|---|---|
| Resolve | Turns every component name into a component from a library, the folder's own `components/` or the built-in pack |
| Sanitize | Passes every SVG through the allowlist, with its ids made safe to repeat |
| Expand | Fills slide templates from their slots, and fills in every default the style and the item kinds imply |
| Inline | Copies the components the video uses into `VideoData`, and nothing else |
| Highlight | Turns each code item into lines of classed tokens |
| Pronounce | Picks the pronunciation entries that apply to each beat |
| Time | Computes every start and end ([the timeline](./30_the-timeline.md)) |
| Emit | Writes `VideoData` and the transcript |

## Resolving names

**The field gives the category.** A name never needs a path or a category prefix, because the field it sits in says where to look.

| Field | Category |
|---|---|
| `icon:` | icons |
| `image:` | images and illustrations. Names are unique within a library, so this is never ambiguous |
| `frame:` | frames |
| `chart:` | charts |
| `bg:` | backgrounds |
| `in:` | transitions |
| A preset in `do` | animations |
| `template:` | slides |
| `layout:` | layouts |
| `style:` | styles |

**Three forms of name.**

- `alias:name` is a library component. The alias is a key in `config/dep.yaml`, and the library resolver finds the file at the pinned commit ([libraries](../35_libraries/01_overview.md)).
- `self:name` is a component in a video folder's own `components/<category>/`. The crate reads that folder as a library with no manifest: a file's category is its folder, and its name is its file name without the extension. It goes through the same resolver and the same contract checks as any library.
- A bare name, such as `rise` or `split`, is a player built-in.

**The built-in pack is one file.** `apps/packages/agentks-video/src/builtin/pack.json` holds the `plain` style, the nine layouts, the presets by role and the transitions. The video crate compiles that same file in, so the crate and the player never keep two lists. Libraries add to the built-ins and never replace one, so a project with no library still plays its videos.

**A missing name is an error.** It is `library-element-unknown`, with close names from the same category in the same place. A component never resolves to a blank.

**Inside a component**, `self:name` names another component of the same collection, and a bare name is a built-in. A folder's own component cannot name a library component; the scene that uses it can. A folder's `components/` refuses `images`, because images go in `assets/`, and refuses `widgets`, `scripts` and `fonts`.

## Sanitizing SVG

Every SVG the video uses passes through an allowlist before it is inlined, and its ids become placeholders the player fills per use. [The SVG allowlist](./27_the-svg-allowlist.md) explains both.

## Expanding templates and defaults

- **Templates.** A slide template brings a layout, placed items with `{slot}` placeholders, a background and a list of actions. The crate fills the items from the slide's slot keys and checks each slot's type, whether it is required, and its length. Template items come before the slide's own items. Template actions run at the first beat's start.
- **The heading is an item.** A slide's `head` becomes the text item `_head`, with `size: "head"` and `at: "head"`, first in the list. An action shows it at the slide's start with the style's heading preset. Author ids cannot start with `_`, so it never clashes.
- **Transitions and backgrounds.** For `in:`, the slide's value wins, then the header's, then the style's. For `bg:`, the slide's value wins, then its template's, then the header's, then the style's.
- **Every preset is named.** Each `show`, `hide`, `emph` and `move` carries its preset. An entrance defaults to the item kind's: `pop` for icons, `fade` for images, `draw` for arrows, `grow` for charts, `count` for stats, `type` for code of up to 8 lines, and `rise` for the rest. An emphasis on a part of a list, code, tree or chart defaults to `mark`. Everything else takes the style's default.
- **Hidden items are not computed.** An item that some beat shows starts hidden, because its entrance animation holds its first keyframe until it starts. Everything else is visible with the slide. `VideoData` has no hidden flag.

## Inlining and highlighting

- **Only what the video uses.** Each component the video names goes into `components.<category>`, keyed by the name the video wrote. JSON components are copied unchanged, and keep their own unit, seconds. SVG goes in as allowlisted text. At play time nothing is fetched except images, and no library code runs.
- **One highlighter.** Code items use the same highlighter as markdown pages, reached through a trait ([where the code lives](./05_where-the-code-lives.md)). Each line becomes a list of `[class, text]` tokens. The classes are `kw`, `str`, `com`, `num`, `fn`, `key`, `punct`, `head`, `link`, `meta`, or empty for plain text.
- **The transcript.** The crate also writes the narration as HTML, grouped under each slide's heading, with one anchor per beat. The page shows it under the player. It reads with JavaScript off, and site search indexes it.

## Related

- [VideoData](./35_video-data.md): the shape the compiler emits.
- [The SVG allowlist](./27_the-svg-allowlist.md): the sanitizing step.
- [The meaning checks](./20_the-meaning-checks.md): the errors resolution reports.
- [Manifests and element lookup](../35_libraries/15_manifests-and-lookup.md): libraries without a manifest.
