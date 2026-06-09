---
title: "Upgrade steps"
---

# Upgrade steps

Concrete ordered checklist for bumping **this** repo from `astro@5.16.12` → `6.4.5`. Each step is `command` + **what to check**. Run from the repo root (`documentation-template/`) unless noted.

Current pins (from `astro-doc-code/package.json:29` and `:13`):

| Package | Now | Target |
|---|---|---|
| `astro` | `^5.16.12` | `^6.4.5` |
| `@astrojs/mdx` | `^4.3.13` | `^6.0.3` (requires `astro ^6.4.0`) |

> `@astrojs/mdx@6.0.3` is the version the research digest lists as Astro-6-compatible; pin `^6.0.3`. ⚠️ Unverified — confirm the exact published version against the `@astrojs/mdx` changelog at upgrade time.

---

## 0. Pre-flight — Node version

```bash
node -v
```

**Check:** must be `>= 22.12.0`. Astro 6 (and the Vite 7 it vendors) drop Node 18 **and** Node 20.x below 20.19; Astro 6.0's floor is `^20.19.1 || >=22.12.0`. If you're below this, the install or first build will fail. `./start` does **not** verify Node version (see `start:94-106` — it only picks a runner), so this is a manual gate.

---

## 1. Bump the dependencies in `package.json`

Two options. Prefer **1a** (deterministic, edit-and-pin); **1b** is the official codemod-bearing path.

### 1a. Manual edit (recommended for this repo)

Edit `astro-doc-code/package.json`:

- `"astro": "^5.16.12"` → `"astro": "^6.4.5"`
- `"@astrojs/mdx": "^4.3.13"` → `"@astrojs/mdx": "^6.0.3"`

**Check:** only those two lines change in the diff. Leave `shiki` (`^3.22.0`, line 35), `marked`, `gray-matter`, and the CodeMirror/Yjs stack alone — they're direct deps not constrained by Astro (Astro vendors its own Shiki 4 internally). `@types/node` is already `^22.0.0` (line 39), which matches the new Node floor.

### 1b. Official upgrade CLI (alternative)

```bash
cd astro-doc-code && npx @astrojs/upgrade
```

**Check:** this updates `astro` and **official** `@astrojs/*` adapters/integrations together to their latest compatible versions and runs available codemods. It writes to `package.json` and installs in one shot — so if you use it, **skip step 2's edit but still verify the reinstall happened** (run `bun install` after to reconcile the lockfile if the project uses bun rather than the npm the CLI assumes). This repo has only `@astrojs/mdx` as an official integration; no adapter is installed.

---

## 2. Reinstall dependencies — **manual, `./start` will NOT do this**

This is the critical gotcha. Per `comments/002` of this issue: `./start` self-updates framework *source* via git but **never reinstalls deps when `package.json`/the lockfile changes**. Its install step (`start:109-113`) is guarded by `if [ ! -d node_modules ]` — it only installs when `node_modules` is **entirely missing**. And `./start clean` (`start:83-92`) wipes `.astro/`, `dist/`, `node_modules/.vite/` but **not `node_modules/` itself**. So after editing `package.json`, a stale Astro 5 tree stays installed and the build runs against it.

Force a clean reinstall:

```bash
cd astro-doc-code && rm -rf node_modules && bun install
```

(Use `npm install` if this checkout runs on npm — `start:95-102` prefers bun, falls back to npm.)

**Check:**
- `bun install` exits 0.
- `node_modules/astro/package.json` reports `"version": "6.x"` — confirm with `cat astro-doc-code/node_modules/astro/package.json | grep '"version"'`.
- `node_modules/@astrojs/mdx/package.json` reports `6.x`.
- The vendored Vite is 7.x: `cat astro-doc-code/node_modules/vite/package.json | grep '"version"'` → expect `7.x` (Astro 6.4.5 pins Vite `^7.3.2`).

---

## 3. Sanity gate — clean build

```bash
./start clean build
```

This wipes the stale build caches (`.astro/`, `dist/`, `node_modules/.vite/`) **then** runs `astro build` (`start:83-92` clean branch → `start:116-117` forwards the script). The clean is important: Astro caches compiled routes by source path and Vite caches transformed modules — both can carry Astro-5-era artifacts that produce confusing import errors against the new runtime.

**Check (build must exit 0).** Watch specifically for the Astro-6 break-points relevant to this codebase (cross-ref `02_*` impact notes in this folder):

| Area | What to scan the build output / source for |
|---|---|
| Dev-toolbar integration | `src/dev-tools/integration.ts` — `astro:config:setup`, `addDevToolbarApp()`, `addMiddleware()`, `updateConfig()` are all reported safe; build should not error here. |
| Adapter build hooks | We use **no** adapter and don't touch `astro:build:ssr` / `astro:build:done`, so the `entryPoints`/`routes` removals shouldn't surface. Confirm no error mentions them. |
| `Astro.glob()` | Removed in v6 → must be `import.meta.glob()`. The router already uses `import.meta.glob()` per `CLAUDE.md`; confirm no `Astro.glob(` remains in `src/`. |
| `astro:schema` | Removed → `astro/zod`. Grep `src/` for `astro:schema`. |
| Zod v4 | Astro 6 ships Zod 4; if any schema imports Zod directly, switch to `import { z } from 'astro/zod'`. |
| Content collections | Only relevant if `src/content/config.ts` exists — this framework uses custom loaders under `src/loaders/`, not Astro content collections, so the `content.config.ts` rename / `entry.slug`→`entry.id` migration likely **does not apply**. Confirm there is no `src/content/` dir. |
| CJS config | `astro.config.mjs` is already ESM — no `.cjs`/`.cts` config to migrate. |

If the build fails, fix against the source area named in the error before proceeding — do **not** advance to dev.

---

## 4. Launch dev

```bash
./start dev
```

Forwards straight to `astro dev` (`start:116-117`), skipping preflight. Astro 6's `astro dev` is rebuilt on Vite's Environment API.

**Check — exercise the SSR module-invalidation path** (the hard-won, Vite-version-coupled code this whole issue is cautious about — see `comments/001` and the `02_*` SSR note):

1. Dev server starts without errors and the site renders.
2. Edit a watched content/config file (e.g. an issue's `settings.json` or a `.astro` layout) and confirm the change reflects on next request — no stale SSR cache.
3. Watch the toolbar apps (layout-selector, error-logger, editor, system-metrics, cache-inspector) mount and function.
4. Inspect the dual-invalidation workaround in `src/dev-tools/integration.ts` (`moduleGraph.invalidateModule` + local cache). Astro 6.3.4+ shipped a **core** fix (PR #16757) for SSR-only module staleness; with that fix the dual-invalidation may be redundant or could conflict. If invalidation now works through Vite alone, file a follow-up subtask to **simplify** — do not remove it blind in this step.

---

## 5. Commit

Only after steps 3 **and** 4 are green:

```bash
git add astro-doc-code/package.json astro-doc-code/bun.lock
git commit
```

**Check:** the diff is the two version bumps plus the lockfile delta — nothing else. If `@astrojs/upgrade` (step 1b) or codemods touched `src/`, review those changes individually against the impact notes before committing.

---

## Quick reference — full sequence

```bash
node -v                                              # >= 22.12.0
# edit astro-doc-code/package.json: astro ^6.4.5, @astrojs/mdx ^6.0.3
cd astro-doc-code && rm -rf node_modules && bun install   # ./start will NOT do this
cd ..                                                # back to repo root
./start clean build                                  # sanity gate — must be green
./start dev                                          # exercise SSR invalidation + toolbar
```
