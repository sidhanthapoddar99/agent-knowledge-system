---
title: "Deployment and hosting: agentks.neuralabs.org"
---

agentks's website is **agentks.neuralabs.org**, and it is a fully static site. The homepage is served at `/`: a Next.js app in `apps/agentks-homepage`, exported as static files. The docs are served at `/docs`: agentks's own `docs/` folder, built with `agentks build` like any user's project. That makes the website the first real user of Phase 3. Only the latest docs are published; there are no older versions. The install scripts at `/install.sh` and `/install.ps1` redirect to the GitHub release, so the website never serves a binary itself. One Dockerfile builds both parts and serves them with nginx. Nothing on the site runs server code. It goes live at step 5 of the launch, after the homepage and the docs rewrite are done and Phase 3 has shipped `agentks build`. `agentks docs` ships at the same time, because before that it would open a page that does not exist.

# 03 References

- [Publishing](./02_publishing-ssg.md) — `agentks build`, the output layout and the Dockerfile shape.
- [Docs rewrite and launch](./07_docs-rewrite-and-launch.md) — when the site goes live.
- [Repositories and layout](./01_repositories-and-layout.md) — `apps/agentks-homepage` and `docs/`.
- [Distribution and install](./04_distribution-and-install.md) — the install scripts the site redirects to.
- [Rust CLI](../02_engine/05_rust-cli.md) — the `agentks docs` command.
- [Brainstorm: launch order and hosting](../../brainstorm/02_future-stages/10_launch-order-and-hosting.md) and [the agentks docs command](../../brainstorm/02_future-stages/08_agentks-docs-command.md).
- [The Docker design from the Go issue](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) — nginx in front of a static build.
- [2026-04-26-project-rebrand](../../../2026-04-26-project-rebrand/issue.md) — its question on brand alignment with neuralabs.org is answered by this domain.

# 04 Decisions

- Decided (sidhantha, 2026-09-30): the domain is agentks.neuralabs.org.
- Decided (sidhantha, 2026-09-30): `/` is the homepage, a Next.js static build served by nginx. `/docs` is the docs, built with the Rust engine.
- Decided (sidhantha, 2026-09-30): a Dockerfile builds both (`agentks build` for the docs) and serves them with nginx. It is written later, not now.
- Decided (sidhantha, 2026-09-30): only the latest docs are published.
- Decided (sidhantha, 2026-09-30): the install URL on agentks.neuralabs.org only passes the request on to the GitHub release.
- Decided (sidhantha, 2026-09-30): `agentks docs` opens agentks.neuralabs.org/docs. The docs are not bundled or downloaded.
- Decided (claude, 2026-09-30): `agentks docs` ships when the site is live, at launch step 5.
- Decided (sidhantha, 2026-09-30): the homepage is open source and lives in the main repository.
- Proposed (claude, 2026-09-30), not yet agreed: the route table, the nginx config, the cache headers and the deploy pipeline in sections 02 to 06; raw markdown and `llms.txt` for agents; "since x.y" markers on docs pages.

# 05 Notes & Analysis

## 01 Routes

| Path | Served from | Built by |
|---|---|---|
| `/` and every other path outside the ones below | The homepage's static export | `next build` with static export, in `apps/agentks-homepage` |
| `/docs/…` | The docs' static build | `agentks build --base /docs --site-url https://agentks.neuralabs.org` in `docs/` |
| `/docs/…/index.md`, `/docs/llms.txt` | Raw markdown and the page list, for AI readers | The same `agentks build` |
| `/install.sh`, `/install.ps1` | A 302 redirect to the latest GitHub release's asset | nginx config |
| `/install.sh?version=X.Y.Z` (proposed) | A redirect to that release's asset | nginx config |

The docs are an ordinary agentks project: `docs/config/` with `site.yaml`, `dep.yaml` and `dep.lock`. Nothing about them is special-cased in the engine. If a feature agentks's own docs need is missing, users are missing it too.

## 02 The website's Dockerfile (claude, proposed)

