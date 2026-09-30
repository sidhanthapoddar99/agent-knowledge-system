---
title: "Embeds"
description: "Paste another file's text into a page with an embed: code samples, diagram sources and reusable snippets that stay in step with their file."
---

# Embeds

An embed pastes another file's text into your page before agentks renders it. You write the file's path, relative to your page, inside double square brackets: `[[./assets/greet.py]]`. The page then always shows the file as it is now. Change the file, and every page that embeds it changes too.

Use an embed to:

- show a code or config file without copying it into the page;
- keep a diagram's source in its own file;
- reuse one snippet of markdown on several pages.

## Show a code file

Put the embed inside a fenced code block, and name the language on the fence:

~~~markdown
```python
\[[./assets/greet.py]]
```
~~~

This is the result, live from the file beside this page:

```python
[[./assets/greet.py]]
```

## Keep a diagram's source in its own file

A `mermaid`, `dot` or `graphviz` fence draws a diagram. Embed the source file inside the fence:

~~~markdown
```mermaid
\[[./assets/flow.mmd]]
```
~~~

The result:

```mermaid
[[./assets/flow.mmd]]
```

The `.mmd` file stays a plain diagram file. You can open it in any Mermaid editor, and a diff shows exactly what changed.

## Reuse a snippet of markdown

Outside a code block, the embedded text is read as markdown, as if you had typed it into the page. The file's extension does not matter. Keep a snippet you reuse in `assets/`, and embed it on its own line:

~~~markdown
\[[./assets/support-note.txt]]
~~~

The result:

[[./assets/support-note.txt]]

A file under `assets/` is never a page of its own, so the snippet needs no prefix and no frontmatter. A link inside the snippet is read from the snippet's own folder, so write it relative to the snippet file, not to the pages that embed it.

## The rules

| Rule | Detail |
|---|---|
| The path is relative to the file that holds the embed | Start it with `./` or `../`. A leading `/` is not a project path |
| Inside a fenced code block, only `./` and `../` paths embed | A path with a space or a comma is also left alone. So an example in a code block, such as `[[path]]`, stays as written |
| Inline code never embeds | A path in backticks, such as `[[./assets/greet.py]]` in this table, shows as written |
| A backslash shows the brackets | `\[[./assets/greet.py]]` prints as `[[./assets/greet.py]]`, inside a code block too |
| One level only | Embed syntax inside an embedded file is not expanded |
| Text files only | The file must be UTF-8 text. For an image, use image syntax |
| The page follows the file | When the embedded file changes, the page is rendered again |

## When the file is missing

A missing file is a content error that names your page and the line of the embed. Outside a code block, the embed stays visible on the page, marked as broken. Inside a code block, it stays as you wrote it. `agentks move` rewrites embed paths when a file moves, so moving files with it keeps embeds working.

## What an embed is not for

- **Images.** Use image syntax: `![A diagram of the flow](./assets/flow.png)`. See [assets and images](./25_assets-and-images.md).
- **Excalidraw and draw.io drawings.** These also use image syntax, and agentks draws them. See [diagrams in a page](./40_diagrams.md).
- **Links.** To send the reader to another page, link to it: [links](./15_links.md).
