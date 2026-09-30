---
title: "Cache format versions — every store says its format; a mismatch rebuilds"
status: open
---

A cache written by one version of agentks may be read by another: after an update, or when mise pins two versions on one machine. The engine version is already a folder level of the build cache. That is not enough on its own: a development build keeps the same version while its formats change, and the library cache and `build-cache.json` are shared across versions. This leaf gives every persisted store a **format version** and one rule: a store or entry with a different format is ignored and rebuilt, never read.

# 01 To Do
- [ ] **A format constant per store**, in one module: `PAGES_FORMAT`, `CSS_FORMAT`, `HIGHLIGHT_FORMAT`, `GIT_DATES_FORMAT`, `BUILD_CACHE_INDEX_FORMAT`, `RUN_RECORD_FORMAT`, `SHARE_KEYS_FORMAT`. Start at 1.
- [ ] **Where the format is written:**
    - [ ] Build cache entries: in the entry header ([040/40](./40_build-cache-on-disk.md)).
    - [ ] JSON stores (`build-cache.json`, `git-dates/*.json`, `run/*.json`, the access-key store): a top-level `"format": N`.
    - [ ] The library cache: the completion marker `.agentks-complete` holds `{"format": N}`. The folder's content is the commit and never changes, but the layout of the folder (for example, whether `.git` is kept) may.
- [ ] **The read rule.** Lower or higher format → treat as missing. For shared machine files that several agentks versions write (`build-cache.json`, `run/`), a newer format is left untouched and the older binary works without it, reporting "a newer agentks owns this file" once. It never downgrades a newer file.
- [ ] **Development builds.** Add the build's git commit to the engine-version folder name when the binary is a development build (a binary under a repository's `data/builds/`), so a changing working tree never reads its own stale output.
- [ ] **A test fixture per store** with a wrong format, asserting it is rebuilt or ignored.
- [ ] **A release check.** A test that fails when a store's serialised shape changes but its format constant did not (snapshot the shape of each store type). This is what stops a silent format change.

## Guardrails
- Never migrate a cache. Caches are rebuilt; content is migrated ([140/00](../140_versioning-and-migrations/00_overview.md)).
- A format bump is always safe to make. When unsure whether a change needs one, bump.

## Done when
- Each store has a wrong-format test that passes.
- The shape-snapshot test fails when a field is added to a cached type without a bump (prove it once by making the change in a scratch branch).
- Running an older and a newer agentks against one machine home in turn never makes either crash or read the other's data.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate (constants and read rule), used by every store.

**Read first:**
- [Machine home](../../notes/02_engine/06_machine-home-and-build-cache.md) — every store under `~/.agentks/`.
- [Versioning and migrations](../../notes/05_delivery/03_versioning-and-migrations.md) — engine and content versions, which this is not.
- The absorbed [git dates design](../../../2026-05-08-update-date-time-optimization/notes/01_design-and-rationale.md) — its `schemaVersion` rule, generalised here.

**Depends on:** nothing; do it early.
**Unblocks:** [040/40](./40_build-cache-on-disk.md), [040/60](./60_library-cache.md), [040/70](./70_git-dates-cache.md), [050/40](../050_server/40_lifecycle-ps-stop-logs.md), [060/40](../060_collaboration/40_access-keys.md).

# 04 Decisions
- Decided (claude, 2026-09-30): every persisted store carries a format version; a mismatch is rebuilt or ignored, never read; shared machine files are never downgraded.
- Decided (claude, 2026-09-30): development builds add their commit to the engine-version folder.

# 05 Notes & Analysis

## Watch out
- The browser's IndexedDB store name already includes the engine version ([client note, section 05](../../notes/03_frontend/02_client-application.md)). Keep that rule in step with this one: the browser layer must also change its store name when the page-data format changes without a version change (a development build). The simplest way: the manifest sends a `cache_format` value and the client puts it in the store name.
