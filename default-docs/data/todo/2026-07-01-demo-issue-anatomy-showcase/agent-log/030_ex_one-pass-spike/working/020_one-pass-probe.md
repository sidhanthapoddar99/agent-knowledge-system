---
title: "One-pass probe"
status: dropped
agent: claude
---

# Goal
Would one reader over all sections beat four readers?

# Inputs
[The surface scope](./010_scope-the-surfaces.md) — in particular the two section
shapes it names as not uniformly readable.

# Expected Outcome
Findings and a recommendation, plus before-and-after numbers against the
four-reader shape.

# Outcome

> [!WARNING]
> **This round did not land.** The benchmark half was never run — the prototype
> settled the question before it was reached, so the numbers this round existed
> to produce do not exist.
>
> **Not blocked, not deferred: abandoned deliberately.** Nothing downstream is
> waiting on it, and nobody should re-open it expecting a measurement.

No. The one-pass version needed a discriminator per section anyway, so it was
four functions wearing a switch statement, and 11% slower.

**The two signals do different jobs, and this file exists to show both.**
`status: dropped` tints the prefix number in the sidebar — that is the scannable
half, and it says only that the run did not deliver what it set out to. The
callout above is the half a reader actually needs: *what* failed, and what it
cost. A colour cannot carry that, and a status word that tries to reads as if it
already told you.