```dockerfile
# docs/Dockerfile — builds the whole website

# 1. The homepage
FROM oven/bun:1 AS homepage
WORKDIR /src
COPY apps/agentks-homepage/ ./
RUN bun install --frozen-lockfile && bun run build        # static export → out/

# 2. The docs, with the released agentks (pinned for a repeatable build)
FROM oven/bun:1-debian AS docs
ARG AGENTKS_VERSION
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
 && curl -fsSL https://github.com/NeuraLabsHQ/agent-knowledge-system/releases/latest/download/install.sh \
    | sh -s -- --version "${AGENTKS_VERSION}" --no-shell-setup
ENV PATH="/root/.local/bin:${PATH}"
WORKDIR /site
COPY docs/ ./
RUN --mount=type=cache,target=/root/.agentks/libraries \
    agentks build --base /docs --site-url https://agentks.neuralabs.org --out /out/docs

# 3. Serve
FROM nginx:alpine
COPY docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=homepage /src/out/ /usr/share/nginx/html/
COPY --from=docs /out/docs/ /usr/share/nginx/html/docs/
```

- The build context is the repository root, so the Dockerfile can reach both `apps/agentks-homepage` and `docs/`.
- The homepage stage runs `bun install --frozen-lockfile` in the app's own folder, because the app owns its `package.json` and `bun.lock` and there is no workspace. It needs no network access for fonts: they come from `@fontsource` packages, not Google Fonts.
- The docs are built with a **released** agentks, pinned by `AGENTKS_VERSION`, not the working tree. The website shows what users get.
- Production runs only the nginx stage.

## 03 nginx (claude, proposed)

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;

  location = /install.sh  { return 302 https://github.com/NeuraLabsHQ/agent-knowledge-system/releases/latest/download/install.sh; }
  location = /install.ps1 { return 302 https://github.com/NeuraLabsHQ/agent-knowledge-system/releases/latest/download/install.ps1; }

  location ~* /_(assets|content|lib)/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location ~* \.html$                  { add_header Cache-Control "no-cache"; }

  location /docs/ { try_files $uri $uri/ /docs/404.html; }
  location /      { try_files $uri $uri/ $uri.html /404.html; }
}
```

| Rule | Why |
|---|---|
| Hashed assets cached for a year | Their names change when their content does |
| HTML revalidated on every request | A new publish shows at once |
| `try_files` with `$uri/` | Every page is `<path>/index.html`, so clean URLs work |
| Separate 404 pages | The docs' 404 has the docs' navigation |
| TLS | Terminated by the host's proxy or the CDN in front of nginx, not inside this container |

## 04 Where it runs, and how it deploys (claude, proposed)

- **Host.** Any container host or static host. The Dockerfile keeps the choice open: the same image runs on a small VM behind a TLS proxy, and the same files can go to a static host or a CDN without Docker.
- **Deploy.** A workflow in the main repository builds the image on every push to the default branch that touches `docs/`, `apps/agentks-homepage/` or `docs/Dockerfile`, and on every installer release (so the docs build with the newest binary). It pushes the image to the Neuralabs registry and the host pulls it.
- **Rollback.** Redeploy the previous image tag. The site holds no state.
- **Preview.** A pull request that changes `docs/` gets a build check, so a broken link blocks the merge before it reaches the site.

## 05 Latest docs only

- One version of the docs is published: the one on the default branch, built with the newest release.
- A page that describes a feature newer than 1.0.0 says the version it arrived in ("since 1.2"). A user on an older binary can tell what they lack.
- The CLI's automatic updates keep most users on the latest anyway.
- Publishers pinned to 0.x use this repository's docs, which stay readable after archival.

## 06 For agents

- Each page's raw markdown sits beside it (`/docs/<path>/index.md`), and `/docs/llms.txt` lists every page with its title and description. An agent can read the docs without a browser.
- The skills stay the agent's main manual. They link to hosted pages instead of a bundled user guide, because there is no framework checkout on the machine any more.

## 07 `agentks docs`

| Form | Opens |
|---|---|
| `agentks docs` | `https://agentks.neuralabs.org/docs` |
| `agentks docs <page>` (proposed) | One page, for example `agentks docs issues` |
| `agentks docs --print` (proposed) | Prints the URL instead of opening a browser, for agents and headless machines |

Offline, the command prints the URL and says it could not be reached. It never fails silently.

## 08 Open

- The exact host and registry, decided at launch step 5.
- The exact nginx layout, decided when step 5 comes.
- Both in [open questions and risks](../01_overview/05_open-questions-and-risks.md).
