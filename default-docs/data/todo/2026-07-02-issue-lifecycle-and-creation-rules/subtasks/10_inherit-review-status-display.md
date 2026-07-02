---
title: Inherit review into the issue's displayed status when review-debt promotes it
status: review
---

Sidhantha's direction (2026-07-02, post-loop sign-off): when a subtask sits in
`review` and review-debt promotion already pulls the issue into the **Review tab**,
the issue's *displayed* status should say `review` too. Today the tab placement
inherits but the badge doesn't — an issue can sit under Review while its status
column still reads `open`. Tab and badge must never disagree; the status display is
"inherited anyways" through the same rule that moves the row.

**Design intent — derive, don't mutate.** The stored `settings.json` status stays
untouched (it remains the human's field and flips back automatically when subtasks
move on). What changes is an *effective display status*: stored status, overridden
to `review` exactly when the review-debt predicate fires (active issue + ≥1 `review`
subtask — the same test as `scripts/index/filters.ts:42-55`, keyed off
`data-has-review-subtask`). If sidhantha would rather auto-write the stored field,
that's a one-line pivot to flag before implementing.

- [x] Derived the effective status via a **shared predicate** — `needsReview()` +
      `effectiveStatus()` in `parts/../server/helpers.ts`. `IndexBody` now filters
      the Review tab with the *same* `needsReview` (its local duplicate removed),
      and `IssuesTable.astro` + `IssueCard.astro` render the status badge from
      `effectiveStatus(issue)`. One predicate → badge and tab cannot drift.
- [x] Affordance: a **plain `review` badge** (fixed-palette colour, identical to a
      real review). No special "inherited" marker — the whole point is the badge
      reads as review, matching the tab; a variant would reintroduce the mismatch
      it's meant to remove. (Flagged for sidhantha to veto if he wants a marker.)
- [x] Mixed-subtask edge: `effectiveStatus` fires on ANY review subtask (active,
      non-review issue), the exact same condition as the tab — the two stay in
      lockstep, no second threshold.
- [x] Audited the other surfaces and made a deliberate call: **index badges show
      effective; everything else shows stored.** Detail `MetaPanel` keeps the
      stored status (you're looking at the issue itself, its subtasks are listed
      right there). CLI `list`/`show`/`--json` keep stored (review-debt already has
      its own `review-queue` view; `--json` consumers must see the real field).
      Recorded so the invariant is explicit.
- [~] Propagate: user-guide list-view + lifecycle pages and the skill's review-debt
      rule note the displayed-status inheritance — **in flight this wave** (doc
      sweep).
- [x] Build green (647pp) + `docs-guide check issues` exit 0. Verified in built
      HTML: `2026-04-10-editor-core` & the demo issue render a `review` badge while
      `data-status="open"` stays stored.
