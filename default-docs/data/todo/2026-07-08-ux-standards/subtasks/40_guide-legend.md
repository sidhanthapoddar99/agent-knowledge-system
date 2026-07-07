---
title: "Symbol legend into the Guide panel and user-guide"
status: review
---

Users should be able to decode every sidebar symbol without guessing. Add the status + file-type symbol legend where users look for it — and only there: the issue Guide panel and the user-guide. The dev-docs page (subtask `50_ux-standards-doc.md`) carries rationale and mechanism, not a duplicate legend (decided sidhantha, 2026-07-08).

- [x] **Guide panel legend.** Extend `src/layouts/issues/default/guide.ts` with the status icon set (grey checkbox / blue half-circle / blocked symbol / yellow review dot / green tick / red cross), the agent-log kind icons (lp/au/rf/it/wf), and the file-type glyphs (diagram, artifact; markdown unmarked).
- [x] **User-guide.** Add/extend the legend in `default-docs/data/user-guide/19_issues/` where the issue layout is documented.
- [x] **User-guide mention of docs-sidebar type icons.** The docs sidebar icons are a general feature, not issues-only — add a short mention where the user-guide documents the docs layout / first-class pages (diagram + artifact pages get a trailing type icon in the sidebar; markdown never does).
- [x] **Keep the skill in sync.** `guide.ts` and the `doc-issues` skill are coupled (skill = full manual, guide.ts = map) — mirror the legend addition into the skill's reference where the sidebar is described, in the same change.

**Decided (sidhantha, 2026-07-08):** the skill carries *no* UI-visual descriptions at all — the one existing type-marker line in `22_notes.md` was removed (repo source + installed cache) rather than extended. UI legends live in the Guide panel + user-guide only; rules/rationale in dev-docs `08_ux-standards.md`.
