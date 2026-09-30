---
title: "Headings and the outline"
description: "How a page's title and headings work: the ID agentks gives each heading, links to a heading, and the outline beside the page."
---

# Headings and the outline

Headings give a page its structure. agentks gives every heading an ID, so you can link straight to it, and lists the headings in an outline beside the page. This page explains the page title, the ID rule and how to link to a heading.

## The title and the first heading

A page's name comes from its frontmatter `title`. The sidebar and the previous and next links use it. The docs layout draws the page body as you wrote it and adds no title of its own, so start the body of a docs page with a `#` heading that repeats the title:

```markdown
---
title: "Install the CLI"
---

# Install the CLI

Download the installer, then run it.

## Check the version
```

Then use `##` for the main sections and `###` for the parts inside them. Keep one `#` heading per page. Do not skip a level, for example from `##` straight to `####`.

## Heading IDs

agentks turns each heading's text into an ID with one fixed rule:

1. Lowercase the text.
2. Drop every character that is not an ASCII letter, a digit, `_`, a space or `-`.
3. Turn each run of spaces and hyphens into one `-`, and trim `-` from both ends.
4. If the page already has that ID, add `-1`, then `-2`, and so on.

| Heading | ID |
|---|---|
| `## Getting Started` | `getting-started` |
| `## OAuth 2.0 Setup` | `oauth-20-setup` |
| `## Use the move command` | `use-the-move-command` |
| `## 100% done!` | `100-done` |
| a second `## Getting Started` on the same page | `getting-started-1` |

Two cases surprise people:

- **Letters outside ASCII are dropped.** `## Café menu` becomes `caf-menu`. A heading with no ASCII letters or digits at all gets no ID, and it does not appear in the outline.
- **Some punctuation leaves a trace.** `&` and `'` are written as HTML codes before the rule runs, so `## Q & A` becomes `q-amp-a` and `## Don't panic` becomes `don39t-panic`.

The rule never changes between versions, because a changed ID would break every link to it. If a heading must have a clean anchor, word it with plain letters and digits.

## Linking to a heading

Add the ID after `#`. On the same page:

```markdown
See [checking the version](#check-the-version).
```

On another page, put it after the file path:

```markdown
See [the version check](../05_setup/10_install.md#check-the-version).
```

agentks keeps the `#` part when it turns the path into a URL. Renaming a heading changes its ID, and `agentks move` only follows files. So after you rename a heading, search for links to its old ID:

```bash
agentks find 'check-the-version' --fixed-strings
```

## The outline

The outline beside a docs page lists its headings, each one a link to its place on the page. The heading you are reading is highlighted as you scroll. Diagram and artifact pages have no headings, so they have no outline, and their content takes the full width.

A good outline reads like a table of contents:

- **Be specific.** "Configure the OAuth provider" says more than "Step 1".
- **Be short.** Three to six words fit the outline without being cut.
- **Be consistent.** Pick one style, such as "Install the CLI" or "Installing the CLI", and keep to it.
