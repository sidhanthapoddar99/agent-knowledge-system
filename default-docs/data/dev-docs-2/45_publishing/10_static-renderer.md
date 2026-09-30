---
title: "The static renderer"
description: "apps/agentks-ssg: how it ships inside the binary, which runtime runs it, and how it turns page data into HTML with islands."
---

This page explains the static renderer, `apps/agentks-ssg`. It is the part of `agentks build` that turns page data into HTML. Rust computes the data. The renderer only draws it, with the same components the local client draws with.

## What it owns

| Owns | Must not hold |
|---|---|
| Rendering the components of `apps/packages/agentks-ui` to HTML, once per page | Layouts or components of its own |
| Writing each island's markup and props into the page | Any rule: no sorting, no link resolution, no status mapping |
| Rendering diagrams to SVG | Network access |

The renderer is a separate app because its job is a different use of the same components. The client wires them to live data over the WebSocket. The renderer runs them once over data Rust hands it. Neither keeps a copy of a layout, so the local tool and the published site cannot drift.

## How it ships and runs

- **Inside the binary.** The renderer's JavaScript bundle ships compressed inside `agentks`, like the client. There is no separate download.
- **Unpacked once per version.** On the first `agentks build`, the binary unpacks the bundle into its build cache for its own version. Later builds reuse it. The [caching section](../20_caching/01_overview.md) covers the build cache.
- **Run by the machine's runtime.** The components are JavaScript, so something must run them. The build looks for `bun`, then `node`, on the path. If neither is there, it stops and prints how to install Bun. It never downloads a runtime by itself.
- **A child process.** Rust starts the renderer and streams page data to it, then reads back the HTML. The data never becomes a file a browser could fetch.

Two other designs were ruled out. An engine embedded in the binary would add size to every install, even for users who never publish, and it builds more slowly. Writing HTML from Rust would mean every layout existing twice.

## Rendering a page

For each page, the renderer takes the page kind's layout from `agentks-ui`, renders it with the page's data using Preact's server renderer, and wraps it in the document shell: the head, the theme CSS and the island scripts the page needs. The head carries the title, description, canonical URL and Open Graph tags, which come from the page's frontmatter and `site.yaml`.

The components are pure. They take data as props and return markup. They never fetch data, never open the WebSocket and never touch browser-only objects such as `window` while they render. That is what lets the same component run inside the client in a browser and inside the renderer with no browser at all. The [frontend section](../25_frontend/01_overview.md) explains the purity rule and how a test enforces it.

## Islands

An island is a component that needs JavaScript in the reader's browser, such as the theme toggle or the issue filters. Everything else on a published page is plain HTML, and the layout's own code never loads.

The renderer writes each island like this:

```html
<div data-island="name">…the island's rendered markup…</div>
<script type="application/json" data-props>{ …the island's props… }</script>
```

1. The props are serialised data in a JSON script tag, never script variables, because a bundled module cannot read those.
2. A small islands entry in the page scans for `[data-island]`.
3. It loads each island's module on demand from a registry keyed by name.
4. It calls Preact's `hydrate` on that one element. The rest of the page is never hydrated.

Islands that Rust marks inside a page's body HTML, such as an interactive diagram, use the same registry. Their input sits in `data-` attributes. Heavy islands load only on the pages that use them. Excalidraw and tldraw run on real React in their own lazy chunk, so the React cost falls only on a page that shows such a diagram.

A page with no island ships no JavaScript at all.

In the local client the same components render live inside the page, with no island wrapper. There is one implementation, not a static copy and a live copy.

## Diagrams

The renderer also renders diagrams, in the same run:

| Source | Output |
|---|---|
| Mermaid and Graphviz, in fences and embeds | Inline SVG, readable without JavaScript and by search engines |
| Excalidraw and draw.io scenes | SVG, through each tool's own export function |
| First-class diagram pages | A page with its SVG in the body |

A diagram that fails to render fails the whole build and names the file and line. The build never ships a page with a broken figure.

## Related

- [The build pipeline](./05_build-pipeline.md): where the renderer runs among the other steps.
- [What the output holds](./15_output.md): the files the rendered pages end up in.
