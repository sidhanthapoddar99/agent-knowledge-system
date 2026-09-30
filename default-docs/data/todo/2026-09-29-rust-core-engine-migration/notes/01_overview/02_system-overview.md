---
title: "System overview"
---

agentks is a **local tool** for writing and reading agent-native documentation: docs, an issue tracker, blogs, artifacts and diagrams, kept as plain files on disk. After this migration it is **one binary per machine**. The binary holds the Rust engine, the CLI and a prebuilt single-page app, and it serves every agentks project on the machine. The Rust engine computes every rule. The frontend only displays what the engine sends. Publishing a site is a separate job: `agentks build` renders the same layout components to static HTML once. The work is split into three phases. Phase 1 renders, Phase 2 adds editing, the dev toolkit and libraries, and Phase 3 publishes. 1.0.0 ships after Phases 1 and 2.

# 03 References

- [01/03 Architecture](./03_architecture.md) — the components and their boundaries.
- [01/04 Flows](./04_flows.md) — what happens end to end.
- [01/05 Open questions and risks](./05_open-questions-and-risks.md)
- [05/07 Docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md) — the six launch steps.
- [issue.md](../../issue.md) — the issue's goal and scope.
- Brainstorm record: [why, and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md), [phasing](../../brainstorm/01_initial-discussion/15_phasing.md), [the architecture discussion](../../brainstorm/01_initial-discussion/17_local-spa-over-websocket.md), [repositories and three states](../../brainstorm/02_future-stages/12_repositories-and-three-states.md).
- Today: the project's [AGENTS.md](../../../../../../AGENTS.md), section "The filesystem is the document" and "Three stages".
- [2026-05-08-runtime-stack-migration](../../../2026-05-08-runtime-stack-migration/issue.md) — the earlier Go plan this issue supersedes.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): Rust core and back end, TypeScript and Vite frontend, one global install per machine.
- Decided (sidhantha, 2026-09-29): agentks is a local tool for one or two developers at a time. It is not built for search engines or large audiences; publishing is Phase 3's job.
- Decided (sidhantha, 2026-09-29): every rule stays in Rust. The frontend holds display and UI logic only.
- Decided (sidhantha, 2026-09-29): Phase 1 is rendering with correct results. Phase 2 is editing mode, the dev toolkit and libraries. Phase 3 is publishing as a static site with no Rust server.
- Decided (sidhantha, 2026-09-29): agent hooks with retrieval and a GitHub issues layout are later stages.
- Decided (sidhantha, 2026-09-30): multi-user access uses access keys, with no sign-in. Claude placed multi-user sync in 1.0.0, right after single-user editing ([the server](../02_engine/04_sync-engine-and-server.md)).
- Decided (sidhantha, 2026-09-29): forced migrations. A user who does not migrate pins an older release with mise.
- Decided (sidhantha, 2026-09-29): no custom layouts. Branding is done with CSS. Built-in layouts are added on demand.
- Decided (sidhantha, 2026-09-30): the first Rust release is 1.0.0, and it ships after Phases 1 and 2.
- Decided (sidhantha, 2026-09-30): agentks runs in three states: developing agentks, using agentks, and publishing with `agentks build`.
- Decided (sidhantha, 2026-09-30): three Phase 1 safeguards keep Phase 3 cheap: one data interface, real URL paths, and pure layouts in a shared package.
- Decided (sidhantha, 2026-09-30): the project moves to the NeuraLabsHQ organisation, at agentks.neuralabs.org.

# 05 Notes & Analysis

## 01 What agentks is

agentks turns a folder of plain files into a browsable, editable knowledge site. The files are the product. The site is one way to read them.

| Part | What it is for the user |
|---|---|
| **The CLI** | Search, check, scaffold and move content; manage libraries; start the local server; build a published site |
| **The local app** | A single-page app in the browser that shows docs, the issue tracker, blogs, custom pages, diagrams, artifacts and video artifacts. In Phase 2 it also edits pages in place |
| **The published site** | Static HTML from `agentks build`, served by nginx, any static host or a CDN |
| **Libraries** | Git repositories or local folders of reusable elements (icons, frames, charts, video components, widgets, scripts), listed in `config/dep.yaml` |
| **AI plugins** | Claude Code and Codex plugins with skills, which teach an agent to use agentks well |

