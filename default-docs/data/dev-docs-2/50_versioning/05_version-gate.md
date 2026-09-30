---
title: "The version gate"
description: "The two version constants, the range check that refuses unsupported content, its messages, and the rule for moving the floor."
---

This page explains the version gate: the check that stops agentks from reading content it would misread. The gate compares a project's `engine_version` with the range the running binary supports. Inside the range, the command runs. Outside it, the command stops with a message that names the fix. The code is in `apps/agentks-engine/crates/config/src/gate.rs`.

## The two constants

| Constant | Where | Means |
|---|---|---|
| `ENGINE_VERSION` | `apps/agentks-engine/crates/core/src/version.rs` | This binary's version. It is parsed at compile time from the workspace's package version, so it cannot disagree with the release |
| `MIN_CONTENT_VERSION` | `apps/agentks-engine/crates/config/src/gate.rs` | The floor: the oldest content version this engine reads without a migration. For 1.0.0 it is 1.0.0, so every 0.x project migrates once |

`VersionRange::SUPPORTED` joins the two into one range, floor to engine, both ends included. `check_version` tests a content version against it and returns `ConfigError::Unsupported` when it falls outside.

## When the gate runs

Config loading runs the gate right after it reads `engine_version` from `site.yaml`, before it looks at anything else. So `agentks start`, `agentks build` and every command that reads content pass through it. Because it runs first, a 0.x project gets the migration message and nothing else, not a page of config errors about keys that no longer exist.

A `site.yaml` with no `engine_version` counts as `0.0.0`. The gate has no network path. It works offline and on a machine that has never downloaded a migration.

## The messages

| Content version | Result |
|---|---|
| Inside the range | The command runs |
| Below the floor | Stops. The message names both versions and `agentks migrate`, or pinning the matching older release with mise |
| Above the engine | Stops. The message says the project needs a newer agentks and names `agentks update`, or pinning that release with mise |

For a 0.x project on a 1.0.0 binary, the message reads:

```
this project's content version is 0.3.10 (site.yaml engine_version), but this agentks 1.0.0
reads content 1.0.0 to 1.0.0. Fix: run `agentks migrate` to bring the content to 1.0.0. To stay
on the old format instead, pin the agentks release that matches it with mise.
```

When `engine_version` is missing, the first clause says so instead: the content version is 0.0.0 because `site.yaml` has no `engine_version`.

## When the floor moves

The floor moves **only on a breaking change**: a change that makes the engine misread content that has not been migrated.

| Change in a release | Floor |
|---|---|
| A renamed or removed field, a reshaped settings file, retired markup | Moves up to the new version |
| A migration that only makes content nicer to live with | Stays |
| An added optional field or value | Stays |

Retired markup needs the same care as a renamed field. Old markup does not fail loudly. It renders wrong without any error. So a release that retires a syntax both owes a migration script and moves the floor.

`MIN_CONTENT_VERSION` means "the oldest content that still works unmigrated". It never means "the newest migration available". A release can ship a script and leave the floor where it is, when content that skips the script still renders correctly.

## Other version checks

The gate covers content only. Three other checks guard other boundaries, each in its own place.

| Check | Compares | Explained in |
|---|---|---|
| A library's engine range | The running version against `engine` in a library's `manifest.json` | [Libraries](../35_libraries/01_overview.md) and [library migrations](./20_library-migrations.md) |
| The protocol handshake | The client's and the server's `api_version`, and the embedded client's build | [Server and protocol](../15_server-and-protocol/01_overview.md) |
| Cache formats | The format number of each stored cache entry | [Caching](../20_caching/01_overview.md) |

## Related

- [agentks migrate](./10_migrate-runner.md): how content moves up to the engine's version, and why `engine_version` is set last.
- [Releases](./25_releases.md): the checklist that decides whether a release moves the floor.
