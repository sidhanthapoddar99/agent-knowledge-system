---
title: "Scaffold the shared UI package agentks-ui"
status: in-progress
---

`apps/packages/agentks-ui` is where every layout, component and island lives once, so the local client and the static renderer can never drift. This leaf builds the package's skeleton and its contracts: the `DataSource` interface, the page-data types, the layout registry, the island contract, the shared display helpers, component CSS rules, and the checks that keep the package pure. The layouts themselves are built in [100_layouts](../100_layouts/00_overview.md) on top of it.

# 01 To Do
- [ ] **Create the package** `apps/packages/agentks-ui/` in the main repository, with its own `package.json` (name `@agentks/ui`, `private: true`), `tsconfig.json` in strict mode, and `src/` laid out as below. There is no JS workspace (the project-setup rule): the client and, later, `apps/agentks-ssg` each own their `package.json` and `bun.lock` and depend on the package with `link:../packages/agentks-ui`.
- [ ] **Add the framework and the type generator** to the package: `preact` 11.0.0, `preact-render-to-string` 6.7.0, `@preact/preset-vite` 2.10.6 (it needs `@babel/core` as a peer) and `json-schema-to-typescript` 16.0.0. Record them in the Stack section of the main repository's AGENTS.md ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07).
- [ ] **Page-data types** in `src/data/types.ts`.
    - [ ] Generate `src/data/generated/api.ts` from the engine's `apps/agentks-engine/schema/api.schema.json` with `json-schema-to-typescript`, as part of the package's build ([030/80](../030_rust-engine/80_page-data-interface.md) writes the schema). The types carry the shape only: no ordering, URL or status logic crosses over.
    - [ ] Commit the generated file and fail `ctl gate` when a regeneration changes it without the commit (drift check).
