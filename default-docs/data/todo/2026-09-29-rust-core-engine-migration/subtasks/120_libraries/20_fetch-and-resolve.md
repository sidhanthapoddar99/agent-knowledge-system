---
title: "Fetch and resolve: selectors, tags and the sync"
status: open
---

This leaf turns `dep.yaml` entries into pinned commits and makes sure every pinned commit is on the machine. It implements version selection (exact tags, ranges, latest, branches, commits), the git fetch through a Rust git library with no `git` binary, and the **sync**: the one algorithm that `agentks start`, `agentks install`, `agentks library add` and `agentks init` all run. When it is done, a fresh clone with a lock installs exactly the locked commits, and a changed entry resolves without moving any other pin.

# 01 To Do
- [ ] **Remote listing.** For a git source, list its tags and branches with their commits, without cloning (the git "ls-refs" step). Use gitoxide (`gix`) unless it cannot do something below; record the choice.
- [ ] **Version tags.** A tag named `x.y.z` or `vx.y.z` is a version; ignore every other tag. Two tags naming the same version on different commits → error naming both.
- [ ] **Selector rules** (use the `semver` crate):
    - [ ] Exact `tag` → that tag's commit, `v` optional.
    - [ ] Range (`^1.4`, `~1.4.2`, `>=1.2.0 <2.0.0`) → the newest matching version tag.
    - [ ] Pre-releases match only an exact `tag`; ranges and latest skip them.
    - [ ] No selector → the newest non-pre-release version tag. No version tags at all → error suggesting a `branch` or a `commit`. Never guess.
    - [ ] `commit` → used as given (verify it exists when fetching).
    - [ ] `branch` → the branch's current head.
- [ ] **Fetch one commit.** Shallow fetch of exactly the pinned commit into the cache through [040/60 library cache](../040_caching/60_library-cache.md), which owns the folder layout, the temporary-folder-then-rename write and concurrent fetches. Git verifies every object against the commit; do not add a hash.
- [ ] **Credentials.** Public repositories need none. For private ones, use the machine's git credentials: SSH keys and the credential helper. An access failure names the repository and how to sign in.
- [ ] **The sync**, as one function in the engine, shared with the CLI:
    1. Read and validate `dep.yaml` ([120/10](./10_dep-yaml-and-lock.md)); stop on any error.
    2. Read `dep.lock`, or an empty lock.
    3. Compare entry by entry: same source, same `path`, same `requested` → keep the pin. New or changed → mark for resolution. In the lock but not in `dep.yaml` → drop.
    4. Resolve the marked entries. With `update = All | Aliases(…)`, also re-resolve `branch`, range and latest entries (all, or only the named aliases).
    5. Fetch every pinned commit missing from the cache.
    6. Read each library's `manifest.json` at its pin ([120/30](./30_manifest-and-catalog.md)); check its `engine` range includes the running version.
    7. Write the lock only if something changed. Return a report: added, removed, moved (from → to, with versions), unchanged.
    - [ ] If steps 4–6 fail, leave the old lock untouched and return the error. Never render against a half-updated set.
- [ ] **`start` never moves a pin.** `start` runs the sync with `update = None`; only `install --update` moves pins.
- [ ] **Offline.** A locked commit already in the cache needs no network. A missing one offline → error naming the library and `agentks install`.
- [ ] **Engine mismatch.** When the newest tag matching a selector needs a different engine, fail and name both versions. Do not search older tags for a compatible one.
- [ ] **Tests.** Build local bare repositories in a temp folder as fixtures (tags `1.0.0`, `v1.1.0`, `1.2.0-beta.1`, `2.0.0`, a branch, a repo with no version tags, a repo with a duplicate version). Test every selector, the sync's keep/mark/drop logic, `--update` for all and for one alias, offline behaviour, and that a failed resolve leaves the lock untouched.

## Guardrails
- No `git` binary and no GitHub download archives (they are not checked against the commit).
- The sync is the only code that writes the lock. The CLI and the server call it; they do not re-implement it.
- Libraries never depend on each other: the sync never reads anything that would pull in a second library.

## Done when
- `cargo test` passes the fixture tests above.
- With a network: `agentks install` in a project whose `dep.yaml` names `NeuraLabsHQ/agent-knowledge-system-library` writes a lock with a 40-character commit, and running it again changes nothing.
- Deleting the cache and running `agentks install` again fetches the same commit; `git diff config/dep.lock` is empty.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, library crate under `apps/agentks-engine/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 04 (versions and selectors), 09 (the cache), 11 (how a sync resolves), 12 (errors), 14 (trust, private repositories), 15 (engine compatibility).
- [Machine home and build cache](../../notes/02_engine/06_machine-home-and-build-cache.md), section 04 (the library cache).

**Depends on:** [120/10 dep.yaml and dep.lock](./10_dep-yaml-and-lock.md), [120/30 manifest](./30_manifest-and-catalog.md) (step 6), [040/60 library cache](../040_caching/60_library-cache.md), [140/10 version constants](../140_versioning-and-migrations/10_version-and-release-stream.md) (the running engine version).
**Unblocks:** [120/40 commands](./40_library-commands-and-tui.md), [120/85 templates](./85_templates.md), [150/10 agentks build](../150_publishing/10_agentks-build.md), [070/40 init](../070_cli/40_init-template.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30), on claude's proposal: starting agentks never moves a pin; the cache is keyed by repository and commit ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-09-30): `install --update` re-resolves ranges as well as branches and latest; a newest match that needs another engine fails instead of falling back to an older tag (same note).
- Decided (sidhantha, 2026-09-30): starting agentks installs missing libraries automatically; `agentks install` pre-installs them.

# 05 Notes & Analysis
## 01 The sync's report (JSON shape for `--json`)
```json
{ "added":   [{ "alias": "kit", "commit": "51aa0c3…", "version": "1.4.0" }],
  "removed": [{ "alias": "old" }],
  "moved":   [{ "alias": "icons", "from": { "commit": "9d02…", "version": "2.1.0" },
                                   "to":   { "commit": "a1b2…", "version": "2.2.0" } }],
  "unchanged": ["nightly"], "fetched": 2, "lock_written": true }
```

## Watch out
- A shallow fetch of an arbitrary commit needs the server to allow it (`uploadpack.allowReachableSHA1InWant`). GitHub and GitLab allow it; a self-hosted server may not. Fall back to a shallow fetch of the tag or branch that points at the commit, then verify.
- One repository can hold several libraries in subfolders; fetch it once per commit and let each entry read its own `path`.
- Branch entries: a force-pushed branch can make an old pinned commit unreachable. If the pinned commit cannot be fetched, the error must say the branch history changed and suggest `install --update <alias>`.
