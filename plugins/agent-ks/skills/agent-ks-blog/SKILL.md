---
name: agent-ks-blog
description: Use this skill for blog posts in an agent-knowledge-system project — writing a new post, its YYYY-MM-DD- filename and date, frontmatter (title, description, date, author, tags, image, draft), a post's images and its assets folder, hiding or unpublishing a post with draft, and the generated blog index. Trigger it for any file under the project's blog/ folder, and whenever the user says post, article, announcement, write-up, blog or draft, or asks to publish or hide one. Markdown mechanics come from agent-ks-docs; the blog route, layout and navbar item come from agent-ks-config. A release note is not a blog post.
---

# Blog skill

The blog is one flat folder of dated markdown files. The framework builds the index. This file is the whole manual.

**Source of truth.** The engine and the CLI decide everything they implement: the filename rule, the frontmatter fields, the commands, and what the index renders. The bundled user guide at `@root/default-docs/data/user-guide/18_blogs/` wins only on a convention the code does not enforce. `@root` is the framework root: the `agent-knowledge-system/` repository root, one level above `agent-ks-engine/`.

**Where the posts live.** Run `agent-ks overview --json` to find the configured blog section and its path. The CLI uses `--config-dir`, then `AGENTKS_CONFIG_FOLDER`, then `./config` from the current directory. See [project selection](../agent-ks-cli/references/installation.md). The section may have a name other than `blog`.

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
| The index is generated | `/blog/` lists the ten newest posts as a card: title, description, date, author, the first two tags, cover image. Nothing to write. There is no pagination, so post eleven and older never appear. That is a renderer gap, a defect in the framework and not in the content, so file it |

## A new post, in order

1. Pick the post date. Name the file `YYYY-MM-DD-<slug>.md` in the blog folder.
2. Write the frontmatter. `title` is the only required field.
3. Create `assets/<post-slug>/` for the post's images and diagram sources.
4. Write the body.
5. Run `agent-ks check blog` and `agent-ks check link-form <blog folder>`. Exit `0` is clean.

## Frontmatter

A complete short post:

```markdown
---
title: "Introducing the issue tracker"
description: "One folder per issue, and why that beats a database."
date: 2026-04-19
author: "Sid"
tags: [tracker, design]
draft: false
---

Every issue is a folder. The tracker is the filesystem, so `grep` and an
editor read it without the site.

## Why a folder

![Flow](./assets/2026-04-19-introducing-issues/flow.png)
```

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | The post title. `check blog` errors without it |
| `description` | no | The short intro text on the card, and the subtitle on the post. The card cuts it at two lines, so keep it near 160 characters. It does not reach the page's `<meta name="description">`. That is a renderer gap, so file it |
| `date` | no | `YYYY-MM-DD`. Overrides the filename date for sorting and display. Use it to backdate without renaming |
| `author` | no | Shown on the card and the post |
| `tags` | no | A list. Lowercase, hyphenated, the same spelling across posts. `agent-ks find "<tag>" --type blog --meta` says whether a spelling is already in use. `agent-ks blog show <slug>` prints one post's tags |
| `image` | no | The cover on the card. The value goes into the `<img src>` unchanged, so a relative path never resolves. Leave `image` unset, or give it an external `https://` URL. The missing rewrite is a renderer gap, so file it |
| `draft` | no | `true` shows the post in dev and drops it from the production build and the index |

File a renderer gap in the tracker: [the issues skill](../agent-ks-issues/SKILL.md).

The layout renders the frontmatter `title` as the page `<h1>`. Start body headings at `##`, or the post ships two h1s.

## Writing the body

The markdown rules are shared with docs and live in one place: [writing.md](../agent-ks-docs/references/writing.md). The ones that matter most in a post:

- Every link to a file in the project is a relative markdown link with a name. Never `/x`.
- To inline a file's text into a fenced block, follow [content embedding with `[[path]]`](../agent-ks-docs/references/writing.md#content-embedding-with-path). Inside a fence the path starts with `./` or `../`. The build skips a bare name there.
- Before a commit, shrink every image: [images.md](../agent-ks-docs/references/images.md).

## Commands

| Command | Does |
|---|---|
| `agent-ks blog list` | Posts, newest first: date, slug, title |
| `agent-ks blog show <slug or date>` | One post's metadata and frontmatter |
| `agent-ks blog search <regex>` | Regex search over posts. `--count`, `--case-sensitive` |
| `agent-ks check blog [folder]` | The filename pattern, a `title`, no subfolder except `assets/`. Exit `0` clean, `1` errors. Run it after every new post |
| `agent-ks check link-form [folder]` | Every internal link is relative and names a file on disk. `check blog` never reads a link, so run both. A folder whose posts carry no link at all reports "the link matcher is not working". That guard reads the whole folder, not your post |
| `agent-ks find <regex> [--type blog]` | One regex over all content. `--type blog` narrows it to posts; drop the flag to reach docs, issues and config too. `--meta` matches frontmatter only |
| `agent-ks img <files> --dpr 2 --format webp --quality 80 --rewrite-links` | Shrink images and fix their links |

Flags: [cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md). Do not guess a flag. `agent-ks help blog list` shows them.

## Never

| Never | Do instead |
|---|---|
| Name a post without the date, or with an `NN_` prefix | `YYYY-MM-DD-slug.md` |
| Put a post in a subfolder, or its images in the site `assets/` | Flat file; images in `assets/<post-slug>/` |
| Rename a post with `mv` | `agent-ks move <from> <to>`. It rewrites every link into and out of the post. Then move `assets/<old-slug>/` to `assets/<new-slug>/` with a second `agent-ks move`. `move` does not rename the folder for you, and a bare-name `[[file]]` embed resolves from the new slug |
| Search posts with `Grep` | `agent-ks blog search`, or `agent-ks find --type blog`. Either scopes the regex to the posts and reads frontmatter and body together |
| Change the blog route, its layout or the navbar item | [the config skill](../agent-ks-config/SKILL.md) |
| Commit a raw screenshot | `agent-ks img` first. A raw capture runs to megabytes. The command brings it near 60 to 100 KB |

## Keep the skill current

If this skill is wrong, update it and tell the user. Do not work around it.
