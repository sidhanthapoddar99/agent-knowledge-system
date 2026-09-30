---
title: "Homepage: the app scaffold in apps/agentks-homepage"
status: review
---

The homepage app itself: a Next.js project with static export, in the main repository's `apps/agentks-homepage`, built with Bun and wired into `ctl` and the gate like every other app. This leaf sets up the empty, working app so [190/30 sections](./30_sections.md) only adds content and components.

# 01 To Do
- [x] **Create the app** in `apps/agentks-homepage/` with the latest stable Next.js (16.3.8 on 2026-09-30; check `npm view next version`), React 19, TypeScript and the App Router.
    - [x] `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true` (so each page is `<path>/index.html`, matching nginx's `try_files $uri $uri/`).
    - [x] Styling: Tailwind CSS (latest, 4.3.3 on 2026-09-30) or plain CSS modules. Whichever is chosen, colours, fonts and spacing come from CSS variables shared with the docs ([40](./40_shared-look-with-docs.md)), never hardcoded in components.
    - [x] Bun as package manager (`bun.lock` committed). Node stays available for Next's own binaries, as the org homepage's Dockerfile notes.
- [x] **Wire into the monorepo.**
    - [x] No JS workspace: the app owns its `package.json` and `bun.lock`.
    - [x] `ctl dev` can start it (`ctl dev homepage`), `ctl build` exports it to `apps/agentks-homepage/out/`.
    - [x] `ctl gate` runs its lint (oxlint with the nextjs, react and jsx-a11y plugins), its typecheck (`next typegen && tsc --noEmit`) and `bun test`. The checks from [60](./60_homepage-checks.md) join when 60 builds them.
- [x] **A placeholder page** with the site shell (header with the logo and links to `/docs` and GitHub, footer), light and dark mode, so hosting can be tested before the content lands.
- [x] **A README section** in the app: how to run it, how it is deployed, that it must stay static.
- [x] **`.gitignore`**: `out/`, `.next/`, `node_modules/`.

## Guardrails
- No server features: no route handlers, no middleware, no `getServerSideProps`, no ISR, no `next/image` optimisation. `next build` must succeed with `output: 'export'`.
- No routes under `/docs`, and no `install.sh` or `install.ps1` at the root of `out/`. The homepage owns the root `llms.txt` ([50](./50_seo-and-metadata.md)); only `/docs/llms.txt` belongs to the docs build.
- Dependencies at their latest stable versions; add as few as possible.

## Done when
- `ctl build` produces `apps/agentks-homepage/out/index.html` and `out/404.html`.
- `ctl gate` passes with the homepage's lint and typecheck included.
- `bunx serve apps/agentks-homepage/out` (or any static server) shows the placeholder page in light and dark mode with no console errors.

# 02 Status and Result
Review. The app builds, exports and is wired into `ctl` and the gate; `ctl gate` is green.

## Result

On the main repo's `main` branch:

- `apps/agentks-homepage/`: Next.js 16.3.8, React 19.3.0, TypeScript 7.0.2, App Router. `next.config.ts` sets `output: 'export'`, `trailingSlash: true`, `images.unoptimized`. Its own `package.json` and `bun.lock`; `.oxlintrc.json` (the complexity floor plus the react, typescript, nextjs and jsx-a11y plugins); `README.md` (how to run it, how it is deployed, why it stays static).
- `.mise.toml` pins Bun 1.4.2 and Node 24.21.0 and sets `NEXT_TELEMETRY_DISABLED=1`. `ctl setup` installs the app's packages through the existing manifest discovery.
- `ctl build` builds every app (engine, then homepage). `ctl build homepage` runs `next build` and checks that `out/index.html` and `out/404.html` exist: 55 files in about 2.5 s. Workers: `scripts/build/build.sh` (routes by app), `scripts/build/homepage.sh`.
- `ctl dev homepage` runs `next dev` in the foreground (`scripts/dev/dev.sh`).
- `ctl gate lint | typecheck | test` include the homepage: `oxlint src`, `next typegen && tsc --noEmit`, `bun test`. The whole gate (engine included) takes under 2 s on a warm machine.
- `.gitignore` ignores `apps/agentks-homepage/out/` and `apps/agentks-homepage/next-env.d.ts`; `.next/` and `node_modules/` were already ignored.
- AGENTS.md records the stack, the skeleton, the new commands and the deferrals.
- Checked by hand: the export served from a static server shows the page in light and dark with no layout overflow at 360 px (Playwright screenshots at 1440 and 360 px).

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
- Decided (claude, 2026-09-30): no Bun workspace. The app owns its `package.json` and `bun.lock`, because the project-setup rule is no JS workspace and `ctl check` fails one; shared code later goes in `apps/packages/` and is linked.
- Decided (claude, 2026-09-30): oxlint instead of ESLint with the Next config, because it lints the app in about 0.1 s and `ctl check` expects every TypeScript app to ship `.oxlintrc.json`. Its nextjs, react and jsx-a11y plugins cover the Next and accessibility rules.
- Decided (claude, 2026-09-30): CSS modules and plain CSS variables, not Tailwind, because the tokens must carry the docs theme contract's names so 190/40 can share them, and a second naming layer would add a step without adding a rule.
- Decided (claude, 2026-09-30): TypeScript 7.0.2 (the current latest). `next build` and `tsc` both work with it.
- Decided (claude, 2026-09-30): the typecheck is `next typegen && tsc --noEmit`, and `next-env.d.ts` is ignored, because Next rewrites that file to import generated files under `.next/`, which a clean clone does not have. The typegen step takes about 0.2 s.
- Decided (claude, 2026-09-30): `next build` runs in `ctl build`, not in the gate, so the gate stays fast. Recorded as a deferral in AGENTS.md.
- Decided (claude, 2026-09-30): `ctl dev` is a small foreground worker that runs only the homepage. The full dev controller from project-setup replaces it when the engine has a server to run.
- Decided (claude, 2026-09-30): the theme mode uses the `theme` key in `localStorage` and `data-theme` on `<html>`, the same as today's docs engine, so 190/40 starts from a match.

# 05 Notes & Analysis

## Watch out
- Next's static export fails at build time on any server-only feature. That is the point: let the build fail rather than add a workaround.
