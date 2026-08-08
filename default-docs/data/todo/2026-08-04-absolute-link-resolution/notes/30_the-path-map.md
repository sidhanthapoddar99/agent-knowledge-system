---
title: "The design — one path map, one resolver, absolute hrefs everywhere"
---

# The conclusion

**Build a map from every source file to its published URL at scan time, and have
one shared resolver turn every internal link into a root-absolute href.** The
browser then never does relative arithmetic, so the trailing slash stops
mattering rather than being made uniform.

```
   relative link          absolute path of              absolute URL
   as authored       →    the target FILE          →    on the web

   ./02_installation.md   …/user-guide/05_getting-started/    /user-guide/getting-started/
                            02_installation.md                  installation
```

Three stages, and the middle one is the point: **resolve to a file first, then
ask the map what that file's URL is.** Going straight from link text to URL is
what every partial fix so far has done, and it is why each of them had to
re-implement prefix stripping, index collapsing and section base URLs from
incomplete information.

# Half this pipeline already does it

**`asset-src.ts` — postprocessor 4, two stages after the one that writes link
hrefs — already resolves `<img src>` to absolute `/content-assets/…` URLs.** Its
comment gives the reason: *"content folders aren't served at any browser-relative
position."*

That is equally true of pages, and it means the same markdown file ships an image
that cannot break and a link that can:

```
<img src="./assets/diagram.png">  →  /content-assets/…/diagram.png   absolute ✅
<a href="./02_installation.md">   →  ./installation                  relative ❌
```

**So this is not a new architecture — it is applying a decision this pipeline
already made, to the stage that was skipped.** Full walk-through:
[the pipeline trace](./25_the-pipeline-trace.md).

# Why absolute, and not a better relative

A relative href encodes *"N steps up from here"*, and **"here" is not a property
of the content — it is a property of where the content is being displayed.** The
same bytes are shown at more than one URL depth in this project, so no single
relative href can be right for all of them:

| The same subtask HTML, displayed at | Address | `../../x` resolves to |
|---|---|---|
| its own page | `/todo/<issue>/subtasks/03_…` | `/todo/x` ✅ |
| the Comprehensive panel (a client-side tab swap — the address never deepens) | `/todo/<issue>` | `/x` ❌ |

That is not a trailing-slash problem and no slash policy fixes it. It is the same
root cause one level clearer: **a relative link is a claim about the reader's
location, and the renderer is not entitled to make one.**

An absolute URL has none of these properties. It is correct on the page, in the
embed, behind a redirect, at a bookmarked slash-form URL, and through a CDN that
rewrites paths.

# What the resolver needs, and what is missing

Checked in the tree on 2026-08-04:

| Ingredient | Where it is |
|---|---|
| the page's own file path | ✅ `ProcessContext.filePath` |
| the content root | ✅ `ProcessContext.basePath` |
| the prefix-stripping / index-collapsing slug rule | ✅ implemented in `internal-links.ts` and mirrored in `DocsParser.generateSlug` |
| **the section's `base_url`** (`/user-guide`, `/todo`) | ❌ **never reaches the parser layer** |

`base_url` is the whole gap — `grep base_url` across `src/parsers/` returns
nothing. The loaders that drive the render have it at their call sites
(`route-match` and `static-paths` already hold `pageConfig.base_url`), so it is a
threading job, not a discovery job.

# Why a map rather than arithmetic

The resolver could compute a URL from a path by re-applying the slug rules. It
should not, for three reasons:

- **The slug rules already exist in more than one place** and have drifted before.
  A map is built by the loader that already knows the answer, so there is one
  producer and no mirror to keep in step.
- **It makes the failure loud.** A link naming a file that does not exist is a
  lookup miss — reportable, at build time, with the source file and line. Path
  arithmetic silently produces a plausible URL for a target that was never there,
  which is exactly how 334 slug-form links survived every gate.
- **It is the natural home for the hosting prefix.** One place produces every
  URL, so [the prefix](./40_the-hosting-path-prefix.md) is applied once, in that
  place.

# The shape

One map, built during the content scan, keyed by absolute file path:

```
absolute file path  →  { url, contentType, section }
```

and one function, shared by docs, blog and the tracker:

```
resolve(hrefAsAuthored, contextFilePath)  →  absolute URL | miss
```

**Every content type goes through it.** Today docs are handled by
`internal-links.ts` and the tracker's root `issue.md` by a separate
`issue-body-links.ts`, with blog handled by neither beyond extension stripping.
Three behaviours for one question is why the tracker's and the docs' answers to
"does this link work" have been different all along. The two postprocessors
collapse into one call.

# Consequences worth stating before the work starts

- **Rendered hrefs stop matching what the author typed.** That is the intent —
  the absolute URL is the renderer's to produce and never the author's to type.
  The rule for *content* does not change: links in markdown stay relative,
  because that is what is true on disk.
- **A missing target becomes a build-time error rather than a 404 at read time.**
  That is a gain, but it needs a decision on strictness: hard-fail, or warn and
  emit the link unresolved. Warn first, then tighten once the count is zero.
- **The gate that proves it is `scripts/checks/check-links.mjs`**, run against a real
  static host as well as dev. Both numbers, before and after, belong in the
  subtask that lands the change.
