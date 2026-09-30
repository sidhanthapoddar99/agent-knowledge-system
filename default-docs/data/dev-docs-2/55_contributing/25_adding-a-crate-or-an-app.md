---
title: "Adding a crate or an app"
description: "The steps for a new engine crate, a new TypeScript app or shared package, and a new ctl verb, with every file that must learn about it."
---

This page lists every place that must change when the main repository grows: a new crate in the engine, a new app or package under `apps/`, or a new `ctl` verb. Each list ends with `ctl gate`, because the gate is what proves nothing was missed.

## A new engine crate

The engine is one Cargo workspace in `apps/agentks-engine/`, with its crates in layers. A crate may depend only on crates in a lower layer, never sideways or up. The [engine section](../10_engine/01_overview.md) has the full crate map.

1. **Choose the layer.** Put the crate in the lowest layer that holds everything it needs. If it needs something from a higher layer, that is a design error: define a trait in the lower crate and let the higher one implement it, as `agentks-content::FileSource` and `agentks-cache::clean::ProjectNeeds` do, or move the shared piece down.
2. **Create the folder** `apps/agentks-engine/crates/<short-name>/`. The package name is `agentks-<short-name>`.
3. **Write its `Cargo.toml`.** It inherits `version`, `edition`, `rust-version`, `license` and `repository` from the workspace, depends on other crates with `<name>.workspace = true`, and sets `[lints] workspace = true`.
4. **Register it in the workspace `Cargo.toml`**: add the folder to `[workspace] members`, and add a path entry to `[workspace.dependencies]` so other crates can depend on it.
5. **Give it a layer** in `apps/agentks-engine/crates/LAYERS.toml`. `ctl check` fails on a crate missing from the table.
6. **Add third-party dependencies only to the workspace `Cargo.toml`**, one version each, and add a line to the Stack list in `AGENTS.md` with the reason.
7. **Write the crate's `README.md`**: what it owns, what it must not do, what is built, what fills it next. Open `lib.rs` with a doc comment that says the same in short.
8. **Keep the crate rules**: a doc comment on every public item, one error enum, a `NotImplemented` error for anything not built yet, no printing, no panics.
9. **Update the tables** that list crates: the one in `apps/agentks-engine/README.md` and the Skeletons entry in `AGENTS.md`.
10. **Run `ctl gate`.** The check rung runs the layer check over every dependency edge, including dev and build dependencies, because a test that reaches up is still coupling.

## A new app or package

TypeScript code lives in separate apps, with no JavaScript workspace.

1. **Choose app or package.** An app is something that runs or builds on its own, under `apps/<name>/`. Code that two apps share is a package, under `apps/packages/<name>/`. An app never imports from another app.
2. **Give it its own `package.json` and `bun.lock`.** `ctl check` fails a manifest at the root, directly in `apps/`, or in a group folder beside its children's manifests.
3. **Add the lint config** beside the manifest: `.oxlintrc.json` for TypeScript. `ctl check` fails an app without it.
4. **Define the scripts the workers call**: `lint`, `typecheck` and `test` in `package.json`, and `dev` and `build` when the app has them.
5. **Name tests by the pattern** the test worker looks for, such as `*.test.ts`.
6. **Wire it into `ctl`.** Each worker has an `[ADAPT] APPS` list. Add the app to the `all` case and as a named target in `scripts/gate/lint.sh`, `scripts/gate/typecheck.sh` and `scripts/test/test.sh`. Add a `scripts/build/<app>.sh` worker and its branch in `scripts/build/build.sh` if it builds, and a case in `scripts/dev/dev.sh` if it has a dev server. A default run that never lists an app is green for work it never did.
7. **Keep settings in the root `.env`.** A frontend has no env file of its own. Add any new key to `.env.template`.
8. **Consume a package by path.** Bun cannot link a package by path yet, so an app reaches a shared package through an alias in its `tsconfig.json` and `vite.config.ts`, as the client does with `@agentks/ui`.
9. **Record it in `AGENTS.md`**: a Skeletons entry with the app's folder shape, its Stack line, the Commands summary, and an entry under Exceptions if its layout departs from the standard.
10. **Run `ctl gate`.** CI needs no change: `gate.yml` runs `ctl gate`, which now includes the app.

## A new ctl verb

1. Write the worker at `scripts/<group>/<name>.sh`. Start it with the preamble from `scripts/common/_lib.sh` and give it a `usage()` that `--help` prints.
2. Add one `row` for it in `ctl_help` inside `ctl`.
3. Add one `run <group>/<name>` line to the `case` in `ctl`.
4. Add it to the Commands section of `AGENTS.md`.

Logic never goes into `ctl` itself. Delete a verb that stops being used.

## A new gate rung

A rung is not a verb. The ladder's order is fixed, and a rung joins it only with the owner's agreement. The steps are in [ctl and the gate](./10_ctl-and-the-gate.md).

## Related

- [AGENTS.md and code rules](./20_agents-md-and-code-rules.md): the sections of the brief these steps update.
- [Setup and toolchain](./05_setup-and-toolchain.md): where pinned versions are recorded.
