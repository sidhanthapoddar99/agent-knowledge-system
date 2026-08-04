---
title: "Live check — the plans page"
status: open
---

# Overview

**A test instrument, not an argument** — the same shape as
[`110_live-check`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md),
which cost one afternoon of clicking and overturned a conclusion three records
were built on.

`110` tested every link shape from a **standalone** sub-doc URL and twelve of
fifteen passed. It had exactly **one** plan row, that row failed, and the thread
was never followed. This page follows it.

**Every target below must be confirmed to exist on disk before this is filled
in.** That is what makes a failure readable: it can only be a resolution bug,
never a missing file.

**Done when** both tables' answer columns are filled in and we know which shapes
survive the plans page.

# The question for Sid

**Open each link and write what happened.** Useful answers: *opened the right
page* · *404 / Page Not Found* · *opened something else (write the URL)* · *no
link, just text*.

**Each row is checked from TWO places, and the difference between them is the
whole point:**

1. **Stage's own URL** — open the plan stage as its own page and click the link
   in its body.
2. **Plans page** — open the issue's plans view and click the same link where the
   stage body is rendered there.

A row that works in one and fails in the other is the depth mismatch. A row that
fails in both is a plain resolution bug and much easier to fix.

> [!IMPORTANT]
> **A missing page here answers `200`, not `404`.** Four dead URLs in `110` all
> returned `200` while rendering a *Page Not Found* body. Trust what the page
> says, not the status code — and never write a checker that trusts the status.

# Table A — a stage body's links out of the plan

These are real links in `plans/01_fix-the-tools-then-the-links/`. Row 2 is the
exact case Sid reported.

| URL LINK | Where it points to | From the stage's own URL | From the plans page |
|---|---|---|---|
| [1. sibling stage](../../../2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/20_fix-the-renderer.md) | next stage in the same plan | | |
| [2. **the reported case** — a subtask](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/080_link-it-dont-name-it.md) | `../../subtasks/100_link-integrity/080_…` from the stage — up two, down into `subtasks/` | | |
| [3. the plan's own overview](../../../2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/overview.md) | `overview.md` — a real file that may not be a route | | |
| [4. the issue body](../../../2026-08-02-refactor-efficiency-and-planning/issue.md) | up two, to `issue.md` | | |
| [5. a note](../../../2026-08-02-refactor-efficiency-and-planning/notes/10_efficiency-audit-2026-08-02.md) | up two, into `notes/` | | |
| [6. an agent-log summary](../../../2026-08-02-refactor-efficiency-and-planning/agent-log/040_wf_fix-the-tools-then-the-links/01_summary.md) | up two, into a run | | |
| [7. another issue entirely](../../../2026-07-01-demo-issue-anatomy-showcase/issue.md) | up three, crosses issues | | |
| [8. with an anchor](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/080_link-it-dont-name-it.md#the-rule) | row 2 plus a fragment | | |

# Table B — reaching the plan from outside, and the frontmatter refs

A stage also lists its subtasks in **frontmatter** (`subtasks:`), which the plan
page resolves and renders itself. Those may behave differently from links in the
body — worth knowing separately.

| What to open | | From the stage's own URL | From the plans page |
|---|---|---|---|
| 9. a `subtasks:` frontmatter ref | the rendered subtask chips on [stage 30](../../../2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/30_one-link-rule-everywhere.md) — click one | | |
| 10. [the plan folder itself](../../../2026-08-02-refactor-efficiency-and-planning/plans/01_fix-the-tools-then-the-links/) | the folder, which *is* the page | | |
| 11. [a link INTO a plan, from a subtask](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md) | open this subtask and click its plan link — does the inbound direction work? | | |
| 12. the issue page's own plan link | open the issue, find its link to the active plan, click it | | |

# What each result would mean

| If you see | It means |
|---|---|
| **Both columns correct everywhere** | No plans-page bug; Sid's report has another cause and this closes with the finding retracted |
| **Stage URL works, plans page fails** | Confirms the depth mismatch. No relative form satisfies both, and the renderer must resolve hrefs against the emitting document |
| **Both fail the same way** | Not a depth bug — a plain resolution defect, and simpler |
| **Body links work but frontmatter refs don't (or vice versa)** | Two code paths, and the fix has to reach both |
| **Row 3 or 10 behaves oddly** | The folder-is-the-page rule — `overview.md` has no URL of its own. Possibly its own subtask |
| **Dev and the built site differ** | [`120`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md) again — verify any fix in both |

# References

- The defect this measures: [`080`](./080_embedded-body-links-lose-the-issue-slug.md)
- The check this extends, and the one plan row it already failed:
  [`110_live-check`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/110_live-check.md)
- Dev and build disagreeing on the base:
  [`120`](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)

# Todo list

- [ ] Confirm every target in both tables exists on disk **before** clicking —
      otherwise a failure is ambiguous and the whole table is unreadable
- [ ] Sid fills in both columns, both tables
- [ ] Record the answer on [`080`](./080_embedded-body-links-lose-the-issue-slug.md),
      which owns the fix

# Outcomes and Next Steps

**Open, and deliberately unanswered.** Raised 2026-08-04 from Sid's report that
`../../subtasks/…` drops the issue slug on the plans page.

**Why this is worth a page rather than a paragraph.** The last time this class was
reasoned about instead of clicked, two independent reviews agreed with each other
and were both wrong — neither had opened a URL. **Two reviews confirming a
finding is not evidence when both used the same method.**

# Details

## Why this duplicates the live-check shape on purpose

It looks like a second copy of `110_live-check` and it is not. That page asked
*"do relative links between tracker pages work?"* and answered **yes** for the
standalone case — which is why the tracker was declared fine and the finding
retracted.

This one asks the question `110` was structurally unable to reach: *"and on the
plans page?"* A table read from one URL cannot compare two depths, so the
overlapping link shapes are the point. **Same shapes, second surface** is what
makes the two answer columns comparable at all.
