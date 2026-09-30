---
title: "End-to-end tests in a real browser, with the default library"
status: open
---

Unit and parity tests prove the parts. This leaf proves the product: a person installs agentks, creates a project, adds the default library, starts the viewer, reads, edits, shares and publishes, all in a real browser. The tests use Playwright against the built binary from `data/builds/` and the library repository at a pinned tag. The first launch step is "the engine, the client and the default library, tested end to end", and this suite is that test.

# 01 To Do
- [ ] **Harness.** `tests/e2e/` in the main repository, Playwright (latest stable) with TypeScript, run by `ctl e2e`. Each test gets a fresh `TempProject`-style folder and its own `AGENTKS_HOME`, starts `agentks start` on a free port, and stops it after.
    - [ ] Browsers: Chromium on every run; Firefox and WebKit nightly.
    - [ ] Viewports: desktop (1440×900) and mobile (390×844).
- [ ] **Flow 1 — a new project.** `agentks init --template agentks-default <tmp>`; `agentks start`; the home page loads; the sidebar lists the template's pages; every sidebar link opens a page with no console errors.
- [ ] **Flow 2 — the default library.** Add the default library to `config/dep.yaml` at the pinned tag; `agentks install` writes `config/dep.lock`; restart; a video page and an artifact page that use library elements render every element the library's `manifest.json` lists, served from `/_lib/<alias>/<element>` ([120/50](../120_libraries/50_lib-route-and-sandbox.md)). Library HTML runs sandboxed: a test element that tries to read `parent.document` fails.
- [ ] **Flow 3 — every layout.** Open one page per layout and style (docs, blog index and post, issues index and detail, custom pages, artifact and diagram pages); check the main landmarks exist and the theme toggle switches light and dark.
- [ ] **Flow 4 — live updates.** With a page open, change its markdown on disk; the page updates without a reload and keeps its scroll position. Change a file the page embeds; the page updates too. Delete the page; the client shows the "moved or deleted" notice.
- [ ] **Flow 5 — navigation state.** Open and close sidebar folders, set issue filters, reload; the state is kept. Start a second project on another port; its state is separate ([090/10](../090_frontend-performance/10_ui-state-persistence.md)).
- [ ] **Flow 6 — editing.** Open the dev toolbar, choose Edit, change text in live preview, save; the file on disk changed and the page shows the new text. Change the same file on disk before saving; the save reports a conflict and nothing is overwritten ([110/40](../110_editing/40_save-path-and-sync.md)).
- [ ] **Flow 7 — two users.** Create an access key with `agentks share`; open the page in two browser contexts (one with the key); both edit the same file; both see each other's presence and the merged text; the file on disk holds the merged text. A context without a key is refused ([060/40](../060_collaboration/40_access-keys.md)).
- [ ] **Flow 8 — upgrade across versions.** Start a tab on build A, replace the binary with build B, restart; the open tab reloads itself instead of talking to the new server with old code ([140/50](../140_versioning-and-migrations/50_protocol-version-handshake.md)).
- [ ] **Flow 9 — publishing (Phase 3).** `agentks build --base /docs` on the project, serve the output with a static server under `/docs`, open every page, and check no link or asset resolves outside `/docs` ([150/10](../150_publishing/10_agentks-build.md)).
- [ ] **Flow 10 — offline.** Load a page, stop the server; the page stays on screen with a "disconnected" notice; restart; the client reconnects and refreshes what changed.
- [ ] **Accessibility scan** with `@axe-core/playwright` on one page per layout; serious and critical findings fail.

## Guardrails
- The suite runs against a built binary, never `cargo run`, so it tests what ships.
- The library comes from `NeuraLabsHQ/agent-knowledge-system-library` at a pinned tag, fetched once per CI run and cached. A test never uses a moving branch.
- No fixed sleeps. Wait on visible state or a pushed message with a timeout.

## Done when
- `ctl e2e` runs flows 1 to 8 and 10 green on Chromium, desktop and mobile, in CI.
- Flow 9 is green once Phase 3 lands.
- Firefox and WebKit run nightly and their failures are triaged, not ignored.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `tests/e2e/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`). The library: `NeuraLabsHQ/agent-knowledge-system-library` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`).
- **Read first:**
  - [Flows](../../notes/01_overview/04_flows.md) — each flow here follows one there.
  - [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md), section 05 ("End to end with the default library").
  - [Library system](../../notes/04_ecosystem/01_library-system.md), [client application](../../notes/03_frontend/02_client-application.md), [editor engines](../../notes/03_frontend/03_editor-engines.md), [sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (access keys, section 06).
- **Depends on:** [070/30 start and dev mode](../070_cli/30_start-and-dev-mode.md), [070/40 init template](../070_cli/40_init-template.md), [120/60 default library scaffold](../120_libraries/60_default-library-scaffold.md), [080/30 client shell and routing](../080_ui-and-client/30_client-shell-and-routing.md). Flows 6 to 9 wait on their features.
- **Unblocks:** the 1.0.0 release ([160/10](../160_distribution/10_installer-and-release-workflow.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the first launch step is the engine, the client and the default library, tested end to end ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (sidhantha, 2026-09-30): multi-user access uses access keys, with no sign-in ([sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): Playwright is the browser test tool, because today's project already uses it and it drives all three browser engines.

# 05 Notes & Analysis

## Watch out
- Library elements are fetched by git. Cache the library checkout between CI runs by tag, or the suite depends on GitHub's availability.
- Two browser contexts on one machine share nothing, which is what flow 7 needs; two pages in one context would share cookies and prove nothing.
- The service worker (PWA) can serve an old client between tests. Start every test with a fresh browser context.
