---
title: "Upgrading between 1.x releases"
description: "Keep projects current as agentks updates, migrate when a release changes the format, and hold one project on an older version with mise."
---

Most agentks updates need nothing from you: the binary updates itself and every project keeps working. This page covers the releases that change the content format, the libraries a project pins, and how to hold one project on an older version.

## How versions work

agentks has one version number, `x.y.z`, for the whole binary. Each project states the content version it targets in `engine_version` in `config/site.yaml`, and each binary reads a range of content versions, from an oldest one, the floor, up to its own version. [The version gate](../35_configuration/35_version-gate.md) explains the range.

Most releases leave the floor where it is, so projects need no change. A release raises the floor only when content in the old format would load wrongly without a conversion.

## When a release changes the format

1. **`agentks update` tells you.** When an update crosses a major version, it prints a note that names `agentks migrate`.
2. **The version gate stops each old project.** The error names the project's content version, the range this agentks reads, and the fix.
3. **You migrate each project** when it suits you:

   ```sh
   git status                  # commit first; migrate needs a clean tree
   agentks migrate --dry-run   # see what changes
   agentks migrate             # make the changes
   ```

This is the same runner, with the same safety rules, as [the move from agent-ks 0.x](./05_from-agent-ks-0x.md): it needs git and a clean tree, shows a dry run, checks its own work and raises `engine_version` last.

## Read the release notes

Each release has a note on the [agentks releases page](https://github.com/NeuraLabsHQ/agent-knowledge-system/releases). It states any breaking change and the migration to run. Read it before you update a machine whose projects you cannot migrate straight away.

## Libraries and the engine version

Every library states the agentks versions it supports. After an update, a library pinned in a project's `dep.lock` may not support the new version. agentks then stops, names the library and the versions it supports, and suggests a fix:

- Run `agentks install --update`. It moves entries that follow a branch, a version range or the latest version to their newest match. If that version supports your agentks, the problem is gone.
- For an entry pinned to one exact tag or commit, change the pin in `dep.yaml` to a version that supports your agentks.
- Or hold the project on an older agentks, as below.

`agentks migrate` also checks every pinned library, and lists every mismatch at once.

You never migrate a library yourself. Its owner publishes a new version, and you move your pin to it.

## Hold one project on an older version

To keep one project on a particular agentks while the rest of the machine updates, pin it with **mise**, a tool that picks program versions per folder. agentks has no version manager of its own. In the project's folder:

```sh
mise use github:NeuraLabsHQ/agent-knowledge-system@1.0.0
```

That writes the pin into the project's `mise.toml`:

```toml
[tools]
"github:NeuraLabsHQ/agent-knowledge-system" = "1.0.0"
```

Inside that folder, `agentks` is now 1.0.0. Everywhere else it is the version you installed. Commit `mise.toml` so everyone who works on the project uses the same version. Remove the pin when you migrate the project.

## A project newer than your agentks

If someone migrated a project with a newer agentks than yours, the version gate stops it and names `agentks update`. Update, or, if you have pinned the whole machine, unpin it with `agentks update --unpin`. [Install and update agentks](../05_getting-started/05_install.md) covers pins and automatic updates.

## Features newer than your version

These docs describe the newest agentks. A page about a feature added after 1.0.0 says which version it arrived in, such as "since 1.2". If your agentks is older, update to use it.
