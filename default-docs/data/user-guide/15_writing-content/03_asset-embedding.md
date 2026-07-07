---
title: Asset Embedding
description: How to embed file contents using the [[path]] syntax
sidebar_position: 3
---

# Asset Embedding

The `[[path]]` syntax lets you embed one file's contents into another during preprocessing. The pattern is replaced with the actual file content before the markdown is rendered.

## How It Works

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  Markdown   │     │  Preprocessor   │     │   Output    │
│             │ ──▶ │                 │ ──▶ │             │
│ [[path]]    │     │ Reads file      │     │ File content│
│             │     │ Replaces syntax │     │ inserted    │
└─────────────┘     └─────────────────┘     └─────────────┘
```

The preprocessor:

1. Scans for `[[path]]` patterns
2. Resolves the path based on content type (docs, blogs, issues)
3. Reads the file content
4. Replaces the pattern with actual content

## Basic Usage

### In Code Blocks

Embed code files inside fenced code blocks:

~~~markdown
```python
[[./assets/example.py]]
```
~~~

The `[[./assets/example.py]]` is replaced with the file's contents.

### Inside a collapsible

Combine an embed with a native `<details>` block to make a long file expandable:

~~~markdown
<details>
<summary>example.py</summary>

```python
[[./assets/example.py]]
```

</details>
~~~

### Diagram source

Mermaid and Graphviz fences render as diagrams, so embedding a `.mmd` /
`.dot` file inside the fence keeps the diagram source in its own
version-controlled file:

~~~markdown
```mermaid
[[./assets/flow.mmd]]
```

```dot
[[./assets/graph.dot]]
```
~~~

**Inside a fence the path must be file-relative — start it with `./` or
`../`.** Bare names are deliberately skipped there so documentation examples
don't get expanded.

## Path Resolution

Path resolution differs per content type:

### Docs (Relative Paths)

In docs, paths are relative to the current file:

```
data/docs/
├── 01_getting-started/
│   ├── 01_overview.md      ← [[./assets/code.py]]
│   └── assets/
│       └── code.py         ← Resolved here
```

**Example:**

~~~markdown
<!-- In 01_overview.md -->
```python
[[./assets/code.py]]
```
~~~

Resolves to: `data/docs/01_getting-started/assets/code.py`

### Blogs (Central Assets Folder)

In blogs, paths resolve to a central assets folder named after the post:

```
data/blog/
├── 2024-01-15-hello-world.md   ← [[diagram.png]]
└── assets/
    └── 2024-01-15-hello-world/
        └── diagram.png          ← Resolved here
```

**Example:**

```markdown
<!-- In 2024-01-15-hello-world.md -->
[[diagram.png]]
```

Resolves to: `data/blog/assets/2024-01-15-hello-world/diagram.png`

### Issues (Folder-Relative Paths)

> Embedding semantics will be revisited by the pipeline unification specced in issue `2026-04-19-knowledge-graph-and-wiki-links` (its broader model introduces `[[[target]]]` for embeds distinct from `[[target]]` for wiki links). Until then issues use the same `[[path]]` embed syntax as docs and blogs. One side effect: literal `[[...]]` prose in issue markdown (outside code spans) is now treated as an embed — escape it as `\[[...]]`.

Paths resolve relative to the referencing file; a bare name (`[[diagram.png]]`) resolves to `<file's folder>/assets/<name>`. Every issue is its own folder, so you can put assets alongside `issue.md`, inside `notes/`, or anywhere within the issue directory:

```
data/issues/
└── 2026-04-19-my-issue/
    ├── issue.md            ← [[./assets/diagram.png]]
    ├── notes/
    │   └── 01_design.md    ← [[../assets/diagram.png]]
    └── assets/
        └── diagram.png     ← Resolved here
```

## Escaping

To show a literal `[[path]]` without replacement, prefix it with a backslash:

```markdown
\[[./assets/example.py]]
```

Renders as: `[[./assets/example.py]]`

## Supported Content

The `[[path]]` syntax embeds **file content** only:

| Use Case | Syntax |
|----------|--------|
| Code files | `[[./assets/code.py]]` inside code block |
| Text snippets | `[[./assets/snippet.txt]]` |
| Config files | `[[./assets/config.yaml]]` inside code block |
| Diagram source | `[[./assets/flow.mmd]]` inside a `mermaid`/`dot` fence |

For images, use standard markdown or HTML:

```markdown
![Alt text](./assets/diagram.png)
<img src="./assets/diagram.png" alt="Diagram" />
```

## Two embed mechanisms

The framework has exactly two embed mechanisms, split by what "embedding"
means for the file:

- **`[[path]]` — raw text inlining.** The file's bytes replace the pattern
  before markdown renders. Right for anything whose *source text* is the
  content: code, config, and mermaid / graphviz diagram source inside a
  fence.
- **Image syntax — render-by-reference.** `![Alt](./path)` renders the
  *resource* in place while the file stays independently served. Images use
  it natively; **Excalidraw scenes** use it too:

  ```markdown
  ![Architecture](./assets/arch.excalidraw)
  ```

  The scene is fetched and rendered read-only as SVG. The alt text becomes a
  caption with an *open file ↗* link, clicking the canvas opens it in the
  full-screen pan/zoom viewer, and dark mode inverts it automatically. A **plain link**
  `[Architecture](./assets/arch.excalidraw)` deliberately stays a link — it
  opens the raw file instead of embedding it.

Relative links to any colocated non-page file (`[Spec](./assets/api.pdf)`)
are rewritten to served URLs the same way image srcs are, so they work at
any page depth.

**Errors:** a missing referenced file fails the build with an
`asset-missing` error pointing at the page and line; a file that exists but
fails to render (bad diagram syntax, malformed scene JSON) shows a visible
error box in place of the diagram.

**Embed or page?** Embedding fits diagrams that are figures inside prose.
When the diagram *is* the content, skip the wrapper entirely — a prefixed
`.mmd` / `.dot` / `.excalidraw` file renders as a first-class sidebar page:
see [Diagram Pages](./diagram-pages).

## Best Practices

1. **Organize assets** — use subfolders (`code/`, `images/`)
2. **Keep assets close** — store near the files that use them
3. **Use descriptive names** — `auth-flow.py` not `code1.py`
4. **Always use code blocks** — when embedding code files
