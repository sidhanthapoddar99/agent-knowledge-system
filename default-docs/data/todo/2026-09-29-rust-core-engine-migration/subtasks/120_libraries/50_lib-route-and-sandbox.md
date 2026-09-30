---
title: "The /_lib/ route, the sandbox, and the hosting path prefix"
status: in-progress
---

Artifact pages load library elements through a reserved route, `/_lib/<alias>/<element>`. This leaf makes the local server serve that route, sandboxes library HTML so third-party code cannot touch the site, and solves the one open problem the notes left: a published site served under a path prefix (agentks.neuralabs.org/docs is exactly that) must still find `/_lib/` URLs written inside artifacts. When it is done, an artifact can show `<img src="/_lib/icons/server">` locally and on a prefixed published site, and a library's HTML runs in its own opaque origin.

# 01 To Do
- [ ] **Reserve `_lib`.** Add `_lib` to the router's reserved first segments beside `artifacts` and `api`, in the engine's route table and in the client router. A section whose `base_url` starts with `/_lib` is a config error ([020/30 links and URLs](../020_content-contract/30_links-and-urls.md)).
- [ ] **Serve `/_lib/<alias>/<element>` in the local server.** Resolve the alias through the lock (or the local folder), the element through the manifest ([120/30](./30_manifest-and-catalog.md)), and stream the file with a content type from its extension.
    - [ ] Folder elements (manifest-less local libraries): `/_lib/<alias>/<element>/` serves `index.html`, and `/_lib/<alias>/<element>/<file>` serves siblings inside that folder only.
    - [ ] Unknown alias or element → 404 with a plain-text body naming what was missing (and a log line), never an empty 200.
    - [ ] Canonicalise the final path and require it inside the library folder or the cache commit folder ([050/50 security](../050_server/50_security.md)).
