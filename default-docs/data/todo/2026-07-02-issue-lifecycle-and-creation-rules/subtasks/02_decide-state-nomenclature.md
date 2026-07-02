---
title: Decide the state nomenclature and category grouping
state: open
---

Finalize the expanded lifecycle before any code moves. Starting point (issue.md):
**Not Started** (`open`, `blocked`/`deferred`) · **In Progress** (`in-progress`,
`review`) · **Completed** (`closed`, `cancelled`).

- [ ] `blocked` vs `deferred` — one state or two? (blocked = can't proceed,
      deferred = won't proceed now; both require a reason in comments or issue.md)
- [ ] Final state names + category names; category = stored field or a `groups`
      annotation on the `status` vocabulary in root `settings.jsonc`?
- [ ] Colors for the new states
- [ ] Transition table (which moves are legal; agent ceiling stays `review`,
      `closed` stays human-only)
- [ ] Fate of the now-redundant `wip` and `blocked` labels
- [ ] Migration mapping for existing issues (e.g. `open` + `wip` label →
      `in-progress`; `open` + `blocked` label → `blocked`)

**Decided (sidhantha, 2026-07-02):** subtask `state` mirrors the issue `status`
vocabulary — the expansion applies to both levels, one shared enum. Remaining work is
only how the shared vocabulary is declared/validated, not whether subtasks join.

**Decided (sidhantha, 2026-07-02):** no upward promotion for `blocked`. Review-debt
promotion stays a `review`-only special case because `review` is an *actionable item
for the human*; `blocked` is a resting state, not a call to action — it doesn't shout.
A blocked item just carries its reason (comment / issue.md), and whoever opens the
issue reads it there. Corollary: no structured `blocked-by` field, no stale-blocked
detection — the blocking mention in prose is the whole mechanism.
- [ ] Explicitly record the policy reversal: in-progress is a real status, not
      derived from `assignees`