The main author of agentks content is an AI agent. A human reads, reviews and makes small edits. So the CLI and the skills are first-class, not add-ons to the site.

## 02 Goals

1. **One install per machine.** A user with ten projects has one binary, not ten framework folders with their own `node_modules`.
2. **One implementation of every rule.** The Rust engine is shared by the CLI and the server. Today the TypeScript engine, the Rust CLI and browser scripts each hold copies of rules such as issue status categories and `NN_` ordering. After the migration there is one copy, in Rust. This is the strongest reason for the migration.
3. **Correct rendering first.** Phase 1 is done when the new engine shows every page with the same routes, heading IDs, links and text as today's engine.
4. **A lean binary.** Libraries, the narration voice model, migration scripts and the docs are downloaded or hosted, never bundled.
5. **Content that stays portable.** A folder of agentks markdown opens cleanly in Obsidian, an editor or `cat`, with no converter.
6. **A static published site.** When Phase 3 ships, a site builds once and runs on any static host with no application server.

## 03 Non-goals

| Not a goal | Why |
|---|---|
| Faster page loads in dev | The prior audit measured 6–9 ms first byte. The migration is about footprint and one shared core |
| A website for the public from the local server | The local server is for one or two developers on localhost. The public gets the static build |
| Custom layouts written by users | CSS covers branding; a bespoke page is an artifact |
| Server-side templates, WASM, HTMX | The single-page app renders every layout; Rust renders page bodies and previews |
| A user plugin API with build or render hooks | It would move rules out of Rust. Later extensions add commands and browser scripts only ([04/03 Extensions](../04_ecosystem/03_extensions.md)) |
| Film-level motion graphics, MP4 or any rendered video file | Video artifacts play live, with a voiceover, from a small YAML file or a folder of YAML files; no video file is ever produced |
| A Docker image | A basic Dockerfile ships for users to adapt; only the installer is released |
| Versioned docs | Only the latest docs are published |

## 04 The load-bearing principle: the filesystem is the document

The folder of files is the primary artefact. The rendered site is one consumer of it. Every design choice in these notes follows from that:

- **Links are relative on disk.** A page writes `[text](./path.md)` and embeds with `[[./path]]`, both relative to the file. The Rust engine resolves every link and outputs root-absolute hrefs for the browser. Content never compensates for the renderer ([02/01 Content format](../02_engine/01_content-format.md)).
- **Markdown stays plain.** There are no wiki links by name and no library names in markdown. Library elements appear only in video artifacts and HTML artifacts.
- **Metadata carries only what the filesystem cannot.** Frontmatter `title`, `settings.json` and `NN_` prefixes hold title, status and order. They are not renderer instructions.
- **Agents read files, not the site.** The local app is a single-page app, so it shows nothing without JavaScript. That is fine: agents use the files and the CLI.

## 05 The three states

agentks runs in three states. They are different people doing different work, and they decide where a tool belongs.

| | State 1: developing agentks | State 2: using agentks | State 3: publishing |
|---|---|---|---|
| Who | The agentks team | Anyone writing docs, issues or artifacts | Anyone putting docs online |
| Engine | Rust, built from the working tree into `data/builds/` | The installed binary | The installed binary, running `agentks build` |
| Frontend | Vite dev server, proxying `/api` to the engine | The client app embedded in the binary | The static renderer, run once per build |
| Rendering | In the browser, from data over the WebSocket | In the browser, from data over the WebSocket | Static HTML generated once (SSG); only islands ship JavaScript |
| Served by | Vite (client) and the engine (data) | The binary's local server, on localhost | nginx, any static host or a CDN |
| Libraries | The machine cache | The machine cache, per `dep.lock` | Downloaded again for the build, per `dep.lock` |
| Selected by | mise inside the repository | The installed `agentks` | `agentks build`, directly or in the user's Dockerfile |

**State 2 is production for the agentks team and a development environment for users.** It is optimised and cached, but nothing in it serves the public.

**Where a tool belongs.** Something that needs the agentks source or a dev server is state 1 tooling and stays in the repository. Everything a user needs, including `agentks build`, is in the binary. This replaces today's development / writing / host stages in [AGENTS.md](../../../../../../AGENTS.md); that text is updated when the migration lands.

