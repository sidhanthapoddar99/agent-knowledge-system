---
title: "Diagram pages"
description: "Give a diagram file an NN_ prefix in a docs section and it becomes a page of its own, with a sidebar entry and a URL, and an optional sidecar for its title."
---

# Diagram pages

A diagram file with an `NN_` prefix in a docs section is a page of its own. It gets a sidebar entry and a URL, exactly like a markdown page, and the diagram fills the page. Use it when the diagram is the content, such as an architecture map or a data model, and there is no prose to wrap around it.

## Make one

Save the diagram in a docs folder, outside `assets/`, with a prefix:

```
data/guide/20_architecture/
├── settings.json
├── 10_overview.md              → /guide/architecture/overview
├── 20_components.mmd           → /guide/architecture/components
└── 30_data-model.excalidraw    → /guide/architecture/data-model
```

| Extension | Format |
|---|---|
| `.mmd`, `.mermaid` | Mermaid |
| `.dot`, `.gv` | Graphviz |
| `.excalidraw` | Excalidraw |
| `.drawio` | draw.io |

The naming rules are the same as for markdown: the prefix sets the order and leaves the URL, and so does the extension. Link to a diagram page by its file, `[the component map](./20_components.mmd)`, and agentks writes its URL.

In the sidebar, a diagram page carries a small mark after its name, so you can tell it from a markdown page. Markdown pages carry no mark.

## The title

With nothing else, agentks makes the title from the file name: it drops the prefix and the extension, turns `-` and `_` into spaces and capitalises each word. `20_system-architecture.mmd` becomes "System Architecture". Name the file well and you are done.

When the name is not enough, add a sidecar: a file with the same name and `.meta.json` in place of the extension.

```json
{
  "title": "System architecture",
  "description": "The main components and how they talk to each other.",
  "sidebar_label": "Architecture",
  "draft": false
}
```

Saved as `20_system-architecture.meta.json`, beside `20_system-architecture.mmd`.

| Field | Meaning |
|---|---|
| `title` | The page title |
| `description` | A one-line summary of the diagram |
| `sidebar_label` | Shorter text for the sidebar |
| `sidebar_position` | Accepted, but does not change the order. The sidebar orders pages by prefix |
| `draft` | `true` keeps the page out of a published site. See [drafts](./35_drafts.md) |

Every field is optional. The sidecar may also be `.meta.jsonc`, which allows comments and trailing commas. When both exist, the `.meta.jsonc` file is read. An unknown key is a warning that lists the keys a sidecar may use.

## What the page shows

- The diagram, full width, with pan, zoom and a full-screen view.
- No outline, because a diagram has no headings.
- The section's sidebar, as on every docs page.

## Files that are not pages

| File | Why it is not a page |
|---|---|
| `flow.mmd`, with no prefix | agentks warns and skips it. Add a prefix, or move it into `assets/` |
| Any diagram under `assets/` | Nothing under `assets/` is a page. This is the place for diagrams that a page embeds |

## Two files, one URL

`15_lightbox.md` and `16_lightbox.mmd` both want the URL `…/lightbox`. Two pages cannot share a URL, so agentks keeps one and reports the rest:

- The markdown page wins over the diagram, and a diagram wins over an HTML artifact.
- The page that keeps the URL shows the collision error. The others get no URL.

Rename one of the files, with `agentks move`, so each has its own name.

## Turn diagram pages off for a section

A section that should only ever show diagrams as figures can turn diagram pages off. Add this to the `settings.json` at the section's root folder:

```json
{
  "allow_diagram_pages": false
}
```

Prefixed diagram files in that section are then ordinary files, not pages. The setting only works at the section root.

## Diagrams in the issue tracker

An issue's working folders can hold diagram files too, and they show up beside the notes that discuss them. The [issue tracker](../30_issue-tracker/01_overview.md) explains which folders.
