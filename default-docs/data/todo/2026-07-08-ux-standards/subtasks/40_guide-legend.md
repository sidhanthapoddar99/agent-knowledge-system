---
title: "Symbol legend into the Guide panel and user-guide"
status: open
---

Users should be able to decode every sidebar symbol without guessing. Add the status + file-type symbol legend where users look for it — and only there: the issue Guide panel and the user-guide. The dev-docs page (subtask `50_ux-standards-doc.md`) carries rationale and mechanism, not a duplicate legend (decided sidhantha, 2026-07-08).

- [ ] **Guide panel legend.** Extend `src/layouts/issues/default/guide.ts` with the status icon set (grey checkbox / blue half-circle / blocked symbol / yellow review dot / green tick / red cross), the agent-log kind icons (lp/au/rf/it/wf), and the file-type glyphs (diagram, artifact; markdown unmarked).
- [ ] **User-guide.** Add/extend the legend in `default-docs/data/user-guide/19_issues/` where the issue layout is documented.
- [ ] **Keep the skill in sync.** `guide.ts` and the `doc-issues` skill are coupled (skill = full manual, guide.ts = map) — mirror the legend addition into the skill's reference where the sidebar is described, in the same change.
