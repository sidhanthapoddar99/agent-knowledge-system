# Release architecture

This repository has three independent release streams. No stream borrows another product's version, tag, note, or payload.

| Product | Version source | Numbered tag | Moving alias | Notes | Publishing workflow |
|---|---|---|---|---|---|
| Engine | `ENGINE_VERSION` in `agent-ks-engine/src/loaders/engine-version.ts` | `agent-ks-engine-vX.Y.Z` | `engine-latest` | `agent-ks-engine/release-notes/` | `.github/workflows/agent-ks-engine-release.yml` |
| Plugin / skills | Both plugin manifests, which must agree | `agent-ks-plugin-vX.Y.Z` | `plugin-latest` | `plugins/agent-ks/release-notes/` | `.github/workflows/agent-ks-plugin-release.yml` |
| Rust CLI | `agent-ks-cli/Cargo.toml` | `agent-ks-cli-vX.Y.Z` | `cli-latest` | `agent-ks-cli/release-notes/` | `.github/workflows/agent-ks-cli-release.yml` |

## Tag routing and published payloads

The tag namespace is the workflow router. An `agent-ks-engine-vX.Y.Z` tag triggers only the engine tag workflow, an `agent-ks-plugin-vX.Y.Z` tag triggers only the plugin tag workflow, and an `agent-ks-cli-vX.Y.Z` tag triggers only the CLI release workflow. In every namespace, `X.Y.Z` must exactly match that product's version source in the table above or validation fails.

Numbered tags are immutable. The three `*-latest` tags are lightweight moving aliases owned by their corresponding workflow. Engine and plugin aliases advance after their numbered tag passes workflow validation; the CLI alias advances after its stable numbered GitHub release publishes successfully. Alias names do not match any release trigger.

Moving aliases never have GitHub release pages. Only immutable numbered CLI tags have release pages, archives, and checksums. After `cli-latest` converges, the workflow explicitly marks the numbered release at that commit as GitHub's repository-wide Latest release.

The engine and plugin workflows validate the triggering numbered tag against their version source, release note, commit, and product subtree before offering it to the moving alias. The CLI workflow scans every published, non-draft, non-prerelease numbered CLI release and selects the greatest numeric `X.Y.Z`. Product-scoped workflow concurrency serializes ordinary runs, and a force-with-lease update prevents a stale or out-of-order run from overwriting a newer alias. An older rerun therefore never points an alias backwards.

CLI GitHub display titles are product-first: `CLI X.Y.Z`, followed by ` — <description>` when the note heading supplies one. The shared title formatter removes an existing `CLI` or `agent-ks` prefix before composing the title, so reruns cannot duplicate it. An older rerun selects the greatest published stable CLI version before moving `cli-latest` or changing GitHub's Latest designation, so neither pointer regresses.

Engine and plugin releases are tag-only. Their workflows validate the committed release note, full commit SHA, and exact Git tree ID for `agent-ks-engine/` or `plugins/agent-ks/`, then maintain the product's moving tag. They do not create GitHub release objects or build or upload archives. Only the CLI workflow creates numbered GitHub releases and uploads platform binaries with `SHA256SUMS`; the installer and updater select only its tag namespace.

## Checks and publishing boundary

Run the local contract before any tag is created:

```bash
mise run release-check
```

The gate parses all four release-related workflows, checks exact tag triggers, moving aliases, concurrency, CLI title generation and post-publication ordering, resolves current product versions and notes, confirms both plugin manifests agree, verifies the engine and plugin subtree paths as Git trees, rejects every GitHub-release command from their tag-only workflows, and requires CLI assets plus checksums. It also runs the pure release-control regression tests for numeric ordering, failed/draft/prerelease filtering, older reruns, and product-first CLI titles.

Normal branch and pull-request checks are separate from publishing. The three product-tag workflows have write permission only to maintain their latest aliases and, for CLI, its GitHub releases. Agents prepare version declarations, notes, and code changes but do not create or move numbered tags, push them, or publish; the repository owner performs those outward actions after review.

## Product instructions

- [Engine release notes and migration-oriented note shape](./agent-ks-engine/release-notes/README.md)
- [Plugin release notes and marketplace relationship](./plugins/agent-ks/release-notes/README.md)
- [CLI builds, installer, updater, and binary packaging](./agent-ks-cli/README.md#release-independently)
