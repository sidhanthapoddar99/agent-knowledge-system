---
title: "The shared UI package"
---

`agentks-ui` holds every layout and UI component of agentks exactly once. The package is at `apps/packages/agentks-ui`, and its name is `@agentks/ui`.

## Why one package

The local client and the published site draw the same pages. Two copies of a layout would drift, and a page would look different in the two places. So both builds draw with one package.

## What is in it

| Path under `apps/packages/agentks-ui/` | What it holds |
|---|---|
| `src/data/source.ts` | `DataSource`, the one interface each build implements to hand data over |
| `src/data/generated/api.ts` | The `/api` types, generated from the engine's schema. Never edited by hand |
| `src/data/types.ts`, `keys.ts`, `memory-source.ts` | Names for the generated unions, the data-key grammar, and a `DataSource` over answers held in memory |
| `src/layouts/registry.ts` | Layout name, such as `@docs/default`, to a component loaded on demand |
| `src/layouts/<type>/<style>/` | The layouts and the parts they are made of: sidebar tree, outline, pagination, breadcrumbs, navbar, footer |
| `src/layouts/site/` | The frame around a page, notices, and the not-found, fatal and load-error pages |
| `src/islands/registry.ts` | Island name to a component loaded on demand ([islands](./20_islands.md)) |
| `src/shared/` | Display helpers with no rule inside: class-name joins, file-type glyphs, tooltip attributes, status colours |
| `src/page-head.ts` | The cascade layer order and the pre-paint theme script every page's head carries |
| `src/hooks.json` | The public CSS hooks of each layout ([theming in components](./35_theming-in-components.md)) |

## What may live here, and what may not

| Belongs in `agentks-ui` | Does not belong |
|---|---|
| Layouts for docs, blog, issues, the built-in custom pages, navbar and footer, and the diagram and artifact pages | The router. Each build routes its own way |
| The components those layouts are made of | The WebSocket client, the browser cache and the service worker. They belong to the client |
| Islands, each loaded by name from one registry | The dev toolbar and the editor. They exist only in the local tool |
| Component CSS, written against the theme variables | The theme CSS itself. Rust compiles it per project |
| The TypeScript types of the page data | Any rule: ordering, URLs, slugs, status categories, filter option lists, dates that depend on config |
| Display helpers such as a class-name join, or an icon lookup by a value Rust sent | Fetching, timers or storage while rendering |

## Pure means data in, markup out

A component takes data as props and returns markup. While it renders, it never fetches, never opens the socket, never touches a browser-only object such as `window` or `localStorage`, and never computes a rule. So the same props give the same markup in the browser and at build time.

**Where browser code may live.** Some code must run in the browser: an effect, an event handler, the theme toggle. It lives only in files named `*.client.ts` and under `apps/packages/agentks-ui/src/islands/`.

**The purity test** (`apps/packages/agentks-ui/tests/purity.test.ts`) scans every other file in the package. It fails on a browser object, a timer or storage anywhere outside those places. It also fails on an import of the client, the static renderer or the engine. A static scan cannot tell a render path from an effect inside one file, which is why the rule is by file, not by function.

**Preact is a peer dependency** of the package. A build must contain exactly one copy of Preact, because two copies break hooks. The client resolves the package by a path alias and tells Vite to dedupe Preact.

## Layouts by name

Config names a layout by a string such as `@docs/default` or `@navbar/default`. `apps/packages/agentks-ui/src/layouts/registry.ts` maps each name to a component loaded on demand with `import()`, so each layout is its own chunk.

- A page layout also declares what else it needs. `@docs/default` needs the section's sidebar, so the route level fetches it too. `@docs/compact` needs nothing more.
- An unknown name throws `UnknownLayoutError`, naming the known layouts. It never falls back to another layout.

Every layout takes exactly the props of its family (`PageLayoutProps`, `NavbarProps`, `FooterProps`) and computes nothing from them. A page layout also takes `showErrors`: true in the local client, where a page shows its content problems, and false on a published site.

**Layout size.** A layout file stays under about 400 lines. A bigger one splits into parts beside it.

## How the package is checked

From the package folder, `bun test` runs all of these. `ctl test ui` runs the same.

| Check | Catches |
|---|---|
| Purity scan | A browser object, a timer or storage in render code, or an import across the one-way line |
| String render | Every layout renders every fixture page to an HTML string with no DOM present, as the static renderer does |
| Render parity | The string render and a live render into a DOM give the same markup, after whitespace and attribute order are normalised. A component that reads `window` or fetches while rendering fails here |
| Theme contract | The package's CSS reads only declared theme variables ([theming in components](./35_theming-in-components.md)) |
| Data keys | The TypeScript data-key parser agrees with the grammar in the schema |
| Type drift | The committed generated types differ from a fresh generation |

`bun run lint` runs oxlint, and `bun run typecheck` runs the TypeScript compiler. How these fit into the repository's gate is in [contributing](../55_contributing/01_overview.md).
