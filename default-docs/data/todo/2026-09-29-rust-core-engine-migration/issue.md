---
title: "Engine migration — Astro → Rust core + TS/Vite frontend"
---

# Goal

Replace the Astro engine with a **Rust engine** and a **prebuilt Vite single-page app**, and ship both inside the `agentks` binary. One install serves every project on the machine.

agentks is a local tool for one or two developers at a time. The Rust engine watches files, indexes the site, renders content and computes every rule; the CLI uses the same code, so the rules stop living in two languages. The frontend shows everything Rust sends over one WebSocket: every layout, diagrams, the issue tracker UI, the video player and, in Phase 2, editing. Publishing a site for search engines is Phase 3: `agentks build` generates static HTML once (SSG) from the same layout components the local app uses. See [the architecture note](./notes/01_initial_discussion/17_local-spa-over-websocket.md).

## Context

- **Where this came from.** A discussion on 2026-09-29 that started with narrated video pages (the video player spike on branch `spike/narrated-video`). It widened into how big the codebase is getting and whether the engine should move to Rust. Every point raised is recorded in [the initial discussion notes](./notes/01_initial_discussion/01_index.md), and phase 2 onwards in [future stages](./notes/02_future-stages/01_index.md).
- **Prior art.** [2026-05-08-runtime-stack-migration](../2026-05-08-runtime-stack-migration/issue.md) proposed the same shape with **Go**. Its [feasibility audit](../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/01_summary.md) found the rewrite technically sound but unjustified at the time: 6–12 months of work, and a performance case that did not survive measurement. This issue has to answer that audit, not ignore it. See [the why and the prior audit](./notes/01_initial_discussion/02_why-and-prior-audit.md).
- **What changed since the audit.** Its advice was carried out: [2026-08-07-astro-7-and-load-time-refactor](../2026-08-07-astro-7-and-load-time-refactor/issue.md) upgraded to Astro 7 and fixed the trigger and all ten defects the audit found.
- **What is different now.** The Rust CLI has grown into a second implementation of engine rules (frontmatter, links, issues). The user wants one install for many projects, forced migrations, no custom layouts, and a simpler config. Those change the cost and the payoff.

## Done when

This issue is in its discussion stage. The discussion stage is done when:

- every question in [open questions](./notes/01_initial_discussion/16_open-questions.md) has a decision or is parked with a reason;
- the phases in [phasing](./notes/01_initial_discussion/15_phasing.md) are agreed and turned into a plan under `plans/`;
- the prior audit's findings are answered point by point.

## Scope decisions

- **Phase 1, rendering:** the Rust engine, the Rust server with one WebSocket, the Vite single-page app (mobile and PWA friendly) with every built-in layout, its layouts and components in a shared package that the Phase 3 static build reuses, the config and `.env` change, the `~/.agentks/` home and build cache, the `agentks` rename, forced migrations (scripts fetched from git, not built into the binary), dropping custom layouts. Done when the new engine shows every page with the same correct results as today.
- **Phase 2:** the new editing mode in the reading view (the current editor is discarded), the dev toolkit, and libraries: GitHub repositories or local folders listed in `config/dep.yaml`, pinned in `config/dep.lock` and cached once per machine. 1.0.0 ships after Phases 1 and 2. See [future stages](./notes/02_future-stages/01_index.md).
- **Phase 3, publishing:** `agentks build`, static site generation from the shared components (JavaScript only for interactive parts), a fully static site for nginx, any static host or a CDN (with a basic Dockerfile for users), search-engine friendly, with no Rust server. Until it ships, publishers stay on the last 0.x release, pinned with mise.
- **Launch:** the move to the neuralabshq organisation, a new main repository and a separate default-library repository ([repositories and three states](./notes/02_future-stages/12_repositories-and-three-states.md)), the homepage and the docs at agentks.neuralabs.org, and the archival of this repository, in the order in [the launch note](./notes/02_future-stages/10_launch-order-and-hosting.md).
- **Later stages:** multi-user editing and the auth it needs; agent hooks and retrieval; a GitHub issues layout with machine-level GitHub sign-in; extensions that add `agentksx` commands or site scripts.
- **Tracked separately:** narrated video pages and their audio, in [2026-09-29-narrated-video-pages](../2026-09-29-narrated-video-pages/issue.md).
- **Out:** motion-graphics video (Remotion or HyperFrames level), custom user layouts, server-side page templates, a WASM build of the core, HTMX.

Related: [2026-05-08-runtime-stack-migration](../2026-05-08-runtime-stack-migration/issue.md) · [2026-04-26-framework-as-cli-tool](../2026-04-26-framework-as-cli-tool/issue.md) · [2026-04-26-project-rebrand](../2026-04-26-project-rebrand/issue.md)
