---
title: "Crate layers and the layer check"
description: "Why the engine workspace is layered, how LAYERS.toml and the layer check work, and what to do when a crate needs something from above."
---

Every crate in the engine workspace has a layer number, and a crate may depend only on crates in a lower layer. This page explains why, how the check enforces it, and the two ways to solve a dependency that points the wrong way.

## Why layers

- **Each crate has one job.** A crate that can only look down can be read, tested and replaced on its own.
- **The CLI and the server share one core.** Both sit at the top and call the same crates below. A rule written once, in one crate, serves `agentks check`, the page in the browser and `agentks build`.
- **Boundaries hold by construction.** No crate below `agentks-server` knows about HTTP, WebSockets or the terminal. No crate below `agentks-cli` prints. A check proves the direction of every edge, so these boundaries cannot erode quietly.

## The table

`apps/agentks-engine/crates/LAYERS.toml` gives every crate its layer:

```toml
[layers]
agentks-core = 0
agentks-config = 1
agentks-git = 1
agentks-cache = 1
agentks-api = 1
agentks-content = 2
agentks-library = 2
agentks-migrate = 2
agentks-index = 3
agentks-render = 4
agentks-site = 5
agentks-sync = 6
agentks-server = 7
agentks-cli = 8
```

Two crates in the same layer may not depend on each other. That is deliberate: a sideways edge between two crates of one layer is how a hidden cycle starts.

## The edges

| Crate | Depends on |
|---|---|
| `agentks-core` | nothing |
| `agentks-config`, `agentks-git`, `agentks-cache`, `agentks-api` | core |
| `agentks-content` | core, config |
| `agentks-library` | core, config, cache, git |
| `agentks-migrate` | core, config, git |
| `agentks-index` | core, config, content |
| `agentks-render` | core, config, api, content, index |
| `agentks-site` | core, config, git, cache, api, content, library, index, render |
| `agentks-sync` | core, cache, api, site |
| `agentks-server` | core, cache, config, api, index, render, site, sync |
| `agentks-cli` | every crate above |

Some edges exist for a specific reason:

- `agentks-render` depends on `agentks-api`, so it writes the wire shapes of a rendered body (the body HTML, the outline, the diagram list) and no second copy of them exists.
- `agentks-library` and `agentks-migrate` both need to fetch from git. They share the fetch code in `agentks-git`, one layer down, because two layer-2 crates cannot share sideways.
- `agentks-sync` and `agentks-server` depend on `agentks-cache` for its file primitives, `atomic_write` and `canonical_inside`. Run records, the port file and the access-key store need the same atomic write and the same path check as the caches.

## The layer check

`scripts/gate/crate-layers.ts` runs in `ctl check`, which is a rung of the gate. It reads `cargo metadata --format-version 1 --no-deps` and checks every edge between workspace crates. It fails when:

- a crate depends on a crate in its own layer or a higher one;
- a workspace crate has no entry in `LAYERS.toml`;
- `LAYERS.toml` names a crate that does not exist.

Every kind of dependency counts: normal, dev and build. A test that reaches up a layer is still coupling. Run it alone from the repository root:

```bash
bun scripts/gate/crate-layers.ts
```

A clean run prints one line with the number of crates and edges. A failure prints each bad edge with its kind and why it fails:

```
crate-layers: dependencies must point to a lower layer
  ✗ agentks-core (layer 0) -> agentks-site (layer 5) [normal]: higher layer
  ✗ agentks-cache (layer 1) -> agentks-api (layer 1) [normal]: same layer
```

## When a crate needs something from above

A dependency that points up is a design error. There are two fixes.

**Move the shared piece down.** When two layers need a small type, it goes into `agentks-core`. That is why `SectionId`, `ProjectKey`, `CommitId`, `UrlPath`, `BasePath`, the fixed vocabularies, the machine home layout and the official repository addresses all live in core.

**Define a trait in the lower crate.** The lower crate states what it needs as a trait. A higher crate implements it and passes it in.

| Trait | Defined in | Implemented by | Why |
|---|---|---|---|
| `FileSource` | `agentks-content` | `agentks-index` (`ProjectFiles`, over the disk) | Content rules and the renderer read other files without doing I/O themselves. Tests pass `MemoryFiles`, a map |
| `LinkResolver` | `agentks-render` | `SiteIndex`, from `agentks-index` | The renderer resolves every link through one small interface. The index is the real resolver; tests pass a small one of their own |
| `ProjectNeeds` | `agentks-cache` | `agentks-library` | Cleanup must know which library commits a project pins, which only the library crate can read |
| `Confirm` | `agentks-migrate` | `agentks-cli` | The migration runner asks before it changes files, but only the CLI talks to the user |

The server has one trait of its own, `Backend`: everything it needs from the engine, in one place. `Site` implements it, and the server's tests implement it by hand, so the server can be tested without a real project.

## When to add a crate

Add a crate only for a real boundary: a second consumer, or a distinct set of dependencies. Do not split a crate for symmetry. Put it in the lowest layer that holds everything it needs, and give it a row in `LAYERS.toml`, or the check fails. The [contributing section](../55_contributing/01_overview.md) lists every file a new crate must touch.

## Related

- [The engine](./01_overview.md): what each crate owns.
- [The core crate](./10_core.md): the types that were moved down to layer 0.
- [Contributing](../55_contributing/01_overview.md): the gate that runs this check.
