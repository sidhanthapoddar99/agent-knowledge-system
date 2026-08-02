---
title: "Summary"
---

# State

> [!NOTE]
> **Six rounds landed; one is waiting on a human and one child log is still
> running.** The loader, the routes, the sidebar tree and the build measurement
> all ship. [The sizing round](./working/050_sizing-tweaks.md) sits at
> `input-needed` — it needs an eye on a real screen, which no headless check can
> give. [The codec migration](./100_wf_codec-migration/summary.md) is a child log
> with its own goal and its own status, still `in-progress`.

# Goal

Build the section loader, its routes and the sidebar tree, so every folder in an
issue renders as a first-class sub-doc with its own URL — and move the codec onto
the same shared prefix parser while that parser is being written.

**Trigger:** the fixture had folders the renderer ignored, which reads as an
empty section rather than as a missing feature. Opened as a loop rather than a
single round because the reader, the tree and the measurement each had to land
before the next could be judged.

# Todo

Executes against
[stage 10 — loader and routes](../../plans/01_shipping-the-sections/10_loader-and-routes.md),
[the backend subtask](../../subtasks/02_build/01_backend.md) and
[the decided architecture](../../notes/01_decided-architecture.md).

- [x] [Read the loader and land the reader](./working/010_loader-reader.md) —
      named every hard-coded section string, then replaced them with one registry
      entry per section
- [x] [Survey how comparable loaders are shaped](./working/011_research-loader-shapes.md)
      — a producer file: four loaders compared, and why none of them round-trips
      a prefix
- [x] [The tradeoff write-up](./working/012_discuss-tradeoffs.md) — a producer
      file: why the registry won over a per-section switch
- [x] [Sidebar and tree](./working/020_sidebar-and-tree.md) — nesting, counts,
      and the depth cap made visible instead of silent
- [x] [Measure the build, before and after](./working/030_bench-build-time.md) —
      the numbers, with units
- [x] [Codec research](./working/040_research-codecs/01_findings.md) — one
      producer, two artifacts, which is why it earns a folder rather than two
      loose files
- [~] [Sizing tweaks](./working/050_sizing-tweaks.md) — landed, then stopped on a
      question only a person can answer. Not blocked: waiting on a look
- [ ] [Codec migration](./100_wf_codec-migration/summary.md) — a **child agent
      log**, because it has a goal of its own rather than being work toward this
      one

# Out of Scope

- The plan table's own rendering — that is a separate stage and a separate run.
- Anything about how it *looks*. This run proves it renders, not that it reads
  well; that needs a person, and the one place it came up is the sizing round
  above.
- The tracker-root vocabulary. Different change, different blast radius.

# Outcome

Every section loads and has a URL, the sidebar renders the tree with counts, and
the depth cap now reports instead of silently dropping a folder — which is what
[the round that landed it](./working/010_loader-reader.md) was actually for.

**The measurement.** Cold build went 18.4s → 19.1s while producing 42 more pages,
so per-page cost fell; the numbers and the method are in
[the benchmark round](./working/030_bench-build-time.md). A run claiming an
improvement without numbers has not finished, and this one has them.

**What leaves the run.** Two things went to
[the handover](./debrief/01_handover.md) rather than blocking it: the
shared-fixture problem the next sweep inherits, and
[two questions for review](./debrief/02_questions-for-review.md) the loop could
not settle on its own.

**What this log demonstrates**, since it is a fixture and that is its job:
iterations are digits and never folders; a producer file sits beside its
iteration file (`011`, `012`); one producer making several artifacts is the
*only* reason to nest inside `working/`; and a sub-goal with a goal of its own
becomes a child agent log carrying its own status, independent of this one.
