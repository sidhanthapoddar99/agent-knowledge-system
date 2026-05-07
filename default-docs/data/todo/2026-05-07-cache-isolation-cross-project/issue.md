## The problem

`localStorage` is keyed by **origin** (`http://localhost:3088`), not by project. Local dev / preview is the only place anyone runs framework projects, and the port pool is small — most users alias `./start` to `:3088`, `:4321`, etc. and reuse those ports across every project they hack on.

Result: the moment you stop Project A and start Project B on the same port, Project B sees Project A's leftover cache. Editor state, filter cache (`FILTER_CACHE_KEY`), sidebar collapse state (once the [sidebar persistence issue](../2026-05-07-sidebar-state-persistence/issue.md) lands), theme prefs, layout selector — all collide.

The user's experience: open Project B, find Project A's filter chips active on Project B's issues tracker, or worse, find Project B silently overwriting state they wanted preserved on Project A.

## The fix shape

1. **Site-identity hex in `site.yaml`.** A 16-hex-character (64-bit) random ID, generated on first `loadSiteConfig()` call if absent and written back to `site.yaml`, or set explicitly by the user. Lives somewhere obvious like:

   ```yaml
   name: "Documentation Template"
   title: "Docs"
   description: "..."
   id: "a1b2c3d4e5f60718"   # auto-generated; stable across runs
   ```

2. **Inline the ID into HTML at SSR time.** Top of `<head>` (`<meta name="site-id" content="...">` or a `<script>const SITE_ID = "..."</script>`). Must be available *before* any cache reads — async resolution will race components that read state on mount.

3. **localStorage wrapper.** A thin `cache.ts` module that wraps `getItem` / `setItem` / `removeItem` and keys everything under `<SITE_ID>:<original-key>`. Every consumer (EditorStore, filter cache, sidebar caches) goes through this — never touches `localStorage` directly.

4. **Archive on mismatch.** On page bootstrap, before any cache reads:
   - Read `localStorage["__active_site"]`.
   - If it differs from the embedded `SITE_ID`, run an atomic archive:
     1. Move every key under the previous site's namespace into `archive:<prev-id>:<key>` with a 60-day TTL stamp.
     2. Look for `archive:<SITE_ID>:*` and restore those into the active namespace.
     3. Sweep all `archive:*` keys whose TTL has expired.
   - Set `localStorage["__active_site"] = SITE_ID`.

5. **TTL on the archive slots.** 60 days. Long enough that switching back to a project a month later restores the state; short enough that long-dead projects don't bloat browsers.

## Subtasks (to break out)

- [ ] Generate / persist site-id in `site.yaml` (loader + write-back on first run).
- [ ] Inline site-id into SSR HTML head before any cache-reading scripts run.
- [ ] Build the `cache.ts` wrapper with namespacing, archive, restore, TTL sweep — atomic in the head bootstrap.
- [ ] Migrate every existing localStorage consumer to the wrapper (audit: `EditorStore`, `FILTER_CACHE_KEY`, `COMPACT_MODE_KEY`, layout-selector, theme prefs, anywhere else).
- [ ] Test: switch between two projects on the same port, confirm independent state, confirm restoration on return, confirm archive cleanup after 60 days.
- [ ] Document in dev-docs (cache architecture page + cross-link from sidebar-state-persistence's docs subtask).
- [ ] Update plugin skill if any agent-facing description of localStorage shape exists.

## Notes / open questions

- **Should `id` in `site.yaml` be a sibling of `name` or under a `cache:` block?** Sibling is simpler; under `cache:` lets us add knobs (TTL overrides, opt-out) later. Lean sibling, evolve only if needed.
- **What about `sessionStorage`?** Used less commonly in the framework; if any consumer uses it, namespace it the same way.
- **Concurrent tabs of different projects on the same port.** Same-origin tabs share localStorage. Last-archive-wins; previous tab's writes mid-archive could be lost. Acknowledge as out-of-scope edge case (rare and recoverable on next reload).
- **Should the dev server clear its in-memory cache on `site.yaml` id change?** Probably yes for cleanliness. Cheap, additive.
- **Privacy / fingerprinting.** The site-id is per-deployment, not per-user. Embedding it in HTML is fine; it leaks no more than `name` already does.

## Why this is one issue, not bundled into others

Cache isolation is foundational. Sidebar persistence ([linked issue](../2026-05-07-sidebar-state-persistence/issue.md)) and the editor's existing `FILTER_CACHE_KEY` both need it. Solving it once at the wrapper layer means every consumer gets isolation for free, instead of each subsystem reinventing namespacing.
