---
title: "The basic, user-owned Dockerfile"
status: open
---

agentks publishes no Docker image. Instead the default template and agentks's own `docs/` folder ship a basic Dockerfile that the user owns and changes: a build stage that installs agentks and a JavaScript runtime and runs `agentks build`, and a serve stage that holds only nginx and the static files. This leaf writes that Dockerfile and its nginx config, tests it, and hands the template copy to [120/85](../120_libraries/85_templates.md). The Dockerfile that builds agentks's own website (homepage plus docs) is [195/00 hosting](../195_hosting/00_overview.md)'s, built on this one.

# 01 To Do
- [ ] **Dockerfile** (starting point from [the publishing note, section 09](../../notes/05_delivery/02_publishing-ssg.md)):
    - [ ] Build stage `FROM oven/bun:1-debian`: install `curl`, `ca-certificates`; install agentks with the official script and `--no-shell-setup`; `ARG AGENTKS_VERSION` passed to `--version` so builds are repeatable; `COPY . /site`; `RUN --mount=type=cache,target=/root/.agentks/libraries agentks build --out /out`.
    - [ ] Serve stage `FROM nginx:alpine`: copy `/out` to the web root and the nginx config.
- [ ] **nginx config** (`nginx.conf` beside the Dockerfile):
    - [ ] Clean URLs: `try_files $uri $uri/ $uri/index.html =404;` and `error_page 404 /404.html;`.
    - [ ] Long cache for hashed files: `/_assets/`, `/_content/`, `/_lib/` → `Cache-Control: public, max-age=31536000, immutable`; HTML → `no-cache`.
    - [ ] The library sandbox: `.html` and `.svg` under `/_lib/` get `Content-Security-Policy: sandbox allow-scripts` ([120/50](../120_libraries/50_lib-route-and-sandbox.md)).
    - [ ] `X-Content-Type-Options: nosniff`; gzip (and brotli if the image supports it) for text types.
    - [ ] A commented block showing how to serve under a prefix (`--base /docs`).
- [ ] **Test** in CI: `docker build` on the template and on a fixture project, run the container, crawl it, check headers.
- [ ] **Placement**: the project root, beside `config/` (so `docs/Dockerfile` with the default path); `.dockerignore` with `dist/`, `.git/`, `config/.env`.

## Guardrails
- The running image holds nothing but nginx and static files.
- agentks never overwrites a user's Dockerfile; `init` copies it once.

## Done when
- `docker build -t t . && docker run -p 8080:80 t` serves the fixture site with working links and the expected cache and sandbox headers (checked by the CI test).

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system` (`docs/Dockerfile`, a test in CI); the template copy in the library repository via [120/85](../120_libraries/85_templates.md).

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), section 09.
- [Templates and init](../../notes/04_ecosystem/04_templates-and-init.md), section 04.
- [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md).
- [The Docker design from the Go issue](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md).

**Depends on:** [150/10 agentks build](./10_agentks-build.md), [160/10 installer](../160_distribution/10_installer-and-release-workflow.md) (the install script and `--version`).
**Unblocks:** [120/85 templates](../120_libraries/85_templates.md), [195/00 hosting](../195_hosting/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): no Docker image is published; a basic Dockerfile ships with the docs and the default template for users to change ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Proposed (claude, 2026-09-30): the cache mount for libraries (same note). Build as proposed.

# 05 Notes & Analysis
## Watch out
- The install script URL `https://agentks.neuralabs.org/install.sh` only exists after launch step 5. Until then use the GitHub release URL, and switch once the site is live.
