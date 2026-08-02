---
title: "Summary"
---

# State

> [!WARNING]
> **Abandoned deliberately, and nothing is waiting on it.** The prototype
> answered the question before the benchmark it was scoped to run, so the numbers
> this spike existed to produce do not exist. Superseded by the reader that
> shipped in [the section loop](../010_lp_implement-sections/summary.md).
>
> **Not blocked, not deferred.** Nobody should reopen this expecting a
> measurement.

# Goal

Spike a second loader that reads every section in one pass, and find out whether
it beats the four-reader shape on speed and on legibility.

**Trigger:** a hunch, raised before
[the loader survey](../010_lp_implement-sections/working/011_research-loader-shapes.md)
existed. Opened as an experiment (`ex`) rather than a refactor because the
intended outcome was a decision, not a change.

# Todo

- [x] [Scope the surfaces the one-pass reader has to cover](./working/010_scope-the-surfaces.md)
      — eight section shapes, and the two that make a single pass awkward
- [~] [Prototype and probe](./working/020_one-pass-probe.md) — the prototype ran
      and answered the question; the benchmark half never did
- [ ] ~~Benchmark against the four-reader shape~~ — superseded, and deliberately
      left unticked rather than deleted

# Outcome

**No.** The one-pass version still needed a discriminator per section, so it was
four functions wearing a switch statement — and 11% slower on the fixture corpus.
The reasoning is in [the probe](./working/020_one-pass-probe.md); the shape that
shipped instead is
[the section loop](../010_lp_implement-sections/summary.md).

**A dropped run is still a useful record**, which is the main thing this log is
here to show. It closed a direction, and a later reader who has the same hunch
finds it already answered rather than re-running it. That is why the folder is
kept rather than deleted.

**The two signals do different jobs.** `status: dropped` in this log's
`settings.json` tints the kind symbol, and the same value on
[the probe](./working/020_one-pass-probe.md) tints its prefix number — that is the
scannable half, and it says only that the run did not deliver. The callout at the
top of this file is the half a reader actually needs: *what* failed, and what it
cost. A colour cannot carry that, and a status word that tries to reads as if it
already told you.

What not to retry is in [the handover](./debrief/01_handover.md).
