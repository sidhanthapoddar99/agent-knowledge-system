---
title: "Declaring libraries in dep.yaml"
---

`config/dep.yaml` lists every library your project uses, and which version of each. This page shows how to write an entry, how to choose a version, and what agentks refuses. You can edit the file by hand, or let `agentks library add` write the entry for you ([installing, updating and removing](./10_installing-and-updating.md)).

## The file is required

Every agentks project has `config/dep.yaml`, even when it uses no library. agentks refuses to start without it. A project with no libraries writes:

```yaml
libraries: {}
```

The file also gives agents one fixed place to look for a project's libraries.

## An example

```yaml
# config/dep.yaml
libraries:
  default:                                   # the alias: pages write default:server
    github: NeuraLabsHQ/agent-knowledge-system-library
    tag: ^1.0                                # the newest 1.x.y release
  kit:
    github: acme/design-kit
    path: libraries/frames                   # the library's folder inside the repository
    tag: 1.4.0                               # exactly this version
  shapes:
    git: https://gitlab.com/acme/shapes.git  # any git host works
  nightly:
    github: acme/widgets
    branch: main                             # follows a branch, moved only when you update
  team:
    path: ../artifacts                       # a folder in this repository, relative to dep.yaml
```

`acme/design-kit`, `acme/shapes` and `acme/widgets` stand in for any library you want to use.

## The fields

Each key under `libraries:` is an **alias**, the short name your pages use for that library.

| Field | Required | Meaning |
|---|---|---|
| the key | yes | The alias. Lower-case letters, digits and hyphens, starting with a letter |
| `github` | for a git entry, `github` or `git` | `owner/repo` on GitHub |
| `git` | | Any git URL, HTTPS or SSH: GitLab, a self-hosted server, anything |
| `path` | for a local entry; optional for a git entry | For a git entry, the library's folder inside the repository (default: the repository root). For a local entry, the library's folder, relative to `dep.yaml` |
| `tag` | at most one of `tag`, `commit` and `branch` | An exact version such as `1.4.0`, or a range such as `^1.4` |
| `commit` | | A full 40-character commit hash |
| `branch` | | A branch name |

## Choosing a version

A git entry picks its version with at most one **selector**:

| You write | agentks uses | It moves when |
|---|---|---|
| nothing | The newest release | You run `agentks install --update` |
| `tag: 1.4.0` | That exact release | Never. Edit the tag to change it |
| `tag: ^1.4` | The newest release in the range | You run `agentks install --update` |
| `commit: 3f9c2a1e…` | That commit | Never. Edit the hash to change it |
| `branch: main` | The branch's newest commit | You run `agentks install --update` |

Whatever you write, `dep.lock` records one exact commit. Starting agentks never moves that pin. Only `agentks install --update` does, and only when you run it.

### Releases and version tags

A **release** is a git tag named `x.y.z` or `vx.y.z`, such as `1.4.0` or `v1.4.0`. agentks ignores every other tag when it looks for versions.

- **A range** follows semantic versioning. `^1.4` means `>=1.4.0 <2.0.0`. `~1.4.2` means `>=1.4.2 <1.5.0`. You can combine comparators: `>=1.2.0 <2.0.0`.
- **A pre-release** such as `2.0.0-beta.1` matches only an exact `tag`. A range and "newest release" skip it.
- **A repository with no version tags** needs a `branch` or a `commit`. With no selector, agentks stops with an error rather than guess.

A range such as `^1.0` is a good default. You get the library's fixes and new elements when you ask for them, and nothing moves on its own.

## Local libraries

An entry with only `path:` points at a folder in your own repository. Use it for your team's own artifacts, or to test a library you are building.

- The path is relative to `dep.yaml`, so `../artifacts` from `config/dep.yaml` is the `artifacts/` folder beside `config/`.
- The folder must stay inside the project's git repository. A path that leads outside it is an error, because the library would be missing on every other machine. Outside a git repository, the project folder is the limit.
- agentks reads a local library in place. It is not pinned and not copied into the machine cache, because it is already under your project's version control.
- While `agentks start` runs, a change to a local library shows up like a change to a page.

A local library may skip `manifest.json`. [Building a library](./35_building-a-library.md#a-local-library-without-a-manifest) explains how agentks then names its elements.

## What agentks refuses

agentks checks `dep.yaml` every time it loads the project. It stops with an error that names the file, the alias and the fix when:

- the file is missing, is not valid YAML, or has no `libraries:` key;
- an alias breaks the naming rule;
- the file or an entry has a key agentks does not know, such as a misspelt `tags:`;
- an entry has both `github` and `git`;
- an entry has more than one selector;
- a local entry has a selector;
- a local `path` leads outside the repository.

The file is only half the story. Once an entry is valid, agentks resolves it and records the result in `dep.lock`: see [installing, updating and removing](./10_installing-and-updating.md).
