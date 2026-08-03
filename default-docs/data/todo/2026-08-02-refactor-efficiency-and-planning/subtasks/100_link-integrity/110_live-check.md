---
title: "Live check — 12 of 15 worked, and the failures were a different bug"
status: review
---

# Overview

**A test instrument, not an argument.** I claimed every hand-written relative
link between tracker pages resolves one level too deep. Sid's response was *"I
don't think that happens"* — so this page carries thirteen real links of
different shapes, and he fills in what each one actually opened.

**Every target below was verified to exist on disk before this page was
written.** So a failure here can only mean a resolution bug, never a missing
file. That check is what makes the result readable.

**Done when** the third column is filled in and we know which shapes work.

# The question for Sid

**Click each link in the first column and write what happened in the last
column.** Useful answers: *opened the right page* · *404* · *opened something
else (name it)* · *no link, just text*.

Both views matter, if you have the patience:

1. Open this page **on its own** — `/todo/…/subtasks/100_link-integrity/live-check`
2. Then open the **issue page** and read this same table inside the
   Comprehensive panel

If a link behaves differently in the two places, that is the two-depths problem
and it is the whole reason this is worth testing.

# The table

Filled in by Sid, 2026-08-03, against the dev server on `:3088`.

| URL LINK | Where it points to | What it opened |
|---|---|---|
| [1. sibling subtask](./010_renderer-drops-a-url-level.md) | Same folder as this file — `./010_renderer-drops-a-url-level.md` | ✅ right page |
| [2. subtask in another group](../090_silent-failure-defects/040_two-commands-not-one-guess.md) | Up one, into a sibling group — `../090_silent-failure-defects/040_…` | ✅ right page |
| [3. a group overview](../040_execution/00_overview.md) | The execution group's `00_overview.md` | ✅ right page |
| [4. a note in this issue](../../notes/10_efficiency-audit-2026-08-02.md) | Up two, into `notes/` | ✅ right page |
| [5. this issue's own issue.md](../../issue.md) | The issue body itself — the page served at the collapsed detail URL | ✅ right page |
| [6. an agent-log summary](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md) | This run's `01_summary.md` | ✅ right page |
| [7. an agent-log round file](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/010_the-tools-tell-the-truth.md) | One level deeper again — inside `02_working/` | ✅ right page |
| [8. a plan overview](../../plans/01_fix-the-tools-then-the-links/overview.md) | The plan this run executed | ❌ **not found.** `…/01_fix-the-tools-then-the-links/overview` — the plan's page is the folder URL itself, one segment shorter |
| [9. another issue's overview](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) | Up three, into the demo issue — crosses issues | ✅ right page |
| [10. another issue's subtask, nested](../../../2026-07-01-demo-issue-anatomy-showcase/subtasks/04_verify/30_prefix-collision.md) | Demo issue, inside a subtask group | ✅ right page |
| [11. another issue's agent log](../../../2026-07-01-demo-issue-anatomy-showcase/agent-log/010_lp_implement-sections/01_summary.md) | Demo issue's run summary | ✅ right page |
| [12. a user-guide page](../../../../user-guide/19_issues/01_overview.md) | **Leaves the tracker** — up four, into the docs section | ❌ **not found.** Went to `/user-guide/19_issues/01_overview`; the page lives at `/user-guide/issues/overview` |
| [13. a blog post](../../../../blog/2024-01-15-hello-world.md) | **Leaves the tracker** — into the blog | ❌ **not found.** Went to `/blog/2024-01-15-hello-world`; the post lives at `/blog/hello-world` |

## Two more, deliberately different in form

These two test the *shape* rather than the distance — worth knowing separately.

| URL LINK | Where it points to | What it opened |
|---|---|---|
| [14. same target, with an anchor](./010_renderer-drops-a-url-level.md#the-mechanism) | Link 1 again, plus `#the-mechanism` | ✅ right page, right heading |
| [15. slug form, no `.md`](./010_renderer-drops-a-url-level) | Link 1 again, written as a URL slug instead of a source path | ✅ right page |

# What each result would mean

| If you see | It means |
|---|---|
| **All fifteen open correctly** | My diagnosis is wrong. The rule I wrote is fine and I retract the tracker finding entirely |
| **All 404, one folder too deep** | Confirms it — the tracker never got the depth fix the docs got |
| **1–11 fail, 12–13 work** | The bug is tracker-only, docs are fine — narrowest and most likely case |
| **Works on this page, breaks in the Comprehensive panel** | The two-depths problem from `2026-06-09-issue-link-resolution` is real and no relative form can fix it |
| **14 and 15 differ from 1** | Form matters as well as distance, and the fix has to handle both |

# References

- The measurement that prompted this: 1,410 broken links reported by
  `agent-ks check links --all`, recorded in
  [the review round](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/050_independent-reviews.md)
- The prior issue that reached a different conclusion:
  `2026-06-09-issue-link-resolution` — it argues tracker links should resolve
  **root-absolute**, because a sub-doc body renders at two depths
- The open question this feeds: [`060`](./060_does-the-tracker-share-it.md)
- The rule that depends on the answer:
  [`020`](./020_relative-links-are-the-contract.md)

# Outcomes and Next Steps

**Answered 2026-08-03. Twelve of fifteen opened correctly, so the first row of
the table above is the one that fired: I retract the tracker finding.**

> [!CAUTION]
> **The claim that was wrong.** I said *every hand-written relative link between
> tracker pages resolves one level too deep.* It does not. Every within-tracker
> shape tested — sibling, cross-group, up-two, up-three into another issue,
> nested, anchored, slug-form — opened the right page. The **1,410 broken links**
> figure that both independent reviews leaned on describes something other than
> what it was said to describe, and every record that quoted it as *"tracker
> relative links are broken"* is corrected by this page.

### Why the tracker works, in one line

**The page URL carries no trailing slash, so the browser resolves `./x` against
the parent directory — which is exactly where the author meant it.** Confirmed by
request: `/todo/…/100_link-integrity/010_renderer-drops-a-url-level` returns
`200` with no redirect. The tracker also *keeps* `NN_` prefixes in its URLs, so
the source path and the URL path are the same string. Nothing needs shifting.

### The three failures are one bug and a half

| # | What failed | Real cause |
|---|---|---|
| 12, 13 | tracker → docs, tracker → blog | **The tracker never applies the target section's slug transform.** It strips `.md` and stops. Docs strip `NN_` prefixes; blog strips the date. So the href keeps the source spelling and lands on a page that does not exist |
| 8 | tracker → a plan's `overview.md` | A plan folder **is** its own page; `overview.md` has no separate URL. The link names a real file that is not a route |

Measured, not inferred:

| URL | Title served |
|---|---|
| `/user-guide/19_issues/01_overview` | `Page Not Found` |
| `/user-guide/issues/overview` | `Issues Overview` |
| `/blog/2024-01-15-hello-world` | `Page Not Found` |
| `/blog/hello-world` | `Hello World` |

### Two things this uncovered that nobody was looking for

1. 🔴 **A missing page answers `200`, not `404`.** All four URLs above return
   `200`; two of them render a *Page Not Found* body. Any checker that trusts
   HTTP status — including the obvious way to write one — reports a dead link as
   healthy. This is the same silent-failure shape as
   [`090`](../090_silent-failure-defects/00_overview.md).
2. 🔴 **The docs fix shipped in this run is wrong for the dev server.**
   `/user-guide/issues/overview` now emits `../design-philosophy`, which resolves
   to `/user-guide/design-philosophy` — *Page Not Found*. The correct page is
   `/user-guide/issues/design-philosophy`. The shift was calibrated against the
   built site, where pages are directories and a trailing slash is added; the dev
   server serves the same page without one. **The two environments resolve the
   same href to different targets**, so no single depth shift can satisfy both.

Both, and the design decision they force, are written up in
[`120`](./120_dev-and-build-disagree-on-the-base.md).

### What the fifteen clicks bought

The static build and the reviewers reasoning over it agreed with each other and
were wrong together. **Two independent reviews confirming a finding is not
evidence when both used the same method** — neither opened a URL. This page cost
one afternoon and one round of clicking, and it overturned the conclusion three
records were built on.
