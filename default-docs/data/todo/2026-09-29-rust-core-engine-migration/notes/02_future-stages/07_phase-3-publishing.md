---
title: "Phase 3: publishing with agentks build"
---

Publishing a site, for search engines or for readers outside the team, is **Phase 3**. `agentks build` writes a **fully static site** (SSG): every page pre-built once from the same components the local tool uses, with its content filled in and JavaScript only where a page is interactive, served over HTTPS by nginx, any static host or a CDN, with **no Rust server**. The local tool (Phases 1 and 2) stays a WebSocket app for one or two developers and never has to serve the public. Publishing is **state 3** of agentks. For Docker hosting, a basic Dockerfile ships with the docs for users to adapt: it installs agentks, runs `agentks build`, and serves the result with nginx. No Docker image is published. **Until Phase 3 ships, anyone who publishes stays on the last 0.x release.**

# 03 References

- [The architecture: a local SPA over WebSocket](../01_initial_discussion/17_local-spa-over-websocket.md) — the three safeguards that keep this phase cheap.
- [Open question 12](../01_initial_discussion/16_open-questions.md) — the UI framework, which must support build-time rendering and islands.
- [Versioning and forced migrations](../01_initial_discussion/12_versioning-and-forced-migrations.md) — pinning 0.x with mise.
- [Docker design](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) — static build behind nginx, `base_url`, from the Go issue.
- [The repositories and three states](./12_repositories-and-three-states.md) — state 3 among the three.
- [Libraries](./09_libraries-and-dependencies.md) — what a build must download.
- User guide `30_deployment/` — how publishing works today; it must be rewritten for this phase.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): publishing is Phase 3, after editing (Phase 2).
- Decided (sidhantha, 2026-09-29): a published site is a 100% static build (SSG), served by nginx or similar over HTTPS. No Rust server runs.
- Decided (sidhantha, 2026-09-29): search-engine friendliness is this phase's job only.
- Decided (sidhantha, 2026-09-29): the export is CDN friendly: plain static files with nothing computed per request, so any CDN can cache and serve them.
- Decided (sidhantha, 2026-09-29): publishers stay on the last 0.x release, pinned with mise, until Phase 3 ships.
- Decided (sidhantha, 2026-09-30): the agentks docs at agentks.neuralabs.org/docs are built with the Rust engine. That makes them this phase's first user, and this phase must be done before the launch's hosting step ([launch](./10_launch-order-and-hosting.md)).
- Decided (sidhantha, 2026-09-30): publishing is static site generation (SSG): every page is built once, ahead of time. No server-side rendering per request, and no Rust server in production serving page data as JSON, because both cost a server and a JSON-filled page is weak for search engines.
- Decided (sidhantha, 2026-09-30): the layouts and components live in a shared package, `apps/packages/agentks-ui`. Two builds use it: `apps/agentks-client`, fully client-rendered, for the local tool; and `apps/agentks-ssg`, which renders every page to static HTML once, for publishing.
- Decided (sidhantha, 2026-09-30): published pages are not hydrated as a whole and do not load their content as JSON. Only interactive parts carry JavaScript.
- Decided (sidhantha, 2026-09-30), on claude's proposal: `agentks build` needs Bun or Node on the build machine to run the static renderer; the renderer ships compressed inside the binary. Diagrams can render to SVG in the same step.
- Decided (sidhantha, 2026-09-30): `agentks build` builds the static site. It works on its own, for direct hosting or a CDN, and inside Docker.
- Decided (sidhantha, 2026-09-30): no Docker image is published or maintained. A basic Dockerfile ships with the docs, for users to change: it installs agentks, runs `agentks build`, and serves the output with nginx.
- Decided (sidhantha, 2026-09-30): a publishing build downloads the project's libraries again, the way npm, bun or pip install dependencies for a build.
- Decided (sidhantha, 2026-09-30): this is later production work. For now the Dockerfile is only a placeholder.

# 05 Notes & Analysis

## 01 Why publishing is separate

- The local tool serves one or two developers. It does not need search engines, CDNs or static hosting.
- A published site changes only when someone publishes, so every page can be built once, ahead of time.
- Serving files with nginx is the smallest and safest thing to run in public: no application server, nothing to authenticate.
- The same files can sit behind any CDN. Assets with a content hash in their URL can be cached forever; pages are revalidated when a new build is published.

## 02 How pages are built: SSG from the shared components

```
apps/
  packages/agentks-ui/   shared layouts and components: data in, markup out
  agentks-client/        state 2: the full client app over the WebSocket, inside the binary
  agentks-ssg/           state 3: renders every page to HTML once, at build time
```

