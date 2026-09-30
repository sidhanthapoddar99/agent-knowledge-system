---
title: "UI state kept per project and per browser"
status: open
---

A reader expects the client to remember how they left it: which sidebar folders were open, the tracker filters they chose, where they were scrolled, light or dark mode, and whether editing was on. This state belongs to one person in one browser, so it lives in the browser only and is never sent to the server or shared between users. Today's sidebar state cache already does this well for two sidebars; this leaf carries its design over, extends it to every piece of UI state, and fixes its one known flaw: two projects on the same port share keys.

# 01 To Do
- [ ] **One small store** in `apps/agentks-client/src/state/ui-state.ts` over `localStorage`, with typed scopes. Every key is `aks:<project key>:<kind>:<scope>`; the project key comes from the manifest ([040/50](../040_caching/50_document-cache-by-location.md) defines it).
- [ ] **Scopes to carry**, each as one blob per scope, storing **only deviations from the default**:

| Kind | Scope | Holds |
|---|---|---|
| `sidebar` | a docs section | collapsed or open folders, by the `collapseKey` Rust sends |
| `issue-tree` | one issue | open or closed sub-doc groups |
| `issue-filters` | a tracker | filters, state tab, preset, view (table or cards), page size |
| `scroll` | a URL | last scroll position, kept for the last 200 URLs |
| `theme` | the project | light, dark or system |
| `edit` | the project | editing on or off, raw or live preview ([110/20](../110_editing/20_edit-in-place.md)) |
| `toolbar` | the project | dev toolbar collapsed, last tool ([110/10](../110_editing/10_dev-toolbar.md)) |

- [ ] **Keep today's good rules** from [the sidebar state cache](../../../../dev-docs/05_architecture/05_layout-internals/07_sidebar-state-cache.md):
    - [ ] Deviations only; toggling back to the default deletes the entry; an empty blob deletes its key.
    - [ ] Each blob carries `ts`; blobs expire 30 days after their last write; pruning is lazy, on start-up, over this project's prefix only.
    - [ ] **Sync wins, but never writes.** Ancestors of the open page are force-expanded for the visit without changing the stored preference.
    - [ ] Restore before first paint: the shell applies stored state before the sidebar is shown, so there is no flash of the default state.
    - [ ] A malformed blob is dropped, never trusted.
- [ ] **Stable keys from Rust.** Folder keys are the stable slugs Rust sends in the sidebar tree (`collapseKey`), never display labels.
- [ ] **Cross-tab.** Listen to the `storage` event so a second tab of the same project picks up theme changes; other kinds stay per tab until the next load.
- [ ] **Clear.** The dev toolbar's Cache tool lists this project's UI state by kind and clears it ([110/10](../110_editing/10_dev-toolbar.md)).
- [ ] **Tests**: deviation-only writes, TTL pruning, sync-wins-without-write, two project keys never reading each other's blobs, corrupt blob dropped.

## Guardrails
- UI state is never stored on the server and never shared between users, including in a shared multi-user session ([060_collaboration](../060_collaboration/00_overview.md)).
- No content data in UI state; that is [20](./20_data-cache-indexeddb.md).
- Keys always carry the project key, even though stable ports already separate origins.

## Done when
- Collapsing a folder, reloading, and navigating across the section keeps it collapsed; landing on a page inside it opens it for the visit only.
- Two projects started one after another on the same port (forced in a test) never see each other's state.
- Filters chosen on the tracker index survive a reload.

# 02 Status and Result
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis
## 01 Value shape (carried over)

```json
{ "ts": 1781015654446, "f": { "05_architecture/05_layout-internals": 1 } }
```

## Watch out
- `<details>` toggle events fire asynchronously after a programmatic restore; today's code needs a suppress guard to avoid writing the restore back. The new sidebar will not be `<details>`-based necessarily, but any restore path must not write.
- localStorage is synchronous and small (about 5 MB per origin); keep blobs tiny and never store page data here.
