---
title: "Impact: content pipeline & layouts"
---

# Impact: content pipeline & layouts

Scope: the markdown/content pipeline (`astro-doc-code/src/parsers/`, `src/custom-tags/`) and the layout layer (`src/layouts/`, `src/pages/[...slug].astro` + `src/pages/lib/layout-registry.ts`). Question: does Astro 6 / its Vite 7 bump break any of this?

**Headline:** the entire content-rendering pipeline is **framework-agnostic TypeScript** built on `marked` + `shiki` + `gray-matter` + `js-yaml` — it does **not** touch Astro content collections, `astro:content`, `astro:schema`, or `@astrojs/mdx`. The only genuinely Astro-coupled surfaces are (1) `import.meta.glob` for layout discovery, and (2) the `.astro` layout components themselves. Both are low-to-medium risk under v6.

---

## How rendering actually works (so we know what is NOT at risk)

The parser is hand-rolled, not Astro's. `src/parsers/core/base-parser.ts:8-9,24` imports `gray-matter` and `js-yaml` for frontmatter/data and `createMarkdownRendererAsync` from `../renderers/marked`. That renderer (`src/parsers/renderers/marked.ts:7-8`) instantiates `new Marked(...)` from `marked` and `createHighlighter(...)` from `shiki` directly:

- Frontmatter: `matter(raw)` (`base-parser.ts:115`) — pure `gray-matter`, no `astro:content` schema.
- Markdown → HTML: `marked` with a custom renderer for code blocks, task lists, and diagram fences (`marked.ts:67-104`).
- Syntax highlighting: a single lazily-created `shiki` highlighter (`marked.ts:40-56`), themes `github-light` / `github-dark`.
- Heading IDs: project's own postprocessor `src/parsers/postprocessors/heading-ids.ts`, with its own `slugify()`.
- Custom tags (callout / tabs / collapsible): `src/custom-tags/` registered into `TagTransformerRegistry` — plain string/AST transforms, no Astro APIs.

None of these resolve through Astro's build. They run as ordinary Node/TS modules invoked by the loaders. So the Astro-6 breaking changes around **content collections** (`src/content/config.ts` rename, `entry.slug`→`entry.id`, `entry.render()`→`render(entry)`, legacy API removal), **`astro:schema`→`astro/zod`**, **Zod v4**, and **Shiki 4.0 bundled-with-Astro** do **not** apply — this code never imports those. The project pins its **own** `shiki@^3.22.0` (`package.json:35`), independent of whatever Shiki version Astro 6 bundles internally.

---

## The `@astrojs/mdx` question

