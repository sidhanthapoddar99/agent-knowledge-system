---
title: "The shared UI package: agentks-ui"
---

Every layout and every UI component lives once, in the shared package `apps/packages/agentks-ui`. Two builds use it: `apps/agentks-client`, the single-page app of the local tool, and `apps/agentks-ssg`, the static renderer behind `agentks build`. The package is **pure**: a component takes data as props and returns markup. It never fetches data, never opens the WebSocket, never touches browser-only objects while it renders, and never computes a rule. Rust computes every value; the package only decides how it looks. Interactive parts are **islands**: small components that carry their own JavaScript, so a published page ships code only for them. Because one implementation serves both the local tool and the published site, the two cannot drift. The UI framework is still open ([open question 12](../01_overview/05_open-questions-and-risks.md)); this note fixes the requirements it must meet.

# 03 References

- [The architecture note](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md) — the three Phase 1 safeguards this package is the third of.
- [Phase 3: publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md) — SSG, islands, no hydration.
- [Open questions](../../brainstorm/01_initial-discussion/16_open-questions.md) — question 10 (rules stay in Rust) and question 12 (the UI framework).
- [The client application](./02_client-application.md) and [publishing with SSG](../05_delivery/02_publishing-ssg.md) — the two builds that use this package.
- [Theming and layouts](./04_theming-and-layouts.md) — which layouts the package holds, and the CSS rules its components follow.
- [The Rust engine](../02_engine/03_rust-engine.md) — where the page data comes from.
- Today's layouts, which this package replaces: [the layouts folder](../../../../../../agent-ks-engine/src/layouts) and the browser scripts in [the scripts folder](../../../../../../agent-ks-engine/src/scripts).
- Today's rule copies in browser code, which disappear: [the detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [the index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the frontend holds display and UI logic only. Every rule stays in Rust, and the frontend receives results as data.
- Decided (sidhantha, 2026-09-29): no TypeScript is generated from Rust rules.
- Decided (sidhantha, 2026-09-29): all data access goes through one small interface, and the router uses real URL paths (safeguards 1 and 2).
- Decided (sidhantha, 2026-09-30): the layouts and components live in `apps/packages/agentks-ui`, used by `apps/agentks-client` and `apps/agentks-ssg` (safeguard 3).
- Decided (sidhantha, 2026-09-30): published pages are not hydrated as a whole and do not load their content as JSON. Only interactive parts carry JavaScript.
- Decided (sidhantha, 2026-09-30): the UI framework must render the shared components to HTML at build time and support islands. Which framework is still open (question 12).

# 05 Notes & Analysis

## 01 Where the package sits

```
apps/
  packages/
    agentks-ui/        layouts, components, islands, component CSS, the data types
  agentks-client/      state 1 and 2: wires the package to live data over the WebSocket
  agentks-ssg/         state 3: renders the package to static HTML once per page
  agentks-engine/      Rust: computes the data both builds feed to the package
```

The dependency runs one way. The client and the static renderer import the package. The package imports neither of them, and no Rust code. It knows the **shape** of the data it receives and nothing about where the data came from.

## 02 What may live in the package

| Belongs in `agentks-ui` | Does not belong |
|---|---|
| Layouts: docs, blog, issues, the built-in custom pages, navbar, footer, first-class diagram, artifact and video pages | The router. Each build routes its own way |
| Components those layouts are made of: sidebar tree, outline, pagination, issue table, status badges, cards | The WebSocket client, the browser cache, the service worker. Those are the client's |
| Islands: the interactive parts, each with its own small mount script (section 05) | The dev toolbar and the editor. They exist only in the local tool ([the dev toolbar](./05_dev-toolbar.md), [editor engines](./03_editor-engines.md)) |
| Component CSS, written against the theme variables ([theming](./04_theming-and-layouts.md)) | The theme CSS itself. Rust compiles it per project |
| The TypeScript types of the page data (section 03) | Any rule: ordering, URLs, slugs, status categories, filter option lists, date formats that depend on config |
| Shared display helpers with no rule inside: class-name joins, icon glyph lookups by a value Rust sent | Fetching, timers, or storage while rendering |

