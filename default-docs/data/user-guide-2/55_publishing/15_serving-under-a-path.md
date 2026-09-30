---
title: "Serving under a path"
---

To serve your site under a path, such as `https://example.com/docs/` instead of at the root of a domain, build it with a **base path**. agentks then puts that prefix in front of every address the site uses. Your markdown does not change.

## Set the base path

Pass it to the build:

```bash
agentks build --base /docs --site-url https://example.com
```

Or set it once in `config/site.yaml`, so every build uses it:

```yaml
base_path: "/docs"
```

The flag wins over `site.yaml`. With neither, the base path is `/` and the site is served at the root.

agentks tidies the slashes for you: `docs`, `/docs` and `/docs/` all mean `/docs`. A base path may hold several parts, such as `/projects/docs`, but no `.` or `..` parts.

## What gets the prefix

| Address | Without a base path | With `--base /docs` |
|---|---|---|
| A page | `/guide/getting-started/` | `/docs/guide/getting-started/` |
| A library element | `/_lib/…` | `/docs/_lib/…` |
| An entry in `sitemap.xml` | `https://example.com/guide/getting-started/` | `https://example.com/docs/guide/getting-started/` |

Every link, image, script, stylesheet, feed link and sitemap entry stays inside the base path, so the site works next to other content on the same domain.

## Your content stays the same

Links in your markdown stay relative to the file, as they always are, for example `[install](../05_getting-started/02_install.md)`. agentks works out each target's address and adds the prefix while it builds. Never write the prefix into a page: a link that starts with `/` is an error in agentks content.

The local app always serves at `/`, whatever the base path. The prefix applies only to what `agentks build` writes.

## Put the files in the right place

The contents of the output folder must end up **inside** the path on the server. For `--base /docs`, the site's home page must be served at `https://example.com/docs/`.

```text
web root/
├── …                   your other site, or nothing
└── docs/               the contents of dist/
```

For example, copy the build into the web root's `docs/` folder:

```bash
agentks build --base /docs --out /tmp/site
cp -r /tmp/site/. /var/www/html/docs/
```

On GitHub Pages, a project site is served at `https://<owner>.github.io/<repository>/`, so its base path is `/<repository>` ([Hosting](./25_hosting.md#github-pages)).

## Check it before you upload

After `agentks build --base /docs`, serve the `dist/` folder from a local web server under the same path, and click through a few pages:

```bash
mkdir -p /tmp/preview/docs
cp -r dist/. /tmp/preview/docs/
cd /tmp/preview && python3 -m http.server 8080
```

Then open `http://localhost:8080/docs/`. If a page loads without its styles, or a link leads to a missing page, the base path given to the build does not match the path the files are served under.
