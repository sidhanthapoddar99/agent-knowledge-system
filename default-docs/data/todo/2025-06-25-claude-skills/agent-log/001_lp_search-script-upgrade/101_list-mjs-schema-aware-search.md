---
iteration: 1
agent: claude
status: success
date: 2026-04-25
---

Goal: Implement subtask 08 — upgrade list.mjs into a schema-aware grep/find replacement for the tracker.

Approach:
- Added helpers to scripts/issues/_lib.mjs: detectSearchBackend (rg → grep → js), maybePrintInstallHint (platform-aware stderr, suppressible), runSearch (single-call backend dispatch), listSearchableFiles (per-issue file enumeration with --search-fields scoping), readIssueNotes, issueDateFromId.
- Rewrote scripts/issues/list.mjs around a two-phase pipeline: structural filter, then optional regex search. Added flags: --search, --search-fields, --case-sensitive, --invert-match, --paths-only, --limit, --type, --assignee (incl. 'unassigned'), --created-after/before, --due-after/before, --subtasks-min/max, --has-open-subtasks, --has-closed-subtasks, --scope, --quiet-tips. Exit codes: 0 found / 1 none / 2 usage error.
- Updated references/issue-layout.md: replaced grep recipe block with a 'do not use Grep/find on the tracker' steering note plus the synonym list (search/find/locate/grep/scan/filter/narrow/etc.). Updated common-usage examples to include --search and --paths-only.
- Updated SKILL.md: one-line routing rule sending search verbs over the tracker to list.mjs.

Result:
- Smoke-tested on the live tracker. Backend ladder works (rg shell-alias correctly skipped, fell back to system grep). Verified --paths-only, --json, --search-fields settings, --created-after, --has-review-subtasks, --subtasks-min, --limit, invalid-regex error handling, and the no-match exit-1 contract. check.mjs still passes (unchanged behaviour, only the 3 pre-existing component-vocab warnings).
- Install hint correctly fires when rg absent and quiets via --quiet-tips.

Next:
- Subtask 08 → review.
- Out of scope: assignee field schema (separate vocabulary discussion). The --assignee flag is wired but a no-op until issues actually grow that field.
