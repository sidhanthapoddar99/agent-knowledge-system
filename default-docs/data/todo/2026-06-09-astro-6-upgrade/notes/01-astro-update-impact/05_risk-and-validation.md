---
title: "Risk summary & validation plan"
---

Synthesises the per-area impact notes (`01`–`04` siblings) into a risk-ranked list, then gives a concrete validation plan built on **this project's own tooling** (`./start`, the Yjs live editor, the dev-toolbar apps, and the docs/blog/issues routes). Ends with a rollback note and a proposed subtask list.

Scope under test: `astro@^5.16.12 → ^6.4.5`, which drags `vite ^6.4.1 → ^7.3.2`, `@astrojs/mdx ^4.3.13 → 6.x`, plus Shiki 3→4 and Zod 3→4 transitively (see RESEARCH digest in the issue). Current pins live in `astro-doc-code/package.json`.

---

## Risk-ranked summary

Ordered highest blast-radius first. "Confidence" = how sure we are the item *applies to this repo* (not how severe).

| # | Risk | Severity | Confidence | Why it matters here |
|---|---|---|---|---|
| 1 | **Node floor jumps to 22.12.0** (Astro 6 + Vite 7 both drop Node 18/20) | High | High | Hard gate — nothing builds below it. `astro-doc-code/package.json` has **no `engines` field**, so nothing warns; the dev/CI box must be audited first. |
| 2 | **SSR module-invalidation workaround may break or become redundant** | High | High | `src/dev-tools/integration.ts:215–226` manually walks `server.moduleGraph` and calls `invalidateModule()` for SSR-context modules (the dual-invalidation pattern, cross-referenced from `optimization/notes/03_ssr-module-isolation.md`). Vite 7 changes SSR module-runner lifecycle, and Astro 6.3.4+ ships a core fix (#16757) for the exact stale-SSR-cache class this workaround targets. The hand-rolled code could now fight the core fix or silently no-op. |
| 3 | **Vite 6→7 bump** (whole build + dev server) | High | High | New dev server uses Vite's Environment API; CSS-in-SSR now minifies by default; `experimental.skipSsrTransform` removed; chokidar v4 file watcher. Touches every build and the live-preview/HMR loop the editor depends on. |
| 4 | **`@astrojs/mdx` v4 → v6** | Medium | Medium | Two-major jump; requires `astro ^6.4.0`. Custom-tag / markdown pipeline under `src/parsers/` must render identically. ⚠️ Unverified — v4→v6 MDX changelog not fully captured; confirm against the official package CHANGELOG. |
| 5 | **Zod 3 → 4** (bundled by Astro) | Medium | Medium | `astro:schema` removed → use `astro/zod`; v4 moves/removes string-format validators. Affects config/settings schema validation if we import Zod from Astro. ⚠️ Confirm whether our loaders import Zod from Astro at all. |
| 6 | **Removed/renamed top-level APIs** | Medium | Medium | `Astro.glob()` → `import.meta.glob()`; `<ViewTransitions />` → `<ClientRouter />`; `getImage()` now build-time only; `astro:schema` → `astro/zod`. Grep the tree before assuming none apply — `[...slug].astro` already uses `import.meta.glob()` for layout resolution, so that path is fine. |
| 7 | **Legacy content-collections API removed** | Low | Medium | Only bites if we use `src/content/config.ts` / `entry.slug` / `entry.render()`. This repo loads content via custom loaders in `src/loaders/` (`data.ts`, `issues.ts`), not Astro content collections — likely **N/A**, but confirm there is no `src/content.config.ts` dependency. |
| 8 | **Shiki 3 → 4** | Low | Medium | Syntax-highlight output may shift; visual-regression only, no API surface we call directly. |
| 9 | **Markdown heading-ID change** (trailing hyphens no longer stripped) | Low | High | Anchor links to headings ending in a hyphen change slug. Affects outline/pagination anchor links if any heading qualifies. Low likelihood in our content. |
| 10 | **Misc behavior shifts** | Low | High | `<style>`/`<script>` now render in source order (was reversed); `import.meta.env` no longer type-coerced; endpoint-with-extension trailing-slash stricter; `getStaticPaths()` rejects numeric params. Each is a small grep-and-check. |

**The two items that decide go/no-go are #1 (Node floor) and #2 (SSR invalidation).** Everything else is mechanical or low-likelihood.

---

## Pre-req gotcha — `./start` will NOT reinstall dependencies

Restating the gap this issue exists to document (`issue.md` description, and the dependency-reinstall note among the siblings):

`./start` (read it at repo root) installs deps **only when `node_modules` is missing** — see `start:110`:

```bash
# 2. Install if node_modules is missing
if [ ! -d node_modules ]; then
  echo "[start] node_modules missing — running '$INSTALL'..."
  $INSTALL
fi
```

Its update-check step (`start:29–78`) does a `git pull --ff-only` of framework code but **never** runs `bun install` / `npm install` afterward. So after bumping `package.json`, an existing checkout with a populated `node_modules` will **silently run on the old Astro**. 

**Mandatory first step before any validation below:** force a reinstall manually.

```bash
cd astro-doc-code
rm -rf node_modules        # or: ../start clean  (wipes .astro, dist, node_modules/.vite — NOT node_modules)
bun install                # or npm install — matches the runner ./start would pick (bun preferred)
```

Note `./start clean` (`start:83–92`) wipes `.astro/`, `dist/`, and `node_modules/.vite/` but **not** `node_modules` itself — so `clean` alone does not pick up new dependency versions. You must delete `node_modules` (or run the install explicitly) to get Astro 6 on disk.

---

## Validation plan

Run top-to-bottom. Each gate must pass before the next.

### Gate 0 — environment

- [ ] `node -v` ≥ **22.12.0** (the hardest constraint; Vite 7 floor is `^20.19.0 || >=22.12.0`, Astro 6 floor `^20.19.1 || >=22.12.0` — target 22.12+ to satisfy both).
- [ ] Deps actually reinstalled (see gotcha above). Confirm with `bun pm ls astro` / `npm ls astro` showing `6.4.5`, and `vite` resolving to `7.x`.

### Gate 1 — `./start clean build` (the preflight build sanity gate)

`./start`'s no-arg preflight runs a **full production build before it ever launches dev** (`start:120–126`): `$RUN build`, aborting on any non-zero exit. We run the `clean` variant to force fresh compiled routes (stale `.astro` cache can import dist modules from the v5 layout) :

```bash
./start clean build     # wipe .astro/dist/.vite, then run the production build only
```

- [ ] Build exits 0. This is the cheapest, highest-signal gate — it catches removed APIs, MDX-integration incompatibility, Zod/`astro:schema` breakage, and config-format problems in one shot.
- [ ] Scan build output for new deprecation warnings (source-order `<style>`/`<script>`, i18n redirect default, image-fit defaults).

### Gate 2 — `./start dev` + the SSR-invalidation regression (risk #2)

```bash
./start dev     # skips preflight, dev server only
```

- [ ] Dev server boots; no Vite 7 / Environment-API errors in console.
- [ ] **SSR invalidation smoke test** — the workaround in `integration.ts:215–226` exists to push edits into the SSR module cache. With the dev server up:
  - Edit a layout/`.astro` file and a content file; confirm the rendered route updates **without a manual restart**.
  - Watch the dev console for the dual-invalidation log path.
  - **Decision point:** if Astro 6's core fix (#16757) now handles this, the manual `moduleGraph.invalidateModule()` block may be removable — spin that off as its own subtask, don't rip it out mid-validation.
- [ ] Dev-server **restart** test: stop and restart `./start dev`; confirm no stale SSR module cache survives (Vite 7 recreates `ssrCompatModuleRunner` on restart).

### Gate 3 — dev-toolbar apps

All five apps live under `src/dev-tools/` (`layout-selector/`, `error-logger/`, `editor/`, `system-metrics/`, `cache-inspector/`) and register via `integration.ts`. Research rates the toolbar API backward-compatible, so this is regression confirmation, not migration:

- [ ] Toolbar mounts; all five apps appear (system-metrics + cache-inspector under the 3-dot overflow).
- [ ] **layout-selector** — switch layout & theme; confirm live re-render.
- [ ] **error-logger** — shows doc errors/warnings.
- [ ] **cache-inspector** — server in-memory cache renders (validates the SSR cache layer is intact post-Vite-7).
- [ ] **system-metrics** — CPU/RAM stream updates.

### Gate 4 — live editor (Yjs / CRDT)

The editor is mounted at `/editor` (`src/dev-tools/editor/`, with the Yjs sync server at `src/dev-tools/server/yjs-sync.ts` and presence at `presence.ts`). This is the most HMR/SSR-sensitive surface, so it gets its own gate:

- [ ] Open `/editor`; file-tree loads.
- [ ] Edit a doc; **live preview** updates (exercises the Vite 7 HMR + SSR-invalidation path directly — the riskiest interaction).
- [ ] Yjs sync: open the same doc in two tabs; confirm CRDT edits converge and presence cursors render.
- [ ] Save; confirm the file persists and the rendered route reflects it.

### Gate 5 — route matrix (docs / blog / issues)

Layout resolution in `src/pages/[...slug].astro` uses `import.meta.glob()` (already v6-safe). Walk one of each:

- [ ] **docs** — `/user-guide` and a deep page: sidebar, outline, pagination, custom tags (callouts/tabs/collapsible) all render; markdown headings/anchors intact (check risk #9 — any heading ending in a hyphen).
- [ ] **blog** — index + a post: `PostCard`, post body, frontmatter all correct.
- [ ] **issues** — index + a detail page (e.g. *this* issue): FilterBar, IssuesTable, pagination, and `parts/client.ts` interactivity work; subtasks/comments/agent-log render.
- [ ] **assets** — a logo/image serves from `/assets/` (validates image pipeline; note v6 crops-by-default + no-upscale + `getImage()` build-time-only).
- [ ] Run the project validators: `docs-check-config`, `docs-check-blog`, and `docs-check-section` on each section — all exit 0.

---

## Rollback

The bump is a one-file change plus a lockfile. To revert:

```bash
# 1. Revert the package.json bump (and lockfile)
git checkout -- astro-doc-code/package.json astro-doc-code/bun.lock
#   or, if already committed:  git revert <bump-commit>

# 2. Reinstall to restore v5 on disk (./start will NOT do this for you — see gotcha)
cd astro-doc-code
rm -rf node_modules .astro dist node_modules/.vite
bun install            # back to astro@5.16.12

# 3. Sanity gate
../start clean build
```

Because `./start`'s reinstall is `node_modules`-presence-gated (`start:110`), step 2's `rm -rf node_modules` is what actually forces the downgrade — a `git checkout` of `package.json` alone leaves the v6 tree installed. No content/data migration is involved (we don't use Astro content collections), so rollback is purely a dependency operation — **provided no v6-only API edits were committed**. If validation drove code changes (e.g. removing the `invalidateModule` block), revert those commits too.

---

## Proposed subtasks (if greenlit)

Spawn these under this issue (`docs-subtasks` / `docs-set-state`). Roughly dependency-ordered:

1. **Audit Node floor & pin `engines`** — confirm 22.12+ in dev/CI; add an `engines.node` field to `astro-doc-code/package.json` so the gap can't recur silently.
2. **Bump `astro` + `@astrojs/mdx` + reinstall** — the core change; pass Gate 1 (`./start clean build`).
3. **Grep & migrate removed APIs** — sweep for `Astro.glob`, `astro:schema`, `<ViewTransitions />`, `getImage()` client-side, numeric `getStaticPaths` params; fix any hits.
4. **Resolve the SSR-invalidation workaround vs core fix** — decide whether `integration.ts:215–226` dual-invalidation stays, is simplified, or is removed in favour of Astro #16757; regression-test against Gate 2 + Gate 4.
5. **MDX / custom-tag rendering regression** — confirm `src/parsers/` output is byte-stable across docs/blog/issues; capture before/after.
6. **Fix the `./start` reinstall gap** — make the update-check step run install when `package.json`/lockfile changed after a pull (the gap this issue documents). Likely its own discussion before implementation.
7. **Shiki 4 + markdown-anchor visual regression** — confirm code blocks and heading anchors are unchanged; patch any trailing-hyphen anchor links.

Validate at each gate; only merge once Gates 0–5 are green.
