---
title: "UI state kept per project and per browser"
status: in-progress
---

A reader expects the client to remember how they left it: which sidebar folders were open, the tracker filters they chose, where they were scrolled, light or dark mode, and whether editing was on. This state belongs to one person in one browser, so it lives in the browser only and is never sent to the server or shared between users. Today's sidebar state cache already does this well for two sidebars; this leaf carries its design over, extends it to every piece of UI state, and fixes its one known flaw: two projects on the same port share keys.

# 01 To Do
- [x] **One small store** in `apps/agentks-client/src/state/ui-state.ts` over `localStorage`, with typed scopes. Every key is `aks:<project key>:<kind>:<scope>`; the project key comes from the manifest ([040/50](../040_caching/50_document-cache-by-location.md) defines it).
- [x] **Scopes to carry**, each as one blob per scope, storing **only deviations from the default**:

| Kind | Scope | Holds |
|---|---|---|
| `sidebar` | a docs section | collapsed or open folders, by the `collapseKey` Rust sends |
| `issue-tree` | one issue | open or closed sub-doc groups |
| `issue-filters` | a tracker | filters, state tab, preset, view (table or cards), page size |
| `scroll` | a URL | last scroll position, kept for the last 200 URLs |
| `theme` | the project | light, dark or system |
| `edit` | the project | editing on or off, raw or live preview ([110/20](../110_editing/20_edit-in-place.md)) |
| `toolbar` | the project | dev toolbar collapsed, last tool ([110/10](../110_editing/10_dev-toolbar.md)) |

- [x] **Keep today's good rules** from [the sidebar state cache](../../../../dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md):
    - [x] Deviations only; toggling back to the default deletes the entry; an empty blob deletes its key.
    - [x] Each blob carries `ts`; blobs expire 30 days after their last write; pruning is lazy, on start-up, over this project's prefix only.
    - [x] **Sync wins, but never writes.** Ancestors of the open page are force-expanded for the visit without changing the stored preference.
    - [x] Restore before first paint: the shell applies stored state before the sidebar is shown, so there is no flash of the default state.
    - [x] A malformed blob is dropped, never trusted.
- [x] **Stable keys from Rust.** Folder keys are the stable slugs Rust sends in the sidebar tree (`collapseKey`), never display labels.
- [x] **Cross-tab.** Listen to the `storage` event so a second tab of the same project picks up theme changes; other kinds stay per tab until the next load.
- [ ] **Clear.** The dev toolbar's Cache tool lists this project's UI state by kind and clears it ([110/10](../110_editing/10_dev-toolbar.md)).
- [x] **Tests**: deviation-only writes, TTL pruning, sync-wins-without-write, two project keys never reading each other's blobs, corrupt blob dropped.

## Guardrails
- UI state is never stored on the server and never shared between users, including in a shared multi-user session ([060_collaboration](../060_collaboration/00_overview.md)).
- No content data in UI state; that is [20](./20_data-cache-indexeddb.md).
- Keys always carry the project key, even though stable ports already separate origins.

## Done when
- Collapsing a folder, reloading, and navigating across the section keeps it collapsed; landing on a page inside it opens it for the visit only.
- Two projects started one after another on the same port (forced in a test) never see each other's state.
- Filters chosen on the tracker index survive a reload.

# 02 Status and Result
In progress. The store, the docs sidebar, scroll positions, the cross-tab theme, the dev toolbar's and the editor's settings, and the Cache tool's count and clear are built, tested and merged into main. The tracker's filters and issue tree wait on the tracker layouts.

## Result
Where: the main repository, merged into `main` at `a0097c4` and pushed; CI green. `ctl test client` 81 tests in about 1 s, `ctl test ui` 71 tests.

