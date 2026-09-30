---
title: "Publishing: agentks build and static site generation"
---

Publishing is **Phase 3** and **state 3** of agentks. `agentks build` writes a fully static site. It uses static site generation (SSG): every page is built once, ahead of time, from the same layout components the local client uses. Rust computes each page's data, exactly as it does for the WebSocket. The static renderer, `apps/agentks-ssg`, renders that data with the shared UI package `apps/packages/agentks-ui` into finished HTML. Pages are not hydrated as a whole and never load their content as JSON. Only interactive parts, called islands, ship JavaScript. The output is plain files that nginx, any static host or a CDN can serve, with no Rust server. The build needs Bun or Node on the build machine, and it installs the project's libraries exactly as `config/dep.lock` pins them. Docker users get a basic Dockerfile they own and change; agentks publishes no Docker image. Until Phase 3 ships, anyone who publishes stays on the last 0.x release, pinned with mise.

# 03 References

- [Shared UI package](../03_frontend/01_shared-ui-package.md) — the pure components both builds render.
- [Client application](../03_frontend/02_client-application.md) — state 2, the same components wired to live data.
- [Rust engine](../02_engine/03_rust-engine.md) — the page data `agentks build` hands to the renderer.
- [Rust CLI](../02_engine/05_rust-cli.md) — the `agentks build` command among the others.
- [Library system](../04_ecosystem/01_library-system.md) — `dep.yaml`, `dep.lock` and the cache a build installs from.
- [Deployment and hosting](./06_deployment-and-hosting.md) — agentks's own website, the first user of this phase.
- [Versioning and migrations](./03_versioning-and-migrations.md) — pinning 0.x for publishers until this phase ships.
- [Brainstorm: Phase 3 publishing](../../brainstorm/02_future-stages/07_phase-3-publishing.md) — the options that were ruled out, and why.
- [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) — root-absolute hrefs and the hosting path prefix, applied at build.
- [The Docker design from the Go issue](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) — a static build behind nginx, and `base_url`.
- Today's deployment guide, [user guide 30_deployment](../../../../user-guide/30_deployment/01_to_be_written.md) — to be rewritten for this phase.

# 04 Decisions

