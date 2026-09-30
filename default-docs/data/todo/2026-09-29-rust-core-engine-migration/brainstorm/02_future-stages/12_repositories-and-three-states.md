---
title: "The repositories, and the three states agentks runs in"
---

agentks lives in **three repositories**. `neuralabshq/agent-knowledge-system` holds the Rust engine, the Vite client, the Next.js homepage, the docs (with the tracker) and the AI plugins. `neuralabshq/agent-knowledge-system-library` is the default library, and it holds `library.json`, the list of libraries and templates that `agentks library` offers. `neuralabshq/neuralabs-plugin-marketplace` is the Neuralabs Claude Code marketplace, which serves all of Neuralabs.

**The only thing agentks releases is the installer:** one compressed download holding the binary, with the engine and the built client inside it. The binary knows the official repositories. It fetches migration scripts and the library catalog from them when needed, so nothing else has to be bundled.

agentks runs in **three states**. In state 1 the team develops agentks itself: engine and client both in dev mode. In state 2 a user works on their own docs with the installed binary, locally. In state 3 a user publishes: `agentks build` writes a static site, served by nginx through a Dockerfile the user owns, or by any static host or CDN.

# 03 References

- [Launch order and hosting](./10_launch-order-and-hosting.md) — when each part is built, and when the switch-over happens.
- [Phase 3: publishing](./07_phase-3-publishing.md) — state 3, `agentks build` and the Dockerfile.
- [Libraries, dep.yaml and dep.lock](./09_libraries-and-dependencies.md) — what the library repository and `library.json` hold.
- [Versioning and forced migrations](../01_initial-discussion/12_versioning-and-forced-migrations.md) — migration scripts fetched from the official repository.
- The repository's `AGENTS.md`, section "Three stages" — today's version of the three-state rule.

# 04 Decisions

- Decided (sidhantha, 2026-09-30): three repositories. `neuralabshq/agent-knowledge-system` for engine, client, homepage, docs and plugins; `neuralabshq/agent-knowledge-system-library` for the default library and `library.json`; `neuralabshq/neuralabs-plugin-marketplace` for the Neuralabs marketplace. Libraries get their own repository to keep the main one simple.
- Decided (sidhantha, 2026-09-30): the homepage is open source and lives in the main repository. The docs must be open anyway.
- Decided (sidhantha, 2026-09-30): the main repository's layout in section 02, set up with the project-setup guide. The apps folder is `apps/`, as the guide names it.
- Decided (sidhantha, 2026-09-30): development builds go to `data/builds/`, ignored by git. mise points `agentks` at them inside the repository, so the working tree overrides the installed release there.
- Decided (sidhantha, 2026-09-30): agentks publishes only its installer: the binary with the engine and the built client, compressed.
- Decided (sidhantha, 2026-09-30): the official repositories are built into the binary. Migration scripts and the library catalog are downloaded from them.
- Decided (sidhantha, 2026-09-30): no Docker image is published. A basic Dockerfile ships with the docs, for users to adapt: it installs agentks, runs `agentks build`, and serves the result with nginx.
- Decided (sidhantha, 2026-09-30): the three states in section 03.
- Decided (sidhantha, 2026-09-30): the layouts and components live in `apps/packages/agentks-ui`, shared by the client (`apps/agentks-client`) and the static renderer (`apps/agentks-ssg`).
- Decided (sidhantha, 2026-09-30): the active tracker does not move yet, because it depends on today's agentks. It moves into `docs/` once the Rust engine and the client work.
- Decided (sidhantha, 2026-09-30): until the new docs are fully migrated and usable, this repository's docs and skills stay in use. Then everything switches at once. The skills for the new version are written before that switch.

# 05 Notes & Analysis

## 01 What the user described

- One main repository with `data/builds/` (ignored), an apps folder holding the engine, the client and the homepage, then `docs/` and `plugins/`.
- The client is mobile friendly and PWA friendly (installable as an app). In development it runs in Vite's dev mode and passes WebSocket requests through to the Rust engine.
- mise can point agentks at the builds folder, which overrides the installed version.
- Libraries in their own repository, `agent-knowledge-system-library`, which is the default library. Its `library.json` lists libraries for quick install, like a marketplace file. A user can still add any third-party library through `dep.yaml`; the TUI is only a convenience.
- Only the installer is published: the engine and the Vite build, compressed.
- No Docker image to maintain. A basic Dockerfile the user can change: it installs agentks, runs `agentks build`, and serves the build. `agentks build` also works without Docker, for direct hosting or a CDN.
- Three states: developing agentks; the installed engine and client, which is a user's optimised, cached working environment but not a published site; and publishing, where libraries are downloaded again for the build, the way npm, bun or pip install dependencies.
- The tracker moves only when the Rust engine and client work. The docs of this repository stay in use until the new docs are complete.

## 02 The layout

