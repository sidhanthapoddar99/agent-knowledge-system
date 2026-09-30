---
title: "What the output holds"
description: "The files agentks build writes, the URLs they serve at, and what a static host must do to serve them correctly."
---

This page describes the folder `agentks build` writes: which files it holds, which URL each one serves at, and what the web server in front of it must do. The output is plain files. Nothing in it is computed per request, and no agentks process runs beside it.

## The shape

```
dist/
  …                           one HTML file per page, at the page's URL
  artifacts/…                 artifact pages, at the same URLs as in the local tool
  _lib/<alias>/<element>      the library elements that pages and artifacts use
  sitemap.xml
  robots.txt
  404.html
```

Beside these, the output holds the compiled theme CSS, the island bundles, each page's colocated assets and the Pagefind search index.

## The rules the output keeps

| Rule | Why |
|---|---|
| URLs are the same as in the local tool | The client's router uses real URL paths, so a link someone copied from the local tool also works on the published site |
| Every href is root-absolute and carries the hosting prefix | Rust resolves each link to its target and writes the href once, with `--base` or `site.yaml`'s `base_path`. A relative href would break under a prefix |
| Pages are complete HTML | The head carries the title, description, canonical URL and Open Graph tags. Search engines and readers without JavaScript get the whole page |
| JavaScript only for islands | A page with no interactive part has no script tag |
| Only used library elements | The build copies each element a page or artifact uses, at the same `/_lib/` path. The published site needs no library at run time |
| No drafts, no dev-only content | Anything marked for the local tool only stays out of the build |

## What each part is for

| Part | Serves |
|---|---|
| Page HTML | Every docs page, blog post, tracker page, custom page and diagram page |
| `artifacts/` | Artifact pages, loaded in their frames and opened full page, as in the local tool |
| `_lib/` | Library images and HTML widgets that artifacts load by URL |
| Theme CSS | The one compiled stylesheet of the project's theme |
| Island bundles | The code of the interactive parts, loaded on demand |
| Search index | Pagefind's index, which the search island reads |
| `sitemap.xml`, `robots.txt` | Search engines. The sitemap uses the public address given by `--site-url` |
| `404.html` | The page a static host shows for an unknown URL |

## What the host must do

Any static host can serve the folder: nginx, a static hosting service or a CDN. It only has to do two things beyond serving files.

1. **Serve the folder under its prefix.** A site built with `--base /docs` must be served at `/docs`, because every href already starts with it.
2. **Send the library headers on `/_lib/`.** On the local tool, the engine sends `ElementFile::headers()` with every element: the content type, `X-Content-Type-Options: nosniff`, and `Content-Security-Policy: sandbox allow-scripts` for HTML and SVG. On a published site there is no engine, so the web server must send the same headers. Without the sandbox header, a library's HTML would run with the site's own origin. The [libraries section](../35_libraries/01_overview.md) explains why that matters.

## Docker

agentks publishes no Docker image. A basic Dockerfile ships with agentks's own docs and with the default template, and the user owns it and changes it freely. `agentks build` works the same inside a container as outside one. The user guide's [publishing section](../../user-guide-2/55_publishing/01_overview.md) shows how to use it.

## Related

- [The build pipeline](./05_build-pipeline.md): the steps that write this folder.
- [The static renderer](./10_static-renderer.md): how the page HTML and islands are produced.
