---
title: "Relative links render one level too deep — the renderer, not the content"
status: done
---

# Overview

**A relative link written correctly against the file on disk renders as an href
that resolves one level too deep in the browser.** Every non-index page is
affected, in every section, and the effect is a 404 on a link that is correct in
the source.

This is the **root cause** of what [`140`](./030_user-guide-relative-links-404.md)
and [`150`](./040_site-wide-link-rot.md) measured. Both of those subtasks
recorded the breakage accurately and then blamed the wrong layer — they concluded
the *authors* were wrong and prescribed rewriting content to site-absolute form.
That prescription was carried out on 341 links and has since been reverted
(`ee404bb` on `fix/relative-link-rendering`); see
[`180`](./050_correct-the-published-records.md) for the record corrections and
[`170`](./020_relative-links-are-the-contract.md) for why the wrong form was
picked.

**Done when** a relative link authored against the file's own directory resolves
in a browser, the fix carries a control test that fails when reverted, and no
content file had to change to make it true.

# References

- The defective transform:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts` — `rewriteHref()`
- The slug rule that creates the extra level:
  `astro-doc-code/src/parsers/content-types/docs.ts` → `DocsParser.generateSlug`
  (line 86, `.replace(/\/index$/, '')`)
- The tracker's own re-rooting pass, which solves a *different* off-by-one and is
  the nearest prior art:
  `astro-doc-code/src/parsers/postprocessors/issue-body-links.ts`
- Why the source form may not be changed to work around this:
  [`170`](./020_relative-links-are-the-contract.md)
- Open question on whether the tracker pipeline shares the defect:
  [`190`](./060_does-the-tracker-share-it.md)
- The measurements, both taken before the cause was known:
  [`140`](./030_user-guide-relative-links-404.md),
  [`150`](./040_site-wide-link-rot.md)

# Todo list

- [x] Add the URL-depth adjustment to `rewriteHref()` —
      `path.posix.join('..', pathPart)`, gated on `addLevel`
- [x] Exempt index pages — `isIndexPage()` mirrors `generateSlug`'s
      `.replace(/\/index$/, '')` line for line, including the leading slash
- [x] **Control test, both directions** — 418 errors with the shift disabled, 55
      with it enabled, same tree and the same 15,589 links
- [x] Verify over real HTTP against a served `dist/`
- [x] Re-measure and record before/after
- [x] Confirm **zero content files changed**
- [x] Update `default-docs/data/dev-docs/05_architecture/04_parser/06_post-processing.md`

# Outcomes and Next Steps

**Fixed 2026-08-03. Three lines of logic, and the diagnosis it replaces cost a
day and 341 reverted edits.**

### The measurement, both directions, on one tree

| Build | Broken in-body links | Pages | Links checked |
|---|---:|---:|---:|
| shift **disabled** (the shipped behaviour) | **418** | 173 | 15,589 |
| shift **enabled** | **55** | 173 | 15,589 |

The control was run by editing one line to `const addLevel = false`, rebuilding,
re-measuring, then restoring and rebuilding again — so both numbers come from the
same content, the same checker and the same 15,589 links. **A fix that only
produces a good number after it is applied proves nothing about whether it could
have failed.**

### Traced end to end over HTTP, before and after

The check that would have prevented this whole group, run properly this time:

| | Request | Result |
|---|---|---|
| The page | `/user-guide/getting-started/installation` | `301 → …/installation/` — **the trailing slash is what creates the extra level** |
| Before | `…/installation/claude-skills` (where `./claude-skills` resolved) | `404` |
| Intended | `/user-guide/getting-started/claude-skills` | exists |
| After | rebuilt page emits `href="../claude-skills"` | **`200`** |

The redirect in the first row is the mechanism made visible. It was never checked
before the 341-link rewrite, and it costs one request.

### Zero content files changed

`git status` over `default-docs/data/user-guide` and `dev-docs` after the fix:
nothing. The only edits are the transform, its dev-docs page, and this record.

# The 55 that remain, and why they are not this subtask's

**They are real, and none of them is a rendering defect.** Categorised from the
checker's JSON:

| Count | Kind |
|---:|---|
| 46 | Relative links whose target genuinely does not exist |
| 4 | `/blog/tag/…` — a feature that was never built |
| 3 | Stale `/docs/…` base from a section rename |
| 2 | Other site-absolute links with a missing target |

Spot-checked one to make sure the fix was not creating them:
`user-guide/19_issues/01_overview.md:105` writes
`[Lifecycle and Review](./lifecycle-and-review)`, but that file lives at
`19_issues/04_setup/06_lifecycle-and-review.md`. The link was written pointing at
the wrong directory. It was invisible while **every** relative link was broken,
and it is visible now — which is the fix working.

**These need their own home.** They are content corrections, not renderer work,
and folding them in here would repeat exactly the mistake this group exists to
correct: fixing content because a rendering measurement pointed at it.

# Details

## The mechanism

Links are authored relative to **the file's own directory on disk**. That is what
a markdown editor previews, what a link checker resolves, and what `agent-ks move`
recomputes when a file moves.

A page is emitted as `<slug>/index.html`, so its URL ends in a slash — and the
file's own name has become a directory segment:

| | Path | Base for resolution |
|---|---|---|
| Source | `05_getting-started/02_installation.md` | `05_getting-started/` |
| URL | `/user-guide/getting-started/installation/` | `…/getting-started/installation/` |

The URL base is **one level deeper** than the source directory. So a link written
`./05_claude-skills.md` — correct on disk, sitting right next to the file —
becomes `./claude-skills` after prefix and extension stripping, and a browser
resolves that against the *page* URL:

```
/user-guide/getting-started/installation/  +  ./claude-skills
  → /user-guide/getting-started/installation/claude-skills   ✗ 404
  intended: /user-guide/getting-started/claude-skills         ✓ exists
