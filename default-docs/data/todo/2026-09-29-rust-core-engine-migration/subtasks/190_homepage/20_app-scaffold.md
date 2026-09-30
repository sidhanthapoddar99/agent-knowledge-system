---
title: "Homepage: the app scaffold in apps/agentks-homepage"
status: open
---

The homepage app itself: a Next.js project with static export, in the main repository's `apps/agentks-homepage`, built with Bun and wired into `ctl` and the gate like every other app. This leaf sets up the empty, working app so [190/30 sections](./30_sections.md) only adds content and components.

# 01 To Do
- [ ] **Create the app** in `apps/agentks-homepage/` with the latest stable Next.js (16.3.8 on 2026-09-30; check `npm view next version`), React 19, TypeScript and the App Router.
    - [ ] `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true` (so each page is `<path>/index.html`, matching nginx's `try_files $uri $uri/`).
    - [ ] Styling: Tailwind CSS (latest, 4.3.3 on 2026-09-30) or plain CSS modules. Whichever is chosen, colours, fonts and spacing come from CSS variables shared with the docs ([40](./40_shared-look-with-docs.md)), never hardcoded in components.
    - [ ] Bun as package manager (`bun.lock` committed). Node stays available for Next's own binaries, as the org homepage's Dockerfile notes.
- [ ] **Wire into the monorepo.**
    - [ ] The Bun workspace includes `apps/agentks-homepage`.
    - [ ] `ctl dev` can start it (`ctl dev homepage`), `ctl build` exports it to `apps/agentks-homepage/out/`.
    - [ ] `ctl gate` runs its lint (ESLint with the Next config), `tsc --noEmit`, and its checks from [60](./60_homepage-checks.md).
- [ ] **A placeholder page** with the site shell (header with the logo and links to `/docs` and GitHub, footer), light and dark mode, so hosting can be tested before the content lands.
- [ ] **A README section** in the app: how to run it, how it is deployed, that it must stay static.
- [ ] **`.gitignore`**: `out/`, `.next/`, `node_modules/`.

## Guardrails
- No server features: no route handlers, no middleware, no `getServerSideProps`, no ISR, no `next/image` optimisation. `next build` must succeed with `output: 'export'`.
- No routes under `/docs`, and no `install.sh`, `install.ps1` or `llms.txt` at the root of `out/` unless [50](./50_seo-and-metadata.md) deliberately adds a root `llms.txt`.
- Dependencies at their latest stable versions; add as few as possible.

## Done when
- `ctl build` produces `apps/agentks-homepage/out/index.html` and `out/404.html`.
- `ctl gate` passes with the homepage's lint and typecheck included.
- `bunx serve apps/agentks-homepage/out` (or any static server) shows the placeholder page in light and dark mode with no console errors.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-homepage/`.
- **Read first:**
  - [Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) — the monorepo layout and folder ownership.
  - [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md) — `ctl` verbs and the gate.
  - The org homepage for a working setup: `/home/sid/projects/06_02_NeuraLabs/neuralabs-homepage/next.config.ts`, `package.json` and `Dockerfile`.
  - [Toolchain versions](../../agent-memory/toolchain-versions.md).
- **Depends on:** [010/20 main repo skeleton](../010_project-setup/20_main-repo-skeleton.md), [010/40 ctl and gate](../010_project-setup/40_ctl-and-gate.md).
- **Unblocks:** [190/30 sections](./30_sections.md), [195/20 build and deploy pipeline](../195_hosting/20_build-and-deploy-pipeline.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the homepage is a Next.js static export in `apps/agentks-homepage` ([repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md)).
- Decided (claude, 2026-09-30): `trailingSlash: true`, so the export writes `<path>/index.html` like `agentks build` does, and one nginx rule serves both.

# 05 Notes & Analysis

## Watch out
- Next's static export fails at build time on any server-only feature. That is the point: let the build fail rather than add a workaround.
