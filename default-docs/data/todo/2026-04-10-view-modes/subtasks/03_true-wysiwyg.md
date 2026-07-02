---
title: "True WYSIWYG (future)"
status: open
---

Real WYSIWYG editing — no markdown syntax visible, formatting feels like Notion / Google Docs. Currently greyed out in the View menu as "Coming Soon".

> See [notes/01_wysiwyg-design.md](../notes/01_wysiwyg-design.md) for the design exploration (problem, candidate libraries, implementation plan, risks).

## Tasks

- [ ] Pick a library (ProseMirror / TipTap / Milkdown / BlockNote — see design note)
- [ ] Map markdown features (incl. custom tags) to editor schema
- [ ] Wire to existing Yjs CRDT sync
- [ ] Mode toggle (no content loss when switching to / from Source / Live Preview)
- [ ] Custom tag rendering (callouts, tabs, collapsible) as interactive blocks
- [ ] Replace the "Coming Soon" greyed menu item

## Notes

- Distinct from Live Preview (CM6 decorations that hide markers).
- Round-trip fidelity is the main risk — see notes for full risk list.
