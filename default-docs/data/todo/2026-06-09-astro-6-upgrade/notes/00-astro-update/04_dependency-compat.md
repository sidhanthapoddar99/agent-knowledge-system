---
title: "Dependency & version compatibility"
---

Dependency audit for the Astro **5.16.12 → 6.4.5** upgrade. Pins are read live from `astro-doc-code/package.json` (`astro-doc-code/package.json:12-45`). The question for each dep: does Astro 6 *constrain* it (force a co-bump or impose a peer floor), and what action follows.

## Runtime floors imposed by Astro 6

| Requirement | Astro 5.16.x | Astro 6.4.5 | Source |
|---|---|---|---|
| **Node.js** | 18.20.8+ | **`^20.19.1 \|\| >=22.12.0`** (Node 18 dropped) | Research digest (Astro 6.0.0 `package.json`); upgrade guide |
| **Vite** (bundled peer) | `^6.4.1` | **`^7.3.2`** (Vite 7.0+) | Research digest (Astro 5.16.0 / 6.4.5 `package.json`) |

Node 18 **and** Node 20.0–20.19.0 are out. The tightest floor comes from Vite 7 (`^20.19.0 || >=22.12.0`). `./start` and CI must verify the local/runner Node satisfies `>=20.19.1` (or `>=22.12.0`) before the upgrade — see the runner note below.

> Note: Vite is **not** a direct dependency in `package.json` — it arrives transitively through `astro`. There is no Vite pin to bump by hand; bumping `astro` to `^6.4.5` pulls Vite 7 automatically. Any Vite-specific config in `astro.config.mjs` (`vite.*`) is what to audit, not a version string.

## Project dependency matrix

Legend — **Constrained by Astro 6?** = does the Astro 6 upgrade force a version change or impose a new peer floor.

