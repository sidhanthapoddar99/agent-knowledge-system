---
iteration: 2
agent: claude
status: success
date: 2026-06-22
---

Iter 2 — unified the issue-tracker side onto the shared ordering-prefix parser. Added a loose ([_-]) variant beside the strict (_) family from one makeOrderPrefix(sep) factory: docs stay _-only, issues tolerate legacy -. Wired loaders/issues.ts + SubdocTree.astro (framework) and scripts/issues/_lib.mjs + scripts/docs/check.mjs (plugin); created scripts/_order-prefix.mjs mirror. Audit found 3 real hyphen note folders (astro-6-upgrade/notes/00-,01-,03-) — the reason issues need -. Build green (295 pages); hyphen notes parse to positions 0/1/3; validator accept/reject + numeric collision verified. Reconciled the docs-layout/issue-layout 'shared parser' wording to the now-true model.
