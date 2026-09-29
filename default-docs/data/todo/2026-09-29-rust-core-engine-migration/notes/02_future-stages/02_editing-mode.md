---
title: "Phase 2: editing mode in the reading view"
---

The current editor is **discarded**. Editing happens **in the same UI people read and review in**. When editing mode is on, the page changes only a little: a small edit control appears, and the content becomes editable in place. The view works like Obsidian's live preview: one panel, where the text you are editing shows as markdown and everything else stays rendered, diagrams included. The file on disk stays plain markdown.

# 03 References

- [Dev toolkit](./03_dev-toolkit.md) — where editing mode is switched on and off.
- [Multi-user editing and auth](./04_multi-user-editing-and-auth.md) — the later stage this builds towards.
- [Server and WebSocket](../01_initial_discussion/09_server-websockets-and-editing.md) — the live preview is rendered by Rust over the WebSocket.
- [2026-05-07-sidebar-state-persistence](../../../2026-05-07-sidebar-state-persistence/issue.md) — UI state caching that exists today.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the current editor (the separate `/editor` page) is discarded.
- Decided (sidhantha, 2026-09-29): editing happens in the reading and review UI, which changes slightly when editing is enabled.
- Decided (sidhantha, 2026-09-29): the editing view is a mixed markdown and rich view, like Obsidian: one panel, visualisations rendered, text edited as markdown.
- Decided (sidhantha, 2026-09-29): editing mode is switched on and off from the dev toolkit.
- Decided (sidhantha, 2026-09-29): editing mode belongs to phase 2. Phase 1 is rendering only.

# 05 Notes & Analysis

## 01 How it should feel

- Reading is the default. Nothing about the page suggests editing until editing mode is on.
- With editing on, a small edit option appears. Clicking into a block shows its markdown; leaving the block renders it again.
- Tables, diagrams and code blocks stay visual. Clicking one opens its source for editing.
- Formatting help (bold, headings, lists, links) inserts markdown. It never stores anything but markdown.
- Because the layouts are built block by block, mapping a rendered block back to its lines in the file should be simpler than in a general-purpose editor.

## 02 State to cache

Editing needs UI state kept between visits: which tabs were open, which were closed, scroll and cursor positions, collapsed sections. Some of this exists already (the sidebar state cache). The rest joins it.

## 03 Points from claude, not decided

- **"Discard the editor" can still reuse CodeMirror 6 underneath.** Obsidian's live preview is itself built on CodeMirror 6, using decorations that hide markdown syntax outside the active line. What gets discarded is the separate editor page and its UI, not necessarily the text engine. Worth deciding when phase 2 starts.
- **Saving** goes over the `/api` WebSocket to the Rust server. The server must not echo a just-saved file back as an outside change. The prior audit named this echo suppression as a known trap.
- **Preview must equal the real page.** The live preview is rendered by Rust over the WebSocket, the same renderer that renders every other page, so there is one renderer, not two. No WASM build is needed.
- **Phase 2 is single-user.** Two people editing the same file waits for [multi-user editing](./04_multi-user-editing-and-auth.md).
