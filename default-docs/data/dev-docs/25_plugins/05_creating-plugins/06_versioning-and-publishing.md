---
title: Versioning and Publishing
description: The version field, /plugin update flow, semver discipline, and going from local iteration to public release
---

# Versioning and Publishing

Plugins carry a `version` field in `plugin.json`. The runtime uses it to:

- Name the cache folder (`~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`)
- Coexist multiple installed versions side-by-side
- Drive the `/plugin update` flow

Versioning matters more once you have consumers. While iterating alone, `0.1.0` is fine.

## The `version` field

```json
{
  "name": "my-plugin",
  "version": "0.1.0",
  …
}
```

Use semantic versioning (`MAJOR.MINOR.PATCH`). The convention:

- **PATCH** (`0.1.0` → `0.1.1`) — bug fixes, doc updates, no behaviour change
- **MINOR** (`0.1.0` → `0.2.0`) — new capabilities (added a skill / command / wrapper) without breaking existing ones
- **MAJOR** (`0.1.0` → `1.0.0`) — breaking changes; consumers may need to adjust expectations

The `version` field is what the runtime reads to decide whether `/plugin update` has new content to fetch. Bump it whenever you push a change you want consumers to see.

## How `/plugin update` works

```
/plugin update                            # update all installed plugins
/plugin update <plugin>@<marketplace>     # update one
```

This:

1. Re-fetches the marketplace source (Git pull, or re-read of the local path)
2. Reads the plugin's `plugin.json` to find the new version
3. If the version differs, downloads the new version into `~/.claude/plugins/cache/<marketplace>/<plugin>/<new-version>/`
4. Switches the active version

Old versions remain in the cache. Cleanup happens via `/plugin uninstall` or manual removal of cache folders.

> [!note]
> Versioning policy varies by Claude Code release. Pin specifiers in `enabledPlugins` (if supported by your version) let consumers freeze to a specific version. Most plugins early in their lifecycle just live on `latest` (whatever's at `main` in the marketplace repo).

## Publishing checklist

When a plugin is ready to share publicly:

1. **Pick a license** — replace any `TBD` placeholder in `LICENSE` with a real SPDX identifier (MIT, Apache-2.0, GPL-3.0, etc.). Update `plugin.json`'s `license` field if you set one.
2. **Bump the version** — `0.1.0` → `1.0.0` is the conventional "this is stable" signal.
3. **Write a real `README.md`** — install command, what it does, screenshots if relevant, requirements.
4. **Verify the install loop end-to-end** — clone to a clean directory, `/plugin marketplace add`, `/plugin install`, run a wrapper / trigger a skill / fire a command. If it doesn't work in a clean repo, it won't work for consumers.
5. **Push to GitHub** (or wherever you're hosting the marketplace). Now consumers can `/plugin marketplace add https://github.com/you/repo`.
6. **Document the install path** — README, project CLAUDE.md, wherever your users look.

## Pre-1.0 vs post-1.0

| Phase | Versioning style |
|---|---|
| Pre-1.0 (`0.x.y`) | Anything goes — the version is mostly a marker for "did the cache content change?" |
| Post-1.0 | Semver discipline. Breaking changes require a major bump. Document migration in the README. |

For a one-author plugin used in your own projects, you can stay on `0.x` indefinitely. The convention only matters when other people depend on you.

## The dogfood release loop

If the plugin lives in the same repo as the marketplace (and the marketplace is one of your own projects), the release loop becomes very tight:

1. Edit plugin source
2. Bump `plugin.json` version (e.g. `0.1.1` → `0.1.2`)
3. Commit + push
4. In your project: `/plugin update <plugin>@<marketplace>` → re-fetches the new version
5. `/reload-plugins`
6. Verify

The whole loop can be 30 seconds. Compare to traditional package release (publish to registry, wait for indexing, bump consumer's lockfile, install) — the plugin model trades discoverability of a centralised registry for the speed of a Git remote.

### This repository's independent plugin release

The `agent-ks` plugin declares the same version in its Claude and Codex manifests. A release requires `plugins/agent-ks/release-notes/<version>.md`, then the repository owner tags the reviewed `main` commit as `agent-ks-plugin-v<version>`.

The [plugin tag workflow](../../../../../.github/workflows/agent-ks-plugin-release.yml) verifies both manifests, the note, the full commit SHA, and the exact `plugins/agent-ks/` Git tree ID. It advances `plugin-latest` but creates no GitHub release page or archive because the marketplace remains the distribution channel. The engine and Rust CLI have separate `agent-ks-engine-vX.Y.Z` and `agent-ks-cli-vX.Y.Z` streams.

## Multiple plugins in one marketplace

A marketplace can ship N plugins, each with its own `version`. Consumers update them independently:

```
/plugin update plugin-a@my-marketplace
/plugin update plugin-b@my-marketplace
```

Or update everything:

```
/plugin update
```

`/plugin update` walks every installed plugin and checks for new versions in their respective marketplaces.

## Versioning the marketplace itself

`marketplace.json` doesn't carry a top-level version field — the marketplace is just a catalogue. What's versioned is each plugin entry. If you add a new plugin to the marketplace, existing consumers see it the next time they `/plugin marketplace update <marketplace>` (or their next `/plugin update` cycle).

## Common pitfalls

- **Forgetting to bump the version** — `/plugin update` becomes a no-op. Consumers report "the new feature isn't showing up." Fix: always bump `version` on a change worth distributing.
- **Major bumps without migration notes** — consumers on `1.x` get surprised by `2.0` breaking changes. Always document the breakage.
- **Pinning consumers to `0.0.1`** — pre-1.0 churn is real. If you're shipping to others, get to `1.0` once the surface area is stable.
- **Skipping the README update** — when a plugin gains a new capability, the README is the user's first read. Update it in the same commit as the version bump.

## See also

- **[Marketplaces](../04_marketplaces.md)** — what the marketplace is doing on the consumer side
- **[Storage and Scope](../02_storage-and-scope.md)** — how versioned cache folders coexist
- **[Testing and Benchmarking](./05_testing-and-benchmarking.md)** — the iteration loop before publishing
