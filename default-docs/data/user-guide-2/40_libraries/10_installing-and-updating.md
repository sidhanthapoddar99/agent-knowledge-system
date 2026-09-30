---
title: "Installing, updating and removing"
---

This page covers the life of a library in your project: adding it, what `config/dep.lock` records, how installs and updates work, removing it, and cleaning up the machine cache. Every command here takes `--json`, for agents and scripts.

## Add a library

`agentks library add` writes the `dep.yaml` entry, resolves it, installs it and prints a summary.

```bash
agentks library add agentks-default --as default     # a catalog name
agentks library add acme/design-kit --tag ^1.4       # owner/repo on GitHub
agentks library add https://gitlab.com/acme/shapes.git
agentks library add --local artifacts --as team      # a folder in this repository
```

| Flag | Meaning |
|---|---|
| `--as <alias>` | The alias your pages use. Without it, agentks uses the catalog name or the repository name |
| `--path <folder>` | The library's folder inside the repository |
| `--tag <version>` · `--commit <hash>` · `--branch <name>` | The version to use, as in [dep.yaml](./05_dep-yaml.md#choosing-a-version). Give at most one |
| `--local <folder>` | A folder in your repository instead of a git source. agentks writes the path relative to `dep.yaml` |

Before it installs, `library add` prints the library's source and a summary of its manifest, so you see what you are adding. It refuses an alias that `dep.yaml` already has.

Adding from the catalog writes an ordinary entry. After this, the catalog plays no part:

```yaml
libraries:
  default:
    git: https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git
```

## What dep.lock records

`config/dep.lock` records the exact commit of every git library. Commit it beside `dep.yaml`, so every machine and every build uses the same commits. For an entry that asks for `github: NeuraLabsHQ/agent-knowledge-system-library` with `tag: ^1.0`, the lock looks like this:

```yaml
# config/dep.lock: written by agentks, never edited by hand
libraries:
  default:
    github: NeuraLabsHQ/agent-knowledge-system-library
    requested: tag ^1.0
    commit: 9d02e11c5a7f…
    version: 1.0.0
```

- `requested` is the selector as you wrote it: `latest`, `tag ^1.0`, `commit …` or `branch main`. It tells agentks when you changed an entry.
- `commit` is the pin. Git checks every fetched file against it, so it is also the integrity check.
- `version` comes from the library's `manifest.json` at that commit.
- Local libraries are not in the lock. A project with only local libraries has no `dep.lock`.

Only agentks writes the lock: `agentks start`, `agentks install`, `agentks library add`, `agentks library remove`, and `agentks init` when it creates a project. It sorts the aliases, so a change shows as a small diff.

## Install

`agentks start` and `agentks install` run the same sync:

1. Read `dep.yaml` and check it. Stop on any error.
2. Keep the pin of every entry that has not changed.
3. Resolve every entry that is new or changed, and drop entries you removed.
4. Fetch every pinned commit the machine cache does not have yet.
5. Check each library's manifest, and check that its `engine` range includes your agentks version.
6. Write the lock and report each change.

**Starting agentks never moves an existing pin.** It only installs what is missing and resolves what you changed. Run `agentks install` on its own after a fresh clone, in CI, or before you go offline.

If a sync fails while resolving, fetching or checking, agentks leaves the old lock as it was. A page never renders against a half-updated set of libraries.

## Update

```bash
agentks install --update            # every branch, range and newest-release entry
agentks install --update default    # only these aliases
```

An update resolves each chosen entry again and prints each change as old → new. Entries with an exact `tag` or a `commit` never move. Change the entry in `dep.yaml` to move them.

Every library states the agentks versions it works with. When the newest matching release needs a different agentks, the update fails and names both versions. It does not fall back to an older release, so an install never surprises you. Pick a narrower selector, or keep the older agentks for this project; [upgrading](../60_upgrading/01_overview.md) explains how to pin a version.

## Remove and list

```bash
agentks library remove kit    # removes the entry and its lock record
agentks library list          # alias, source, pinned commit, version, element count
```

`library remove` leaves the cached files on the machine until you clean the cache.

## Private repositories and offline use

- **Private repositories.** agentks uses your machine's git credentials: your SSH keys and your git credential helper.
- **Offline.** agentks needs the network only to resolve a new or changed entry, or to fetch a commit the machine does not have. If a pinned commit is missing and the machine is offline, agentks stops with an error that names the library and `agentks install`.

## Clean the machine cache

agentks never deletes cached libraries on its own. When you want the space back, `agentks cache status` shows how much the cache uses, and `agentks cache clean <folder>...` finds your projects in the folders you name, keeps every commit their locks need, and removes the rest after a report and your yes. A commit removed by mistake is fetched again on the project's next start. [Getting started](../05_getting-started/01_overview.md) covers the machine home and its cleanup in full.

## When something goes wrong

Every error names the entry or the page, what is wrong, and the command that fixes it.

| Situation | What agentks does |
|---|---|
| No release matches the selector, or the repository has no version tags | Stops, names the alias and the tags it found, and suggests a `branch` or a `commit` |
| A library's `engine` range excludes your agentks | Stops, names the library, its range and your version. Suggests `agentks install --update`, a narrower selector, or keeping the older agentks |
| A library's manifest is missing or broken | Stops and names the library and the field |
| No access to a private repository | Stops, names the repository and says how to sign in |
