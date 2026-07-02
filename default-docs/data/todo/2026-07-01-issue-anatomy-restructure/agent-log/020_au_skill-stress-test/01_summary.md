---
title: Summary
---

This audit stress-tested the new `doc-issues` skill (plugin v0.4.0) with an A/B
experiment: 8 background agents in 4 same-model pairs (Opus ×2 pairs, Sonnet ×2),
one arm reading the skill, one barred from the plugin, each working seeded
scenarios in the throwaway `default-docs/data/todo-testing/` tracker.

**Verdict: the skill works, and its value is concentrated in the judgment rules.**

- Skill arms went **4/4 convention-clean**; baselines 2/4, with one **hard
  lifecycle violation** (subtask flipped to `closed` — the human-only transition)
  and one doctrine failure (resting states and dump entries reported as "needing
  attention").
- Baselines did well on *shape* (folder anatomy, dump placement, graduation
  mechanics) — because they read the conventions we embedded in the environment
  today (vocabulary comments, dump contract, user-guide pages). That propagation
  is demonstrably load-bearing.
- Skill-specific value on top: the lifecycle guardrail, doctrine-correct
  reporting, unprompted self-validation (3/4 skill arms ran `check issues`; 0/4
  baseline), and cheaper orientation. Token cost between arms was a wash (166.1k
  vs 164.5k, +0.9%) — but on the write-heavy pairs the skill was *cheaper and
  faster* (baselines paid to hunt conventions), while on light tasks it added a
  modest validation/tooling overhead. Full per-agent table in `101_ab-results.md`.
- All artifacts validate: `check issues --tracker` shows zero errors after 8
  agents wrote into the tracker.

Full grades + per-pair deltas: `101_ab-results.md`. The throwaway `todo-testing`
tracker was deleted after grading **without being committed** — this audit log
(design, per-agent reports, grades, efficiency table) is the durable record; the
agent-written artifacts were verified on disk during grading and are quoted where
they matter in `101_ab-results.md`.
