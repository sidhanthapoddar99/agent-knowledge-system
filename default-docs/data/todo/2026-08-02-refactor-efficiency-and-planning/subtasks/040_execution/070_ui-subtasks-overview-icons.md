---
title: "UI — Subtasks and Overview have no section icon"
status: open
---

# Overview

Every issue section carries an icon in the sidebar and the sub-doc tree except
**Subtasks** and **Overview**, which render bare. Inconsistent, and it makes the
two most-visited entries the hardest to find by eye.

**Done when** Subtasks and Overview each render an icon in the same position and
size as the other sections, in both the detail sidebar and the sub-doc tree, in
light and dark themes.

# References

- Reported by Sid, 2026-08-02, while reviewing the plans-section design
- Icon plumbing already used by the other sections:
  `src/layouts/issues/default/server/agent-log-icons.ts`,
  `server/state-icon.ts`
- Rendering surfaces: `parts/detail/DetailSidebar.astro`,
  `parts/detail/SubdocTree.astro`
- The new **Plans** section lands at the same time — give it an icon in the same
  pass ([Code the plans section](./010_code-the-plans-section.md))

# Todo list

- [ ] Find where the per-section icon is chosen, and why two sections fall
      through it
- [ ] Pick icons for Subtasks, Overview and Plans from the existing palette —
      no new asset unless the palette genuinely lacks one
- [ ] Render in `DetailSidebar.astro` and `SubdocTree.astro`
- [ ] Check both themes; check the collapsed sidebar state
- [ ] `./start build` clean, demo fixture renders

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why it is worth its own subtask

It is small, but it is **not** part of the plans-section work and should not wait
on that gate. It also has to be done *with* the plans section rather than after —
adding an eleventh section while two existing ones are already missing icons is
how the inconsistency becomes permanent.
