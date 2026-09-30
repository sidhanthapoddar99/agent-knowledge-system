---
title: "Library migrations"
description: "How the engine checks a library against its engine range, and how a library's owner migrates the library to a new engine."
---

This page explains how libraries keep up with engine releases. Each library states the engine versions it works with. When a breaking engine release changes a format a library depends on, the library's owner migrates the library and tags a new version. The library's users never migrate it. They only move their pin.

## Docs migrations and library migrations

| | Docs migration | Library migration |
|---|---|---|
| Changes | A project's pages, config and tracker | A library's files and its `manifest.json` |
| Run by | The project's user | The library's owner |
| Command | `agentks migrate` | `agentks migrate --library <folder>` |
| Scripts in | `apps/agentks-engine/migrations/docs/` | `apps/agentks-engine/migrations/library/` |
| `--root` is | The project folder, holding `config/site.yaml` | The library folder, holding `manifest.json` |
| Ends with | `engine_version` set in `site.yaml` | A new `engine` range in the manifest, then a new library version tagged by the owner |

Both kinds follow the same [script contract](./15_script-contract.md). Library scripts carry their own shared block, which reads `manifest.json` instead of `site.yaml`.

## Why users never migrate a library

A git library sits read-only in `~/.agentks/libraries/`, one copy per commit, shared by every project on the machine that pins that commit. Changing it in place would change it for all of them, and the change would exist on one machine only. A new library version is reviewable and reaches everyone the same way, through `dep.yaml` and the lock.

So the runner refuses a `--library` folder inside `~/.agentks/libraries/`.

## The engine range at run time

A library's `manifest.json` carries `engine`, a range such as `>=1.0.0 <2.0.0`. Only breaking engine releases change formats, so a range normally spans one major version.

The library crate checks the range every time it loads a library, during a sync and whenever `Libraries` is built. When the running engine falls outside it, loading stops with an error that names the library, its version, its range and this engine's version. The fix it offers is one of three:

- `agentks install --update`, to move to a library version built for this engine;
- a narrower selector in `dep.yaml`, to choose such a version;
- pinning the older engine for this project with mise.

`agentks migrate` also reads every pinned library's range while it migrates a project, so a user who upgrades hears about every library mismatch at once, not one per start.

## The owner's migration

```bash
agentks migrate --library ./my-library --dry-run
agentks migrate --library ./my-library
```

1. The runner reads the library's `manifest.json`. The lower bound of its `engine` range is the version to migrate from.
2. The target is the running binary's version.
3. It runs every script in `apps/agentks-engine/migrations/library/` whose version is above the from version and at most the target, in version order.
4. It rewrites `engine` to a range that starts at the target.
5. The owner reviews the change and tags a new library version.
6. Users run `agentks install --update`, and their pins move to the new version.

## The chain

The library chain is empty for 1.0.0. Libraries start at engine 1.0.0, so 1.0.0 needs no library script. The first one arrives with the first breaking engine release after 1.0.0, and it defines the library scripts' shared block.

A breaking release that changes something a library file depends on, such as a manifest field or an element's contract, owes a library script, just as a change to content owes a docs script.

## Related

- [agentks migrate](./10_migrate-runner.md): the runner both kinds share.
- [Libraries](../35_libraries/01_overview.md): the sync, the store and the manifest checks.
