---
title: "Links and URLs — one resolver, root-absolute hrefs, and the hosting path prefix"
status: in-progress
---

Every internal link in today's engine is emitted as a browser-relative href, and that is the defect: a relative href is a claim about where the reader is standing, which the renderer cannot know. Two constant-shift fixes were tried and reverted in [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md). The fix, decided there and carried into the migration, is to stop guessing: resolve each relative link to the **file** it names, look that file's URL up in one map, and emit a **root-absolute** href. The same map then owns the hosting path prefix. This leaf builds the resolver in Rust and takes over all of that issue's remaining work.

# 01 To Do
- [ ] **The map is the site index.** The file-to-URL map is not a separate structure: it is the index's path→entry and URL→entry lookups ([030/40](../030_rust-engine/40_site-index.md)). One producer computes each URL, once. The request router, the route enumeration for `agentks build`, and the link resolver all read it. (Absorbs [100/010](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/010_thread-base-url-and-build-the-map.md) and [100/100 unify the route resolvers](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/100_unify-the-route-resolvers.md).)
- [ ] **The resolver**, one function in `agentks-index`, called by the render pipeline for every content type:
    ```
    resolve(href_as_authored, containing_file) -> Resolved { url, fragment } | External | Miss { file, line, reason }
    ```
    1. Split off `#fragment` and `?query`.
    2. A scheme (`https:`, `mailto:`, anything with `:` before the first `/`) → `External`, unchanged.
    3. A leading `/` → not an internal reference: render unchanged and report a link-form error (as `check link-form` does).
    4. Percent-decode, then join with the **containing file's directory**, normalise `.` and `..`. A result outside the project root → `Miss` ("escapes the project").
    5. Look the file up in the index:
        - a page (markdown, video, diagram, artifact) → its URL;
        - a non-page file inside a content section (`assets/` and the like) → `/content-assets/<path>`;
        - a folder → its section's rule as today (the folder's index page if one exists), otherwise `Miss`;
        - nothing → `Miss` with file and line.
    6. Keep the fragment. Check it against the target's outline and report an unknown anchor as a content warning (today's 4 broken anchors are this class).
- [ ] **Every content type through it** (absorbs [100/050](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/050_unify-tracker-and-blog.md)):
    - [ ] docs: today's prefix-stripping and `/index` collapsing now come from the index, not from string edits;
    - [ ] blog: sibling-post links resolve to the post URL, **with the date prefix stripped**, as routing already does;
    - [ ] tracker: every body — `issue.md`, subtasks, notes, brainstorm, comments, plan stages, agent-log files, memory — resolves from its own file. No special re-rooting for `issue.md`; today's `issue-body-links.ts` has no equivalent.
