---
title: "Every relative link in the issues user-guide was a 404 — 85 of them"
status: done
---

# Overview

**Every relative link in the issues user-guide resolved to a 404 — 85 across 18
of the section's 22 pages.** Measured 2026-08-03 against the *rendered* `href`s
in the built site.

> The title and the numbers here were both corrected after the fact. This was
> filed as *"~10 pages"* on an agent's estimate, re-filed as *"65 of 100"* on my
> own first measurement, and is **85 of 85** on the only measurement that
> resolved links the way a browser does. Each number was the honest best at the
> time; see the warning in Outcomes for why the middle one was wrong.

The section's own navigation is majority-broken. A reader following "see
[Subtasks](../subtasks)" from the `issue.md` page lands on a 404, and nothing
anywhere reports it: the build succeeds, `check issues` is clean, and
`check skill-links` does not look at `data/`.

**Done when** every relative link in `19_issues/` resolves on the built site,
and something mechanical stops the next one — a link check over `data/` is the
obvious candidate, since the same class of defect has now appeared in the skill
(fixed) and the user-guide (this).

Found by the agent rewriting
[the using-with-AI page](../090_silent-failure-defects/010_using-with-ai-page-stale.md), which hit one
instance and flagged the pattern. **It estimated "~10 pages"; measuring found
65 links across 18 files** — the estimate was the right instinct at a sixth of
the true size, which is why it was counted rather than taken.

# References

- The round that found and measured it:
  [0.2.1](../../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md)
- Slug generation: `astro-doc-code/src/parsers/content-types/docs.ts` →
  `DocsParser.generateSlug`
- Exact matching with no fallback: `astro-doc-code/src/pages/lib/route-match.ts`

# Todo list

- [x] Decide the fix: **rewrite the links**, or **make the router fall back** to
      a basename match when a bare relative target is unique in the section.
      Recommended: **rewrite the links** — a router fallback makes two spellings
      both work forever, which is the ambiguity this repo keeps deleting
- [x] Rewrite all 65, folder segment included (`./subtasks` →
      `./sub-docs/subtasks` from a sibling, or a root-relative form)
- [x] **Add a link check over `data/`** and wire it into `agent-ks check` —
      delivered by [`070`](./070_reframe-the-link-checker.md) and
      [`090`](./090_tools-must-say-what-they-skip.md) as `agent-ks check links`
      (resolution, needs a build) and `agent-ks check link-form` (form, source
      only). Neither is this subtask's to close
- [x] Control-test the new check — done as part of those, not here
- [x] Re-measure: expect 0 broken of ~100

# Outcomes and Next Steps

> [!CAUTION]
> **The fix described below was REVERTED. The measurements were not.**
>
> 101 links were rewritten to root-relative form (`/user-guide/issues/<slug>`) on
> 2026-08-03 and the section then read 210 links checked, 0 broken. That
> conversion was undone in `ee404bb`, and
> [`020`](./020_relative-links-are-the-contract.md) converted the section back to
> relative links. **Nothing in this subtask's fix survives in the tree.**
>
> What survives is the measurement, and the reason it was taken twice — which is
> the whole value of this file. Read the warning below it.
>
> The root cause was a renderer defect, not an authoring one:
> [`010`](./010_renderer-drops-a-url-level.md). The argument for root-relative
> form that used to sit in this file has been deleted; it is the reasoning error
> [`130`](./130_what-the-wrong-diagnosis-taught.md) exists to record.

> [!WARNING]
> **My first measurement was wrong, and it under-reported.** The count of "65
> broken, 35 fine" in the Overview came from resolving `./x` as a sibling of the
> *section root*. A browser does not do that. Pages are emitted as
> `<slug>/index.html`, so every page URL ends in a slash, and `./sub-docs/plans`
> from `/user-guide/issues/design-philosophy/` resolves to
> `/user-guide/issues/design-philosophy/sub-docs/plans`.
>
> **So the 35 I recorded as resolving did not resolve either.** Re-measured
> against the rendered `href`s — which is what a browser actually follows —
> the section had **85 broken links, not 65**, and *every* relative link in it
> was broken rather than two thirds of them.
>
> The lesson is the one this issue keeps relearning: **the source is not the
> artefact.** Checking link text against a guessed resolution rule is not
> checking a link; only resolving the emitted `href` against the emitted tree is.

## Verification

| | Before | After |
|---|---|---|
| In-page links checked (rendered `href`s) | 210 | 210 |
| Broken | **85** | **0** |

Measured by parsing every `<article>` in `dist/user-guide/issues/`, resolving
each `href` with `urljoin` against the page's own URL, and asserting the target
exists — with a `checked > 150` assertion so a run that collected nothing cannot
report clean.

