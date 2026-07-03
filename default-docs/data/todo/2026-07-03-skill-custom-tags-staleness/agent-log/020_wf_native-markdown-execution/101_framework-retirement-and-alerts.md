---
title: "Framework — custom-tags deleted, GFM alerts shipped"
iteration: 1
agent: claude-opus-4-8
status: success
date: 2026-07-03
---

# Framework — custom-tags deleted, GFM alerts shipped

## Goal

Subtasks 10 + 20 in one agent (both touch `astro-doc-code/src/` and share the
build): remove the retired transformer code, then make `> [!NOTE]`-style GFM
alerts the rendering callout mechanism.

## Approach

- Full consumer-grep before deleting anything (registry, factories, types).
- `marked-alert` package over a hand-rolled extension, wired at the renderer
  factory level so all content types inherit it.
- Theme CSS strictly on declared variables; verification by direct renderer probe
  plus full production build.

## Result

- Deleted `src/custom-tags/` **and** `src/parsers/transformers/` — the
  `TagTransformerRegistry` had zero consumers outside the deleted module, so it
  went too. Orphaned `TagTransformer` type removed from `parsers/types.ts`;
  barrels and CLAUDE.md source tree cleaned; the dead `@custom-tags/*` tsconfig
  alias removed in the orchestrator's integration pass.
- `marked-alert@2.1.2` added to all three factories in
  `src/parsers/renderers/marked.ts` **and** to the editor preview's own
  client-side marked instance (`src/dev-tools/editor/renderer/index.ts`) — the
  preview renders independently, a wiring gap that would otherwise have shipped.
- Five alert styles in `src/styles/markdown.css`: NOTE→`--color-info`,
  TIP→`--color-success`, IMPORTANT→`--color-brand-primary`,
  WARNING→`--color-warning`, CAUTION→`--color-error`; `color-mix` tints so
  dark/light adapt from the same declared variables. Emitted classes verified:
  `.markdown-alert.markdown-alert-<type>` + `.markdown-alert-title`.
- Evidence: renderer probe shows all five types + plain blockquotes unaffected;
  `./start build` green (686 pages at that point).

## Next

Docs + skills sweeps land in parallel (milestone #2), then integration build.
