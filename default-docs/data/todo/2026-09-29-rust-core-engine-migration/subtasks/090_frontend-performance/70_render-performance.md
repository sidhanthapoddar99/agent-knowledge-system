---
title: "Render performance: navigation and in-place redraws"
status: open
---

The client redraws in two situations: a navigation, and a `changed` push for something on screen. Both must feel instant and must not lose the reader's place. This leaf makes redraws minimal and cheap: only the parts whose data hash changed are redrawn, DOM reads and writes are batched, and scroll, focus and open panels survive.

# 01 To Do
- [ ] **Redraw by part.** The page frame (navbar, sidebar, outline, body, footer) redraws per part, keyed by the hash of that part's data. A changed body leaves the sidebar untouched and the reverse.
- [ ] **Keep the reader's place.** On an in-place redraw keep the scroll position anchored to the first visible heading (not a pixel offset), keep open panels and focus, and re-mount only islands whose input changed.
- [ ] **Batch DOM work.** One redraw per animation frame for bursts of pushes; read layout (scroll, sizes) before writing; no forced synchronous layout in loops.
- [ ] **Body HTML insertion.** Insert Rust's `body_html` once per change; diff at the block level when the framework makes it cheap, otherwise replace the body and re-mount its islands.
- [ ] **Measure.** Add `performance.mark` around navigation and redraw; the dev toolbar's System tool shows the last ten timings ([110/10](../110_editing/10_dev-toolbar.md)); [80](./80_perf-budget-checks.md) collects them in CI.

## Guardrails
- Never re-render the whole app on a push.
- The body stays Rust's HTML; the client never rewrites it to go faster.

## Done when
- Editing a markdown file on disk while its page is open redraws the body within the push budget in [00](./00_overview.md), with the reader's heading still at the top of the screen.
- A Chrome performance trace of 20 navigations shows no long task over 50 ms outside heavy-island loading.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/agentks-client/src/router/` and the layout frames in `apps/packages/agentks-ui`.
- **Read first:** [the client application](../../notes/03_frontend/02_client-application.md) (sections 06, 07), [the sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) (section 03, the `changed` push keys).
- **Depends on:** [080/30](../080_ui-and-client/30_client-shell-and-routing.md), [080/40](../080_ui-and-client/40_websocket-client.md).

# 04 Decisions
- Decided (claude, 2026-09-30): redraws are per part, keyed by the data hash of that part.

# 05 Notes & Analysis
## Watch out
- Diagrams and images above the reader change height after mounting; anchor to a heading, not to `scrollY`.
