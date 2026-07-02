# Notes — `notes/[<group>/[<subgroup>/]]<slug>.md`

**Finalized output + durable references** — the decided approach you build on, plus
reference material. The *product*, defined by contrast with `brainstorm/`: brainstorm
is *what we're figuring out*, notes are *what we know*. Content arrives by
**graduating** out of a resolved brainstorm (the conclusion distilled, the trail left
behind with a `**Resolved →**` marker) or fully formed (a spec, a how-to, a link
dump). Once here it should be **stable** — a note that keeps changing is a brainstorm
wearing the wrong hat; demote it back (see [25_brainstorm.md](25_brainstorm.md)).

## Shape

No state. Frontmatter is minimal — often just `title`:

```yaml
---
title: "..."
color: "#7aa2f7"   # optional — tints only the sidebar icon, user-defined; preserve when editing
---

Body — freeform.
```

An optional `color:` tints only the sidebar icon and is user-defined — **don't strip or overwrite it** when editing.

## Numbering — optional

A numeric prefix is **optional** for notes (folders *and* files). When you do number them, `NN_` and `NNN_` are both good conventions, using the same shared ordering-prefix grammar as the rest of the project (2–5 digits, ordered by numeric value, `_` canonical / legacy `-` tolerated — see the `documentation-guide` skill's `references/layouts/docs-layout.md`).

- **Gap-number** when a fixed reading order matters: `010_context.md`, `020_design.md`, `030_decision.md` — leaving room to slot `015_` between.
- **Leave unprefixed** when order doesn't matter — the loader builds the tree from whatever it finds.

## Subfolders

May live at the root of `notes/`, or one or two folders deeper for grouping (e.g. `notes/design/phase-1/kickoff.md`). Folder names are freeform. **Two levels is the cap** — if you reach for a third, that's a sign to split into a sibling group or a new issue.

## Add a note

1. Decide where it lives:
   - Single design doc → `<issue>/notes/<slug>.md`
   - Part of a themed set → `<issue>/notes/<group>/<slug>.md` (e.g. `notes/design/overview.md`)
   - Sub-phase of a themed set → `<issue>/notes/<group>/<subgroup>/<slug>.md` (e.g. `notes/design/phase-1/kickoff.md`)
2. Pick a meaningful filename; add a numeric prefix only if reading order matters.
3. Write the file — no required frontmatter beyond an optional `title` (+ optional `color:`).

For moving/renaming a note link-aware, see [43_moving-restructuring.md](../40_operations/43_moving-restructuring.md).
