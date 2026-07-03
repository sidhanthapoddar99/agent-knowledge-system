---
title: "Root cause — how :::callout got into 45 files"
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Root cause — how `:::callout` got into 45 files

## Goal

Trace the misinterpretation chain from the consumer-project incident back to its
origin: was the `:::` syntax ever real, where did the skill get it, and why did no
guardrail catch it?

## Approach

- Grep both skill trees for `:::` snippets; read the surrounding sections.
- Read the framework's actual transformers (`astro-doc-code/src/custom-tags/`) and
  grep the parser pipeline for any directive handling or registry wiring.
- Cross-check against the tracker's own history of this exact problem
  (docs-phase-2, 2026-04-20-custom-tags).

## Result

Three stacked failures, each confirmed with evidence:

- **The skill documents a syntax that never existed.** Both writing references show
  `:::callout{type="info"}` / `:::collapsible{…}` / `:::tabs` —
  `documentation-guide/references/writing.md:40` and
  `doc-issues/references/10_writing/10_writing.md:65`. No `:::` directive parser
  exists anywhere under `astro-doc-code/src/`.
- **The real syntax is the HTML-tag form.** `src/custom-tags/callout.ts` (header
  comment: `<callout type="info" title="Note">…</callout>`), `tabs.ts:105,172`
  (`tag: 'tabs'` / `tag: 'tab'`), `collapsible.ts:36` (`tag: 'collapsible'`).
- **Even the real syntax doesn't render.** `createCustomTagsRegistry()` in
  `src/custom-tags/index.ts` is imported by `src/parsers/transformers/index.ts` but
  never registered into any parser pipeline. The framework already knew: the
  user-guide custom-tags page was deleted on 2026-04-20 for exactly this reason
  (`2026-04-19-docs-phase-2/comments/004_custom-tags-removed.md`), with wiring
  tracked in `2026-04-20-custom-tags`. That fix was never propagated to the plugin
  skills — the skill reference reads as written against the intended/planned
  directive design and left behind when the work was parked.

Chain in one line: skill asserts fictional syntax → 24 agents follow it in good
faith → 45 files of `:::callout` markup → consumer papers over it with theme CSS
(`hermes-webui/callouts.css` in the consumer project).

## Next

Sweep the rest of both references for sibling staleness (milestone #2).
