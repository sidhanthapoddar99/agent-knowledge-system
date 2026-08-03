---
title: Asset Embedding
description: Detailed asset management for documentation
sidebar_position: 5
---

# Asset Embedding for Docs

The `assets` folder stores external files like code snippets and images. This page covers asset management specific to documentation.

For the general `[[path]]` syntax (shared across content types), see [Asset Embedding](../15_writing-content/03_asset-embedding.md).

## Assets Folder Structure

Each documentation folder can have its own `assets` folder:

```
docs/
├── 01_getting-started/
│   ├── settings.json
│   ├── 01_overview.md
│   ├── 02_installation.md
│   └── assets/
│       ├── code/
│       │   ├── example.py
│       │   └── config.yaml
│       └── images/
│           └── diagram.png
```

> The `assets` folder is **excluded from sidebar indexing**.

## Path Resolution

In docs, all asset paths are **relative to the current file**:

```
docs/
├── 01_getting-started/
│   ├── 01_overview.md      ← You are here
│   └── assets/
│       └── example.py       ← \[[./assets/example.py]]
```

**Example:**

~~~markdown
````python
\[[./assets/example.py]]
```
~~~

Resolves to: `docs/01_getting-started/assets/example.py`

## Nested Folder Assets

For nested documentation folders, each can have its own assets:

```
docs/
├── 01_getting-started/
│   ├── assets/
│   │   └── intro.py
│   └── 01_basics/
│       ├── 01_overview.md
│       └── assets/
│           └── basics.py    ← \[[./assets/basics.py]]
```

From `01_basics/01_overview.md`:

~~~markdown
<!-- Access local assets -->
````python
\[[./assets/basics.py]]
```

<!-- Access parent folder assets -->
````python
\[[../assets/intro.py]]
```

~~~

## Code in Fenced Blocks

The most common usage - embedding code inside fenced blocks:

~~~markdown
```python
\[[./assets/example.py]]
```
~~~

The content of `example.py` replaces `\[[./assets/example.py]]`.

## Images

For images, use standard markdown or HTML (not `[[path]]`):

```markdown
![Architecture diagram](./assets/images/diagram.png)

<img src="./assets/images/diagram.png" alt="Architecture diagram" />
```

The `[[path]]` syntax is for **file content** only, not image embedding.

## Organizing Assets

### By Type

```
assets/
├── code/
│   ├── example.py
│   └── config.yaml
└── images/
    ├── screenshot.png
    └── diagram.svg
```

### By Feature

```
assets/
├── authentication/
│   ├── login.py
│   └── flow.png
└── database/
    ├── schema.sql
    └── erd.png
```

## Best Practices

1. **Organize assets** in subfolders (`code/`, `images/`)
2. **Keep assets close** to the docs that use them
3. **Use descriptive names** — `auth-flow.png` not `img1.png`
4. **Use relative paths** — always start with `./` for clarity
