---
title: "Insert with room to spare"
outcome: "The numbering still has somewhere to go"
notes: "Room for two more stages after this one before a renumber is needed"
who: claude
status: open
subtasks:
  - "[Setup](../../subtasks/01_setup.md)"
---

## Todo
- [ ] [Setup](../../subtasks/01_setup.md)

Stages are gap-spaced by ten, so `10`, `20`, `30` leaves nine slots between any
two. Inserting takes the **midpoint** of the gap — `15`, not `11` — because
filling from one end exhausts the space beside `10` while leaving `14`–`19`
empty.

## Questions

- [ ] Should a stage with no `subtasks:` at all be legal? It is today, and a
      stage that is pure ordering has nothing to reference.

**On the broken-reference case.** A `subtasks:` reference resolving to nothing is
the one way a plan *can* mislead: the stage silently under-counts its own
progress. It is a **validator error**, and the plan page lists the broken ref in
red. That is proven by mutating the rule and watching it fire — not by leaving a
permanently-broken reference in the fixture, which would mean this repo's own
gate could only ever be run with "expect one error", and a gate like that stops
being run.
