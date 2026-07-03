---
title: "UI components library"
status: dropped
---

> **Dropped 2026-07-03** (sidhantha) — superseded by the native-markdown-only decision
> ([2026-07-03-skill-custom-tags-staleness/brainstorm/01](../../2026-07-03-skill-custom-tags-staleness/brainstorm/01_discuss_native-markdown-only.md)):
> the custom-tag components this library would showcase are being retired, not wired.
> The badges/buttons fragment is deliberately let go entirely — chrome-like elements
> don't belong in authored markdown on an AI-first platform.

Absorbed from `2025-06-25-components/subtasks/03_components-library.md` on 2026-04-20. Scope: the built-in custom tags (callout / tabs / collapsible) and related UI primitives (badges, buttons), plus the showcase / live-examples / theme-testing work.

## Tasks

- [x] Cards (info, warning, tip, danger) — implemented as `<callout>` transformer at `src/custom-tags/callout.ts` (5 types: info / warning / tip / danger / note)
- [ ] Badges and labels
- [ ] Buttons and button groups
- [x] Tabs component — implemented as `<tabs>` / `<tab>` transformers at `src/custom-tags/tabs.ts`
- [x] Accordion / collapsible — implemented as `<collapsible>` transformer at `src/custom-tags/collapsible.ts`
- [ ] Component showcase / gallery page
- [ ] Component documentation with live examples
- [ ] Test components across different themes


> [!NOTE] 
>The three ticked items are implemented in code but **not wired into any parser pipeline** — wiring lives in `2026-04-19-knowledge-graph-and-wiki-links/subtasks/01_unified-pipeline-and-graph.md` (hard dependency). Nothing in this subtask renders until that wiring lands.
>
>Badges and buttons are open questions — they may not belong as custom tags at all (could be pure CSS utility classes in the theme layer). Revisit when getting to them.
