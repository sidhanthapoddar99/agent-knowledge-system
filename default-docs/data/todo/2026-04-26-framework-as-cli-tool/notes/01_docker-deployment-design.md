---
title: "Docker deployment design — running and shipping the framework in containers"
description: Comprehensive Docker design for Method 3 — Dockerfile + docker-compose.yml + nginx topologies. Absorbs the cancelled 2025-06-25-deployment issue's content (global URL prefix, deployment skill, static build output, hosting topologies). Used by subtasks/04_method-3-docker.md as the design reference; that subtask holds the work checklist and points here for detail.
sidebar_label: Docker Deployment
---

# Docker deployment design — running and shipping the framework in containers

This is the architecture / design reference for **Method 3 (Docker)** in `2026-04-26-framework-as-cli-tool`. The companion subtask `04_method-3-docker.md` holds the work checklist; this note holds the detailed design and absorbs the still-relevant content from the cancelled `2025-06-25-deployment` issue (global URL prefix, deployment skill, static build output, hosting topologies).

The **Claude skill** that generates Dockerfiles + docker-compose.yml + nginx config for the user's chosen scenario is the centerpiece of Method 3. This note describes what that skill needs to produce; the skill itself will be built per the subtask's tasks.

## Docker has two roles, not one

The framework + Docker meet in two distinct ways. The skill needs to handle both, and the user needs to know which one they're choosing:

### Role 1 — Running the framework in a container ("Method 3 = CLI in a box")

