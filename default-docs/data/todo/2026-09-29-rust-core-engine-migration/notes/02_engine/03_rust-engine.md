---
title: "The Rust engine: core, index, pipeline and page data"
---

The Rust engine is **one library, the core, compiled into one binary** with the server and the CLI. It loads config, builds an index of the whole site at start-up, renders page bodies on request, and computes every derived value: URLs, order, sidebar trees, outlines, status categories, filter options, resolved links. It sends results, never rules: the frontend receives ready-to-display data through one data interface and recomputes nothing. Page data is cached by content hash, in memory, in the per-project build cache on disk, and in the browser, and a page's hash covers every file it embeds. When the engine cannot be sure of an answer, such as a missing link target, a slug collision or an unknown alias, it returns an error that names the file and line. It never renders a guess.

# 03 References

- [Rust engine and Vite frontend](../../brainstorm/01_initial-discussion/03_rust-core-and-vite-frontend.md) and [the architecture note](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md) — the division of work.
- [Why and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md) — the measurements and the losses this design must carry.
- [Open questions](../../brainstorm/01_initial-discussion/16_open-questions.md) 03, 07 and 10.
- The prior audit's [JIT rendering study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/021_question_jit-rendering.md) and [B-tree cache study](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/022_question_btree-cache.md).
- [Content format](./01_content-format.md) — the input. [Project config](./02_project-config.md) — how config loads.
- [Sync engine and server](./04_sync-engine-and-server.md) — how page data travels. [Rust CLI](./05_rust-cli.md) — the other caller of the core. [Machine home and build cache](./06_machine-home-and-build-cache.md) — where the disk cache lives.
- [Shared UI package](../03_frontend/01_shared-ui-package.md) — the consumer of page data. [Publishing (SSG)](../05_delivery/02_publishing-ssg.md) — the second consumer.
- Today's TypeScript engine, which the core replaces: [loaders](../../../../../../agent-ks-engine/src/loaders), [the parser pipeline](../../../../../../agent-ks-engine/src/parsers/core/pipeline.ts), [preprocessors](../../../../../../agent-ks-engine/src/parsers/preprocessors), [postprocessors](../../../../../../agent-ks-engine/src/parsers/postprocessors), [the cache manager](../../../../../../agent-ks-engine/src/loaders/cache-manager.ts) and [issue dates](../../../../../../agent-ks-engine/src/loaders/issue-dates.ts).
- Today's Rust CLI, whose rules merge into the core: [content](../../../../../../agent-ks-cli/src/content.rs), [issues](../../../../../../agent-ks-cli/src/issues.rs), [links](../../../../../../agent-ks-cli/src/links.rs) and [checks](../../../../../../agent-ks-cli/src/checks.rs).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): Rust owns the engine logic and the back end. Browser code stays TypeScript.
- Decided (sidhantha, 2026-09-29): the frontend holds display and UI logic only. Every rule stays in Rust. No TypeScript is generated from Rust and no WASM is built.
- Decided (sidhantha, 2026-09-29): Rust renders page bodies, not page layouts. There are no server-side templates.
- Decided (sidhantha, 2026-09-29): the hybrid: an index of the whole site at start-up, pages rendered on request and cached where it pays.
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS.
- Decided (sidhantha, 2026-09-29): routes, heading IDs, links and text match today's engine exactly.
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core, so each rule has one implementation.
- Proposed (claude, 2026-09-30): the crate layout in section 01, comrak for markdown, and a highlighter that emits CSS classes.
- Proposed (claude, 2026-09-30): BLAKE3 content hashes, and a page hash that includes the hashes of its embedded files.

# 05 Notes & Analysis

## 01 Crate layout (claude, proposed)

One Cargo workspace in `apps/agentks-engine`, built into one binary named `agentks`.

```
apps/agentks-engine/
  Cargo.toml                 the workspace
  crates/
    agentks-core/            config, aliases, the version gate, the content model, the site index,
                             ordering, URLs, the tracker rules, validation. No I/O beyond reading files
    agentks-render/          the markdown pipeline: pre-processing, comrak, post-processing, highlighting,
                             theme CSS compilation
    agentks-libraries/       dep.yaml, dep.lock, fetching, the machine cache, manifests (Phase 2)
    agentks-server/          axum, the /api WebSocket, the watcher, file serving, editing sync
    agentks-cli/             argument parsing, commands, output; the binary's main
  migrations/
    docs/  library/          migration scripts, fetched at run time, never compiled in
```

- **Dependencies point one way**: `cli` → `server` → `render` → `core`, and `libraries` → `core`. The core knows nothing of HTTP or the terminal.
- **The CLI and the server call the same functions.** `agentks check issues` and the issues page read one loader. That is the "one core instead of two copies" the migration exists for.
- **The embedded bundles** (the built client and the static renderer, compressed) are included by the `server` and `cli` crates at compile time.

## 02 Start-up

