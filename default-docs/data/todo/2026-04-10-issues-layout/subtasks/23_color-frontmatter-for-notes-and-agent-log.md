---
title: "Notes + agent-log: optional `color` frontmatter that tints the sidebar icon"
state: closed
---

- [x] **Parse `color` frontmatter.** Extend the notes and agent-log frontmatter schema with an optional `color: <css-color>` field. Accept any string the browser accepts as a CSS color — named colors (`red`, `salmon`), hex (`#e06c75`, `#f00`), or longer forms. No vocabulary token system, no theme-alias mapping. The user picks; the framework doesn't impose semantics.
- [x] **Apply tint to the entry's icon in `SubdocTree.astro`.** When `color` is present, render the entry's icon tinted to that value. **Only the icon** is coloured — the label text, row background, and borders all stay default. Implement via inline `style="color: <value>"` on the icon SVG / element (or a CSS custom property on the row that the icon's `fill` / `color` consumes).
- [x] **Default behaviour (no `color` set).** Icon uses the default theme colour (`--color-text-secondary` or whichever the tree currently uses). No regression for existing entries.
- [x] **Test fixtures.** Add at least one note and one agent-log entry with a named color (e.g. `red`), one with a hex (`#7aa2f7`), and one with `color` omitted — to exercise the present-named, present-hex, and absent paths.
- [x] **Update docs.** Document the `color` field in the user-guide pages for notes and agent-log (under `default-docs/data/user-guide/19_issues/05_sub-docs/`). Make clear: it's optional, the user assigns its meaning (status / category / urgency / personal taste — the framework doesn't care), and only the icon is tinted.
- [x] **Update plugin skill.** Add a one-liner to `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md` so agents know about the field and don't strip / overwrite it when editing frontmatter.

## Background

Today every note and agent-log entry in the sidebar tree gets the same generic icon. There's no quick visual cue to distinguish, say, a "decision" note from an "exploration" note, or a problem-discovery agent-log entry from a routine status update.

Adding an optional `color` field lets the user encode whatever visual taxonomy fits their workflow — without the framework having to declare what the colors mean. Same idea as GitHub label colors: the user attaches meaning in their head, the framework just paints.

```yaml
---
title: "Investigated cache invalidation under HMR"
color: "#e06c75"     # this user's convention: red = problem found
---
```

```yaml
---
title: "Decision: drop sub.tab from groupSubs"
color: green         # this user's convention: green = decision recorded
---
```

## Why no vocabulary tokens

Earlier design discussion considered routing the color through a vocabulary declared in the tracker's root `settings.json` (the way `status` / `priority` colors are declared centrally). Rejected because:

- The user's intent is freeform tagging, not a constrained scheme.
- Vocab tokens require declaring values + colors up front; freeform `color:` lets the user evolve their convention without touching `settings.json`.
- The icon is a low-key cue; if it's wrong/ugly, it's the user's icon, not the framework's.

If a constrained color scheme is wanted later, it can be added on top — `color: warning` could fall back to a vocabulary entry, then to a CSS color, then to default. Out of scope for this subtask.

## Files likely touched

- `astro-doc-code/src/loaders/issues.ts` — extend the sub-doc frontmatter schema (add optional `color: string`).
- `astro-doc-code/src/layouts/issues/default/parts/detail/SubdocTree.astro` — read `entry.color`, apply inline style to the icon.
- `default-docs/data/user-guide/19_issues/05_sub-docs/04_notes.md` and `05_agent-log.md` — document the new field.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md` — one-line mention.

## Done

Loader (`issues.ts`) reads optional `color` on notes and agent-log frontmatter into `IssueNote.color` / `IssueAgentLog.color`. `SubdocTree.astro` applies the value as inline `style="color: <value>"` on the icon span only — leveraging the existing `stroke="currentColor"` SVG so just the icon tints. Validator (`plugins/.../scripts/issues/check.mjs`) gained `color` in its `NOTE_FM_KEYS` and `AGENT_LOG_FM_KEYS` schemas. Test fixtures live in `2026-04-10-issues-layout/notes/` (`test-color-named.md`, `test-color-hex.md`) and `agent-log/test-color-absent.md`. User-guide and plugin skill reference both updated. Build clean, validator exit 0.