| Dependency | Current pin | Constrained by Astro 6? | Action |
|---|---|---|---|
| `astro` | `^5.16.12` | **Yes — the driver** | Bump to `^6.4.5`. Run `npx @astrojs/upgrade` to co-update Astro + official integrations in lockstep. |
| `@astrojs/mdx` | `^4.3.13` | **Yes — official integration** | Bump to `@astrojs/mdx@^6.0.3` (digest: "requires `astro ^6.4.0` minimum"). v4→v6 is a major jump; test MDX rendering. ⚠️ Unverified — v4→v5→v6 breaking-change details did not load in research; confirm against the [mdx CHANGELOG](https://github.com/withastro/astro/blob/main/packages/integrations/mdx/CHANGELOG.md). |
| `shiki` | `^3.22.0` | **Yes — Astro bundles Shiki 4** | Astro 6 upgrades its internal Shiki to `^4.0.x`. We pin Shiki directly, so bump to `^4.0.0` to stay aligned with Astro's bundled major and avoid two Shiki copies. Visual-regression test code-block highlighting. |
| `vite` | *(not pinned; transitive via astro)* | **Yes — 6→7 via Astro** | No manual pin. Bumping `astro` pulls Vite 7. Audit `vite.*` config + SSR workarounds (see below). |
| `marked` | `^17.0.1` | **No** — direct dep, not in Astro's tree | None forced. Optional independent bump. |
| `gray-matter` | `^4.0.3` | **No** — direct dep | None forced. |
| `js-yaml` | `^4.1.0` | **No** — direct dep | None forced. |
| `glob` | `^11.0.0` | **No** — direct dep | None forced. (Distinct from `Astro.glob()`, which v6 removes — see the [breaking-changes note]; that's the Astro API, not this npm package.) |
| `mermaid` | `^11.12.2` | **No** — direct dep | None forced. |
| `@hpcc-js/wasm-graphviz` | `^1.21.0` | **No** — direct dep | None forced. |
| `@codemirror/*` (15 pkgs) | `^6.x` (see below) | **No** — editor stack, independent of Astro | None forced. The whole `@codemirror/*` set is decoupled from Astro's build. |
| `y-codemirror.next` | `^0.3.5` | **No** | None forced. |
| `yjs` (dev) | `^13.6.29` | **No** | None forced. |
| `y-protocols` (dev) | `^1.0.7` | **No** | None forced. |
| `ws` (dev) | `^8.19.0` | **No** | None forced. |
| `typescript` (dev) | `^5.7.0` | **No** — digest: "No TypeScript major bump required" | None forced. |
| `@types/node` (dev) | `^22.0.0` | Indirect | Already on the 22 line — matches the Node 22 floor. Keep. |
| `@types/js-yaml` (dev) | `^4.0.9` | **No** | None forced. |

### The `@codemirror/*` set (all `^6.x`)

`autocomplete 6.20.1`, `commands 6.10.3`, `lang-css 6.3.1`, `lang-html 6.4.11`, `lang-javascript 6.2.5`, `lang-json 6.0.2`, `lang-markdown 6.5.0`, `lang-yaml 6.1.3`, `language 6.12.3`, `language-data 6.5.2`, `search 6.6.0`, `state 6.6.0`, `theme-one-dark 6.1.3`, `view 6.41.0` (`astro-doc-code/package.json:14-27`). These power the live editor (`src/dev-tools/editor/`). None is constrained by Astro 6 — they bundle through Vite as ordinary client modules. No action required.

## Deps likely to need a co-bump

Three packages move *because of* the Astro 6 upgrade, not on their own schedule:

1. **`@astrojs/mdx` → `^6.0.3`** — hard peer requirement (`astro ^6.4.0`). Leaving it at `^4.x` will break install / type resolution.
2. **`shiki` → `^4.0.x`** — Astro 6 bundles Shiki 4 internally; our direct pin should track the same major to avoid a duplicated/diverged Shiki.
3. **`astro` → `^6.4.5`** — the trigger; pulls **Vite 7** transitively.

Everything else (`marked`, `gray-matter`, `js-yaml`, `glob`, `mermaid`, the CodeMirror stack, Yjs) is independent of Astro's dependency tree and can stay put — bump those only on their own merits, not as part of this upgrade.

## Zod (no direct pin, but a behavior change)

We do **not** list `zod` in `package.json`, so there is no version to bump. But Astro 6 ships **Zod 4** internally and the digest flags two ecosystem changes:
- `astro:schema` is **removed** → import from `astro/zod` instead.
- Direct `import { z } from 'zod'` in any schema code should become `import { z } from 'astro/zod'`.

Action: grep the framework source for `astro:schema` and bare `from 'zod'` before upgrading. ⚠️ Unverified whether this repo uses either — confirm with a search; cross-link the [breaking-changes note] for the full Zod v4 string-validator migration.

## Runner & lockfile (bun primary, npm fallback)

The framework root carries **`bun.lock`** (`astro-doc-code/bun.lock`, ~153 KiB) and **no** `package-lock.json` — bun is the primary runner, npm is the documented fallback (`./start` prefers bun, falls back to npm; see `CLAUDE.md` "Build Commands").

After editing `package.json` for the upgrade, **regenerate the lockfile**:

| Runner | Command | Lockfile written |
|---|---|---|
| bun (primary) | `bun install` | `bun.lock` |
| npm (fallback) | `npm install` | `package-lock.json` |

Notes:
- Commit the regenerated **`bun.lock`** — it is the source of truth for this repo. Do not introduce a `package-lock.json` unless the team is switching runners.
- `npx @astrojs/upgrade` edits `package.json` and triggers an install; if it runs under npm it may emit a `package-lock.json`. After running it, re-run `bun install` so `bun.lock` is the committed lockfile, and delete any stray `package-lock.json`.
- A clean lockfile regen is the moment Vite 7 / Shiki 4 / mdx 6 actually land in the tree — run a full `./start build` immediately after to surface peer-dependency conflicts early.

## Cross-references

- Vite 7 SSR module-isolation impact on the dev-toolbar invalidation workarounds → `05_*` (vite/ssr note).
- Removed APIs (`Astro.glob()`, `astro:schema`, `<ViewTransitions />`) and the full breaking-changes list → the breaking-changes note in this folder.
