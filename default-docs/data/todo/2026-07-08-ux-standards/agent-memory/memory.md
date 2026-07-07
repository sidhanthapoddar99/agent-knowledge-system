---
title: "Agent memory — index"
---

One line per topic; read this first.

- All seven status glyphs pre-existed in `src/layouts/issues/default/server/state-icon.ts` — the 2026-07-08 work added only colors, tooltips (`STATUS_LABELS` in `src/loaders/issue-status.ts`), and the shared type-glyph module `src/layouts/file-type-icons.ts`; don't re-add glyphs.
- `open`/`blocked` deliberately stay neutral grey (resting states) — decided by sidhantha 2026-07-08; don't tint them.
- The `doc-issues` skill deliberately carries **no** UI-visual descriptions (removed 2026-07-08 per user) — UI legends belong to the Guide panel + user-guide, rules to dev-docs `08_ux-standards.md`.
- Pixel/screenshot verification is blocked on this machine: playwright MCP wants the Chrome channel, only bundled Chromium exists — verify at DOM/CSS level via `./start preview` + curl.
