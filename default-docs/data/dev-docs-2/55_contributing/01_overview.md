---
title: "Contributing to agentks"
description: "How the agentks team works on agentks itself: the repositories, the one entrypoint ctl, the gate that defines green, and the rules every change keeps."
---

This section is for anyone who changes agentks itself, a person or an AI agent. It explains how to set up a working tree, build and run agentks from it, prove a change with the gate, and add a new crate or app. Developing agentks is the first of agentks's three states: the engine runs from the working tree, and nothing here ships to users.

## Where a change goes

| Change | Repository |
|---|---|
| The engine, the CLI, the client, the static renderer, the UI package, the homepage, agentks's own docs, the AI plugins | `NeuraLabsHQ/agent-knowledge-system`, the main repository |
| The default library, its elements, the project templates, the catalog `library.json` | `NeuraLabsHQ/agent-knowledge-system-library` |
| The list of Neuralabs plugins for Claude Code | `NeuraLabsHQ/neuralabs-plugin-marketplace` |

The main repository follows one standard layout, with `ctl` as its one entrypoint. The library and marketplace repositories hold content, not code, so they have no `ctl`. Each of the three has an `AGENTS.md` that states its own contract. The [overview section](../05_overview/01_overview.md) maps every folder of the main repository and what each app owns.

## The working loop

```bash
mise trust            # once per clone
mise install          # the pinned toolchains
ctl setup             # .env, storage folders, dependencies
ctl build engine      # the binary, into data/builds/agentks
agentks --version     # inside the repository, this runs the build you just made
ctl test engine       # one app's tests while you work
ctl gate              # lint, typecheck, test, check: green means ready to merge
```

**Green means `ctl gate` passed.** CI runs the same command on every push and pull request, so a change that is green locally is green in CI.

## The rules every change keeps

These come from the main repository's `AGENTS.md`, which binds every agent on every change.

- **`ctl` is the only way to build, test and check.** Scripts and CI never call `cargo` or `bun` directly for those.
- **Settings live in the ignored root `.env`.** `.env.template` is the contract for its keys.
- **An app never imports from another app.** Shared code is a package under `apps/packages/`.
- **Documentation points at code; code never points at documentation.** A code comment never names a doc page, a plan, an issue or a skill file.
- **`AGENTS.md` is the only instruction file.** `ctl check` fails when a `CLAUDE.md` exists.
- **When the engine cannot be sure of an answer, it returns an error.** A wrong answer that looks right is worse, because nothing later can tell it apart from a right one.
- **Every rule stays in Rust.** The frontend decides only how things look.

## Where a tool belongs

A tool that needs the agentks source, a build or a dev server belongs to development. It stays in the repository, under `scripts/` or in an app's dev folder, and never ships. A tool that needs only a project's files belongs in the binary, because every user has files. Put a new check on the right side of that line before you write it.

## Pages in this section

| Page | Explains |
|---|---|
| [Setup and toolchain](./05_setup-and-toolchain.md) | The pinned versions, first-time setup, development builds and dev servers |
| [ctl and the gate](./10_ctl-and-the-gate.md) | Every `ctl` verb, the gate ladder, what each rung runs, and CI |
| [Tests](./15_tests.md) | Where each kind of test lives, the tools, and the rules tests follow |
| [AGENTS.md and code rules](./20_agents-md-and-code-rules.md) | The brief as a contract, the tripwires, and the rules every crate keeps |
| [Adding a crate or an app](./25_adding-a-crate-or-an-app.md) | The steps for a new engine crate, a new app or package, and a new `ctl` verb |

## Related sections

- [Engine](../10_engine/01_overview.md): the crates and their layers.
- [Versioning](../50_versioning/01_overview.md): migrations and how a release is cut.
