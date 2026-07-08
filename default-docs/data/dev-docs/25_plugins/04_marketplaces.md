---
title: Marketplaces
description: What a marketplace is, what marketplace.json contains, and how to host one
---

# Marketplaces

A **marketplace** is a Git repository (or local directory) that catalogues one or more plugins. Users add a marketplace once, then install any plugin it ships. Marketplaces are how plugins reach consumers.

## Marketplace structure

The minimum:

```
my-marketplace/
└── .claude-plugin/
    └── marketplace.json     ← the catalogue
```

In practice, the marketplace usually also contains the plugin folders it lists (so the marketplace and plugins live in one repo):

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── plugins/
    ├── plugin-a/            ← each plugin is a folder
    │   ├── .claude-plugin/plugin.json
    │   └── skills/
    └── plugin-b/
        └── ...
```

Plugins can also be hosted in separate repos and referenced from the marketplace by Git URL.

## marketplace.json schema

Minimal:

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "plugin-a",
      "source": "./plugins/plugin-a",
      "description": "One-line description shown in the /plugin browser"
    }
  ]
}
```

Fields:

| Field | Required | Notes |
|---|---|---|
| `name` | yes | Marketplace identifier; consumers reference it as `<plugin>@<marketplace>` |
| `owner.name` | yes | Display name of the maintainer |
| `plugins` | yes | Array of plugin entries |
| `plugins[].name` | yes | Must match the `name` in the plugin's `plugin.json` |
| `plugins[].source` | yes | Path to plugin folder, relative to the marketplace root (or a Git URL for plugins hosted elsewhere) |
| `plugins[].description` | recommended | Shown in the `/plugin` browser; keep it information-dense |

## Hosting options

### GitHub repo (most common)

Push the marketplace to GitHub. Consumers add it with the GitHub URL:

```
/plugin marketplace add https://github.com/sidhanthapoddar99/sids-plugin-marketplace
```

Or the GitHub shorthand:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
```

Updates flow naturally — `/plugin update` re-fetches from `main` (or whichever branch the marketplace tracks).

### Local path

For developing against an in-flight marketplace:

```
/plugin marketplace add /home/you/repos/my-marketplace
/plugin marketplace add ./my-marketplace
```

> [!warning]
> `file://` URLs are rejected with `"Invalid marketplace source format"` despite being a natural guess. Use a plain absolute or relative path.

### Private / self-hosted Git

Any Git URL works — GitLab, Bitbucket, internal Gerrit, anything Claude Code can `git clone` from. The CLI uses your local Git auth.

For private GitHub or SSH-only hosts, use the SSH URL form:

```
/plugin marketplace add git@github.com:your-org/your-marketplace.git
```

### Direct URL to marketplace.json

If your marketplace isn't backed by a Git repo (e.g. a static file hosted on a CDN or internal server), point at the manifest directly:

```
/plugin marketplace add https://example.com/marketplace.json
```

Claude Code fetches the manifest and resolves plugin sources from the URLs listed inside. The plugins themselves can still be in any backend the manifest references.

## How this plugin is distributed

`plugins/agent-ks/` is published through [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace) — a standalone marketplace that fetches just this subdirectory via a `git-subdir` source.

While hacking on the plugin in this repo, you don't need to round-trip through the marketplace. Load the on-disk folder directly:

```
claude --plugin-dir plugins/agent-ks
```

`--plugin-dir` mounts the plugin for that session only, with no marketplace registration and no cache copy. If you also have it installed normally, the `--plugin-dir` copy shadows the install for the session — see [Testing and Benchmarking](./05_creating-plugins/05_testing-and-benchmarking.md).

> [!note]
> `sids-plugin-marketplace` also ships [`ai-toolkit-dev`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace/tree/main/plugins/ai-toolkit-dev) — a toolkit for authoring Claude Code plugins, marketplaces, and skills. Useful for plugin development workflow if you're iterating on `agent-ks` or any other plugin.

## Listing multiple plugins

A marketplace can ship many plugins:

```json
{
  "name": "my-marketplace",
  "owner": { "name": "Acme Corp" },
  "plugins": [
    {
      "name": "core-tools",
      "source": "./plugins/core-tools",
      "description": "Core CLI wrappers for Acme dev workflow"
    },
    {
      "name": "deploy",
      "source": "./plugins/deploy",
      "description": "Deployment scripts and pre-flight hooks"
    },
    {
      "name": "external-thing",
      "source": "https://github.com/other-org/external-thing",
      "description": "Plugin maintained in a separate repo"
    }
  ]
}
```

Each plugin keeps its own `plugin.json`, version, and update cadence. Consumers install them independently:

```
/plugin install core-tools@my-marketplace
/plugin install deploy@my-marketplace
```

## Marketplace scope

Marketplaces themselves only register at **user scope**. There's no per-project marketplace registration. (`extraKnownMarketplaces` in project settings is a discovery hint, not an install path.) If a teammate clones a repo with `enabledPlugins` referencing a marketplace they haven't added, they'll need to `/plugin marketplace add <url>` before the plugin can install.

## See also

- **[Storage and Scope](./02_storage-and-scope.md)** — what happens after `/plugin install`
- **[Plugin Structure](./05_creating-plugins/02_plugin-structure.md)** — what goes inside each plugin folder the marketplace lists
- **[Versioning and Publishing](./05_creating-plugins/06_versioning-and-publishing.md)** — semver, releases, and the publish loop
