---
author: sidhantha
date: 2026-08-04
title: "Closed — nine groups, and the lesson that outlived them"
---

Closed `done` on 2026-08-04. Every subtask group is closed and the plan
`01_fix-the-tools-then-the-links` is closed with its four stages.

**Two closures worth naming, because the record does not fully back them.**

- [`060_sidequest-neurasutra`](../subtasks/060_sidequest-neurasutra.md) — closed on
  instruction with its todo boxes unticked. The work sits in `neurasutra-docs` and
  `neurasutra-canvas`, repositories this tracker cannot see, and the re-measurement
  its own *"Done when"* required is not recorded here. Read it as closed, not as
  evidenced; the audit's baseline is still the last number anyone has.
- The plan was `open` with all four stages at `review` — a stale schedule the
  index-checker had already flagged. Closed here, which is an agent's call: a plan
  stores no status of the work, so closing one certifies nothing about it.

**What this issue leaves behind.** One lesson, paid for repeatedly: **a check
scoped to the thing it checks always passes.** The acceptance test read the
paragraph it had just written. The fixture tested the bugs it had already met. The
staleness gate compared against its own generator. Two independent reviews agreed
with each other and were both wrong, because neither had opened a URL.

What worked, every time, was an **oracle** — something that answers the question
independently of the code under test. Fifteen clicked links overturned a
conclusion three records were built on. A differential against micromark found
eight links no gate had ever seen. Running `agent-ks move` for real found a ninth
blind spot that no coverage test could reach, because it was about *describing* a
link rather than *finding* one.

**Still open elsewhere**, both raised from this issue's work and living in
`2026-08-04-absolute-link-resolution`, which owns URL production: a plan page's
relative links lose the issue slug, and the live check that measures it.
