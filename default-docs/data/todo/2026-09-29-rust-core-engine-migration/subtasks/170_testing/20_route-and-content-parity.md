---
title: "Route and content parity — the new engine against today's"
status: open
---

The new engine replaces today's Astro engine, and the decision is strict: routes, heading IDs, links and text must match exactly; only small visual improvements may differ. This leaf builds the comparison that proves it. It runs both engines on the same pinned corpus, compares every route, the rendered main content of every page and a screenshot of every layout, and reports each difference. A green run of this comparison is the acceptance test of Phase 1. In Phase 3 the same harness compares the local client against the static build.

# 01 To Do
- [ ] **Pin the corpus.** Copy this repository's `default-docs/` at a named commit into the test fixtures of the new repository (`tests/parity/corpus/`), with a `CORPUS.md` that names the commit and how to refresh it. Include the golden fixtures from [020/10](../020_content-contract/10_golden-fixtures.md) and the demo tracker issue.
- [ ] **Run the old engine.** A script (`tests/parity/old-engine.sh`, called by `ctl e2e`) checks out this repository at the same pinned commit into a temporary folder, runs `bun install` and a production build of the Astro engine against the corpus, and serves it on a local port. It needs Bun only in this job.
- [ ] **Run the new engine** from `data/builds/agentks` with `agentks start` on the same corpus and another port.
- [ ] **Route parity.**
    - [ ] Collect the old engine's route set from its build output (every `index.html` path) and the new engine's from the `manifest` message on `/api`.
    - [ ] Every old route must exist in the new set. A new route that the old engine lacks is reported, not failed, unless it collides with a reserved route.
    - [ ] Redirect routes (moved pages) must redirect to the same target.
- [ ] **Rendered-content parity.** For every route, open the page in headless Chromium with Playwright in both engines, wait for the content to settle, and extract the main content region:
    - [ ] Headings: level, text and `id`, in order.
    - [ ] Links: text and **resolved target URL** (not the raw `href` string, because both engines may emit root-absolute or relative forms). An internal link must resolve to a route in the set.
    - [ ] Text: the normalised text content of paragraphs, lists, tables, callouts and code blocks.
    - [ ] Structure: tables (rows and cells), code blocks (language and text), embedded diagrams (type and source hash), artifact frames (URL).
    - [ ] Sidebar and outline: the entries, their order and their targets.
    - [ ] Tracker pages: the issues index rows (id, title, status, priority, component, labels, updated date), the detail page's metadata and the sub-doc list.
    - [ ] Normalise before comparing: whitespace, attribute order, class names, the order of attributes in `data-*`, and the build hash in asset URLs.
- [ ] **Screenshots.** One page per layout and style (docs default and compact, blog index and post, issues index and detail, custom home, info and countdown, artifact page, diagram page), in light and dark mode, at desktop and mobile widths. Store both sets side by side with a pixel diff. Screenshots are reviewed by eye, not gated by a threshold: the rule is "nothing drastic".
- [ ] **The allowlist.** `tests/parity/allowlist.yaml` lists every accepted difference: the route or selector, what differs, and why (for example "links are root-absolute now, see [020/30 links and URLs](../020_content-contract/30_links-and-urls.md)"). An entry without a reason fails the run.
- [ ] **The report.** `data/reports/parity/<date>/index.html`: counts per page type, every unexplained difference with both sides, the screenshot pairs. CI uploads it as an artifact.
- [ ] **Phase 3 mode.** A flag compares the new engine's local client against the output of `agentks build` served as static files, with the same extraction. Owned here, run once [150/10 agentks build](../150_publishing/10_agentks-build.md) exists.
- [ ] **Carry over today's checks** named in the notes: route parity ([check-route-parity.mjs](../../../../../../scripts/checks/check-route-parity.mjs)), rendered links ([check-links.mjs](../../../../../../scripts/checks/check-links.mjs)) and incremental staleness ([check-incremental-staleness.mjs](../../../../../../scripts/checks/check-incremental-staleness.mjs)). Read them for their edge cases before writing the new harness.

## Guardrails
- Never widen normalisation to hide a real difference. Every accepted difference goes in the allowlist with a reason.
- The old engine is run from a pinned commit of this repository. Never modify this repository to make parity pass; if the old engine is wrong, record it in the allowlist.
- Do not commit to this repository. The harness lives in the new repository only.

## Done when
- `ctl e2e --parity` on the pinned corpus reports zero unexplained route differences and zero unexplained content differences.
- Every allowlist entry has a reason, and the list is reviewed in the Phase 1 stage's result.
- The screenshot set exists for every layout and style in both modes and both widths, and nothing drastic differs.
- The parity job runs in CI on every pull request that touches the engine, the UI package or the client.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `tests/parity/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`). The old engine is this repository (`sidhanthapoddar99/agent-knowledge-system`) at a pinned commit, read-only.
- **Read first:**
  - [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md), sections 05 and 07.
  - [Content format](../../notes/02_engine/01_content-format.md) — what the engine derives: URLs, slugs, heading IDs.
  - [The absolute link resolution issue](../../../2026-08-04-absolute-link-resolution/issue.md) — why raw `href` strings are compared by resolved target, and the four-way trailing-slash trace.
  - [Open question 06](../../brainstorm/01_initial-discussion/16_open-questions.md) — the original parity discussion.
- **Depends on:** [020/10 golden fixtures](../020_content-contract/10_golden-fixtures.md), [050/20 WebSocket API](../050_server/20_websocket-api.md) (the `manifest`), [080/30 client shell and routing](../080_ui-and-client/30_client-shell-and-routing.md), [170/10 Rust tests](./10_rust-tests.md) (shared harness).
- **Unblocks:** the Phase 1 acceptance; [170/40 performance budget](./40_performance-budget.md); [200/10 tracker move](../200_launch/10_tracker-move.md), which waits until the new engine renders the tracker correctly.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): output may differ only in small visual improvements. Routes, heading IDs, links and text must match exactly ([development workflow](../../notes/05_delivery/05_development-workflow-and-testing.md)).
- Decided (claude, delegated by sidhantha, 2026-09-29): route parity, a rendered-content comparison in a headless browser, and screenshots of each layout.
- Decided (claude, 2026-09-30): links are compared by resolved target, not by `href` string, because the new engine emits root-absolute links by design ([2026-08-04](../../../2026-08-04-absolute-link-resolution/issue.md)).
- Decided (claude, 2026-09-30): the comparison reads the rendered page, not raw server HTML, because the local client is a single-page app.

# 05 Notes & Analysis

## 01 Extraction shape

Both sides produce one JSON document per route, and the diff runs on those:

```json
{
  "route": "/user-guide/getting-started/installation",
  "title": "Installation",
  "headings": [{ "level": 2, "id": "requirements", "text": "Requirements" }],
  "links": [{ "text": "the config page", "target": "/user-guide/configuration/overview" }],
  "blocks": [{ "kind": "p", "text": "…" }, { "kind": "code", "lang": "bash", "text": "…" }],
  "sidebar": [{ "label": "Installation", "target": "/user-guide/getting-started/installation", "depth": 1 }],
  "outline": ["requirements", "install"]
}
```

## Watch out
- The single-page client renders after data arrives. Wait for a "content ready" marker the client sets, never a fixed delay.
- Heading IDs for repeated headings (`-1`, `-2` suffixes) are a common drift; test them in the golden fixtures first.
- Dates in the tracker come from git. Both engines must read the same pinned git history, or every `updated` column differs.
- The old engine's dev server and build differ (that was the whole of 2026-08-04). Compare against the old engine's **build**, which is what users publish.
