---
title: "Phase 2: the artifact library"
---

agentks gets a **library of reusable building blocks**, usable from any page: docs, issues, artifacts and videos. It has three sources. **Built-ins** ship in the binary. **Preset libraries** — icon sets, templates, ready-made artifacts and scenes — are static files agentks downloads on request and caches under `~/.agentks/`; they are never packaged in the binary. **Project elements** are the project's own SVGs, images, HTML artifacts and scripts, kept in the project and committed to git.

The idea came from the video discussion, but it is engine machinery, not a video feature. Videos are one user of it. The video issue keeps only what is specific to video: scene templates, widgets and custom video logic.

# 03 References

- [Libraries in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md) — the video-specific side: widgets, scene templates, custom video logic.
- [The agentks docs command](./08_agentks-docs-command.md) — downloads and caches the docs the same way; one downloader serves both.
- [The ~/.agentks home and build cache](../01_initial_discussion/07_agentks-home-and-build-cache.md) — where downloads are cached.
- [One install](../01_initial_discussion/05_single-install-tool-engine-frontend.md) — what the binary carries, and what it does not.
- [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) — today's artifact pages, which project elements build on.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): preset libraries are optional downloads, hosted as static files, fetched by agentks separately and stored in the cache. They are not packaged with the engine, to keep the package small.
- Decided (sidhantha, 2026-09-29): users can define reusable artifacts and elements in their project (the user's working path: a `config/artifacts/` folder): SVGs, images, HTML artifacts, scripts.
- Decided (sidhantha, 2026-09-29): those elements can be used in many places, and can carry custom video logic.
- Decided (sidhantha, 2026-09-29): the library is shared engine machinery, usable by docs pages, issues and videos, not a video-only feature. It is tracked here; the video issue links to it.
- Decided (claude, 2026-09-29): placed in Phase 2, beside `agentks docs`, because both need the same downloader and the `~/.agentks` home. Recorded here; the user can move it.

# 05 Notes & Analysis

## 01 Three sources

| Source | Where | Examples | Ships |
|---|---|---|---|
| Built-ins | inside the binary | the video widgets, the built-in layouts | with every install |
| Preset libraries | downloaded to `~/.agentks/libraries/<library>@<version>/` | icon sets (server, database, browser, framework logos), artifact templates, scene templates, phone and laptop frames | on request, cached once per machine |
| Project elements | a project-level folder (working path `config/artifacts/`) | the team's logo, a product mock-up artifact, a custom widget script | with the project, in git |

## 02 Naming and resolution (claude, proposed)

- A page refers to a block **by name**, not by path, for example `artifact:checkout-flow` or `icon:server`. That keeps pages short and lets one name work everywhere.
- Lookup order: **project elements, then preset libraries, then built-ins.** A project can override a preset by reusing its name.
- **An unknown name is an error** naming the block and the page, never a silent blank panel. The check reads only files, so the CLI runs it too.

## 03 Preset libraries (claude, proposed)

- **Pinned per project.** The project lists the libraries and exact versions it uses, like a lockfile. Otherwise a library update could silently change old pages.
- **Verified on download.** Each library comes with a checksum, and agentks refuses a file that does not match. Libraries contain HTML and scripts that run in the browser, so this matters.
- **Explicit download.** `agentks library add <name>@<version>` fetches a library and pins it. A page that needs a missing library shows a clear message naming the command.
- **Offline after the first download**, because it lives in the cache.
- **Kept while pinned.** The 15-day cleanup removes a library version only when no project on the machine has used it for 15 days.

## 04 One downloader (claude, proposed)

Preset libraries, the docs ([08](./08_agentks-docs-command.md)) and the narration voice model all fetch a pinned, checksummed file into `~/.agentks/`. They share one piece of Rust code: fetch, verify, unpack, record last use. Three copies would drift apart, and the checksum rule would end up enforced in one and forgotten in another.

## 05 Project elements (claude, proposed)

- The project's rule is that a document's own assets sit beside the document. Reusable elements are the exception, because no single page owns them, so a project-level folder is right.
- HTML artifacts and scripts run in an iframe, like artifacts today, so their styles and scripts cannot reach the page around them.
- A custom widget follows the same contract as the built-in widgets.

## 06 Open points

- **Where project elements live.** The user's working path is `config/artifacts/`. Config today holds settings, not content, and reusable elements are content. The alternatives are a `library/` folder under `config/`, or a top-level folder beside the content sections.
- **Hosting and trust.** GitHub Releases of this repository, a separate repository, or another static host. Who publishes libraries, how they are versioned alongside the engine, and whether checksums are enough or signatures are needed. Settle together with the docs command's hosting.
- **The embed syntax.** How a docs page places a library block. It overlaps the `[[...]]` clash in [open question 13](../01_initial_discussion/16_open-questions.md).
