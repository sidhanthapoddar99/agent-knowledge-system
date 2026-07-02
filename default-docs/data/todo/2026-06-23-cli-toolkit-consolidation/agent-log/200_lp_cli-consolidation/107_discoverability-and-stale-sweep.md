---
iteration: 7
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

# Milestone 7 — Scope discoverability hint + stale-alias sweep + v0.3.2 (post-merge)

> Follow-on after the loop merged to `main`. A subagent test (and my own) surfaced a real trap: `docs-guide issue list` defaults to `open,review`, so a query for a **cancelled** issue (the astro-6-upgrade slug) comes back empty and reads as "doesn't exist." Fix the tool to *tell you*, then clean up the now-stale "flat alias" language the retirement left behind.

## Goal
1. Stop the default-scope trap from silently misleading: when a query matches issues hidden by the `open,review` default, **say so**.
2. Document the trap in the searching reference.
3. Purge stale `docs-*` / "flat alias" references the single-entrypoint move left in scripts.
4. Cut a version bump.

## Approach

### 1. Discoverability hint (`issues/list.mjs`)
Refactored the pipeline so the **status scope is applied last** instead of in Phase 1:
- Phase 1 structural filter no longer drops out-of-scope statuses; every filter + search/meta/path phase now runs across all four states.
- A new partition step splits matches into in-scope (`results`) and `hiddenByScope`.
- When the **default** scope is active (`!--status && !--include-cancelled`) and `hiddenByScope` is non-empty, emit a one-line tip to **stderr** with an exact count + per-state breakdown:

  ```
  tip: showing open,review only — 2 more issue(s) match in 2 cancelled. Add --status all (or --include-cancelled) to include them.
  ```

  This gives an *honest* count (the query genuinely ran against the hidden issues), goes to stderr so `--json`/`--paths-only`/pipes stay clean, and is suppressible with `--quiet-tips`.

### 2. Searching reference (`references/layouts/issues/41_searching.md`)
Added a `[!WARNING]` to "Default search scope": "not found in the default scope is not doesn't exist," shows the tip, points to `--status all` / `--include-cancelled` / `docs-guide find` (status-agnostic). Also fixed the `--path astro` example — that issue is *cancelled*, so the old example (no `--status`) wouldn't actually find it; now uses `--status all` with a caveat.

### 3. Stale-alias sweep (scripts)
The single-entrypoint retirement left "flat alias" language scattered in comments:
- `_help-render.mjs` — help-detail line `alias: <bin>` → **`id: <bin>`** (bin is an internal id now, not a PATH binary); reworded the `DISPATCH` comment.
- `_manifest.mjs` — rewrote the "Naming model (B + flat aliases)" header block and the `resolveCommand` "flat alias" comment to "internal id form / hidden convenience."
- `cli.mjs` — two comments referencing "flat `docs-*` aliases" reworded.

Grep confirmed no remaining stale *invocations* — surviving `docs-*` hits are all legit `bin:` ids, `docs-img-` temp filenames, or `f.alias` short-flag refs.

### 4. Version (`plugin.json`)
`0.3.1 → 0.3.2`. Also fixed the plugin **description**, which still advertised the dual `docs <group> <verb>` / flat `docs-*` surface — now reads "one collision-safe `docs-guide` dispatcher … flat `docs-*` names retired to internal manifest ids."

## Result (evidence)
- **Self-test: 91/91 PASS** under bun (`# CLI self-test — 91/91 checks passed (runtime: bun)`).
- **Hint verified:** `issue list --path astro` (default) → exit 1 + tip "2 more … in 2 cancelled"; `--status all` → exit 0, both cancelled issues listed (`2026-06-09-astro-6-upgrade`, `2026-04-25-framework-as-npm-package`).
- **stderr discipline:** `--json` emits clean `[]` on stdout, tip only on stderr; `--quiet-tips` → empty stderr.
- **Help relabel:** `docs-guide help issue list` now prints `id: docs-list …`.
- **skill-links: all checks passed.**

## Next
— Closed out. Changes committed on `main` (not pushed, per loop VC policy). Plugin republish (0.3.2) is the user's call.
