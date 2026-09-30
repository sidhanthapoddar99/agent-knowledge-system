---
title: "The shared UI package: agentks-ui"
---

Every layout and every UI component lives once, in the shared package `apps/packages/agentks-ui`. Two builds use it: `apps/agentks-client`, the single-page app of the local tool, and `apps/agentks-ssg`, the static renderer behind `agentks build`. The package is **pure**: a component takes data as props and returns markup. It never fetches data, never opens the WebSocket, never touches browser-only objects while it renders, and never computes a rule. Rust computes every value; the package only decides how it looks. Interactive parts are **islands**: small components that carry their own JavaScript, so a published page ships code only for them. Because one implementation serves both the local tool and the published site, the two cannot drift. The UI framework is Preact, chosen by a measured spike (section 07).

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
- Decided (sidhantha, 2026-09-30): the UI framework must render the shared components to HTML at build time and support islands.
- Decided (claude, under sidhantha's delegation, 2026-09-30): the UI framework is Preact 11, the router is a small manifest-driven one in `agentks-client`, islands hydrate one by one from a registry, component CSS is a plain prefixed CSS file beside each component, and the TypeScript types are generated from the engine's JSON Schema (section 07, question 12).

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
| Islands: the interactive parts, each loaded by name from one registry (sections 05 and 07) | The dev toolbar and the editor. They exist only in the local tool ([the dev toolbar](./05_dev-toolbar.md), [editor engines](./03_editor-engines.md)) |
| Component CSS, written against the theme variables ([theming](./04_theming-and-layouts.md)) | The theme CSS itself. Rust compiles it per project |
| The TypeScript types of the page data (section 03) | Any rule: ordering, URLs, slugs, status categories, filter option lists, date formats that depend on config |
| Shared display helpers with no rule inside: class-name joins, icon glyph lookups by a value Rust sent | Fetching, timers, or storage while rendering |

**The test for a helper:** could it give a wrong answer about the content? If yes, it is a rule, and Rust computes it. The frontend decides only how a value looks and behaves on screen.

## 03 The data interface

Safeguard 1 says every piece of data reaches the UI through one small interface. The package defines that interface as a TypeScript type. Each build implements it once.

```ts
// agentks-ui/src/data/source.ts (claude, proposed shape: one method per `get` the engine answers)
export interface DataSource {
  manifest(): Promise<Manifest>;                // every route: url, section, data key, hash
  page(url: string): Promise<PageData>;         // one page's data, by its URL
  sidebar(section: string): Promise<Sidebar>;
  issuesIndex(section: string): Promise<IssuesIndex>;
  issue(section: string, id: string): Promise<IssueDetail>;
  blogIndex(section: string): Promise<BlogIndex>;
  custom(page: string): Promise<CustomPage>;
}
```

| Build | How it implements `DataSource` |
|---|---|
| `agentks-client` | Asks the Rust server over the `/api` WebSocket, and keeps the answers in the browser cache by content hash ([the client](./02_client-application.md)) |
| `agentks-ssg` | Hands over the data Rust already computed for the page, directly. Nothing is written out as JSON for a browser to fetch ([publishing](../05_delivery/02_publishing-ssg.md)) |

**Components never call `DataSource`.** The route level of each build calls it, then passes the result down as props. That is what keeps components pure: the same component renders the same props in the browser and at build time.

**Every payload carries its hash.** Each `PageData`, sidebar and index includes the content hash it was built from. The client caches by it; the static renderer ignores it.

**The shapes**, as the engine defines them ([030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)). `PageData`, what `get page` returns, is tagged on `kind`, one variant per kind of page body. Every page also carries `url`, `hash`, `section`, `layout` (such as `@docs/default`), `source` (the file path), `title`, breadcrumbs, `prev`, `next` and its content `errors`; field names are snake_case.

| `kind` | Drawn by | Main fields |
|---|---|---|
| `markdown` | the section's layout: a docs page, a blog post, an issue's sub-document | `body_html`, `outline`, `diagrams`; a blog post adds a `post` block with date, author and tags |
| `video` | the video page | `body_html`, as a markdown page; the cue data joins with the video work ([video pages](../04_ecosystem/05_video-pages.md)) |
| `diagram` | the diagram page | `lang` and `source_text`, from `.mmd`, `.dot`, `.excalidraw` or `.drawio`; display options from the sidecar |
| `artifact` | the artifact page | `artifact_url`, `theme` (`site` or `self`) and display options from the `.meta.json` sidecar |

The other layouts draw their own answers, not `PageData`: the blog index (`BlogIndex`, posts already sorted and formatted), the issues index (`IssuesIndex`, each issue's status, category, priority and labels resolved, plus the filter option lists), one issue (`IssueDetail`, its body and its anatomy tree; each sub-document is a page with its own URL) and a built-in custom page (`CustomPage`, its YAML data).

**Where the types come from.** The Rust structs that the engine serialises are the source. Rust writes `api.schema.json` from them (`schemars`, [030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)), and `json-schema-to-typescript` generates the package's TypeScript types from that schema at build time (section 07), so the two cannot drift. This generates the *shape* of the data, not a rule: no ordering, status category or URL logic crosses over, which keeps the decision on question 10 intact.

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

**The island contract** (the mount is in section 07):

- Each island is a component in the package with a stable name and a props type.
- Its props are serialisable data. The static renderer writes them into the page as a `<script type="application/json" data-props>` tag beside the island's markup, never as script variables, because a bundled module cannot read those.
- The islands entry loads each island by name from a registry of lazy imports, hydrates it on its own element, and unmounts it with `render(null, el)`.
- Heavy islands (Mermaid, Excalidraw, draw.io, the video player) are loaded on demand, only on pages that use them. They already dominate the bundle today.
- In the client app the same components render live inside the page, with no island wrapper, so there is one implementation, not a static copy and a live copy.

**No whole-page hydration.** A published page never re-renders itself in the browser and never loads its own content again as JSON. That is the slow part SSG is meant to remove.

## 06 CSS inside the package

- Each component's CSS lives beside it and ships with it into both builds.
- Every value comes from the theme contract: colours, sizes, spacing and radii are `var(--…)` from `theme.yaml`'s required variables and the semantic tokens. No hex codes, no invented names, no fallbacks that freeze a value ([theming](./04_theming-and-layouts.md)).
- Each layout's classes carry a prefix, so the CSS of one layout cannot leak into another. This replaces Astro's scoped CSS, which the prior audit counted at 1,364 lines.
- The classes and `data-part` attributes a user may style are a **public contract**. Renaming one needs a migration ([theming](./04_theming-and-layouts.md)).

## 07 The UI framework

**Decided: Preact 11.0.0** (claude, 2026-09-30, [080/10](../../subtasks/080_ui-and-client/10_ui-framework-decision.md)). A spike built the docs layout three times, in Preact, Solid and Svelte, from a hand-written page payload. All three met every hard requirement, and all three render far faster than we need. Preact won on size and simplicity. Its two islands cost 8.0 KiB of gzipped JavaScript on a static page, against 11.1 for Solid and 16.5 for Svelte. Its hydration needs no markers in the HTML and no bootstrap script, so an island hydrates any markup, wherever the server rendered it. One compile serves the server and the browser. It is JSX with hooks, the idiom AI agents write most reliably. React and Vue were dropped on paper: React's runtime is several times Preact's on every page, and Vue had no edge over the three finalists.

| Measured (production builds, 2026-09-30) | Preact 11.0.0 | Solid 1.9.15 | Svelte 5.57.1 |
|---|---|---|---|
| Static docs page, two islands: gzipped JS | **8.0 KiB** | 11.1 KiB, plus a 0.4 KB inline hydration script | 16.5 KiB |
| Same page with the Excalidraw island | 417.5 KiB | 420.6 KiB | 426.0 KiB |
| SPA first load: gzipped JS | **9.2 KiB** | 12.6 KiB | 18.2 KiB |
| 1,300 pages to HTML strings, Bun 1.4.2 / Node 24.21.0 | 44 / 54 ms | 29 / 48 ms | 24 / 33 ms |
| In-app navigation, median of 10 (fetch + draw) | 12.7 ms | 11.4 ms | 12.3 ms |
| Lines of code for the spike's components and entries | 100 | 110 | 116 |
| Hard edges | none | islands need the `_$HY` hydration script in every page, a render ID each, and `data-hk` keys in the markup | the markup is full of hydration comment markers; a separate server compile; the server bundle inlines 45 KB of `svelte/server` |

**What the choice implies for the builds:**

- **Router.** A small router of our own in `agentks-client`, about 60 lines in the spike. It looks each path up in the manifest, intercepts same-origin links to known pages, keeps the scroll position in `history.state`, restores it on back and forward, scrolls to `#heading` on first load and after navigation, and moves focus and the title to the new page's heading. A pattern-matching router adds nothing when the manifest is the route table. The spike checked every one of these behaviours in headless Chromium.
- **Island mount.** The server writes each island as `<div data-island="name">markup</div>` followed by `<script type="application/json" data-props>`. The islands entry scans the page for `[data-island]`, loads each island's module on demand from a registry keyed by name, and calls Preact's `hydrate` on that element alone. Unmount is `render(null, el)`. Islands that Rust marks inside the body HTML use the same registry, with their input in `data-` attributes. In the client app the same components render live, with no island wrapper. The published page never loads the layout's code.
- **React islands.** Excalidraw and tldraw run on real React 19, mounted with `createRoot` in their own lazy chunk. Preact's React aliases stay off (`reactAliasesEnabled: false`), so the React-only components never run on the compatibility layer. The cost is about 410 KiB of gzipped JavaScript, on the one page that shows such a diagram, and nothing elsewhere.
- **Component CSS.** A plain CSS file beside each component, imported by the component, with classes prefixed by layout (`docs-…`) and values only from the theme variables (section 06). Vite bundles it for the client, and the static renderer links the CSS files listed in Vite's build manifest. No CSS modules and no CSS-in-JS, because hashed class names would break the public class contract.
- **Types.** Rust writes `api.schema.json` from its types (`schemars`, [030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)). `json-schema-to-typescript` turns it into `src/data/generated/api.ts` in the package, as part of the build; it took 0.1 s in the spike. A stale file fails the gate. Only data shapes cross over, never a rule.
- **Build tools.** Vite 8.3.1 with `@preact/preset-vite` 2.10.6 (it needs `@babel/core` as a peer) and `preact-render-to-string` 6.7.0.

The hard requirements the spike checked:

| Requirement | Why |
|---|---|
| Renders components to an HTML string at build time, in Bun or Node | The static renderer needs it |
| Islands: mount single components into static HTML without hydrating the page | Published pages ship JavaScript only for interactive parts |
| Lazy loading of layouts and islands | Keeps the first download small |
| A router that handles real paths, `#heading` anchors and scroll on back and forward | Safeguard 2, and a usable single-page app |
| Written well by AI agents | The AI is the main author of changes |

## 08 How the package is checked

- **Render checks** (claude, proposed). Each layout renders a set of fixture pages both ways: to an HTML string, as the static renderer does, and into a live page, as the client does. The two results must match after normalising whitespace and attribute order. That catches a component that reads `window` or fetches while rendering.
- **The Phase 1 parity checks** apply to what the package draws: every route, every heading ID, link, table and code block matches today's engine, and screenshots of each layout in light and dark mode show nothing drastic ([development and testing](../05_delivery/05_development-workflow-and-testing.md)).
- **The theme contract check** carries over and reads the package's CSS ([theming](./04_theming-and-layouts.md)).
