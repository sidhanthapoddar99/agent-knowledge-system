---
title: "Blog"
description: "A blog is one flat folder of markdown posts named by date. agentks builds an index of them, newest first, with their tags and authors."
---

# Blog

A blog is one folder of markdown posts, each named after the day it was published. You write the posts. agentks builds the blog's index page, newest post first, and a page for each post. Use a blog for anything dated: release announcements, write-ups, updates. For pages that stay current, use a [docs section](../15_docs/01_overview.md) instead.

## A blog on disk

```
data/blog/
├── 2026-09-01-launch.md
├── 2026-09-15-libraries.md
├── 2026-10-01-hello-world.md
└── assets/
    ├── 2026-09-01-launch/
    │   └── cover.png
    └── 2026-10-01-hello-world/
        └── diagram.png
```

| Rule | Detail |
|---|---|
| One flat folder | Every post sits in the blog folder itself. The only subfolder allowed is `assets/` |
| Named by date | `YYYY-MM-DD-<slug>.md`. The date is the publication date, and the slug is lowercase words joined by hyphens |
| A title in every post | `title` in the frontmatter is required |
| Assets per post | A post's images and files go in `assets/<the post's file name>/` |

A blog needs no `settings.json` and no `NN_` prefixes. The date orders the posts.

## URLs

The date is dropped from the URL. With the blog's base URL set to `/blog`:

| File | URL |
|---|---|
| `2026-10-01-hello-world.md` | `/blog/hello-world` |
| `2026-09-01-launch.md` | `/blog/launch` |
| the blog folder | `/blog`, the index |

Because the URL is the slug alone, two posts cannot share a slug, even on different dates. agentks keeps one and reports the other as a collision.

## The blog index

The index at the blog's base URL lists every post, newest first. For each post it has what the frontmatter gives it: the title, the date, the description, the author, the tags and the cover image. It also has the list of every tag and every author in the blog, each with its number of posts.

A post's date is the `date` in its frontmatter when there is one, and the date in its file name otherwise.

In the local app, the index and the post pages show drafts with a draft badge. A site published with `agentks build` leaves drafts out. See [writing a post](./05_writing-a-post.md) for the fields.

## Add a blog to a project

A blog is an entry under `pages:` in `config/site.yaml`, with the type `blog`:

```yaml
pages:
  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"
```

`@blog/default` is the built-in blog layout. The [configuration section](../35_configuration/01_overview.md) explains every key, and how to add the blog to the navbar.

## Find and check posts

```bash
agentks blog list                        # every post: date, slug and title, newest first
agentks blog show hello-world            # one post's metadata, by slug, date or file name
agentks blog search 'release' --limit 10 # search the posts' text
agentks check blog                       # file names, frontmatter, no subfolders
```

`agentks check blog` reports a post whose name breaks the `YYYY-MM-DD-<slug>.md` pattern, a post without a `title`, a folder other than `assets/`, and a file that is not markdown outside `assets/`.

## In this section

| Page | What it covers |
|---|---|
| [Writing a post](./05_writing-a-post.md) | The file name, every frontmatter field, dates, images and drafts |
