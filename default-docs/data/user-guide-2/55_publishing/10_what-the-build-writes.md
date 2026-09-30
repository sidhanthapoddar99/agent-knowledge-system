---
title: "What the build writes"
---

`agentks build` writes a folder you can serve as it is: one HTML page per page of your project, the files those pages use, and a few extra files for search engines. This page walks through the folder, so you know what to upload.

## The output folder

The folder looks like this:

```text
dist/
├── …                      one HTML page per page of your project
├── _lib/                  library elements your artifact pages use
├── artifacts/             artifact pages
├── sitemap.xml
├── robots.txt
└── 404.html
```

Beside these, the folder holds the theme CSS, the scripts of the interactive parts, the images and files your pages use, and the search index.

| Rule | What it means for you |
|---|---|
| Addresses match the local app | A page's path is the same as in the local app, with your hosting prefix in front if you set one |
| Only the library elements your pages use are copied | A large library adds only the few files you use |
| Artifact pages keep their own route under `artifacts/` | They run in their frames exactly as in the local app |

## For search engines

- **Head metadata.** Every page has its title and description in its HTML head, taken from its frontmatter and `config/site.yaml`, plus Open Graph tags for link previews.
- **Canonical addresses.** With `--site-url`, every page names its full public address.
- **`sitemap.xml`** lists every published page. It needs `--site-url`.
- **`robots.txt`** allows everything and points at the sitemap.
- **`404.html`** is a full page with your site's navigation. Configure your host to send it for missing pages.

## Search

A published site has no server, so search runs in the reader's browser. The build writes a search index of your pages. A page downloads the index only when a reader opens search, so pages stay light for everyone else. Search on a published site looks for words and phrases; searching with regular expressions works only in the local app.

## Blog feeds

Each blog section gets a feed that readers can subscribe to, linked from the blog's pages.

## Diagrams

Wherever a diagram can be drawn without a browser, the build draws it into the page as an image made of text and shapes (SVG). It then shows without JavaScript, and search engines can read its text. A diagram format that cannot be drawn in advance ships as a small interactive part of the page instead, and readers with JavaScript turned off see its source.

## What is never in the folder

- The dev toolbar and the editor.
- Draft pages and anything marked `publish: false` ([Leaving content out](./20_leaving-content-out.md)).
- Your `config/` folder, your `.env` file and your access keys.
- Any page content as JSON for a browser to fetch. Every page is complete HTML.
