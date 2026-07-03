---
title: "Goal — stale-syntax audit of the plugin skill references"
---

# Goal

Audit triggered on 2026-07-03 after a consumer-project session revealed that agents
following the `doc-issues` skill had written callouts in a `:::callout{…}` directive
syntax the framework never parses — 24 migration agents produced 45 files of wrong
markup in good faith. The user asked two things: establish *why* the error happened,
and check whether the skill references carry **other** errors of the same species
(documented syntax that doesn't match `astro-doc-code/src/` reality).

Done looks like: the misinterpretation chain traced to its root cause with file/line
evidence, every syntax-bearing claim in both skills' writing references
(`documentation-guide/references/writing.md`,
`doc-issues/references/10_writing/10_writing.md`) checked against framework code, and
the findings feeding this issue's framing (`../../issue.md`) and its subtasks.
