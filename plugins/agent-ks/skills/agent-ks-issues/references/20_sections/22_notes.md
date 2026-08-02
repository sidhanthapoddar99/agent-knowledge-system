# Notes — `notes/[<group>/[<subgroup>/]]<slug>.md` — conclusions

**What is settled and binding**, plus the reference material a decision rests on.
Defined by contrast with `brainstorm/`: brainstorm is *what we are figuring out*, notes
are *what we know*.

| Holds | Does not hold |
|---|---|
| The **conclusion**, and the one clause of *why* that stops it reading as arbitrary | The **deliberation** that produced it — that stays in `brainstorm/` |
| Decisions that outlive a single run | The **steps that act on it** — those are subtasks |
| Research, evidence and measurements a decision rests on | A detailed account of what to do |
| Contracts downstream work executes against — API shapes, schemas, ownership splits | The narration of the run that produced it — that is the agent log's |

**The test:** would a future reader need it to answer *"why did we do it this way?"*, or
to execute against it? Then it is a note — not a transcript, not a prompt.

**A note that reads like a work order is a subtask.** Notes and subtasks both describing
the same work is the most common duplication in a tracker: the note states the
conclusion, the subtask states what to do about it.

Content arrives by **graduating** out of a resolved brainstorm (the conclusion
distilled, the trail left behind with a `**Resolved →**` marker), fully formed (a spec,
a how-to), or **out of an executing run** — see the persistence rule in
[24_agent-logs.md](24_agent-logs.md).

Once here a note should be **stable** — one that keeps changing is a brainstorm wearing
the wrong hat; demote it back (see [25_brainstorm.md](25_brainstorm.md)).

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

## First-class artifacts + diagrams

A note doesn't have to be markdown. Drop a self-contained **`.html` artifact** — a report, a dashboard, a design-system showcase — into `notes/` and it renders **embedded** as a first-class sub-doc in the issue detail view: an iframe onto the reserved `/artifacts/<path>` route, with an **open-full-page** link and an in-place **expand**, and the site's light/dark theme propagated into it. A **diagram file** (`.excalidraw` / `.mmd` / `.dot` / …) renders the same first-class way.

- **Title** comes from an optional same-name **`<name>.meta.json`** (or `.meta.jsonc`) sidecar — the frontmatter equivalent for a non-markdown file; without one it derives from the filename. Nothing is injected into the `.html`, so the artifact stays a pristine, independently-openable document.
- **Scope: `notes/` and `brainstorm/` only** — the tracker's design-thinking folders. Not the issue root, not `assets/`, not `agent-memory/`.
- No `NN_` prefix is required (numbering stays optional for notes — see below); an artifact participates in the issue's `updated` derivation and caching like any `.md` sibling.
- Author artifacts self-contained (inline CSS/JS, `data:` images); they run **unsandboxed as first-party content**, so never paste untrusted third-party HTML. For the full authoring contract, see the **`agent-ks-artifacts` skill**.

## Numbering — optional

A numeric prefix is **optional** for notes (folders *and* files). When you do number them, `NN_` and `NNN_` are both good conventions, using the same shared ordering-prefix grammar as the rest of the project (2–5 digits, ordered by numeric value, `_` canonical / `-` tolerated — see the `agent-ks-docs` skill's `references/layouts/docs-layout.md`).

- **Gap-number** when a fixed reading order matters: `010_context.md`, `020_design.md`, `030_decision.md` — leaving room to slot `015_` between.
- **Leave unprefixed** when order doesn't matter — the loader builds the tree from whatever it finds.

## Subfolders

May live at the root of `notes/`, or several folders deeper for grouping (e.g. `notes/design/phase-1/kickoff.md`). Folder names are freeform. **5 levels is the hard cap; up to 3 is the recommended convention** — if you reach past three, that's usually a sign to split into a sibling group or a new issue.

## Add a note

1. Decide where it lives:
   - Single design doc → `<issue>/notes/<slug>.md`
   - Part of a themed set → `<issue>/notes/<group>/<slug>.md` (e.g. `notes/design/overview.md`)
   - Sub-phase of a themed set → `<issue>/notes/<group>/<subgroup>/<slug>.md` (e.g. `notes/design/phase-1/kickoff.md`)
2. Pick a meaningful filename; add a numeric prefix only if reading order matters.
3. Write the file — no required frontmatter beyond an optional `title` (+ optional `color:`).

For moving/renaming a note link-aware, see [43_moving-restructuring.md](../40_operations/43_moving-restructuring.md).
