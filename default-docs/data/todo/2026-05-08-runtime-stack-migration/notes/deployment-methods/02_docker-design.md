---
title: "Docker design — Dockerfiles, topologies, nginx"
sidebar_label: "02 · Docker design"
---

# Docker design — running and shipping in containers

Lifted and condensed from `2026-04-26-framework-as-cli-tool/notes/01_docker-deployment-design.md`. The original is comprehensive; this version keeps only the parts still relevant after the runtime migration. Many original pieces (multi-stage with Bun, Astro-build coordination) drop because the binary is the framework now.

## Two roles, simplified

### Role 1 — Container as runtime

Equivalent to Methods 1 and 2 inside a container. Run `doc-engine dev`, `serve`, or `build` with the docs folder mounted in.

```yaml
# docker-compose.yml
services:
  docs:
    image: doc-engine:latest
    ports:
      - "4321:4321"
    volumes:
      - ./default-docs:/site/default-docs
    command: ["serve", "--host", "0.0.0.0"]
```

The container is the binary; the volume is the user's content. No build inside the container — just runtime.

### Role 2 — Production deploy

Two patterns:

**Pattern A — `doc-engine serve` directly**

```yaml
services:
  docs:
    image: doc-engine:latest
    ports:
      - "80:4321"
    volumes:
      - ./default-docs:/site/default-docs
    command: ["serve", "--host", "0.0.0.0", "--production"]
    restart: unless-stopped
```

The Go binary IS the production server. No nginx needed. Health checks, gzip, structured logging, ETag caching — all in the binary.

**Pattern B — Static build + nginx**

```dockerfile
# Stage 1 — build
FROM doc-engine:latest AS builder
WORKDIR /site
COPY default-docs/ ./default-docs/
RUN doc-engine build --output /dist

# Stage 2 — serve
FROM nginx:alpine
COPY --from=builder /dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Useful for:
- CDN-fronted deploys (build once, push to S3 / Cloudflare)
- Subpath hosting alongside other apps
- Air-gapped static hosting

## Topologies

Inherited from the original design; pruned to the four that matter.

### Topology A — Subpath, single nginx

```
                        Single nginx container
                        ┌────────────────────────┐
   client ─►  app.com  ─┤  /              → main app upstream
                        │  /docs/         → static dist/
                        └────────────────────────┘
```

One nginx fronts both the main app and docs. Requires `site.base_url: "/docs"` in `site.yaml` so internal links + asset paths are prefixed.

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

Routing nginx in front of per-app nginxes. More moving parts but each app owns its own nginx config.

### Topology C — Subdomain (independent)

```
   client ─►  docs.app.com  ─►  doc-engine container ─►  serve
```

`docs.app.com` runs its own `doc-engine serve --production` container. **The simplest topology — recommended default.** No URL prefix; no static-build coordination if you stay with Pattern A above.

### Topology D — Standalone

For Role 1 use cases (containerised dev, CI build jobs). No nginx; the container runs the binary directly.

## Dockerfile shapes

### Shape 1 — `serve` directly (recommended for Topology C)

```dockerfile
FROM scratch
COPY doc-engine /doc-engine
EXPOSE 4321
ENTRYPOINT ["/doc-engine"]
CMD ["serve", "--host", "0.0.0.0"]
```

~30 MB final image. Cold-start under 100 ms. No shell, no userland — just the binary.

### Shape 2 — Static build + nginx (for Topologies A/B if CDN-style preferred)

```dockerfile
FROM doc-engine:latest AS builder
WORKDIR /site
COPY default-docs/ ./default-docs/
RUN /doc-engine build --output /dist

FROM nginx:alpine
COPY --from=builder /dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Multi-stage; build artifact is plain HTML. Same nginx tricks apply (cache headers, gzip, asset immutability).

## Mode-to-container mapping (simplified)

| `doc-engine` subcommand | What the container does | Volumes | Ports |
|---|---|---|---|
| `dev` | Watches mounted docs folder; SSE refresh; hot-reload | docs RW | 4321 (or configured) |
| `serve` | Production server; no dev toolbar; gzip + caching | docs RO | 4321 |
| `serve --production` | As `serve`, with all dev surfaces stripped | docs RO | 4321 |
| `build` | One-shot build → output volume; container exits | docs RO; output RW | none |

`--production` is now an explicit flag rather than orthogonal to mode (the Astro design needed orthogonality because Astro's "dev mode" surfaces were hard to suppress; in Go they're tied to subcommand cleanly).

## Volume mount strategy

| What | Mount | Why |
|---|---|---|
| `default-docs/` | RW for `dev`, RO for `serve`/`build` | Dev wants HRM (file watcher → SSE → browser); serve doesn't need write |
| Output `dist/` | RW for `build` only | Build writes static output here |
| `nginx.conf` | RO if Pattern B | Static config; never modified at runtime |

## nginx config patterns

### Topology A (subpath, single nginx)

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

  location /docs/_engine/ {
    alias /usr/share/nginx/docs/_engine/;
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Topology C (subdomain)

```nginx
server {
  listen 80;
  server_name docs.app.com;

  # Option 1: proxy to doc-engine container
  location / {
    proxy_pass http://doc-engine:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Option 2: static files (if Pattern B)
  # root /usr/share/nginx/html;
  # location / { try_files $uri $uri/index.html =404; }
}
```

## Global URL prefix (`site.base_url`)

Inherited concern. Required for Topologies A/B; unused in C/D.

```yaml
# site.yaml
base_url: "/docs"   # default: ""
```

Go's router prepends this to:
- Every generated route
- Navbar / sidebar / footer link generation
- Canonical / og:url meta tags
- Asset URLs (`<script src="...">`, `<link href="...">`)

This needs to land in the runtime regardless of Docker — it enables subpath deployments anywhere.

## What changes vs the original CLI-tool design

| Original (Astro+Bun) | After runtime migration |
|---|---|
| Multi-stage Dockerfile with Bun installer + Astro build | Single-stage `FROM scratch` + binary |
| `docs.yaml` compose schema with `services.renderer.mode` | `doc-engine.toml` for run config; subcommand for mode |
| Container needs to install Bun on first run | No runtime deps |
| Image size ~250 MB (Node + node_modules) | Image size ~30 MB |
| Cold container start ~5–10 s | Cold container start ~100 ms |
| Build-stage and serve-stage Bun coordination | Build-stage uses doc-engine; serve-stage uses doc-engine OR nginx |

## What stays useful from the original

- The four-topology model (A/B/C/D)
- The "two roles, not one" framing
- The skill-generated Dockerfile + docker-compose.yml + nginx.conf pattern
- The verification checklist (build cleanly, container starts, requests resolve, asset URLs honour base path, etc.)
- The hand-rollable documentation pattern (skill output + user-guide are mirrors)

## The Claude skill (carry-over)

The deployment skill (`/docker-setup`) continues to exist. Same prompts (use case, topology, mode, domain, production flag), simpler outputs (no Bun coordination needed). Generated artifacts:

- `Dockerfile` (single-stage by default; multi-stage only for Pattern B)
- `docker-compose.yml` (per topology)
- `nginx.conf` (Topologies A / B / sometimes C)
- `DEPLOY.md` (walking through generated files)

## Out of scope

- Kubernetes manifests (use `kompose convert` if needed)
- Platform-specific deployment guides (Vercel, Netlify, etc.) — downstream
- CI/CD templates (GitHub Actions etc.) — downstream
