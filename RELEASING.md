# Release architecture

This repository has three independent release streams. No stream borrows another product's version, tag, note, or payload.

| Product | Version source | Numbered tag | Moving alias | Notes | Publishing workflow |
|---|---|---|---|---|---|
| Engine | `ENGINE_VERSION` in `agent-ks-engine/src/loaders/engine-version.ts` | `agent-ks-engine-vX.Y.Z` | `engine-latest` | `agent-ks-engine/release-notes/` | `.github/workflows/agent-ks-engine-release.yml` |
| Plugin / skills | Both plugin manifests, which must agree | `agent-ks-plugin-vX.Y.Z` | `plugin-latest` | `plugins/agent-ks/release-notes/` | `.github/workflows/agent-ks-plugin-release.yml` |
| Rust CLI | `agent-ks-cli/Cargo.toml` | `agent-ks-cli-vX.Y.Z` | `cli-latest` | `agent-ks-cli/release-notes/` | `.github/workflows/agent-ks-cli-release.yml` |

## Tag routing and published payloads

The tag namespace is the workflow router. An `agent-ks-engine-vX.Y.Z` tag triggers only the engine release workflow, an `agent-ks-plugin-vX.Y.Z` tag triggers only the plugin release workflow, and an `agent-ks-cli-vX.Y.Z` tag triggers only the CLI release workflow. In every namespace, `X.Y.Z` must exactly match that product's version source in the table above or validation fails.

Numbered tags are immutable. The three `*-latest` tags are lightweight moving aliases owned by their corresponding workflow. An alias is advanced only after that product's stable GitHub release publishes successfully. Alias names do not match any release trigger and do not create GitHub releases of their own.

Before moving an alias, the shared release control scans every published, non-draft, non-prerelease release in that product's namespace and selects the greatest numeric `X.Y.Z`. Product-scoped workflow concurrency serializes ordinary runs, and a force-with-lease update prevents a stale or out-of-order run from overwriting a newer alias. An older rerun therefore keeps or repairs the newest stable target; it never points the alias backwards.

GitHub display titles are product-first: `Engine X.Y.Z`, `Plugin X.Y.Z`, or `CLI X.Y.Z`, followed by ` — <description>` when the note heading supplies one. The shared title formatter removes an existing product or `agent-ks` prefix before composing the title, so reruns cannot duplicate it.

Engine and plugin releases are metadata-only. Their workflows publish the committed release note plus the tag, full commit SHA, and exact Git tree ID for `agent-ks-engine/` or `plugins/agent-ks/`; they do not build or upload custom archives. GitHub's automatic source-code archives are outside this policy. Only the CLI workflow builds and uploads platform binaries with `SHA256SUMS`, and the installer and updater select only its tag namespace.

## Checks and publishing boundary

Run the local contract before any tag is created:

```bash
mise run release-check
```

The gate parses all four release-related workflows, checks exact tag triggers, moving aliases, concurrency, title generation and post-publication ordering, resolves current product versions and notes, confirms both plugin manifests agree, verifies the two metadata subtree paths as Git trees, rejects custom assets from engine/plugin workflows, and requires CLI assets plus checksums. It also runs the pure release-control regression tests for numeric ordering, failed/draft/prerelease filtering, older reruns, and product-first titles.

Normal branch and pull-request checks are separate from publishing. Only the three product-tag workflows have write permission and release commands. Agents prepare version declarations, notes, and code changes but do not create or move numbered tags, push them, or publish; the repository owner performs those outward actions after review. The workflows alone move the three latest aliases after successful publication.

## Product instructions

- [Engine release notes and migration-oriented note shape](./agent-ks-engine/release-notes/README.md)
- [Plugin release notes and marketplace relationship](./plugins/agent-ks/release-notes/README.md)
- [CLI builds, installer, updater, and binary packaging](./agent-ks-cli/README.md#release-independently)
