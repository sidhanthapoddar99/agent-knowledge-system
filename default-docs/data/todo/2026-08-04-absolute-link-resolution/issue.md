---
title: "The renderer owns the URL — absolute link resolution + a hosting path prefix"
---

# Overview

**Every internal link in this project is emitted as a browser-relative href, and
that is the defect.** A relative href means *"N steps up from here"* — but *here*
is the address the reader happens to be standing on, and that is decided by the
server at request time, not by the renderer at build time. The renderer is
guessing about something it cannot see.

Two guesses were tried in two days and both were reverted:

| Attempt | Result |
|---|---|
| A constant `../` depth shift (2026-08-03) | Correct on a static host, **broken in dev**. Removed 2026-08-04 |
| `trailingSlash: 'always'` (2026-08-04) | Correct on a static host, **404s every page and the whole `/artifacts` route in dev**. Removed 2026-08-04 |

**Neither was a bad idea badly executed. Both were the same category error:**
trying to pick one constant for two environments that differ by exactly the
amount the constant changes. The full four-way trace is in
[10 the trailing-slash matrix](./notes/10_the-trailing-slash-matrix.html), and the
narrative of how it took two rounds to see that is in
[20 what happened](./notes/20_what-happened-and-why.md).

**The fix is to stop guessing.** Build a map at scan time — every source file to
its published URL — and have one shared resolver turn every internal link into a
**root-absolute** href. Then there is no directory portion to resolve against,
the trailing slash stops mattering rather than being made uniform, and the same
content embedded at a different URL depth still links correctly.

```
relative link in a file  →  absolute path of the target FILE  →  absolute URL on the web
       ./02_installation.md          …/05_getting-started/02_installation.md
                                                    ↓
                                     /user-guide/getting-started/installation
```

# Why this is one issue and not two

The second half of this issue is a **hosting path prefix** — a `.env`
`PREFIX_PATH=/xyz` that prepends a segment to every generated URL, so the site
can be served from a sub-path of a domain that hosts several static sites.

It looks like an unrelated feature. It is the same question. **A prefix is only
implementable once something owns the final URL** — you cannot prepend a segment
to a href that the browser is going to compute for itself. Today there is no
single place that produces a URL, so there is nowhere to put the prefix. Building
the resolver creates that place, and the prefix is then roughly one line inside
it.

Doing them in the other order, or in two issues, means building the seam twice.

# What this replaces

This issue takes over the whole link-resolution class, which until now was spread
across three places:

- **[the link-integrity group](../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/00_overview.md)**
  in the refactor issue — which found the defect, measured it properly, and
  correctly concluded that no fix belonged there
- **[the issue-link-resolution issue](../2026-06-09-issue-link-resolution/issue.md)**
  — where render-time absolute resolution was first decided, on 2026-06-09, and
  where the Comprehensive-panel worked example was written
- the interim postprocessors themselves, `internal-links.ts` and
  `issue-body-links.ts`, which are two partial answers to one question

⭐ **Start at [15 where this came from](./notes/15_where-this-came-from.md).** It
is the complete map back into that work — every prior subtask and run record,
what each settled, what is still live elsewhere, and the six retracted numbers
nobody should re-quote. **This issue restates none of it**; that note is how you
reach the evidence behind anything claimed here.

**What stays in the link-integrity group, deliberately:** the *file*-level
questions — above all
[the 334 slug-form links](../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/170_relative-but-not-a-path.md),
which name a published slug rather than a file. No renderer change fixes those.
They do, however, become **visible** for the first time once the path map lands,
as lookup misses.

**The engine must work in dev.** That is the standing constraint on everything
here: dev is where this project is actually used, so no change lands that trades
dev correctness for production correctness. The current tree is in that state
deliberately — the author's relative shape is emitted unmodified, which is right
for every URL the site's own navigation produces, and wrong only for a
hand-typed trailing-slash URL on a static host.

# References

- **The four combinations, traced end to end:**
  [10 the trailing-slash matrix](./notes/10_the-trailing-slash-matrix.html)
- **What happened, and why it took two rounds:**
  [20 what happened and why](./notes/20_what-happened-and-why.md)
- **The pipeline, traced byte by byte** — where resolution sits, how the data
  flows, and why dev and a static host disagree:
  [25 the pipeline trace](./notes/25_the-pipeline-trace.md)
- **The design:** [30 the path map](./notes/30_the-path-map.md)
- **The prefix feature:** [40 the hosting path prefix](./notes/40_the-hosting-path-prefix.md)
- The code that emits the relative href today:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts` (docs) and
  `issue-body-links.ts` (the tracker's root `issue.md` only)
- The live rendering gate that measures all of this:
  repo-root `scripts/check-links.mjs`
