---
title: Unify the issue-tracker side onto the shared parser
status: done
---

Make "across docs & issues" literally true — the issue tracker now defers to the same
shared ordering-prefix definition, not its own `^(\d+)[_-]` regexes.

- Add a **loose** variant to the shared module (`parseOrderPrefixLoose` / `hasOrderPrefixLoose`
  / `stripOrderPrefixLoose`) — same `\d{2,5}` width + numeric-value sort, separator class
  `[_-]` so legacy hyphen folders keep parsing. Built from the same `makeOrderPrefix(sep)`
  factory as the strict `_` family, so there is genuinely one grammar.
- Point `loaders/issues.ts` at it: agent-log sequence, `slugToLabel`, subtask file, subtask
  group folder. Point the layout `SubdocTree.astro` (agent-log leaf label) at
  `stripOrderPrefixLoose`.
- Leave the auto-increment counter (`nextNumericPrefix`) and the strict `NNN_DATE_AUTHOR`
  sequence fallback on `\d+` — they're max-finders / last-resort sequence grabs, not the
  ordering grammar.
- **Audit first:** confirmed no 1-digit or 6+-digit prefixes exist, but found three real
  hyphen-separated note folders (`2026-06-09-astro-6-upgrade/notes/00-astro-update`, …) —
  which is exactly why the issues variant must accept `-`. Docs stay strict `_`.

Build green; the hyphen-note issue loads with positions 0/1/3 and stripped labels.
