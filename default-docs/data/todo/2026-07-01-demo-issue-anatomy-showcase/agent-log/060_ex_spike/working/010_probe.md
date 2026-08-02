---
title: "One-pass probe"
status: dropped
agent: claude
---

# Goal
Would one reader over all sections beat four readers?

# Inputs
none

# Expected Outcome
Findings and a recommendation.

# Outcome
No. The one-pass version needed a discriminator per section anyway, so it was
four functions wearing a switch statement, and 11% slower.

**`dropped` means the agent did not finish its assignment** — the benchmark half
was never run, because the prototype settled it. What was *found* is this
paragraph; the status says only that the run did not deliver what it set out to.
