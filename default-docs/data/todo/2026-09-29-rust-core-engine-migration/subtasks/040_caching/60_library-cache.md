---
title: "Library cache — the global store of library repositories at one commit"
status: review
---

Libraries are fetched from git and shared by every project on the machine. This leaf builds the **storage layer** for them: `~/.agentks/libraries/<host>/<repository path>/<commit>/`, written once, atomically, under a lock, and read-only afterwards. The resolving and fetching logic that decides *which* commit to get belongs to the library group ([120/20](../120_libraries/20_fetch-and-resolve.md)); it calls this store.

# 01 To Do
- [ ] **Path from a source.** `store_path(host, repo_path, commit)`. Normalise: lower-case host, repository path without `.git`, the full 40-character commit. `github:owner/repo` maps to `github.com/owner/repo`. Reject any path segment that is `..`, empty or absolute.
- [ ] **`has(commit)`** is true only for a completed folder: one that contains the marker file `.agentks-complete` written last.
- [ ] **`install(source, commit, fetch_fn)`**:
    - [ ] Take a per-commit lock file (`<commit>.lock` beside the folder, advisory lock, with a timeout and a clear message naming the other process).
    - [ ] If another process finished it meanwhile, return.
    - [ ] Let `fetch_fn` write into `<commit>.tmp-<pid>/`, write the marker, make the tree read-only, then rename it to `<commit>/`.
    - [ ] On any failure, remove the temporary folder and return the error. A half-written commit never looks installed.
- [ ] **Read-only.** Remove write permission from every file and folder after install. Nothing in agentks writes inside a completed commit.
- [ ] **Lookups for serving.** `resolve_element(commit_dir, subpath, file)` canonicalises and refuses anything outside `commit_dir`. The `/_lib/` route ([120/50](../120_libraries/50_lib-route-and-sandbox.md)) and the path checks in [050/50](../050_server/50_security.md) use it.
- [ ] **Listing for cleanup.** `list() -> [(host, repo, commit, bytes)]` for [040/90](./90_clean-and-reset.md).
- [ ] **Templates share the store.** `agentks init` fetches templates into the same folders, keyed by commit ([070/40](../070_cli/40_init-template.md)).

## Guardrails
- Local libraries (a `path:` entry in `dep.yaml`) are never copied into this store. They are read in place.
- No content hash is stored. The commit is the integrity check, because git verifies every object against it (sidhantha, 2026-09-30).
- Size is not a concern and nothing here deletes automatically.

## Done when
- A test runs two processes installing the same commit at once: one fetches, the other waits and then finds it complete; exactly one fetch ran.
- A test kills an install half way (the fetch function panics); afterwards `has()` is false and no temporary folder remains after the next install.
- Writing into a completed commit folder fails with a permission error (test on Linux and macOS; on Windows, check the read-only attribute).
- A crafted element path with `../` is refused.

# 02 Status and Result
Review. The store side is built and tested.

## Result
Where: the main repository, `apps/agentks-engine/crates/cache/` (branch `wave2/cache`). Tests: `cargo test -p agentks-cache`, 36 tests in 0.06 s; `./ctl gate` green.

- `LibraryStore` in `library_store.rs`: `has`, `install`, `resolve`, `list`, `commit_dir`, `with_lock_wait`; `LibrarySource::new` and `LibrarySource::parse` (`github:`, `gitlab:`, `https://`, `http://`, `ssh://`, `git@host:path`).
- Install: per-commit lock `<commit>.lock` (std `File::try_lock`, polled, 10 minutes by default, the timeout error names the holder); stale temporary folders removed; `fetch` writes into `<commit>.tmp-…`; a top-level `.git` is dropped; the marker `.agentks-complete` (`{"format":1}`) written; the tree made read-only; renamed into place. A drop guard removes the temporary folder on error or panic.
- Tests: two concurrent installs fetch once; a failing and a panicking fetch leave nothing installed and no temporary folder after the next install; a completed commit refuses writes to files and to the folder; `../` is refused; a wrong-format marker is reinstalled; a held lock blocks removal.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate's `library_store` module (`crates/cache/src/library_store.rs`); `agentks-library` resolves and fetches.

**Read first:**
- [Library system, sections 05, 09, 11, 12](../../notes/04_ecosystem/01_library-system.md) — the lock, the cache, how a sync resolves, the errors.
- [Machine home, sections 04 and 06](../../notes/02_engine/06_machine-home-and-build-cache.md) — atomic writes, the lock file per commit, read-only.
- [Libraries and dependencies (brainstorm)](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md).

**Depends on:** [010/00 project setup](../010_project-setup/00_overview.md) for the workspace.
**Unblocks:** [120/20 fetch, resolve, cache](../120_libraries/20_fetch-and-resolve.md), [120/50 the /_lib route](../120_libraries/50_lib-route-and-sandbox.md), [070/40 init](../070_cli/40_init-template.md), [040/90](./90_clean-and-reset.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the library cache is global, keyed by repository and commit, and shared by every project.
- Decided (sidhantha, 2026-09-30): no content hash; the git commit is the hash.
- Decided (sidhantha, 2026-09-30): local libraries are read in place.
- Decided (claude, 2026-10-01): element lookups use `LibraryStore::resolve(source, commit, path)`, a thin call to `fs::canonical_inside`, instead of a separate `resolve_element`, so the library route and page saves share one path check.
- Decided (claude, 2026-10-01): lock files are never deleted, because deleting a lock file another process waits on lets a third process lock a new file beside it.
- Decided (claude, 2026-10-01): a repository path segment that is a full commit id or contains `.tmp-`, and any `:`, is refused, so listing can never mistake a repository folder for a commit folder, and names stay valid on Windows.
- Decided (claude, 2026-10-01): the store drops a top-level `.git` folder after `fetch`, so the layout rule (files only) holds whatever the fetcher does.
- Decided (claude, 2026-10-01): `list()` includes every folder named by a full commit id, finished or not, so cleanup sees all the space used.

# 05 Notes & Analysis

## Watch out
- A shallow fetch of one commit with gitoxide must still produce a working tree, not only objects. The store holds files, not a `.git` folder: drop `.git` after checkout, since the commit id is already the folder name.
- Read-only folders break naive `rm -rf` in cleanup. [040/90](./90_clean-and-reset.md) must restore write permission before removing.