1. **Find the project** by the config rule, and load `site.yaml`, `navbar.yaml`, `footer.yaml` and `dep.yaml`.
2. **Run the version gate.** Content outside the supported range stops here with the migration message.
3. **Resolve aliases and sections.** Unknown aliases, missing data folders and unknown layout styles stop here.
4. **Check libraries** (Phase 2). Install locked commits missing from the machine cache; never move a pin.
5. **Build the site index** by walking every section once: file paths, sizes, hashes, frontmatter, titles, order, URLs. Page bodies are not rendered yet.
6. **Load cached derived data** from the build cache when its key matches: git-derived issue dates, rendered pages, compiled CSS.
7. **Start the watcher and the server** (for `agentks start`), or answer the command and exit (for the CLI).

The prior audit measured a warm re-derivation of the whole corpus at 7.8 ms and an uncached page render at 1.83 ms p50. So start-up stays simple: the index is rebuilt every start, and only expensive values are persisted.

## 03 The site index

The index is the engine's single view of the project. Every derived value is computed from it.

**What each entry holds:** the path relative to the project root, the section, the page kind, the content hash, frontmatter, the title and sidebar label, the order key, the URL, the outgoing references (links and embeds) and, for tracker files, the parsed metadata.

**What it must answer quickly:**

| Question | Used for |
|---|---|
| The entry for a path or a URL | Serving a page, resolving a link |
| The ordered children of a folder | Sidebars, the tracker's anatomy sections |
| "Did anything under this folder change?" | Rebuilding a sidebar or the issue list only when needed |
| Which pages embed or link to this file | Invalidating a page when an embedded file changes; later, backlinks |
| The hash of any file or folder | Cache keys, and the versions the browser caches by |

**Hashes.** Each file has a BLAKE3 hash of its bytes. Each folder's hash is rolled up from its children's names and hashes, Merkle style, so a change re-hashes only its chain of parent folders. A page's **render hash** is its own hash plus the hashes of every file it embeds, and of the config that shapes it.

**The data structure** is still open ([open question 07](../01_overview/05_open-questions-and-risks.md)). Claude's proposal: an ordered map keyed by path, which the audit found fast enough at about 1,300 pages with three entries per folder, plus the rolled-up folder hashes. No radix tree.

## 04 The render pipeline

The pipeline keeps today's stages, so the output matches:

| Stage | Job | Today's equivalent |
|---|---|---|
| Frontmatter | Split and parse the YAML header; record its line count for error lines | frontmatter extraction |
| Code protection | Mask fenced and inline code so later stages leave it alone | [code-protect](../../../../../../agent-ks-engine/src/parsers/preprocessors/code-protect.ts) |
| Embeds | Replace `[[path]]` with the file's text; record each embedded file | [asset-embed](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts) |
| Markdown | comrak, CommonMark plus GitHub extensions and alerts | [marked](../../../../../../agent-ks-engine/src/parsers/renderers/marked.ts) |
| Highlighting | Code blocks to spans with CSS classes | Shiki |
| Heading IDs | The ID rule in the content-format note, with de-duplication | [heading-ids](../../../../../../agent-ks-engine/src/parsers/postprocessors/heading-ids.ts) |
| Internal links | Resolve each relative link to a root-absolute URL | [internal-links](../../../../../../agent-ks-engine/src/parsers/postprocessors/internal-links.ts) and [issue-body-links](../../../../../../agent-ks-engine/src/parsers/postprocessors/issue-body-links.ts) |
| Asset URLs | Images and file links to `/content-assets/<path>` | [asset-src](../../../../../../agent-ks-engine/src/parsers/postprocessors/asset-src.ts) |
| Diagram embeds | Mark diagram blocks for the browser to draw | [diagram-embed](../../../../../../agent-ks-engine/src/parsers/postprocessors/diagram-embed.ts) |
| External links | Mark links that leave the site | [external-links](../../../../../../agent-ks-engine/src/parsers/postprocessors/external-links.ts) |
| Tables | Wrap tables for horizontal scroll | [table-wrap](../../../../../../agent-ks-engine/src/parsers/postprocessors/table-wrap.ts) |
| Outline | Collect headings and IDs | today's outline extraction |

Post-processing works on comrak's syntax tree where it can, not on HTML strings with regular expressions, so a stage cannot corrupt markup it did not mean to touch.

Rendering is pure: the same inputs and render hash give the same output. That is what makes caching and the Phase 3 build safe.

## 05 The data interface

The frontend asks for data by name; the engine answers with JSON. The same shapes feed the local client over the WebSocket and the static renderer in `agentks build` ([publishing](../05_delivery/02_publishing-ssg.md)). The exact transport is in [the server note](./04_sync-engine-and-server.md).

| Request | Returns |
|---|---|
| `manifest` | Site identity, logo, theme CSS URL and hash, navbar, footer, the section list (name, type, layout style, base URL, hash), the route table, the engine version |
| `page` (by URL) | One page's data, below |
| `sidebar` (by section) | The section's tree: label, URL, kind, order, collapsed state, children, plus the tree's hash |
| `issues-index` (by tracker) | Every issue with its derived fields, and the filter option lists |
| `issue` (by id) | One issue with its anatomy sections, subtasks, plans, logs and comments, each with its status and category |
| `blog-index` (by section) | Posts newest first, with dates, authors and tags |
| `custom` (by page) | The YAML data of a built-in custom page |
| `render` (Phase 2) | The body HTML of unsaved markdown, for the live preview |

