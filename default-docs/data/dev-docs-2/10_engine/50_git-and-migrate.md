---
title: "Git and migrate"
description: "agentks-git, which reads git facts by running the git program, and agentks-migrate, the thin runner behind agentks migrate."
---

This page covers two small crates. `agentks-git` (layer 1) reads facts from git: the branch, ancestry, the tracker's dates, and remote fetches. `agentks-migrate` (layer 2) runs the content migration scripts behind `agentks migrate`, and fetches them through `agentks-git`.

## agentks-git

### It runs the `git` program

The crate reads git by running the `git` program, not through a Rust git library. The reasons:

- **Credentials.** Remote access uses the machine's own git credentials, such as SSH keys, credential helpers and `gh`, with no extra code.
- **Reference behaviour.** `git status` and `git log` are the behaviour agentks must match. The clean-tree check guards migrations, and the tracker's dates must agree with what `git log` says.
- **A lean build.** A Rust git library with HTTPS and SSH transports adds a large tree of dependencies, and still calls `ssh` and credential helpers.

The cost is that `git` must be installed. Without it, every call returns `GitError::ProgramMissing`, never an empty answer. Each call starts a process, which takes a few milliseconds. Reads of the site never run git; only start-up and moved refs do.

### How it calls git

`apps/agentks-engine/crates/git/src/cmd.rs` builds every command the same way:

- it removes the parent process's repository variables, such as `GIT_DIR`, so an outer repository cannot leak in;
- it sets `LC_ALL=C`, so messages read the same on every machine;
- it turns off terminal prompts and optional locks, and closes stdin.

Remote calls allow only `https`, `ssh` and local repositories. The address is checked first and passed after `--`, so it can never be read as an option.

### What it offers

| Function | Does |
|---|---|
| `Repo::discover` | Opens the project's repository, including a linked worktree or a project in a subfolder |
| `head` | The current branch and commit |
| `is_ancestor` | `git merge-base --is-ancestor`. A missing commit is `NoSuchCommit` |
| `local_branches` | The local branch names |
| `is_clean` | Whether the working tree is clean. Untracked files count as changes |
| `ref_watch_paths` | The files the watcher must follow to see `HEAD` or the active branch move |
| `folder_dates` | The newest author date per first-level folder of the tracker |
| `list_remote` | A remote's refs, with annotated tags peeled |
| `fetch_commit` | A shallow fetch of one commit into a scratch bare repository, checked out as plain files |

`folder_dates` runs one `git log` over the tracker folder:

```
git log --no-merges --full-history --no-renames --name-only -z [<since>..HEAD] -- <tracker>
```

For each non-merge commit it takes the author date and the changed paths, maps each path to its first-level folder, and keeps the newest date per folder, compared as instants, not as text. `--full-history` makes a walk of a range find exactly what a full walk adds, so the incremental and the full walk always agree. It returns the `HEAD` commit even when the walk found nothing, so the caller can record how far it has read. How the dates are cached and reconciled is on the [git dates page](../20_caching/30_git-dates.md).

### What it must not do

It must not cache, because the site keeps the dates in the build cache. It must not decide which folders are issues, because that is a content rule. It never commits, pushes or changes a repository.

## agentks-migrate

`agentks-migrate` is the runner behind `agentks migrate`. It holds no migration logic: the scripts change content, and the runner finds them, runs them in version order, checks the result and sets the new `engine_version` last. Its place in the workspace explains its shape:

| Boundary | Why |
|---|---|
| It depends on `agentks-core`, `agentks-config` and `agentks-git` | It reads the content version with the config crate's `read_content_version`, which skips the gate, and fetches scripts with the same git code that fetches libraries |
| It fetches scripts only from the official repository, at the tag of its own version | No flag or environment variable changes the source. A development build reads the checkout's own `apps/agentks-engine/migrations/` folder instead |
| It never bundles or downloads a runtime | A `.py` script runs with `uv`, a `.ts` or `.js` script with `bun`. A missing runtime stops the run with how to install it |
| It asks through the `Confirm` trait | Only the CLI talks to the user, so the CLI implements it |
| It leaves library pins to the CLI | Checking every pinned library's engine range needs `agentks-library`, a crate in the same layer, so the CLI fills that part of the report |
| It bumps `engine_version` last | Any error before the last step leaves the version as it was, so a run that stops halfway is still caught by the version gate |

The [versioning section](../50_versioning/01_overview.md) documents the runner step by step, the script contract, library migrations and how to write a migration script.

## Tests

```bash
cargo test -p agentks-git       # scripted repositories with fixed author dates, in temp folders
cargo test -p agentks-migrate   # fake scripts under sh, and one real script through uv
```

## Related

- [The git dates cache](../20_caching/30_git-dates.md): how `folder_dates` feeds the tracker's `updated` dates.
- [Config](./20_config.md): the version gate that sends users to `agentks migrate`.
- [Versioning](../50_versioning/01_overview.md): the migration runner and the script contract in full.