```
agent-knowledge-system/          neuralabshq/agent-knowledge-system
  data/
    builds/                      development builds (ignored by git)
  apps/
    packages/
      agentks-ui/                shared layouts and components, used by both builds below
    agentks-engine/              the Rust engine and CLI, one binary; the migration scripts
    agentks-client/              the Vite client for the local tool: mobile and PWA friendly
    agentks-ssg/                 the static renderer for agentks build
    agentks-homepage/            the Next.js homepage
  docs/                          agentks's own docs, a Dockerfile, and later the tracker
  plugins/                       the AI plugins the Neuralabs marketplace points to

agent-knowledge-system-library/  neuralabshq/agent-knowledge-system-library
  library.json                   the list agentks library offers: libraries and templates
  manifest.json                  the default library's manifest
  ...                            its icons, artifacts, video elements, scripts, templates

plugin-marketplace/              neuralabshq/neuralabs-plugin-marketplace (all of Neuralabs)
```

| Path | Holds | Notes (claude) |
|---|---|---|
| `apps/agentks-engine` | Engine, server and CLI | Also holds the migration scripts, because the engine owns the content format. The binary downloads them from here |
| `apps/packages/agentks-ui` | Every layout and component | Pure: data in, markup out. The one implementation both builds share |
| `apps/agentks-client` | The single-page app for the local tool | Built and compressed into the binary for state 2 |
| `apps/agentks-ssg` | The static renderer | Also compressed into the binary; `agentks build` runs it with Bun or Node ([Phase 3](./07_phase-3-publishing.md)) |
| `apps/agentks-homepage` | The homepage | Built with Next.js's static export, served at `/` |
| `docs/` | agentks's own docs; later the tracker | An agentks project like any other: `docs/config/` with `dep.yaml`, and the Dockerfile that builds the website |
| `plugins/` | The `agentks` usage plugin (`agent-ks` today) and the library-development plugin | The marketplace repository only points here |
| `library.json` (library repository) | The list of offered libraries and templates | Every released binary reads it from a fixed address, so it must never move |

## 03 The three states

| | State 1: developing agentks | State 2: using agentks | State 3: publishing |
|---|---|---|---|
| Who | The agentks team | Anyone writing docs, issues, artifacts | Anyone putting docs online |
| Engine | Rust, in dev mode, from the working tree | The installed binary | The installed binary, running `agentks build` |
| Client | Vite dev server, which passes WebSocket requests through to the engine | The built client, inside the binary | The static renderer, run once by `agentks build`; only islands ship JavaScript |
| Rendering | In the browser, from data over the WebSocket | In the browser, from data over the WebSocket | Static HTML, generated once at build time (SSG) |
| Served by | Vite (client) and the engine (data) | The binary's local server | nginx, any static host, or a CDN |
| Libraries | From the local cache | From the local cache, per `dep.lock` | Downloaded again for the build, per `dep.lock` |
| Selected by | mise, inside the repository, pointing at `data/builds/` | The installed `agentks` | `agentks build`, directly or inside the user's Dockerfile |

**State 2 is production for the agentks team and a development environment for users.** It is optimised and cached, but it is not a published site. Nothing in state 2 serves the public.

**Why state 3 needs the CLI:** Rust computes the page data and the static renderer, built from the same components as the client, turns it into HTML. `agentks build` is the same binary doing a different job; it needs Bun or Node on the build machine. The Dockerfile only installs agentks and nginx around it.

**The rule for where a tool belongs carries over (claude):** something that needs the agentks source or a dev server is state 1 tooling and stays in the repository. Everything a user needs, including `agentks build`, is in the binary.

## 04 How mise selects the build (claude, proposed)

- Inside the repository, `mise.toml` puts `data/builds/` first on the path, so `agentks` runs the working-tree binary. Outside it, `agentks` is the installed release.
- Today the working-tree binary has a different name (`agent-ks-dev`) so a maintainer can run both and compare. Keep a second name for the installed release inside the repository, so both stay reachable.

## 05 Moving the tracker (claude, proposed)

- **When:** once the Rust engine and the client render this tracker correctly. Moving earlier would leave it in a repository whose tools cannot show it yet.
- **How:** copy the active issues into `docs/`, keeping folder names, so links between issues still resolve. Closed issues stay here, in the archived repository.
- **After:** the copies are the only live tracker. This repository's tracker becomes read-only history.

## 06 The switch-over (claude, proposed)

This repository's docs and skills stay the reference until everything below is ready. Then it switches in one go, so nobody is caught between two half-finished systems:

1. The new docs are complete and render correctly with the new engine.
2. The skills are rewritten for the new version and published through the Neuralabs marketplace.
3. The installer and the CLI's updater point at the new repository.
4. This repository publishes its final 0.x release, with a notice pointing at the new one.

## 07 Where the work starts

The user created the `agent-knowledge-system` folder in the Neuralabs workspace for the new work; it is empty today. Whether that folder becomes the main repository itself or holds the main and library repositories side by side is settled when the repositories are scaffolded with the project-setup guide.
