---
title: "The core crate"
description: "agentks-core, layer 0: the shared types every crate builds on, and why it does no I/O."
---

`agentks-core` is layer 0. It holds the small types every other crate shares, so two crates never define the same idea twice. It depends on no other agentks crate and does no I/O: it reads no file, no environment variable and no network. A caller that needs a value from the outside world reads it and passes it in.

## Paths and URLs

| Type | What it is | The rules it guarantees |
|---|---|---|
| `RelPath` | A path relative to the project root, such as `data/dev-docs/05_arch/01_overview.md` | Always normalised: `/` separators, no `.` or empty segments, no leading or trailing `/`. A `..` is resolved when the value is built, and one that climbs above the root is refused. So two equal paths are equal strings, and a `RelPath` can never point outside the project |
| `UrlPath` | A root-absolute site URL, such as `/dev-docs/architecture/overview` | Starts with `/`; no empty, `.` or `..` segment; no trailing `/` except the root; no query, fragment, backslash or whitespace. It never carries the hosting prefix |
| `BasePath` | The hosting prefix of a published site, such as `/docs` | Added once, when the index writes an href, and nowhere else |

`RESERVED_SEGMENTS` lists the first URL segments the engine and the server own: `api`, `client`, `assets`, `content-assets`, `artifacts` and `_lib`. `RESERVED_ROOT_FILES` lists `manifest.webmanifest` and `sw.js`. No content URL may start with a reserved segment, and the config crate refuses a section whose `base_url` does.

`RelPath` says nothing about symlinks. Whether a path on disk stays inside the project after following links is a question for I/O, so the cache crate's `canonical_inside` answers it.

## Hashes

`Hash` is a BLAKE3 hash, written `b3:` followed by 64 lowercase hex digits. One type serves every hash in the engine: file hashes, rolled-up folder hashes, render hashes and cache keys. A hash can therefore never be mixed up with an ordinary string.

A hash built from several parts goes through `HashWriter`:

```rust
let key = Hash::writer("render-key")   // the domain: what is being hashed
    .str(engine)
    .hash(&page_hash)
    .finish();
```

- The **domain** names the kind of hash, so two kinds built from the same parts never collide.
- Every part is **length-prefixed**, so `("ab", "c")` and `("a", "bc")` give different hashes.

Keys are content hashes, never modification times. Some file systems, WSL among them, report unreliable times.

## Versions

`Version` is a strict x.y.z: three plain numbers, with no `v`, no leading zeros and no pre-release. Ordering compares x, then y, then z. `ENGINE_VERSION` is this build's version, taken from the workspace `Cargo.toml` at compile time. It is also the newest content version this engine reads. `Version::ZERO` is the content version of a `site.yaml` that declares none.

## Identifiers

| Type | What it is |
|---|---|
| `SectionId` | A section name, the key under `pages:` in `site.yaml`. Non-empty, with no `/`, `:` or whitespace, because it is part of data keys such as `sidebar:<section>` |
| `ProjectKey` | Which project on this machine: the first 16 hex digits of the BLAKE3 hash of the canonical config folder path. It names the project's build cache, its run record, its stable port and its browser storage. It is an identifier, not a secret, and never used for access control |
| `CommitId` | A full git commit id, 40 or 64 lowercase hex digits. An abbreviated id is refused, because it is not unique |

`ProjectKey::from_config_dir` hashes a path it is given. Making that path canonical (resolving symlinks) is I/O, so the cache crate's `project_identity` does it first. A moved project gets a new key and starts with a cold cache.

## The fixed vocabularies

Values that are fixed in code, not configured by a project, live here:

| Type | Values |
|---|---|
| `SectionType` | `docs`, `blog`, `issues`, `custom` |
| `PageKind` | `markdown`, `video`, `diagram`, `artifact` |
| `DiagramType` | `mermaid`, `dot`, `excalidraw`, `drawio` |
| `IssueStatus` | `open`, `blocked`, `in-progress`, `input-needed`, `review`, `done`, `dropped`, `superseded` |
| `StatusCategory` | `not-started`, `in-progress`, `review`, `closed` |
| `RunStatus` | the statuses of an agent-log run |
| `TrackerSection` | `subtasks`, `notes`, `brainstorm`, `agent-memory`, `agent-log`, `plans`, `comments` |

Each status knows its category, through `IssueStatus::category`:

| Category | Statuses |
|---|---|
| `not-started` | `open`, `blocked` |
| `in-progress` | `in-progress` |
| `review` | `input-needed`, `review` |
| `closed` | `done`, `dropped`, `superseded` |

This is the only place that mapping exists. The browser receives each issue with its category already set.

Two macros, `name_enum!` and `string_wire!`, give each of these types one string form, the same in Rust, in JSON and in the generated schema. A misspelt value is refused rather than guessed.

## The machine home

`MachineHome` knows where every per-machine file lives: `~/.agentks/`, or the folder named by the `AGENTKS_HOME` environment variable, which must be an absolute path. It does path arithmetic only and creates nothing. `MachineHome::locate` takes the two environment values as arguments, because core does not read the environment.

The `formats` module holds one format version per persisted store. The [caching section](../20_caching/20_format-versions.md) explains how they are used.

## Constants

| Constant | Value |
|---|---|
| `VERSION` | The workspace version |
| `BINARY_NAME` | `agentks` |
| `OFFICIAL_REPOSITORY` | The main repository. Migration scripts and updates come only from here |
| `LIBRARY_REPOSITORY` | The library repository, which holds `library.json` |

## The error model

Core also owns `ErrorRecord`, `ErrorKind`, `Severity`, `ErrorSink` and `ErrorList`. They have their own page: [the error model](./15_error-model.md).

## Related

- [Crate layers](./05_crate-layers.md): why shared types move down to this crate.
- [The build cache](../20_caching/15_build-cache.md): where `ProjectKey` and `MachineHome` are used on disk.
