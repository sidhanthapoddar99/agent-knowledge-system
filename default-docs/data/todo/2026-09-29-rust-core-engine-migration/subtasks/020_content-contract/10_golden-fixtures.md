---
title: "Golden fixtures — capture today's output so the new engine can be proved equal"
status: open
---

The new engine must produce the same routes, heading IDs, link targets and text as today's Astro engine. That can only be proved against a recorded answer. This leaf builds two kinds of fixture: small spec fixtures, one folder per rule, for unit tests; and a captured snapshot of today's engine rendering this repository's docs and tracker (about 1,300 pages), for the corpus comparison. Every other leaf in this group, and the parity checks in [170](../170_testing/00_overview.md), test against them.

# 01 To Do
- [ ] **Spec fixtures** in `apps/agentks-engine/tests/fixtures/spec/`, one small project per rule, each with an `expected.json`:
    - [ ] ordering prefixes: 2 to 5 digits, mixed widths, gaps, legacy `-` separators in the tracker, missing prefixes in docs (error);
    - [ ] folder `settings.json` and `settings.jsonc` (JSONC preferred when both exist), missing `label` (error);
    - [ ] frontmatter per kind, unknown keys (drift warning), bad YAML (content error with line);
    - [ ] every link form in the table of [02/01](../../notes/02_engine/01_content-format.md) section 07, including `#fragment`, assets, diagram and artifact targets, a leading `/` (link-form error), a missing target (content error), external schemes;
    - [ ] embeds: plain, inside a fence, `./` and `../` only in fences, a path with a space or comma left alone, `\[[...]]` literal, one level only, missing file;
    - [ ] slug collisions between `.md`, a diagram and an `.html` claiming one URL;
    - [ ] heading IDs: punctuation, tags, duplicates (`-1`, `-2`), non-ASCII text;
    - [ ] a blog with date-prefixed files and sibling-post links;
    - [ ] a tracker with every anatomy section, plans, logs, comments;
    - [ ] a config with `base_url` different from the section's folder name (the case from [2026-08-04 subtask 040](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/040_base-url-and-folder-name-are-not-tied.md)).
- [ ] **The corpus snapshot**, captured once from today's engine:
    - [ ] Pin the source: this repository at a named commit, recorded in `tests/fixtures/corpus/SOURCE.json` (`repo`, `commit`, `captured_at`, engine version). The harness clones that commit into a temporary folder; the 13 MB of content is not copied into the new repository.
    - [ ] **Routes:** every URL the Astro build emits (from `buildStaticPaths`, as [check-route-parity.mjs](../../../../../../scripts/checks/check-route-parity.mjs) does), every redirect with its target, and the probe list of URLs that must not resolve.
    - [ ] **Per page, normalised JSON** (not raw HTML): URL, title, sidebar label, heading list with IDs, every link as its **resolved absolute target** (today's hrefs are relative, so resolve each against the page's own URL before storing), every image and asset URL, the main-content text with whitespace collapsed, code blocks' language and text, table cell text.
    - [ ] **Sidebars and indexes:** each docs section's sidebar tree (labels, URLs, order), the blog index order, the issues index rows with their derived fields (status category, `created`, subtask counts; not `updated`, which depends on git history at capture time).
    - [ ] Store as one gzipped JSON-lines file per section under `tests/fixtures/corpus/`, with the capture script in `scripts/test/capture-golden.ts` (Bun), which needs today's engine running: a state-1 tool that never ships.
- [ ] **A comparison helper** in the engine's test support crate: given the new engine's page data for a URL, produce the same normalised shape and diff it against the snapshot, listing each difference by kind (route, heading ID, link target, text).
- [ ] **Record known, accepted differences** in `tests/fixtures/corpus/EXPECTED_DIFFERENCES.md`, each with its reason. Today's known defects the new engine fixes on purpose, for example the blog date prefix left in sibling-post link URLs ([2026-08-04 subtask 050](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/050_unify-tracker-and-blog.md)) and links in plan-stage and Comprehensive-panel bodies that lose the issue slug ([subtasks 030 and 080](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/080_embedded-body-links-lose-the-issue-slug.md)).

## Guardrails
- Capture from the real engine, never from a re-implementation of its rules: a fixture that agrees with a copy of the rules proves nothing.
- Store resolved targets, not href strings. Today's relative hrefs and the new engine's absolute hrefs must compare equal when they reach the same page.
- Every accepted difference is written down with a reason; an unlisted difference is a failure.

## Done when
- `cargo test -p agentks-content spec_` runs every spec fixture.
- `scripts/test/capture-golden.ts` reproduces the committed snapshot byte for byte from the pinned commit (run twice, diff empty).
- The comparison helper reports zero differences when fed the snapshot itself, and reports one difference of the right kind when a single heading ID is altered in its input.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `apps/agentks-engine/tests/fixtures/` and `scripts/test/` in `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`; capture runs against this repository with `./start` (today's engine).
- **Read first:** [02/01 Content format](../../notes/02_engine/01_content-format.md) (every rule to cover); [05/05](../../notes/05_delivery/05_development-workflow-and-testing.md) section 05 (test layers and the corpus); [check-route-parity.mjs](../../../../../../scripts/checks/check-route-parity.mjs) and [check-links.mjs](../../../../../../scripts/checks/check-links.mjs) (how today's routes and links are enumerated); today's [static-paths.ts](../../../../../../agent-ks-engine/src/pages/lib/static-paths.ts) and [route-match.ts](../../../../../../agent-ks-engine/src/pages/lib/route-match.ts); the tracker fixture [2026-07-01-demo-issue-anatomy-showcase](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md).
- **Depends on:** [010/20](../010_project-setup/20_main-repo-skeleton.md).
- **Unblocks:** every leaf in this group; [170/20 route and content parity](../170_testing/20_route-and-content-parity.md).

# 04 Decisions
- Decided (claude, delegated by sidhantha, 2026-09-29): the engine is proven by route parity and a rendered-content comparison ([05/05](../../notes/05_delivery/05_development-workflow-and-testing.md)).
- Decided (claude, 2026-09-30): the snapshot stores normalised JSON with resolved link targets, and pins the source by commit instead of copying the content.

# 05 Notes & Analysis
## Watch out
- **A missing page answers `200` today**, rendering a "Page Not Found" body ([2026-08-04 subtask 090](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/090_live-check-the-plans-page.md)). The capture must detect the not-found body, not trust the status code.
- The Comprehensive panel and the plans page assemble bodies in the browser. A server-HTML capture misses them; capture those with a headless browser or record them as known differences to check by hand.
- `updated` dates depend on git history at capture time; exclude them from the comparison.
