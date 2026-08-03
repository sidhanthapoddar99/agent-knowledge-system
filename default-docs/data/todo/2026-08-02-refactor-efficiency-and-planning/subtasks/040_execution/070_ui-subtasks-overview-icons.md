---
title: "UI — Subtasks and Overview have no section icon"
status: done
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

- [x] Find where the per-section icon is chosen, and why two sections fall
      through it
- [x] Pick icons for Subtasks, Overview and Plans from the existing palette —
      no new asset unless the palette genuinely lacks one
- [x] Render in `DetailSidebar.astro` and `SubdocTree.astro`
- [x] Check both themes; check the collapsed sidebar state
- [x] `./start build` clean, demo fixture renders

# Outcomes and Next Steps

All seven sidebar groups now carry an icon:
`This issue · Brainstorm · Notes · Plans · Subtasks · Agent log · Agent memory`.

## The answer to "why did two sections fall through"

There was no icon *chooser* to fall through. Each section's heading was written
out by hand in `DetailSidebar.astro`, and the icon was inline markup in that
block — so a section had an icon exactly when whoever wrote its block happened to
paste one in. Subtasks and the issue group did not, and nothing anywhere could
notice: an absent icon is absent markup, not a missing lookup.

**So this was fixed by making it impossible rather than by adding two icons.**
`icon` is a **required field** on the registry entry
([the section registry](./090_section-registry.md)), and the sidebar is now one
ordered pass over `ISSUE_SECTIONS` that renders `section.icon` for every group.
A section cannot ship without one — the compiler rejects the entry.

This is the rule from `~/.claude/CLAUDE.md` applied literally: prefer making an
invariant structural over documenting it. "Remember to add an icon" is a note
nobody reads; a required field is checked every build.

## Verification

- Read off the **built HTML** (not the source) on both the overview page and a
  sub-doc page: seven groups, in registry order, `heading-icon` present on all
  seven.
- **Collapsed state** — the icon sits inside `<summary>`, which is the element
  that stays visible when a `<details>` group is closed, so it renders in both
  states by construction.
- **Both themes** — every section icon is inner SVG markup on a `0 0 16 16`
  viewBox stroked with `currentColor`, so it inherits the heading's colour and
  cannot go invisible under a theme swap. This is enforced by the field's
  contract, documented on `IssueSection.icon`, rather than by having looked at
  two screenshots.
- `./start build` clean at 915 pages; demo fixture renders every section.

## Note on scope

The subtask asked for icons on **Subtasks** and **Overview**, plus Plans in the
same pass. What shipped covers those three and makes the other four structural
rather than incidental. No new icon assets were added — all are inline SVG paths
in the same stroke style as the existing set.

# Details

## Why it is worth its own subtask

It is small, but it is **not** part of the plans-section work and should not wait
on that gate. It also has to be done *with* the plans section rather than after —
adding an eleventh section while two existing ones are already missing icons is
how the inconsistency becomes permanent.
