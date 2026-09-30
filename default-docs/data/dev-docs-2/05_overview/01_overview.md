---
title: "How agentks is built"
description: "The developer docs: what agentks is made of, the rule that divides the work, and a map of every section."
---

These pages explain agentks from the inside. They are for contributors, people and AI agents, who change the engine, the client, the static renderer or a library. After this section you can say which part of agentks owns a rule, find its code, and follow a request from the browser to a file on disk and back.

If you want to use agentks rather than change it, start with the [user guide](../../user-guide-2/05_getting-started/01_overview.md) instead.

## agentks in one paragraph

agentks turns a folder of plain files into a site you can browse and edit: docs, a folder-per-issue tracker, blog posts, diagrams, HTML artifacts and video artifacts. One Rust binary, `agentks`, holds three things: the engine, the command-line tool (the CLI) and a local web server. The binary also carries a prebuilt single-page app, the client, which draws every page in the browser from data the engine sends over one WebSocket at `/api`. Libraries of reusable elements are listed in `config/dep.yaml`. A library is a git repository, cached once per machine, or a local folder read in place. AI plugins sit outside the binary and teach agents how to use it.

## The rule that divides the work

**If a value could be wrong, Rust computes it. The frontend decides only how things look.**

The engine computes every derived value: URLs, sidebar order, heading IDs, resolved links, issue status categories, filter option lists. It sends results, never rules. The client and the static renderer receive final values and recompute nothing, so there is exactly one implementation of each rule. The CLI and the server call the same Rust functions, so `agentks check` and the page in the browser always agree.

## The files are the document

The folder of files is the main artefact. The rendered site is one reader of it, next to an editor, `grep` and an agent walking the tree. This shapes the engine in three ways:

- A page links to another file with a relative path, which is true on disk. The engine resolves that path to the target file, then to the target's URL, and writes a root-absolute href for the browser. Content never adjusts itself for the renderer.
- Frontmatter, `settings.json` and `NN_` prefixes carry only what the file system cannot: a title, a status, an order.
- When the engine cannot be sure of an answer, such as a missing link target, it reports an error with the file and line. It never renders a guess.

## The three states

agentks runs in three states. Different people do different work in each, and the state decides where a tool belongs.

| | Developing agentks | Using agentks | Publishing |
|---|---|---|---|
| Who | The agentks team | Anyone writing docs, issues or artifacts | Anyone putting docs online |
| Engine | Built from the working tree into `data/builds/` | The installed binary | The installed binary, running `agentks build` |
| Frontend | The Vite dev server, which passes `/api` on to the engine | The client embedded in the binary | The static renderer, run once per build |
| Served by | Vite (the client) and the engine (the data) | The binary's server, on localhost | nginx, any static host or a CDN |

A tool that needs the agentks source code or a dev server belongs to the first state and stays in the repository. Everything a user needs, `agentks build` included, is in the binary.

## Where to read next

This section:

| Page | Explains |
|---|---|
| [Repositories and apps](./05_repositories-and-apps.md) | The three repositories, the main repository's folders and what each app owns |
| [Components and contracts](./10_components.md) | The parts of the running system, what each side owns, and the contracts between them |
| [How a request flows](./15_request-flow.md) | Start-up, opening a page, a file change reaching the browser, and a CLI command |

The other sections:

| Section | Explains |
|---|---|
| [Engine](../10_engine/01_overview.md) | The Cargo workspace, its crates by layer, the error model and each engine crate |
| [Server and protocol](../15_server-and-protocol/01_overview.md) | The local server, its routes and the `/api` WebSocket |
| [Caching](../20_caching/01_overview.md) | Every cache layer, its keys and what invalidates it |
| [Frontend](../25_frontend/01_overview.md) | The shared UI package and the client |
| [Collaboration](../30_collaboration/01_overview.md) | Live editing, presence and access keys |
| [Libraries](../35_libraries/01_overview.md) | How libraries are resolved, locked, cached and served |
| [Publishing](../45_publishing/01_overview.md) | How `agentks build` writes a static site |
| [Versioning](../50_versioning/01_overview.md) | The version gate and migrations |
| [Contributing](../55_contributing/01_overview.md) | The development workflow, the gate and tests |
