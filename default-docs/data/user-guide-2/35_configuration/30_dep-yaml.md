---
title: "dep.yaml and dep.lock"
description: "The two config files that list a project's libraries and pin them: what they hold, why dep.yaml is required, and which commands write them."
---

`config/dep.yaml` lists the **libraries** a project uses: git repositories or local folders of reusable elements such as icons, frames, charts and widgets. `config/dep.lock` records the exact commit of each one. This page covers the two files as part of the config. [Libraries](../40_libraries/01_overview.md) covers finding, adding and using libraries.

## dep.yaml is required

Every project has a `config/dep.yaml`, even one that uses no libraries. The smallest valid file is:

```yaml
libraries: {}
```

It is required for two reasons:

- **Agents know where to look.** An agent that wants to reuse an element always finds the project's libraries in the same file.
- **It marks the folder as an agentks project.** `agentks cache clean` finds projects on your disk by their `config/dep.yaml`, and keeps the libraries they need.

A missing `dep.yaml` stops agentks with an error that names the fix: create the file with `libraries: {}`.

## What an entry looks like

```yaml
libraries:
  icons:                                   # the alias
    github: NeuraLabsHQ/agent-knowledge-system-library
  kit:
    github: acme/design-kit
    path: libraries/frames                 # the library's folder in the repository
    tag: 1.4.0                             # an exact version
  team:
    path: ../artifacts                     # a local folder, relative to dep.yaml
```

Each key under `libraries:` is an **alias**, the short name artifacts use to refer to the library's elements. An entry names where the library comes from:

| Field | Meaning |
|---|---|
| `github` | A GitHub repository, as `owner/repo` |
| `git` | Any other git URL, HTTPS or SSH |
| `path` | For a git entry, the library's folder inside the repository. For a local entry, the folder relative to `dep.yaml` |
| `tag`, `commit` or `branch` | Which version of a git entry. At most one. None means the newest version tag |

[Libraries](../40_libraries/01_overview.md) documents version ranges, local libraries and the full rules.

## dep.lock is written for you

`config/dep.lock` pins every git library to one exact commit, so every machine that runs the project gets the same files. Local libraries are not locked, because they live in the project's own git history.

| Rule | Detail |
|---|---|
| Who writes it | agentks only: `agentks start`, `agentks install`, `agentks library add` and `agentks library remove` |
| Edit by hand | Never |
| Commit it | Always. It is what makes the project reproducible |
| When it changes | When `dep.yaml` changes, or when you ask for newer versions with `agentks install --update` |

## The commands that use these files

```sh
agentks library add acme/design-kit --as kit --tag 1.4.0   # add an entry, install it, update the lock
agentks library remove kit                                 # remove the entry and its lock record
agentks install                                            # install every locked commit this machine lacks
agentks install --update                                   # move branch, range and latest entries to their newest match
agentks library list                                       # the project's libraries and their pinned versions
```

You rarely need `agentks install` by hand: `agentks start` installs any locked library that is missing from the machine before it serves the project. The downloaded files live in the machine home, shared by every project; see [The machine home and cleanup](../05_getting-started/30_machine-home.md).

## Where libraries are used

Library elements appear only in HTML artifacts and video artifacts. Markdown pages never name a library, so a folder of pages stays portable to any editor. [Libraries](../40_libraries/01_overview.md) shows how an artifact loads an element.
