# Writing markdown

Rules for markdown in every content type: docs, blog, custom pages and the issue tracker. This file is the one home for the link rule and the markdown mechanics. The issues skill's [03_writing.md](../../agent-ks-issues/references/03_writing.md) adds only what differs inside a tracker. The user guide section is `@root/default-docs/data/user-guide/15_writing-content/`.

## Frontmatter

Write plain markdown in `.md` files. Do not write MDX. Rich content comes from GFM extensions, not from components.

| Field | Required | Content types | Effect |
|---|---|---|---|
| `title` | yes | all | A missing one warns and the page ships titled from its own filename, which looks deliberate. `agent-ks check section` is the check that errors on it. The tracker falls back to the slug, with no error |
| `description` | no | docs, blog | The lede on a blog card and the subtitle on the post. A docs page does not render it. An issue's description is a `settings.json` field, not frontmatter; the loader ignores it in `issue.md` |
| `draft: true` | no | docs, blog | Hides the page from the production build |
| `sidebar_label`, `sidebar_position` | no | docs | Sidebar text and order |
| `date`, `author`, `tags`, `image` | no | blog | See [the blog skill](../../agent-ks-blog/SKILL.md) |

No content type writes a per-page `<meta name="description">`. Every page carries the site description instead. That is a renderer gap; report it and write the frontmatter anyway.

Tracker metadata lives in `settings.json`. See the issues skill.

```yaml
---
title: "Page title"
description: "The lede on a blog card. A docs page does not show it."
draft: false
---
```

## Linking

**Every reference to a file in the project is a relative markdown link. The link text names the target.**

```markdown
See [how aliases resolve](../05_getting-started/03_aliases.md) for setup.
```

| Form | Means | Use for |
|---|---|---|
| `./x`, `../x` | relative to this file's directory | every file inside the project: pages, images, PDFs, data, across sections |
| `/x` | site-absolute, a URL from the site root | nothing. It stops being true when the file is read outside the site |
| `https://…` | external | pages and services outside the project |

The documents are filesystem-first. A relative link is the only form that is true on disk. So every filesystem tool can follow it: `agent-ks move`, `grep`, an editor, Obsidian, an agent walking the tree. `agent-ks move` skips every link that starts with `/`.

| Rule | Detail |
|---|---|
| Write the source path, not the URL | Link `../25_themes/03_variables.md`, not the published slug. The renderer strips `NN_` prefixes and `.md` |
| Assets are not an exception | A page's images sit in an `assets/` folder beside it. `/assets/…` is the framework's route; a document never names it |
| A link, never a backticked path | `move` cannot rewrite it, a reader cannot click it, and an agent must search to resolve it. The text must name the thing; `[03](./03_thing.md)` is still a number |
| The exception: a target that is not a document | Source code, config, a binary, a directory, or a path discussed as a value stays in backticks |
| Convert a backticked document path when you find one | Take the text from the target's `title`. A requested sweep runs detect, check, convert, then `agent-ks check link-form` and `agent-ks check issues` |
| A relative link that 404s on the site is a renderer bug | File it against `@root/astro-doc-code/src/parsers/postprocessors/internal-links.ts`. Do not convert the link to `/` |

### The ordering label

The sidebar lists entries by number, so a link can carry that number. Open the link text with the target's ordering path. That is the numeric prefixes of its folders and its own name, joined by `/`. Then write the name.

```markdown
[19/04/02 the vocabulary page](../19_issues/04_setup/02_vocabulary.md)
[040/100 the migration script](../../subtasks/040_execution/100_migration-script.md)
```

| Fact | Detail |
|---|---|
| Optional | A plain descriptive link is never wrong. The name must be present either way |
| Derived, never invented | Walk up from the file and collect numeric prefixes. Stop at the first segment without one. A target with no prefix takes no label |
| `agent-ks move` keeps it current | It recomputes the label when it rewrites the target |
| `agent-ks check issues` warns on drift | In the tracker only. Nothing checks the label inside a docs section, so re-read it yourself after a hand renumber |

## Rich content

Callouts are GFM alert blockquotes. Five types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`. Normal markdown nests inside.

```markdown
> [!NOTE]
> Body of the callout.
```

Collapsible content uses `<details>` and `<summary>`. Markdown inside renders normally. A code block is a triple-backtick fence with a language tag; wrap a long one in `<details>`.

Diagrams: a fenced `mermaid` or `graphviz` block renders in place. Keep the source in its own `.mmd` or `.dot` file and embed it in the fence with `[[path]]` (below).

Excalidraw and draw.io: image syntax embeds the file read-only. A plain link opens the raw file.

```markdown
![Architecture](./assets/arch.excalidraw)   embeds; alt is the caption; click opens the viewer
[Architecture](./assets/arch.excalidraw)    plain link to the raw file
```

| Rule | Detail |
|---|---|
| Never inline scene JSON or mxGraph XML | The file is the single source. A missing file logs an `asset-missing` error to the dev toolbar. A malformed file fails in the browser and logs to the browser console. Both render an error box in place, and both let the build pass, so open the page and look |
| Dark mode inverts Mermaid, Graphviz and Excalidraw | draw.io resolves its own dark palette, because `.drawio` files carry raster icons. Pick colours that keep their meaning on both |
| Save `.drawio` uncompressed | *File → Properties → Compressed: off*. The file then diffs and greps |
| draw.io stencil sets are not bundled | Use the built-in palette, or install stencils into `assets/drawio/stencils/` |

## Asset embedding

One way, and it is relative. A document never references the site assets folder.

Everything a page uses goes in an `assets/` folder beside that page, at any depth. Blog files are flat, so a post's assets live in `assets/<post-slug>/`.

```markdown
![Flow](./assets/flow.png)
[Spec](./assets/api-v1.pdf)
![Flow](./assets/2026-04-19-introducing-issues/flow.png)   from a blog post
```

The build rewrites a relative `<img src>` or `<a href>` to a colocated file to `/content-assets/<path>`. Colocated non-markdown files never enter the sidebar. `agent-ks check link-form` rejects every site-absolute target. Do not loosen the rule to fit an asset; colocate it.

Run `agent-ks img` on every image before a commit, so figures stay near 60 to 100 KB. See [images.md](./images.md).

## Content embedding with `[[path]]`

`[[path]]` inlines another file's raw text at build time: code, text, diagram source. Never images. Wrap it in a fenced block with the language.

````markdown
```python
[[./assets/example.py]]
```
````

| Content type | A bare name resolves to | `./` and `../` resolve to |
|---|---|---|
| docs | relative to the file | relative to the file |
| blog | `assets/<post-slug>/<name>` | relative to the file |
| issues | `assets/` next to the file | relative to the file |

Inside a fenced block the path must start with `./` or `../`. The build skips a bare name there, so documentation examples do not expand. Escape with `\[[...]]` to show the brackets.

A missing target leaves the literal `[[path]]` text in the page and logs an `asset-missing` error to the dev toolbar. The build still passes, so open the page and look.

## Related

- [docs-layout.md](./docs-layout.md): docs structure and folder settings
- [the blog skill](../../agent-ks-blog/SKILL.md): post names, frontmatter and assets
- [images.md](./images.md): image optimization
- [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md): `move`, `find`, `img`, `check link-form`
