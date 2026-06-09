## Goal

Move the framework from **Astro 5.16.12** to **Astro 6.4.5** (current latest), with a clear-eyed view of the breaking changes and the blast radius across this codebase. This issue is **discussion + impact capture first** — the actual bump is small (`package.json` + lockfile); the risk lives in the SSR / Vite / integration surface this framework leans on heavily.

## Why

- We're a full major version behind. Astro 6 ships a newer Vite, updated SSR/`moduleGraph` semantics, and integration-API changes — exactly the surfaces this framework's dev-tooling and cache layer depend on.
- Recent commits (`moduleGraph.invalidateModule` SSR invalidation, dual-invalidation for Vite SSR module isolation) were fighting Vite 6 SSR module-isolation behaviour. A Vite bump inside Astro 6 may change — fix or worsen — that behaviour, so the upgrade needs to be evaluated against those workarounds specifically.

## Scope

- **`notes/00-astro-update/`** — the upgrade itself: what's new in Astro 6, the 5→6 breaking changes, the concrete bump steps, and dependency/version compatibility (Vite, Node, `@astrojs/mdx`, integration API).
- **`notes/01-astro-update-impact/`** — impact on *this* repo: `astro.config.mjs` + `devToolbarIntegration`, the loaders / SSR cache-invalidation work, the parser pipeline + custom tags, layouts, and a risk + validation plan.

## Open question answered in this issue

> Does `./start` update/reinstall dependencies the way it self-updates the framework code?

**No** — see `comments/002`. The script git-pulls the framework but only installs deps when `node_modules` is entirely missing; a `package.json` bump (like this Astro upgrade) is silently skipped. Relevant because picking up this upgrade via `./start` alone would run the build sanity check against *stale* dependencies.

## Related

- **`2026-05-08-runtime-stack-migration`** — proposes replacing Astro entirely with a Go + Vite single binary. Opposite direction; that's a long-horizon `low`-priority rewrite. This issue keeps the current Astro stack current in the meantime. The Vite SSR module-isolation pain documented there (`notes/discussion/05_issue.md`) is the same surface this upgrade must re-test.
- **`2026-04-25-framework-as-npm-package`**, **`2026-04-26-framework-as-cli-tool`** — packaging directions that also pin an Astro version; a 6.x bump should land before/with any packaging work.