# The defect is SITE-WIDE, and that part is not fixed

Auditing the whole built site the same way, this section was the small case:

| Section | Links checked | Broken |
|---|---:|---:|
| `user-guide/issues` | 210 | **0** ✓ fixed here |
| `user-guide` (all) | 667 | **243** |
| `dev-docs` | 214 | **70** |
| `blog` | 7 | **4** — all `/blog/tag/<x>`, pages that are never generated |
| `todo` (tracker) | 43,580 | **3,978** |

**Not fixed, and deliberately not.** Rewriting ~4,300 links across the tracker
and both doc sets is a different piece of work from this subtask, and the
tracker's number needs triage first — much of it is demo and fixture content
pointing at deliberately fictional paths (`/docs/api`, `/contact`), which is not
the same defect. Filed as [`150`](./040_site-wide-link-rot.md).

The `blog` four are a third thing again: `/blog/tag/<name>` pages are linked by
the blog layout and never built. That is a missing feature, not a bad link.

# Details

## The shape of the mistake

`DocsParser.generateSlug` **keeps folder segments**, so `05_sub-docs/07_subtasks.md`
becomes `sub-docs/subtasks`. The links are written as if the section were flat.

| Written | Resolves to | Actually |
|---|---|---|
| `./subtasks` | `user-guide/issues/subtasks` | `user-guide/issues/sub-docs/subtasks` |
| `./lifecycle-and-review` | `user-guide/issues/lifecycle-and-review` | `user-guide/issues/setup/lifecycle-and-review` |
| `./settings/vocabulary` | `user-guide/issues/settings/vocabulary` | `user-guide/issues/setup/vocabulary` |

The third is a different error from the first two: the folder is `04_setup`, so
`settings/` was never a segment at all. Whoever wrote it was guessing at a
structure rather than mistyping a real one.

## The first count, by target — superseded, kept as the record

**These are the numbers from the wrong measurement**, which resolved `./x` as a
sibling of the section root. Kept because the *distribution* is still the useful
part — it shows which targets were written most often — but the "35 resolve"
premise underneath it is false. The true answer is that all of them were broken.

| Target | Hits |
|---|---:|
| `./subtasks` | 8 |
| `./notes` | 7 |
| `./lifecycle-and-review` | 6 |
| `./plans` | 6 |
| `./settings/vocabulary` | 5 |
| `./agent-log` | 5 |
| `./setup-new-tracker` | 4 |
| `./brainstorm` | 4 |
| `./settings/per-issue` | 3 |
| `./agent-memory` | 3 |
| `./vocabulary`, `./comments`, `./issue-md`, `./work-an-issue`, `./review-and-close` | 2 each |
| `./per-issue`, `./glossary`, `./detail-view`, `./list-view` | 1 each |

## Why nothing caught it, which is the part worth fixing

Three checks run over this repo and **none of them looks at links inside
`data/`**:

- `./start build` renders the link as written and never follows it.
- `agent-ks check issues` validates tracker schema, not docs prose.
- `check-skill-links` validates links between **skill** files only — and its
  existence is the argument: that checker was written because the same class of
  breakage was happening in `plugins/`, it has caught real defects, and the
  identical gap in `data/` was never covered.

**A 100% failure rate survived because the failure is invisible from the inside.**
Every page renders, every link is styled like a link, and only clicking one tells
you. That is the same shape as
[the empty section](../090_silent-failure-defects/020_config-page-missing-data-dir.md) and
[the gate reading the wrong tree](../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md) —
three instances in one week of *a wrong answer that is indistinguishable from a
right one until someone looks.*

# Closed 2026-08-04

**Kept: the measurement and the lesson. Deleted: the fix and the argument for
it.** Both deleted parts described a state that no longer exists — the 101-link
conversion was reverted, and the reasoning behind it is the error the group was
opened to correct.

The measurement stands and was the useful output: 85 of 85 relative links in
`19_issues/` were 404ing, and the warning above records why the *first* count
(65 of 100) was wrong. That warning is the most reusable thing here —
**checking link text against a guessed resolution rule is not checking a link.**

The site-wide table below is left as recorded and **must not be cited**: its
tracker figure of 3,978 was retracted by [`110`](./110_live-check.md), and its
site-wide counts were taken before the renderer fix. [`040`](./040_site-wide-link-rot.md)
owns re-measuring them.

**One thing found while closing, now its own subtask.** The section's links were
converted back out of site-absolute form into *slug* form — `./design-philosophy`
where the file is `02_design-philosophy.md`. Relative in shape, still not a path.
334 such links across the content, 294 of them in `user-guide/`, and `move` walks
past them without a word. [`170`](./170_relative-but-not-a-path.md).
