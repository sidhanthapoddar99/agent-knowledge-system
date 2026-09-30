---
title: "Markdown pipeline — today's stages in Rust, on a syntax tree, same output"
status: in-progress
---

Rust renders every page body to HTML. The output must match today's engine: the same heading IDs, link targets and text, and the same element structure and classes the theme CSS styles. This leaf ports today's pipeline stage by stage into `agentks-render`, using comrak for markdown and working on comrak's syntax tree rather than regular expressions over HTML strings, so a stage cannot corrupt markup it did not mean to touch.

# 01 To Do
- [ ] **The stages, in today's order** ([02/03](../../notes/02_engine/03_rust-engine.md) section 04):

| Stage | Job | Today |
|---|---|---|
| Frontmatter | Split and parse; record its line count | frontmatter extraction |
| Code protection | Mask fenced and inline code | [code-protect.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/code-protect.ts) |
| Embeds | `[[path]]` inlining, dependency record, source spans ([020/40](../020_content-contract/40_embeds-and-dependencies.md)) | [asset-embed.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts) |
| Markdown | comrak: CommonMark + tables, task lists, strikethrough, autolinks, footnotes, GitHub alerts; raw HTML passed through | [marked.ts](../../../../../../agent-ks-engine/src/parsers/renderers/marked.ts) with `marked-alert` |
| Highlighting | Code blocks to spans with CSS classes; `data-language` on `<pre>` | Shiki |
| Heading IDs | Lowercase, tags and punctuation removed, spaces to `-`, repeated `-` collapsed, duplicates `-1`, `-2` | [heading-ids.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/heading-ids.ts) |
| Internal links | The resolver ([020/30](../020_content-contract/30_links-and-urls.md)) | [internal-links.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/internal-links.ts), [issue-body-links.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/issue-body-links.ts) |
| Asset URLs | Images and file links to `/content-assets/<path>` | [asset-src.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/asset-src.ts) |
| Diagram blocks | `mermaid` and `dot` fences to `<div class="diagram diagram-<kind>">` with the source; diagram-file embeds to the `data-src` form | [diagram-embed.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/diagram-embed.ts) |
| External links | `target="_blank"`, `rel="noopener noreferrer"` | [external-links.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/external-links.ts) |
| Tables | Wrap in `<div class="table-wrapper">` | [table-wrap.ts](../../../../../../agent-ks-engine/src/parsers/postprocessors/table-wrap.ts) |
| Outline | Headings with depth, ID and text | outline extraction |

- [ ] **Keep today's markup hooks** so the carried-over CSS still applies: task items (`li.task-item`, the checkbox span and SVG), alert blockquotes (the classes `marked-alert` emits), `pre[data-language]`, `.diagram.diagram-<kind>`, `.table-wrapper`. Any change to a hook is made together with the CSS in [100/10](../100_layouts/10_theme-contract-and-css.md) and listed as an expected difference.
- [ ] **Heading IDs**: do not use comrak's built-in header IDs; implement today's rule exactly and test it on every heading in the corpus.
- [ ] **The highlighter**: default candidate syntect with class output. First scan the corpus for every fence language (`rg -o '^```[a-zA-Z0-9_+-]+'` over `default-docs/data`) and check each is covered; list any fallback to plain text. `text` stays unhighlighted, as today. Record the choice in `04 Decisions`.
- [ ] **Pure and deterministic**: `render(input, context) -> Rendered { html, outline, embedded, errors }` with no I/O beyond reading embedded files through a passed-in reader. Same inputs, same bytes.
- [ ] **`render` for unsaved text** (Phase 2 live preview): the same function on a string the editor sends, with the file's path as context ([110/00 editing](../110_editing/00_overview.md)).
- [ ] **Compare with the corpus**: every page's headings, IDs, link targets, text, code and tables against [020/10](../020_content-contract/10_golden-fixtures.md).

## Guardrails
- No regular expressions over HTML strings in post-processing. Walk the syntax tree.
- Raw HTML the author wrote is passed through unchanged, as today. No sanitising of content the author controls.
- No MDX and no custom tags. Unknown syntax renders as text.

## Done when
- Zero unexpected differences on the corpus comparison for headings, IDs, link targets, text, code text and tables.
- Rendering the same page twice gives identical bytes.
- An uncached render of a typical page is under 5 ms on a laptop (today's Go prototype measured 1.83 ms p50); record the p50 and p95 here.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** crate `agentks-render`.
- **Read first:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) sections 04 and 10; [02/01 Content format](../../notes/02_engine/01_content-format.md) section 06; today's [pipeline.ts](../../../../../../agent-ks-engine/src/parsers/core/pipeline.ts), [base-parser.ts](../../../../../../agent-ks-engine/src/parsers/core/base-parser.ts) and every file linked in the table; the default theme's [markdown.css](../../../../../../agent-ks-engine/src/styles/markdown.css) (what the hooks style).
- **Depends on:** [40](./40_site-index.md), [020/30](../020_content-contract/30_links-and-urls.md), [020/40](../020_content-contract/40_embeds-and-dependencies.md).
- **Unblocks:** [80](./80_page-data-interface.md), [040/10](../040_caching/10_cache-keys-and-dependencies.md), [110/00 editing](../110_editing/00_overview.md) (live preview renders through it).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): Rust renders page bodies; routes, heading IDs, links and text match today's engine exactly.
- Decided (sidhantha, 2026-09-29): highlighting is done in Rust and emits CSS classes, so light and dark come from the theme ([02/01](../../notes/02_engine/01_content-format.md) section 06).
- Proposed (claude, 2026-09-30, from [02/03](../../notes/02_engine/03_rust-engine.md)): comrak for markdown; syntect as the highlighter candidate.

# 05 Notes & Analysis
## Watch out
- Shiki colours today come from its themes; class-based highlighting changes code colours slightly. That is an allowed visual change, but the code **text** must match.
- The built-in theme's `markdown.css` (`apps/agentks-engine/themes/default/`) still styles Shiki's output (`.shiki`, `--shiki-dark`). The highlighter's class names and the rules for them land together: [100/10](../100_layouts/10_theme-contract-and-css.md) replaces the Shiki rules once the classes are fixed here.
- comrak's alert syntax support and its output classes differ from `marked-alert`'s; wrap or post-process the node to emit today's classes.