Equivalent to Methods 1 and 2, but inside a container. Same `docs.yaml` compose file (the framework's own one — see subtask 03), same modes (`dev` / `static` / `build`), same `production` flag. The difference is isolation: filesystem, network, runtime are scoped to the container. Useful for:

- Reproducible dev environments (no "works on my machine")
- CI/CD jobs that build the docs (`mode: build` produces an artifact, container exits)
- Quick experiments without touching the host's Bun/Node setup
- Multi-tenant servers that want one container per docs project

The container essentially does what Method 1 (CLI) does: spawns the framework against a mounted docs folder. Mounts: `docs.yaml` (read-only), the docs folder (read-write if `mode: dev`, read-only if `mode: static`/`build`).

### Role 2 — Shipping a built site behind nginx ("Method 3 = production deploy")

Two-stage pattern:

1. **Build stage** — container runs `mode: build` against the docs folder, produces `dist/`
2. **Serve stage** — separate container (or layer) runs nginx serving `dist/` as static HTML

Useful for:

- Production deploys (the docs site is a static asset; nginx serves it)
- Subpath / subdomain hosting alongside other apps
- One-command deploy to any platform that runs containers (Kubernetes, Docker Swarm, plain Docker host, Fly.io, Railway, etc.)

The two roles can be the same `Dockerfile` with multi-stage build (Role 2 = Role 1 in `mode: build` followed by an nginx stage). Or two separate Dockerfiles — flexibility belongs to the skill, which generates whichever shape the user chose.

## Mode-to-container mapping

| `services.renderer.mode` | What the container does | Volumes | Ports |
|---|---|---|---|
| `dev` | Spawns Astro dev server, watches mounted docs folder for HRM | docs folder mounted RW (writes flow to host) | renderer port (default 4321) exposed |
| `static` | Serves a pre-built `dist/` (no HRM, no Bun) | `dist/` mounted RO; if no `dist/`, fail with clear error | nginx port (default 80) exposed |
| `build` | Runs build, writes `dist/` to mounted output volume, exits | docs folder mounted RO; output volume RW | nothing — one-shot job |

`production: true` (the orthogonal flag from subtask 03) hides the dev toolbar / live editor / debug routes regardless of mode. Most production deployments are `mode: static, production: true`.

## Hosting topologies

Inherited from the cancelled deployment issue's subtask `02_deployment-skill` and refined here. The skill should generate the right Dockerfile + docker-compose.yml + nginx config for each:

### Topology A — Subpath, single nginx

```
                        Single nginx container
                        ┌────────────────────────┐
   client ─►  app.com  ─┤  /              → main app upstream
                        │  /docs/         → static dist/
                        └────────────────────────┘
```

One nginx fronts both the main app and the static docs build. Docs are served at `app.com/docs/...`. Requires `site.base_url: "/docs"` in the docs project's config so internal links and asset paths are prefixed correctly.

**Generated artifacts:** one `Dockerfile` (multi-stage: builder → nginx), one `docker-compose.yml` defining the nginx container with two upstreams, one `nginx.conf` with `location /docs/ { ... }` block.

### Topology B — Subpath, multiple nginx

```
                  Routing nginx                 Per-app nginx
                  ┌──────────────┐              ┌────────────┐
   client ─► ─────┤ /     → app  ├──────────────┤  main app  │
              ────┤ /docs → docs ├──────┐       └────────────┘
                  └──────────────┘      │       ┌────────────┐
                                        └───────┤  docs nginx │
                                                └────────────┘
```

A routing nginx in front of separate per-app nginx containers. More moving parts but each app owns its own nginx config and rebuild cycle. Same `site.base_url: "/docs"` requirement.

**Generated artifacts:** docs project's `Dockerfile` + per-project `nginx.conf` (serves at root inside its container) + a separate top-level `docker-compose.yml` with the routing nginx defined upstream of both apps.

### Topology C — Subdomain (independent)

```
   client ─►  docs.app.com  ─►  Standalone nginx container ─►  static dist/
```

`docs.app.com` runs its own nginx independently. No URL prefix needed (`site.base_url` is empty / `"/"`). The simplest topology — recommended default unless the user has a constraint forcing subpath.

**Generated artifacts:** one `Dockerfile` (multi-stage), one `docker-compose.yml` with the nginx container, one `nginx.conf` serving at `/`.

### Topology D — Standalone (no nginx, dev / build only)

For Role 1 use cases (containerised dev, CI build jobs). No nginx involved; the container runs the framework directly.

**Generated artifacts:** one `Dockerfile` (no nginx stage), no `docker-compose.yml` strictly required (a `docker run …` command suffices), no `nginx.conf`.

## Multi-stage Dockerfile pattern

The canonical shape for Topologies A/B/C (build + serve in one image):

```dockerfile
# Stage 1 — build
FROM oven/bun:latest AS builder
WORKDIR /app
# Install the CLI (or use Method 2 from-source by copying agent-ks-engine/)
RUN curl -fsSL https://<install-domain>/install.sh | sh
COPY docs.yaml ./
COPY config/ ./config/
COPY data/    ./data/
COPY assets/  ./assets/
COPY themes/  ./themes/
# Run build via the CLI (mode: build, production: true overrides via separate compose? — see open question)
RUN astro-doc compose
# Output: /app/dist/

# Stage 2 — serve
FROM nginx:alpine AS server
COPY --from=builder /app/dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Topology D drops Stage 2 entirely.

## docker-compose.yml shapes

Single-service example (Topology C, subdomain):

```yaml
services:
  docs:
    build: .
    image: my-docs:latest
    ports:
      - "8080:80"
    restart: unless-stopped
```

Routing-nginx example (Topology B):

```yaml
services:
  router:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./router.nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - main-app
      - docs

  docs:
    build: ./docs
    expose:
      - "80"

  main-app:
    image: my-app:latest
    expose:
      - "8000"
```

Dev-mode example (Topology D, mounted source for HRM):

```yaml
services:
  docs-dev:
    build:
      context: .
      target: builder           # stop at build stage; we want bun, not nginx
    ports:
      - "4321:4321"
    volumes:
      - ./docs.yaml:/app/docs.yaml:ro
      - ./config:/app/config
      - ./data:/app/data
      - ./assets:/app/assets
      - ./themes:/app/themes
    command: ["astro-doc", "compose"]
```

(Source mount requires `services.renderer.mode: dev` in `docs.yaml`.)

## Volume mount strategy

| What | Mount as | Mode | Why |
|---|---|---|---|
| `docs.yaml` | read-only | always RO | The compose file is config, not state. RO prevents the container from clobbering it. |
| Docs folder (`config/`, `data/`, etc.) | RW for `mode: dev`, RO for `mode: static`/`build` | depends | Dev mode wants HRM (which needs file watch — RW lets edits propagate); static/build modes don't need write access. |
| `dist/` output | RW | when `mode: build` | The build writes here. |
| nginx config | read-only | always RO | Static config; never modified at runtime. |

## nginx config patterns

### Topology A — single nginx, subpath

```nginx
server {
  listen 80;
  server_name app.com;

  location / {
    proxy_pass http://main-app:8000;
  }

  location /docs/ {
    alias /usr/share/nginx/docs/;
    try_files $uri $uri/index.html =404;
  }

  # Serve docs assets (CSS, JS, fonts) at /docs/_astro/ etc.
  location /docs/_astro/ {
    alias /usr/share/nginx/docs/_astro/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Topology B — routing nginx + per-app nginx

```nginx
# router.nginx.conf
server {
  listen 80;
  server_name app.com;

  location /docs/ {
    proxy_pass http://docs/;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://main-app:8000;
  }
}
```

```nginx
# per-app nginx (inside docs container)
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/index.html =404;
  }
}
```

### Topology C — subdomain

```nginx
server {
  listen 80;
  server_name docs.app.com;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/index.html =404;
  }

  location /_astro/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Global URL prefix (`site.base_url`)

Inherited from the cancelled deployment issue's subtask `01_global-url-prefix`. **Required for Topologies A and B; unused in Topologies C and D.**

The framework needs a config option (`site.yaml → base_url: "/docs"`, or similar) that:

- Is prepended to every generated route in `pages/[...slug].astro`
- Is applied to navbar / sidebar / footer link generation
- Is honoured in canonical / `og:url` meta tags
- Defaults to `""` (empty) when not set, for Topologies C / D

This isn't strictly Docker-specific — it's a framework feature that *enables* subpath deployments. The work belongs to the framework regardless of distribution shape; folded into Method 3's task list because the deployment skill's Topology A/B output depends on it landing.

## Static build output requirements

Inherited from the cancelled deployment issue's subtask `03_static-build-output`. The Docker build stage relies on these:

- `astro-doc compose` with `mode: build` produces a clean static `dist/`
- No dev-toolbar / live editor / debug routes in the build output
- All routes pre-rendered (no SSR runtime needed in production — nginx serves HTML directly)
- Asset paths respect `site.base_url` for subpath topologies
- Build verified against each hosting topology before declaring "Method 3 ready"

Most of these are framework-side concerns (cleanliness of the build artifact, no dev-tool leakage, proper base-path handling). They're listed here because Method 3's deployment story breaks down if the build artifact isn't clean.

## The Claude skill — what it produces

The deployment skill is the user-facing entry point for Method 3. The user invokes it from inside their docs folder:

```
/docker-setup
```

The skill prompts:

1. **Use case** — "running for development inside a container" (Role 1) or "deploying the built site to production" (Role 2)?
2. **Topology** (Role 2 only) — Subpath single-nginx / Subpath multi-nginx / Subdomain
3. **Mode** — dev / static / build
4. **Path / domain** — `app.com/docs` or `docs.app.com`, etc.
5. **Production flag** — yes (hide dev toolbar) / no
6. **Output location** — inside the docs folder (default) or external?

Then generates:

- `Dockerfile` (multi-stage if Role 2; single-stage if Role 1)
- `docker-compose.yml` (shape depends on topology)
- `nginx.conf` (Role 2 only)
- A short `DEPLOY.md` documenting how to use the generated files

Plus a verification checklist:

- Container builds cleanly (`docker compose build`)
- Container starts (`docker compose up`)
- Request paths resolve (curl + expected status code)
- Asset URLs respect base path (no broken `/_astro/...` references in HTML)
- Dev toolbar absent if `production: true`
- HRM works if `mode: dev`

## Manual setup documentation

For users who don't want to run the skill — the skill's output should also be a documented hand-rollable pattern. Each topology gets a user-guide page showing the same files the skill would generate, with an "if you'd rather copy-paste" framing. This means:

- The deployment skill and the documentation are mirrors of each other
- Skill changes drive doc updates and vice versa
- Both are versioned with the framework

## Open design questions

1. **Where does `mode: build` write `dist/`?** Inside the container (then copied to nginx stage in multi-stage build) or to a mounted volume (so the host gets the artifact for further processing)? Multi-stage default is "internal"; the option for mounted output is useful for CI artifact uploads.
2. **Does the deployment skill ship with the framework or as a separate Claude plugin?** Probably with the framework (it's part of the Method 3 story). Same delivery as the existing `documentation-guide` plugin (`/docs-init`, `/docs-add-section`, etc.).
3. **Do we generate Kubernetes manifests too, or just docker-compose?** Probably just docker-compose for v1; Kubernetes is a downstream concern that the user can convert from compose if needed (`kompose convert`).
4. **Single image or split images per role?** Role 1 (dev container) and Role 2 (build + nginx) could be one Dockerfile with two targets, or two Dockerfiles. Ergonomics question.

## Out of scope (deliberately dropped from the deployment issue)

- **Platform-specific deployment guides** (Vercel, Netlify, GH Pages, Cloudflare Pages) — these are downstream of the framework. Each is a "take the static `dist/` and upload it to X" recipe; they don't fit cleanly under Method 3 (Docker), and writing four of them at once is high-cost / low-value. Could be filed as a separate issue later if there's actual demand.
- **CI/CD templates** (GitHub Actions, GitLab CI workflow files) — same reasoning. The static build is the artifact; how to push it is platform-specific. Worth a separate issue if the demand surfaces.
- **Content-type creation skills** (issues, blogs, custom pages, etc., from the deployment issue's subtask 02) — already covered by the existing `documentation-guide` plugin (`/docs-init`, `/docs-add-section`); no need to re-scope here.
