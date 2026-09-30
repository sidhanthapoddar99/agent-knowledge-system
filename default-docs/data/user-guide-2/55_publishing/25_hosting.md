---
title: "Hosting"
---

The build writes plain files, so anything that serves files can host your site: a static hosting service, a CDN, GitHub Pages, or nginx in a container. This page lists what every host must do, then walks through the common choices.

## What any host needs

| The host must | Why |
|---|---|
| Send `404.html` for an address that does not exist | It is a full page with your site's navigation |
| Serve HTTPS | agentks writes files; encryption is the host's or the CDN's job |

So that a new publish shows at once, send `Cache-Control: no-cache` for every `.html` file. Browsers then check for a new version on each visit.

Library elements run in a sandbox in the local app. Keep them sandboxed on your host too: send `Content-Security-Policy: sandbox allow-scripts` for `.html` and `.svg` files under `_lib/`. The nginx configuration in [Docker](./30_docker.md) does all of the above.

## A static host or a CDN

1. Build: `agentks build --site-url https://docs.example.com`.
2. Upload the **contents** of `dist/` to the host's web root, or to the folder that matches your base path ([Serving under a path](./15_serving-under-a-path.md)).
3. Set the 404 page to `404.html`, and the cache header above if the host lets you.

The host builds nothing and needs no agentks: you build on your machine or in CI, and upload the result. Nothing on the site is computed per request, so a CDN can cache all of it.

## GitHub Pages

GitHub Pages serves a folder of static files, so the build output works as it is.

| Site | Address | Build with |
|---|---|---|
| A project site | `https://<owner>.github.io/<repository>/` | `--base /<repository> --site-url https://<owner>.github.io` |
| A user or organisation site | `https://<owner>.github.io/` | `--site-url https://<owner>.github.io` |

Build the site in a GitHub Actions job ([Building the site](./05_building-the-site.md#build-in-ci)), then publish the output folder with GitHub's own Pages deployment. With a custom domain, use that domain in `--site-url` and drop `--base` if the site sits at the domain's root.

## nginx, in a container or on a server

Point nginx's web root at the output folder, and apply the rules above. Your project ships a Dockerfile and an nginx configuration that do exactly this; they are described in [Docker](./30_docker.md). On a server without Docker, copy the build into the web root and use the same nginx configuration.

## Before you go live

- **Serve the folder locally** under the same path the host will use, and click through it ([Serving under a path](./15_serving-under-a-path.md#check-it-before-you-upload)).
- **Set `--site-url`**, or the build writes no sitemap and no canonical addresses.
- **Build again for every change.** A published site does not follow your files the way the local app does. Because the HTML is checked again on every visit, readers see a new upload at once.
