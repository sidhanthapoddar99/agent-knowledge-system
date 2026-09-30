---
title: "Islands"
---

This page explains islands: the interactive parts of a page, and the only parts that carry JavaScript on a published page. You get the island contract, the registry, how the markup marks an island, and how the client and the static site bring one to life. Read it before you add anything interactive to a layout or a page body.

## What an island is

An island is a component that needs JavaScript in the reader's browser. Everything else on a page is plain markup.

A published page is never hydrated as a whole, and it never loads its own content again as JSON. Only its islands load code, each on its own element. That is what keeps a published page light.

| Island | Job | Its data comes from |
|---|---|---|
| Theme toggle | Light or dark | The reader's stored choice |
| Sidebar collapse | Open and close folders, and remember them | The sidebar tree Rust sent; the state in local storage |
| Issue filters and table | Show the issues that match the chosen filters | Rust sends each issue with its facet values, and the option lists. The island only matches values. It never works out a status category or an order |
| Search | Query the site | A search index written at build time |
| Diagram viewers | Mermaid, Graphviz, Excalidraw, draw.io: pan, zoom, lightbox | The source in the body |
| Artifact frame | The iframe, with expand and open-full-page. Sandboxed for library HTML only | The artifact URL and its sidecar |
| Code copy, tooltips | Copy a code block; show a tip only when text is cropped | The markup itself |

## The contract

- **A stable name.** Each island is a component in `agentks-ui` with a name that never changes, such as `theme-toggle`, and a props type.
- **Serialisable props.** Props are plain data. The static renderer writes them as a `<script type="application/json" data-props>` tag right after the island's element. It never writes them as script variables, because a bundled module cannot read those.
- **One registry.** `apps/packages/agentks-ui/src/islands/registry.ts` maps each name to a lazy `import()`. Each island is its own chunk. `islandFor(name)` returns the entry, and an unknown name throws `UnknownIslandError`, never a silent skip.
- **One element each.** An island mounts on its own element, and unmounts with `render(null, el)`.
- **Browser code only here.** An island's browser code lives under `apps/packages/agentks-ui/src/islands/`, where the purity test allows it ([the shared UI package](./05_the-shared-ui-package.md)).

## The markup

A layout island is written like this:

```html
<div data-island="theme-toggle">…the server-rendered markup…</div>
<script type="application/json" data-props>{ …the island's props… }</script>
```

An island that Rust marks inside a page body carries its input in `data-` attributes instead, for example a Mermaid diagram with its source as the element's content:

```html
<div data-island="mermaid" data-src-hash="…"><pre>graph TD; A --> B</pre></div>
```

The attribute names are exported constants: `ISLAND_ATTR` is `data-island` and `ISLAND_PROPS_ATTR` is `data-props`.

## Mounting, in each build

**On a published page,** the islands entry scans the page for `[data-island]`. For each element it loads that island's module on demand from the registry, reads its props, and calls Preact's `hydrate` on that element alone. Preact's hydration needs no markers in the HTML and no bootstrap script, so an island can hydrate any markup, wherever it was rendered. The page never loads the layout's own code.

**In the client app,** the same components render live inside the page, with no island wrapper. A layout's interactive parts, such as the sidebar and the filters, are ordinary components of the live tree. There is one implementation, not a static copy and a live copy.

**For islands in a page body,** the client's `apps/agentks-client/src/islands.ts` scans the drawn body after each navigation. It reads each element's props from the JSON tag after it, or from its `data-` attributes, loads the component, and renders it into the element. Before the next page replaces the body, it unmounts every island it mounted.

**When an island cannot mount,** the element keeps its plain content, so a diagram still shows its source. The element gets `data-island-state="unknown"` for a name the registry does not know, or `"failed"` when loading failed, and the client logs why in development.

## Heavy islands

Mermaid, Excalidraw, draw.io and the video player dominate the frontend's weight. Each is its own chunk and loads only on a page that uses it ([performance and offline](./40_performance-and-offline.md)).

**React islands.** Excalidraw and tldraw are React components. They run on real React, mounted with `createRoot` inside their own lazy chunk. Preact's React compatibility aliases stay off (`reactAliasesEnabled: false`), so these components never run on a compatibility layer. React's cost lands only on the page that shows such a diagram, and nowhere else.

## Adding an island

1. Write the component under `apps/packages/agentks-ui/src/islands/<name>/` in `agentks-ui`, with a props type of plain data.
2. Register it in `apps/packages/agentks-ui/src/islands/registry.ts` under a new, stable name, with a lazy `import()`.
3. Emit it from the layout, or ask the engine to mark it in the body HTML.
4. Keep every value it filters, sorts or shows computed by Rust. The island only matches and displays.
5. If it is heavy, check that no other page loads its chunk.
