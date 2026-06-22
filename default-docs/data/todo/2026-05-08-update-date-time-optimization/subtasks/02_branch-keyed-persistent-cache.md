---
title: "Branch-keyed persistent cache + server-start pre-warm"
state: open
---

Builds on subtask 01. Adds disk persistence with **one cache file per branch**, plus a server-start hook that loads the active branch's file (or builds fresh) before the first request lands. After this lands, three classes of cost go to near-zero: server-restart cold start, branch switches between known branches, and any subsequent reads.

Design context: [`../notes/01_design-and-rationale.md`](../notes/01_design-and-rationale.md) §"Proposed flow" + the comparison table.

## File layout

```
.cache/<repo-fingerprint>/
├── main.json
├── feature-foo.json
└── feature-bar.json

each <branch>.json:
{
  "schemaVersion": 1,
  "lastUpdateHash": "b9d2c20...",
  "issues": {
    "<issue-slug>": "<ISO-8601 author date>",
    ...
  }
}
```

The running server keeps **only the active branch's cache** in RAM; switching branches reloads the relevant file.

## Tasks

- [ ] **Define cache-file location.** `<repo-root>/.cache/issue-dates/<branch-safe-slug>.json`. Branch names with slashes (`feature/foo`) get URL-encoded or `--`-joined (`feature--foo`). Ensure the directory exists at write time.
- [ ] **Add `.gitignore` entry** for `.cache/` if not already covered.
- [ ] **Atomic writes**: write to `<branch>.json.tmp`, then rename. Prevents half-written files on crash or concurrent process.
- [ ] **Schema versioning**: include `schemaVersion: 1` in every file. On load, mismatch → discard and full-rebuild.
- [ ] **Server-start load** in `dev-tools/integration.ts` `astro:server:setup`:
   - Read the active branch's file if it exists.
   - If `lastUpdateHash === currentHEAD` → load directly into in-memory cache; done.
   - If `lastUpdateHash` is an ancestor of `currentHEAD` → load + diff walk to catch up; persist updated file.
   - If non-linear or missing → full rebuild; persist.
- [ ] **Branch-switch handling** in the watcher's `.git/HEAD` change handler:
   - Persist the OUTGOING branch's current cache to its file before reload.
   - Read INCOMING branch's parsed name from `.git/HEAD`.
   - Load that branch's cache file (or build fresh).
   - Reconcile against current HEAD with the same logic as server-start.
   - Reconcile watch set so the new branch's ref file gets watched.
- [ ] **Persist on every cache update** (already triggered by subtask 01's incremental walk). After updating `entry.issues` and `lastUpdateHash`, atomically write the file.
- [ ] **Detached HEAD handling**: parse `.git/HEAD` — if it's a SHA (no `ref:` prefix), skip persistence; in-memory only. Document as a known limitation; getting back to a branch reloads from disk.
- [ ] **Orphan-branch GC at server start**: list `git branch --list`, list cache files, drop files for branches that no longer exist. Logged, not silent.
- [ ] **Repo-fingerprint sub-directory** so multi-repo developers (rare) don't conflict. Use a short hash of the repo's `git rev-parse --show-toplevel` path.
- [ ] **Test — server restart**: warm the cache, kill the dev server, restart, hit `/todo` immediately → confirm no full-walk runs (logs should show "loaded cache from disk", not "full walk"). Modify a file, commit, restart again → confirm diff-walk catches up to the new HEAD.
- [ ] **Test — branch switch round-trip**: switch from `main` to `feature`, verify `feature.json` is loaded (or built fresh first time), commit on `feature`, switch back to `main` → verify `main.json` is loaded with its previous `lastUpdateHash` and a diff walk reconciles to `main`'s current HEAD.
- [ ] **Test — schema version skew**: hand-edit a `<branch>.json` to set `schemaVersion: 0`. Restart server → confirm the file is discarded and rebuilt. No crash.

## Cost after this lands (all paths)

| Event | Cost |
|---|---|
| Server start, cache exists, HEAD matches | ~3 ms (JSON load + parse) |
| Server start, cache exists, HEAD ahead | ~3 ms + diff walk (~5–15 ms) |
| Server start, no cache (or schema skew) | ~5 ms + full walk (one-time) |
| Active-branch commit (any kind) | watcher pays ~15 ms; readers free |
| Switch to known branch | ~3 ms load + diff walk if behind |
| Switch to new branch | full walk + persist (~500 ms one-time, then cached) |
| Reads (always) | O(1) Map lookup |

## Out of scope (subtask 03 territory)

- Watcher debounce for rapid git operation bursts (rebase, fixup).
- Single-flight lock for concurrent watcher events.

## Files likely touched

- `astro-doc-code/src/loaders/issue-dates.ts` — disk-IO helpers, schema version constant, branch-keyed cache lookup.
- `astro-doc-code/src/dev-tools/integration.ts` — `astro:server:setup` load hook, branch-switch detection in the change handler.
- `.gitignore` — add `.cache/` if not already covered.
