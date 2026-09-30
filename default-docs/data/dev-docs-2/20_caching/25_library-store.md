---
title: "The library store"
description: "LibraryStore: the global store of library commits under ~/.agentks/libraries/, installed once under a lock, marked complete last, and read-only after."
---

The library store holds every library repository a project pins, at each pinned commit, once per machine. Two projects pinned to the same commit share one folder. It is `LibraryStore`, in `apps/agentks-engine/crates/cache/src/library_store.rs`. Resolving versions, reading `dep.yaml` and `dep.lock`, and fetching belong to `agentks-library`; this page covers only where the files land and how they are kept safe. The [libraries section](../35_libraries/01_overview.md) explains the rest.

## The layout

```
~/.agentks/libraries/
  <host>/<repository path>/
    <commit>/                  one repository at one commit, read-only
      .agentks-complete        the completion marker, written last
      manifest.json
      …
    <commit>.lock              the install lock of that commit
```

For example, `github.com/acme/design-kit/51aa0c3f…/`. A repository that holds several libraries in subfolders is stored once per commit, and each `dep.yaml` entry reads its own subfolder.

Local libraries, named by a path in `dep.yaml`, are not copied into the store. They are read in place from the project.

## Naming a repository

`LibrarySource` normalises a source into a host and a repository path:

| Written in `dep.yaml` | Stored under |
|---|---|
| `github:acme/design-kit` | `github.com/acme/design-kit` |
| `gitlab:group/repo` | `gitlab.com/group/repo` |
| `https://host/path.git`, `http://…`, `ssh://git@host/path`, `git@host:path` | `host/path` |

The host is lower-cased and a trailing `.git` is dropped. A segment that is empty, `.` or `..`, holds a backslash, a NUL or a `:`, or starts with `/` is refused. So is a segment that looks like a full commit id or holds `.tmp-`, so a repository folder can never be mistaken for a commit folder or a temporary one, and every name stays valid on Windows.

## Installing a commit

`install(source, commit, fetch)` installs a commit unless it is already there:

1. **Take the lock.** Each commit has a lock file, `<commit>.lock`, beside its folder. An install waits up to 10 minutes for another process holding it, and a timeout names the holder.
2. **Check again.** If another process finished the same install meanwhile, return its folder.
3. **Clear leftovers.** Remove temporary folders a killed install left behind.
4. **Fetch into a temporary folder**, `<commit>.tmp-…`, beside the target. The caller's `fetch` writes the files.
5. **Drop any `.git` folder.** The store holds files only; the commit id is already the folder name.
6. **Write the marker** `.agentks-complete`, holding `{"format": N}`, last.
7. **Make the tree read-only.**
8. **Rename it into place.**

On any failure, or a panic inside `fetch`, a guard removes the temporary folder. **A half-written commit never looks installed**, because `has` is true only for a folder whose marker exists and is in this binary's format. A marker of another format reads as not installed, and the commit is installed again.

Two processes installing the same commit at once fetch it once: the second waits on the lock, then finds it complete.

**Lock files are never deleted.** Deleting a lock file another process is waiting on would let a third process lock a new file beside it, and two installs would run at once.

## No content hash

The store keeps no hash of its own. The commit is the integrity check: git verifies every object against the commit id when it fetches. So the folder name is also the proof of what is inside.

## Read-only

After install, every file and folder of a commit is read-only. Nothing in agentks writes inside a completed commit. A library's user never edits or migrates it; its owner publishes a new version instead. Cleanup restores write permission before it removes a commit.

## Reading files out of the store

`resolve(source, commit, path)` returns a file inside an installed commit, or refuses it. It calls `fs::canonical_inside`, the one path check that the file routes and page saves use too:

- it refuses an empty path, empty, `.` or `..` segments, a leading `/`, NUL bytes and backslashes;
- it follows symlinks, then requires the result to be inside the commit folder.

So a crafted element path such as `../../x` can never reach outside the commit.

## Listing for cleanup

`list()` returns every folder whose name is a full commit id, with its size, whether its install finished or not, so cleanup sees all the space in use.

## Size and cleanup

The store's size is not a concern, and nothing is removed from it automatically. A commit no project needs stays until the user runs `agentks cache clean`, which is safe by construction: a commit removed by mistake is fetched again from its lock on the next start. See [cleanup and metrics](./35_cleanup-and-metrics.md).

## Related

- [Libraries](../35_libraries/01_overview.md): resolving, locking and serving library elements.
- [Git and migrate](../10_engine/50_git-and-migrate.md): `fetch_commit`, which fills the temporary folder.
