---
title: "Explanation — the gap, in simple terms"
---

# What this audit found, in plain language

sidhantha's favourite real-world use of artifacts: **one page showing 4–10
design options** of a UI element (mobile-nav styles, FAB glass variants,
ask-bar states, dashboard redesigns) where every option actually *works* —
buttons press, navs open, states toggle — so the team can feel each option
and pick one. The question: can the `artifact-authoring` skill teach an
agent to build that?

**Answer: not yet.** A strong model (Opus) gets there by filling the gaps
from its own experience. A weaker model (Sonnet at medium thinking) follows
the skill literally and produces something that *looks* related but misses
the point. Since the skill exists precisely to carry intent the model can't
infer, that asymmetry is the finding.

## The difference, side by side

| Quality | The reference artifacts | What the skill produces today | Why |
|---|---|---|---|
| **How many files** | ONE page holding all options side by side | Likely **N separate files** | The design-system flow literally says "keep each option a self-contained artifact" — right for competing *systems*, wrong for one element's variations |
| **Do buttons work?** | Yes — nav opens, tabs switch, presses respond | **Static pictures** of the design | No sentence says options must *function*; the verify checklist passes a static mock as "done" |
| **Common frame** | All options sit in the same phone/app frame, so they compare | Loose options, no shared frame | The "shared fixture" concept is absent from the skill |
| **Labels & "pick one"** | Options named, trade-offs noted, recommendation marked | Weak or missing | Only implied (in brainstorm commentary), never as an in-artifact convention |
| **Theme handling** | Own visual world | ✅ Correct (`self` mode) | The mode-choice doctrine — the skill's strongest coverage |
| **Polish level** | "Could be the shipped design" | Risk of undershooting | The default "don't over-design" governor pulls the wrong way for decision tooling |

## The fix (pending sidhantha's go-ahead)

~50 lines: a "Variation-set / options-explorer artifacts" section in
`references/design-systems.md` (one artifact, N labeled options, structure
by count, operable-not-mocked bar, shared fixture) + a triage row in
SKILL.md, one verify-gate line ("exercise every variation's interactions"),
and `variation-set` sidecar keys.

## Seeing it for real

A cold Sonnet agent was given ONLY the current skill and the task "5
mobile-nav options, interactive, pick one" — its output and a delta write-up
land in [`brainstorm/10_variation-comparison/`](../../brainstorm/10_variation-comparison/),
so the gap is visible, not just predicted. The reference artifacts
themselves live in sidhantha's claude.ai account (titles listed in
[subtask 100](../../subtasks/100_variation-capability-audit.md)) and are not
fetchable from this environment.
