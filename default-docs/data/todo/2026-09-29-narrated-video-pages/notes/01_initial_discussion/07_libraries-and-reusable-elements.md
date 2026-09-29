---
title: "Libraries and reusable elements"
---

Videos draw on three sources of building blocks. **Built-in widgets** ship with the engine. **Preset libraries** — templates, icon sets and ready-made scenes — are static files agentks downloads separately and caches, so they never bloat the binary. **Project elements** are defined by the user in the project's configuration — SVGs, images, HTML artifacts, scripts — and can be reused across many pages and videos. Custom video logic lives with the project elements.

# 03 References

- [Caching](./06_caching.md)
- [A proper video engine](./04_video-engine.md)
- [CSS and theming in the engine migration](../../../2026-09-29-rust-core-engine-migration/notes/01_initial_discussion/10_css-and-theming.md) — the other place users extend the engine.
- [The agentks docs command](../../../2026-09-29-rust-core-engine-migration/notes/02_future-stages/08_agentks-docs-command.md) — downloads and caches the docs the same way; the two should share one downloader.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): preset libraries are optional downloads, hosted as static files, fetched by the engine separately and stored in the cache. They are not packaged with the engine, to keep the package small.
- Decided (sidhantha, 2026-09-29): users can define reusable artifacts and elements in their configuration (the user's working path: a `config/artifacts/` folder): SVGs, images, HTML artifacts, scripts.
- Decided (sidhantha, 2026-09-29): those elements can be used in many places, and can carry custom video logic.

# 05 Notes & Analysis

## 01 Three sources

| Source | Where | Examples | Ships |
|---|---|---|---|
| Built-in widgets | inside the engine's frontend | file tree, flow, browser frame, phone frame, chart | with every install |
| Preset libraries | downloaded to `~/.agentks/libraries/` | icon sets (server, database, browser, framework logos), scene templates, phone and laptop frames | on request, cached |
| Project elements | the project's config folder | the team's own logo, a product mock-up artifact, a custom widget script | with the project, in git |

## 02 Naming and resolution (claude, proposed)

- A video refers to a block **by name**, not by path: `widget: server-icon`, `panel: artifact:checkout-flow`. That keeps scripts short and lets the same name work in every page.
- Lookup order: **project elements, then preset libraries, then built-ins.** A project can override a preset by using its name.
- **An unknown name is an error** with the name and the page, never a silent blank panel. The check reads only files, so it can run in the CLI.

## 03 Preset libraries (claude, proposed)

- **Pinned per project.** The project lists the libraries and exact versions it uses, like a lockfile. Otherwise a library update could silently change old videos.
- **Verified on download.** Each library comes with a checksum, and agentks refuses a file that does not match. Libraries contain HTML and scripts that run in the browser, so this matters.
- **Explicit download.** A command such as `agentks library add <name>@<version>` fetches it. A page that needs a library that is not installed shows a clear message naming the command, not a broken scene.
- **Offline after the first download**, because it lives in the cache.

## 04 Project elements (claude, proposed)

- The user's proposal places them in the config folder, for example `config/artifacts/**`. One point to settle: the project's rule is that a document's own assets sit beside the document. Reusable elements are the exception, because no single page owns them, so a project-level folder is right. Whether it sits under `config/` or as its own top-level folder is [an open question](./09_open-questions.md).
- HTML artifacts and scripts run in an iframe, like artifacts today, so their styles and scripts cannot reach the page around them.
- Custom video logic, such as a widget of the team's own, is a script element that follows the same contract as built-in widgets.

## 05 Beyond video

Reusable elements are useful to ordinary docs pages and issues too, for example one diagram or one artifact embedded in several pages. The library should not be video-only.
