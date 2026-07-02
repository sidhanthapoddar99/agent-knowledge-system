---
title: "Per-subsystem impact & risk"
---

# Where it would hurt — impact & risk

Condensed from the source issue's `01-astro-update-impact/` group (overview + config/integration
+ loaders/SSR + parsers/layouts + risk-summary). This is the "how dangerous is it" half of the
decision, and it's the half that sank the bump: **most of the testing effort would go to
defending code that a Go rewrite deletes outright.**

## Risk-ranked subsystems

| Rank | Subsystem | Why exposed | Verdict |
|---|---|---|---|
| 🔴 **1** | **Loaders + SSR cache invalidation** (`dev-tools/integration.ts`, `loaders/issue-dates.ts`, `loaders/issues.ts`) | Hand-rolled workaround reaching into Vite's `server.moduleGraph`. Vite 7 + Astro's own fix change the exact behaviour it compensates for — could fix, break, or silently no-op it. | The whole reason the bump is scary. |
| 🟠 **2** | **Config + integration** (`astro.config.mjs`, integration hooks, `middleware.ts`) | Integration uses only `astro:config:setup` + `addDevToolbarApp` + `updateConfig` — all reported **safe**. Main exposure is the Vite 7 config surface (`fs.allow` OK, `fs.cachedChecks` removed) and Node-floor enforcement. | Low — mechanical. |
| 🟡 **3** | **Parsers + custom-tags** (`src/parsers/`, `src/custom-tags/`, `@astrojs/mdx`) | Pipeline is framework-agnostic `marked`+`shiki`+`gray-matter` — insulated from Astro's content/collections/Zod/Shiki upheaval by construction. Only real work: co-bump MDX, re-test `import.meta.glob` layout discovery under Vite 7, eyeball `<style>`/`<script>` order. | Low. |
| 🟢 **4** | **Layouts** (`src/layouts/**`) | Source-order `<style>`/`<script>` change; already uses `import.meta.glob()`; no `ViewTransitions`/`getImage` to migrate. | Low — visual regression only. |

The insulation is the quiet headline: because this framework **owns its content layer**, the
big Astro 6 changes (content collections, Zod, image service, adapters) are inert. That cuts
the blast radius dramatically — but it also means Astro 6 buys us almost nothing (see
`04_benefits-and-verdict.md`).

## The single highest-risk area: the SSR module-invalidation workaround

`dev-tools/integration.ts` carries a deliberate **dual-invalidation** block. On a git-ref
change it (1) clears the plugin-context loader caches, then (2) reaches into Vite's dev-server
`server.moduleGraph` to force-invalidate the **SSR-context** copies of `issue-dates.ts` and
`issues.ts`.

**Why it exists:** under Vite 6 SSR, the plugin context and the SSR context can hold *separate
live instances* of the same module, each with its own module-level `Map` cache — so clearing
one never touches the other. Symptom when it fails: after a git commit, layouts render the
*previous* commit's derived `updated` timestamp until a server restart. (`cache-manager.ts`
dodges this by hanging state off `globalThis`; only the two issue loaders use plain
module-level caches, so only they need the belt-and-suspenders.)

**Why the bump makes it fragile — three plausible outcomes, all needing a live test:**

- **A. Fixed upstream (redundant).** Astro 6.3.4+ (#16757) fixes the exact stale-SSR-only-module
  class: `astro:hmr-reload` now returns SSR-only modules so Vite's `updateModules` invalidates
  the runner cache. *If* it covers our git-ref-driven path, step 2 becomes dead weight and can
  be deleted. ⚠️ Unverified — the fix was written for file-change HMR, not external git-state
  changes.
- **B. Breaks silently (the dangerous one).** If `server.moduleGraph` is removed/renamed under
  Vite 7's Environment API, or `getModuleById(absId)` stops matching (Vite 7 added
  `normalizeModuleId`), the loop no-ops and logs the *benign first-load* message — identical to
  success. Stale timestamps return with **no error**. Data-correctness-shaped, no build-time
  signal.
- **C. Breaks loudly.** `server.moduleGraph` gone entirely → throws → easy to spot, easy to fix.

Plus: Vite 7's chokidar v4 could change git-ref (`.git/HEAD`, branch-ref) event timing; if those
events stop firing, step 1 never runs and the whole chain is moot.

**This is the crux of the cancellation.** The upgrade would spend its scariest testing effort
re-validating a workaround against a moving Vite internal — and the Go runtime makes the bug
class *not exist* (single process, single module instance, no Vite SSR graph). Paying to defend
code the alternative deletes is the "upside-down cost/benefit" the cancellation named.

## Rollback was cheap (noted for completeness)

The bump is one file + lockfile, no content migration (no Astro content collections). Revert =
`git checkout package.json bun.lock` + `rm -rf node_modules && bun install` (the `rm` is what
actually forces the downgrade, given the reinstall gap). Cheap rollback wasn't enough to
outweigh the silent-failure risk on the SSR surface.
