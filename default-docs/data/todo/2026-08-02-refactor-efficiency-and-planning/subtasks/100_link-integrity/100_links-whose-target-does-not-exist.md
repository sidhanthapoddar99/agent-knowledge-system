---
title: "55 links point at pages that do not exist — visible only now the renderer is fixed"
status: done
---

# Overview

**With the renderer fixed, 55 broken in-body links remain, and none of them is a
rendering defect.** They were invisible while *every* relative link was broken —
you cannot see a wrong target in a set where every target fails.

Measured 2026-08-03 over the built site: 173 pages, 15,589 in-body links, 55
errors (down from 418 before the fix).

| Count | Kind | Fix |
|---:|---|---|
| 46 | Relative link whose target genuinely does not exist | correct the link, or create the page |
| 4 | `/blog/tag/…` | the tag feature was never built — remove the links or build it |
| 3 | Stale `/docs/…` base from a section rename | repoint at `/dev-docs/…` |
| 2 | Other site-absolute link with a missing target | correct or remove |

**Done when** `agent-ks check links` reports zero over the non-tracker sections,
and every link that was deleted rather than repaired is accounted for.

# References

- The fix that exposed them: [`010`](./010_renderer-drops-a-url-level.md)
- The measuring tool: [`070`](./070_reframe-the-link-checker.md)
- The form rule these must be corrected *into*:
  [`020`](./020_relative-links-are-the-contract.md) — relative, not absolute
- The gate that should stop them recurring:
  [`090`](./090_tools-must-say-what-they-skip.md)

# Todo list

**All done 2026-08-03 — the record is in Outcomes below.**

- [x] Work section by section, **gate after each**. Not one scripted sweep —
      the last mass link edit in this repo was 341 files and wrong
- [x] For each: decide **repair or delete**, and never invent a target. A link to
      a page that was deliberately removed should go, not be repointed at the
      nearest survivor
- [x] Correct into **relative** form. These are exactly the links that would
      "resolve" if written site-absolute, and would then be invisible to
      `agent-ks move` forever
- [x] The 4 `/blog/tag/…` links need a product decision: build the tag route, or
      stop rendering tags as links
- [x] Re-measure and record; the target is **0**, because a gate that is red on
      arrival is a gate people learn to ignore

# Outcomes and Next Steps

**Done 2026-08-03, the same day it was filed. 55 → 0.** Closed 2026-08-04.

> **What the closing number does and does not cover.** The 55 were measured, and
> repaired, in the environment they were found in. A static host today reports
> **539** broken in-body links — and none of them is this subtask's defect. They
> look like this:
>
> ```
> /dev-docs/plugins/creating-plugins/bin-wrappers/  →  ./capabilities
> resolves to  .../bin-wrappers/capabilities        →  404
> ```
>
> The target exists; the **base** is wrong, because a static host serves that
> page with a trailing slash and shifts what every relative href resolves
> against. That is the trailing-slash defect, owned by
> [absolute link resolution](../../../2026-08-04-absolute-link-resolution/issue.md),
> and it will stay red until the resolver lands. This subtask's class — *the
> target does not exist* — is at zero.
>
> **Stated because the two are indistinguishable from a count alone**, which is
> the failure this whole group is named after. A single number over a static host
> cannot sign this off, and was not used to.

| Batch | How | Count |
|---|---|---:|
| `19_issues` reorganisation fallout | basename match against the section, **applied only where unique** | 42 |
| Individually reasoned | `./site` pointed at a folder with no index page; two artifact links had one `../` too many; three carried a `/docs/` base from a section rename; one named a section that is called `16_layout-system` | 8 |
| Blog tags | see below | 4 |
| Regression I had just introduced | see below | 1 |

**Nothing was invented.** The repair pass fixed only where the basename matched
exactly one file in the section; ambiguous and no-candidate cases were printed
and left alone. It reported 0 ambiguous.

### The fence guard, added before applying

A link inside a fenced block is syntax being shown, not a link — rewriting one
silently corrupts a worked example. Adding fence-skipping removed 13 false
candidates and changed **none** of the 42 real ones, which is the useful result:
it proved the repairs were all in prose.

### The blog tags were a fourth thing, not a link defect

`PostBody.astro` rendered every tag as `<a href="/blog/tag/…">` for a route that
was never built, so every post shipped links that looked clickable and 404'd.
They are `<span>` now, and **the hover underline went with them** — nothing should
look clickable when nothing happens on click. Make them links again in the same
change that adds the route; the reason is written beside the code.

### And a regression this pass caught in my own work

Fixing the renderer in [`010`](./010_renderer-drops-a-url-level.md) had also
shifted links to **colocated files**, which `asset-src` resolves against the
source directory rather than the page URL. The same scene file, in the same page:

```
<img>  /content-assets/user-guide/15_writing-content/assets/diagram-showcase.excalidraw   ✓
<a>    /content-assets/user-guide/assets/diagram-showcase.excalidraw                      ✗
```

`internal-links` now returns any href with a non-markdown extension untouched.
**Found by tracing one link into its built output rather than trusting the
count** — the count had gone from 418 to 55 and looked like success.

# Details

## The worked example, so the shape is clear

`default-docs/data/user-guide/19_issues/01_overview.md:105`:

```markdown
- [Lifecycle and Review](./lifecycle-and-review) — the seven-status model
```

The file it means is at `19_issues/04_setup/06_lifecycle-and-review.md`. The link
is missing the `setup/` segment — it was written pointing at the wrong directory,
and has been wrong since it was written.

**Nothing could have caught it.** Before the renderer fix every relative link on
every non-index page 404'd, so a link that was *also* aimed at the wrong folder
looked exactly like its 100 correct neighbours. That is the same
indistinguishable-failure shape the sibling group
[`090`](../090_silent-failure-defects/00_overview.md) is named after: a defect
hidden inside a larger defect.

## Why this is filed separately rather than folded into the renderer fix

Because folding it in is precisely the error this group exists to correct.

A rendering measurement pointed at content once before and 341 files were edited
on the strength of it. The renderer fix is now verified in both directions and
changed **zero** content files — that separation is the evidence that the
diagnosis was right this time, and it survives only if the content corrections
are a different change with their own reasoning.
