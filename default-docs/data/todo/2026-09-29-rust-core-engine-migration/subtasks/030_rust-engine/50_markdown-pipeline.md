---
title: "Markdown pipeline — today's stages in Rust, on a syntax tree, same output"
status: review
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
Review. The pipeline is built and tested in crate `agentks-render` (wave 2, branch `wave2/render`). The full corpus comparison with the golden fixtures of [020/10](../020_content-contract/10_golden-fixtures.md) is still to run, because those fixtures do not exist yet.

## Result
- `render_markdown` splits the frontmatter with `agentks_content::split_frontmatter` and calls `render_body`. `render_body(source, body, first_line, BodySources { links, files }, sink)` runs the rest. It returns `BodyRender { body: RenderedBody { body_html, outline, diagrams }, embedded }`. Links resolve through the trait `LinkResolver`, which `SiteIndex` implements, so the pipeline can be tested with a small resolver.
- Code lives in `crates/render/src/markdown/`: `embed.rs` and `scan.rs` (code protection and embeds), `source_map.rs`, `html.rs` (one comrak formatter for headings, code, links, images, tables, task items and alerts), `slug.rs` (heading ids), `highlight.rs` (syntect plus two-face, emitting `hl-` classes; `highlight_css()` gives the light and dark colours), `diagram_embed.rs`, `links.rs` and `alert_icons.rs`.
- The kept markup hooks: `li.task-item` (with `task-checked`, `.task-checkbox`, `.task-content` and the same SVG), `.markdown-alert.markdown-alert-<kind>` with the same icon SVGs, `pre[data-language]`, `.diagram.diagram-mermaid`, `.diagram.diagram-graphviz`, `.diagram-excalidraw`, `.diagram-drawio` and `.table-wrapper`.
- Heading ids follow today's rule, quirks included (`A & B` gives `a-amp-b`, `Don't` gives `don39t`). A one-off check compared the Rust ids with today's marked plus slug rule on all 1,463 markdown files of the old repository. 1,462 matched. The one difference came from the probe: it skipped the embed pass. The page is `2026-04-10-editor-diagrams` notes/02, where today's engine also embeds into the heading.
- Fence languages: every language the corpus uses has a grammar. `astro` is highlighted as HTML, `jsonc` as JSON, `env` as dotenv, and `text` stays plain. A test checks this list.
- Speed (release build, warm, the 1,463 corpus files through `render_body`): p50 61 µs, p95 3.0 ms, max 20 ms. Rendering twice gives identical bytes (a test checks this).
- Tests: `cargo test -p agentks-render` runs 28 tests in about 1 s. `./ctl gate` is green.

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
- Decided (claude, 2026-10-01): syntect with its pure-Rust regex engine plus two-face (bat's grammars and themes) is the highlighter. It emits `hl-`-prefixed classes inside `<pre data-language="…" class="highlight"><code>`, because bat's set covers every corpus fence language and the prefix keeps the classes apart from page classes. The grammar is picked from the first word of the info string. `data-language` keeps the whole info string, as today.
- Decided (claude, 2026-10-01): the code colours are GitHub (light) and One Half Dark (under `[data-theme="dark"]`). `highlight_css()` generates them and the theme compiler adds them in the `elements` layer, because code needs colours now and the theme track can still override them in `user`.
- Decided (claude, 2026-10-01): links resolve through a `LinkResolver` trait in this crate, which `SiteIndex` implements, because the index cannot be built in this track and the pipeline must be testable. Empty, `#…` and `//…` hrefs stay as written without asking the resolver. `http(s)://` and `//` links get `target="_blank" rel="noopener noreferrer"`. A `/` link stays as written and is reported as `link-form`. Any other miss renders `<a class="broken-link" data-href="…" title="reason">` with no href, because a browser-relative href is the defect this migration removes.
- Decided (claude, 2026-10-01): diagram blocks get the element id `Diagram-N`, starting at 1, for `DiagramRef.id`. The capital letter means no heading id can clash with it. A dot or graphviz fence keeps today's class `diagram-graphviz` and reports `lang: dot`.
- Decided (claude, 2026-10-01): a diagram-file image (`.excalidraw`, `.drawio`) renders `<div class="diagram diagram-<kind>" id="Diagram-N" data-src="<asset URL>" data-title="…">`. When the file is a diagram page, `data-page` holds the page URL instead of `data-src`. The `?v=<mtime>` parameter is dropped, because the file is not a render dependency and the server owns asset caching.
- Decided (claude, 2026-10-01): raw HTML is passed through untouched. Today's regex passes also rewrote raw `<img src>`, added `target` to raw `<a>`, wrapped raw `<table>` and gave raw headings ids. Those are expected differences. The corpus has only one raw `<img>`, and it sits inside a code example.
- Decided (claude, 2026-10-01): the outline text is plain decoded text (`A & B`), not today's escaped inner HTML (`A &amp; B`), because the outline is JSON data that the client shows as text.
- Decided (claude, 2026-10-01): footnotes are on, as the content-format note says. marked had no footnotes, so `[^1]` rendering is an expected difference.

# 05 Notes & Analysis
## Watch out
- Shiki colours today come from its themes; class-based highlighting changes code colours slightly. That is an allowed visual change, but the code **text** must match.
- The built-in theme's `markdown.css` (`apps/agentks-engine/themes/default/`) still styles Shiki's output (`.shiki`, `--shiki-dark`). The highlighter's class names and the rules for them land together: [100/10](../100_layouts/10_theme-contract-and-css.md) replaces the Shiki rules once the classes are fixed here.
- comrak's alert syntax support and its output classes differ from `marked-alert`'s; wrap or post-process the node to emit today's classes.