- Decided (claude, under sidhantha's delegation, 2026-09-30): static search uses Pagefind, built by `agentks build` ([150/40](../../subtasks/150_publishing/40_static-search.md)).

- Decided (sidhantha, 2026-09-29): publishing is Phase 3, after editing (Phase 2).
- Decided (sidhantha, 2026-09-29): a published site is 100% static, served by nginx or similar over HTTPS. No Rust server runs.
- Decided (sidhantha, 2026-09-29): search-engine friendliness is this phase's job only.
- Decided (sidhantha, 2026-09-29): the output is CDN friendly: plain files, nothing computed per request.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release, pinned with mise, until Phase 3 ships.
- Decided (sidhantha, 2026-09-30): publishing is SSG. No server-side rendering per request, and no Rust server in production serving page data as JSON.
- Decided (sidhantha, 2026-09-30): the layouts and components live in `apps/packages/agentks-ui`. `apps/agentks-client` renders them in the browser for the local tool; `apps/agentks-ssg` renders them to static HTML once, for publishing.
- Decided (sidhantha, 2026-09-30): published pages are not hydrated as a whole and do not load their content as JSON. Only interactive parts carry JavaScript.
- Decided (sidhantha, 2026-09-30), on claude's proposal: `agentks build` needs Bun or Node on the build machine. The static renderer ships compressed inside the binary. Diagrams can render to SVG in the same step.
- Decided (sidhantha, 2026-09-30): `agentks build` works on its own, for direct hosting or a CDN, and inside Docker.
- Decided (sidhantha, 2026-09-30): no Docker image is published. A basic Dockerfile ships with the docs and the default template, for users to change.
- Decided (sidhantha, 2026-09-30): a publishing build downloads the project's libraries again, the way npm, bun or pip install dependencies for a build.
- Decided (sidhantha, 2026-09-30): the agentks docs at agentks.neuralabs.org/docs are built with `agentks build`, so this phase finishes before the launch's hosting step.
- Proposed (claude, 2026-09-30), not yet agreed: the command shape, the output layout and the island list in sections 03 to 05; the build installs strictly from `dep.lock`; the raw markdown and `llms.txt` outputs; the Dockerfile in section 08.

# 05 Notes & Analysis

## 01 What happens during `agentks build`

```
agentks build
  1. check        config/ exists, engine_version is in range, dep.lock is present
  2. libraries    install exactly the commits in dep.lock (like npm ci)
  3. data         Rust builds the site index and computes every page's data
  4. render       apps/agentks-ssg renders each page with apps/packages/agentks-ui
  5. diagrams     Mermaid, Graphviz, Excalidraw, draw.io embeds → inline SVG
  6. assets       copy assets, artifacts and library files; hash their names;
                  generate missing voice clips when the helper is installed, join each
                  video's audio stream, write standalone video pages
  7. extras       sitemap.xml, robots.txt, 404.html, raw markdown, llms.txt
  8. write        replace the output folder in one step
```

| Step | Owner | Notes |
|---|---|---|
| 1–3 | Rust | The same code that serves the WebSocket in state 2. The data is identical, so the local tool and the published site cannot disagree |
| 4–5 | The static renderer, run with Bun or Node | Rust starts it as a child process and streams page data to it. The data is handed over directly; it is never written out for a browser to fetch |
| 6–8 | Rust | The output folder is written to a temporary folder and renamed at the end, so a failed build never leaves half a site |

A build fails on any error the engine would show locally: a broken link, an unknown library element, a missing embed. A published site never ships with a known defect.

## 02 The build-time runtime

- The shared components are JavaScript, so something must run them. `agentks build` looks for `bun`, then `node`, on the path.
- If neither is present it stops and prints how to install Bun. It never downloads a runtime by itself.
- The static renderer's bundle ships compressed inside the binary, like the client. The binary unpacks it into the build cache for its own version, so repeated builds do not unpack again ([machine home and build cache](../02_engine/06_machine-home-and-build-cache.md)).
- Why not an embedded JavaScript engine: it adds 1–2 MB to every install and builds more slowly. Why not Rust writing HTML: every layout would exist twice and drift.

## 03 The command (claude, proposed)

| Form | Does |
|---|---|
| `agentks build` | Builds into `dist/`, beside `config/` |
| `agentks build --out <folder>` | Builds into another folder |
| `agentks build --base <path>` | Sets the hosting path prefix, for example `/docs`. Every href, asset URL and sitemap entry gets it. Default: `site.yaml`'s value, else `/` |
| `agentks build --site-url <url>` | The public origin, for canonical URLs and the sitemap. Default: `site.yaml`'s value. Without one, the build skips the sitemap and warns |
| `agentks build --json` | One JSON summary on stdout: pages, bytes, warnings, time |

- `dist/` is added to the project's `.gitignore` by `agentks init`.
- The build is offline once libraries are cached. A missing library with no network is an error naming `agentks install`.
- Exit codes follow the CLI's contract: 0 success, 1 build failure, 2 wrong usage.

## 04 Output layout (claude, proposed)

```
dist/
  index.html
  user-guide/
    index.html
    getting-started/
      index.html              one folder per page, so every URL works without .html
      index.md                the page's raw markdown, for agents
  issues/
    index.html
    2026-09-29-some-issue/index.html
  _assets/
    app.3f9c2a1e.js           island code, content-hashed
    theme.51aa0c3f.css        the compiled theme CSS, content-hashed
    search.9d02e11c.json      data an island loads when used (the search index)
  _content/…                  page assets (./assets/… in the source), content-hashed
  _lib/<alias>/<element>      library elements used by artifact pages, and images used by videos
  _audio/<stream key>.opus    one joined audio stream per video, served with range requests
  artifacts/…                 artifact pages, served in their iframes
  artifacts/<path>.video/     one standalone player page per video, written by the engine's shell writer
  sitemap.xml
  robots.txt
  llms.txt                    a plain list of pages with one line each, for AI readers
  404.html
```

| Rule | Why |
|---|---|
| Every page is `<path>/index.html` | Clean URLs on every static host, with no rewrite rules. Fixes the trailing-slash bug 0.x publishers have on static hosts |
| URLs are the same as in the local tool | The router uses real URL paths from Phase 1 ([client application](../03_frontend/02_client-application.md)) |
| Every href is root-absolute, with the base prefix | Rust resolves links; relative hrefs break under routing and on static hosts |
| Hashed names for everything under `_assets/`, `_content/`, `_lib/` and `_audio/` | They can be cached forever. Only the HTML is revalidated on each publish |
| `artifacts/` keeps its route | Artifacts run in iframes on `/artifacts/<path>`, as today |

## 05 Islands

An island is a component that ships JavaScript because it is interactive. Everything else on the page is plain HTML.

| Island | Where | Loads |
|---|---|---|
| Theme toggle | Every page | A few hundred bytes; the chosen mode is kept in local storage |
| Search | Every page with search on | The search index, only when search opens |
| Issue filters and sorting | The tracker index | The issue list the page was built with, embedded in the page |
| Artifact frame controls | Artifact pages and embeds | Expand and open-full-page controls |
| Video player | Video pages | The player chunk (`apps/packages/agentks-video`), loaded on demand, with the compiled video as props; the audio stream from `_audio/` |
| Interactive diagrams | Only where a diagram cannot be static (for example a zoomable Excalidraw scene) | That diagram's library |

- Each island is hydrated on its own: the page's HTML is already complete, and the island only attaches behaviour.
- A page with no island ships no JavaScript.
- The components mark which parts are islands, so the client (which runs everything) and the static renderer (which runs only islands) use one component tree. Preact, the chosen UI framework, hydrates each island on its own from the props written beside it ([the shared UI package](../03_frontend/01_shared-ui-package.md), section 07).
- Whether search on a static site needs a WASM build of the Rust search code is decided when search is built, for that feature only.

## 06 Diagrams at build time

- Mermaid and Graphviz fences and embeds render to inline SVG. They show without JavaScript and search engines can read their text.
- Excalidraw and draw.io scenes render to SVG with their own export functions.
- A diagram that fails to render fails the build, naming the file and line.
- First-class diagram pages (`.mmd`, `.dot`, `.excalidraw`, `.drawio`) become pages with their SVG in the page body.

## 07 Search engines and AI readers

- Every page is complete HTML with its title, description, canonical URL and Open Graph tags in the head, taken from frontmatter and `site.yaml`.
- `sitemap.xml` lists every page; `robots.txt` points at it.
- Each page's raw markdown is published beside it, and `llms.txt` lists every page with its title and description. An agent reads the docs without a browser.
- Draft and dev-only content is left out of the build ([2025-06-25-dev-only-content](../../../2025-06-25-dev-only-content/issue.md)).

## 08 Libraries during a build

- The build reads `config/dep.lock` and installs exactly those commits into `~/.agentks/libraries/`, like `npm ci`.
- It never resolves `config/dep.yaml` afresh, so a publish never picks up a library version nobody reviewed.
- A missing lock, or a lock that disagrees with `dep.yaml`, fails the build and names `agentks install`.
- Only the elements pages actually use are copied into `_lib/`.

## 09 The Dockerfile

A basic Dockerfile ships in agentks's own `docs/` folder and in the `agentks-default` template, so every new project can publish. The user owns it and changes it freely; agentks never overwrites it.

```dockerfile
# Build stage: install agentks and a JS runtime, build the site
FROM oven/bun:1-debian AS build
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -fsSL https://agentks.neuralabs.org/install.sh | sh -s -- --no-shell-setup
ENV PATH="/root/.local/bin:${PATH}"
COPY . /site
WORKDIR /site
RUN --mount=type=cache,target=/root/.agentks/libraries \
    agentks build --out /out

# Serve stage: nginx and the files, nothing else
FROM nginx:alpine
COPY --from=build /out /usr/share/nginx/html
```

- Production runs only the nginx stage. It holds no agentks, no runtime and nothing to attack beyond nginx.
- The cache mount keeps library commits between builds, so a rebuild does not fetch them again.
- The installer version can be pinned with `--version X.Y.Z`, so a build is repeatable ([distribution and install](./04_distribution-and-install.md)).
- The same shape builds agentks's own website, with a homepage stage added ([deployment and hosting](./06_deployment-and-hosting.md)).
- Until this phase is built, the Dockerfile is a placeholder.

## 10 The gap between 1.0.0 and Phase 3

1.0.0 ships Phases 1 and 2, so a 1.x binary cannot publish until Phase 3 lands.

- The 1.0.0 release notes say so plainly.
- Publishers pin the last 0.x release with mise and keep publishing with it ([versioning and migrations](./03_versioning-and-migrations.md)).
- The user guide's deployment section points at that pin until Phase 3 replaces it.

## 11 What Phases 1 and 2 must already do

These are the three Phase 1 safeguards. Without them this phase becomes a rewrite.

1. **One data interface.** Every component gets data through one module. In state 2 it talks to the WebSocket; in a build the static renderer hands data to the same components directly.
2. **Real URL paths.** Built pages keep the local tool's URLs. Rust outputs root-absolute hrefs.
3. **Pure shared components** in `apps/packages/agentks-ui`: no WebSocket and no browser-only objects while rendering.

## 12 Open

- Whether search on a static site needs WASM ([open questions and risks](../01_overview/05_open-questions-and-risks.md)).
