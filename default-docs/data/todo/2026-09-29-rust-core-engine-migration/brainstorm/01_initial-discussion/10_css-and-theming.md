---
title: "CSS and theming"
---

With custom layouts gone, **CSS is the one way a user brands the site**. So an AI working in a user's project must always be able to see the CSS the installed version uses. The binary provides that: a command prints the compiled CSS for exactly this version, so an agent never depends on a skill's copy that may be stale.

# 03 References

- [Layouts](./11_layouts.md) — why CSS became the only branding tool.
- The existing `agent-ks theme tokens --json` already prints theme variable values.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the CLI lists the compiled CSS of the installed version (working name `list-css`), so the user's agent can see and override it.
- Decided (sidhantha, 2026-09-29): a skill teaches how to override CSS, and points to the command as its reference.
- Decided (sidhantha, 2026-09-29): Rust compiles each project's theme CSS and caches it; the frontend fetches it. Common assets ship in the frontend build.

# 05 Notes & Analysis

## 01 The user's worry

A skill can modify CSS well if it has a reference to the existing CSS. But what if it has no reference? The answer is that the binary is the reference, versioned with the engine.

## 02 Proposed commands (claude)

- `agentks theme css` prints the compiled CSS, next to the existing `theme tokens`.
- `agentks theme eject` copies it into `config/themes/<name>/` as a starting point.

## 03 Class names become a contract (claude, proposed)

If CSS is the only extension point, the class names in layouts become a public API. Renaming a class silently breaks someone's branding. So:

- Layouts expose stable, documented hooks (class names or `data-part` attributes), treated like the theme variables.
- `agentks theme css` lists the hooks as well as the variables.
- Renaming or removing a hook needs a migration, like renaming a frontmatter field.
