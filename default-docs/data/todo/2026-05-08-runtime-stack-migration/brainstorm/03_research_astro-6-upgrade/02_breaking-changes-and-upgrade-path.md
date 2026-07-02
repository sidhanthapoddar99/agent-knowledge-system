---
title: "What would break + the upgrade path"
---

# What would break, and how the bump would go

Condensed from the source issue's `00-astro-update/` group (overview + breaking-changes +
upgrade-steps + dependency-compat). This is the "what it would cost to actually do it" half of
the decision. Pointer-style; full catalogue lives in the source notes.

## The version jump

"One major" from our pin, but it drags three more majors under the hood:

| Package | Current pin | Target | Constrained by Astro 6? |
|---|---|---|---|
| `astro` | `^5.16.12` | `^6.4.5` | **Yes — the driver.** Pulls Vite 7 transitively. |
| `@astrojs/mdx` | `^4.3.13` | `^6.0.3` | **Yes** — hard peer floor `astro ^6.4.0`; v4→v6 major jump. |
| `shiki` (direct pin) | `^3.22.0` | `^4.0.x` | **Yes** — Astro bundles Shiki 4; align to avoid two copies. |
| Vite (transitive) | `^6.4.1` | `^7.3.2` | **Yes** — arrives via Astro; no manual pin. |
| Node.js | 18+ tolerated | **`^20.19.1 \|\| >=22.12.0`** | **Yes** — Node 18 and 20.x-below-20.19 dropped. |
| Zod (via `astro:schema`) | v3 | v4, `astro:schema` → `astro/zod` | Bundled; only bites if we import it. |
| `marked`, `gray-matter`, `js-yaml`, `glob`, `mermaid`, CodeMirror stack, Yjs | various | unchanged | **No** — direct deps outside Astro's tree. |

## Breaking changes that could actually touch this repo

The source catalogued the full v5→v6 break list; most are **no-ops here** (grep-confirmed
absent). The ones that need a real check:

- **Node floor → 22.12+.** Hard gate — nothing builds below it. `package.json` has **no
  `engines` field** and `./start` never checks Node version, so nothing warns. Audit dev/CI
  first.
- **SSR / dev-server redesign on Vite's Environment API** + **chokidar v3→v4** watcher +
  `ssrCompatModuleRunner` lifecycle changes → the surface the SSR workaround depends on (see
  `03_impact-and-risk.md`).
- **`@astrojs/mdx` v4→v6** — must co-bump; ⚠️ exact MDX breaking changes were never verified
  (changelog fetch failed during research). No `.mdx` content exists, so it's a build-time
  integration bump only.
- **Markdown heading IDs: trailing hyphens no longer stripped** — but *our* heading IDs come
  from our own `heading-ids.ts` slugify, not Astro's, so this is a no-op for us.
- **`<style>`/`<script>` now render in source order** (was reversed in v5) — visual-regression
  the layout chrome.
- **`import.meta.env` always inlined, never coerced** — confirm `import.meta.env.DEV` still
  reads boolean in middleware.

**Confirmed no-ops** (never used in `src/`): `Astro.glob()` removal, `astro:schema`,
`<ViewTransitions />`, `getImage()`, legacy content collections, `ASSETS_PREFIX`,
`skipSsrTransform`, adapter build-hook (`entryPoints`/`routes`) removals, sessions, i18n.

## The upgrade path (if it were done)

1. Gate Node ≥ 22.12.0 (manual — `./start` won't check).
2. Edit `package.json`: `astro ^6.4.5`, `@astrojs/mdx ^6.0.3`; align `shiki ^4`. (Or
   `npx @astrojs/upgrade`.)
3. **Force a clean reinstall** — see the gotcha below.
4. `./start clean build` — the cheapest, highest-signal gate; catches removed APIs and config
   problems in one shot.
5. `./start dev` — exercise the SSR-invalidation path and the five toolbar apps.
6. Commit only the two version bumps + lockfile delta.

## The `./start` reinstall gotcha (a finding in its own right)

The source issue's second comment surfaced a real gap worth carrying forward independent of the
upgrade decision:

**`./start` self-updates framework *source* via `git pull` but never reinstalls *dependencies*
when they change.** Its install step is guarded by `if [ ! -d node_modules ]` — it installs
**only when `node_modules` is entirely missing**. And `./start clean` wipes `.astro/`, `dist/`,
`node_modules/.vite/` but **not `node_modules/` itself**.

Consequence: after a pull that bumps a dependency (exactly this Astro 5→6 case), the new
`package.json`/lockfile sit on disk but aren't applied — the build sanity check runs against the
**stale** tree. To actually pick up such an upgrade you must `rm -rf node_modules && bun install`
manually. Suggested fix (filed as a candidate subtask in the source): after a successful pull,
detect a changed `package.json`/lockfile and reinstall, or run `bun install --frozen-lockfile`
unconditionally in preflight.
