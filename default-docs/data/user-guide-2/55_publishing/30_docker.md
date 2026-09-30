---
title: "Docker"
---

agentks does not publish a Docker image. Instead, your project comes with a basic `Dockerfile` that you own and can change: one stage builds the site with agentks, and the other serves it with nginx. The container you run in production holds nginx and your static files, and nothing else.

## The files

A project created from the default template has these files beside `config/`:

| File | What it is for |
|---|---|
| `Dockerfile` | Builds the site, then copies it into an nginx image |
| `nginx.conf` | Clean addresses, the 404 page, cache headers and the library sandbox |
| `.dockerignore` | Keeps `dist/`, `.git/` and `config/.env` out of the image |

They are yours. agentks copies them once when it creates the project and never overwrites them, so change them as your hosting needs.

## What the Dockerfile does

Your project's own `Dockerfile` is the one to use. It follows this shape:

```dockerfile
# Build stage: install agentks and a JavaScript runtime, then build the site
FROM oven/bun:1-debian AS build
ARG AGENTKS_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -fsSL https://agentks.neuralabs.org/install.sh \
    | sh -s -- --version "${AGENTKS_VERSION}" --no-shell-setup
ENV PATH="/root/.local/bin:${PATH}"
COPY . /site
WORKDIR /site
RUN --mount=type=cache,target=/root/.agentks/libraries \
    agentks build --out /out

# Serve stage: nginx and the files, nothing else
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out /usr/share/nginx/html
```

| Line | Why it is there |
|---|---|
| `FROM oven/bun:1-debian` | The build needs Bun or Node. This image brings Bun |
| `--version "${AGENTKS_VERSION}"` | Installs the exact agentks release you name, so every build of the same content gives the same site |
| `--no-shell-setup` | The installer leaves shell start-up files alone, which a container does not need |
| `--mount=type=cache,…/libraries` | Keeps downloaded library versions between builds, so a rebuild does not fetch them again |
| `FROM nginx:alpine` | Production runs only this stage: no agentks, no JavaScript runtime, nothing to attack beyond nginx |

## Build and run it

From the project folder:

```bash
docker build --build-arg AGENTKS_VERSION=X.Y.Z -t my-docs .
docker run --rm -p 8080:80 my-docs
```

Replace `X.Y.Z` with the agentks release you build with. Then open `http://localhost:8080`.

The build stage runs `agentks build`, so it stops on the same errors as a build on your machine ([Building the site](./05_building-the-site.md#why-a-build-fails)). A failed `docker build` leaves your running container untouched.

## What the nginx configuration does

| Rule | Effect |
|---|---|
| Clean addresses | `/guide/` serves `/guide/index.html` |
| The 404 page | A missing address gets `404.html`, with your site's navigation |
| Long cache for fingerprinted files | `_assets/`, `_content/` and `_lib/` are cached for a year |
| No cache for HTML | Browsers check pages again on each visit, so a new publish shows at once |
| The library sandbox | `.html` and `.svg` files under `_lib/` are served with `Content-Security-Policy: sandbox allow-scripts` |
| Safe types | `X-Content-Type-Options: nosniff`, so browsers trust the declared file type |
| Compression | Text files are sent gzip-compressed |

## Serve under a path

To serve the site at `/docs`, build with the base path and copy the output into the matching folder. Change the two lines:

```dockerfile
RUN --mount=type=cache,target=/root/.agentks/libraries \
    agentks build --base /docs --out /out

COPY --from=build /out /usr/share/nginx/html/docs
```

The `nginx.conf` beside the Dockerfile has a commented block for serving under a prefix. More on base paths is in [Serving under a path](./15_serving-under-a-path.md).

## HTTPS

The container serves plain HTTP on port 80. Put HTTPS in front of it: your hosting platform's proxy, a load balancer, or a CDN.
