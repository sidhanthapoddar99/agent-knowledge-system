---
title: "What a docs page shows"
description: "The parts of a docs page that agentks builds from your files: the sidebar, the outline, previous and next, breadcrumbs, and the two docs layouts."
---

# What a docs page shows

You write the page body. agentks adds the rest of the page from your files, so it never goes out of date. This page names each part and the file it comes from, so you know what to change when a part looks wrong.

## The parts of a page

| Part | Where it comes from |
|---|---|
| **Sidebar** | The section's folder tree. Folder names come from each `settings.json` `label`. Page names come from `sidebar_label` or `title`. Order comes from the `NN_` prefixes |
| **Body** | Your markdown, rendered. For a diagram page, the diagram. For an artifact page, the artifact in a frame |
| **Outline** | The headings of the body, each a link to its place on the page |
| **Previous and next** | The pages before and after this one, in sidebar order |
| **Breadcrumbs** | The folders above the page, by their labels |

### The sidebar

The sidebar shows the whole section. A folder can be folded or open; its `settings.json` decides whether it can fold and how it starts. The folder that holds the page you are reading opens on its own. A diagram page or an artifact page carries a small mark after its name. Markdown pages carry none, because they are the usual case.

### The outline

The outline lists the page's headings and highlights the one you are reading as you scroll. Diagram and artifact pages have no headings, so they have no outline, and their content takes its width. Good headings make a good outline; see [writing content](../10_writing-content/01_overview.md), under headings and the outline.

### Previous and next

The previous and next links follow the sidebar order, so a reader can go through the section page by page. To change what comes next, change the prefixes.

## The two docs layouts

Each docs section picks a layout in `config/site.yaml`:

| Layout | What it draws |
|---|---|
| `@docs/default` | Sidebar, body, outline, previous and next |
| `@docs/compact` | The same page without the sidebar, so the body is wider |

```yaml
pages:
  guide:
    base_url: "/guide"
    type: docs
    layout: "@docs/compact"
    data: "@data/guide"
```

These are the only two docs layouts. A layout name agentks does not know stops the start with an error that lists the names it does know. To change how a layout looks, such as colours, fonts or spacing, write CSS in your theme. See [themes and layouts](../45_themes-and-layouts/01_overview.md).

## Drafts and problems

- **A draft** shows in the local app with a draft badge, and a published site leaves it out.
- **A content problem**, such as a broken link or a missing embed, travels with the page to the local app, with its file and line. `agentks check section` and `agentks check link-form` report the same problems from the command line. The [editing and sharing section](../50_editing-and-sharing/01_overview.md) shows where the local app lists them.

## When a part looks wrong

| You see | Change |
|---|---|
| A page in the wrong place | Its `NN_` prefix, with `agentks move` |
| A folder with the wrong name | The `label` in its `settings.json` |
| A page with the wrong name in the sidebar | Its `title`, or add a `sidebar_label` |
| A folder that should stay open | `"isCollapsible": false` in its `settings.json` |
| A heading missing from the outline | The heading text: a heading with no ASCII letters or digits gets no ID |
| A page missing from the sidebar | Its name: it needs an `NN_` prefix, and it must not be under `assets/` |
