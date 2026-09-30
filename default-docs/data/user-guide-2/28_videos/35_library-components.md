---
title: "Library components"
description: "A video names components as alias:name from a library, self:name from its own folder, or a bare name for a built-in. The field gives the category."
---

A video's looks come from **components**: icons, frames, charts, layouts, slide templates, presets, transitions, backgrounds and styles. Most come from the libraries your project lists in `config/dep.yaml`. A video folder can also carry components of its own. This page shows how a video names a component, how to find one, and how a folder's own components work.

## Three kinds of name

| You write | It names | Example |
|---|---|---|
| A bare name | A built-in of the player | `rise`, `fade`, `split`, `plain` |
| `alias:name` | A component in the library with that alias in `config/dep.yaml` | `ks:browser-frame` |
| `self:name` | A component in this video folder's own `components/` | `self:quote-card` |

The built-ins are a small set, so a project with no library still plays its videos. A library adds components; it never replaces a built-in, because the alias keeps the two apart. In the starter template, the default library's alias is `ks`, so this guide's examples use `ks:` names. [Libraries](../40_libraries/01_overview.md) explains aliases, `dep.yaml` and installing a library.

## The field gives the category

A name never needs a path or a category. The field it sits in says what kind of component it is:

| Field | Looks in the category |
|---|---|
| `icon:` | `icons` |
| `image:` | `illustrations` |
| `frame:` | `frames` |
| `chart:` | `charts` |
| `layout:` | `layouts` |
| `template:` | `slides` |
| `style:` | `styles` |
| `bg:` | `backgrounds` |
| `in:` | `transitions` |
| A preset in an action | `animations` |

Annotations, such as a hand-drawn circle or an underline, are drawn by emphasis presets like `ks:circle-it`. You never name an annotation directly.

## Find a component before you use it

Never invent a name. Ask the libraries you have installed:

```bash
agentks library show ks --category slides          # every template, with its slots
agentks library show ks --category layouts         # every layout, with its areas
agentks library find --category animations blur    # presets that match a word
agentks library find --category icons database     # icons that match a word
```

A name that does not exist is an error, never a blank. `library-unknown-alias` means no library has that alias. `library-unknown-element` means the library has no component of that name in that category. The error suggests close names and the `agentks library find` command to run. [Finding elements](../40_libraries/15_finding-elements.md) explains search.

## What a video takes from a library

A video takes only the components it names. agentks checks each one and builds it into the compiled video. So a video plays with no extra downloads, apart from its images, and no library code ever runs. Every SVG passes a strict check first, and anything that could run or load something is an error, `library-bad-component`. [Component contracts](./40_component-contracts.md) lists the rules.

## A folder's own components

A video folder may carry components that only it uses, in `components/<category>/`, the same structure as a library:

```text
10_concept/
  settings.json
  controller.yaml
  010_intro.yaml
  020_quote.yaml
  components/
    frames/
      quote-card.svg
```

A scene names it with `self:`:

```yaml
# 020_quote.yaml
head: What the team said
layout: center
items:
  card: {frame: self:quote-card}
  quote: {text: The files are the document., at: card}
beats:
  - say: One line sums up the whole design. The files are the document.
    do: show card+quote pop @line
```

- **The file name is the name.** `components/frames/quote-card.svg` is `self:quote-card`. The folder gives the category. No manifest is needed.
- **`self` always means this folder's `components/`.** A `self:` name the folder does not have is an error. agentks never falls back to a library component with the same name.
- **The allowed categories** are the ones a video can name: `icons`, `illustrations`, `backgrounds`, `frames`, `annotations`, `charts`, `layouts`, `slides`, `animations`, `transitions` and `styles`. Images go in the folder's `assets/` instead. Widgets, scripts and fonts are refused.
- **A component follows its category's contract**, exactly as a library's does, and passes the same checks.
- **Inside a component**, `self:name` names another of the video's components and a bare name names a built-in. A component cannot name a library component; the scene that uses it can.
- **`self` is reserved.** `config/dep.yaml` refuses it as an alias. A single-file video has no `components/`, so `self:` in one is an error that suggests the folder form.

When a component proves useful elsewhere, move it into a library unchanged. Its uses change from `self:name` to `alias:name`. [Building a library](../40_libraries/35_building-a-library.md) covers the library side.
