---
title: "Handover"
---

# Do not retry this

The one-pass reader is answered, not shelved. It needed a per-section
discriminator regardless — see
[the surface scope](../02_working/010_scope-the-surfaces.md), which names the two
shapes that force it — so the single pass collapses into the same four functions
with a switch in front of them, and measured 11% slower on the fixture corpus.

**A later reader with the same hunch should stop here rather than re-running
it.** That is what this abandoned log is for.

# What was left undone, and why it is not a gap

The benchmark half never ran. It was scoped to compare a shipped one-pass reader
against the four-reader shape, and there was no shipped one-pass reader to
compare. Recording it as *not run* rather than deleting the item keeps the honest
shape of the spike: it stopped early because it had its answer, not because it
ran out of time.

The one number that does exist — the 11% — came from the prototype, not from that
benchmark, and it is stated with that caveat wherever it appears.

# One thing worth carrying forward

**Legibility was the deciding factor, not speed.** Even had the one-pass version
been marginally faster, four small readers that each do one thing beat one reader
with a switch. That preference is a standing one and belongs to
[the decided architecture](../../../notes/01_decided-architecture.md), not to
this spike — the spike only supplied the evidence.
