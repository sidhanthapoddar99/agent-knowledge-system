---
title: "Writing a post"
description: "Name a post by its date, fill in its frontmatter, put its images in its own assets folder, and keep it as a draft until it is ready."
---

# Writing a post

A post is one markdown file in the blog folder, named by its date, with a title in its frontmatter. This page covers the file name, every frontmatter field, where the post's images go and how to keep a post as a draft. The markdown inside a post follows the same rules as every page; see [writing content](../10_writing-content/01_overview.md).

## Name the file

```
2026-10-01-hello-world.md
```

| Part | Rule |
|---|---|
| `2026-10-01` | The date, as `YYYY-MM-DD` |
| `-` | One hyphen after the date |
| `hello-world` | The slug: lowercase letters and digits, words joined by single hyphens. It becomes the URL, `/blog/hello-world` |
| `.md` | Markdown |

A name that breaks the pattern, such as `Hello World.md` or `2026-10-01_hello.md`, is an error, and the message shows the expected pattern. Keep slugs short and meaningful: `release-1-2` says more than `post-7`.

## Fill in the frontmatter

```markdown
---
title: "agentks 1.2 is out"
description: "Faster checks, a new layout for the tracker and three fixes."
date: 2026-10-01
author: "Docs team"
tags:
  - release
  - cli
draft: false
---

The first paragraph of the post.
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `title` | text | yes | The post's title |
| `description` | text | no | A one-line summary, shown with the post in the index |
| `date` | `YYYY-MM-DD` | no | The publication date. It replaces the date in the file name |
| `author` | text | no | Who wrote it. The index lists every author with a post count |
| `tags` | list of text | no | Topics. The index lists every tag with a post count |
| `image` | text | no | The post's cover image |
| `draft` | `true` or `false` | no | `true` keeps the post out of a published site |

Any other key is reported as a warning by `agentks check blog`, with the list of valid keys.

### Dates

The file name's date is the default. Set `date` only when the post's date must differ from its file name. The file name and the index then disagree, so when you can, rename the file with `agentks move` instead.

### Tags and authors

Pick one spelling for each tag and each author, and keep to it across posts, so the index lists them once. For tags, lowercase words joined by hyphens work well, such as `access-keys`.

## Images and other files

The blog is one flat folder, so each post keeps its files in its own subfolder of `assets/`, named after the post's file:

```
data/blog/
├── 2026-10-01-hello-world.md
└── assets/
    └── 2026-10-01-hello-world/
        ├── cover.png
        └── diagram.png
```

Link to them with a relative path from the post:

```markdown
![How a page reaches the reader](./assets/2026-10-01-hello-world/diagram.png)
```

Shrink screenshots before you commit them, with `agentks img`; see [writing content](../10_writing-content/01_overview.md), under assets and images.

## Link to other posts and pages

Link by file, as everywhere:

```markdown
Read [the launch post](./2026-09-01-launch.md) first.
The [install guide](../guide/05_setup/10_install.md) has the steps.
```

The second link goes from the blog folder into a docs section at `data/guide/`. agentks turns both into URLs. See [writing content](../10_writing-content/01_overview.md), under links.

## Keep it as a draft

Set `draft: true` while you write. The local app shows the post, with a draft badge, in the index and at its URL. A site published with `agentks build` leaves it out. Delete the line, or set it to `false`, to publish it with the next build.

## Check it

```bash
agentks check blog          # names, frontmatter, folders
agentks check link-form     # every link is relative and its target exists
```
