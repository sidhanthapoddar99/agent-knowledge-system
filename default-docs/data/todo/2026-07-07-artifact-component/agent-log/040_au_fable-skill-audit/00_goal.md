---
title: "Goal — independent Fable audit of the skills layer"
---

## Goal

Independent, read-only audit of the skills layer (subtask
[95](../../subtasks/95_skill-coherence-review.md)) by a Fable-tier agent that
took no part in writing or fixing the skills — judging coherence, idea
capture, the cold-agent bar, ecosystem wiring, and hygiene fresh from the
artifacts on disk, verified line-level against the decision record AND the
implemented loader/route code.

## Approach

One Fable agent, five dimensions: (1) coherence — one skill, not four stapled
rewrites; (2) idea capture — an 11-point checklist of every accepted decision,
including verifying the skill's inline variable list against the real
`theme.yaml`; (3) cold-agent test — could an agent with only the skill produce
a correct artifact without guessing; (4) ecosystem wiring + history-free
phrasing; (5) hygiene — repo↔cache parity, shingle-level verbatim-prose
analysis against `tmp_skills/`, self-test + validator execution, trigger
disambiguation. Findings only; no edits.

## Success criteria

A ranked findings report precise enough to hand straight to a fix run, with
every claim carrying file:line evidence.
