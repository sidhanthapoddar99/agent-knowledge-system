---
title: "Hosting: the docs served under /docs"
status: open
---

agentks's own docs are an ordinary agentks project, built with `agentks build` and served under the `/docs` path of the website. Serving under a path prefix is exactly where links break: every internal link, asset, library element and island must stay inside `/docs`. This leaf makes the docs build correct under the prefix and proves it, and adds the files AI readers use (raw markdown and `llms.txt`).

# 01 To Do
- [ ] **Build under the base.** `agentks build --base /docs --site-url https://agentks.neuralabs.org --out <dir>` in `docs/`. Serve the output under `/docs/` with a static server locally.
- [ ] **Prove the prefix holds.** A check walks every HTML page in the output and fails on any internal `href`, `src`, `srcset`, CSS `url()` or island data URL that does not start with `/docs/` (or is external). Library elements under `/_lib/` must be written as `/docs/_lib/…`.
- [ ] **Link check** on the built output: every internal link resolves to a file in the output.
- [ ] **For AI readers.** Each page's raw markdown beside it (`/docs/<path>/index.md`) and `/docs/llms.txt` listing every page with its title and description ([150/60](../150_publishing/60_seo-sitemap-feeds.md)).
- [ ] **The docs navbar** links to `/` (the homepage) and to GitHub ([190/40](../190_homepage/40_shared-look-with-docs.md)).
- [ ] **404 page** for the docs, with the docs' navigation, served by nginx for missing `/docs/…` paths.
- [ ] **Sitemap** at `/docs/sitemap.xml`, referenced by the root sitemap index ([190/50](../190_homepage/50_seo-and-metadata.md)).

## Guardrails
- No special case for agentks's own docs in the engine. If the prefix needs a fix, it is fixed for every user in [150](../150_publishing/00_overview.md) or [020/30](../020_content-contract/30_links-and-urls.md).
- Only the latest docs are published; no versioned paths.

## Done when
- The prefix check and the link check pass on the full docs build.
- In the running website image, every page under `/docs/` loads with no failed request in the browser's network log (checked by a Playwright crawl).
- `https://agentks.neuralabs.org/docs/llms.txt` lists every page.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `docs/`.
- **Read first:**
  - [Deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md), sections 01, 05 and 06.
  - [Publishing](../../notes/05_delivery/02_publishing-ssg.md) — the `--base` flag and the output layout.
  - [Library system](../../notes/04_ecosystem/01_library-system.md) — its open item on `/_lib/` under a path prefix.
  - [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md), its [path-prefix group](../../../2026-08-04-absolute-link-resolution/subtasks/200_path-prefix/00_overview.md) — the prefix problem as found in 0.x.
- **Depends on:** [150/10 agentks build](../150_publishing/10_agentks-build.md), [020/30 links and URLs](../020_content-contract/30_links-and-urls.md), [120/50 lib route and sandbox](../120_libraries/50_lib-route-and-sandbox.md), [180/00 documentation](../180_documentation/00_overview.md).
- **Unblocks:** [195/20 build and deploy pipeline](./20_build-and-deploy-pipeline.md) (the docs stage), [070/50 docs command](../070_cli/50_docs-command.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the docs are served at `/docs`, built with the Rust engine; only the latest docs are published ([deployment and hosting](../../notes/05_delivery/06_deployment-and-hosting.md)).
- Decided (claude, 2026-09-30): the prefix is proved by a check over every URL in the output, not by spot checks, because 2026-08-04 showed link bugs hide in the environments nobody clicked through.

# 05 Notes & Analysis

## Watch out
- A root-absolute URL written without the base (`/_lib/…`, `/content-assets/…`) works locally at `/` and breaks only under `/docs`. Always test the build under the prefix, never at the root.
