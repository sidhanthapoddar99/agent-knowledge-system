---
title: "Two small correctness fixes — the production POST and the unhighlighted fences"
status: open
---

# Overview

Two unrelated defects, grouped because each is an afternoon and neither earns its own
subtask.

**1 · A dev-only endpoint is called in production.**
`layouts/issues/default/scripts/detail/subtask-state.ts:14` POSTs to
`/__editor/subtask-toggle` with **no dev guard**. Its `catch` at line 176 rolls the UI back,
so in a built site the checkbox flickers and reverts with no explanation. It fails quietly,
which is why nobody has reported it.

**2 · 139 fenced code blocks render with no highlighting.** Their languages are requested
nowhere in the Shiki config:

| Language | Blocks |
|---|---|
| `astro` | 104 |
| `env` | 13 |
| `jsonc` | 11 |
| `nginx` | 6 |
| `text` | 3 |
| `diff` | 2 |

104 of them are in this project's own documentation, which is where a reader judges the
tool.

# References

- [the content-pipeline surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/011_surface_content-pipeline.md) — the fence census and the Shiki language configuration
- [the layouts surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/012_surface_layouts-and-components.md) — the unguarded POST
- [the issues-layout issue](../../../2026-04-10-issues-layout/issue.md) — the original proposed home for the POST fix

# Todo list

- [ ] Guard the subtask-toggle POST so it only fires in dev
- [ ] Decide what a built site shows for that checkbox — read-only, or hidden
- [ ] Add the six missing languages to the Shiki configuration
- [ ] Re-count unhighlighted fences and confirm it reaches zero
- [ ] Check the bundle-size effect of the added grammars

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## The POST needs a product decision, not just a guard

Adding `import.meta.env.DEV` stops the failed request. It does not answer what a reader of
the published site should see when they click a subtask checkbox. Pick one and implement
it: render it disabled, or do not render the control at all. Leaving a clickable control
that silently does nothing is the current bug in a quieter form.

## The fences — watch the bundle

Shiki loads grammars per language, and they are not small: the built output already carries
`emacs-lisp` at 764 KB, `cpp` at 612 KB and `wolfram` at 260 KB as separate chunks. Adding
six more languages adds more.

Two of the six may not need a grammar at all. `text` is plain by definition, and `env` is
close enough to `ini`/`shell` to alias rather than add. `astro` is the one that matters —
104 blocks, and it is the language this project documents itself in.

Check whether the chunks are loaded lazily per page or eagerly. If eagerly, adding
languages costs every reader, and aliasing becomes the better answer for most of them.

## Done when

- [ ] No `/__editor/*` request is made from a built site — verified against `dist/`
- [ ] The published subtask checkbox has a defined, deliberate appearance
- [ ] A re-run of the fence census returns zero unhighlighted blocks, or a written reason per exception
- [ ] The bundle-size change from added grammars is measured and recorded
