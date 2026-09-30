---
title: "Artifact pages, embeds and HTML fragments"
status: in-progress
---

Artifacts — self-contained HTML pages the AI writes: reports, dashboards, design systems — are first-class content today. An `NN_`-prefixed `.html` file in a docs section or in an issue's `notes/` or `brainstorm/` shows in the sidebar, renders embedded in an iframe with the chrome intact, and opens full page at `/artifacts/<path>`, with an optional `.meta.json` sidecar and a `site` or `self` theme mode. This leaf carries that shipped behaviour into the new layouts, and takes over the two open ideas of [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md): HTML fragments in custom pages (its subtask 110) and HTML embeds in markdown (its subtask 120).

# 01 To Do
- [x] **Artifact page layout** (`agentks-ui/src/layouts/pages/artifact/`) for `kind: artifact` pages: the section's normal frame (sidebar, outline area), with the content area replaced by the artifact-frame island ([080/50](../080_ui-and-client/50_islands.md)) — iframe `src` at `/artifacts/<path>`, expand in place, open full page, `data-theme` passed in both modes.
- [x] **Sidecar values** from Rust: title, description, declared values, and `artifact.theme` (`site` or `self`, default `self`). The layout shows title and description above the frame.
- [ ] **Site-theme mode stays a server job.** With `theme: "site"`, Rust injects the project's compiled theme CSS at the start of the artifact's `<head>` when serving it; `self` serves the bytes untouched ([050/10](../050_server/10_http-and-routes.md)). Confirm the behaviour matches today's route.
- [ ] **Reserved URL.** No section may use `artifacts` as its base URL; Rust rejects it at config load ([020/20](../020_content-contract/20_config-folder.md)). Check the client never routes `/artifacts/`.
- [ ] **Artifacts in the tracker.** `.html` files in `notes/` and `brainstorm/` render as sub-docs in the issues layout, same frame ([25](./25_issues-layouts.md)).
- [x] **Library HTML** under `/_lib/<alias>/<element>` is sandboxed; the project's own artifacts are not ([120/50](../120_libraries/50_lib-route-and-sandbox.md)).
- [ ] **HTML fragments — decide, then build** (absorbed subtasks 110 and 120; one fragment contract for both):
    - [ ] Write a short design in this leaf's `05` covering: file shape and discovery (for example `*.fragment.html`, never scanned as first-class artifacts), where fragments may appear (a custom page's YAML; a markdown embed `[[./assets/x.fragment.html]]`), trust (first-party, runs in the host page with no iframe — say so plainly), CSS scoping (a wrapping element with a generated prefix, `@scope` where supported), no `<html>`, `<head>`, `<body>`, no background of its own.
    - [ ] Rust validates fragments at load and inlines them in `body_html` or the custom page data; an invalid fragment is an error naming file and line.
    - [ ] The artifacts skill gains the fragment-versus-artifact rule (insert → fragment, document → artifact) ([130_ai-plugins](../130_ai-plugins/00_overview.md)).
    - [ ] A demo custom page and a demo markdown page with a fragment render on-theme in both modes with no fragment-side theme code.
- [ ] **Top-level artifact page** (claude, proposed in [theming](../../notes/03_frontend/04_theming-and-layouts.md) section 02): an HTML artifact may serve as a top-level page, the escape hatch for one-off pages now that custom layouts are gone. Implement if the config design in [020/20](../020_content-contract/20_config-folder.md) accepts it.
- [ ] **Parity** on every artifact in this repository's docs and tracker, both theme modes.

## Guardrails
- Artifacts run in an iframe; their scripts never touch the app around them. Fragments are the one deliberate exception and are first-party only.
- The set of places project HTML is served as `text/html` stays an explicit list: `/artifacts/` and `/_lib/`.
- No artifact is editable in place ([editor engines](../../notes/03_frontend/03_editor-engines.md) section 02).

## Done when
- Every artifact in this repository shows in the sidebar, renders embedded, expands, and opens full page, in `site` and `self` modes.
- The fragment design is written in this leaf and the two demos pass.

# 02 Status and Result
In progress (claude, 2026-10-01): the artifact page body and the artifact-frame island work in the client; fragments, the top-level artifact page, tracker artifacts, the Rust-side checks and full-repo parity are left.

## Result
- **Built** on branch `wave3/layout-artifacts` (worktree `.agentks-worktrees/layout-artifacts`):
    - `apps/packages/agentks-ui/src/layouts/pages/artifact/ArtifactBody.tsx` draws inside the section's layout (`PageBody.tsx` hands `kind: artifact` to it): the title and description from the sidecar, then the `artifact-frame` island marker, with a link to the artifact as the fallback.
    - `apps/packages/agentks-ui/src/islands/artifact-frame/` is the island. The project's own artifact runs unsandboxed; the frame writes `data-theme` on its root on every load and theme change, and grows to its content's height. Library HTML (`trust: 'library'`) gets `sandbox="allow-scripts allow-popups"` and the mode as `?theme=`. "Full page" opens the artifact's URL in a new tab; "Expand" fills the window, and Escape closes it.
    - `embed_height`: absent or `"full"` fits the content, a number is pixels, a CSS length is fixed, `"16/9"` is an aspect ratio. Any other value shows a notice and fits the content.
