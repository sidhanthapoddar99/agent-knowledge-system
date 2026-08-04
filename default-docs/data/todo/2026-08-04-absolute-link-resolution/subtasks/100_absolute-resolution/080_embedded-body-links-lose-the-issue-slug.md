---
title: "A plan page's links lose the issue slug"
status: open
---

# Overview

**On an issue's PLANS page, a relative link in a stage body resolves against the
wrong base — the issue's own slug segment is dropped.** Reported by Sid,
2026-08-04, against the dev server on `:3088`.

The link is written in a plan stage and is **correct on disk**:

```
plans/01_fix-the-tools-then-the-links/30_one-link-rule-everywhere.md
  → [`080`](../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)
```

`../../` climbs `plans/<plan>/` → `plans/` → the issue root, then down into
`subtasks/`. On disk that is exactly right, and `check link-form` passes it.

Rendered on the plans page it becomes:

```html
<a href="../../subtasks/100_link-integrity/080_link-it-dont-name-it"><code>080</code></a>
```

| What it opened | |
|---|---|
| `…/todo/subtasks/100_link-integrity/080_link-it-dont-name-it` | ❌ wrong — the issue segment is gone |
| `…/todo/2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/080_…` | ✅ correct |

**The plan page sits at a different depth than the stage file the body came
from**, so `../../` climbs one segment too many and takes the issue slug with it.
The browser only sees the address bar; it has no idea the text was authored
somewhere else.

**Done when** a relative link written correctly in a plan stage opens the same
page from the plans view as it does from the stage's own URL — with no depth
shift and no content edited to compensate.

# References

- The checklist that measures it, and must be filled in first:
  [`090`](./090_live-check-the-plans-page.md)
- The standalone live check that could not reach this case, and the row it
  already failed (`overview.md` is not a route):
  [`110_live-check`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
- The prior issue that argued tracker links should resolve root-absolute
  *because* a body renders at two depths: `2026-06-09-issue-link-resolution`
- Dev and build already resolve the same href differently:
  [`120`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)

# Todo list

- [ ] **Fill in [`090`](./090_live-check-the-plans-page.md) before diagnosing.**
      One link traced end to end — source, rendered href, HTTP response — beats a
      sweep. The last time this class was reasoned about instead of clicked, two
      independent reviews agreed with each other and were both wrong
- [ ] Establish what base the plans page actually renders at, and whether a stage
      body and the plan `overview.md` are at the same depth or two different ones
- [ ] Check dev **and** the built site. They already disagree on the base, so a
      fix verified in one proves nothing about the other
- [ ] Decide the mechanism. This issue's premise is that **the renderer owns the
      URL**, so the answer is resolving hrefs at render time against the emitting
      *document* — never a depth shift, never edited content

# Outcomes and Next Steps

**Open. Recorded, not investigated** — Sid's instruction was to capture it, and
nothing here has been reproduced by me.

**The one thing to carry into the work:** that href is *correct on disk*. Whatever
the fix is, it belongs in the renderer. Rewriting content to satisfy a resolution
bug is what got 341 links reverted once already.

# Details

## Why this is the plans page specifically, and not embedding in general

Every within-tracker shape was tested from a **standalone sub-doc URL** and
passed — sibling, cross-group, up-two, up-three into another issue, nested,
anchored, slug-form. That is
[`110_live-check`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md),
twelve of fifteen, and it is why the tracker was declared fine.

A plan is the one surface that page could not test, for a structural reason:
**a plan folder IS its own page**, so `plans/<plan>/overview.md` has no separate
URL and a stage body is rendered from a depth that does not match where it lives.
`110` recorded exactly one plan row and it failed — *"the plan's page is the
folder URL itself, one segment shorter"* — and never followed the thread.

That failing row and this report are the same mechanism, seen from two ends.

## Why this belongs to this issue rather than to link-integrity

`100_link-integrity` owns the **content** rule: a link is relative, and it names a
file that exists on disk. Both hold here — the file exists, the link is relative,
and the gate passes it.

This issue owns **how a URL is produced**. A relative href that resolves against
the wrong base is a URL-production defect, which is this issue's whole subject.
