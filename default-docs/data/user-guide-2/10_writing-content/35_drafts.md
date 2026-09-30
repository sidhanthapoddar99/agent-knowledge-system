---
title: "Drafts"
description: "Mark a page as a draft to keep writing it in the local app while the published site leaves it out."
---

# Drafts

A draft is a page you can commit and keep working on before it goes public. The local app shows it, marked as a draft. A site published with `agentks build` leaves it out. You mark a draft with one line.

## Mark a page as a draft

For a docs page or a blog post, add `draft: true` to the frontmatter:

```markdown
---
title: "The new sync engine"
draft: true
---

# The new sync engine

Still writing this.
```

A diagram page or an artifact page has no frontmatter, so the line goes in its sidecar file, `NN_name.meta.json`:

```json
{
  "title": "Q3 dashboard",
  "draft": true
}
```

The value must be the word `true`, without quotes. `draft: "true"` is text, not a yes, so the page is not a draft.

## Where a draft shows

| Where | The draft |
|---|---|
| The local app (`agentks start`) | Shows in the sidebar and at its URL, with a draft badge |
| A published site (`agentks build`) | Left out |
| `agentks` commands | Found by searches and checked by `agentks check`, like any page |

So you can review a draft exactly as it will look, in place among the pages around it, without it reaching the public site. The [publishing section](../55_publishing/01_overview.md) covers `agentks build`.

## Publish it

Delete the `draft` line, or set it to `false`. The page goes out with the next build.

Before you do, check the pages that link to it. A published page that links to a page still in draft points at a page the published site does not have. This command lists every file that names the draft:

```bash
agentks find '10_new-sync-engine.md' --fixed-strings --paths-only
```
