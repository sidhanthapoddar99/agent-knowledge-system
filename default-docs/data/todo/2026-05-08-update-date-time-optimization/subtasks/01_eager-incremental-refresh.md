---
title: "Eager incremental refresh (in-memory)"
state: open
done: false
---

Replace lazy invalidation with eager incremental update inside the watcher handler. The cache stops being deleted on git events; instead the listener walks `<lastHash>..HEAD` and patches entries in place. Reads stop touching git entirely.

This subtask delivers the **diff-walk engine** of the unified design (see [`../notes/01_design-and-rationale.md`](../notes/01_design-and-rationale.md)) without disk persistence. No file format, no branch-keyed storage yet — those land in subtask 02. This step is the validation that the mechanism itself is sound.

- [ ] **Replace `cache.delete()` with `entry.stale = true`** in `invalidateIssueDateCache()`. Keep the entry around so the watcher handler can compute a diff against it.
- [ ] **Move work into the watcher handler.** In `dev-tools/integration.ts`, after marking stale, immediately call a new exported `refreshIssueDateCache(trackerRoot)` that does the diff walk synchronously. Watcher pays the cost; readers are never blocked.
- [ ] **Add `merge-base --is-ancestor` discriminator.** Re-introduce the `isAncestor()` helper deleted during the earlier simplification.
   - Linear advance (`merge-base --is-ancestor old new` exits 0) → diff walk.
   - Non-linear (rebase, branch switch, force-update) → full rebuild.
- [ ] **Re-introduce `sinceSha` parameter on `walkLog()`.** When non-null, build args as `<sinceSha>..HEAD --name-only -- <tracker>`; otherwise full history.
- [ ] **Diff-walk semantics**: every entry walked is by definition newer than `entry.syncedAt`, so always overwrite (`entry.issues.set(slug, iso)`) — don't skip-if-present.
- [ ] **Bump `syncedAt` even when the walk returned empty** (no-op commits that don't touch the tracker). Skipping the bump means the next commit's walk would re-scan the same range.
- [ ] **Reader path simplifies**: `ensureFresh()` becomes `if (cache.has(...)) return; coldFullBuild();` — no stale-flag handling needed, because the watcher already kept it fresh. The only cold path is the genuinely-first-time-ever call when the server starts and no entry exists yet.
- [ ] **Test**: in dev mode, commit on the active branch; verify the next render reflects the new commit's timestamp without any visible lag. Inspect logs to confirm the watcher did the diff walk (~15 ms) rather than a full rebuild.
- [ ] **Test**: `git checkout other-branch`; verify the discriminator falls through to full rebuild (correct, since the new branch's history is non-linear from the previous syncedAt).

## Why this lands first

It validates the diff-walk mechanism in pure in-memory form. If something is wrong with the discriminator, the overwrite semantics, or the watcher-pays-the-cost shift, it surfaces here without disk-state complexity to debug.

## What this does NOT yet do

- No disk persistence. Server restart still does a full walk on the next reader.
- No branch-keyed cache. Branch switches still cause non-linear discriminator → full rebuild every time.
- No watcher debounce. Rapid git events (rebase, fixup) each fire a separate refresh.

Those land in subtasks 02 and 03.

## Files likely touched

- `astro-doc-code/src/loaders/issue-dates.ts` — stale flag, `isAncestor`, sinceSha-aware walkLog, exported `refreshIssueDateCache()`.
- `astro-doc-code/src/dev-tools/integration.ts` — watcher handler calls `refreshIssueDateCache()` instead of `invalidateIssueDateCache()`.
