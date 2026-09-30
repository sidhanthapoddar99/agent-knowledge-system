---
title: "Setup and toolchain"
description: "The pinned toolchain versions, first-time setup of a clone, development builds of agentks, and the dev servers."
---

This page gets a clone of the main repository from nothing to a working development build. It lists the pinned tool versions and explains how a development build of `agentks` takes over from an installed release inside the repository.

## The pinned toolchain

mise installs every tool at a fixed version. The versions live in `.mise.toml` at the repository root.

| Tool | Version | Used for |
|---|---|---|
| Rust | 1.98.1, with `clippy` and `rustfmt` | The engine and CLI, edition 2024 |
| Bun | 1.4.2 | Every TypeScript app's install, scripts and tests, and the repository's TypeScript checks |
| Node.js | 24.21.0 | Next.js runs some of its own tools under Node |
| uv | 0.12.20 | The migration scripts and their chain test |

- **Rust has two pins that must agree.** `apps/agentks-engine/rust-toolchain.toml` is the real pin; `.mise.toml` holds the same version. `clippy` and `rustfmt` are listed in `.mise.toml` too, because mise sets `RUSTUP_TOOLCHAIN`, which bypasses the toolchain file's component list. Without them, CI gets a toolchain with no linter.
- **The `git` program must be installed.** The engine's git crate runs it for branch, history and remote operations.
- **New dependencies take their latest stable release** at the time they are added. A third-party Rust crate's version lives only in the workspace `apps/agentks-engine/Cargo.toml`.

The frontend stack, pinned in each app's own `package.json`:

| Area | Pick |
|---|---|
| Language | TypeScript 7.0.2 |
| Client and UI package | Preact 11.0.0, Vite 8.3.1 with `@preact/preset-vite`, `preact-render-to-string` |
| Homepage | Next.js 16.3.8, React 19.3.0, exported as static files |
| Lint | oxlint 1.86.0 |
| Tests | `bun test` with happy-dom in the UI package and the homepage; Vitest 5.0.3 with happy-dom in the client |

`AGENTS.md` records each pick and the reason for it. When you add a dependency, add its line there too.

## First-time setup

1. Install [mise](https://mise.jdx.dev/).
2. From the repository root, run `mise trust` once, then `mise install`.
3. Run `ctl setup`. It creates your `.env` from `.env.template`, prepares the storage folders and installs the toolchains and dependencies.
4. Run `ctl status` to check the result. It reports the environment, the runtimes, the dependencies and whether a development build exists.

Inside the repository, mise puts two folders first on your `PATH`: `data/builds/`, then the repository root. The root is there so `ctl` runs bare, which is why `ctl` must stay the only executable at the root. mise also sets `NEXT_TELEMETRY_DISABLED=1`, because nothing in this repository reports to a third party.

## Settings

Local development settings live in one ignored file, the root `.env`. The committed `.env.template` lists every key; secret keys stay blank in it. `ctl check` fails when an app's `config.yaml` reads a key the template does not declare, or when a secret has a value in the template. A frontend has no env file of its own. Its dev server inherits the root environment, and only chosen public constants reach browser code, because bundles are public.

## Development builds

```bash
ctl build engine            # data/builds/agentks, debug profile
ctl build engine --release  # the release profile
agentks --version           # inside the repository: the build you just made
```

`ctl build engine` compiles the binary, copies it to `data/builds/agentks`, and regenerates the `/api` JSON Schema, `apps/agentks-engine/schema/api.schema.json`, from the Rust types. Because `data/builds/` comes first on the path, `agentks` inside the repository runs the working-tree build, and everywhere else it runs the installed release. `data/builds/` is ignored by git.

A development build differs from a release build in one deliberate way: `agentks migrate` reads migration scripts from the checkout's own `apps/agentks-engine/migrations/` folder instead of downloading them. Maintainers can try an unreleased script with no flag or environment variable that could point a release elsewhere.

`ctl build client` regenerates the UI package's types from the schema and builds the client into `apps/agentks-client/dist/`. `ctl build homepage` exports the homepage into `apps/agentks-homepage/out/`. `ctl build` with no app builds all three.

## Dev servers

`ctl dev [homepage|client]` runs one app's dev server in the foreground, with reload. Ctrl-C stops it.

- **`ctl dev client`** runs the client in Vite's dev server. Vite passes `/api`, WebSocket included, and the file routes on to the engine at `CLIENT_ENGINE_URL`. The browser therefore talks to one origin, exactly as it does with the installed binary, and the client code is the same in every state. When `CLIENT_ENGINE_URL` is blank, the dev server starts a mock engine from `apps/agentks-client/dev/` that answers from fixtures. The mock never ships.
- **`ctl dev homepage`** runs `next dev`.

## Related

- [ctl and the gate](./10_ctl-and-the-gate.md): every verb and what green means.
- [Adding a crate or an app](./25_adding-a-crate-or-an-app.md): where a new tool version or app gets recorded.