`agentks build` runs in three steps:

1. **Rust computes every page's data**, exactly as it does for the WebSocket: the body, the sidebar, the outline, the resolved links.
2. **The static renderer turns it into HTML.** `agentks-ssg` renders each page with the same components the client uses. The data is handed over directly; it is not written out as JSON for the browser to fetch.
3. **The output is plain files**, finished HTML that search engines and AI tools read without running JavaScript.

**Islands, not hydration.** A page ships JavaScript only for the parts that are actually interactive: the theme toggle, search, the issue filters, an artifact's frame. These are islands. A page with none ships no JavaScript. Nothing loads the page's content again as JSON, which is the slow part the user wanted to avoid.

**The one cost: a JavaScript runtime at build time.** The shared components are JavaScript, so something has to run them to produce HTML. `agentks build` requires Bun or Node (decided on claude's proposal). The static renderer ships compressed inside the binary, like the client. The Dockerfile installs Bun in one line, and CI and CDN pipelines usually have Node already. The alternative, a small JS engine embedded in the binary (for example QuickJS), costs about 1–2 MB and slower builds. Rendering in Rust would need every layout written twice, so it is ruled out.

**Diagrams render at build time too.** Mermaid and the other diagram libraries are JavaScript, so the same step can turn diagrams into SVG ahead of time: they show without JavaScript and search engines can read them.

**What was ruled out, and why:**

| Option | Why not |
|---|---|
| Server-side rendering per request | Costs a running server |
| A Rust server serving each page's JSON (`/api/docs/page.json`) | Costs a server, and a page that fills itself from JSON is empty to most crawlers and AI tools |
| Pages that load JSON and hydrate in the browser | The slow part: every page is rendered twice |
| Rust writing the HTML | Every layout would exist twice and drift |
| A headless browser saving each page | Needs Chrome, and is far slower than rendering directly |

## 03 What Phase 1 must already do

- All frontend data access goes through one interface, so the static build can hand data to the components without touching them.
- Every layout and component lives in `apps/packages/agentks-ui` and is pure: data in, markup out, nothing browser-only while rendering.
- The router uses real URL paths, so built pages keep the same URLs. Rust outputs root-absolute hrefs, so links do not depend on where a page is served from; the hosting path prefix from [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) is applied at build.

## 04 The gap between 1.0.0 and Phase 3

The current engine already builds a static site, and the user guide documents deploying it. 1.0.0 ships Phases 1 and 2 first, so publishing is unavailable in 1.x until Phase 3. The plan is:

- The 1.0.0 release notes say so plainly.
- Publishers pin the last 0.x release with mise and keep publishing with it.
- The deployment section of the user guide points to that pin until Phase 3 replaces it.

## 05 agentks build (claude, proposed)

- `agentks build [--out <folder>]` writes the static site, by default into a `dist/` folder beside `config/`.
- **Libraries.** The build reads `config/dep.lock` and installs exactly those commits, like `npm ci`. It never resolves `dep.yaml` afresh, so a publish never picks up a library version nobody reviewed. A missing lock fails the build with a message naming `agentks install`.
- **Output.** Plain files only: finished HTML, the JavaScript for islands, the data an island needs (such as a search index, loaded when search opens), assets with content hashes in their names, each page's raw markdown (`<url>.md`) and an `llms.txt` index for agents.

## 06 The Dockerfile (claude, proposed)

A basic Dockerfile ships in the docs folder, and in the `agentks-default` template, so every project can publish. The user owns it and can change it.

```dockerfile
# Build stage: install agentks, build the site
FROM debian:stable-slim AS build
RUN <install agentks with the official install script>
COPY . /site
WORKDIR /site
RUN agentks build --out /out

# Serve stage: nginx and the files, nothing else
FROM nginx:alpine
COPY --from=build /out /usr/share/nginx/html
```

- Production runs only the nginx stage, so it stays small and has nothing to attack beyond nginx.
- A build cache mount for `~/.agentks/libraries/` avoids fetching the same library commits on every build.
- **agentks's own website** uses a Dockerfile of the same shape that also builds the homepage: `apps/agentks-homepage` to `/`, `docs/` to `/docs` ([launch](./10_launch-order-and-hosting.md)).

## 07 Also for this phase

- Deciding whether search or filtering must work in the static site. If so, that one feature may need a WASM build of the relevant Rust code ([WASM and HTMX](../01_initial_discussion/04_wasm-and-htmx.md)).
