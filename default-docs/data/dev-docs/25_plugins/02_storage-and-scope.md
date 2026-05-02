---
title: Storage and Scope
description: Where plugin files live on disk, the boolean-per-scope model, and how multi-scope installs work
---

# Storage and Scope

The most important thing to understand about plugins is the difference between the **cache** (where files actually live) and the **registration** (which scope's `settings.json` says the plugin is enabled). They're independent — and not understanding this leads to a lot of confusion about scope-vs-duplication.

## The cache — files live once, at user level

When you install a plugin, the files are downloaded **once** to your user-level cache:

```
~/.claude/plugins/cache/<marketplace-name>/<plugin-name>/<version>/
```

For example, after installing `documentation-guide@sids-plugin-marketplace`, the files land at:

```
~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.1.3/
├── .claude-plugin/plugin.json
├── README.md
├── LICENSE
├── bin/
├── commands/
└── skills/
```

This is true **regardless of which scope you "installed" into**. There is no project-local plugin cache. There is no per-scope copy. Files live in one place.

Multiple **versions** can coexist — `~/.claude/plugins/cache/<marketplace>/<plugin>/0.1.0/` and `.../0.2.0/` can sit side-by-side. `/plugin update` adds new version folders; older ones stick around until cleaned up.

## The registration — a boolean per scope

What actually differs across scopes is a single boolean in each scope's `settings.json`:

```json
{
  "enabledPlugins": {
    "documentation-guide@sids-plugin-marketplace": true
  }
}
```

That's all "installing at project scope" means: the boolean is written into `<repo>/.claude/settings.json` instead of `~/.claude/settings.json`. The plugin files themselves never move.

## Active set = union across scopes

At session start, Claude Code reads `enabledPlugins` from every applicable scope (Managed + Local + Project + User) and computes the **union**. Each enabled plugin loads **once** even if multiple scopes enable it.

This means there is **no duplication problem** with multi-scope installs. Verified empirically: enabling `claude-md-management` at both user and project scope simultaneously results in exactly one cache folder, one set of skills, one entry in `/reload-plugins`'s output.

| Scope | settings.json location | Visibility |
|---|---|---|
| **Managed** | Set by admin | Locked, can't be overridden |
| **User** | `~/.claude/settings.json` | All your projects, this machine |
| **Project** | `<repo>/.claude/settings.json` | This project, all team members (committed) |
| **Local** | `<repo>/.claude/settings.local.json` | This project, just you (gitignored) |

Precedence (more specific wins): Managed > Local > Project > User.

> [!important]
> A teammate cloning the repo gets the project-scope `enabledPlugins` boolean from the committed `settings.json`. The plugin files themselves only download to *their* user-level cache the first time they open the project — at no point does the repo carry plugin binaries.

## Updates

```
/plugin update                           # updates all installed plugins
/plugin update <plugin>@<marketplace>    # updates a specific plugin
```

This re-fetches the plugin source from its marketplace, drops the new version into a sibling folder under `~/.claude/plugins/cache/<marketplace>/<plugin>/<new-version>/`, and switches the active version. Older versions remain in the cache until cleaned up.

If you want to pin a version, edit the `enabledPlugins` entry to include a version specifier (the syntax depends on the Claude Code release; see the official plugin docs).

## Disabling vs uninstalling

| Action | Command | Effect |
|---|---|---|
| **Disable** | `/plugin disable <plugin>@<marketplace>` | Sets the scope's boolean to `false`. Files remain in cache. |
| **Enable** | `/plugin enable <plugin>@<marketplace>` | Sets the boolean back to `true`. |
| **Uninstall** | `/plugin uninstall <plugin>@<marketplace>` | Removes the boolean and (typically) clears the cache folder. |
| **Reload** | `/reload-plugins` | Re-reads installed plugins from cache without re-downloading. |

`/reload-plugins` is the cheapest way to pick up local edits during plugin development — no network, no install dance, just re-read the cache.

## File location reference

```
# User scope ── ~/.claude/
~/.claude/
├── settings.json                   ← global enabledPlugins (user)
└── plugins/
    └── cache/
        └── <marketplace-name>/
            └── <plugin-name>/
                └── <version>/      ← THE ACTUAL PLUGIN FILES live here, ONCE
                    ├── .claude-plugin/plugin.json
                    ├── bin/
                    ├── skills/
                    ├── commands/
                    └── …

# Project scope (committed to git)
<repo>/.claude/settings.json        ← project enabledPlugins (project)

# Project local (gitignored)
<repo>/.claude/settings.local.json  ← personal enabledPlugins (local)
```

Notice that project-scope folders have **no `plugins/` directory** — there's no per-project cache. This is by design.

## See also

- **[Installation](./03_installation.md)** — picking the right scope for an install
- **[Marketplaces](./04_marketplaces.md)** — where the plugin files come from
- **[Testing and Benchmarking](./05_creating-plugins/05_testing-and-benchmarking.md)** — bypassing the cache entirely with `--plugin-dir` during development
