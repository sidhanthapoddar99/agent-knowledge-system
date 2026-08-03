---
title: "Relative links in 19_issues/ resolve to 404 on ~10 pages"
status: open
---

# Overview

**65 of the 100 relative links in the issues user-guide are 404s** — measured
against the built site on 2026-08-03, not read off the source. Eighteen of the
section's ~22 pages contain at least one.

The section's own navigation is majority-broken. A reader following "see
[Subtasks](./subtasks)" from the `issue.md` page lands on a 404, and nothing
anywhere reports it: the build succeeds, `check issues` is clean, and
`check skill-links` does not look at `data/`.

**Done when** every relative link in `19_issues/` resolves on the built site,
and something mechanical stops the next one — a link check over `data/` is the
obvious candidate, since the same class of defect has now appeared in the skill
(fixed) and the user-guide (this).

Found by the agent rewriting
[the using-with-AI page](./110_using-with-ai-page-stale.md), which hit one
instance and flagged the pattern. **It estimated "~10 pages"; measuring found
65 links across 18 files** — the estimate was the right instinct at a sixth of
the true size, which is why it was counted rather than taken.

# References

- The round that found and measured it:
  [0.2.1](../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md)
- Slug generation: `astro-doc-code/src/parsers/content-types/docs.ts` →
  `DocsParser.generateSlug`
- Exact matching with no fallback: `astro-doc-code/src/pages/lib/route-match.ts`

# Todo list

- [ ] Decide the fix: **rewrite the links**, or **make the router fall back** to
      a basename match when a bare relative target is unique in the section.
      Recommended: **rewrite the links** — a router fallback makes two spellings
      both work forever, which is the ambiguity this repo keeps deleting
- [ ] Rewrite all 65, folder segment included (`./subtasks` →
      `./sub-docs/subtasks` from a sibling, or a root-relative form)
- [ ] **Add a link check over `data/`** and wire it into `agent-ks check`. Same
      class as the skill link checker, which already exists and already caught
      real breakage — this one has no equivalent
- [ ] Control-test the new check: a deliberately broken link must fail it, and
      removing that link must return it to zero
- [ ] Re-measure: expect 0 broken of ~100

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — measured and scoped, not fixed.

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

## The full count, by target

Measured against `astro-doc-code/dist/` after a clean build. 100 relative links,
35 resolve, 65 do not.

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

**A 65% failure rate survived because the failure is invisible from the inside.**
Every page renders, every link is styled like a link, and only clicking one tells
you. That is the same shape as
[the empty section](./120_config-page-missing-data-dir.md) and
[the gate reading the wrong tree](./130_skill-links-checks-the-wrong-tree.md) —
three instances in one week of *a wrong answer that is indistinguishable from a
right one until someone looks.*
