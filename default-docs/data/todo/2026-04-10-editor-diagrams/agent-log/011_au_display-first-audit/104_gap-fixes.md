---
title: "M4 — gap fixes: dev-docs internals written, skills de-historied, lean-skills rule"
iteration: 4
agent: claude
status: done
date: 2026-07-04
---

## Goal

Review feedback from sidhantha on the audit report: don't just list the
gaps — close them. Dev-docs must document the diagram internals (structure,
conversion, caching, resolution, and a standard method for adding more
embed types); the skill must show the meta.json structure; skills must stop
narrating history (his example: the "pages written before 2026-07 carry
retired tags" notes); codify both principles in CLAUDE.md.

## Approach

**Dev-docs (4 pages updated):**

- `04_parser/01_overview.md` — file-structure block was itself stale: still
  listed the deleted `diagrams.ts` postprocessor, missed
  `excalidraw-embed.ts`; fixed, asset-src comment now says img **and** href.
- `04_parser/06_post-processing.md` — the big one: files table completed;
  new sections for **Excalidraw Embeds** (match → resolve/verify →
  `?v=<mtimeMs>` cache-bust → client render, and why reference-based),
  **Asset Sources** (img+href rewrite rules, skip list, `/content-assets/`
  serving + dev no-cache/ETag vs prod immutable), **Issue Body Links**,
  **Table Wrap**; processing order corrected to the real registration with
  the load-bearing "excalidraw-embed before asset-src" rule; new **"Adding
  a New Embed Type — the Excalidraw Pattern"** section (4-piece recipe:
  postprocessor, diagrams.ts branch, mime entry, optional DIAGRAM_KINDS
  registration — plus the anti-patterns: no inlining, no build-time render,
  no new syntax).
- `05_architecture/03_data-loading.md` — new **"Diagram Pages"** section:
  second scan merged into `loadContent()` (docs only), DIAGRAM_KINDS, the
  same-container trick, prefix/assets/sidecar/collision/opt-out rules,
  cache-dependency wiring; `FileType` union updated with `'diagram'`.
- `15_scripts/10_diagrams.md` — excalidraw added end-to-end: supported
  sources table, `renderExcalidraw()` flow (no-cache fetch → ETag 304 →
  `exportToSvg`), caption + open-file link, `@excalidraw/utils` + clsx
  dependency gotchas, caption counter-invert in dark mode.

**User guide:** verified already complete — `06_diagram-pages.md` carries
the full meta.json example; no changes needed.

**Skills (repo + cache, parity re-verified byte-identical):**

- `docs-layout.md` — sidecar prose expanded with the concrete
  `XX_name.meta.json` JSON example.
- History purged per the new rule: legacy-content paragraphs deleted from
  `writing.md` and doc-issues `10_writing.md`; the `state:`-field history
  parenthetical deleted from `23_subtasks.md`; `cli-toolkit.md`'s
  legacy-tags row now points at `doc-migration.md` instead of dating
  content. (Kept: the `-` separator tolerance and deprecated-label notes —
  current loader behavior, not history.) The audit's soft note on
  "first-class" phrasing in `10_writing.md` fixed in the same pass.

**CLAUDE.md:** two new rules — the user-guide vs dev-docs audience split
(usage vs internals, features owe a page on both sides), and **"Skills are
lean and history-free"** (current system only; history → git/tracker,
format transitions → `migration/` scripts with `doc-migration.md` as the
one legitimate legacy-speaking reference; delete historical asides on
sight).

## Result

Full production build green — 732 pages. Skills repo↔cache parity OK.
Audit triage items 2 (dev-docs gaps ×6) and the cosmetic phrasing note are
closed; code findings (item 1) and user-guide audience-split moves (item 3)
remain open for sidhantha's call.
