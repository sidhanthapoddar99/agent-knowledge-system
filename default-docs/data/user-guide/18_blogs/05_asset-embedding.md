---
title: Asset Embedding
description: Central asset management for blog posts
sidebar_position: 5
---

# Asset Embedding for Blogs

Blog posts use a **central assets folder** organized by post slug. This differs from docs where assets are relative to each file.

For the general `[[path]]` syntax (shared across content types), see [Asset Embedding](../15_writing-content/03_asset-embedding.md).

## Assets Folder Structure

All blog assets are stored in a central `assets/` folder with subfolders matching each post's slug:

```
blog/
├── 2024-01-15-hello-world.md
├── 2024-02-01-new-feature.md
├── 2024-02-15-tips-and-tricks.md
└── assets/
    ├── 2024-01-15-hello-world/
    │   ├── cover.jpg
    │   ├── diagram.png
    │   └── code.py
    ├── 2024-02-01-new-feature/
    │   └── screenshot.png
    └── 2024-02-15-tips-and-tricks/
        └── example.js
```

## Path Resolution

In blogs, asset paths resolve to the post's subfolder in `assets/`:

```
blog/
├── 2024-01-15-hello-world.md   ← \[[diagram.png]]
└── assets/
    └── 2024-01-15-hello-world/
        └── diagram.png          ← Resolved here
```

**Example:**

```markdown
<!-- In 2024-01-15-hello-world.md -->
```python
\[[code.py]]
```
```

Resolves to: `blog/assets/2024-01-15-hello-world/code.py`

## No Relative Paths Needed

Unlike docs, you don't need `./` or folder paths:

```markdown
<!-- Docs style (NOT used in blogs) -->
\[[./assets/diagram.png]]

<!-- Blog style (correct) -->
\[[diagram.png]]
```

The system automatically resolves to the correct subfolder based on the post filename.

## Creating Asset Folders

When creating a new post, create a matching asset folder:

1. Create post: `2024-03-01-my-new-post.md`
2. Create folder: `assets/2024-03-01-my-new-post/`
3. Add assets to the folder
4. Reference in post: `\[[myfile.png]]`

## Code Files

Embed code inside fenced blocks:

~~~markdown
```python
[[example.py]]
```
~~~

The content of `assets/<post-slug>/example.py` replaces `[[example.py]]`.

## Images

For images, use standard markdown (not `[[path]]`):

```markdown
![Cover image](./assets/2024-01-15-hello-world/cover.jpg)
```

Or use the frontmatter `image` field for cover images:

```yaml
---
image: /images/blog/cover.jpg
---
```

## Organizing Assets

### By Type

```
assets/
└── 2024-01-15-hello-world/
    ├── code/
    │   ├── example.py
    │   └── config.yaml
    └── images/
        ├── screenshot.png
        └── diagram.svg
```

When using subfolders, include the path:

```markdown
\[[code/example.py]]
\[[images/diagram.svg]]
```

## Comparison: Docs vs Blogs

| Feature | Docs | Blogs |
|---------|------|-------|
| Asset location | Next to file | Central `assets/` folder |
| Path syntax | `\[[./assets/file.py]]` | `\[[file.py]]` |
| Organization | Per-folder assets | Per-post subfolders |
| Relative paths | Required | Not needed |

## Best Practices

1. **Match folder to filename** - `2024-01-15-post.md` → `assets/2024-01-15-post/`
2. **Use descriptive names** - `architecture-diagram.png` not `img1.png`
3. **Organize large posts** - Use subfolders for many assets
4. **Keep assets minimal** - Only include what's needed
5. **Optimize images** - Compress before adding
