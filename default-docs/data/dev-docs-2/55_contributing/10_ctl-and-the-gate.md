---
title: "ctl and the gate"
description: "The ctl verbs, the gate ladder and its rungs, what each rung runs for Rust and TypeScript, the repository contract, and CI."
---

`ctl` is the main repository's one entrypoint. The gate is the ladder of checks whose pass defines "green". This page says which command to run, what it proves, and why a red rung stopped your run.

## ctl

`ctl` is a thin router. It sources `scripts/common/_lib.sh` and hands each verb to its worker script, `scripts/<group>/<name>.sh`. No logic lives in `ctl` itself. Every verb takes `-h` or `--help`, and colours switch off when the output is piped or `NO_COLOR` is set.

| Verb | Does |
|---|---|
| `ctl setup` | Creates `.env`, prepares the storage folders, installs toolchains and dependencies |
| `ctl status` | A doctor for the working tree: environment, runtimes, dependencies, the development build |
| `ctl check` | The repository contract (below). Read-only |
| `ctl build [engine\|client\|homepage\|voice] [--release]` | Builds one app. With no app it builds engine, client and homepage, in that order. `voice` builds only when named, because it links ONNX Runtime |
| `ctl dev [homepage\|client]` | Runs one app's dev server in the foreground |
| `ctl test [app]` | Runs test suites. The apps are `engine`, `ui`, `client`, `homepage` and `video`. `voice` runs only when named |
| `ctl gate [all\|static\|dynamic\|<rung>] [-q] [--memory SIZE]` | Runs the gate, a group of its rungs, or one rung |

Each worker prints the direct commands it runs in its help, so you can run a step without `ctl` when you need to.

## The gate ladder

The full ladder is fixed. It runs cheapest first, so a failure costs as little time as possible:

```
lint → typecheck → dead → audit → test → check → build → e2e
```

A repository runs a subset of it, its **rungs**. The main repository runs the floor, four rungs that take seconds each and need no extra tooling:

```
lint → typecheck → test → check
```

- **It stops at the first red rung** and names every rung it did not reach, so a partial run never reads as a full one.
- **`-q`** prints one line per green rung with its counts. A red rung still prints in full.
- **One heavy run at a time.** A lock keeps two gate runs from overlapping, under one memory limit: by default 80% of the memory available, or the size given with `--memory`.
- **`ctl gate static`** runs the rungs that read the code (lint, typecheck, check). **`ctl gate dynamic`** runs the ones that run it (test).
- **A rung that cannot find its target fails by name.** It never reports green for work it did not do.

## What each rung runs

| Rung | Rust (`apps/agentks-engine`) | TypeScript apps |
|---|---|---|
| lint | `cargo fmt --check`, then `cargo clippy --all-targets -D warnings -D clippy::cognitive_complexity`, with the threshold of 15 set in `apps/agentks-engine/clippy.toml` | oxlint through each app's `bun run lint`, reading its `.oxlintrc.json` |
| typecheck | `cargo check --workspace --all-targets` | `tsc --noEmit` through `bun run typecheck`. The homepage runs `next typegen` first, because Next generates files its types import |
| test | `cargo test --workspace`, the theme contract check, the migration chain test | Each app's tests. The video package then runs its size gate, a production build with a byte limit |
| check | `ctl check`: the repository contract | the same |

`ctl gate lint` and `ctl gate typecheck` also take one app. `ctl gate lint --staged` lints only apps with staged files, for a pre-commit hook. The `voice` app is linted and tested only when named, so it stays out of the gate. `next build` runs in `ctl build`, not in the gate, so the gate stays fast.

An app with no test file yet is named with a warning instead of failing the rung. When no suite ran at all, the closing line says nothing was proved.

## The repository contract

`ctl check` runs every rule and stops at none, then exits 0 only when all passed.

| Rule | Checks |
|---|---|
| versions | No `<version>` placeholder left in `.mise.toml` or any app manifest |
| env | Every `${VAR}` an app's `config.yaml` reads is a key in `.env.template`; keys are unique; secret values are blank; no `.env` or `config.local.yaml` is tracked by git |
| layout | No `package.json`, `bun.lock` or workspace file at the root or directly in `apps/`, and no group folder with a manifest of its own beside its children's |
| brief | `AGENTS.md` exists and `CLAUDE.md` does not |
| ladder | The "Gate ladder" row in `AGENTS.md` lists the same rungs, in the same order, as `RUNGS` in `scripts/gate/all.sh` |
| lint config | Every app ships its linter's config with the complexity floor: `clippy.toml` beside `Cargo.toml`, `.oxlintrc.json` beside `package.json` |
| layers | Every engine crate depends only on crates in lower layers, checked by `scripts/gate/crate-layers.ts` against `apps/agentks-engine/crates/LAYERS.toml` |
| skills | Every relative link under `plugins/` names a file inside its own plugin, because a plugin installs alone. Checked by `scripts/gate/skill-links.ts` |
| env refs | Every `${NAME}` inside the root `.env` names a set key, with no cycle |

The ladder rule exists because an audit reads `AGENTS.md` while the gate runs `scripts/gate/all.sh`. If the two lists differed, the audit would check one ladder and CI would run another.

## Adding a rung

A rung joins when the project earns it and the repository owner agrees: `dead` for a dead-code cleanup, `audit` for the first outside users, `build` when an image or build check is needed, `e2e` for a user flow. Copy the rung's worker from the project-setup skill, then add its name to both `RUNGS` in `scripts/gate/all.sh` and the "Gate ladder" row in `AGENTS.md`, in ladder order. A rung, once listed, is never removed.

## CI

`.github/workflows/gate.yml` runs on every push and pull request, on Linux. It checks out the code, installs the toolchain with mise, restores the Rust cache, then runs `./ctl setup` and `./ctl gate`. Workflows call `ctl` only, so CI and a laptop run the same commands.

## Related

- [Tests](./15_tests.md): what the test rung's suites contain.
- [AGENTS.md and code rules](./20_agents-md-and-code-rules.md): the rules the lint rung enforces.
