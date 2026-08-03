---
title: "Live check"
status: input-needed
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

| URL LINK | Where it points to | What it opened |
|---|---|---|
| [1. sibling subtask](./010_renderer-drops-a-url-level.md) | Same folder as this file — `./010_renderer-drops-a-url-level.md` | |
| [2. subtask in another group](../090_silent-failure-defects/040_two-commands-not-one-guess.md) | Up one, into a sibling group — `../090_silent-failure-defects/040_…` | |
| [3. a group overview](../040_execution/00_overview.md) | The execution group's `00_overview.md` | |
| [4. a note in this issue](../../notes/10_efficiency-audit-2026-08-02.md) | Up two, into `notes/` | |
| [5. this issue's own issue.md](../../issue.md) | The issue body itself — the page served at the collapsed detail URL | |
| [6. an agent-log summary](../../agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md) | This run's `01_summary.md` | |
| [7. an agent-log round file](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/010_the-tools-tell-the-truth.md) | One level deeper again — inside `02_working/` | |
| [8. a plan overview](../../plans/01_fix-the-tools-then-the-links/overview.md) | The plan this run executed | |
| [9. another issue's overview](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) | Up three, into the demo issue — crosses issues | |
| [10. another issue's subtask, nested](../../../2026-07-01-demo-issue-anatomy-showcase/subtasks/04_verify/30_prefix-collision.md) | Demo issue, inside a subtask group | |
| [11. another issue's agent log](../../../2026-07-01-demo-issue-anatomy-showcase/agent-log/010_lp_implement-sections/01_summary.md) | Demo issue's run summary | |
| [12. a user-guide page](../../../../user-guide/19_issues/01_overview.md) | **Leaves the tracker** — up four, into the docs section | |
| [13. a blog post](../../../../blog/2024-01-15-hello-world.md) | **Leaves the tracker** — into the blog | |

## Two more, deliberately different in form

These two test the *shape* rather than the distance — worth knowing separately.

| URL LINK | Where it points to | What it opened |
|---|---|---|
| [14. same target, with an anchor](./010_renderer-drops-a-url-level.md#the-mechanism) | Link 1 again, plus `#the-mechanism` | |
| [15. slug form, no `.md`](./010_renderer-drops-a-url-level) | Link 1 again, written as a URL slug instead of a source path | |

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

> [!IMPORTANT]
> **Waiting on Sid.** Nothing is decided until the third column is filled in.
> `060` and `020` both hang on this result, and I would rather be shown wrong by
> fifteen clicks than argue the point from a static build.
