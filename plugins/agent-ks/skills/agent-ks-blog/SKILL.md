---
name: agent-ks-blog
description: Use this skill for blog posts in an agent-knowledge-system project: a new post, its filename and date, frontmatter (title, description, date, author, tags, image, draft), a post's images, and the blog index. Trigger it for any file under data/blog/ and for "write a post", "publish", "draft post" or "blog" in a project that uses the framework. Markdown mechanics come from agent-ks-docs; the blog route and layout come from agent-ks-config.
---

# Blog skill

The blog is one flat folder of dated markdown files. The framework builds the index. This file is the whole manual; the user guide section is `@root/default-docs/data/user-guide/18_blogs/`.

## Structure

```
data/blog/
├── 2026-04-19-introducing-issues.md
├── 2026-05-02-agent-logs.md
└── assets/
    └── 2026-04-19-introducing-issues/      one folder per post, named after the file
        └── flow.png
```

| Rule | Detail |
|---|---|
| The name is `YYYY-MM-DD-<kebab-case-slug>.md` | Lowercase, hyphens, no `NN_` prefix. The date is the post date and the sort key, newest first |
| The URL drops the date | `2026-04-19-introducing-issues.md` serves at `/blog/introducing-issues`. Pick a slug that reads as a title, not `post-1` |
| No subfolders | `assets/` is the only folder allowed. A nested folder is an error |
| A post's files live in `assets/<post-slug>/` | The slug includes the date. Every post's assets sit apart, so nothing collides |
| The index is generated | `/blog/` lists every post as a card: title, description, date, author, tags, cover image. Nothing to write |

## Frontmatter

```yaml
---
title: "Introducing the issue tracker"
description: "One folder per issue, and why that beats a database."
date: 2026-04-19
author: "Sid"
tags: [tracker, design]
draft: false
---
```

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | The post title. `check blog` errors without it |
| `description` | no | The lede on the card and the meta description. Keep it under 160 characters |
| `date` | no | `YYYY-MM-DD`. Overrides the filename date for sorting and display. Use it to backdate without renaming |
| `author` | no | Shown on the card and the post |
| `tags` | no | A list. Lowercase, hyphenated, the same spelling across posts |
| `image` | no | The cover on the card. The value goes into the `<img src>` unchanged, so it must be a URL the site serves. A relative path is not rewritten today; that is a renderer gap, so file it rather than write around it |
| `draft` | no | `true` shows the post in dev and drops it from the production build and the index |

Write plain markdown. No MDX. Use `#` only for the title, and prefer the frontmatter `title` over a body `<h1>`.

## Writing the body

The markdown rules are shared with docs and live in one place: [writing.md](../agent-ks-docs/references/writing.md). The three that matter most in a post:

- Every link to a file in the project is a relative markdown link with a name. Never `/x`.
- An image embeds from the post's own folder: `![Flow](./assets/2026-04-19-introducing-issues/flow.png)`.
- Inside a fenced block, `[[./assets/<post-slug>/file.py]]` inlines a file. A bare name resolves under `assets/<post-slug>/`.

Run `agent-ks img` on every image before a commit: [images.md](../agent-ks-docs/references/images.md).

## Commands

| Command | Does |
|---|---|
| `agent-ks blog list` | Posts, newest first: date, slug, title |
| `agent-ks blog show <slug or date>` | One post's metadata and frontmatter |
| `agent-ks blog search <regex>` | Regex search over posts. `--count`, `--case-sensitive` |
| `agent-ks check blog [folder]` | The filename pattern, a `title`, no subfolder except `assets/`. Exit `0` clean, `1` errors. Run it after every new post |
| `agent-ks find <regex> --type blog` | Search the blog with everything else |
| `agent-ks img <files> --dpr 2 --format webp --quality 80 --rewrite-links` | Shrink images and fix their links |

Flags: [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md). Do not guess a flag; `agent-ks help blog list` shows them.

## Never

| Never | Do instead |
|---|---|
| Name a post without the date, or with an `NN_` prefix | `YYYY-MM-DD-slug.md` |
| Put a post in a subfolder, or its images in the site `assets/` | Flat file; images in `assets/<post-slug>/` |
| Rename a post with `mv` | `agent-ks move <from> <to>`. It rewrites every link into and out of the post |
| Search posts with `Grep` | `agent-ks blog search`, or `agent-ks find` |
| Change the blog route, its layout or the navbar item | [the config skill](../agent-ks-config/SKILL.md). The route is a `pages:` entry with `type: blog` and `layout: "@blog/default"` |
| Commit a raw screenshot | `agent-ks img` first |

## Keep the skill current

If this skill is wrong, update it and tell the user; do not work around it.
