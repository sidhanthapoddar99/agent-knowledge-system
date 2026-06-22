---
title: Rethinking checking & skill optimizations
done: true
state: closed
---

**Scoped + built 2026-06-22.** Full plan, findings, and outcome in [notes/050_skill-review-ideation.md](../notes/050_skill-review-ideation.md). In short: the skill *text* was already lean; the work was de-duplicating the four validators behind a shared `scripts/_check-lib.mjs` (verified behaviour-preserving), a settings.json parse-check for correctness, a TOC on `settings-layout.md`, and a new `scripts/check-skill-links.mjs`. The original "issues validator has a drifting prefix copy" concern was investigated and **withdrawn** — already shares the helper. Deferred: the `skill-creator` description optimizer (needs a separate eval session).

Review the validators (`scripts/{docs,blog,issues,config}/check.mjs`) and the skill itself
for correctness and **token efficiency**.

Likely areas: which checks are missing or redundant; whether the skill body + references
load lean (progressive disclosure) or carry weight that could move into scripts; trimming
duplication now that the layout references are split out.

*Basic description only — scope to be discussed before implementing.*