A page's data:

```json
{
  "url": "/dev-docs/architecture/overview",
  "hash": "b3:5f1c...",
  "section": "dev-docs",
  "kind": "markdown",
  "layout": "@docs/default",
  "source": "data/dev-docs/05_architecture/01_overview.md",
  "title": "Overview",
  "description": "...",
  "frontmatter": { "tags": ["architecture"], "draft": false },
  "body_html": "<h1 id=\"overview\">Overview</h1>...",
  "outline": [{ "depth": 2, "id": "the-layers", "text": "The layers" }],
  "breadcrumbs": [{ "label": "Architecture", "url": "/dev-docs/architecture" }],
  "prev": { "title": "...", "url": "..." },
  "next": { "title": "...", "url": "..." },
  "diagrams": [{ "id": "d1", "lang": "mermaid" }],
  "errors": [{ "line": 42, "type": "link-missing", "message": "No file ./02_x.md", "suggestion": "..." }]
}
```

- **`kind`** is `markdown`, `video`, `diagram` or `artifact`. A diagram page carries its source and sidecar options instead of `body_html`; an artifact page carries its `/artifacts/` URL and sidecar options.
- **Every value is final.** The frontend never strips a prefix, sorts a list, maps a status to a category or resolves a link.
- **Every response carries its hash**, so the browser can cache it and ask again only when the hash changes.

The field lists are a starting contract. The shared UI package fixes the final shapes, and both builds type-check against one schema file generated from the Rust types (claude, proposed; generated types are data shapes, not rules).

## 06 Caching

| Layer | Holds | Keyed by | Lifetime |
|---|---|---|---|
| In memory | The index; rendered pages; derived trees | Render hash | The process |
| Build cache on disk | Git-derived dates per branch; rendered pages; compiled CSS; highlighted code | Project key, then render hash | Until the user cleans it |
| Browser | Manifest, pages, sidebars, indexes | The hashes the engine sends | Until a hash changes |

- **Cache what is expensive, re-derive the rest.** Git history walks, highlighting and theme compilation are cached. The index is not.
- **An embedded file is a dependency.** Editing an embedded file changes the render hash of every page that embeds it. That is the lesson of [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md).
- **Git-derived dates** use the eager incremental walk designed in [2026-05-08-update-date-time-optimization](../../../2026-05-08-update-date-time-optimization/issue.md): walk only `lastHash..HEAD`, check `merge-base --is-ancestor` to spot history rewrites, keep one cache per branch, and pre-warm at start.
- The cache key's exact form is in [the machine home note](./06_machine-home-and-build-cache.md).

## 07 Theme CSS

- The engine merges the built-in default theme, the chosen theme and its `extends` chain, and the project's overrides into one stylesheet per project.
- The result is cached by the hash of its inputs and served at a hashed URL, so the browser caches it for good.
- The theme variable contract (`required_variables`) is checked here. A theme missing a required variable is an error, not a silent fallback.
- `agentks theme css` prints the same compiled CSS, so an agent always sees the CSS the installed version uses ([theming and layouts](../03_frontend/04_theming-and-layouts.md)).

## 08 Errors

Two classes, handled differently:

| Class | Examples | Behaviour |
|---|---|---|
| **Fatal** | Config missing or invalid, version gate, unknown alias or layout, a library outside its engine range | The command or the server stops before serving anything. The message names the file, the key and the fix |
| **Content** | A missing link target or embed, a slug collision, bad frontmatter, an unknown library element | The page still renders; the error is attached to the page with its file and line, collected for the dev toolkit, and reported by `agentks check` |

Rules:

- **Never guess.** A link whose target is missing is marked broken, not pointed at the nearest match. A repository with no x.y.z tags is an error, not "use the default branch".
- **One error record** (`file`, `line`, `type`, `message`, `suggestion`), as today, so the CLI, the page and the toolkit show the same thing.
- **The CLI's validators and the renderer share code.** A problem `agentks check` reports is exactly a problem the page shows.

## 09 What the core replaces

- Today's TypeScript loaders, parsers and cache manager, entirely.
- The CLI's own copies of frontmatter parsing, link checking, the ordering grammar and the issue status vocabulary.
- The browser's copies of rules in the issues layout, such as [the detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [the index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts). The frontend receives the results instead.

## 10 Open

- The index's data structure ([open question 07](../01_overview/05_open-questions-and-risks.md)).
- Whether the structure / layout / theme / shell model from the Go issue is adopted as the design backbone ([open question 08](../01_overview/05_open-questions-and-risks.md)).
- The highlighter: syntect's class output is the default candidate. Its grammar coverage must be checked against the languages today's docs use.
