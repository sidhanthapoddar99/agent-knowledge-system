---
title: "Links"
description: "Link to another file with its relative path on disk. agentks turns the path into the right URL, and agentks move keeps it right."
---

# Links

To link to another file in the project, write the path from your page to that file, as it is on disk. agentks finds the file and writes the right URL into the page. You never write a URL for a page of your own.

## Right and wrong

```markdown
Right: [install the CLI](../05_setup/10_install.md)
Wrong: [install the CLI](/guide/setup/install)
```

The first link is a file path. It is true in an editor, in Obsidian, for `grep` and for an agent walking the folder, and agentks turns it into the page's URL.

The second link is a URL. It starts with `/`, so it only means something inside one running site. Read the file anywhere else and the link points at nothing. It also breaks silently: `agentks move` does not touch it, and it stops working when someone renames the section's URL. agentks reports every link that starts with `/` as a link-form error.

If a relative link is correct on disk but fails on the site, that is a bug in agentks. Report it. Do not change the link to a `/` URL to work around it.

## What you can link to

| You write | It points to | On the site |
|---|---|---|
| `[text](./10_install.md)` | A page in the same folder | That page's URL |
| `[text](../05_setup/10_install.md#check-the-version)` | A heading on another page | The page's URL, with `#check-the-version` kept |
| `[text](#check-the-version)` | A heading on this page | The heading |
| `[text](./20_flow.mmd)`, `[text](./30_report.html)` | A diagram or artifact page | That page's URL |
| `[text](./assets/api-spec.pdf)` | Any other file | The file itself, which the browser opens or downloads |
| `[text](../05_setup/)` | A folder | The folder's `index.md` page, if it has one |
| `[text](https://example.com)` | A page outside the project | Unchanged. Web links open in a new tab |

Links across sections work the same way. From `data/guide/05_setup/10_install.md`, the link `[the launch post](../../blog/2026-10-01-launch.md)` points into the blog at `data/blog/`.

Write the file's full name, with its extension. `./10_install` names no file, so it is a broken link.

## How a path becomes a URL

agentks joins your link to the folder of the page that holds it, finds that file, and looks up the file's URL. A page's URL is its section's base URL followed by its path inside the section, with the `NN_` prefixes and the extension removed:

| File on disk (section base URL `/guide`) | URL |
|---|---|
| `data/guide/05_setup/10_install.md` | `/guide/setup/install` |
| `data/guide/10_concepts/05_links.md` | `/guide/concepts/links` |
| `data/guide/10_concepts/20_flow.mmd` | `/guide/concepts/flow` |

Because a link names a file and not a URL, you can rename a section's base URL in `config/site.yaml` and every link in the project still works.

## Name the target in the link text

The link text should say what the reader will find: `[install the CLI](...)`, not `[here](...)` or `[05/10](...)`.

You may also start the link text with the target's ordering label: the numbers of its folders and file, joined by `/`. For example, `[05/10 Install the CLI](../05_setup/10_install.md)`. The label is optional. It helps a reader find the target in the sidebar, and `agentks move` updates it when the target moves.

## When a link is wrong

agentks never guesses a target.

| Problem | What happens |
|---|---|
| The target does not exist | The link is drawn as a broken link, and a content error names the file and the line |
| The link starts with `/` | The link is written as it is, and it is reported as a link-form error |
| The path climbs out of the project | A content error. Only files inside the project can be linked |

Find these before a reader does:

```bash
agentks check link-form                 # the whole project
agentks check link-form data/guide      # one folder
```

The command checks that every internal link is relative and that its target exists. It exits with `1` when it finds an error.

## Moving and renaming files

Never move or rename a page with `mv` or a file manager. Every link to it would still name the old path, and nothing would tell you. Use `agentks move` instead:

```bash
agentks move data/guide/10_old.md data/guide/20_new.md --dry-run   # show what would change
agentks move data/guide/10_old.md data/guide/20_new.md             # do it
```

`agentks move` moves a file or a whole folder. It rewrites every link and embed that points into what moved, and every relative link inside the moved files, so they stay true from their new place. It also updates ordering labels in link text. Inside a git repository it moves the files with git, so their history follows them.

## Links outside markdown

These rules are for links in markdown. A config file, such as a navbar item, names a section or a web address in its own way. The [configuration section](../35_configuration/01_overview.md) explains those.