Details: [05/05 Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md) (state 1), [02/05 Rust CLI](../02_engine/05_rust-cli.md) (state 2), [05/02 Publishing (SSG)](../05_delivery/02_publishing-ssg.md) (state 3).

## 06 The phases and 1.0.0

| Phase | Scope | Done when |
|---|---|---|
| **Phase 1: rendering** | The Rust engine and CLI; the server with one WebSocket; the shared UI package and the client app with every built-in layout; mandatory `config/` with `.env` inside; the `~/.agentks/` home and build cache; the `agentks` rename; forced migrations for every 0.x format; custom layouts removed; the CSS listing command; first-class diagram and artifact pages | Route parity, rendered-content comparison and layout screenshots pass against today's engine, and the user's own use confirms it |
| **Phase 2: editing, dev toolkit, libraries** | In-place editing (raw and live preview) from the dev toolbar's Edit option; the dev toolkit; libraries through `config/dep.yaml` and `config/dep.lock` | Editing and libraries work end to end on this repository's content |
| **1.0.0** | Ships after Phases 1 and 2 | — |
| **Phase 3: publishing** | `agentks build`: SSG from the shared components, islands only, a basic Dockerfile for users | agentks's own website builds with it |

Publishers stay on the last 0.x release, pinned with mise, until Phase 3 ships. 1.0.0 has no publishing, and its release notes say so. Phase 3 must be done before the launch's hosting step, because the hosted docs are built with `agentks build`.

The launch runs alongside: the Rust engine, client and default library first; then the Neuralabs plugin marketplace, the homepage, the docs rewrite, hosting at agentks.neuralabs.org, and the archival of this repository ([05/07 Docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md)).

## 07 The three Phase 1 safeguards

Phase 1 builds only the local app, but three rules keep Phase 3 from becoming a rewrite:

1. **One data interface.** Every component gets its data through one small module ("page X", "sidebar for section Y", "issues index"). In Phases 1 and 2 it talks to the WebSocket. In Phase 3 the static build hands data to the same components directly.
2. **Real URL paths.** The router uses `/dev-docs/architecture/overview`, never `/#/...`. Published pages keep the same URLs.
3. **Pure shared components.** Every layout and component lives in `apps/packages/agentks-ui` and only turns data into markup. No WebSocket and no browser-only objects such as `window` while rendering. The client app and the static renderer both use it, so the local tool and the published site cannot drift.

Details: [03/01 Shared UI package](../03_frontend/01_shared-ui-package.md).

## 08 Later stages

These come after 1.0.0 and Phase 3. Each is recorded so its constraints shape today's design.

| Stage | In one line | Where it lives |
|---|---|---|
| Multi-user editing and auth | Several people edit one file on `yrs` (the Rust port of Yjs), with presence; auth comes first, and the server stays on localhost until then | [02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md), [brainstorm](../../brainstorm/02_future-stages/04_multi-user-editing-and-auth.md) |
| Diagram editing with presence | Excalidraw, tldraw, Mermaid and draw.io diagrams edited in place, together | [03/03 Editor engines](../03_frontend/03_editor-engines.md), [the diagram subtask](../../../2026-04-10-editor-diagrams/subtasks/30_editor/40_in-place-and-multi-user-editing.md) |
| Agent hooks and retrieval | Claude Code and Codex hooks backed by the binary; a Rust search index for agents and the site | [04/02 AI plugins and skills](../04_ecosystem/02_ai-plugins-and-skills.md), [brainstorm](../../brainstorm/02_future-stages/05_agent-hooks-and-retrieval.md) |
| GitHub issues layout | A built-in layout that shows a linked GitHub repository's issues, with a machine-level sign-in | [03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md), [brainstorm](../../brainstorm/02_future-stages/06_github-issues-layout.md) |
| Extensions | `agentksx <extension> <command>` and site scripts from libraries; rules stay in Rust | [04/03 Extensions](../04_ecosystem/03_extensions.md) |

Video artifacts are tracked in their own issue, [2026-09-29-narrated-video-pages](../../../2026-09-29-narrated-video-pages/issue.md). This migration gives them the machine home for audio, the voice helper and its model, libraries, and the page kind and routes they plug into ([04/05 Video artifacts](../04_ecosystem/05_video-pages.md)).

## 09 Open

The index data structure, which dev tools return and the structure model are still open. See [01/05 Open questions and risks](./05_open-questions-and-risks.md).
