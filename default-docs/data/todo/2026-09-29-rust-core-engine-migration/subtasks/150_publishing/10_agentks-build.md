---
title: "agentks build: the command and its pipeline"
status: open
---

`agentks build` turns a project into a static site in one command. This leaf builds the Rust side: the command and its flags, the eight-step pipeline (check, libraries, data, render, diagrams, assets, extras, write), the output layout with hashed asset names, and the atomic replacement of the output folder. The renderer itself is [150/20](./20_ssg-renderer.md); diagrams, search, dev-only content and SEO extras are separate leaves that plug into steps 5 and 7.

# 01 To Do
- [ ] **Command.** `agentks build [--out DIR] [--base PATH] [--site-url URL] [--json]`.
    - [ ] `--out` default `dist/` beside `config/`.
    - [ ] `--base` default from `site.yaml` (a `publish.base` key, proposed; else `/`). Settle the flag name as `--base` and update the Rust CLI note's `--base-path`.
    - [ ] `--site-url` default from `site.yaml`; without one, skip the sitemap and warn.
    - [ ] `--json`: one summary on stdout (pages, bytes, warnings, seconds).
    - [ ] Exit 0 success, 1 build failure, 2 wrong usage.
- [ ] **Pipeline.**
    1. **Check**: `config/` exists; the version gate passes; `dep.lock` exists and matches `dep.yaml` (else name `agentks install`).
    2. **Libraries**: install exactly the locked commits ([120/20](../120_libraries/20_fetch-and-resolve.md) with a "locked only" mode).
    3. **Data**: build the site index and compute every page's data through the same code the WebSocket uses ([030/80 page data interface](../030_rust-engine/80_page-data-interface.md)), with dev-only content left out ([150/50](./50_dev-only-content.md)).
    4. **Render**: start the static renderer and stream page data to it ([150/20](./20_ssg-renderer.md)).
    5. **Diagrams**: pre-render diagrams ([150/30](./30_diagrams-to-svg.md)).
    6. **Assets**: copy page assets to `_content/`, the theme CSS and island bundles to `_assets/`, library elements pages actually use to `_lib/<alias>/<element>`, artifacts to `artifacts/`; content-hash every name under `_assets/`, `_content/`, `_lib/` and rewrite references.
    7. **Extras**: `sitemap.xml`, `robots.txt`, `404.html`, raw markdown per page, `llms.txt`, RSS ([150/60](./60_seo-sitemap-feeds.md)); the search index ([150/40](./40_static-search.md)).
    8. **Write**: build into a temporary folder beside `--out` and rename it into place, so a failed build never leaves half a site.
- [ ] **Output layout** as in [the publishing note, section 04](../../notes/05_delivery/02_publishing-ssg.md): every page `<path>/index.html` plus `index.md`; `_assets/`, `_content/`, `_lib/`, `artifacts/`, `sitemap.xml`, `robots.txt`, `llms.txt`, `404.html`.
- [ ] **Base prefix everywhere**: hrefs, asset URLs, sitemap entries, RSS links, artifact `/_lib/` URLs (per [120/50](../120_libraries/50_lib-route-and-sandbox.md)).
- [ ] **Failure policy**: any engine error (broken link, unknown element, missing embed, failed diagram) fails the build with file and line; warnings are listed in the summary.
- [ ] **Offline**: once libraries are cached, the build needs no network.
- [ ] **`init` adds `dist/` to `.gitignore`** (coordinate with [120/85](../120_libraries/85_templates.md)).
- [ ] **Tests.** Build this repository's migrated docs and the demo tracker fixture; assert the output layout, that every internal href resolves to a file in `dist/`, that `--base /docs` prefixes everything, that a planted broken link fails the build, and that a failed build leaves the previous `dist/` untouched.

## Guardrails
- The build never resolves `dep.yaml` afresh.
- Data comes only through the page-data interface; the build does not reach into loaders directly.
- No page ships its content as JSON for a browser to fetch.

## Done when
- `agentks build --base /docs` on the migrated agentks docs produces a folder that `python3 -m http.server` (after placing it under `docs/`) serves with every link working (checked by a crawler in the test).
- Build time and output size are recorded in the result for this repository's docs.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the build module and CLI in `apps/agentks-engine/`.

**Read first**
- [Publishing](../../notes/05_delivery/02_publishing-ssg.md), sections 01, 03, 04, 08, 11.
- [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md) — root-absolute hrefs and the hosting path prefix.
- [The Docker design from the Go issue](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) — `base_url` and a static build behind nginx.

**Depends on:** [150/20 SSG renderer](./20_ssg-renderer.md), [030/80 page data](../030_rust-engine/80_page-data-interface.md), [020/30 links and URLs](../020_content-contract/30_links-and-urls.md), [120/20](../120_libraries/20_fetch-and-resolve.md).
**Unblocks:** [150/30](./30_diagrams-to-svg.md), [150/40](./40_static-search.md), [150/50](./50_dev-only-content.md), [150/60](./60_seo-sitemap-feeds.md), [150/70](./70_dockerfile.md), [195/00 hosting](../195_hosting/00_overview.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): a publishing build downloads the project's libraries again, like npm installs dependencies for a build ([publishing](../../notes/05_delivery/02_publishing-ssg.md)).
- Proposed (claude, 2026-09-30): the command shape, output layout and strict install from the lock (same note). Build as proposed.
- Decided (claude, 2026-09-30): the flag is `--base`, matching the publishing note; the Rust CLI note's `--base-path` is corrected when this lands.

# 05 Notes & Analysis
## Watch out
- Trailing slashes: `<path>/index.html` fixes the 0.x trailing-slash bug on static hosts; make sure generated hrefs end with `/` so hosts do not redirect.
- Hashing and rewriting references must also cover CSS `url()` inside the theme CSS.
