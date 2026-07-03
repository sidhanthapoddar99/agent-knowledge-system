---
title: "Sweep — other syntax claims vs framework code"
iteration: 2
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Sweep — other syntax claims vs framework code

## Goal

Answer the second half of the audit: are there **other** errors of the same species
in the skill references — documented behaviour that doesn't match what
`astro-doc-code/src/` actually does?

## Approach

- Enumerate every verifiable syntax/behaviour claim in
  `documentation-guide/references/writing.md` and
  `doc-issues/references/10_writing/10_writing.md`.
- Verify each against framework source (parsers, postprocessors, scripts, layouts).
- Diff the repo-local plugin source against the installed cache to scope where any
  fix must land.

## Result

Two further stale items found — both in the same custom-tags blast radius — and the
rest of the checked claims are accurate:

- **STALE — all three tag snippets, both files.** Not just callout: `:::collapsible`
  and `:::tabs` (with a `- tab:` list body that matches nothing in `tabs.ts`) are
  equally fictional in both references. `10_writing.md` additionally claims the tags
  "work in issue content" — they render as raw text everywhere.
- **STALE — dead user-guide pointer.** `writing.md` sends readers to
  `user-guide/15_writing-content/` for "the full list and syntax" of custom tags.
  That section exists but its custom-tags page was deleted 2026-04-20; the content
  survives only at `2026-04-20-custom-tags/notes/01_original-user-doc.md`.
- **ACCURATE — diagrams.** The claim that Mermaid and Graphviz fenced blocks render
  checks out: wired client-side via `src/scripts/diagrams.ts`, loaded from
  `BaseLayout.astro` (plus editor preview support). No change needed.
- **PARITY — repo vs cache.** `diff -rq` of `plugins/documentation-guide/skills`
  against the installed cache `0.5.1` is clean — the staleness is mirrored
  identically, so the fix must land in both (per standing repo/cache parity rule).
- **No duplicate issue.** `2026-04-20-custom-tags` (open) owns the framework wiring;
  `2026-06-22-updating-skills-and-documentation` (done) was a general maintenance
  batch predating this find. New issue justified, cross-linked to both.

## Next

— (audit closed; fixes tracked in `../../subtasks/10_fix-skill-writing-references.md`)
