---
title: "URL registry — every file and asset"
state: open
---

Build the single source of truth for addressable things. The pipeline and graph both read from this.

## Scope

- **Included:** every `.md` file (docs / blog / issues / custom), every asset (images, excalidraw, code files, YAML data) under any registered content path.
- **Excluded:** `settings.json` files — these are internal metadata (folder settings, issue metadata, tracker vocabulary), not addressable content.
- **Excluded:** `.env`, root `site.yaml` / `navbar.yaml` / `footer.yaml` — these are system configuration, not content.

## Registry shape

Entry per registered file:

```
{
  sourcePath: string        // absolute filesystem path
  url: string               // canonical URL (e.g. /user-guide/getting-started/overview)
  kind: 'page' | 'asset'
  mimeType: string          // text/markdown, image/png, application/json, ...
  contentType: 'docs' | 'blog' | 'issues' | 'custom' | 'asset'
  title?: string            // for pages, from frontmatter
  aliases?: string[]        // filename, slug, title — all the things wiki-resolve should match
}
```

Lookup paths — bidirectional:

- `sourcePath → entry`
- `url → entry`
- `alias → entry[]` (many-to-one is fine; ambiguity is a wiki-resolve concern, not a registry concern)

## URL shape per kind

- **Docs**: `/<base>/<slug>` — current docs URL shape, `XX_` prefixes stripped.
- **Blogs**: `/<base>/<slug>`.
- **Issues**: `/<base>/<folder-slug>` for the issue itself; `/<base>/<folder-slug>/<subdoc>` for sub-docs.
- **Custom**: whatever `site.yaml pages:` declares.
- **Assets**: **content-adjacent by default** — `/<base>/<slug>/assets/<filename>`. Decision pending in the issue's open-questions.

## Tasks

- [ ] Build `src/loaders/url-registry.ts`. Walk resolved content roots at `loadSiteConfig()` time; populate entries.
- [ ] Integrate into `cache-manager` so mtime changes invalidate entries, not the whole registry.
- [ ] Extend the Astro asset route so any registered asset URL resolves to its filesystem content.
- [ ] Settings.json filter — registered file ≠ addressable; these drive the loader but aren't in the registry.
- [ ] Registry dump endpoint for debugging: `GET /api/graph/registry` (dev only).

## Verify

- Every `.md` and asset under `dynamic_data/data/` is in the registry, correctly keyed.
- No `settings.json` entry ever appears.
- Asset URLs (e.g. `/user-guide/getting-started/assets/diagram.png`) resolve and serve the file.
