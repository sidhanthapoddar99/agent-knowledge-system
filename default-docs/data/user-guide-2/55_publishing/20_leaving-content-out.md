---
title: "Leaving content out"
---

Some content belongs in your working project but not on the public site: a draft page, a roadmap section, the issue tracker, a navbar link to an internal tool. Mark it, and `agentks build` leaves it out. The local app still shows it, with a small "not published" badge, so nobody forgets it is there.

## The two markers

| To leave out | Write | Where |
|---|---|---|
| **One page** | `draft: true` | In the page's frontmatter |
| **A whole section** | `publish: false` | On the section, under `pages:` in `config/site.yaml` |
| **A navbar item**, or one item in a dropdown | `publish: false` | On the item in `config/navbar.yaml` |
| **A footer link** | `publish: false` | On the link in `config/footer.yaml` |

### A draft page

```yaml
---
title: "Release plan"
draft: true
---
```

Remove the line, or set `draft: false`, when the page is ready.

### A section

Keep the issue tracker in the local app, but off the website:

```yaml
# config/site.yaml
pages:
  todo:
    base_url: "/todo"
    type: issues
    layout: "@issues/default"
    data: "@data/todo"
    publish: false
```

### A navbar item

```yaml
# config/navbar.yaml
items:
  - label: "Roadmap"
    href: "/todo"
    publish: false
```

In a dropdown, each child item takes its own `publish: false`, so you can hide one entry and keep the rest.

## What "left out" means

An unpublished page leaves no trace on the published site. It is absent from:

- the HTML pages and the sidebar;
- `sitemap.xml`, the blog feed and the search index.

An unpublished navbar item or footer link is missing from every page.

## A published page cannot link to an unpublished one

If a published page links to a draft, or into a section with `publish: false`, the build fails and names both pages. A published site must never link into a hole.

Fix it in one of three ways:

- remove the link;
- publish the target;
- leave the linking page out as well.

The local app shows everything, so such a link works there. Run the build before you rely on it.

## The local app always shows everything

There is no "production mode" to switch on in the local app. `agentks start` shows every page, draft or not, with the badge on what will not be published. Only `agentks build` leaves content out.

> [!IMPORTANT]
> These markers keep content off the **published site** only. Anyone you share the running project with sees drafts and unpublished sections too, even with a `read` key ([editing and sharing](../50_editing-and-sharing/01_overview.md)).
