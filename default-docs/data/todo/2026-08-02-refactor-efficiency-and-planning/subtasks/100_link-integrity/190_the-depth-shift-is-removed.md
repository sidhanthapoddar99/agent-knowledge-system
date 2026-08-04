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
- **The run record, and where the audit of this removal lands:**
  [the gate-and-shift run](../../agent-log/060_wf_move-the-gate-and-drop-the-shift/01_summary.md)
  — an independent audit of every path / URL / routing / asset change since
  2026-08-01 was commissioned on 2026-08-04, told to **execute rather than read**
  and to compare the dev and preview servers directly. Its findings, including
  its verdict on whether this removal merely moved the breakage again, land in
  that run's `02_working/`

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

# The full trace — one link, four combinations

Everything below follows one real link. **Docs only** — blog and issues take a
different code path.

```
SOURCE FILE      default-docs/data/user-guide/05_getting-started/01_overview.md
MARKDOWN         [Installation](./02_installation.md)
TARGET FILE      default-docs/data/user-guide/05_getting-started/02_installation.md   ← a SIBLING
TARGET URL       /user-guide/getting-started/installation
```

The markdown is correct on disk and never changes in any of the four cases. Only
two things vary:

| Variable | Values |
|---|---|
| **the shift** — what `internal-links.ts` writes into the `href` | `./installation` (off) · `../installation` (on) |
| **the base** — the URL the browser resolves against | no trailing slash (dev) · trailing slash (prod) |

## The one rule that decides everything

A browser resolves a relative href against the **directory portion** of the
current address. The trailing slash is what says where the directory ends:

```
address /a/b/c      →  "c is a FILE inside /a/b/"     →  directory portion = /a/b/
address /a/b/c/     →  "c is a FOLDER I am inside"    →  directory portion = /a/b/c/
```

**The two addresses differ by exactly one segment. So does the shift. That is why
the four cases form two matching pairs and two broken ones.**

## 1. dev + no shift — ✅ WORKS

```
you click a sidebar link           href="/user-guide/getting-started/overview"
dev serves it as asked             200, no redirect        ← route table, not a filesystem
address bar                        /user-guide/getting-started/overview
                                                        ^ no slash
browser's directory portion        /user-guide/getting-started/
renderer wrote                     ./installation
resolve                            /user-guide/getting-started/  +  installation
                                 = /user-guide/getting-started/installation      ✅ 200
```

*Measured 2026-08-04 by independent audit: 940 pages, 1245 in-body links, 4
broken — all missing anchors, no path failures.*

## 2. dev + shift — ❌ BREAKS

```
address bar                        /user-guide/getting-started/overview
browser's directory portion        /user-guide/getting-started/
renderer wrote                     ../installation
resolve                            /user-guide/getting-started/  then UP one
                                 = /user-guide/
                                 = /user-guide/installation                      ❌ 404
```

**The `..` overshoots.** Without the slash the browser is *already* at
`getting-started/`; going up again lands in `user-guide/`.

*Reproduced by Sid in a browser, 2026-08-04. This is what caused the shift to be
removed.*

## 3. prod + no shift — ❌ BREAKS

```
you click a sidebar link           href="/user-guide/getting-started/overview"
static host looks on disk          user-guide/getting-started/overview/  IS A DIRECTORY
                                   → 301 → /user-guide/getting-started/overview/
                                   → then serves overview/index.html
address bar                        /user-guide/getting-started/overview/
                                                                       ^ slash added
browser's directory portion        /user-guide/getting-started/overview/
renderer wrote                     ./installation
resolve                            /user-guide/getting-started/overview/ + installation
                                 = /user-guide/getting-started/overview/installation  ❌ 404
```

**The link now points *inside* the page it is on.** The page's own name became a
folder in the path, and nothing compensated for it.

*Measured 2026-08-04: 1245 in-body links, **546 broken** — 43.9%.*

## 4. prod + shift — ✅ WORKS

```
address bar                        /user-guide/getting-started/overview/
browser's directory portion        /user-guide/getting-started/overview/
renderer wrote                     ../installation
resolve                            /user-guide/getting-started/overview/  then UP one
                                 = /user-guide/getting-started/
                                 = /user-guide/getting-started/installation      ✅ 200
```

**The `..` cancels the segment the trailing slash added.** Exactly what it was
written for.

*Measured 2026-08-04 with `trailingSlash: 'always'` also set: 1245 in-body links,
**4 broken** — the same four missing anchors as case 1, no path failures.*

## The whole thing on one line

| | dev — **no** trailing slash | prod — **has** trailing slash |
|---|---|---|
| **no shift** (`./installation`) | ✅ 4 broken *(anchors only)* | ❌ **546 broken** |
| **shift** (`../installation`) | ❌ broken *(reproduced in browser)* | ✅ 4 broken *(anchors only)* |

**A perfect diagonal, and that is the proof there is no right answer.** The
renderer writes the href at build time; which column you land in is decided at
request time by a server it has never met. No constant can satisfy both columns,
because the columns differ by exactly the amount the constant changes.

**Why the diagonal was mistaken for a fix, twice.** Each time, someone measured
one column and concluded the other did not exist:

- 2026-08-03 added the shift, having measured only the trailing-slash column
  (via a tool that reads `dist/` and *constructs* URLs with a slash). It looked
  like `418 → 55`.
- 2026-08-04 removed the shift, having measured only the no-slash column (dev,
  preview, and a browser). It looked like a clean fix.

**Both were right about their column and blind to the other.** `astro dev` and
`astro preview` are route tables and never add the slash; a static host is a file
server and always does. So testing dev against preview is testing one column
twice.

## The two ways out

**Make the columns agree** — `trailingSlash: 'always'` in `astro.config.mjs`, so
dev and preview redirect the way a static host does. Then one shift value is
right everywhere. **Tested 2026-08-04 and it is incomplete on its own:** Astro's
dev server then answers `404` for the no-slash form rather than redirecting, and
**our own layouts still emit hrefs without the slash** — the sidebar, pagination,
index tables. Clicking any sidebar item in dev gives a 404. The config needs the
layouts changed with it.

**Or remove the question** — resolve internal links to root-absolute at render
time, so the href is `/user-guide/getting-started/installation` and there is no
directory portion to resolve against. Decided 2026-06-09 on
[`2026-06-09-issue-link-resolution` subtask 03](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md).
**The slash stops mattering rather than being made uniform**, which is the
stronger property: it survives a host we have not tested, a CDN that rewrites
URLs, and the Comprehensive panel, which renders a subtask's HTML at a URL that
is not the subtask's own.

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
