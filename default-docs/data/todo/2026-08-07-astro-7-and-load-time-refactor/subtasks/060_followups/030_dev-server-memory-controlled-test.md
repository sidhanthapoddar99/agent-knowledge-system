---
title: "Dev-server memory: get a controlled before-and-after"
status: dropped
---

# Overview

**RAM was the first problem on the list that started this work, and it is the one
number still missing.** The upgrade cut *build* memory by 38%. Nobody knows what it
did to the *running dev server*, which is the memory a person actually lives with.

Done when the same session is measured on Astro 5 and Astro 7 under one protocol,
and the delta is written down — including if the answer is "no change" or "worse".

# References

- [what each step bought](../../notes/01_what-each-step-bought.md) — records this
  as the main gap
- [stage 10](../../plans/01_implementation/10_baseline-and-safety-net.md) — the
  original figures and why they are not comparable

# Todo list

- [ ] Write the protocol down before running anything — see Details
- [ ] Measure Astro 7 (partly done; redo under the final protocol)
- [ ] Measure Astro 5 by checking out the pre-upgrade commit and reinstalling
- [ ] Record the delta, whatever it is
- [ ] Re-state the RAM row in [the comparison note](../../../2026-05-08-runtime-stack-migration/notes/astro-7-vs-go/01_comparison.md)
      if the answer changes it

# Outcomes and Next Steps

**Dropped by Sid. The comparison this asks for cannot be bought at a price worth
paying, and the number that would matter is not the one it measures.**

## Why it was dropped rather than done

Running it means checking out the pre-upgrade commit, reinstalling the whole
dependency tree, measuring, and restoring — to learn *what Astro 5 used to do*.
Nothing downstream acts on that answer. The upgrade has already happened and is
not being reversed, so the comparison is archaeology.

The Details section below already admitted the deeper problem: the index-loader
fix landed between the two states, so any delta mixes two causes and no protocol
recovers that.

## The one number this round did produce, and where it went

An orphaned dev server from the previous day was found still running and holding
**1.19 GB** after ~18 hours. That is the only real memory figure this follow-up
generated, and it does not support the subtask's thesis — it is not evidence of a
leak in normal use, it is evidence of a **leaked process**, which is a different
defect with a different owner:
[060/020 the ./start wrapper against Astro 7](./020_start-wrapper-against-astro-7.md).

That same orphan is now the leading suspect for
[060/060 diagrams stop rendering in dev](./060_dev-diagram-dep-cache.md) — two dev
servers sharing one `node_modules/.vite`. **The leak turned out to matter for a
reason this subtask never proposed**, which is the argument for chasing the leak
rather than the megabytes.

## If the question comes back

Ask it the other way round and it becomes cheap: *does a single long-lived dev
session grow without bound?* That needs one Astro 7 server, one fixed request
sequence, and samples over time — no downgrade, no reinstall. The suspect is
already named below: the caches hold rendered HTML per issue folder and nothing
evicts them. Open it as its own subtask if a session ever feels heavy; do not
reopen this one, which is tied to a comparison that stopped being answerable.

# Details

## Why the numbers we have cannot be compared

| | Value | Why it does not compare |
|---|---|---|
| Astro 5, "fresh" | 431 MB | after an unrecorded handful of requests |
| Astro 5, long-running | 809–955 MB | hours old, unknown request history, and it was the pre-fix code |
| Astro 7 | 229 MB boot → 557 MB after 4 pages → 597 MB after ~40 | a known sequence, but no Astro 5 twin |

Reading a delta out of these would be inventing one. **The index-loader fix landed
between them too**, so any difference mixes two causes.

## The protocol this needs

Fix all of it before measuring, and use the same script both sides:

- **One dev server on the machine.** The upgrade measurements were poisoned once by
  eleven orphaned servers; check for strays before every run.
- **A fixed request sequence** — a set list of routes, a set number of repeats.
- **Sample at fixed points**: boot, after the first page, after N pages, and after
  an idle period.
- **Say which code is under test.** Astro 5 *with* the index-loader fix is the
  honest comparison for isolating the upgrade; Astro 5 *without* it answers
  "how much better is today than this morning". They are different questions —
  measure whichever you want, but name it.

## Where the memory probably goes

Worth checking rather than assuming: the caches added in this issue hold rendered
HTML for every issue folder visited, and nothing evicts them. A long session that
browses many issues will grow. That is a design choice, not a leak — but it is the
first place to look, and a size cap may be the answer if it dominates.