- [ ] **`DataSource`** in `src/data/source.ts`: the one interface every build implements (`manifest`, `page`, `sidebar`, `issuesIndex`, plus `issue`, `blogIndex` and `custom` to match the engine's request list). Components never import it; route-level code does.
- [ ] **The page shapes come from the schema, one list.** `PageData`, what `get page` returns, is tagged on `kind`: `markdown`, `video`, `diagram` or `artifact`, and names its `layout` (for example `@docs/default`). The blog index, the issues index, an issue's detail, a custom page and a sidebar are separate answers with their own types (`BlogIndex`, `IssuesIndex`, `IssueDetail`, `CustomPage`, `Sidebar`) ([030/80](../030_rust-engine/80_page-data-interface.md)). The package keeps no second list of kinds.
- [ ] **The layout registry** in `src/layouts/registry.ts`: maps the layout name from the manifest (for example `@docs/default`) to a lazily imported component. An unknown name is an error the route level shows; it never falls back to another layout.
- [ ] **The island contract** in `src/islands/` ([the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07):
    - [ ] Each island is a Preact component with a stable name and a props type. `src/islands/registry.ts` maps each name to a lazy import.
    - [ ] Props are serialisable. The static renderer writes each island as `<div data-island="name">markup</div>` followed by `<script type="application/json" data-props>`. The islands entry calls Preact's `hydrate` on that element alone, and unmounts with `render(null, el)` ([50](./50_islands.md) builds the entry).
    - [ ] The body HTML from Rust marks islands with `data-island="<name>"` and their input in `data-` attributes; they use the same registry.
- [ ] **Shared display helpers** in `src/shared/`: class-name joins, the file-type glyph list (from today's [file-type icons](../../../../../../agent-ks-engine/src/layouts/file-type-icons.ts)), the tooltip rule (`data-tip`, `data-tip-always`), status badge mapping from the status **Rust sent** to its theme variable.
- [ ] **Component CSS rules**: each component's CSS beside it; every layout's classes carry its prefix (for example `aks-docs-`); `@layer` order reset, theme, elements, components, user ([theming](../../notes/03_frontend/04_theming-and-layouts.md) section 05). The public hooks (`data-part`) are listed in `src/hooks.json`, which `agentks theme css` prints ([070/80](../070_cli/80_theme-commands.md)).
- [ ] **Purity check** (`bun test` in the package, run by `ctl gate`):
    - [ ] A static scan fails on any import of the client, the WebSocket, or `window`, `document`, `localStorage`, `indexedDB`, `setTimeout` at module top level or in render paths.
    - [ ] Every layout renders every fixture page to an HTML string under Bun with no DOM.
- [ ] **Render-parity check**: each layout renders its fixtures both as an HTML string and into a live DOM (happy-dom or a headless browser); the two outputs match after normalising whitespace and attribute order.
- [ ] **Theme contract check**: port [the contract check](../../../../../../scripts/checks/check-theme-contract.mjs) to read the package's component CSS against the contract ([100/10](../100_layouts/10_theme-contract-and-css.md) owns the contract itself).

## Guardrails
- The package imports neither `agentks-client` nor `agentks-ssg`, and no Rust code. The dependency runs one way.
- No rule in the package. The test: could the helper give a wrong answer about the content? Then it belongs to Rust.
- Keep any single file under about 400 lines; split into parts.

## Done when
- `bun test` in `apps/packages/agentks-ui` passes: purity scan, string render of every fixture, render parity.
- The client imports the package and draws a docs fixture page through `DataSource` with a stub source.
- Changing a Rust page-data struct without regenerating the types fails `ctl gate`.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, folder `apps/packages/agentks-ui`.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (all), [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (sections 03 to 06), [the Rust engine](../../notes/02_engine/03_rust-engine.md) (section 05, the data interface).
- **Today's code to learn from:** [the layouts folder](../../../../../../agent-ks-engine/src/layouts), and the rule copies in browser code that disappear: [detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts), [index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts).
- **Depends on:** [080/10 UI framework decision](./10_ui-framework-decision.md), [030/80 page data interface](../030_rust-engine/80_page-data-interface.md), [010/20 main repo skeleton](../010_project-setup/20_main-repo-skeleton.md).
- **Unblocks:** [30](./30_client-shell-and-routing.md), [40](./40_websocket-client.md), [50](./50_islands.md), every leaf in [100_layouts](../100_layouts/00_overview.md), [150/20 SSG renderer](../150_publishing/20_ssg-renderer.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): every rule stays in Rust; the frontend receives results as data. No TypeScript is generated from Rust **rules** ([open questions](../../brainstorm/01_initial-discussion/16_open-questions.md), question 10).
- Decided (sidhantha, 2026-09-29): all data access goes through one small interface.
- Decided (sidhantha, 2026-09-30): the package is `apps/packages/agentks-ui`, used by the client and the static renderer.
- Decided (claude, 2026-09-30): the TypeScript **data-shape** types are generated from the engine's `api.schema.json` with `json-schema-to-typescript` ([080/10](./10_ui-framework-decision.md), [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) section 07).

# 05 Notes & Analysis
## 01 Folder layout

```
apps/packages/agentks-ui/
  package.json
  src/
    data/
      source.ts           DataSource interface
      types.ts            re-exports the generated shapes
      generated/api.ts    generated from api.schema.json (committed)
    layouts/
      registry.ts         layout name → lazy component
      docs/default/  docs/compact/  blog/default/  issues/default/
      custom/home/  custom/info/  custom/countdown/
      navbar/default/  navbar/minimal/  footer/default/  footer/minimal/
      pages/diagram/  pages/artifact/  pages/video/
    islands/
      registry.ts         island name → lazy import
      theme-toggle/  sidebar-collapse/  issue-filters/  code-copy/  tooltip/
      diagram-mermaid/  diagram-graphviz/  diagram-excalidraw/  diagram-drawio/
      artifact-frame/  video-player/
    shared/               glyphs, tooltip rule, class joins, status → variable
    hooks.json            the public CSS hooks per layout
  fixtures/               corpus page payloads written by the Rust tests (030/80)
```

## 02 The `DataSource` shape (starting contract)

```ts
export interface DataSource {
  manifest(): Promise<SiteManifest>;
  page(url: string): Promise<PageData>;
  sidebar(section: string): Promise<SidebarTree>;
  issuesIndex(section: string): Promise<IssuesIndex>;
  issue(section: string, id: string): Promise<IssueData>;
  blogIndex(section: string): Promise<BlogIndex>;
  custom(page: string): Promise<CustomPageData>;
}
```

Every payload carries `hash`. The client caches by it; the static renderer ignores it.

## Watch out
- Until [030/80](../030_rust-engine/80_page-data-interface.md) writes corpus fixtures into the package, develop against the hand-written fixtures in `apps/agentks-engine/schema/fixtures/`: one per page kind and per answer, each checked by a round trip through the Rust types.
- Heading IDs, link hrefs and highlighted code arrive finished inside `body_html`. A layout never rewrites the body.
- Status colour comes only from the theme's status variables; the mapping is display, not a rule, because Rust already sent the status and its category.
