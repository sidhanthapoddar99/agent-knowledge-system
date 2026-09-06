# Release architecture

This repository has three independent release streams. No stream borrows another product's version, tag, note, or payload.

| Product | Version source | Tag | Notes | Publishing workflow |
|---|---|---|---|---|
| Engine | `ENGINE_VERSION` in `agent-ks-engine/src/loaders/engine-version.ts` | `agent-ks-engine-vX.Y.Z` | `agent-ks-engine/release-notes/` | `.github/workflows/agent-ks-engine-release.yml` |
| Plugin / skills | Both plugin manifests, which must agree | `agent-ks-plugin-vX.Y.Z` | `plugins/agent-ks/release-notes/` | `.github/workflows/agent-ks-plugin-release.yml` |
| Rust CLI | `agent-ks-cli/Cargo.toml` | `agent-ks-cli-vX.Y.Z` | `agent-ks-cli/release-notes/` | `.github/workflows/agent-ks-cli-release.yml` |

## Tag routing and published payloads

The tag namespace is the workflow router. An `agent-ks-engine-vX.Y.Z` tag triggers only the engine release workflow, an `agent-ks-plugin-vX.Y.Z` tag triggers only the plugin release workflow, and an `agent-ks-cli-vX.Y.Z` tag triggers only the CLI release workflow. In every namespace, `X.Y.Z` must exactly match that product's version source in the table above or validation fails.

Engine and plugin releases are metadata-only. Their workflows publish the committed release note plus the tag, full commit SHA, and exact Git tree ID for `agent-ks-engine/` or `plugins/agent-ks/`; they do not build or upload custom archives. GitHub's automatic source-code archives are outside this policy. Only the CLI workflow builds and uploads platform binaries with `SHA256SUMS`, and the installer and updater select only its tag namespace.

## Checks and publishing boundary

Run the local contract before any tag is created:

```bash
mise run release-check
```

The gate parses all four release-related workflows, checks exact tag triggers, resolves current product versions and notes, confirms both plugin manifests agree, verifies the two metadata subtree paths as Git trees, rejects custom assets from engine/plugin workflows, and requires CLI assets plus checksums.

Normal branch and pull-request checks are separate from publishing. Only the three product-tag workflows have write permission and release commands. Agents prepare version declarations, notes, and code changes but do not tag, push, or publish; the repository owner performs those outward actions after review.

## Product instructions

- [Engine release notes and migration-oriented note shape](./agent-ks-engine/release-notes/README.md)
- [Plugin release notes and marketplace relationship](./plugins/agent-ks/release-notes/README.md)
- [CLI builds, installer, updater, and binary packaging](./agent-ks-cli/README.md#release-independently)
