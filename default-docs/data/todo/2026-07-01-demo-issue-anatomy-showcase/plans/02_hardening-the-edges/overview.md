---
title: "Hardening the edges"
---

The second plan, and **the active one** — the highest-numbered plan that is not
`done` or `dropped`. That is derived, never stored: there is no `active:` field
anywhere, so nothing can drift.

It picks up the one stage the first plan dropped, plus the two defects the
edge-case audit confirmed.

**Where order lives.** The subtasks below sit in `subtasks/` grouped by *area* —
`02_build`, `04_verify` — and their numbers are ids, not a sequence. What runs
when is only here.
