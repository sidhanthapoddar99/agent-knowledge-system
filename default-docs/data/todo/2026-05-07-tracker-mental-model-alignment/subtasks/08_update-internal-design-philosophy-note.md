---
title: "Update the internal design-philosophy note (drop milestone endorsement)"
state: open
done: false
---

- [ ] Open `default-docs/data/todo/2026-04-10-issues-layout/notes/02_design-philosophy-and-review-state.md`. The current text endorses milestone as the chosen primitive: *"We have **`milestone`** instead — a long-horizon north star that says 'we're working toward this big chunk of value', not 'we promised to ship X by Friday'."* That contradicts the new direction.
- [ ] **Replace the milestone endorsement** with text that reflects the post-cleanup state: priority + state are the only ordering signals; release planning is not what this tracker does; cross-issue links handle "this bundle of work is related" without a structured field.
- [ ] **Add a "What we removed and why" section** documenting both the original removals listed in the note (no sprints, no `type`, no transient statuses) and the new ones from this issue (no milestone, no due date). Keep the same conversational tone the rest of the note uses — this is internal historical memory, not a polished spec.
- [ ] **Don't delete the original note.** It's a primary source for subtask 06's outward-facing writeup. Edit in place.
- [ ] **Test**: read the note end-to-end after editing — does the philosophy hold together internally consistent? Does any other note in the parent issue's `notes/` folder also reference milestone in a way that needs updating? (Sweep `notes/01_issues-restructure-design.md` and `notes/design/**` for residual references.)

## Why this is its own subtask

The user-guide writeup (subtask 06) is for new readers. This note is the *historical record* — what the tracker's design philosophy looked like at each major revision, written conversationally by the people doing the design. Future readers diving into the parent issue's notes need this to read accurately, not contradict the current direction.

## Files likely touched

- `default-docs/data/todo/2026-04-10-issues-layout/notes/02_design-philosophy-and-review-state.md` (primary)
- Other `notes/**.md` files in the parent issue if they reference milestone / due — sweep and patch.