**The test for a helper:** could it give a wrong answer about the content? If yes, it is a rule, and Rust computes it. The frontend decides only how a value looks and behaves on screen.

## 03 The data interface

Safeguard 1 says every piece of data reaches the UI through one small interface. The package defines that interface as a TypeScript type. Each build implements it once.

```ts
// agentks-ui/src/data/source.ts (claude, proposed shape)
export interface DataSource {
  manifest(): Promise<SiteManifest>;            // every route: url, kind, layout, hash
  page(url: string): Promise<PageData>;         // one page's data, by its URL
  sidebar(section: string): Promise<SidebarTree>;
  issuesIndex(section: string): Promise<IssuesIndex>;
}
```

| Build | How it implements `DataSource` |
|---|---|
| `agentks-client` | Asks the Rust server over the `/api` WebSocket, and keeps the answers in the browser cache by content hash ([the client](./02_client-application.md)) |
| `agentks-ssg` | Hands over the data Rust already computed for the page, directly. Nothing is written out as JSON for a browser to fetch ([publishing](../05_delivery/02_publishing-ssg.md)) |

**Components never call `DataSource`.** The route level of each build calls it, then passes the result down as props. That is what keeps components pure: the same component renders the same props in the browser and at build time.

**Every payload carries its hash.** Each `PageData`, sidebar and index includes the content hash it was built from. The client caches by it; the static renderer ignores it.

**The page kinds** (claude, proposed). `PageData` is a tagged union on `kind`, one variant per layout the package can draw:

| `kind` | Drawn by | Main fields |
|---|---|---|
| `docs` | the docs layout named in config | `title`, `bodyHtml`, `outline`, `sidebarSection`, `prev`, `next`, frontmatter values for display |
| `blog-index` · `blog-post` | the blog layouts | posts with dates and tags already sorted and formatted; one post's `bodyHtml` |
| `issues-index` · `issue` · `issue-subdoc` | the issues layouts | issues with status, category, priority and labels already resolved; the facet values filters match on; one issue's files |
| `custom` | the built-in custom page named in config (home, info, countdown) | the page's YAML data |
| `diagram` | the diagram page | the diagram's source and type, from `.mmd`, `.dot`, `.excalidraw` or `.drawio` |
| `artifact` | the artifact page | the iframe URL and the `.meta.json` sidecar values |
| `video` | the video page | the video's cues and transcript ([video pages](../04_ecosystem/05_video-pages.md)) |

**Where the types come from** (claude, proposed). The Rust structs that the engine serialises are the source. The TypeScript types are generated from them at build time, for example with `ts-rs`, so the two cannot drift. This generates the *shape* of the data, not a rule: no ordering, status category or URL logic crosses over, which keeps the decision on question 10 intact. If the user reads that decision as forbidding generated types too, the fallback is hand-written types checked against JSON fixtures that Rust emits in its tests.

## 04 Body HTML from Rust

Rust renders every page body to HTML ([the Rust engine](../02_engine/03_rust-engine.md)). A layout places that HTML inside its frame. It never parses markdown and never rewrites the body.

The body arrives finished:

- **Links are root-absolute.** Rust resolves every relative link on disk to its URL (`/dev-docs/architecture/overview`). A relative href left for the browser breaks under client routing and on static hosts ([2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md)).
- **Heading IDs are set.** The outline and `#heading` anchors use the IDs Rust wrote. They must match today's IDs exactly.
- **Code is highlighted with CSS classes**, not inline colours, so light and dark mode come from CSS.
- **Interactive spots are marked, not scripted.** A diagram, an embedded artifact or a copy button appears as an element with a `data-island` attribute and its input (claude, proposed). For example: `<div data-island="mermaid" data-src-hash="…"><pre>graph TD; …</pre></div>`. The client mounts the matching island on it. The static renderer may replace the source with a pre-rendered SVG.

## 05 Islands

An island is a component that needs JavaScript in the reader's browser. Everything else on a page is plain markup.

