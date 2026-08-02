---
title: "Stage refs resolve"
outcome: "A stage's `subtasks:` refs resolve to live subtasks, or are reported"
notes: "🔢 Inserted between 20 and 30 — and it is `25`, the midpoint, not `21`"
who: claude
status: done
subtasks:
  - "[Setup](../../subtasks/01_setup.md)"
---

## Todo
- [x] resolve each ref against the issue, render it as a chip with live status
- [x] report a ref that resolves to nothing rather than dropping it

**On the number.** `25` is the midpoint of the gap, not `21`. Filling from one
end exhausts the space beside `20` while leaving `24`–`29` empty, so the next
insertion there has nowhere to go.

**On what a stage stores.** Nothing about the work. It lists *references*, and
the renderer resolves them and reads their live status. A ref that names nothing
is reported above the stages rather than dropped — a stage listing four subtasks
and rendering three looks exactly like a stage that listed three.
