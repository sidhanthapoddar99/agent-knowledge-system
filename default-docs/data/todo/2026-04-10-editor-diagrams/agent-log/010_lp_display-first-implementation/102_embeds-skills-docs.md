---
title: "M2 — embeds group closed out (skills + user-guide docs)"
iteration: 2
agent: claude
status: done
date: 2026-07-03
---

## Goal

I3 of the task list: teach the now-stable embed syntax in the plugin skills
and the user-guide, closing group `10_embeds/`.

## Approach

- **User-guide** `15_writing-content/03_asset-embedding.md`: added a
  "Diagram source" example (fence + `[[./…]]`, with the `./`/`../` rule) and
  replaced the stale "one extension pattern" section — which promised a
  future `[[x.excalidraw]]` embed — with **"Two embed mechanisms"**:
  `[[path]]` = raw text inlining (code, config, mermaid/dot source) vs image
  syntax = render-by-reference (images natively, excalidraw scenes), plus
  plain-link behaviour, the new `<a href>` colocated-file rewrite, and error
  semantics.
- **Skills**: `agent-ks-docs/references/writing.md` (Diagrams block +
  colocated-assets bullet) and `agent-ks-issues/references/10_writing/10_writing.md`
  (Diagrams + Assets sections, live-demo pointer) — mirrored to the installed
  plugin cache, diff-verified in sync.

## Result

Build green (716 pages) with the updated user-guide page rendering.
`10_embeds/40_skills.md` and `50_documentation.md` → **review**. Group
`10_embeds/` is now fully in the Review category (3 subtasks review / 2 done
by human) — no open work left in the group.

## Next

I4 — first-class loader foundation on the mermaid pathfinder
(`20_first-class/10_mermaid.md`): widen the docs glob with per-section
opt-out, explicit `assets/` exclusion, diagram content handler, optional
`XX_name.meta.json` sidecar, slug-collision error, sidebar integration.