- [ ] **A body shown at another URL keeps its links** (absorbs [100/030 the Comprehensive panel](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md), [100/080](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/080_embedded-body-links-lose-the-issue-slug.md) and [100/090](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/090_live-check-the-plans-page.md)): because links are resolved per source file at render time, a subtask body stacked in the Comprehensive panel, or a stage body on the plans page, carries the same absolute hrefs as on its own page. Test both by rendering the display page and comparing hrefs with the source page's.
- [ ] **`base_url` and folder names are independent** (absorbs [100/040](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/040_base-url-and-folder-name-are-not-tied.md)): resolution walks files on disk and asks the index for the URL, so renaming a section's `base_url` away from its folder name breaks nothing. Prove it with the spec fixture from [10](./10_golden-fixtures.md).
- [ ] **Embedded markdown resolves against the embedded file.** A link inside text inlined by `[[path]]` is relative to the file that contains it, which is the embedded file ([40](./40_embeds-and-dependencies.md) records each embed's source span so the resolver can tell).
- [ ] **The hosting path prefix** (absorbs group [200_path-prefix](../../../2026-08-04-absolute-link-resolution/subtasks/200_path-prefix/00_overview.md)):
    - [ ] One `base_path` value, from `site.yaml` or `agentks build --base` ([20](./20_config-folder.md)), normalised (leading `/`, no trailing `/`, empty = `/`), refused when malformed.
    - [ ] Applied **once**, in the function that turns an index URL into an href. Never at call sites.
    - [ ] It must reach every surface the engine emits: in-body links; sidebar, pagination, breadcrumbs, the issues index and filters (all sent as data by Rust, so they come from the same function); `/content-assets/` and `/assets/` URLs; `/artifacts/<path>` and each embed iframe's `src`; `/_lib/<alias>/<element>` inside artifacts ([150/00 publishing](../150_publishing/00_overview.md) rewrites or bases them); canonical, meta and OpenGraph URLs; redirects; the client's route table for client-side navigation.
    - [ ] The local server always serves at `/`. Parity between local and prefixed output holds because both come from the same function with a different `base_path`; the prefixed case is tested by building with `--base /docs` and serving the output under `/docs` with a plain static server.
- [ ] **Reserved prefixes:** no content URL may fall under `/api`, `/artifacts`, `/content-assets`, `/assets`, `/_lib` or the client's asset prefix. The index refuses such a page with a content error naming both files.
- [ ] **Strictness:** a `Miss` renders the link text with a broken-link marker and records a content error; it never points at a guessed page. The count is visible in `agentks check` and the dev toolbar.
- [ ] **Link checks after the switch** (absorbs [100/060](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/060_retire-the-plugin-rendering-gate.md) and [100/070](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/070_recheck-rendered-links.md)): `agentks check link-form` is the file-level check (it stays in the binary). The rendered-link crawl is a state-1 check in the new repository's `ctl e2e` ([170/20](../170_testing/20_route-and-content-parity.md)), run against the local server **and** a static host serving `agentks build` output, with and without a prefix. The success condition is that all runs report the same result, and it is zero path failures.
- [ ] **The route set is guarded** (absorbs group [300_the-route-set](../../../2026-08-04-absolute-link-resolution/subtasks/300_the-route-set/00_overview.md)): the index enumerates every URL, the server answers from the same index, and `agentks build` writes from it, so the set cannot differ between them. The check compares the build's written files with the index's route list and fails on any extra or missing path. Today's `src/pages/lib/` leak has no equivalent in a Rust router, so [300/010](../../../2026-08-04-absolute-link-resolution/subtasks/300_the-route-set/010_stop-emitting-src-pages-lib-as-routes.md) closes with the migration.

## Guardrails
- **Content is never changed to suit the renderer.** Links in markdown stay relative. The 334 slug-form links (a published slug written instead of a file path) stay a content question for `check link-form`; the resolver reports them as misses.
- **No arithmetic from link text to URL.** Always file first, then the index. A second copy of the slug rules is how this broke before.
- **Output parity:** link *targets* match today's for every link that works today; links that are broken today because of the relative-href defect now work, and each such change is listed in the fixture's expected differences.

## Done when
- Every spec fixture's links render to the expected root-absolute hrefs, and every `Miss` carries the right file and line.
- On the corpus, every link target equals the golden snapshot's resolved target, apart from listed expected differences ([10](./10_golden-fixtures.md)).
- A subtask body's hrefs are byte-identical on its own page, in the Comprehensive panel and (for a stage) on the plans page.
- Renaming one section's `base_url` in a fixture config breaks zero links.
- `agentks build --base /docs`, served under `/docs` by a static server, passes the rendered-link crawl with zero failures, the same as the unprefixed build and the local server.

# 02 Status and Result
In progress. The index's part is built and tested: the resolver, the URL function with the hosting prefix, reserved prefixes, the route set, link-form checks and the move rewrite. What is left belongs to other crates and later stages, listed below.

## Result
- `SiteIndex::resolve(href, containing_file) -> Resolution` in `apps/agentks-engine/crates/index/src/snapshot/resolve.rs`: scheme, `#`-only and `//` links are external; a leading `/` is a `link-form` miss; the path is percent-decoded and joined with the file's folder; a climb out of the project is `path-escapes-project`; a page gives its URL with the fragment kept; any other file of a section gives `/content-assets/<path>`; a folder gives its index page (a docs `index.md`, an issue, a plan, a section root); everything else is a `link-missing` miss with a one-sentence reason. Blog posts lose their date, tracker files keep their prefixes, `issue.md` and every tracker body resolve from their own file with no re-rooting.
- `SiteIndex::href` and `href_of` apply the hosting prefix once; `with_base_path` sets it (the index builds at `/`). `artifact_url` and `content_asset_url` give the served paths.
- Reserved prefixes: a page URL under `/api`, `/client`, `/assets`, `/content-assets`, `/artifacts` or `/_lib` gets no URL and a `url-reserved` error.
- `check_link_form` and `rewrite_for_move` ported from the CLI's `links.rs`, on one shared scanner (`scan_references`) that also finds `[[path]]` embeds.
- Tests in `crates/index/src/tests/` cover every case of 2026-08-04 that the index owns: docs, blog and tracker links, fragments and queries, assets, diagram and artifact pages, folder links, link-form, misses and escapes, a renamed `base_url` breaking no link, the prefix, reserved URLs, links in embedded text resolving from the embedded file.
- Left: the render pipeline calling the resolver and marking misses (030/50, 020/40), the anchor check against the target's outline (the renderer, through `SiteIndex::target_of`), `agentks build --base` and the built-files-versus-routes check (150), the rendered-link crawl in `ctl e2e` (170/20), and the golden comparison (020/10).

## Agent log
none

# 03 References
- **Where:** crate `agentks-index` (the resolver and the URL function), called from `agentks-render`.
- **Read first:**
    - [02/01 Content format](../../notes/02_engine/01_content-format.md) sections 07 and 08.
    - The whole of [2026-08-04-absolute-link-resolution](../../../2026-08-04-absolute-link-resolution/issue.md): start at [15 where this came from](../../../2026-08-04-absolute-link-resolution/notes/15_where-this-came-from.md), then [30 the path map](../../../2026-08-04-absolute-link-resolution/notes/30_the-path-map.md), [40 the hosting path prefix](../../../2026-08-04-absolute-link-resolution/notes/40_the-hosting-path-prefix.md), [25 the pipeline trace](../../../2026-08-04-absolute-link-resolution/notes/25_the-pipeline-trace.md) and [10 the trailing-slash matrix](../../../2026-08-04-absolute-link-resolution/notes/10_the-trailing-slash-matrix.html).
    - Today's code: [internal-links.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/internal-links.ts), [issue-body-links.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/issue-body-links.ts), [asset-src.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/asset-src.ts) (already absolute), [route-match.ts](../../../../../../agent-ks-engine/src/pages/lib/route-match.ts), [static-paths.ts](../../../../../../agent-ks-engine/src/pages/lib/static-paths.ts), and the CLI's [links.rs](../../../../../../agent-ks-cli/src/links.rs).
    - [05/02 Publishing](../../notes/05_delivery/02_publishing-ssg.md) — `agentks build --base`.
- **Depends on:** [030/40 site index](../030_rust-engine/40_site-index.md), [10](./10_golden-fixtures.md), [20](./20_config-folder.md), [50](./50_ordering-settings-frontmatter.md).
- **Unblocks:** [030/50 markdown pipeline](../030_rust-engine/50_markdown-pipeline.md) (its internal-links stage), [150/00 publishing](../150_publishing/00_overview.md), [170/20](../170_testing/20_route-and-content-parity.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): files keep relative links; Rust resolves each one and outputs a root-absolute href ([02/01](../../notes/02_engine/01_content-format.md)).
- Decided (2026-06-09, carried by [2026-08-04](../../../2026-08-04-absolute-link-resolution/issue.md)): resolve at render time to absolute; build a map at scan time; one resolver for docs, blog and the tracker.
- Decided (2026-08-04): the prefix is applied once, in the single place that produces URLs.
- Decided (claude, 2026-09-30): the file-to-URL map is the site index itself, not a third structure.
- Decided (claude, 2026-09-30): links inside embedded markdown resolve against the embedded file, following the rule that a reference is relative to the file that contains it.
- Decided (claude, 2026-09-30): the local server always serves at `/`; the prefix is a build parameter.
- Decided (claude, 2026-10-01): `/content-assets/<path>` and `/artifacts/<path>` carry the project-relative path (for example `/content-assets/data/guide/assets/x.png`), not today's path below the content root, because sections may live anywhere under the project and the server can map a project path back without a second table.
- Decided (claude, 2026-10-01): every URL segment is percent-encoded outside RFC 3986 `pchar`, with upper-case hex, because that is what browsers send; a file name with a space, `#`, `%` or a non-ASCII letter still gets one stable URL. Plain ASCII names are unchanged, so today's routes are unchanged.
- Decided (claude, 2026-10-01): the query of a link is dropped and the fragment kept; a link to a plan stage file lands on the plan page at the stage's anchor unless the link names its own fragment.
- Decided (claude, 2026-10-01): a link to a file outside every content section, and a link to a tracker folder that is neither an issue nor a plan (a subtask group, a log run), is a `link-missing` miss, as it is a 404 today. No folder-index guess.
- Decided (claude, 2026-10-01): a link to a section root resolves to the canonical page, so a docs root link gives the first page, not the redirect.
- Decided (claude, 2026-10-01): the anchor check is the renderer's, because outlines come from rendered bodies; the index gives the target file through `SiteIndex::target_of`.
- Decided (claude, 2026-10-01): the source-form redirects mirror today's static paths exactly: the path with a markdown, YAML or JSON extension removed, so a diagram or artifact page's alias keeps its extension.
- Decided (claude, 2026-10-01): the move rewrite now also rewrites `[[path]]` embeds (today it skipped them and left moved embeds broken), and the scanner ignores footnote definitions (`[^1]: text`), which the old one read as links.

# 05 Notes & Analysis
## 01 What 2026-08-04 absorbed, subtask by subtask
| Its subtask | Here |
|---|---|
| 100/010 thread `base_url`, build the map | The index is the map; each entry knows its section |
| 100/020 the shared resolver | The resolver above |
| 100/030 the Comprehensive panel | Per-source resolution; tested |
| 100/040 `base_url` vs folder name | Independent by construction; tested |
| 100/050 unify tracker and blog | Every content type through the resolver |
| 100/060 retire the plugin rendering gate | Done for 0.x or moot: the new plugin never ships a rendering check |
| 100/070 re-check rendered links | The crawl in `ctl e2e`, local vs static vs prefixed |
| 100/080, 100/090 plans-page links | Per-source resolution; tested |
| 100/100 unify the route resolvers | One index answers requests, enumerations and lookups |
| 200/010 `PREFIX_PATH` | `base_path` / `--base`, applied once |
| 300/010, 300/020 the route set | Built-files-vs-index check; the Astro leak class does not exist |

## Watch out
- **A missing page must not answer `200`.** Today's dev server serves a "Page Not Found" body with status 200. The new server returns 404 for an unknown URL, so crawlers can trust the status.
- **Trailing slashes.** The index holds one canonical form per URL. The server answers the other form with a redirect to the canonical one; hrefs are always canonical. The static build writes `<path>/index.html`, which most hosts serve at both forms; the crawl checks both.
- **Plan `overview.md`** is a real file that may not be its own route today ([100/090](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/090_live-check-the-plans-page.md), row 3). Resolve it to whatever URL the golden snapshot shows the plan at; if none, it is a `Miss`, not a guess.
