---
title: "Data interface and types"
---

This page explains how data reaches a component: the one `DataSource` interface, where the TypeScript types come from, what a page's data looks like, and what arrives finished in the body HTML.

## One interface, two builds

Every piece of data reaches the UI through one small interface, `DataSource`, in `apps/packages/agentks-ui/src/data/source.ts`. It has one method per kind of `get` the engine answers:

```ts
export interface DataSource {
  manifest(): Promise<Manifest>;                // every route with its section, data key and hash
  page(url: string): Promise<PageData>;         // one page by its URL
  sidebar(section: string): Promise<Sidebar>;   // one docs section's sidebar tree, in order
  issuesIndex(section: string): Promise<IssuesIndex>;
  issue(section: string, id: string): Promise<IssueDetail>;
  blogIndex(section: string): Promise<BlogIndex>;
  custom(page: string): Promise<CustomPage>;
}
```

| Build | How it implements `DataSource` |
|---|---|
| `agentks-client` | Asks the server over the `/api` WebSocket, and keeps the answers in a browser cache checked by hash ([the WebSocket client](./25_websocket-client.md)) |
| `agentks-ssg` | Hands over the data Rust already computed for the page, directly. Nothing is written out as JSON for a browser to fetch ([publishing](../45_publishing/01_overview.md)) |
| Tests and dev tools | `memory-source.ts`: a `DataSource` over answers held in memory |

**Components never call `DataSource`.** The route level of each build calls it, then passes the results down as props. That is what keeps components pure.

`keys.ts` holds the data-key grammar in TypeScript: `parseDataKey` reads a key such as `page:/dev-docs/a` into a query, `dataKey` writes one back, and `fetchQuery` is the one place that maps a query to its `DataSource` method. A string that does not fit the grammar throws. The grammar itself is defined by the engine ([requests and replies](../15_server-and-protocol/15_requests-and-replies.md)).

## Where the types come from

The Rust types the engine serialises are the source of every shape:

1. The Rust types live in the crate `agentks-api`.
2. The engine writes `apps/agentks-engine/schema/api.schema.json` from them, with `schemars`.
3. `bun run gen` in the package runs `apps/packages/agentks-ui/scripts/gen-types.ts`, which turns the schema into `apps/packages/agentks-ui/src/data/generated/api.ts` with `json-schema-to-typescript`.
4. `apps/packages/agentks-ui/src/data/types.ts` gives short names to the generated unions: `Push`, `PushOf`, `Reply`, `Query`, `PageOf`.

**A stale file fails the checks.** A test compares the committed `api.ts` with a fresh generation. `ctl build client` regenerates it before every client build.

**Only shapes cross over, never rules.** The generated file holds field names and types. No ordering, URL, status category or filter logic crosses from Rust into TypeScript.

**One workaround in the generator.** `schemars` writes each tagged enum variant as a `$ref` with sibling keywords, which JSON Schema draft 2020-12 allows. `json-schema-to-typescript` drops the referenced fields in that case. So `gen-types.ts` rewrites each such node as `allOf: [{ $ref }, { siblings }]` before compiling. Without it, types such as `ClientHello` would lose every field.

## Every payload carries its hash

Each page, sidebar, index and the manifest carries the content hash it was built from. The client caches by it and sends it back as `have`; the static renderer ignores it. What a hash covers is on [caching](../20_caching/01_overview.md).

## What a page looks like

`get page` returns `PageData`. Every page carries these fields, in snake_case:

| Field | Holds |
|---|---|
| `url`, `hash` | The page URL and its render hash |
| `section`, `layout` | The section it belongs to, and the layout that draws it, such as `@docs/default` |
| `source` | The source file, relative to the project root |
| `title`, `description`, `frontmatter` | The title, an optional description, and the frontmatter values for display |
| `breadcrumbs`, `prev`, `next` | The folders above the page, and the previous and next pages in sidebar order |
| `post` | For a blog post: date, author and tags |
| `errors` | The page's content problems, each with file and line |
| `kind` | Which kind of body follows |

`PageData` is tagged on `kind`, one variant per kind of page body:

| `kind` | Drawn by | Body fields |
|---|---|---|
| `markdown` | The section's layout: a docs page, a blog post, an issue's sub-document | `body_html`, `outline`, `diagrams` |
| `diagram` | The diagram page | `lang`, `source_text`, and display `options` from the sidecar |
| `artifact` | The artifact page | The artifact's URL, its theme mode (`site` or `self`) and display options from the sidecar |
| `video` | The video page | Its fields belong to the video engine's section |

The other answers are not `PageData`. The blog index (`BlogIndex`) arrives with its posts already sorted and formatted. The issues index (`IssuesIndex`) arrives with each issue's status, category, priority and labels resolved, plus the filter option lists. One issue (`IssueDetail`) carries its body and its anatomy tree; each sub-document is a page with its own URL. A built-in custom page (`CustomPage`) carries its YAML data.

## The body arrives finished

Rust renders every page body to HTML. A layout places that HTML inside its frame. It never parses markdown and never rewrites the body.

- **Links are root-absolute.** Rust resolves every relative link on disk to its URL, such as `/dev-docs/architecture/overview`, because a relative href would break under client routing and on static hosts.
- **Heading IDs are set.** The outline and `#heading` anchors use the IDs Rust wrote.
- **Code is highlighted with CSS classes**, not inline colours, so light and dark mode come from the theme.
- **Interactive spots are marked, not scripted.** A diagram, an embedded artifact or a copy button appears as an element with a `data-island` attribute and its input. The client mounts the matching island on it ([islands](./20_islands.md)).

The client inserts this body, the project's own content rendered by Rust, as HTML, and never inserts HTML from anywhere else.
