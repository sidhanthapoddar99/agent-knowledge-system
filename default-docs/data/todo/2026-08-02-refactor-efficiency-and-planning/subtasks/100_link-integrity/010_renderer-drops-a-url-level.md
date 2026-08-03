---
title: "Relative links render one level too deep — the renderer, not the content"
status: open
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

- [ ] Add the URL-depth adjustment to `rewriteHref()` in `internal-links.ts`:
      prepend one level (`path.posix.join('..', pathPart)`) for every page whose
      slug does **not** collapse to its own directory
- [ ] Exempt index pages — `generateSlug` maps `a/index.md` to `a`, so an index
      page's URL base already **is** its source directory and must not be shifted
- [ ] **Control test, both directions.** A relative link must resolve after the
      fix, and reverting the fix must make the same link 404. A test that only
      passes after the change proves nothing about whether it can fail
- [ ] Verify against the built site over real HTTP, not by reasoning about paths
      — serve `dist/` and assert the status code
- [ ] Re-measure the sections [`150`](./040_site-wide-link-rot.md) counted
      (`user-guide` 243, `dev-docs` 70) and record the after numbers beside the
      before ones
- [ ] Confirm **zero content files changed** as part of this fix. If any content
      edit is needed to make a link resolve, the fix is in the wrong place
- [ ] Update the page documenting this transform:
      `default-docs/data/dev-docs/05_architecture/04_parser/06_post-processing.md`

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — cause identified and the revert landed; the fix itself is not
> written. Next action is the `rewriteHref()` change plus its control test.

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
