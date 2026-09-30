---
title: "Hosting — overview"
status: open
---

agentks's website goes live at agentks.neuralabs.org: the homepage at `/`, the docs at `/docs`, and the install scripts as redirects to the GitHub release. It is a fully static site built by one Dockerfile and served by nginx. This group is launch step 5. **It needs sidhantha's hands**: the DNS for neuralabs.org, the hosting account, and the deploy secrets belong to sidhantha's organisation, not Claude. Each leaf says exactly which steps are sidhantha's and which Claude prepares, so the handover is a short checklist rather than a discussion.

# 01 To Do

| Leaf | Delivers | Who | Status |
|---|---|---|---|
| [195/10 Domain and DNS](./10_domain-and-dns.md) | agentks.neuralabs.org resolves to the host, with TLS | sidhantha sets the records; Claude specifies them and verifies | open |
| [195/20 Build and deploy pipeline](./20_build-and-deploy-pipeline.md) | The Dockerfile, nginx config and the CI workflow that builds and deploys | Claude builds it; sidhantha provisions the host and adds secrets | open |
| [195/30 Docs at /docs](./30_docs-at-slash-docs.md) | The docs built under the `/docs` base with every link working | Claude | open |
| [195/40 Monitoring and rollback](./40_monitoring-and-rollback.md) | Smoke tests after deploy, uptime checks, a one-command rollback | Claude builds it; sidhantha owns the monitor account | open |

**Order of work.** 20 and 30 can be built and tested locally long before launch (the image runs on any machine). 10 and the host side of 20 happen at launch, with sidhantha. 40 follows the first deploy.

## Guardrails
- Claude never creates accounts, changes DNS, or stores secrets in the repository. Those are sidhantha's steps; Claude writes the exact instructions.
- Nothing on the site runs server code. nginx serves files and redirects.
- The site builds the docs with a **released** agentks, pinned by version, so it shows what users get.

## Done when
- https://agentks.neuralabs.org/ serves the homepage and https://agentks.neuralabs.org/docs/ serves the docs, over TLS.
- `curl -I https://agentks.neuralabs.org/install.sh` returns a 302 to the latest release asset.
- A push that changes `docs/` deploys automatically, and a rollback to the previous image has been rehearsed once.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folders `docs/` (the Dockerfile and nginx config) and `.github/workflows/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`).
- **Read first:**
  - [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md) — routes, the Dockerfile, nginx, the deploy shape, latest docs only.
  - [Publishing](../../notes/05_delivery/02_publishing-ssg.md) — `agentks build` and its output.
  - [Launch order and hosting](../../brainstorm/02_future-stages/10_launch-order-and-hosting.md).
  - [Permissions and repositories](../../agent-memory/permissions-and-repositories.md) — "the hosting work itself needs sidhantha".
- **Depends on:** [150/10 agentks build](../150_publishing/10_agentks-build.md), [190/00 homepage](../190_homepage/00_overview.md), [180/00 documentation](../180_documentation/00_overview.md), [160/10 installer and release workflow](../160_distribution/10_installer-and-release-workflow.md).
- **Unblocks:** [070/50 docs command](../070_cli/50_docs-command.md) ships with the live site; [200/20 switch-over](../200_launch/20_switch-over.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the domain is agentks.neuralabs.org; `/` is the homepage, `/docs` the docs ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (sidhantha, 2026-09-30): a Dockerfile builds both parts and serves them with nginx.
- Decided (sidhantha, 2026-09-30): the hosting work needs sidhantha; Claude prepares everything else ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).
- Decided (claude, 2026-09-30): `agentks docs` ships when the site is live, at launch step 5.

# 05 Notes & Analysis

## Watch out
- The host and registry are still open ([open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md)). Build everything so it runs on any container host; the host-specific part is one deploy step.