- `@astrojs/mdx@^4.3.13` is a dependency (`package.json:13`) and **is** wired in `astro.config.mjs:3,98-99` (`integrations: [ mdx() ]`).
- **But:** there are **no `.mdx` content files** under `default-docs/` (verified: `find … -name '*.mdx'` → empty), and even if one existed, `base-parser.ts:96-99,116,255-257` routes `.mdx` through the **same `marked` path as `.md`** — it does not invoke Astro's MDX compiler. So MDX rendering for *content* is effectively unused.
- The integration still gets instantiated at config load. Per research digest, `@astrojs/mdx` must co-bump to `@astrojs/mdx@6.0.3` (requires `astro ^6.4.0`) when Astro goes to 6.4.5. This is a build-time integration bump, not a content-pipeline change.
- **Action:** bump `@astrojs/mdx` to the v6 line alongside Astro. Optionally consider *removing* the integration entirely since no `.mdx` content depends on it — but treat removal as a separate decision, not part of the mechanical upgrade. ⚠️ Unverified whether `mdx()` has any side effect the project relies on (e.g. registering the `.mdx` extension for Astro's own page routing) — confirm before removing.

---

## `import.meta.glob` — the main Astro/Vite-coupled surface

Layout discovery is entirely glob-driven. `src/pages/lib/layout-registry.ts:28-65` builds a `GLOBS` table where every `(type, variant)` pair has a `builtin` + `ext` pair of `import.meta.glob(...)` calls over literal patterns like `'/src/layouts/docs/*/Layout.astro'` and `'@ext-layouts/docs/*/Layout.astro'`. The same pattern appears in `src/pages/api/dev/layouts.ts:11-24` (dev-only layout listing). `src/pages/[...slug].astro` resolves the chosen layout through this registry at render time.

- The code already respects Vite's constraint that glob args be **literal strings** (noted in the file header, `layout-registry.ts:5-7`) — this constraint is unchanged in Vite 7, so no rewrite needed.
- `import.meta.glob` is a **Vite** primitive (Astro re-exports it). Astro 6 ships Vite 7.3.2 (was Vite 6.4.x). The glob *API shape* (eager/lazy, key=path, value=loader) is stable across Vite 6→7 per the research digest (no glob breaking change listed).
- The `@ext-layouts` alias inside glob patterns relies on Vite alias resolution at glob-expansion time — that resolution path is unchanged. ⚠️ Unverified — confirm `@ext-layouts/*` globs still expand correctly under Vite 7 by checking layout discovery in a dev run (e.g. `availableStyles('docs')` returns the expected set).

**Note — `Astro.glob()` is removed in v6, but this project never uses it.** Grep confirms zero `Astro.glob(` occurrences; everything is already `import.meta.glob`. So this v6 removal is a no-op for us.

---

## `.astro` component APIs

The layouts under `src/layouts/**` and the route file `src/pages/[...slug].astro` are `.astro` components. These are compiled by Astro and are therefore the second Astro-coupled surface. Relevant v6 facts and whether they bite:

- **`<ViewTransitions />` → `<ClientRouter />`**: grep finds **no** `ViewTransitions` or `ClientRouter` usage in `src/` — not affected.
- **`getImage()` client-side throw / image crop & no-upscale defaults**: grep finds **no** `getImage` usage — not affected. (Image handling here is the custom asset-embed preprocessor + `src/pages/assets/[...path].ts`, not Astro's image service.)
- **`getStaticPaths()` numeric-param rejection**: used in `src/pages/[...slug].astro:26` and `src/pages/assets/[...path].ts:65` (via `src/pages/lib/static-paths.ts`). Params here are slug/path **strings**, not numbers — should be safe, but ⚠️ confirm no route param is emitted as a number after upgrade.
- **Script/style render-order reversal fix (v6)**: layouts emit `<style>`/`<script>` tags; v6 renders them in source order (v5 reversed). If any layout depended on the old order for CSS cascade or script init, output could shift. ⚠️ Unverified — visually regression-test layout chrome after upgrade.
- **Markdown heading-ID trailing-hyphen change (v6)**: this is Astro's *own* markdown processor behavior. **Our heading IDs come from `heading-ids.ts:24`** (`.replace(/^-+|-+$/g, '')` strips trailing hyphens), not Astro — so the v6 anchor change does not affect our generated IDs. Our slugs stay stable.

---

## Custom tags, preprocessors, transformers, postprocessors

All of `src/custom-tags/` (callout, tabs, collapsible) and `src/parsers/{preprocessors,transformers,postprocessors}/` are plain TS string/regex/AST transforms with no Astro or Vite imports. **Framework-agnostic — zero upgrade risk** beyond the Node 22.12+ runtime floor (which affects the whole repo, not this code specifically).

---

## Summary table

| Surface | Astro-coupled? | Risk | Action |
|---|---|---|---|
| `marked` + `shiki` renderer (`renderers/marked.ts`) | No (own deps) | None | None. Project's own `shiki@^3.22.0` is independent of Astro's bundled Shiki 4. |
| Frontmatter / data (`gray-matter`, `js-yaml`) | No | None | None — not `astro:content`. |
| `heading-ids` + other postprocessors | No | None | None. v6 trailing-hyphen anchor change does not apply (own slugify). |
| Custom tags (callout/tabs/collapsible) | No | None | None. |
| preprocessors / transformers | No | None | None. |
| `import.meta.glob` layout discovery (`layout-registry.ts`, `api/dev/layouts.ts`) | Yes (Vite) | Low | Already uses literal patterns. Smoke-test `@ext-layouts/*` glob expansion under Vite 7. |
| `.astro` layout components (`src/layouts/**`) | Yes | Low–Med | Visual regression test: `<style>`/`<script>` source-order change (v6). No `ViewTransitions`/`getImage` to migrate. |
| `[...slug].astro` `getStaticPaths()` | Yes | Low | Confirm route params stay strings (no numeric params). |
| `@astrojs/mdx` integration (`astro.config.mjs`) | Yes | Low | Co-bump to `@astrojs/mdx@6.0.3` (needs `astro ^6.4.0`). No `.mdx` content uses it; consider removal as a separate decision. ⚠️ confirm no routing side-effect first. |

---

## Bottom line

The content pipeline is insulated from the Astro 6 content-collections/Zod/`astro:schema`/Shiki upheaval because it never uses any of it — it's a self-contained `marked`/`shiki` stack. The only real work for this surface is: (1) co-bump `@astrojs/mdx`, (2) re-validate `import.meta.glob` layout discovery under Vite 7, and (3) eyeball layout `<style>`/`<script>` ordering. See the sibling Vite/SSR note for the dev-server module-invalidation story, which is where the genuinely hard v6 questions live.
