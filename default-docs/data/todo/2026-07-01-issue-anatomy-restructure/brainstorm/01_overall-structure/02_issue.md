# Issue

**Scope:** the issue body (`issue.md`) — problem statement + context — and its metadata
(`settings.json`: title, status, priority, component, labels, assignees).

## To discuss

- Should the body get a prescribed light shape (problem / context / links / acceptance),
  or stay fully free-form? Lean: free-form with a *suggested* skeleton in the skill, not
  a rule.
- Anything metadata-side still missing? (Best-practice hints exist: one `component` per
  issue, AI-handoff-bound issues declare ≥1 subtask. **No scheduling / release-bucket /
  single-type fields** without an explicit policy reversal — they rot under continuous
  AI-driven shipping.)

## Decided

- `issue.md` is the overview page's only content — subtask summaries, comments, and
  section content live on their own panels.
