---
title: "Open questions and risks"
---

One design question is still open: whether to adopt the structure model (08). Question 07, the site index's data structure, is decided with numbers in [030/40 site index](../../subtasks/030_rust-engine/40_site-index.md). Question 12, the UI framework, is decided: Preact, after a measured spike in [080/10 UI framework](../../subtasks/080_ui-and-client/10_ui-framework-decision.md). A longer list of smaller points is proposed by claude but not yet confirmed by the user. The biggest risks are the size of the rewrite, rendering drift, a forced migration that damages content, and the publishing gap between 1.0.0 and Phase 3. Every component note links here for its open items. When a question is decided, its answer moves into the owning note and its row here is removed.

# 03 References

- [01/01 Index](./01_index.md)
- Brainstorm record: [open questions](../../brainstorm/01_initial-discussion/16_open-questions.md), [why, and the prior audit](../../brainstorm/01_initial-discussion/02_why-and-prior-audit.md), [performance and size](../../brainstorm/01_initial-discussion/13_performance-and-size.md), [impact on other issues](../../brainstorm/01_initial-discussion/18_impact-on-other-issues.md).
- [The prior feasibility audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/01_summary.md) and its [case against](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/024_question_case-against.md).
- [The structure model](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) — question 08.
- [The route-parity check](../../../../../../scripts/checks/check-route-parity.mjs) — today's check the Phase 1 proof builds on.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the site is indexed at start-up and pages are rendered on request (question 07's first half).
- Decided (claude, 2026-10-01): the site index is two ordered maps keyed by path, with folder hashes rolled up Merkle style, and no radix tree (question 07's second half). The answer is in [02/03 Rust engine](../02_engine/03_rust-engine.md) section 03; the benchmark is in [030/40](../../subtasks/030_rust-engine/40_site-index.md).
- Decided (claude, delegated by sidhantha, 2026-09-29): the new engine is proven by route parity, a rendered-content comparison in a headless browser, layout screenshots in light and dark mode, and the user's own use (question 06).
- Decided (sidhantha, 2026-09-30): the UI framework must render the shared components to HTML at build time and support islands (a hard requirement on question 12).
- Decided (claude, under sidhantha's delegation, 2026-09-30): the UI framework is Preact 11, with a small manifest-driven router of our own and islands hydrated one by one. The measured reasons are in [03/01 Shared UI package](../03_frontend/01_shared-ui-package.md) section 07 (question 12).
- Decided (claude, under sidhantha's delegation, 2026-09-30): the `/api` message set, built as Rust types: the client's hello first, cacheable `get` pulls, `render` as its own request, and pushes of changed hashes, errors, `fatal` and `resync` ([02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md), section 03).
- Decided (claude, under sidhantha's delegation, 2026-09-30): migration scripts are Python, run with `uv run` ([05/03](../05_delivery/03_versioning-and-migrations.md)).
- Decided (claude, under sidhantha's delegation, 2026-09-30): the dev tools that come back are the ones [03/05 Dev toolbar](../03_frontend/05_dev-toolbar.md) recommends (question 04).
- Decided (claude, under sidhantha's delegation, 2026-09-30): single-user diagram editing is part of Phase 2 ([03/03 Editor engines](../03_frontend/03_editor-engines.md)).
- Decided (claude, under sidhantha's delegation, 2026-09-30): search on the static site uses Pagefind, built at build time, with no WASM ([05/02 Publishing](../05_delivery/02_publishing-ssg.md)).

# 05 Notes & Analysis

## 01 Open design questions

| # | Question | Current leaning | Blocks | Owner note |
|---|---|---|---|---|
| 08 | **Adopt the structure / layout / theme / shell model** from the Go issue? | In the new split, "structure" (URLs, parsing rules) would be Rust and "layout" and "shell" the frontend. Its external-layout option is contradicted by the no-custom-layouts decision. The Go issue's open subtask `01_define-and-discuss-structure` could move here, re-scoped to built-in layouts | Naming inside the Rust core and the shared package | [02/03 Rust engine](../02_engine/03_rust-engine.md) |

## 02 Proposed by claude, not yet confirmed

These sit in the component notes marked as proposals. Each needs a yes, a change or a no from the user.

| Area | Proposal | Owner note |
|---|---|---|
| Server | Localhost only by default from Phase 1; network access only with `--share` and an access key | [02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md) |
| Editing | A save carries the hash it started from; a changed file on disk is a conflict, not an overwrite | [03/03 Editor engines](../03_frontend/03_editor-engines.md) |
| Cache | The engine version is part of the build cache key; a page's key includes the hashes of every file it embeds | [02/06 Machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) |
| Cache | `agentks cache clean` also reads `dep.lock` from each project's other local branches | [02/06 Machine home and build cache](../02_engine/06_machine-home-and-build-cache.md) |
| Theming | `agentks theme css` (working name `list-css`) and `agentks theme eject`; class names or `data-part` hooks become a documented contract, renamed only with a migration | [03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md) |
| Layouts | An HTML artifact may serve as a top-level page, as the escape hatch for one-off pages | [03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md) |
| Libraries | The `dep.lock` shape; a local folder may skip `manifest.json` (each child becomes an element); `/_lib/<alias>/<element>` for artifacts; the catalog entry fields | [04/01 Library system](../04_ecosystem/01_library-system.md) |
| Templates | A template id is looked up in `library.json`, a URL is a git source; `init` refuses a folder with `config/` | [04/04 Templates and init](../04_ecosystem/04_templates-and-init.md) |
| Migrations | Safety rails: refuse a dirty git tree, dry run first, re-detect after | [05/03 Versioning and migrations](../05_delivery/03_versioning-and-migrations.md) |
| Publishing | `agentks build [--out <folder>]` defaulting to `dist/` beside `config/`; per-page raw markdown and `llms.txt` in the output; a cache mount for libraries in the Dockerfile | [05/02 Publishing (SSG)](../05_delivery/02_publishing-ssg.md) |
| Development | mise puts `data/builds/` first on the PATH inside the repository, with a second name kept for the installed release | [05/05 Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md) |
| Launch | The final 0.x release points the updater at the new repository; archive this repository in place; move the tracker by copying active issues into `docs/` | [05/07 Docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md) |
| Docs command | `agentks docs <page>`; ships at the hosting step (claude decided this; the user can move it) | [02/05 Rust CLI](../02_engine/05_rust-cli.md) |

## 03 Open points for later stages

Not needed for 1.0.0. Recorded so they are not lost.

| Stage | Open points |
|---|---|
| Phase 3 | The exact nginx layout for agentks.neuralabs.org. Search uses Pagefind; issue filters compare values Rust precomputed, so neither needs WASM |
| Libraries | Adding catalogs other than the built-in one, for a company that runs its own |
| Multi-user access | The exact `agentks share` commands; whether an access key can expire ([the server](../02_engine/04_sync-engine-and-server.md)) |
| Agent hooks and retrieval | Which hooks earn their noise; Codex hook support; whether semantic search earns its model download; one index shared with site search |
| GitHub issues layout | Read-only or write; live or build-time snapshot; one repository or several; reuse the tracker UI or a plain list; keychain or credentials file |
| Extensions | Whether an extension is a kind of library; the `agentksx` command contract; whether site scripts need a sandbox or a permission list |

## 04 Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| **The rewrite is large.** The prior audit estimated 6–12 months for one person | A long rewrite can stall with nothing shippable | Phases with narrow done-criteria; the Rust content core first, checkable against this repository's content before any UI exists; the new repository starts from scratch while this repository's Astro engine keeps serving users until the switch-over |
| **Rendering drift.** comrak and a Rust highlighter will not match `marked` and Shiki exactly | Broken links, changed heading IDs or missing text break existing content and bookmarks | Routes, heading IDs, links and text must match exactly; only small visual improvements may differ. Proven by route parity, rendered-content comparison, layout screenshots and the [demo issue fixture](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) |
| **A forced migration damages content** | The worst failure in this design: users cannot stay on the old format | Refuse a dirty git tree; dry run first; re-detect after; cover every 0.x format; run on this repository's own docs and tracker first |
| **The publishing gap.** 1.0.0 has no `agentks build` | Publishers who upgrade lose publishing | Release notes say so plainly; publishers pin the last 0.x with mise; the deployment docs point to the pin until Phase 3 |
| **Stale caches** | A page that embeds a changed file, or a cache shared by two engine versions, shows old output | A page's hash covers the files it embeds; the engine version joins the cache key; the lesson of [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) |
| **Single-page app chores** | `#heading` anchors, back-and-forward scroll, focus and accessibility, first-load size are free in a server-rendered site | Acceptance criteria for the client; lazy-loaded layouts and diagram libraries |
| **Frontend weight** | Mermaid, Excalidraw and draw.io dominate the bundle | They already load only on pages that use them; published sites render diagrams to SVG at build time |
| **The voice helper's native build.** `agentks-voice` links ONNX Runtime and libopus on three platforms | A helper that does not build or run on one platform leaves its users with only the browser voice | The voice spike builds it first; the helper links ONNX Runtime's prebuilt static libraries and sits outside the engine's workspace, so the engine's gate never compiles it ([the voiceover](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/07_voiceover.md)) |
| **Unknown words without espeak-ng.** The GPL-free pronunciation step cannot guess a word it does not know | A product name spelled letter by letter sounds broken while the file and the check look fine | The pronunciation list in `config/video.yaml` and in each video, and the `video.unknown-word` error, so no clip ever spells a word by mistake |
| **User CSS breaks on upgrade** | CSS is the only branding tool, so renaming a class breaks someone's site silently | Documented hooks treated like theme variables; renaming needs a migration; `agentks theme css` lists them per version |
| **Library content is code** | `.html` and script elements run in the local viewer | Fetch only through git, verified against the pinned commit; sandboxed iframes; libraries arrive only through `dep.yaml`; `library add` prints the source |
| **Network exposure** | Today's dev server listens on the whole network with the editor on | Localhost only by default from Phase 1 |
| **Save echo** | The editor reloads a file it just saved and loses the cursor or the user's typing | The server marks its own writes and does not echo them to the saving client |
| **Migration runtime and network** | `agentks migrate` needs uv or bun and a network connection | Migrations are rare (once per breaking release); the runner checks and prints how to get the runtime; the gate's error says what to download |
| **Build-time JavaScript runtime** | `agentks build` needs Bun or Node | CI and CDN pipelines usually have Node; the Dockerfile installs Bun in one line |
| **Fixed addresses** | Every released binary reads `library.json` and the migration scripts from fixed repository addresses | Those files never move, and the repositories are never renamed |
| **Private until launch** | The three new repositories are private, so installer downloads, `agentks migrate`, library fetches and marketplace installs need GitHub credentials until launch | Development and CI use local paths or authenticated git; the repositories go public at launch step 5 |
| **The switch-over strands users** | Installed 0.x CLIs keep checking this repository and never see the new release | The final 0.x release points the updater at the new repository or prints a notice; the switch happens in one go when the new docs and skills are ready |
| **Latest-only docs** | Hosted docs describe features an older binary lacks | Each feature page says the version it arrived in; automatic updates keep most users current |
| **Unverified numbers** | The footprint and memory figures predate the Astro 7 upgrade | Re-measure before quoting any of them in a decision |
| **Scope creep from later stages** | Hooks, GitHub issues and extensions pull work into Phase 1 | Each is recorded as a later stage; Phase 1 is rendering only |

## 05 Losses the prior audit named, and where each is answered

| Loss | Answered in |
|---|---|
| Shiki fidelity | A Rust highlighter that outputs CSS classes; small visual changes allowed ([02/03 Rust engine](../02_engine/03_rust-engine.md)) |
| The dev-toolbar host | Rebuilt in the client in Phase 2 ([03/05 Dev toolbar](../03_frontend/05_dev-toolbar.md)) |
| External layouts | Dropped by decision ([03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md)) |
| Scoped CSS (1,364 lines) | Moves with its components; the layouts keep the built-in theme's class names, which are the stable hooks, and CSS the UI package adds uses the `aks-` prefix ([03/04 Theming and layouts](../03_frontend/04_theming-and-layouts.md)) |
| The server-side CRDT | `yrs` is native in Rust ([02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md)) |
| ~11,000 lines of docs | The complete docs rewrite, launch step 4 ([05/07 Docs rewrite and launch](../05_delivery/07_docs-rewrite-and-launch.md)) |
| The `.html` MIME boundary | [02/04 Sync engine and server](../02_engine/04_sync-engine-and-server.md) |
| Editor save echo suppression | [03/03 Editor engines](../03_frontend/03_editor-engines.md) |
| `issue-status` in two languages | Rules stay in Rust; the browser receives results ([01/03 Architecture](./03_architecture.md)) |
| Preview versus published fidelity | One renderer for bodies and previews; one shared UI package for the client and the static build |
| Every 0.x format | `agentks migrate` covers every 0.x format ([05/03 Versioning and migrations](../05_delivery/03_versioning-and-migrations.md)) |

One gap outside the audit's ten defects remains in today's code: there is no typecheck script. Claude proposes that the new repository's gates include a typecheck from the start, so the gap does not carry over ([05/05 Development workflow and testing](../05_delivery/05_development-workflow-and-testing.md)).
