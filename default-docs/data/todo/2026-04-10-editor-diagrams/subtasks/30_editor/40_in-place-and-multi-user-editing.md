---
title: Edit diagrams in place, with multi-user presence
status: open
---

Diagrams should be editable right where they are read, in the same in-place editing mode as markdown, and several people should be able to edit one diagram together, seeing each other's presence. Formats: Excalidraw, tldraw, Mermaid and draw.io-style diagrams. Asked for by sidhantha on 2026-09-30, while settling the new editing mode.

# 01 To Do
- [ ] Single-user, in place: clicking a diagram in edit mode opens its editor on the page (a canvas for Excalidraw, tldraw and draw.io; source with live render for Mermaid)
    - [ ] Save back to the diagram's own file (`.excalidraw`, `.mmd`, `.drawio`, a tldraw file) or to the fenced block it came from
- [ ] Multi-user: several people edit one diagram at once, with presence (who is here, their cursor or selection)
- [ ] Decide whether tldraw joins the supported diagram formats for display too, not only editing

## Guardrails
- Editing happens in place from the dev toolbar's Edit option. No separate editor page and no separate navigation ([editing mode](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/02_editing-mode.md)).
- The file on disk stays the diagram's own format, readable and editable outside agentks.
- Multi-user editing needs auth first ([multi-user editing and auth](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/04_multi-user-editing-and-auth.md)).

## Questions
- Is single-user in-place diagram editing part of Phase 2, with the multi-user half in the later multi-user stage? Claude suggests yes: the single-user half needs only editing mode; the multi-user half needs auth.

## Done when
- A diagram of each supported format can be edited in place and saved to its own file.
- Two signed-in people can edit one diagram at once and see each other's presence.

# 02 Status and Result
Open. Waits for the engine migration's editing mode (Phase 2) and, for the multi-user half, its multi-user stage.

## Result
None yet.

## Agent log
none

# 03 References
- [Editing mode](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/02_editing-mode.md) — in-place editing, raw and live preview.
- [Multi-user editing and auth](../../../2026-09-29-rust-core-engine-migration/brainstorm/02_future-stages/04_multi-user-editing-and-auth.md) — `yrs` on the server, presence, auth first.
- [The Excalidraw plan](../../notes/01_excalidraw.md) — the existing editor plan, including Yjs sync.
- [30_excalidraw](./30_excalidraw.md) — the existing single-format editing subtask this extends.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): diagrams (Excalidraw, tldraw, Mermaid, draw.io-style) should be editable in place, with multi-user presence.

# 05 Notes & Analysis
## 01 Why here, not a new issue
This issue already owns diagram editing (the `30_editor` group), and its Excalidraw plan already includes shared sync. A separate issue would split one piece of work across two homes.
