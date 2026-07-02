---
title: "Global URL prefix"
status: open
---

Allow all routes to be served under a configurable base path so the docs can be deployed alongside another app (e.g. `app.com/docs/...` instead of `app.com/...`).

## Tasks

- [ ] Add `site.base_url` (or similar) to `site.yaml`
- [ ] Prepend it to every generated route in `pages/[...slug].astro`
- [ ] Apply to navbar / sidebar / footer link generation
- [ ] Honour it in canonical / `og:url` meta tags
- [ ] Document the option in the deployment guides (Vercel / Netlify / GH Pages / Cloudflare / nginx subpath)
