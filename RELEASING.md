# Release architecture

Engine and plugin versions use immutable numbered Git tags and committed release notes. Only numbered CLI versions have GitHub release pages and downloadable binaries.

| Product | Version source | Tag | Notes |
|---|---|---|---|
| Engine | `ENGINE_VERSION` | `agent-ks-engine-vX.Y.Z` | [Engine notes](./agent-ks-engine/release-notes/README.md) |
| Plugin | Both plugin manifests | `agent-ks-plugin-vX.Y.Z` | [Plugin notes](./plugins/agent-ks/release-notes/README.md) |
| CLI | Cargo package version | `agent-ks-cli-vX.Y.Z` | [CLI notes](./agent-ks-cli/release-notes/) |

The engine and plugin tag workflows validate the version, matching note, commit, and product subtree. They have read-only permissions and create no releases or tags.

The single [CLI release workflow](./.github/workflows/agent-ks-cli-release.yml) runs only when a numbered CLI tag is pushed. It validates the tag and note, then runs formatting, clippy, tests, and release builds on Linux x64/ARM64, macOS Intel/Apple Silicon, and Windows x64. Linux jobs also test the installer. Publication requires every build to succeed. No CLI builds run on branch pushes or pull requests.

The CLI workflow publishes five archives and `SHA256SUMS`. Titles use `CLI X.Y.Z — description`. After publication, it selects the numerically greatest published stable numbered CLI release and explicitly marks it as GitHub's official Latest. Product-scoped concurrency serializes publication and Latest changes; an older rerun selects the newest stable version. GitHub's Latest designation is release metadata, not a Git tag.

CLI discovery uses the official Latest endpoint, validates the stable numbered CLI tag and required assets, and falls back to bounded numbered-release history when discovery fails. Downloads retain checksum, archive, executable-version, pin, downgrade, and atomic replacement checks.

Run `mise run release-check` before pushing a numbered tag. The independent Release Contracts workflow runs on relevant branch changes and pull requests. The gate validates versions, notes, README badges/table, tag triggers, the complete CLI matrix, and publication dependencies.
