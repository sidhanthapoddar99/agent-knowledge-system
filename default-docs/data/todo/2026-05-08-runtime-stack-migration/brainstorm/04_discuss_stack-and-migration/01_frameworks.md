---
title: "Framework comparison — Astro / Next.js / Go+Vite / 100 % Rust"
sidebar_label: "01 · Frameworks"
---

> **Resolved →** decided on **Go + Vite**; formalized in `notes/architecture/` (the design) and captured as this issue's plan (`issue.md`).

# Framework comparison — what we considered

The conversation that opened the migration question started with "we couldn't fix the SSR isolation bug in Astro — does Astro still make sense?" and moved through four candidate stacks. This note captures the comparison so we don't re-derive it later.

## The four candidates

| Stack | What it is | Where it shines | Where it hurts |
|---|---|---|---|
| **Astro (stay)** | Current code | Familiar; works for content; islands are good | SSR module isolation; dev-mode reliance; restart-fix bugs; Node/Bun dep |
| **Next.js App Router** | React + Vercel-flavoured SSR | Mature SSR + caching; edge / node / static; React ecosystem; "use client" boundary is explicit | Full React buy-in; Vercel-shaped opinions; node runtime in prod; bundle size |
| **Go + Vite (custom)** | Go server, Vite-built islands embedded into binary | Single binary; sub-100ms cold start; no SSR graph at all; trivial cross-compile; smallest deploy footprint | Build everything ourselves; Go has no JSX-style components on the server (use templates); Yjs server-side via y-go (less mature than yrs) |
| **100 % Rust (Leptos / Dioxus)** | Rust backend + Rust-to-WASM frontend | Strongest type system; one language; fastest possible runtime; pure cargo toolchain | Slow compile cycle; large WASM bundle (~150 KB+); CodeMirror has no Rust+WASM equivalent — editor surface forces JS island anyway, so "100 % Rust" becomes "Rust + a JS editor" |

## What we ranked them on

- **Architectural fit** — does the stack's primitives match the problem we have (long-running server, file watcher, derived caches, embedded git, multi-mode rendering)?
- **Migration cost** — how many engineer-weeks to reach feature parity?
- **Daily dev experience** — compile speed, HMR, debuggability, log clarity.
- **Editor story** — CodeMirror + Yjs is a huge surface; what does each stack force on it?
- **Distribution** — what does the user have to install? How big is the artifact?

## Final ranking (with rationale)

| # | Stack | Why this rank |
|---|---|---|
| **1** | **Go + Vite** | Cleanest architectural fit. SSR isolation simply doesn't exist (one process, one module graph). Embedded Vite dist gives single-binary distribution. CodeMirror works as-is in the bundled JS. Migration cost ~14–18 weeks; after that, ongoing maintenance drops dramatically. |
| **2** | **Rust backend + Vite/TS frontend** | Same architectural wins as Go with tighter type safety. Compile times hurt dev velocity. Worth choosing only if we're confident Rust will also own the editor backend (shared crates with `2026-04-26-editor-as-standalone-product`). |
| **3** | **Next.js App Router** | Half the migration cost (~8 weeks); mature; battle-tested. Solves SSR isolation by virtue of having a real server runtime. But bigger artifact, mandatory React, and Vercel-shaped opinions. The "stop the bleeding" answer. |
| **4** | **Astro (stay)** | Only if migration is genuinely impossible right now. The bug we triggered this conversation with (`05_issue.md`) is structural, not incidental. |
| **5** | **100 % Rust** | Most fun to think about, worst to ship at this scope. The CodeMirror cliff is the killer — "100 % Rust" collapses to "Rust + a JS editor island," defeating the philosophical point. |

## What we explicitly rejected and why

- **Pure Astro tweaks** (caching middleware, restart-on-commit hooks). The bug is structural to Vite's SSR module graph; tweaks paper over symptoms. Confirmed during the SSR-isolation debugging session — see `05_issue.md`.
- **Pure Rust SSG** (Zola-style). Loses the dynamic-route + theme-switching story; would force every change to rebuild the whole site. Doesn't fit the live-editor + dev-mode workflow.
- **Hybrid Astro-but-with-Rust-cache** (sidecar process for the cache). Adds a process boundary, doesn't address the fundamental Vite SSR-graph problem, complicates dev-server lifecycle.

## Where this leaves us

The unanimous-on-architecture answer is **Go + Vite**. The cost is real (~14–18 weeks of focused work) but pays back in: zero-dep distribution, sub-100ms cold start, the bug class we're stuck on now becomes impossible by construction, and a stable substrate for everything else on the roadmap.

Next.js is the contingency answer if the team can't commit ~14 weeks. It's worse architecturally but ships faster.

## Companion notes

- **`02_architecture.md`** — what survives the migration (config, themes, layouts, custom pages — all of it).
- **`03_migration.md`** — how the migration unfolds; ordering; risk surface.
- **`04_support.md`** — what end-users + framework devs need installed.
- **`05_issue.md`** — the SSR-isolation bug that started the thread.
