---
title: "The site index"
description: "agentks-index: the engine's one view of a project, the one producer of URLs, the link resolver, the reference graph and incremental updates."
---

`agentks-index` (layer 3) builds the site index: the engine's single view of a project. Every derived value starts from it, and it is the **only** code that turns a path into a URL. It depends on `agentks-core`, `agentks-config` and `agentks-content`. It holds no page bodies and renders nothing.

The index is never saved to disk. It is rebuilt at every start, because a stale index is the worst kind of wrong, and rebuilding is fast.

## What it holds

`SiteIndex::build` walks every section once, through a `FileSource`, and reads each file: its bytes for the hash, its name, its kind, and for markdown its frontmatter and references. A `custom` section is one YAML file and is not walked.

Each file becomes an `Entry`:

| Field | Holds |
|---|---|
| `path` | The file, relative to the project root |
| `section` | Its section |
| `kind` | A page of some kind, a sidecar, or an asset |
| `hash` | BLAKE3 of its bytes |
| `frontmatter` | For markdown files |
| `title`, `label` | The title, and the sidebar label (`sidebar_label`, else `title`) |
| `order` | Its sort key among its siblings |
| `url` | Its URL, or none for a file that is not a page |
| `refs` | Its outgoing links and embeds, each with its line |

Each folder becomes a `Folder`: its settings, its rolled-up hash and its children, already in sidebar order. Settings files are hashed into their folder but are not entries.

## Hashes

- **A file's hash** is BLAKE3 of its bytes.
- **A folder's hash** is rolled up from its children's names and hashes, and its settings files, Merkle style. Equal folder hashes mean nothing below changed. A change to one file re-hashes only the chain of folders above it.

These hashes are what the caches and the browser key on. The [caching section](../20_caching/05_keys-and-invalidation.md) shows how they become cache keys.

## Routing

The index derives every URL: the section's `base_url`, then the path with `NN_` prefixes and page extensions removed. Docs, blog and tracker sections each have their own rules. It settles two problems while it routes:

- **Slug collisions.** Two files that would claim one URL go through the content crate's collision pass. One keeps the URL and shows a `slug-collision` error; the rest lose it.
- **Reserved URLs.** A page whose URL would start with a reserved segment, such as `/api`, gets no URL and a `url-reserved` error.

The result is the `RouteTable`, which the server answers from and `agentks build` writes from, so the two can never serve different sets of routes.

| List | Holds |
|---|---|
| `routes` | Every canonical URL, with its section and what answers it |
| `redirects` | Alias URLs and the canonical URL each leads to |
| `anchored_redirects` | Alias URLs that lead to a heading, such as a plan stage's own address, which leads to its heading on the plan page |

What answers a route is one of: a page file, a tracker's issue list, one issue, a blog's post list, a custom page, or one plan of an issue. Each list is sorted by URL, so a lookup is a binary search.

## Resolving links

A page writes links relative to its own file. `SiteIndex::resolve` turns each one into the URL of the file it names. It works **file first, then the index**: it joins the link with the folder of the file that holds it, finds the file there, and looks that file up. There is no arithmetic from link text to URL.

| Result | When | What the page renders |
|---|---|---|
| `Page` | The target is a page | Its URL, with any `#fragment` kept |
| `Asset` | The target is another file in a content section | `/content-assets/<path>` |
| `External` | The link has a scheme, such as `https:` | The link as written |
| `Miss` | No target: `link-missing`, a `/` link (`link-form`), a path out of the project (`path-escapes-project`), or a target that lost its URL | A broken-link marker, and a content error |

`SiteIndex::href` applies the hosting prefix, such as `/docs`, to a URL. It is the one place the prefix is added. Every href the engine writes, in bodies, sidebars and the manifest, comes from it. The local server always serves at `/`; `agentks build` sets the prefix with `with_base_path`.

Some files have no page of their own and appear on another page: a comment or the glossary on its issue's page, a plan's stages on the plan page. `shown_at` gives the page and heading where such a file appears, so a link to it still lands in the right place.

## The reference graph

The index records every reference, so it can answer questions in both directions:

| Method | Answers | Used for |
|---|---|---|
| `linked_from` | Which pages link to this file | Backlinks, and re-rendering pages whose link target moved |
| `embedded_by` | Which pages embed this file | Invalidating a page when a file it embeds changes |
| `orphans` | Which pages nothing links to | Checks |
| `broken` | Every reference whose target is missing | Checks |

## One scanner for references

`scan_references` finds every `[text](path)` link, image, reference definition and `[[path]]` embed in markdown, with its line. It skips code: fenced blocks and inline code spans hold no links. Inside a fenced block an embed still counts when its path starts with `./` or `../` and holds no space or comma, so a diagram fence can pull in its source file while documentation examples stay literal.

The same scanner serves two jobs that need no index:

- `check_link_form`, behind `agentks check link-form`;
- `rewrite_for_move`, the link rewrite behind `agentks move`.

So the index, the link check and the move command always agree on what a reference is.

## Incremental updates

`SiteIndex::apply` takes a batch of `FileChange`s (written or removed) and returns a **new** index plus an `IndexChanges` report. The old index is untouched, and the new one shares every unchanged entry and folder with it through reference-counted pointers.

The update:

1. re-reads the changed files;
2. re-hashes only the chains of folders above them;
3. derives URLs again only when something a URL depends on changed: a file came or went, or a name, kind, title or order changed;
4. reads everything again when a section root's settings changed.

`IndexChanges` reports, in index terms, what the site must refresh:

| Field | Holds |
|---|---|
| `pages` | Pages whose render inputs changed: each changed page, every page that embeds or links a changed file, every page that links a file whose URL changed |
| `removed` | Pages that no longer exist |
| `moved` | Pages whose file moved in the same batch: same hash, new path |
| `folders` | Folders whose rolled-up hash changed |
| `sections` | Sections whose sidebar or issue list changed |

The site crate turns this report into data keys and pushes.

## Performance

The crate carries a benchmark, ignored by default. Point it at a folder holding `data/{user-guide,dev-docs,todo,blog}`:

```bash
AGENTKS_BENCH_CORPUS=<folder> cargo test -p agentks-index --release -- --ignored bench --nocapture
```

| Corpus | Cold build | One-file update |
|---|---|---|
| 1,659 files, 1,375 routes | 49 ms | 0.2 ms, 2 folder hashes |
| The same, copied 20 times: 33,180 files | 1.04 s | 7 ms |

At 20 times the size, most of the update cost is copying the two path maps. A persistent map could replace them behind the same API if that ever matters.

## Tests

The tests build a small project in memory and pass stand-in content rules through the same walk, so the index is tested on its own.

## Related

- [Content: the format rules](./25_content.md): the rules the walk calls for each file.
- [Render: the markdown pipeline](./35_render.md): the resolver's main caller.
- [Site: the engine as one object](./45_site.md): where the index snapshot lives and changes are applied.
