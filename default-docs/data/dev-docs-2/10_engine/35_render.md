---
title: "Render: the markdown pipeline"
description: "agentks-render: how one markdown file becomes body HTML, an outline and a list of diagrams, stage by stage."
---

`agentks-render` (layer 4) turns one markdown file into its body HTML, its outline and its list of diagram blocks. It also compiles the project's theme stylesheet, which has [its own page](./40_theme-compiler.md). It depends on `agentks-core`, `agentks-config`, `agentks-api`, `agentks-content` and `agentks-index`.

Rust renders page **bodies**, not page layouts. The body HTML goes into the page data, and a layout component in the browser places it.

## The contract

- **Pure.** The same inputs give the same bytes. That is what makes caching by hash, and the static build, safe.
- **Files only through a `FileSource`**, for embeds.
- **Links only through a `LinkResolver`**, which the site index implements. The renderer never builds a URL itself and never guesses a link target.
- **No layouts, and no sanitising.** Raw HTML the author wrote passes through as written.

## Entry points

```rust
pub fn render_markdown(
    source: &RelPath,               // the page's path: links resolve from it
    text: &str,                     // the whole file, or unsaved text for the live preview
    context: &RenderContext<'_>,    // the config, the index, the files
    sink: &mut ErrorSink,           // content problems go here
) -> Result<Rendered, RenderError>;
```

`Rendered` holds the frontmatter, the body (`body_html`, `outline`, `diagrams`) and `embedded`: every file the body embeds, with its hash. That list becomes part of the page's render key, so a page is re-rendered when a file it embeds changes.

`render_body` does the same for text that has already had its frontmatter split off. `render_markdown` is also what renders unsaved text for the live preview while editing, so the preview is exactly the page the file would produce.

## The stages

The stages run in a fixed order:

| Stage | Where | What it does |
|---|---|---|
| Frontmatter | `render_markdown` | Splits the YAML header off with the content crate's `split_frontmatter`, and records the line where the body starts |
| Code protection and embeds | `embed.rs`, `scan.rs` | One pass over the text. Replaces each `[[path]]` with the file's text, leaving code alone. Returns the embedded files with their hashes, and a source map |
| Markdown | `mod.rs` | comrak parses CommonMark with tables, task lists, strikethrough, autolinks, footnotes and GitHub alerts. Raw HTML passes through |
| The writer | `html.rs` | One formatter over comrak's syntax tree writes the HTML and, on the way, does every later stage below |
| Heading IDs and the outline | `slug.rs` | Gives each heading its ID and collects the headings with their IDs |
| Highlighting | `highlight.rs` | Wraps code tokens in `hl-` classes |
| Diagram blocks | `html.rs` | Turns `mermaid` and `dot` fences into diagram blocks the browser draws |
| Links and images | `links.rs` | Resolves each target through the resolver and writes the final href |
| Diagram-file embeds | `diagram_embed.rs` | An image whose target is an `.excalidraw` or `.drawio` file becomes a placeholder the browser fills |
| External links, tables, task items, alerts | `html.rs` | Marks links that leave the site, wraps tables for horizontal scroll, writes task items and alert boxes with their icons |

**Post-processing works on the syntax tree, not on HTML strings.** No stage rewrites HTML with regular expressions, so a stage cannot corrupt markup it did not mean to touch.

## Embeds

The embed pass follows these rules:

- Outside code, `[[path]]` is replaced by the file's text, with trailing white space trimmed. The path is relative to the page.
- Inline code spans are left alone.
- Inside fenced blocks only `./` and `../` paths embed, and a path holding a space or a comma is left alone. A diagram fence can pull in its source file, and documentation examples stay literal.
- `\[[path]]` prints as `[[path]]`.
- **One level only.** Embed syntax inside an embedded file is not expanded.
- A missing file is an `embed-missing` error with the page and line. Outside code the token stays visible inside a broken marker.

Because embedded text becomes part of the page, a link inside it must resolve from the embedded file, and an error in it must name the embedded file. The source map records which file and line each run of the expanded text came from, and every later stage reads it.

## Heading IDs

The ID of a heading is built from its inner HTML, with a fixed escaping, then lower-cased, with tags and punctuation removed, spaces turned into `-` and repeated `-` collapsed. A repeated ID gets `-1`, `-2` and so on. The escaping is visible in some IDs: `A & B` becomes `a-amp-b`. Keep the rule exactly as it is. Links across every project point at these IDs, and a changed rule breaks them all.

## Highlighting

syntect parses each code block with two-face's grammars and wraps every token in a `<span class="hl-…">`. The colours are not in the HTML. `highlight_css` writes the rules for the `hl-` classes, a light set and a `[data-theme="dark"]` set, and the theme compiler adds them to the project stylesheet. So a theme switch never re-renders a page. A fence named `text` is not highlighted.

## Markup hooks

Themes style the body through stable class names and attributes. Renaming one breaks every theme that uses it, so each is part of the theme contract.

| Hook | On |
|---|---|
| `pre[data-language]`, `pre.highlight` and `hl-` spans | Code blocks |
| `.diagram.diagram-<kind>` with `id="Diagram-N"` | Diagram blocks |
| `.markdown-alert.markdown-alert-<kind>`, `.markdown-alert-title` | Alerts |
| `li.task-item`, `task-checked`, `.task-checkbox`, `.task-content` | Task list items |
| `.table-wrapper` | Tables |
| `a.broken-link[data-href]`, `img.broken-image[data-src]`, `span.embed-missing` | Broken references |
| `data-page` | A diagram-file embed that names a diagram page |

## Errors

Content problems go to the sink with their file and line: a missing embed, a link with no target, a `/` link. The body still renders, and marks each problem in place with a broken marker. Nothing is pointed at a guessed target.

## Tests

```bash
cargo test -p agentks-render
```

The pipeline tests run through `render_body` with an in-memory map of files and a small resolver of their own.

## Related

- [The theme compiler](./40_theme-compiler.md): the other half of this crate.
- [The site index](./30_index.md): the resolver behind every link.
- [Keys and invalidation](../20_caching/05_keys-and-invalidation.md): how `embedded` becomes part of the render key.
