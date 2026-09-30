---
title: "Initial discussion — index"
---

The first discussion of this migration, on 2026-09-29, split into one note per point. Every point the user raised is here, along with the pushback and additions from claude. Lines marked **Decided** are the user's decisions. Anything marked as proposed by claude is not agreed yet. The questions still open are in [open questions](./16_open-questions.md). Phase 2 and later stages have their own folder: [future stages](../02_future-stages/01_index.md).

# 03 References

- [issue.md](../../issue.md)
- [2026-05-08-runtime-stack-migration](../../../2026-05-08-runtime-stack-migration/issue.md) — the earlier Go version of this idea, and its audit.

# 04 Decisions

The decisions live in each note. The headline ones:

- Decided (sidhantha, 2026-09-29): Rust core and back end, TypeScript/Vite frontend, one global install.
- Decided (sidhantha, 2026-09-29): agentks is a local tool; the frontend is a single-page app over one WebSocket; rules stay in Rust; no templates, no WASM.
- Decided (sidhantha, 2026-09-29): Phase 1 renders, Phase 2 adds editing and the dev toolkit, Phase 3 publishes as a static site. Publishers stay on 0.x until Phase 3.
- Decided (sidhantha, 2026-09-30): later decisions — libraries, the Neuralabs launch, the repositories, SSG publishing — are recorded in [future stages](../02_future-stages/01_index.md).
- Decided (sidhantha, 2026-09-29): forced migrations; older versions pinned with mise.
- Decided (sidhantha, 2026-09-29): no custom layouts; branding through CSS; more built-in layouts on demand.
- Decided (sidhantha, 2026-09-29): multi-user editing and auth move to the next phase.

# 05 Notes & Analysis

## 01 The notes

| Note | What it covers |
|---|---|
| [01/02 Why, and the prior audit](./02_why-and-prior-audit.md) | The reasons for the move, and what the Go feasibility audit measured |
| [01/03 Rust engine and Vite frontend](./03_rust-core-and-vite-frontend.md) | What Rust owns, what the frontend owns, rendering fidelity |
| [01/04 WASM and HTMX](./04_wasm-and-htmx.md) | Why neither is used |
| [01/05 One install](./05_single-install-tool-engine-frontend.md) | agentks as tool + engine + published frontend, installed once per machine |
| [01/06 Config folder and .env](./06_config-folder-and-env.md) | Mandatory `config/`, `.env` inside it, ports only |
| [01/07 ~/.agentks and the build cache](./07_agentks-home-and-build-cache.md) | The global home, the per-project cache, shared libraries, the manual cleanup |
| [01/08 The agentks rename and commands](./08_cli-rename-and-commands.md) | The new name, `agentks ps` and other commands |
| [01/09 Server and WebSocket](./09_server-websockets-and-editing.md) | axum, one WebSocket for pull and push, dev and production serving, localhost default |
| [01/10 CSS and theming](./10_css-and-theming.md) | Listing the compiled CSS, the override skill, class names as a contract |
| [01/11 Layouts](./11_layouts.md) | Custom layouts dropped, built-in layouts on demand |
| [01/12 Versioning and forced migrations](./12_versioning-and-forced-migrations.md) | Forced migrations, mise pinning, migration scripts fetched from git, release streams, 1.0.0 |
| [01/13 Performance and size](./13_performance-and-size.md) | What gets faster and smaller, and what does not |
| [01/14 Video and narration audio](./14_video-and-narration-audio.md) | What the migration does for video pages, TTS audio in the cache |
| [01/15 Phasing](./15_phasing.md) | The phases, the launch order, and claude's proposed steps inside Phase 1 |
| [01/16 Open questions](./16_open-questions.md) | What to settle next |
| [01/17 The architecture: a local SPA over WebSocket](./17_local-spa-over-websocket.md) | The central design: Rust computes, the frontend displays, one WebSocket, hash-versioned caching |
| [01/18 Impact on other issues](./18_impact-on-other-issues.md) | Every active issue sorted as partial, rework, obsolete or unaffected, with what to pause |