| Island | Job | Where its data comes from |
|---|---|---|
| Theme toggle | Light, dark or system | Local preference |
| Sidebar collapse | Open and close folders, remember the state | The sidebar tree Rust sent; state in local storage |
| Issue filters and table | Show the issues that match the chosen filters | Rust sends each issue with its facet values and the option lists. The island only matches values; it never works out a status category or an order |
| Search | Query the site | Phase 3: a search index written at build time ([publishing](../05_delivery/02_publishing-ssg.md)) |
| Diagram viewers | Mermaid, Graphviz, Excalidraw, draw.io; pan, zoom, lightbox | The source in the body. On a published page, a pre-rendered SVG where possible |
| Artifact frame | The iframe, with expand and open-full-page. Sandboxed for library HTML only ([library system](../04_ecosystem/01_library-system.md)) | The artifact URL and sidecar |
| Video player | Plays a narrated video page | The page's cues ([video pages](../04_ecosystem/05_video-pages.md)) |
| Code copy, tooltips | Copy a code block; show a tip only when text is cropped | The markup itself |

**The island contract** (claude, proposed):

- Each island is a component in the package with a stable name and a props type.
- Its props are serialisable data. The static renderer writes them into the page as a `<script type="application/json">` tag beside the island's markup, never as script variables, because a bundled module cannot read those.
- A mount function renders the island into its element and returns a function that removes it.
- Heavy islands (Mermaid, Excalidraw, draw.io, the video player) are loaded on demand, only on pages that use them. They already dominate the bundle today.
- In the client app the same island components mount inside the live page, so there is one implementation, not a static copy and a live copy.

**No whole-page hydration.** A published page never re-renders itself in the browser and never loads its own content again as JSON. That is the slow part SSG is meant to remove.

## 06 CSS inside the package

- Each component's CSS lives beside it and ships with it into both builds.
- Every value comes from the theme contract: colours, sizes, spacing and radii are `var(--…)` from `theme.yaml`'s required variables and the semantic tokens. No hex codes, no invented names, no fallbacks that freeze a value ([theming](./04_theming-and-layouts.md)).
- Each layout's classes carry a prefix, so the CSS of one layout cannot leak into another. This replaces Astro's scoped CSS, which the prior audit counted at 1,364 lines.
- The classes and `data-part` attributes a user may style are a **public contract**. Renaming one needs a migration ([theming](./04_theming-and-layouts.md)).

## 07 The UI framework

Still open. The hard requirements, from the decisions above:

| Requirement | Why |
|---|---|
| Renders components to an HTML string at build time, in Bun or Node | The static renderer needs it |
| Islands: mount single components into static HTML without hydrating the page | Published pages ship JavaScript only for interactive parts |
| Lazy loading of layouts and islands | Keeps the first download small |
| A router that handles real paths, `#heading` anchors and scroll on back and forward | Safeguard 2, and a usable single-page app |
| Written well by AI agents | The AI is the main author of changes |

The candidates named so far are React, Preact, Solid, Svelte and Vue. Preact, Solid and Svelte do build-time rendering with islands well; React can, with more work. Excalidraw and tldraw are React components, so any other framework mounts them inside a React island. That costs React's runtime on the pages that show them, and nothing elsewhere.

## 08 How the package is checked

- **Render checks** (claude, proposed). Each layout renders a set of fixture pages both ways: to an HTML string, as the static renderer does, and into a live page, as the client does. The two results must match after normalising whitespace and attribute order. That catches a component that reads `window` or fetches while rendering.
- **The Phase 1 parity checks** apply to what the package draws: every route, every heading ID, link, table and code block matches today's engine, and screenshots of each layout in light and dark mode show nothing drastic ([development and testing](../05_delivery/05_development-workflow-and-testing.md)).
- **The theme contract check** carries over and reads the package's CSS ([theming](./04_theming-and-layouts.md)).

## 09 Open

- The UI framework (question 12).
- Whether generated TypeScript types for the data shape are acceptable under the decision on question 10 (section 03).

Both are tracked in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