```

Confirmed over real HTTP against `dist/`, not inferred from path arithmetic:
the resolved URL returns **404**, the intended one returns **200**.

`rewriteHref()` strips the `.md` extension and the `NN_` ordering prefix, and
then emits the `./` or `../` **unchanged**. Nothing in the pipeline accounts for
the level the page's own URL adds.

## Why index pages are the exception

`generateSlug` collapses a trailing `/index`:

```ts
.replace(/\/index$/, '')      // docs.ts:86
```

So `a/index.md` publishes at `a`, giving the URL base `…/a/` — which **is** the
source directory `a/`. An index page needs no adjustment; every other page needs
exactly one level. That asymmetry is the only special case, and it is why the fix
cannot be a blanket string prepend.

There are currently **no `index.md` files** under `default-docs/data/user-guide`,
so this path is presently unexercised — which is precisely why it needs a test
rather than an assumption.

## Why this must not be fixed in the content

Covered fully in [`170`](./020_relative-links-are-the-contract.md). In short:
`agent-ks move` skips any link starting with `/`
(`plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs` →
`isIgnorableTarget`), so converting content to site-absolute form renders
correctly *and* silently removes every converted link from move's rewriting. The
links then rot on the next file move with nothing left to catch it. Relative
links are the authoring contract in a markdown-first system, not an accident to
normalise away.

## The reasoning error this subtask exists to correct

[`140`](./030_user-guide-relative-links-404.md) recorded, as the argument for
rewriting the content:

> *"not one of 101 links got it right"*

A 100% failure rate across 101 independently-written links is evidence about the
**tool**, not the authors. It was written down as an indictment of the authors
and used to justify changing all 101. The renderer — 81 lines — was never opened
until after the rewrite had been made and pushed.

**The generalisable rule: when every user of a thing uses it wrongly, suspect the
thing.** A measurement can be perfectly correct and still be attributed to the
wrong layer; the measurement here was right every time and the conclusion was
wrong anyway.

# Reopened, then closed — edge shapes the audits found

**Reopened 2026-08-03.** The core fix stood; Codex ran the processor against a
matrix of link shapes and found six it still got wrong. Recorded in
[the review round](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/050_independent-reviews.md).

**Closed 2026-08-04 with two of the six fixed here and four handed on**, because
the four are all defects *of the level shift*, and the level shift is being
deleted — see below.

## Fixed here

| Input | Was | Now |
|---|---|---|
| `mailto:guide.md` | `../mailto:guide` | unchanged |
| `./05_mermaid-full-page.mmd` | unchanged → 404 | `../mermaid-full-page` |

**`mailto:`** ended in `.md`, so it satisfied the markdown test and was rewritten
as a page path. The guard is a **URI-scheme** test (`^scheme:`), not a `mailto:`
special case — a relative path can never carry a scheme, so the blanket skip is
safe and covers `tel:` and `data:` for free. It applies to the blog branch too,
which had the same bug.

**Diagram pages** were caught by the non-markdown skip added for colocated
assets, which was too broad: `.mmd` / `.mermaid` / `.dot` / `.gv` /
`.excalidraw` are first-class pages here. The discriminator is now the same one
the loader uses — `diagram-pages.ts` publishes a diagram file only when it
carries an `NN_` prefix, and never scans `assets/`. So `./10_flow.excalidraw`
is a page and `./assets/scene.excalidraw` stays an asset. The extension list is
**imported** from `DIAGRAM_EXTENSIONS` rather than retyped, so the two cannot
drift.

### Control-tested both directions

16 link shapes, run against the fixed processor and against `HEAD`'s:

| Version | Result |
|---|---|
| fixed | 16 / 16 pass |
| before the fix | **5 fail** — exactly the targeted shapes, including the blog `mailto:` |

The 11 that had to stay still stayed still: `./assets/scene.excalidraw`,
`../img/x.png`, `./asset.pdf`, `./asset.pdf#page=2`, `./02_sibling.md`,
`sibling.md`, `../10_other/03_x.md#f`, `#anchor`, an external `https://…/a.md`,
a site-absolute path, and `./sub/index.md`. Full build passes — 1,169 pages.

## Handed to the June issue, not fixed here

| Input | Wrong how |
|---|---|
| `./asset.pdf?download=1` | shifted — the query string defeats the extension test |
| `./page.md?x=1` | shifted, keeps `.md` — the strip is anchored to `$` |
| nested bare `index.md` | `../index` — the collapse pattern needs a leading slash |
| blog sibling links | no shift, date prefix kept |

**Every one of these is a bug in the one-level shift, and the shift is going.**
It is a constant offset, so it is right on the built site and wrong on the dev
server, which serves the same page without a trailing slash.
[`2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md`](../../../2026-08-04-absolute-link-resolution/subtasks/100_absolute-resolution/030_comprehensive-panel-subdoc-links.md)
decided the replacement on 2026-06-09: resolve internal links to **root-absolute
at render time**, so no browser base is involved at all. Patching four shapes of
a function scheduled for deletion buys nothing; they are listed in that subtask
as cases its replacement must handle.
