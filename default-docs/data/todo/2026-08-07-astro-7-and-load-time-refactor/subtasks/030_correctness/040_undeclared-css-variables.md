---
title: "44 CSS variables used but never declared"
status: open
---

# Overview

The theme contract declares **53 required variables**. The stylesheets reference **44 more
that nothing declares.**

The clearest case is `--color-text-tertiary`, used at `markdown.css:856` and `:888` with
frozen `#888` / `#999` fallbacks. The variable never resolves, so the fallback is the value
— which means task-checkbox borders **already ignore dark mode**.

This is exactly the failure the project's own theming rule exists to prevent: *"inventing
names with inline fallbacks is how bugs creep in — the var never resolves, the fallback
freezes the value, dark/light mode stops working."* The rule is written down and it is
being broken.

Also undeclared: `--sidebar-width`, `--navbar-height`, `--outline-width` and the whole
z-index scale. A theme using `override_mode: replace` would lose all of them.

# References

- [the theming and CSS surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/013_surface_theming-and-css.md) — the 53-against-44 count and the named examples
- [the theme parity analysis](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/023_question_theme-css-parity.md) — why a too-narrow contract cannot protect a replace-mode theme
- the project `CLAUDE.md` theming section — the rule being broken, and the coupling to the artifacts skill

# Todo list

- [ ] Enumerate all 44 — produce the actual list, do not work from the examples
- [ ] Sort each into: promote to the contract / rename onto an existing token / delete
- [ ] Fix `--color-text-tertiary` first — it is a live dark-mode defect
- [ ] Add the promoted names to `theme.yaml` `required_variables`
- [ ] **Mirror any contract change into the artifacts skill's inline variable list**, both the repo source and the installed cache
- [ ] Add a check that fails when a stylesheet references an undeclared variable

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## Not every one of the 44 should be promoted

A bigger contract is a bigger burden on every theme author. Sort them:

- **Promote** — layout-structural values a replace-mode theme genuinely must supply:
  `--sidebar-width`, `--navbar-height`, `--outline-width`, the z-index scale.
- **Rename** — where an existing token already means the same thing.
  `--color-text-tertiary` is the test case: is it genuinely a fourth text tier, or is it
  `--color-text-muted` under another name? Answer that before adding it.
- **Delete** — one-off names with a hardcoded fallback that nobody sets. Fold them into the
  nearest existing token rather than growing the contract.

## The coupling that is easy to miss

`CLAUDE.md` states that any change to `theme.yaml → required_variables` must update the
`agent-ks-artifacts` skill's inline copy of the vocabulary, in **both** the repo source and
the installed plugin cache, byte-identically. If this subtask promotes anything, that
mirror is part of the work, not a follow-up.

## The check is the durable half

The fixes are one-time; the check is what stops it recurring. A CSS scan for `var(--…)`
names, diffed against `required_variables` plus the theme-internal primitives, failing on
anything unaccounted for. Without it the count drifts straight back up.

## Done when

- [ ] The full list of 44 is written into **Outcomes** with a disposition for each
- [ ] `--color-text-tertiary` resolves, and task-checkbox borders respond to dark mode
- [ ] `theme.yaml` and the stylesheets agree
- [ ] Any contract change is mirrored into the artifacts skill, both copies
- [ ] A check exists that fails on an undeclared variable
