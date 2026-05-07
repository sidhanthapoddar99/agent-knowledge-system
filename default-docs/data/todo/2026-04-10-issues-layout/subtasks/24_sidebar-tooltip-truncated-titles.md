---
title: "Sidebar: tooltip on hover for truncated sub-doc titles"
state: done
done: true
---

- [x] **Show the full untruncated title as a tooltip on hover** for every entry in the sub-doc tree (subtasks, notes, agent-log — they share `SubdocTree.astro`). The sidebar truncates long titles to fit the column; hover should reveal the full string.
- [x] **Use the native `title` attribute** (`<a title="…">` / `<span title="…">`). The OS / browser handles the ~1–2 s delay, the rendering, the auto-dismiss — same UX as hovering a long file name in a file manager. No custom tooltip JS, no instant-pop.
- [x] **Apply to all three sub-doc types.** Subtasks, notes, agent-log entries all render through the same tree component, so a single change covers everything.
- [x] **Test.** Add a fixture entry whose title is long enough to truncate; hover and confirm the tooltip shows the full text after the OS-standard delay.

Docs and plugin-skill updates intentionally skipped: this is a UI-affordance fix, not a new user-facing concept.

## Why native `title`

Three options were considered:

| Option | Pros | Cons |
|---|---|---|
| Native `title` attribute | Zero JS, OS-consistent timing & styling, accessible by default | Look is not theme-aware (uses OS tooltip styling) |
| CSS-only tooltip (`::after` + `:hover`) | Theme-aware look | Hard to get the OS-standard ~1.5 s delay right; flickers; doesn't match user's "file-system feel" |
| JS tooltip library | Full control | Overkill for this; adds bundle weight |

The user's stated UX target is "the file-system file-name hover" — that *is* native `title`. Picking native means we match expectations for free.

## Out of scope

- Custom-styled / theme-aware tooltips. If the OS look bothers anyone, raise a separate subtask later.
- Click-to-expand of truncated rows.
- Tooltips elsewhere in the layout (badges, filter chips, etc.).

## Files likely touched

- `astro-doc-code/src/layouts/issues/default/parts/detail/SubdocTree.astro` — add `title={entry.title}` to whichever element the user's pointer lands on (the row anchor or the truncated label span).

Landed: title attribute added to row anchor + subgroup summary in SubdocTree.astro.