- **Checked:** the client router never routes `/artifacts/` or `/assets/` (its reserved list). The mock serves `site`-mode artifacts with the theme link at the start of `<head>`, as the server must.
- **Tests:** `bun test` in `apps/packages/agentks-ui` (32 tests, about 0.3 s); the new `tests/islands.test.tsx` covers `frameSize` and `withTheme`. `./ctl gate` is green (lint, typecheck, test, check; 30 s).
- **Screenshots** in light and dark: `data/screenshots/layout-artifacts/design-system-demo-{light,dark}.png` (`self` mode), `site-theme-demo-{light,dark}.png` (`site` mode), `artifact-expanded-light.png`, in the worktree. The demo pages come from `apps/agentks-client/dev/mock-demo.ts` (`ctl dev client`, then `/dev-docs/examples/…`).
- **Left:** tracker artifacts (issues layout, [25](./25_issues-layouts.md)), fragments, the top-level artifact page, parity on every artifact in the repository, and the Rust side: `embed_height` validation, site-theme injection, the reserved base URL.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`: `apps/packages/agentks-ui/src/layouts/pages/artifact/`, the artifact route in `apps/agentks-engine`.
- **Absorbed:** [2026-07-07-artifact-component](../../../2026-07-07-artifact-component/issue.md) — open subtasks [110 custom-page HTML fragments](../../../2026-07-07-artifact-component/subtasks/110_custom-page-html-fragments.md) and [120 markdown HTML embeds](../../../2026-07-07-artifact-component/subtasks/120_markdown-html-embeds.md); its shipped work (component, route, reserved-URL guard, site-theme mode, tracker rendering) is the behaviour to carry over.
- **Read first:** [the shared UI package](../../notes/03_frontend/01_shared-ui-package.md) (section 05), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (section 02, the `.html` boundary), [the artifact pages user guide](../../../../user-guide/15_writing-content/08_artifact-pages.md), [the site-theme-mode subtask](../../../2026-07-07-artifact-component/subtasks/90_site-theme-mode.md).
- **Today's code:** [the artifact route](../../../../../../agent-ks-engine/src/pages/artifacts), [the artifact script](../../../../../../agent-ks-engine/src/scripts/artifacts.ts), the artifact page loader in [the loaders folder](../../../../../../agent-ks-engine/src/loaders).
- **Depends on:** [15](./15_docs-layouts.md), [080/50](../080_ui-and-client/50_islands.md), [030/70 diagram and artifact sources](../030_rust-engine/70_diagram-and-artifact-sources.md).

# 04 Decisions
- Decided (sidhantha, 2026-07-07): artifacts are first-class content with a reserved `/artifacts/` full-page route and an optional sidecar ([the artifact issue](../../../2026-07-07-artifact-component/issue.md)).
- Decided (sidhantha, 2026-07-07): `artifact.theme` is `site` or `self`, default `self`.
- Decided (claude, 2026-09-30): library HTML is sandboxed; the project's own artifacts are not ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-10-01): an artifact page is a body inside its section's layout (`layouts/pages/artifact/`), not a layout of its own, because the sidebar, outline area and pagination must stay exactly the section's.
- Decided (claude, 2026-10-01): the frame takes a `trust` prop (`project` or `library`) and sandboxes only `library`, because the sandbox rule is the frame's to enforce and the caller knows whose HTML it is.
- Decided (claude, 2026-10-01): an `embed_height` the frame cannot read shows a notice and fits the content, because a guessed height looks right and hides the typo. Rust should reject it at load; see the result.
- Decided (claude, 2026-10-01): the demo artifacts for the client's mock are copied into `apps/agentks-client/dev/demo/` from the user guide, because the mock must not read the old repository.

# 05 Notes & Analysis
## Watch out
- Injecting theme CSS at the start of `<head>` (not before `</head>`) is deliberate: robust against a literal `</head>` inside the artifact's content, and lets the artifact's own rules win.
- The three tiers: artifact (whole document, iframe), custom-page fragment (page insert, host DOM), markdown embed fragment (in-page block, host DOM, no background).
- The user guide's site-theme demo artifact draws empty bars in both engines: its `.fill` elements are inline `<span>`s with no `display: block`, so their width and height do nothing. A content fix, not a frame bug.
- Escape closes an expanded frame only while focus is in the host page. After a click inside a same-origin artifact, key events go to the artifact's document.
