---
title: "What happened, and why it took two rounds to see"
---

# The short version

**A link that is correct on disk was rendered into an href that is correct in
only one of the two environments this project runs in — and which environment you
are in is invisible from the code that writes the href.** Two fixes were shipped
and both were reverted, because both tried to pick a constant for a difference
that is not constant.

The measured evidence is [the trailing-slash matrix](./10_the-trailing-slash-matrix.html).
This note is the story around it: how the wrong conclusion was reached twice, what
each round actually proved, and which of those lessons outlive the bug.

# The mechanism, in one paragraph

A browser resolves a relative href against the **directory portion** of the
address bar, and the trailing slash is the only thing that says where that
directory ends. `/a/b/c` means *c is a file in `/a/b/`*; `/a/b/c/` means *c is a
folder I am inside*. Every page in this project is built as `<slug>/index.html`,
so a real static host sees `/a/b/c` as a directory, **301s to `/a/b/c/`**, and
serves the index — while `astro dev` and `astro preview` are route tables rather
than file servers, answer `/a/b/c` exactly as asked, and never add the slash.
**The two environments differ by exactly one URL segment**, and the renderer,
which runs at build time, has no way to know which one the reader will be in.

# Round one — the shift (2026-08-03)

A one-level `../` shift was added to `internal-links.ts`. It was reasoned
correctly from the slash-form URL, and it was **control-tested in both
directions**: 418 broken with the shift off, 55 with it on, same tree, same
checker. That reads as rigour.

**The control could not have failed.** Both numbers came from
`check-content-links.mjs`, which reads `dist/` from the filesystem and
*constructs* each page URL as `'/' + path + '/'`. It assumes the trailing slash.
So both directions of the control were measured in the one environment where the
shift is correct, and the environment a person actually browses in was never in
the sample.

> **Two directions of one method are still one method.** A control proves the
> measurement responds to the change. It does not prove the measurement is asking
> the right question.

That rule had already been written down on this project, after two independent
audits agreed on a finding that fifteen browser clicks then destroyed. It had
never been applied to a *control test*, where it matters just as much.

Caught by Sid, in a browser, in one click, the next day.

# Round two — removing the shift (2026-08-04)

The shift was removed. Measured against dev, against preview, and in a browser:
clean. That also looked like a fix.

**It was the same error with the sign flipped.** `astro dev` and `astro preview`
are both route tables — they are the *same column* of the matrix. Testing one
against the other is testing one column twice. The static host, the only
environment that actually ships, was still unmeasured; a live crawl of a real
file server put it at **546 broken links out of 1,245**.

**The generalisable point:** two tools agreeing is not corroboration when they
share an assumption. The question to ask of any second opinion is not *"does it
agree?"* but *"could it have disagreed?"*

# Round three — `trailingSlash: 'always'` (2026-08-04)

If the two environments disagree, make them agree: tell Astro to always use the
slash form, and one shift value becomes correct everywhere. Tested, and it does
work on the shipped behaviour — 546 broken down to 4, and those 4 are missing
anchors rather than path failures.

**It was still reverted, for two reasons, and the second is fatal.**

1. Astro's dev server then answers `404` for the no-slash form instead of
   redirecting to the slash form — and our own layouts still emit hrefs without
   the slash. Clicking any sidebar item in dev 404s. That is fixable in the
   layouts.
2. **It 404s the entire `/artifacts/<file>.html` route**, which serves every HTML
   artifact full-page and is also the `src` of every embedded artifact iframe.
   Those URLs end in a file extension and can never carry a trailing slash. This
   is *not* fixable in the layouts — the two ideas are structurally incompatible.

The second was found by opening an artifact and getting a 404 on a page that had
shipped and worked for weeks. It is worth noting how: **the check was a side
effect of verifying something else**, not a test anyone thought to write.

# What this leaves

**The tree is in the top-left cell of the matrix, deliberately.** No shift, no
`trailingSlash`. The renderer emits the author's own relative shape.

That is right for every URL the site's own navigation produces and wrong for a
hand-typed or bookmarked trailing-slash URL on a static host. It is chosen
because **dev is where this project is actually used**, and an engine that does
not work where it is used is not a tradeable position.

The real fix — [the path map](./30_the-path-map.md) — makes the whole question
disappear rather than picking a side of it.

# The lessons worth keeping

These outlive the bug, and each one cost a day:

- **A control test proves responsiveness, not validity.** Both directions of one
  method are still one method.
- **Corroboration requires independence.** Two tools that share an assumption
  cannot check each other. Ask whether the second one *could* have disagreed.
- **A gate that cannot see a failure class does not merely miss it — it certifies
  it.** The old checker reported `0 broken` while four anchors were broken,
  because it discarded fragments.
- **Measure the environment that ships.** Neither `astro dev` nor `astro preview`
  reproduces a static host, and the difference is not cosmetic — it is 4 versus
  546.
- **Uniform failure across independent authors is evidence about the tool, not
  about the authors.** This is the same lesson that the 341-link rewrite cost, and
  it recurred here one layer up.
