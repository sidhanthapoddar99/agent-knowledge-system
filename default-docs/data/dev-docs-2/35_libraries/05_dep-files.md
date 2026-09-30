---
title: "dep.yaml and dep.lock"
description: "How the library crate parses, validates and writes a project's dependency list and its lock."
---

This page explains how the engine reads and writes the two library files in a project's `config/` folder. `dep.yaml` is what the user asks for. `dep.lock` is what agentks resolved. The code is in `apps/agentks-engine/crates/library/src/dep/`.

| File | Module | Holds |
|---|---|---|
| `mod.rs` | the types | `DepFile`, `DepEntry`, `GitSource`, `Selector`, `LockFile`, `LockEntry`, `Alias` |
| `parse.rs` | reading | `read_dep_yaml`, `parse_dep_yaml`, `read_lock`, `parse_lock` |
| `write.rs` | writing | `render_lock`, `write_lock`, `render_dep_yaml`, `write_dep_yaml` |
| `edit.rs` | in-place edits | `add_entry`, `remove_entry` |
| `local.rs` | local folders | `resolve_local`, `local_boundary` |
| `source.rs` | git addresses | the fetch URL and the store key of a `GitSource` |

## The types

`dep.yaml` becomes a `DepFile`: a sorted map from `Alias` to `DepEntry`. Sorting keeps every write in the same order.

| Type | Shape |
|---|---|
| `DepEntry::Git` | a `source`, an optional `path` inside the repository, and a `selector` |
| `DepEntry::Local` | a `path`, as written, relative to `dep.yaml` |
| `GitSource` | `github: owner/repo` (fetched from `https://github.com/owner/repo.git`), or `git: <url>` for any other host |
| `Selector` | `Latest`, `Tag`, `Commit` or `Branch`. An entry has at most one |
| `LockEntry` | the `source` and `path` as written, `requested`, the pinned `commit`, and the library's `version` |

An alias matches `^[a-z][a-z0-9-]*$`. `Alias::new` checks it. `Alias::from_name` turns a repository or catalog name into a valid alias, which is how `agentks library add` picks a default.

## Parsing and validation

The crate parses both files with `serde-saphyr`, a YAML parser that never panics and reports lines. It turns every broken rule into one error record with the line, the key `libraries.<alias>` and a fix, and it returns every problem at once.

| Situation | Error kind | Names |
|---|---|---|
| `config/dep.yaml` is missing | `config-missing` | `agentks migrate`, and `libraries: {}` for an empty project |
| Not valid YAML, no `libraries:` key, a bad alias, both `github` and `git`, a local entry with a selector, more than one selector, an unknown key | `library-invalid` | the alias and the rule broken |
| `dep.lock` is broken | `library-lock-invalid` | `agentks install` |

Unknown keys are errors, at the top level and inside an entry. Loosening a rule later is easy. Tightening one is a breaking change.

A git entry's `path` is normalised: `./a/` becomes `a`, and `.` becomes no path. A cosmetic change to the path therefore never re-resolves a pin.

## Local entries

A local entry keeps its path as a string, exactly as written, because a library may sit above the project's root and still inside its repository. For example, a project in `site/` can use `../../artifacts`.

`resolve_local` turns the string into a real folder. It refuses a path that is absolute, missing or not a folder. It also refuses one that leaves the boundary after following symlinks, because the library would then be missing on every other machine. `local_boundary` sets that boundary: the root of the git repository that holds the project, or the project root when there is no repository. The crate looks for the repository only when a local entry exists, so a project with only git libraries never needs git discovery.

## The lock

```yaml
# config/dep.lock: written by agentks, committed, never edited by hand
libraries:
  icons:
    github: NeuraLabsHQ/agent-knowledge-system-library
    requested: latest
    commit: 9d02e11c5a7f...
    version: 2.1.0
  kit:
    github: acme/design-kit
    path: libraries/frames
    requested: tag 1.4.0
    commit: 51aa0c3f9e20...
    version: 1.4.0
```

- **`requested` is the selector as written**: `latest`, `tag 1.4.0`, `tag ^2.1`, `commit <id>` or `branch main`. `Selector::requested()` produces it. When it differs from what `dep.yaml` now says, the sync resolves the entry again.
- **`version` comes from the manifest at the pin**, not from the tag name.
- **Local entries never enter the lock.** They live in the project's own git history.
- **`render_lock` writes a fixed order**: the header comment, aliases sorted, then `github` or `git`, `path`, `requested`, `commit`, `version`. A change shows as a small diff.
- **`write_lock` is atomic and lazy.** It writes a temporary file beside the lock and renames it into place. It writes nothing when the bytes are unchanged. Only the sync calls it.
- **No git library, no lock.** A project with no git entry and no existing lock gets no `dep.lock`, so `git status` stays clean.

## Editing dep.yaml

`agentks library add` and `agentks library remove` change `dep.yaml` through `add_entry` and `remove_entry`. Both edit the file in place and keep the user's comments. After the edit they parse the result again and compare it with the value they meant to write. If the two differ, they rewrite the whole file with `render_dep_yaml` and report that comments were dropped. A visible rewrite is better than a silent wrong edit.

`write_dep_yaml` writes atomically and only when the text changed. The `commands` module (`apps/agentks-engine/crates/library/src/commands.rs`) turns an `add` request into an entry. A catalog id wins over `owner/repo`, and the default alias is the catalog id or else the repository name.

## Related

- [Resolution and the sync](./10_resolution-and-sync.md): how the sync uses `requested` to keep or move a pin.
- [Configuration](../../user-guide-2/35_configuration/01_overview.md): `dep.yaml` among the other config files, from the user's side.
