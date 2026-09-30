---
title: "Homepage — overview"
status: in-progress
---

agentks gets its own homepage at agentks.neuralabs.org/: a static marketing page that says what agentks is, shows it, and gets a visitor to install it or read the docs at `/docs`. It is a Next.js app in the main repository (`apps/agentks-homepage`), exported as static files and served by the same nginx as the docs. It is launch step 3 and can be built alongside the engine work, because it depends on nothing but the product's story and the brand. The homepage is open source.

# 01 To Do

| Leaf | Delivers | Status |
|---|---|---|
| [190/10 Content and design](./10_content-and-design.md) | The message, the copy and the design plan | review |
| [190/20 App scaffold](./20_app-scaffold.md) | `apps/agentks-homepage`: Next.js static export, wired into `ctl` and the gate | review |
| [190/30 Sections](./30_sections.md) | The page itself: the workspace story, seven chapters, the issue structure, agents, principles, install | review |
| [190/40 Shared look with the docs](./40_shared-look-with-docs.md) | One brand across `/` and `/docs`: tokens, logo, fonts, theme toggle, navigation | in-progress |
| [190/50 SEO and metadata](./50_seo-and-metadata.md) | Titles, social cards, sitemap, robots, `llms.txt` | review |
| [190/60 Homepage checks](./60_homepage-checks.md) | Lighthouse, accessibility, links, screenshots in the gate | open |

**Order of work.** 10 first: the words and the design plan decide everything else. 20 can run beside 10. 30 builds on both. 40 needs the docs theme tokens from [100/10](../100_layouts/10_theme-contract-and-css.md). 50 and 60 finish it.

## Guardrails
- Static export only: no API routes, no middleware, no server rendering at request time, no image optimisation server. nginx serves files.
- The homepage never holds docs content. Anything a user needs to *use* agentks belongs in `/docs`; the homepage links to it.
- Every claim on the page is true of the released version. No "coming soon" features presented as shipped.
- Follow the frontend-design skill's process: a design plan, a review of the plan against generic defaults, then the build, then a critique with screenshots.

## Done when
- `ctl build` exports the homepage to static files, and `ctl gate` includes its lint, typecheck and checks.
- The page is served at `/` in the website image ([195/20](../195_hosting/20_build-and-deploy-pipeline.md)) with `/docs` working beside it.
- sidhantha has reviewed the page and every leaf is in `review` or closed.

# 02 Status and Result
In progress. The page was rebuilt around agents on 2026-10-01 (wave3/homepage-3, merged into `main` at `a9c94b9`). 10, 20, 30 and 50 are in review; 40 is in progress; 60 is open.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`). Claude commits there freely.
- **Read first:**
  - [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md) — routes, the Dockerfile, nginx.
  - [Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) — where the homepage lives and what it must not hold.
  - [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md) — step 3.
  - [System overview](../../notes/01_overview/02_system-overview.md) — the product story.
  - The org's existing homepage as a stack reference: `/home/sid/projects/06_02_NeuraLabs/neuralabs-homepage` (Next.js with `output: 'export'`, Bun, Tailwind, a Dockerfile that builds with Bun and serves with nginx).
- **Depends on:** [010/20 main repo skeleton](../010_project-setup/20_main-repo-skeleton.md), [010/40 ctl and gate](../010_project-setup/40_ctl-and-gate.md).
- **Unblocks:** [195/00 hosting](../195_hosting/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the homepage is a Next.js static build served at `/`; the docs are at `/docs` ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (sidhantha, 2026-09-30): the homepage is open source and lives in the main repository.
- Decided (sidhantha, 2026-09-30): the homepage gets its own group of subtasks.

# 05 Notes & Analysis

## Watch out
- `/` catches every path the docs do not. A homepage route named `docs` (or a folder `out/docs/`) would shadow the docs in nginx. Keep the homepage's routes out of `/docs`, `/install.sh`, `/install.ps1` and `/llms.txt` unless deliberately owned.