- [ ] **Sandbox library HTML and SVG.** Serve every `.html` and `.svg` element with `Content-Security-Policy: sandbox allow-scripts`. The browser then gives it an opaque origin, even when opened directly: no cookies, no storage, no access to the parent page. Do not add `allow-same-origin`.
    - [ ] Images other than SVG, fonts, JSON and scripts are served without the sandbox header; a script runs with the rights of the page that loads it (the project's own artifact), which is the author's choice.
    - [ ] Add `X-Content-Type-Options: nosniff` to every `/_lib/` response.
- [ ] **The project's own artifacts stay as they are** (unsandboxed, first-party). Whether they should also get a header is an open question; do not change it here.
- [ ] **Hosting path prefix.** Decide and build how `/_lib/` URLs inside artifact HTML work when the site is built with `--base /docs`.
    - [ ] Record the decision in 04 Decisions and in [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (move it from open to settled).
    - [ ] Claude's leaning: `agentks build` parses each artifact's HTML with a real HTML parser and prefixes attribute values (`src`, `href`, `srcset`, `poster`, `data`, CSS `url()` in `style` attributes) that start with `/_lib/`, and nothing else. It also sets a `data-agentks-base` attribute on the artifact's `<html>` so scripts that build URLs can read it. A URL built at run time by a script that ignores the attribute is a documented limitation, stated in the artifacts skill.
    - [ ] Coordinate with [020/30 links and URLs](../020_content-contract/30_links-and-urls.md), which owns the base prefix for every other href, and [150/10 agentks build](../150_publishing/10_agentks-build.md), which copies used elements into `dist/_lib/`.
- [ ] **Tests.** Server integration tests: an SVG, an HTML element (header present), a folder element with a sibling, a path escape (refused), an unknown element (404 with message). Build test: an artifact with `/_lib/icons/server` built with `--base /docs` references `/docs/_lib/icons/server`.

## Guardrails
- Never put library HTML on the site's own origin.
- Never rewrite anything in a markdown page for this; markdown does not name elements.
- The rewrite, if chosen, touches only `/_lib/` URLs; everything else in artifact HTML stays byte-identical.

## Done when
- `curl -i localhost:<port>/_lib/icons/server` returns the SVG with `Content-Security-Policy: sandbox allow-scripts`.
- In a browser, a library HTML element opened directly cannot read `localStorage` (the console shows the sandbox error).
- A test site built with `--base /docs` and served from a `/docs/` folder shows every library image in its artifacts.

# 02 Status and Result
In progress. Element resolution and the serving rules are built in `agentks-library`; the HTTP route, reserving `_lib` in the routers, and the `--base` rewrite belong to the server, client and build tracks.

## Result
- **Code:** `crates/library/src/url.rs` (`parse_lib_url` for `/_lib/<alias>/<element>[/<file>]`, `lib_urls_in` to find them in artifact HTML with line numbers), `src/libraries.rs` (`resolve`, `resolve_sibling`: canonical paths that must stay inside the library or the element's folder), `src/elements.rs` (`ElementFile::content_type`, `sandboxed`, `headers()` with `X-Content-Type-Options: nosniff` always and `Content-Security-Policy: sandbox allow-scripts` for `.html`, `.htm`, `.svg`; `LIB_SANDBOX_CSP`).
- **Tests:** URL parsing and scanning, header sets per file type, a folder element with a sibling, a `../` escape refused, an unknown element with its message.
- **Left:** the server route and its 404 body (map `LibraryError::ElementUnknown`), `_lib` in the client router (the engine side is already reserved in `agentks-core::RESERVED_SEGMENTS`), the `--base` rewrite in the build, and the nginx header note.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the server crate and the build step under `apps/agentks-engine/`; the reserved route list in `apps/agentks-client/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 13 (serving `/_lib/`), 14 (trust), 18 (open: the path prefix).
- [Sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md), section 07 (security) — the `.html` MIME boundary.
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), sections 03 (`--base`) and 04 (output layout).
- Today's artifact route and trust model: [the artifacts route](../../../../../../agent-ks-engine/src/pages/artifacts), [artifact-pages.ts](../../../../../../agent-ks-engine/src/loaders/artifact-pages.ts), [the client artifact script](../../../../../../agent-ks-engine/src/scripts/artifacts.ts).
- [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) — the hosting path prefix problem for ordinary links.

**Depends on:** [120/30 manifest and element lookup](./30_manifest-and-catalog.md), [050/10 HTTP and routes](../050_server/10_http-and-routes.md), [050/50 security](../050_server/50_security.md), [020/30 links and URLs](../020_content-contract/30_links-and-urls.md).
**Unblocks:** [100/30 artifact pages](../100_layouts/30_artifact-pages.md), [150/10 agentks build](../150_publishing/10_agentks-build.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30), on claude's proposal: artifacts load elements through `/_lib/<alias>/<element>` ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-09-30): library HTML is sandboxed, unlike the project's own artifacts, because it is third-party code (same note).
- Decided (claude, 2026-10-01): The header list for `/_lib/` responses lives in one function, `ElementFile::headers()`, so the local server and the static build's host config cannot drift.
- Decided (claude, 2026-10-01): A folder element resolves to its `index.html`, with `folder: true`; siblings resolve through `resolve_sibling`, which keeps them inside that folder after following symlinks.

# 05 Notes & Analysis
## Watch out
- `sandbox` without `allow-same-origin` also blocks the element's own `fetch` to its siblings with credentials; self-contained elements do not need it. Folder elements that fetch siblings must use relative URLs without credentials.
- Some browsers treat `sandbox` in CSP differently for SVG loaded through `<img>` (scripts never run there anyway). Test SVG both through `<img>` and opened directly.
- Screen frames load the `src` URL the parent passes: an image, or with `kind=page` a page in a nested sandboxed iframe ([library system](../../notes/04_ecosystem/01_library-system.md), section 14). A CSP on `/_lib/` that limits `img-src` or `frame-src` would break them.
- A published site behind nginx needs the same headers. [150/70 Dockerfile](../150_publishing/70_dockerfile.md) and [195/00 hosting](../195_hosting/00_overview.md) must add `location /_lib/ { add_header Content-Security-Policy "sandbox allow-scripts"; }` for `.html` and `.svg`.
