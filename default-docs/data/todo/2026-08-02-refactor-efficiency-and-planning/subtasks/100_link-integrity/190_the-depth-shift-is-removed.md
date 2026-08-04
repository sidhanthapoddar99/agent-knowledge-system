---
title: "The depth shift is removed — it chose which half of the site to break"
status: review
---

# Overview

**Removed from `internal-links.ts` on 2026-08-04, one day after it was added.**
Sid reproduced its failure in a browser: with the shift on, clicking any sidebar
link and then any link in that page's body gives a 404.

The shift added one `..` to every relative link on every non-index docs page. It
was correct reasoning about the wrong half of the problem:

| Arriving at | `./installation` resolves to | |
|---|---|---|
| `/user-guide/getting-started/overview/` — trailing slash | `/user-guide/getting-started/installation` | ✓ |
| `/user-guide/getting-started/overview` — **what the sidebar links to** | `/user-guide/getting-started/installation` | ✓ *(after removal)* |

and with the shift on, emitting `../installation`:

| Arriving at | resolves to | |
|---|---|---|
| `…/overview/` | `/user-guide/getting-started/installation` | ✓ |
| `…/overview` — **the navigated form** | `/user-guide/installation` | ✗ 404 |

The server answers **both** forms with `200` and **no redirect**, so which one
you are standing on is decided by how you got there — and the site's own sidebar
always hands you the broken one.

**Done when** the interim state is recorded, the permanent fix has landed, and
nothing in the pipeline emits a browser-relative href.

# The state right now — read this before measuring anything

**This is the better half, not a solution.** The renderer now emits the author's
own relative shape (`./installation`). That is:

- ✅ correct for every URL the **navigation** produces — no trailing slash
- ❌ wrong for a hand-typed or bookmarked **trailing-slash** URL, where a sibling
  link resolves one level too deep

**No value of a constant offset is right, including zero.** That is the whole
finding, and it is why this subtask does not propose a different number.

# References

- The code, with the reasoning kept in place:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
- Added in `951e520` (2026-08-03), removed 2026-08-04
- The subtask that added it: [`010`](./010_renderer-drops-a-url-level.md)
- **The permanent fix, decided 2026-06-09:**
  [`2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md`](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md)
- The environment split: [`120`](./120_dev-and-build-disagree-on-the-base.md)
- The tool that could not see the failure:
  [`180`](./180_rendered-link-check-belongs-to-this-repo.md)

# Todo list

- [x] Remove the shift, keep the reasoning as a comment so it is not re-added
- [x] Rewrite the file header, which described the shift as the file's purpose
- [x] Build clean — 1,174 pages; `tsc` clean on this file
- [ ] **Land render-time absolute resolution** —
      [`2026-06-09` `03`](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md).
      This is the only item that closes the class
- [ ] Re-run the four link shapes handed to that subtask by
      [`010`](./010_renderer-drops-a-url-level.md) — query strings on asset and
      `.md` targets, nested bare `index.md`, blog siblings
- [ ] **Decide separately whether the server should redirect one URL form to the
      other.** Serving the same page at two URLs with no canonical form is a
      problem in its own right — for caching, for analytics, and for anything
      that resolves relatively. It is not required by the fix above, and it may
      still be right
- [ ] Re-measure with [`180`](./180_rendered-link-check-belongs-to-this-repo.md)'s
      live crawler, against **both** servers, once the fix lands

# Details

## Why this was not caught for a day

**It was control-tested in both directions and the control could not fail.**
Shift off → 418 broken, shift on → 55, same tree, same checker. That reads as
rigorous.

Both numbers came from `check-content-links.mjs`, which reads `dist/` and
constructs each page URL as `'/' + path + '/'`. **It assumes the trailing slash.**
So both directions of the control were measured in the one environment where the
shift is correct, and the environment where it is wrong — the one a person
browsing actually inhabits — was never in the sample.

**Two directions of one method are still one method.** This group already wrote
that rule down for reviewers after two independent audits agreed on a wrong
finding ([`110`](./110_live-check.md)). It was not applied to a control test,
where it matters just as much: a control proves the measurement responds to the
change, not that the measurement is asking the right question.

The check that would have caught it costs one browser click, and it is the same
check that would have prevented the 341-link rewrite.

## Why `addLevel` is still computed

It is passed into `rewriteHref` and deliberately unused (`void addLevel`). It
encodes which pages collapse onto their own directory — `index.md`, via
`generateSlug`'s `.replace(/\/index$/, '')` — and the absolute resolver needs
exactly that fact. Deleting it would mean re-deriving it in the replacement, in
a second place, which is the drift this group keeps avoiding.

## What did NOT change

Blog and issues never reached this code: the postprocessor returns early for any
`contentType !== 'docs'`, stripping the `.md` extension and nothing else. The
tracker has its own separate pass (`issue-body-links.ts`) that fires only on a
root `issue.md`. **So this removal affects `user-guide/` and `dev-docs/` only.**
