---
title: "Markdown"
description: "The markdown agentks reads: CommonMark with the GitHub extensions, callouts, highlighted code blocks and collapsible parts."
---

# Markdown

Every agentks page is plain markdown in a `.md` file. agentks reads CommonMark, the standard markdown, plus the extensions GitHub added. So a page that reads well on GitHub reads well in agentks, and the other way round. This page lists what you can use and shows the parts that need an example.

There is no MDX and there are no components. Anything richer than markdown is a diagram, an embed or an HTML artifact, each explained in its own page of this section.

## What you can use

| Feature | Write | Notes |
|---|---|---|
| Headings | `## Section` | See [headings and the outline](./10_headings-and-outline.md) |
| Emphasis | `*italic*`, `**bold**`, `~~struck~~` | Strikethrough is a GitHub extension |
| Lists | `- item`, `1. step` | Indent to nest |
| Task lists | `- [ ] open`, `- [x] done` | Drawn as check boxes |
| Tables | Cells between pipes, and a row of dashes under the header | A GitHub extension. This page uses several |
| Links and images | `[text](./page.md)`, `![alt](./assets/shot.png)` | Always relative. See [links](./15_links.md) and [assets](./25_assets-and-images.md) |
| Bare web addresses | `https://example.com` | Become links on their own |
| Footnotes | `a claim[^1]` and `[^1]: the source` | Collected at the end of the page |
| Callouts | `> [!NOTE]` | Five types, below |
| Code | `` `inline` `` and fenced blocks | Highlighted, below |
| Collapsible parts | `<details>` and `<summary>` | Below |
| Raw HTML | Any HTML tag | Passed through exactly as written |

## Callouts

A callout is a quote block whose first line names its type. agentks draws it as a labelled, coloured panel. On GitHub or in any other markdown viewer it still reads as a quote.

```markdown
> [!NOTE]
> Useful context the reader can skip.

> [!WARNING]
> A caveat that avoids a problem.
```

| Type | Use it for |
|---|---|
| `[!NOTE]` | Neutral context and asides |
| `[!TIP]` | Advice and shortcuts |
| `[!IMPORTANT]` | Something the reader must not miss |
| `[!WARNING]` | A caveat that avoids trouble |
| `[!CAUTION]` | A risky action and what it costs |

Put the type on its own first line. Start every following line with `>`. Markdown works inside: bold text, code, links, lists and more than one paragraph.

> [!TIP]
> This is a live callout. Its source is three lines of markdown.

## Code blocks

Fence a code block with three backticks and name its language. agentks highlights it, and the colours follow the site theme in light and dark mode.

````markdown
```bash
agentks check section data/guide
```
````

A block with no language shows as plain text. To show a code block inside a code block, make the outer fence longer (four backticks) or use tildes (`~~~`) for it. The closing fence must use the same character, at least as many times as the opening one.

To show a whole file from the project in a code block, embed it instead of copying it. The page then always shows the current file. See [embeds](./20_embeds.md).

## Collapsible parts

Use the HTML `<details>` and `<summary>` tags. Leave a blank line after `</summary>`, so the text inside is read as markdown.

```markdown
<details>
<summary>Show the full output</summary>

The long part goes here. **Markdown** works.

</details>
```

Add `open` to the tag, `<details open>`, to start it expanded.

## Raw HTML

agentks passes the HTML you write through unchanged. It does not clean or rewrite it. Two things follow:

- Use markdown syntax for links and images to files in the project. agentks turns those into the right URLs. A path you write inside an HTML tag stays exactly as you wrote it.
- Only paste HTML you trust. It runs in the page as your own content.

For a page that is mostly HTML, such as a dashboard or a designed report, write an [artifact page](./50_artifact-pages.md) instead.

## Diagrams

A fenced block tagged `mermaid`, `dot` or `graphviz` becomes a drawn diagram. Excalidraw and draw.io files go in with image syntax. [Diagrams in a page](./40_diagrams.md) covers all four.

## Good habits

1. Keep paragraphs short, with one idea each.
2. Use a table or a list when it is clearer than prose.
3. Give every image alt text that says what it shows.
4. Put commands, file names and values in code, so they can be copied.
5. Prefer an embed over a copy when you show a file from the project.
