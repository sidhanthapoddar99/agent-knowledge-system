---
title: "Delta analysis — cold-Sonnet artifact vs the reference caliber"
---

# The live experiment, and what it actually showed

**Setup (2026-07-08):** a cold Sonnet agent, given ONLY the
`artifact-authoring` skill and the task *"an artifact presenting 5
mobile-navigation design options for an existing app, interactive, for the
team to pick one"*, produced
[mobile-nav-options.html](mobile-nav-options.html) (+
[sidecar](mobile-nav-options.meta.json)). Reference caliber: sidhantha's
claude.ai variation-set artifacts (titles in
[subtask 100](../../subtasks/100_variation-capability-audit.md)); they are
not fetchable here, so comparison is against the pattern's signature
qualities.

## Result vs the audit's prediction

The audit predicted a Sonnet-profile agent would emit N separate static
files with no shared frame. **This run beat that prediction substantially:**

| Quality | Audit predicted | What Sonnet actually built | vs reference caliber |
|---|---|---|---|
| One artifact, N options | ✗ N files | ✓ ONE file, numbered tab strip, 5 options | ✓ matches |
| Interactions work | ✗ static mocks | ✓ (claimed + code-verified): tap-through phone rebuilds, drawer/FAB/edge-swipe behaviors, vote toggle, copy-summary | ≈ matches in kind; depth per option is thinner than the references |
| Shared fixture | ✗ none | ✓ a common phone-frame mockup | **△ half-met:** frame is shared, but its content is greeked skeleton lines — the references embed options in a *realistic product look* ("could be the shipped design"); this reads as pattern demo, not app design |
| Labels / decision framing | weak | ✓ strong: pros/cons, "best for", at-a-glance table, vote + rationale + copy-back | ✓ arguably beyond the references |
| Theme mode | — | ✓ `self`, dual-theme, verified served byte-identical | ✓ |
| Polish | undershoot | Clean utilitarian; warm-neutral + deep-teal; anti-generic rules respected | **△ below the bar:** the references' "this could ship" visual fidelity (real content, product-specific styling) isn't reached |

## Honest interpretation — why it beat the prediction, and why the gap still stands

1. **The task phrasing carried the intent the skill doesn't.** The prompt
   included *"interactive"* and *"for the team to pick one"* — exactly the
   two signals the audit found missing from the skill. A vaguer but natural
   ask ("show me 5 mobile-nav design options") leaves those signals to the
   skill, which still says nothing. Success here demonstrates the *executor
   + prompt* can carry the pattern — not that the *skill* does.
2. **One run is not reliability.** The skill's job is making this outcome
   repeatable across phrasings and models. The two half-met rows (fixture
   realism, ship-level polish) are precisely where the skill is silent and
   the agent defaulted to its own conservative reading (§0 "don't
   over-design" pulled it toward skeleton content).
3. **The verify gate remains interaction-blind** — this agent voluntarily
   syntax-checked its JS and tag balance, but the skill's own checklist would
   have passed a static version identically.

**Conclusion:** the proposed variation-set section stays justified, with its
emphasis slightly shifted: the structure guidance matters for the vague-ask
case, and the **shared-fixture realism + polish bar** ("embed options in a
realistic product look; the option should feel shippable") is the part even
this good run missed. Verification: light + dark screenshots taken
2026-07-08 (headless); interactions code-reviewed, not yet click-tested —
the environment lacks a full click-driving browser for file:// pages.
