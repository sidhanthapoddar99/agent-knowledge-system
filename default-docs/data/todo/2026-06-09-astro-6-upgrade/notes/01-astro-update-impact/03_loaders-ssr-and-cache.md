---
title: "Impact: loaders, SSR & cache invalidation (highest risk)"
---

# Impact: loaders, SSR & cache invalidation (highest risk)

This is the single highest-risk area of the 5.16.12 → 6.4.5 bump. The framework
carries a **hand-rolled SSR cache-invalidation workaround** that reaches *directly*
into Vite's dev-server module-graph API. Astro 6 ships **Vite 7** (`^6.4.1` →
`^7.3.2`, per the research digest) and Astro 6.3.4+ landed a **core fix to the
same class of stale-SSR-module bug** the workaround was written to defeat. So the
bump can *fix*, *break*, or *quietly no-op* this code — and all three need
re-testing.

Sibling notes: breaking-changes overview → `01_overview.md`; the original design
rationale for the workaround lives at
`default-docs/data/todo/2026-05-08-update-date-time-optimization/notes/03_ssr-module-isolation.md`.

---

## What the workaround is

The bug it defends against (observed 2026-05-08): after a git commit, the running
dev server kept rendering the *previous* commit's derived `updated` timestamp
until a server restart. Root cause — under Vite 6 SSR, the **plugin context**
(our integration's watcher) and the **SSR context** (layouts reading issue data
during a request) can be *separate live instances of the same source file*, each
with its own module-level `Map` cache. Clearing the plugin-context copy never
touches the SSR-context copy the layouts read.

The fix is a **dual-invalidation**: clear the local copy, then force Vite to
re-instantiate the SSR copy via the module-graph API.

`astro-doc-code/src/dev-tools/integration.ts:198-205` computes the absolute
module IDs:

```ts
const issueDatesModuleId = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../loaders/issue-dates.ts',
);
const issuesLoaderModuleId = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../loaders/issues.ts',
);
```

`integration.ts:207-233` is the watcher handler that does the dual-invalidate on
a git-ref change:

```ts
// 1. Clear local (plugin-context) instances.
invalidateIssueDateCache();
invalidateIssuesCache();

// 2. Invalidate the SSR-context modules via moduleGraph.
for (const id of [issueDatesModuleId, issuesLoaderModuleId]) {
  const mod = server.moduleGraph.getModuleById(id);   // keyed by absolute id
  if (mod) {
    server.moduleGraph.invalidateModule(mod);
    invalidatedAny = true;
  }
}
```

### The module-level caches it targets

| File | State that gets isolated | Stored on |
|---|---|---|
| `src/loaders/issue-dates.ts:40` | `const cache = new Map<string, CacheEntry>()` (per-tracker derived git dates) | **plain module local** |
| `src/loaders/issues.ts:224` | `const cache = new Map<string, CacheEntry>()` (issues content, mtime-signature keyed) | **plain module local** |
| `src/loaders/cache-manager.ts:75-94` | unified content/sidebar/theme/settings/config cache | **`globalThis[CACHE_MANAGER_KEY]`** |

Note the asymmetry: `cache-manager.ts` sidesteps SSR isolation entirely by
hanging its state off `globalThis` (one copy regardless of how many module
instances exist — `cache-manager.ts:75-94`). The two **issue loaders use plain
module-level `const cache = new Map()`**, so they are precisely the modules that
*can* duplicate across contexts, which is why they (and only they) need the
`moduleGraph.invalidateModule` belt-and-suspenders.

---

## What it depends on in Vite's API (the breakage surface)

The workaround is coupled to four specific assumptions about Vite's dev server.
Each is a thing the Vite 7 bump could move under us.

