---
title: "Frontmatter"
description: "Every frontmatter field a docs page may carry: title, description, sidebar_label, sidebar_position, draft and tags."
---

# Frontmatter

A docs page starts with a short block of YAML, its frontmatter. Only `title` is required. The other fields change how the page is listed, or keep it out of a published site. This page lists every field a docs page may use.

## An example

```markdown
---
title: "Authentication and authorization"
description: "How agentks checks who is asking, and what they may do."
sidebar_label: "Auth"
tags: [security, access-keys]
draft: false
---

# Authentication and authorization

The page starts here.
```

## The fields

| Field | Type | Required | Meaning |
|---|---|---|---|
| `title` | text | yes | The page's name. The sidebar and the previous and next links use it |
| `description` | text | no | A one-line summary of the page |
| `sidebar_label` | text | no | Shorter text for the sidebar, when the title is long |
| `sidebar_position` | number | no | Accepted, but does not change the order. The sidebar orders pages by prefix |
| `draft` | `true` or `false` | no | `true` keeps the page out of a published site. The local app shows it with a draft badge |
| `tags` | list of text | no | Words that describe the page |

Any other key is reported as a warning by `agentks check section`, with the list of keys a docs page may use. It usually means a typo, such as `sidebar-label` for `sidebar_label`.

## title

Every docs page needs one. A page with no `title` is an error in `agentks check section`.

```yaml
title: "Getting started with the CLI"
```

Quote the title when it holds a colon, `#` or another YAML character: `title: "Setup: the short way"`.

The docs layout does not print the title above the page. Start the body with a `#` heading that repeats it; see [writing content](../10_writing-content/01_overview.md), under headings and the outline.

## sidebar_label

Use it when the title is too long for the sidebar:

```yaml
title: "A complete guide to authentication and authorization"
sidebar_label: "Auth guide"
```

The page keeps its full title everywhere else.

## sidebar_position

agentks accepts this key without a warning, but the sidebar orders a page's siblings by their prefixes only, so the key does not move the page. To change the order, renumber the file with `agentks move`. Then the order also stays visible in the file names, for people and agents alike.

## draft

```yaml
draft: true
```

A draft shows in the local app with a badge, and a site published with `agentks build` leaves it out. The value must be the word `true`, not the text `"true"`. See [writing content](../10_writing-content/01_overview.md), under drafts.

## tags and description

Both describe the page for the people and the agents who read its files. Write a description as one plain sentence about what the reader gets. Write tags as a YAML list:

```yaml
tags:
  - security
  - access-keys
```

## What never goes in frontmatter

- **The order.** It lives in the `NN_` prefix of the file name.
- **The URL.** agentks derives it from the path.
- **The folder's label.** It lives in the folder's `settings.json`.
- **Anything about how to draw the page.** The section's layout, chosen in `config/site.yaml`, draws every page the same way.
