---
title: "Goal — four-agent consistency audit + fix wave"
---

Sidhantha's direction (2026-07-03, after signing the issue off): before letting the
v0.7.0 lifecycle work rest, run independent Opus agents in parallel to answer two
questions — *is everything implemented correctly?* and *are the documentation and
skills consistent and coherent with the shipped code?* — plus a targeted sweep he
requested separately: find places where docs/skills still **narrate the retired
assignees-derived in-progress mechanism as history** instead of describing the
current design (status is the single source of truth).

Four read-only audit agents ran concurrently, each with a distinct lens:

1. **Skills coherence** — both plugin skills (`doc-issues`, `documentation-guide`)
   vs the shipped code and each other (milestone 101).
2. **Code ↔ user-guide** — every factual claim in `user-guide/19_issues/` traced
   bidirectionally against the loaders, layouts, and CLI (milestone 102).
3. **Error ↔ migration ↔ guide.ts** — the full error-to-resolution path a real
   user would walk: error messages, the merged migration script's three
   subcommands, and the bundled guide panel (milestone 103).
4. **Assignees-history sweep** — report-only hunt for history-narration of the
   retired assignees→in-progress derivation (milestone 104).

On sidhantha's follow-up word the issue was **reopened** and the actionable
findings fixed in one wave (milestone 105); conclusion and next steps in
`01_summary.md`. Out of scope by prior agreement: the themes-doc selector-accuracy
gap (`07_issues-styles.md`) and the stale "planned" framing of
`09_using-with-ai.md` — both separate doc-hygiene tickets.