| # | Dependency | Where | Why it could change in Vite 7 |
|---|---|---|---|
| 1 | `server.moduleGraph` exists and `.getModuleById(absId)` / `.invalidateModule(mod)` keep this shape/semantics | `integration.ts:224,226` | Vite 7 introduced the **Environment API** and a redesigned dev runtime; `server.moduleGraph` is being superseded by per-environment module graphs (`environment.moduleGraph`). The legacy `server.moduleGraph` is a back-compat shim in Vite 6/7 — its lifespan is the question. ⚠️ Unverified whether `server.moduleGraph` is still present in Vite 7.3.2 — confirm against the Vite 7 migration guide. |
| 2 | Invalidating a module's graph record actually drops the **SSR runner's evaluated cache** | semantic assumption behind `integration.ts:215-233` | Vite 7 moved SSR execution to the **Module Runner** with explicit `ssrCompatModuleRunner` lifecycle. Per the digest, invalidating the graph and invalidating the *runner's evaluated module cache* are now more clearly distinct. The graph-invalidate may no longer be sufficient — or may now be redundant. |
| 3 | Module IDs key by **absolute file path** | `integration.ts:198-205`; rationale in the design note (`ssrLoadModule` was rejected for being root-relative/ambiguous) | If Vite 7 normalizes IDs differently, `getModuleById(absId)` returns `undefined` and the invalidate silently no-ops (the `invalidatedAny` guard at `integration.ts:231` logs it but does not error). The digest notes Vite 7 added `normalizeModuleId` (#20277) — a hint that ID normalization shifted. |
| 4 | The plugin context and SSR context **are still two separate instances** | the whole premise | If Astro 6 + Vite 7's redesigned dev server makes them share one instance, step 2 of the dual-invalidate becomes a harmless no-op and step 1 alone suffices. That's the *good* outcome. |

---

## How the Astro-6 / Vite-7 bump could fix, break, or no-op it

Three scenarios, all plausible, all needing the post-bump test pass below.

**A. It gets fixed upstream (workaround becomes redundant).**
Per the digest, **Astro 6.3.4+ PR #16757** directly fixes "dev server serving
stale content when SSR-only modules change." Previously Astro's `astro:hmr-reload`
plugin returned an empty array after detecting SSR-only changes, which stopped
Vite's `updateModules` from propagating invalidation to the SSR module runner —
*exactly the stale-cache mechanism our note documents.* The fix returns the
SSR-only modules so Vite invalidates the runner's cache properly. If this covers
our git-ref-driven case, the manual `moduleGraph.invalidateModule` loop at
`integration.ts:222-230` becomes dead weight (harmless, but a simplification
opportunity). **Do not delete it speculatively — verify first.**

**B. It breaks silently (the dangerous outcome).**
If `server.moduleGraph` is removed/renamed under the Environment API (dependency
#1), or `getModuleById(absId)` stops matching (dependency #3), the loop falls
into the `!invalidatedAny` branch (`integration.ts:231-233`) and logs
`no SSR modules in graph yet (first-load case)` — which **looks identical to the
benign first-load case**. The symptom returns: stale `updated` timestamps after
commit, fresh process correct. This is the failure mode to watch hardest because
it is quiet.

**C. It breaks loudly.**
If `server.moduleGraph` is gone entirely, `integration.ts:224` throws
`Cannot read properties of undefined`, taking down the watcher handler. Easy to
spot, easy to fix — migrate to the per-environment module graph.

Independent of all three: Vite 7 swaps the file watcher to **chokidar v4** (per
digest). The git-ref watch set is reconciled dynamically at
`integration.ts:235-245` (and `getIssueDateWatchPaths()` in
`issue-dates.ts:88`). chokidar v4 changed glob handling and event timing — if
`.git/HEAD` / `.git/refs/heads/<branch>` events stop firing, step 1 of the
dual-invalidate never runs and the whole chain is moot, regardless of the
module-graph question.

---

## What to re-test after the bump (concrete, ordered)

Run the dev server (`./start dev`) and watch the console for the three
diagnostic lines defined at `integration.ts:209,228,232`.

1. **Git-ref watcher fires.** On dev-server start, confirm
   `[HMR] Watching git ref:` appears for `.git/HEAD` and the active branch ref.
   Commit anything under `default-docs/data/todo/` and confirm
   `[issue-dates] git ref changed:` prints. *No line → chokidar v4 regression
   (dependency: watcher).*

2. **SSR module invalidation still resolves.** After the commit, confirm
   `[issue-dates] SSR module invalidated: issue-dates.ts` and `… issues.ts`
   print. If instead you see
   `[issue-dates] no SSR modules in graph yet (first-load case)` on a *second+*
   commit, `getModuleById` is no longer matching — scenario **B** (silent break,
   dependency #1/#3). Investigate `server.moduleGraph` vs the Environment API.

3. **The actual symptom — stale `updated`.** This is the ground-truth test the
   logs only proxy for. Commit twice in a row to one issue folder; after each,
   reload the issues index/detail page and confirm the rendered `updated`
   timestamp matches the just-made commit (compare against a fresh `node`
   process or `git log -1 --format=%aI -- <issue-folder>`). Stale render with
   green logs → a *different* layer (Astro page cache / browser) or scenario A's
   fix interacting oddly.

4. **Decide whether the workaround is still needed (scenario A).** Temporarily
   comment out *only* step 2 (the `moduleGraph` loop, `integration.ts:222-230`),
   keeping step 1. Re-run test 3. If timestamps stay fresh with step 2 disabled,
   Astro 6.3.4+ #16757 now covers our case — file a follow-up to remove the
   workaround and update the design note. If it goes stale, keep the workaround
   (possibly ported to the per-environment module graph).

5. **`globalThis` cache still single-instance.** Edit a `settings.json` or a
   docs `.md`, confirm sidebar/content refresh (`cache-manager.ts` path). This
   should be immune to SSR isolation by construction
   (`cache-manager.ts:75-94`), but verify the `globalThis` key survives Vite 7's
   dev runtime — the Environment API changes process/worker boundaries on some
   adapters.

6. **API surface audit.** Before running, grep the upgraded
   `node_modules/vite` types for `moduleGraph` on `ViteDevServer`. If it's
   deprecated/removed, plan the migration to `environment.moduleGraph` /
   the Module Runner invalidation API *before* the symptom shows up in prod-like
   testing.

> ⚠️ Unverified — confirm against the official v6 upgrade guide and the Vite 7
> migration guide: (a) whether `server.moduleGraph` / `getModuleById` /
> `invalidateModule` retain their Vite 6 signatures under Vite 7.3.2, and
> (b) whether Astro 6.3.4+ #16757's SSR-only-module fix covers the
> git-ref-driven invalidation path this codebase uses (it was written for
> file-change HMR, not external git-state changes).
