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
- Decided (claude, 2026-09-30): the 14 crates in layers of section 01, because each crate then has one job and a check can prove that dependencies point down ([030/10](../../subtasks/030_rust-engine/10_workspace-and-crate-boundaries.md)).
- Decided (claude, 2026-09-30): the page shapes of section 05 are Rust types in `agentks-api`, published as a JSON Schema ([030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)).
- Decided (claude, 2026-09-30): the error record gains an optional `key`, and request failures are a separate closed list (section 08, [030/20](../../subtasks/030_rust-engine/20_error-model.md)).
- Proposed (claude, 2026-09-30): comrak for markdown, and a highlighter that emits CSS classes.
- Proposed (claude, 2026-09-30): BLAKE3 content hashes, and a page hash that includes the hashes of its embedded files.

# 05 Notes & Analysis

## 01 Crate layout

One Cargo workspace in `apps/agentks-engine`, built into one binary named `agentks`. It holds 14 crates in nine layers. A crate may depend only on crates in lower layers. The full table, with what each crate owns and may not do, is in [030/10](../../subtasks/030_rust-engine/10_workspace-and-crate-boundaries.md).

| Layer | Crates |
|---|---|
| 0 | `core`: paths, hashes, versions, the error record, the fixed vocabularies (section types, page kinds, statuses and their categories). No I/O |
| 1 | `config` · `git` · `cache` · `api` (the wire types of the data interface) |
| 2 | `content` (the format rules and validation) · `library` · `migrate` |
| 3 | `index`: the site index, URLs, the link resolver, folder hashes |
| 4 | `render`: the markdown pipeline, highlighting, theme CSS |
| 5 | `site`: the engine as one object, which answers "the page for this URL" |
| 6 | `sync`: live documents, presence, access keys |
| 7 | `server`: axum, the `/api` WebSocket, file routes, the watcher |
| 8 | `cli`: commands, output, the binary's `main` |

- **Folders and names.** Each crate lives in `crates/<short name>/`, such as `crates/core` or `crates/render`. Its package name is `agentks-<name>`.
- **Dependencies point one way**, down the layers, and `scripts/gate/crate-layers.ts` fails the gate on any other edge. No crate below `server` knows HTTP, and no crate below `cli` prints. When a lower crate needs something from a higher one, the lower crate defines a trait and the higher one implements it.
- **The CLI and the server call the same functions.** `agentks check issues` and the issues page read one loader. That is the "one core instead of two copies" the migration exists for.
- **The embedded bundles** are included at compile time: the built client by `server`, the static renderer by `cli`.
- **Migration scripts** sit in `apps/agentks-engine/migrations/` (`docs/` and `library/`). They are fetched at run time and never compiled in.

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
| `manifest` | Site identity, logo, theme CSS URL and hash, navbar, footer, the section list (name, type, layout style, base URL, hash), the route table (each URL with its section, data key and hash), redirects, the engine version and `api_version` |
| `page` (by URL) | One page's data, below |
| `sidebar` (by section) | The section's tree: label, URL, kind, collapsed state, children, plus the tree's hash. There is no `order` field: the array order is the order |
| `issues-index` (by tracker) | Every issue with its derived fields, and the filter option lists |
| `issue` (by id) | One issue with its body and its anatomy tree: sections, subtasks, plans, logs and comments, each with its URL, status and category. Sub-document bodies are not included; the client fetches each with `page` |
| `blog-index` (by section) | Posts newest first, with dates, authors and tags |
| `custom` (by page) | The YAML data of a built-in custom page |
| `render` (Phase 2) | The body HTML of unsaved markdown, for the live preview. It is its own request type, not a data name ([the server note](./04_sync-engine-and-server.md)) |

A markdown page's data:

```json
{
  "url": "/dev-docs/architecture/overview",
  "hash": "b3:5f1c...",
  "section": "dev-docs",
  "layout": "@docs/default",
  "source": "data/dev-docs/05_architecture/01_overview.md",
  "title": "Overview",
  "description": "...",
  "frontmatter": { "tags": ["architecture"], "draft": false },
  "breadcrumbs": [{ "label": "Architecture", "url": "/dev-docs/architecture" }],
  "prev": { "title": "...", "url": "..." },
  "next": { "title": "...", "url": "..." },
  "errors": [{ "file": "data/dev-docs/05_architecture/01_overview.md", "line": 42, "type": "link-missing", "severity": "error", "message": "No file ./02_x.md", "suggestion": "..." }],
  "kind": "markdown",
  "body_html": "<h1 id=\"overview\">Overview</h1>...",
  "outline": [{ "depth": 2, "id": "the-layers", "text": "The layers" }],
  "diagrams": [{ "id": "d1", "lang": "mermaid" }]
}
```

