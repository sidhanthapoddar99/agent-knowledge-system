---
title: "Releases"
description: "The one release stream of agentks: where the version is set, what a tag means, the release note, who cuts a release, and the checklist for a format change."
---

This page explains how an agentks release is cut. There is one product and one release stream: the `agentks` binary, shipped as a compressed installer per platform on the main repository's GitHub Releases. The plugins and the default library are released on their own.

## One version, one tag

| What | Where |
|---|---|
| The version | `[workspace.package] version` in `apps/agentks-engine/Cargo.toml`. Every crate inherits it, and `ENGINE_VERSION` in `agentks-core` is parsed from it at compile time |
| The tag | `vX.Y.Z` on `NeuraLabsHQ/agent-knowledge-system`. The single product needs no tag namespace |
| The release note | One note per release in `apps/agentks-engine/release-notes/` |
| The artifact | The compressed installer. The binary inside it carries the engine, the CLI, the built client and the static renderer |

During development the workspace already carries the version being built. The tag waits for the release.

## What a tag commits you to

A tag is more than a label on the installer. Released binaries read things from it and from the repository for as long as they are installed.

- **`agentks migrate` fetches its scripts at the binary's own tag.** A release build of version Y downloads `apps/agentks-engine/migrations/` at `vY`. So every script a release needs must be in the tagged commit, and a released script never changes afterwards.
- **The official addresses are compiled in.** `OFFICIAL_REPOSITORY` and `LIBRARY_REPOSITORY` in `agentks-core` never change, and neither do the paths binaries read inside them: the migrations folder and the catalog `library.json`. Moving one of them breaks every binary already installed.
- **A script's version must be a real release.** Content can then never declare an engine version that no engine had.

## The release note

Each note says what changed in its version, whether the change breaks existing content, and what a user must run, which for a format change is `agentks migrate`. A user reading the note decides from it whether to upgrade now or pin the older version with mise.

## Who cuts a release

| Step | Who |
|---|---|
| Set the version, write the release note, add migration scripts | A maintainer, or an agent working for one |
| Review | The repository owner |
| Tag and push `vX.Y.Z` | The repository owner only |
| Build and publish | The release workflow, started by the pushed tag |

Agents prepare the version and the note. They never tag, push or publish, because a release is an outward action nobody can take back.

The release workflow runs only on a pushed `vX.Y.Z` tag. It runs the gate on every platform, then builds the release.

## Checklist for a format change

A release that changes what content looks like on disk works through this list:

1. **Bump the version** in the workspace `Cargo.toml`. A breaking change moves x.
2. **Add the scripts** under `apps/agentks-engine/migrations/docs/`, and under `apps/agentks-engine/migrations/library/` if library files change. Follow the [script contract](./15_script-contract.md).
3. **Decide the floor.** Raise `MIN_CONTENT_VERSION` only if old content breaks or renders wrong without the migration. See [the version gate](./05_version-gate.md).
4. **Try the chain** on agentks's own `docs/` and on the tracker fixture before anything else.
5. **Write the release note**: what changed, and what to run.

Retired markup counts as a format change. Old markup does not fail. It renders wrong without any error, so it is the change most easily shipped without a script.

## The other release streams

| Product | Version | Released as |
|---|---|---|
| The default library | Its own x.y.z in its `manifest.json` | A tag on `NeuraLabsHQ/agent-knowledge-system-library`. A tag is the release; there is no pipeline |
| Any other library | Its own x.y.z | A tag on its own repository |
| Each AI plugin | Its own x.y.z | Its plugin manifest |

None of them borrows the binary's version. A library states the engine versions it supports with its `engine` range instead.

## Related

- [The version gate](./05_version-gate.md): what the version number means to content.
- [Contributing](../55_contributing/01_overview.md): the gate every change passes before it can be released.
- [Upgrading, in the user guide](../../user-guide-2/60_upgrading/01_overview.md): the release from the user's side.
