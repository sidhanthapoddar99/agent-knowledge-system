---
title: "Framework — a section registry, so eleven files stop agreeing by hand"
status: done
---

# Overview

Adding one top-level issue section requires editing **eleven** framework files
that each hard-code the same string. Replace that with one registry the loader,
routes and layouts all read.

**Done when** adding a section is a single registry entry plus its reader, and
removing one leaves no orphan reference — proven by adding a throwaway section in
a test and deleting it again.

# References

- The eleven sites, counted: [Code the plans section](./010_code-the-plans-section.md)
  → *The framework surface*
- Why it is sequenced after plans, not merged into it:
  [the plans spec](../../notes/50_plans-section-spec.md) → *The section registry*

# Todo list

- [x] List the eleven sites and what each needs from a section (reader, route,
      prefix, sidebar label, icon, panel key)
- [x] Design the registry entry — the minimum a section must declare
- [x] Migrate the existing sections one at a time, building green after each
- [x] Prove it: add a throwaway section via one entry, render it, delete it,
      confirm no orphan reference remains
- [x] `./start build` clean, demo fixture renders every section

# Outcomes and Next Steps

`astro-doc-code/src/loaders/issue-sections.ts` is now the single declaration of
what sections exist. A section entry states its **identity** — folder, URL
segment, the field it lands on, panel-key prefix, sidebar label and icon, empty
label, which reader shape it uses, whether the loader walks subfolders, whether
`.html` artifacts are allowed. Declaration order **is** sidebar order.

What is deliberately *not* in the registry is how to read a section. The four
readers (subtask / free-form / agent-log / plan) genuinely differ in shape, and
collapsing them into one pluggable reader would be inventing a plugin system to
avoid four functions.

## The honest cost of adding a section, measured not estimated

Adding the throwaway section and getting it fully rendered took **three** edits,
all runtime-relevant:

| # | File | Edit |
|---|---|---|
| 1 | `loaders/issue-sections.ts` | one `ISSUE_SECTIONS` entry |
| 2 | `loaders/issues.ts` | one field on `Issue` |
| 3 | `loaders/issues.ts` | one reader call in `loadIssueFolder` |

Two further edits are **type-level only** and the compiler names both: the
`subDoc` union in `pages/lib/route-match.ts` and the matching `Props['subDoc']`
union in `SubDocLayout.astro`. The throwaway test skipped them with `as any` and
still rendered correctly, which is the point — nothing silently *misbehaves* if
you forget them, you get a type error.

So: **3 places at runtime, 5 with types, down from 11** — and the two you can
forget are the two that fail loudly.

## What the throwaway test actually caught — three real defects

The test was worth running: the registry was already in place and building
clean, and adding one section still broke in three places that had kept a
hand-written per-section list. All three are fixed.

| Symptom | Cause | Fix |
|---|---|---|
| Build crash — `Cannot read properties of undefined (reading 'name')` | `prepareRender`'s page-title ladder enumerated every kind and **ended in a bare `subDoc.log.name`**, so any unlisted section read `.name` of `undefined` | Title is now `entry.title ?? entry.name`, read from `subDoc[kind]`; no per-section arm |
| Build crash — `undefined (reading 'groupPath')` | `SubDocLayout`'s `activeKey` ladder had one `else if` per free-form section and the same bare `log` fallback | One `freeform` arm driven by `FREEFORM_SECTIONS` + `sectionPanelKey` |
| **Silent** — sidebar rendered the new group correctly but its links pointed at `/notes/…` | `SubdocTree`'s `leafKey`/`leafHref` mapped kind→helper by hand, defaulting to the notes helper | Both derive from the registry entry via `sectionPanelKey` / the new `sectionEntryUrl` |

The third is the one that matters. The first two are loud; that one produced a
sidebar that looked entirely correct and linked to the wrong section — exactly
the failure mode this subtask exists to remove, and it survived the migration
because a default-to-notes fallback reads as harmless.

A fourth thing fell out: `SUBDOC_PROP`, a kind→prop-name map in `route-match.ts`
exported so `static-paths.ts` could emit the identical shape, turned out to be
the **identity on every entry**. It was a per-section list to maintain that said
nothing. Deleted; the prop name is now the sub-doc kind by construction, which
is what let the title and layout ladders collapse.

## Verification

- `./start build` — **915 pages, clean** before; **916 with the throwaway
  section** (its page built and rendered its body); **915 again** after removal.
- Sidebar renders in registry order with an icon on every group, on both the
  overview page and a sub-doc page:
  `This issue · Brainstorm · Notes · Plans · Subtasks · Agent log · Agent memory`
  — this also closes the other half of
  [Sidebar icons](./070_sidebar-icons-and-overview.md), since an icon is now a
  required field rather than something a section can ship without.
- The throwaway section's own sub-doc page carried `is-active` +
  `aria-current="page"` on its own sidebar entry, and the panel key
  `scratch-01_throwaway` — so panel routing picked it up from the prefix map
  with no client-side edit.
- After removal: no `scratch` reference anywhere under `astro-doc-code/src/`, no
  orphan directory in `dist/`, `git status` shows only the intended files.
- `agent-ks check issues` — 0 errors, 2 pre-existing warnings unrelated to this.

## Next

Nothing outstanding for the registry itself. The remaining per-section knowledge
lives in the two `subDoc` type unions (compiler-enforced) and in the four reader
functions (deliberate).

# Details

## Why this is after the plans section, not part of it

Doing both at once means that when a section fails to render you cannot tell
which change broke it — the new section, or the new mechanism carrying it. Land
plans the existing way, then refactor the mechanism with a known-good set of
sections to migrate.

**This is sequencing, not deferral.** The standing tie-breaker favours the
structural fix; it does not favour two structural changes entangled in one diff.

## The trigger, so this does not sit open forever

Do it when either happens: a **twelfth** section is proposed, or a bug is traced
to a site someone missed. Both are evidence the by-hand approach has stopped
paying.
