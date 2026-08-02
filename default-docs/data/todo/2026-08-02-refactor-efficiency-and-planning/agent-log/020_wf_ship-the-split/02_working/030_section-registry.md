---
title: "Section registry"
status: done
agent: claude
---

# Goal

Subtasks 090 and 070 — replace the eleven files that each hard-code the same
section names with one registry, and make a sidebar icon a required field rather
than something a section could ship without.

# Inputs

- `subtasks/040_execution/090_section-registry.md`
- `subtasks/040_execution/070_ui-subtasks-overview-icons.md`
- The eleven sites, counted in `subtasks/040_execution/010_code-the-plans-section.md`

# Expected Outcome

Adding a section is one registry entry plus its reader; removing one leaves no
orphan. Proven by adding a throwaway section and deleting it again.

# Outcome

Shipped. `astro-doc-code/src/loaders/issue-sections.ts` is the single
declaration; full detail in
[the subtask](../../../subtasks/040_execution/090_section-registry.md).

**The measured cost of adding a section: 3 runtime edits, 5 with types, from
11.** The two extra are the `subDoc` type unions, and the compiler names both —
the throwaway test skipped them with `as any` and still rendered correctly, which
is the point: forgetting them is a type error, not a silent miss.

## The throwaway test earned its keep — three real defects, one silent

The registry was already in place, building clean at 915 pages, and *looked*
finished. Adding one section still broke three ways:

| Symptom | Cause | Fix |
|---|---|---|
| Build crash, `undefined (reading 'name')` | `prepareRender`'s title ladder ended in a bare `subDoc.log.name` | `entry.title ?? entry.name` off `subDoc[kind]` |
| Build crash, `undefined (reading 'groupPath')` | `SubDocLayout`'s `activeKey` ladder, same bare `log` fallback | one `freeform` arm over `FREEFORM_SECTIONS` |
| **Silent** — group rendered, links pointed at `/notes/…` | `SubdocTree`'s `leafKey`/`leafHref` mapped kind→helper by hand, **defaulting to the notes helper** | both derive from the registry entry |

The third is the finding. The first two are loud and would have been caught by
anyone. The third produced a sidebar that looked entirely correct while linking
to the wrong section, and it survived the migration precisely because a
default-to-notes fallback reads as harmless housekeeping.

This is the shape the standing rules warn about: **a required rule written so the
caller may omit it, which then returns a plausible result instead of failing.**
Here the "caller" was a new section and the plausible result was somebody else's
URL.

## What fell out on the way

`SUBDOC_PROP` — a kind→prop-name map exported from `route-match.ts` so
`static-paths.ts` could emit the identical prop shape — turned out to be the
**identity on every entry**. A per-section list to maintain that said nothing.
Deleted; the prop name is the sub-doc kind by construction, and that is what let
the title ladder and the layout ladder collapse into expressions.

## Decisions taken inside the round

- **`nested` means "has subfolders the loader walks", not "free-form tree".**
  Caught before the build: `plans` has subfolders in a fixed two-level shape, and
  marking it `nested: false` would have stopped plan-stage edits busting the
  loader's cache signature — a stale-page bug visible only in dev. Free-form-ness
  is `reader === 'freeform'`, which is a separate question.
- **The four readers stay four functions.** The registry declares a section's
  *identity*, not how to read it. Subtask / free-form / agent-log / plan genuinely
  differ in shape; collapsing them would be inventing a plugin system to avoid
  four functions.
- **The sidebar is one ordered pass, not a loop plus bespoke blocks.** The first
  attempt split it into "free-form sections in a loop, then Subtasks, then Plans"
  and silently reordered the sidebar — Agent memory landed between Notes and
  Plans. Declaration order in the registry **is** sidebar order; anything that
  breaks that is a regression you find by reading rendered HTML, not source.
- **`panels.ts` keeps a deliberate build-time mirror of the prefix map.** It is
  client-side; importing the registry would pull `fs` into the browser bundle.
  Longest-prefix-wins, with the duplication called out in a comment as
  intentional.

## Verification

- `./start build`: 915 clean → **916 with the throwaway section** → 915 again
  after removal. No `scratch` reference left under `src/`, no orphan directory in
  `dist/`, `git status` shows only intended files.
- Sidebar order and icons read off **built HTML** on both an overview page and a
  sub-doc page — seven groups, icon on every one.
- The throwaway section's sub-doc page carried `is-active` +
  `aria-current="page"` and the panel key `scratch-01_throwaway`, so panel
  routing picked it up from the prefix map with no client-side edit.
- `agent-ks check issues`: 0 errors, 2 pre-existing warnings unrelated to this.
