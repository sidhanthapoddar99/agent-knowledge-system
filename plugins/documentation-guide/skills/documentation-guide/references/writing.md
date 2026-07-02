# Writing markdown content — reference

Cross-cutting rules for writing markdown content across content types (docs, blog, custom pages). For writing *inside the issue tracker*, the `doc-issues` skill carries its own self-contained writing reference.

**Canonical source of truth:** the framework's bundled `@root/default-docs/data/user-guide/15_writing-content/` — read those pages when this reference is unclear.

> **Sync note:** the mechanics sections here (custom tags, assets, `[[path]]` embedding, code blocks) are mirrored in the `doc-issues` skill's `references/10_writing/10_writing.md` — when editing one, mirror the other.

> **Status:** stub. The detailed spec is being authored under `2025-06-25-claude-skills/subtasks/03_writing-skill.md`. For now, this file captures the essentials.

---

## Universal rules

- **Frontmatter `title` is required** on every `.md` file. Builds fail without it.
- **Description** is optional but recommended (used in meta tags + sidebar tooltips).
- **`draft: true`** hides the page from the production build. Works on docs, blog, issues.
- **Don't write MDX** — this project uses pure markdown (`.md`). Custom tags use a remark plugin, not MDX.

## Standard frontmatter

```yaml
---
title: "Page title"
description: "1-2 sentence summary used in <meta> + sidebar tooltips."
draft: false
---
```

Per-content-type extras:
- **docs** — `sidebar_label`, `sidebar_position`
- **blog** — `date` (YYYY-MM-DD), `author`, `tags`
- **issues** — different schema (metadata in `settings.json`, per-subdoc frontmatter): see the `doc-issues` skill.

## Custom tags

Project-specific markdown extensions live in `astro-doc-code/src/custom-tags/`. Common ones:

```markdown
:::callout{type="info"}
Body of the callout.
:::

:::collapsible{title="Click to expand"}
Hidden content.
:::

:::tabs
- tab: First
  content: ...
- tab: Second
  content: ...
:::
```

For the full list and syntax, read `@root/default-docs/data/user-guide/15_writing-content/` (and grep the framework's `astro-doc-code/src/custom-tags/`).

## Asset embedding

Two ways to reference images and downloadable files:

- **Shared files** live under the project's root `assets/` folder, served from `/assets/` — reference with absolute paths:
  ```markdown
  ![Logo](/assets/logo.png)
  [Download the spec](/assets/specs/api-v1.pdf)
  ```
- **Colocated files** sit next to the markdown that uses them (`./assets/flow.png`) — reference with a **relative** path. Works in docs, blog, and issues; the build rewrites the relative `<img src>` to `/content-assets/<path-relative-to-the-content-root>` (shared `asset-src` postprocessor + `/content-assets/[...path]` route). Colocated non-markdown files are never indexed into the sidebar.
  ```markdown
  ![Flow](./assets/flow.png)
  ```

For embedding a file's **raw text content** (not images), see the next section.

## Content embedding (`[[path]]`)

`[[path]]` inlines another file's **raw text content** at build time — the pattern is replaced with the file's bytes *before* the markdown renders. It's for code, text, and diagram source — **never images** (use `![]()` for those). Works the same in **all three content types** — docs, blog, and issues (each runs the asset-embed preprocessor); only path resolution differs (see below).

The power move: wrap it in a fenced block so the embedded content is treated as that language. The file stays the single source of truth; the docs always show its current contents.

**Embed a code file** (syntax-highlighted):

````markdown
```python
[[./assets/example.py]]
```
````

**Embed diagram source** — Mermaid / Graphviz blocks render from the embedded file, so the diagram lives in its own `.mmd` / `.dot` file:

````markdown
```mermaid
[[./assets/flow.mmd]]
```

```graphviz
[[./assets/graph.dot]]
```
````

**Embed inside a custom tag** (e.g. collapsible):

```markdown
<collapsible-code-block language="python" title="example.py">
[[./assets/example.py]]
</collapsible-code-block>
```

Path resolution differs per content type — docs: relative to the file (`./assets/x.py`); blog: `assets/<post-slug>/<name>`; issues: relative to the file, bare name → `<folder>/assets/<name>`. Escape with `\[[...]]` to render the brackets literally. Full rules + per-type examples: `@root/default-docs/data/user-guide/15_writing-content/03_asset-embedding.md`.

## Code blocks

Triple-backtick with language tag for syntax highlighting:

````markdown
```typescript
const x: number = 42;
```
````

For long blocks, the `collapsible` custom tag wraps the block.

## Cross-content-type concerns

- **Drafts** — `draft: true` works on every type
- **Dev-only content** — see `@root/default-docs/data/user-guide/10_configuration/06_dev-mode.md`
- **`NN_` prefix** — used in docs/dev-docs folders (NOT in blog; optional-and-looser in the tracker — see the `doc-issues` skill)

## Cross-references

- `@root/default-docs/data/user-guide/15_writing-content/` (the framework's bundled user-guide) — full section
- `references/layouts/docs-layout.md` — docs-specific structure / settings
- `references/layouts/blog-layout.md` — blog-specific naming / frontmatter
- the `doc-issues` skill — issue-specific structure + tracker writing
