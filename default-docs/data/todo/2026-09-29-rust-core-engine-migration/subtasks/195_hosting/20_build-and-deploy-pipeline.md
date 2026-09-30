---
title: "Hosting: the website image and its deploy pipeline"
status: open
---

One Docker image serves the whole website: it builds the homepage with Next.js, builds the docs with a pinned, released agentks, and serves both with nginx. A GitHub Actions workflow builds the image when the site's sources change or a new agentks is released, pushes it to a registry, and tells the host to run it. Claude writes and tests all of that locally; sidhantha provisions the host and adds the secrets the workflow needs.

# 01 To Do
- [ ] **Claude: `docs/Dockerfile`** — three stages, as sketched in the note: homepage (Bun, `bun install --frozen-lockfile && bun run build`), docs (install agentks at `AGENTKS_VERSION` with `--no-shell-setup`, `agentks install` for libraries, `agentks build --base /docs --site-url https://agentks.neuralabs.org --out /out/docs`), serve (`nginx:alpine` with both outputs). Build context is the repository root.
    - [ ] Use a build cache mount for `~/.agentks/libraries`.
    - [ ] Keep Node in the homepage stage if Next's binaries need it (the org homepage's Dockerfile explains why).
- [ ] **Claude: `docs/nginx.conf`** — the routes and cache rules from the note: `/install.sh` and `/install.ps1` as 302 redirects to the latest release assets on `NeuraLabsHQ/agent-knowledge-system`; hashed assets cached for a year; HTML `no-cache`; `try_files` for clean URLs; separate 404 pages for `/` and `/docs/`; security headers (`X-Content-Type-Options`, `Referrer-Policy`, a Content-Security-Policy that allows the islands and sandboxed library frames).
- [ ] **Claude: test locally** — `docker build -f docs/Dockerfile .` then `docker run -p 8080:80` and walk the smoke checks from [40](./40_monitoring-and-rollback.md) against `http://localhost:8080`.
- [ ] **Claude: `.github/workflows/website.yml`** —
    - [ ] Triggers: pushes to the default branch touching `docs/**`, `apps/agentks-homepage/**`, `docs/Dockerfile` or `docs/nginx.conf`; a published installer release; manual dispatch.
    - [ ] On pull requests touching the same paths: build only, plus the link check, no push. A broken link blocks the merge.
    - [ ] Build with `AGENTKS_VERSION` set to the latest stable release, tag the image with the commit SHA and `latest`, push to the registry.
    - [ ] Deploy: one host-specific step (a webhook, `ssh … docker compose pull && up -d`, or the platform's action), then the smoke checks against the live URL.
- [ ] **Proposed registry: GitHub Container Registry**, `ghcr.io/neuralabshq/agentks-website`, because the workflow can push with its own `GITHUB_TOKEN` and no extra account. sidhantha confirms or names another.
- [ ] **sidhantha: choose and provision the host** (a small VM with a TLS proxy, or a container platform), give it pull access to the registry, and add the deploy secrets to the repository's Actions secrets (for example `DEPLOY_HOST`, `DEPLOY_SSH_KEY`, or a platform token). Claude writes the exact list once the host is chosen.
- [ ] **A compose file for a VM host** (`docs/deploy/compose.yaml`): the website container on port 80 behind Caddy (automatic HTTPS), if a VM is chosen.

## Guardrails
- No secret in the repository, the image or the workflow file. Secrets live only in GitHub Actions secrets and the host.
- The docs are built with a released agentks, never the working tree.
- The image holds only static files and nginx; no build tools in the final stage.

## Done when
- `docker build -f docs/Dockerfile .` succeeds locally and the container serves `/`, `/docs/` and the install redirects correctly.
- The workflow builds and pushes on a test push, deploys to the host, and its smoke checks pass against https://agentks.neuralabs.org.
- A pull request with a broken docs link fails the website check.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, files `docs/Dockerfile`, `docs/nginx.conf`, `docs/deploy/`, `.github/workflows/website.yml`.
- **Read first:**
  - [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), sections 01 to 04 — the Dockerfile and nginx sketches this leaf implements.
  - [Distribution and install](../../notes/05_delivery/04_distribution-and-install.md) — the installer flags (`--version`, `--no-shell-setup`).
  - The org homepage's working Dockerfile and nginx config: `/home/sid/projects/06_02_NeuraLabs/neuralabs-homepage/Dockerfile` and `nginx.conf`.
  - [The Docker design from the Go issue](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md).
- **Depends on:** [150/10 agentks build](../150_publishing/10_agentks-build.md), [150/70 Dockerfile](../150_publishing/70_dockerfile.md) (the user-facing Dockerfile pattern this one follows), [190/20 app scaffold](../190_homepage/20_app-scaffold.md), [160/10 installer and release workflow](../160_distribution/10_installer-and-release-workflow.md).
- **Unblocks:** [195/10 domain and DNS](./10_domain-and-dns.md) (the host), [195/40 monitoring and rollback](./40_monitoring-and-rollback.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): a Dockerfile builds both parts (`agentks build` for the docs) and serves them with nginx ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (sidhantha, 2026-09-30): the install URL on agentks.neuralabs.org only redirects to the GitHub release.

# 05 Notes & Analysis

## 01 The split between sidhantha and Claude

| Step | Who |
|---|---|
| Dockerfile, nginx config, compose file, workflow | Claude |
| Local build and smoke test | Claude |
| Choosing the host, creating the account | sidhantha |
| Registry access for the host, Actions secrets | sidhantha |
| First deploy and live smoke test | Claude runs the workflow; sidhantha watches the first one |

## Watch out
- The release asset names in the nginx redirects must match what the release workflow uploads ([160/10](../160_distribution/10_installer-and-release-workflow.md)). Test the redirect targets with `curl -IL`.
- The docs stage installs agentks from GitHub at build time; pin `AGENTKS_VERSION` so a rebuild of an old commit gives the same site.