- `apps/agentks-client/src/state/ui-state.ts`: `UiState` and the `UiMemory` interface, keys `aks:<project key>:<kind>:<scope>`, one blob `{ ts, f }` per scope holding only deviations. `set` with a default deletes the field when the value equals it; `forget` deletes a field; an empty blob deletes its key. 30-day TTL; `prune()` runs at start-up over this project's prefix only and drops expired, malformed and unknown-kind blobs. Scroll positions are capped at the last 200 URLs. `entries()` and `clear(kind?)` are there for the dev toolbar's cache tool. A key that is not 16 hex digits is an error.
- `src/state/project-memory.ts`: `ProjectMemory`, bound to `hello.project` in `src/main.ts`. A read or write before the bind throws; with no local storage, nothing is kept.
- `src/state/scroll-memory.ts`: saves the scroll position per URL (150 ms debounce, the URL read when the scroll happens); the controller restores it on a first load without a `#hash`.
- `src/state/theme.ts`: `followThemeAcrossTabs` applies a `theme` change from another tab (or an OS change while nothing is stored) through the package's new `resolveThemeMode`.
- `src/state/folder-memory.ts`: the UI package's `FolderMemory` over this store. A tree's folders are stored under `sidebar`, one field per `collapse_key`, `true` open or `false` closed. `App.tsx` provides it through the package's `FolderMemoryContext`; the sidebar's `useFolderOpen` (the island's hook, shared with the static page) reads and writes it.
- `src/devtoolbar/prefs.ts`: the toolbar's and the editor's settings, under the kinds `toolbar` and `edit` and the scope `project`. Before the hello names the project, they read as defaults and write nothing.
- The Cache tool counts and clears UI state through `UiState.entries()` and `clear()`.
- Tests: `apps/agentks-client/tests/ui-state.test.ts` (deviation-only, TTL pruning per project, two project keys isolated, corrupt blobs dropped, 200-URL cap, cross-tab theme), `tests/sidebar-memory.test.tsx` (fold, reload, land inside: open without a write, fold back to default deletes), `tests/devtoolbar/prefs.test.ts` (settings in the store, none before the project is named), `apps/packages/agentks-ui/tests/islands.test.tsx` (folder memory) and `tests/theme-mode.test.ts` (the pre-paint script against `resolveThemeMode`).

Left:
- `issue-tree` and `issue-filters`: the store and the kinds exist. The tracker's issue tree can use `useFolderOpen` with its own `FolderScopeContext`; its filters need a way into the store from the package, which does not exist yet. "Filters survive a reload" is checked there.
- The sidebar against the real engine: `collapse_key` is in the generated types and the fixtures; a check against a running engine is still to do.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, folder `apps/agentks-client/src/state`.
- **Read first:** [the sidebar state cache](../../../../dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md) (the design being carried over), [the client application](../../notes/03_frontend/02_client-application.md) (section 05, "UI state").
- **History:** [2026-05-07-sidebar-state-persistence](../../../2026-05-07-sidebar-state-persistence/issue.md) (done) built today's cache. Its dev-docs page says isolation would move server-side; that plan is replaced by the project-key namespacing below.
- **Depends on:** [080/20](../080_ui-and-client/20_shared-ui-package.md), [080/30](../080_ui-and-client/30_client-shell-and-routing.md), [050/45 stable ports](../050_server/45_stable-ports.md), [040/50 document cache by location](../040_caching/50_document-cache-by-location.md) (the project key).
- **Used by:** [080/50 islands](../080_ui-and-client/50_islands.md) (sidebar collapse, issue filters, theme toggle), [110_editing](../110_editing/00_overview.md).

# 04 Decisions
- Decided (claude, 2026-09-30): UI state lives only in the browser, per person and per browser; the server never stores it ([the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-09-30): every browser storage key carries the project key ([the client](../../notes/03_frontend/02_client-application.md) section 05). This replaces the older idea of moving dev UI state server-side for isolation.
- Decided (claude, 2026-10-01, with [190/40](../190_homepage/40_shared-look-with-docs.md)): the theme mode is the one exception to the project-key rule. It is stored under the unnamespaced key `theme`, as `light` or `dark`; no entry means follow the OS (the table's "system"). It is set as `data-theme` on `<html>` by a blocking script before first paint, and a `storage` listener applies a change made in another tab. This is because the mode must cross from the homepage at `/` to the docs at `/docs` on one origin, and the homepage has no project key; sharing it between projects on one port is harmless, since it is a person's preference, not project state. The homepage's `apps/agentks-homepage/src/lib/theme.ts` is the reference: its `resolveTheme` and boot script are tested against each other.

- Decided (claude, 2026-10-01): the store lives in the client (`src/state/`). The UI package asks only for what its folder trees need, `FolderMemory` through `FolderMemoryContext`, and the client supplies it from this store (`state/folder-memory.ts`). This is because the package stays pure: without a provider (the static site today) layouts draw Rust's defaults. The static page's islands entry takes a `FolderMemory` too, so it can bring its own storage.
- Decided (claude, 2026-10-01): this store is the only UI state store in the client. The dev toolbar's and the editor's settings moved onto it from their own `prefs.ts` store, because both wrote under the same `aks:<project key>:` prefix in different formats, and this store's start-up prune would have deleted the other's blobs.
- Decided (claude, 2026-10-01): a sidebar folder is stored as `true` open or `false` closed, the value the package's `FolderMemory` passes. The field is its `collapse_key`; a folder without one is not remembered. This is because a label is not stable, and guessing a key would mix folders up.
- Decided (claude, 2026-10-01): scroll positions are one blob per URL, as the table says. The 200-URL cap is enforced when a new URL is stored and at start-up; positions restore only on a first load (reload or a new tab) with no `#hash`. Back and forward keep using the router's history entry, and a link click starts at the top. This is because a link click that lands mid-page would surprise the reader.
- Decided (claude, 2026-10-01): the UI package gets `resolveThemeMode`, and its pre-paint script now ignores a stored value that is neither `light` nor `dark`, as the homepage's does. A package test runs the script against the function. This is because the cross-tab listener needs the same rule, and one tested rule cannot drift.
- Decided (claude, 2026-10-01): "outline state" has nothing to store today. The outline has no folding; its active heading follows the scroll position, which is stored.

# 05 Notes & Analysis
## 01 Value shape (carried over)

```json
{ "ts": 1781015654446, "f": { "05_architecture/05_layout-internals": 1 } }
```

## Watch out
- `<details>` toggle events fire asynchronously after a programmatic restore; today's code needs a suppress guard to avoid writing the restore back. The new sidebar will not be `<details>`-based necessarily, but any restore path must not write.
- localStorage is synchronous and small (about 5 MB per origin); keep blobs tiny and never store page data here.
- The homepage, on the same origin as the published docs, already stores the theme mode under the unnamespaced `theme` key (`light` or `dark`; no entry means follow the OS) and sets `data-theme` on `<html>`, as today's docs engine does (`apps/agentks-homepage/src/lib/theme.ts`). The `theme` row above would give the docs a different key. Decide the theme-mode key with [190/40 shared look](../190_homepage/40_shared-look-with-docs.md): keep it unnamespaced, which needs an exception to this leaf's guardrail that every key carries the project key, or 190/40 changes the homepage to read the namespaced key. Record the answer in both leaves.