- **`kind`** is `markdown`, `video`, `diagram` or `artifact`, and it decides the body fields. A markdown or video page carries `body_html`, `outline` and `diagrams`. A diagram page carries `lang`, `source_text` and the sidecar `options` instead. The text is `source_text` because `source` is already the file path. An artifact page carries `artifact_url` (its `/artifacts/` URL), `theme` (`site` or `self`) and the sidecar `options`.
- **A blog post** adds a `post` block: `date`, `author`, `tags`, `image` and `draft`.
- **Every value is final.** The frontend never strips a prefix, sorts a list, maps a status to a category or resolves a link.
- **Every response carries its hash**, so the browser can cache it and ask again only when the hash changes.

The Rust types in `agentks-api` are the contract ([030/80](../../subtasks/030_rust-engine/80_page-data-interface.md)). `schemars` writes them to `apps/agentks-engine/schema/api.schema.json`, and the UI package generates its TypeScript types from that file ([shared UI package](../03_frontend/01_shared-ui-package.md), section 07). Only data shapes cross over, never a rule. Hand-written examples of every shape sit in `apps/agentks-engine/schema/fixtures/`.

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

- The built-in theme's files live in `apps/agentks-engine/themes/default/`, outside any crate. The theme compiler in `agentks-render` embeds them in the binary ([030/85](../../subtasks/030_rust-engine/85_theme-css-compiler.md)).
- The engine merges the built-in default theme, the chosen theme and its `extends` chain, and the project's overrides into one stylesheet per project. A theme's `override_mode` says how it meets its parent: `merge` (the default) takes the parent's files, then the child's; `override` skips any parent file whose name the child also lists; `replace` takes the child's files only.
- The built-in `theme.yaml` has a `layers` map that puts each of its files in a CSS cascade layer (`reset`, `theme` or `elements`). Every file of a user theme goes in the `user` layer, so a user rule beats a built-in rule of the same strength ([theming and layouts](../03_frontend/04_theming-and-layouts.md)).
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
- **One error record** (`file`, `line`, `type`, `severity`, `message`, `key`, `suggestion`), so the CLI, the page and the toolkit show the same thing. `line`, `key` and `suggestion` are optional. `key` is the config key path, such as `pages.todo.layout`, for config problems. On the wire the kind is the field `type`; in Rust it is `kind`. The record lives in `agentks-core` ([030/20](../../subtasks/030_rust-engine/20_error-model.md)).
- **A fatal error carries every problem** one load found, as an `ErrorList` that is never empty, so the user fixes them all in one pass.
- **A request failure is not a content problem.** Request failures are a separate closed list, `ReplyErrorKind` in `agentks-api`: `not-found`, `invalid-request`, `forbidden`, `conflict`, `busy`, `fatal`, `internal`, `not-implemented`. A content problem never fails a request; it travels in the data's `errors`. `SiteError::to_reply` is the one mapping from an engine error to a failed reply.
- **The CLI's validators and the renderer share code.** A problem `agentks check` reports is exactly a problem the page shows.

## 09 What the core replaces

- Today's TypeScript loaders, parsers and cache manager, entirely.
- The CLI's own copies of frontmatter parsing, link checking, the ordering grammar and the issue status vocabulary.
- The browser's copies of rules in the issues layout, such as [the detail types](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/detail/types.ts) and [the index filters](../../../../../../agent-ks-engine/src/layouts/issues/default/scripts/index/filters.ts). The frontend receives the results instead.

## 10 Open

- The index's data structure ([open question 07](../01_overview/05_open-questions-and-risks.md)).
- Whether the structure / layout / theme / shell model from the Go issue is adopted as the design backbone ([open question 08](../01_overview/05_open-questions-and-risks.md)).
- The highlighter: syntect's class output is the default candidate. Its grammar coverage must be checked against the languages today's docs use.
