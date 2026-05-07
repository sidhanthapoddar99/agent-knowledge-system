---
title: "Disk-persisted cache (survive server restarts)"
state: open
done: false
---

Today every `bun run dev` does a full walk on first issues-page load. Persist the in-memory cache to disk so server restarts don't pay the cold-start cost. On load, verify `syncedAt` against the current HEAD; if linear, do incremental from there. Only matters if you cycle the dev server often — long-running sessions are fine without this.

Full rationale in [`../notes/02_optimization-options.md`](../notes/02_optimization-options.md) § 4.

- [ ] **Persist to `.astro/issue-dates.json`** — write on watcher events (after rebuild completes) and on graceful shutdown (`process.on('SIGINT')` / `httpServer close`).
- [ ] **Schema versioning** — include a top-level `schemaVersion` field. Bump on any structural change to `CacheEntry`. Older versions on disk → discard, full rebuild.
- [ ] **Load on server start** — read the file in `astro:server:setup`. Validate JSON structure, `schemaVersion`, that `syncedAt` is a real SHA. On any mismatch → discard.
- [ ] **Reconcile against current HEAD** — after loading, run `merge-base --is-ancestor` (subtask 03's discriminator). Linear → incremental from disk's `syncedAt`. Otherwise → full rebuild.
- [ ] **Add `.astro/issue-dates.json` to `.gitignore`** if not already covered by `.astro/*` rule.
- [ ] **Atomic writes** — write to `.astro/issue-dates.json.tmp`, then rename. Avoids reading a half-written file if a restart hits mid-write.
- [ ] **Cleanup** — if loading the file throws (corrupt JSON, permission error), log + delete + full rebuild. Don't crash.
- [ ] **Test**: warm the cache, kill the dev server, restart, navigate to `/todo` → confirm no cold rebuild ran (cache loaded from disk + verified). Modify a tracker file and commit; restart again → confirm incremental refresh from disk + new commit.

## Trade-off

Adds another piece of cache state to manage. Schema-version skew across framework upgrades will mean stale on-disk caches get rebuilt — acceptable but adds a code path. **Skip this subtask** if the dev session is typically long-running and subtask 02 (pre-warm) already removes the perceived first-load lag.

## Coupling with subtask 03

Disk persistence makes the most sense once incremental refresh exists — otherwise restarting just means we full-rebuild from disk's `syncedAt` every time, which is barely faster than building from scratch. Land 03 first.

## Files likely touched

- `astro-doc-code/src/loaders/issue-dates.ts` — disk read/write logic, schema-version constant.
- `astro-doc-code/src/dev-tools/integration.ts` — load on `astro:server:setup`, write on shutdown.
- `.gitignore` (verify `.astro/*` covers it).
