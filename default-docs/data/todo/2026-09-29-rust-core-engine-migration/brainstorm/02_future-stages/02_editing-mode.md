---
title: "Phase 2: editing mode in the reading view"
---

The current editor page is **discarded**. Editing happens **in the same UI people read and review in**. The dev toolbar, a bar like Astro's, has an **Edit** option. On a page that can be edited, choosing it makes the page's content area editable in place. The view works like Obsidian's live preview: one panel, where the text you are editing shows as markdown and everything else stays rendered, diagrams included. There are **two modes only, raw and live preview**; with editing off, the page is simply read-only. The file on disk stays plain markdown.

The main editor of agentks content is an AI. Human editing is for small tweaks and for dumping an idea into a note, so it edits existing files only: no new-file command, no advanced editing tools, no separate navigation.

# 03 References

- [Dev toolkit](./03_dev-toolkit.md) — where editing mode is switched on and off.
- [Multi-user editing and auth](./04_multi-user-editing-and-auth.md) — the later stage this builds towards.
- [Server and WebSocket](../01_initial-discussion/09_server-websockets-and-editing.md) — the live preview is rendered by Rust over the WebSocket.
- [2026-05-07-sidebar-state-persistence](../../../2026-05-07-sidebar-state-persistence/issue.md) — UI state caching that exists today.
- [2026-04-10-view-modes](../../../2026-04-10-view-modes/issue.md) — closed on 2026-09-30: live preview is built; the other modes are not needed.
- [2026-04-10-editor-navigation-and-layout](../../../2026-04-10-editor-navigation-and-layout/issue.md) — dropped on 2026-09-30: no IDE-style navigation.
- [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md) — editing diagrams in place, with multi-user presence.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the current editor (the separate `/editor` page) is discarded.
- Decided (sidhantha, 2026-09-29): editing happens in the reading and review UI, which changes slightly when editing is enabled.
- Decided (sidhantha, 2026-09-29): the editing view is a mixed markdown and rich view, like Obsidian: one panel, visualisations rendered, text edited as markdown.
- Decided (sidhantha, 2026-09-29): editing mode is switched on and off from the dev toolkit.
- Decided (sidhantha, 2026-09-29): editing mode belongs to phase 2. Phase 1 is rendering only.
- Decided (sidhantha, 2026-09-30): the dev toolbar is a bar, like Astro's dev toolbar, with an Edit option. On a page that can be edited, Edit makes the content area editable in place.
- Decided (sidhantha, 2026-09-30): two modes only: raw and live preview. Read-only is editing switched off. No preview page, no WYSIWYG mode, no view-only mode.
- Decided (sidhantha, 2026-09-30): no separate navigation for editing. Two navigation systems add mental overhead: no tabs, file explorer, sidebars or split views.
- Decided (sidhantha, 2026-09-30): the main editor is an AI. Human editing is for small tweaks and dumping ideas into a note, so it edits existing files only: no new file, no advanced editing options.
- Decided (sidhantha, 2026-09-30): the live preview mode already built is the base, to be improved, not rebuilt.
- Decided (sidhantha, 2026-09-30): editing diagrams in place (Excalidraw, tldraw, Mermaid, draw.io-style), with multi-user presence, is wanted. Tracked in [2026-04-10-editor-diagrams](../../../2026-04-10-editor-diagrams/issue.md).

# 05 Notes & Analysis

## 01 How it should feel

- Reading is the default. Nothing about the page suggests editing until Edit is chosen in the dev toolbar.
- With editing on, the editable area of the page becomes editable in place. Clicking into a block shows its markdown; leaving the block renders it again. Raw mode shows the whole file as markdown.
- Tables, diagrams and code blocks stay visual. Clicking one opens its source for editing.
- Formatting help (bold, headings, lists, links) inserts markdown. It never stores anything but markdown.
- Because the layouts are built block by block, mapping a rendered block back to its lines in the file should be simpler than in a general-purpose editor.

## 02 State to cache

Editing needs a little UI state kept between visits: whether editing is on, raw or live preview, scroll and cursor positions, collapsed sections. There are no editor tabs to remember, because editing happens on the page itself. Some of this state exists already (the sidebar state cache). The rest joins it.

## 03 Points from claude, not decided

- **The existing live preview is reused.** It is built on CodeMirror 6 decorations that hide markdown syntax outside the active line, the same technique Obsidian uses. What gets discarded is the separate editor page and its UI; the text engine carries over and is improved (decided 2026-09-30).
- **Saving** goes over the `/api` WebSocket to the Rust server. The server must not echo a just-saved file back as an outside change. The prior audit named this echo suppression as a known trap.
- **Preview must equal the real page.** The live preview is rendered by Rust over the WebSocket, the same renderer that renders every other page, so there is one renderer, not two. No WASM build is needed.
- **Phase 2 is single-user.** Two people editing the same file waits for [multi-user editing](./04_multi-user-editing-and-auth.md).
