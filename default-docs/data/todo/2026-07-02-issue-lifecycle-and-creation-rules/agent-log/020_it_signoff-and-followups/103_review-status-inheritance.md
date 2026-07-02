---
title: "Milestone 3 — displayed status inherits review (subtask 10)"
iteration: 3
status: success
---

## Goal

Subtask 10 — when review-debt promotion pulls an active issue into the Review
tab, its displayed status badge should read `review` too, so badge and tab never
disagree.

## Approach & result

**Derive, don't mutate — via one shared predicate.** Added `needsReview()` and
`effectiveStatus()` to `parts/../server/helpers.ts`. `IndexBody` now filters the
Review tab with the *same* `needsReview` (its local duplicate deleted), and
`IssuesTable.astro` + `IssueCard.astro` render the status badge from
`effectiveStatus(issue)`. One predicate feeds both, so the badge and the tab
cannot drift. The stored `settings.json` status is never touched — `data-status`
(used for filtering/sorting) stays the real value, and the badge is display-only.

**Decisions recorded.** Affordance = a plain `review` badge (a "· inherited"
marker would reintroduce the mismatch the change removes; flagged for sidhantha
to veto). Surface scope = **index badges show effective; everything else shows
stored** — detail `MetaPanel`, CLI `list`/`show`/`--json` keep the stored status
(the issue's own subtasks are visible on the detail page, and review-debt already
has its own `review-queue` view; `--json` consumers must see the real field).

## Verification

Build green (647pp). Verified in both the built and the live dev-server HTML:
`2026-04-10-editor-core` and the demo issue render a `review` badge while their
`data-status="open"` stays stored.

## Next

Docs + skill propagation (in-flight this wave), then finalise: cache mirror +
plugin version bump + records. Subtasks 10–13 → `review` for sidhantha's sign-off.
