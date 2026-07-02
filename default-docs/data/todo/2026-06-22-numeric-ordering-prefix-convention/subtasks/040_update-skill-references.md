---
title: Update docs-layout / issue-layout references for 2–5 digit + grouping
status: done
---

Update the skill reference docs to describe the unified convention:

- `references/docs-layout.md` — prefixes are now **2–5 digits** (not fixed 2); keep the
  gap-numbering section; add the **leading-digit-as-group** pattern (`110_`/`120_` = group 1,
  `210_` = group 2) as an option for flat folders.
- `references/issue-layout.md` — note the grammar is the same shared rule as docs.
- Bump any "2-digit" wording in `CLAUDE.md` / `SKILL.md` if it now reads as a hard limit.

Keep the present-tense, describe-the-current-design voice (no "used to be 2-digit" narration).
