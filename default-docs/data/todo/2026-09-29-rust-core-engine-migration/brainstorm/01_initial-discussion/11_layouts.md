---
title: "Layouts: built-in only"
---

**Custom layouts are dropped.** The project began as a document manager, and custom layouts existed so a site could match a brand. CSS covers branding. Instead, the engine ships more built-in layouts, added when there is real demand, not ahead of it.

# 03 References

- [CSS and theming](./10_css-and-theming.md)
- [Why and the prior audit](./02_why-and-prior-audit.md) — the audit listed external layouts as one of six things a rewrite makes harder. This decision removes it.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): drop user-authored custom layouts and the logic behind them.
- Decided (sidhantha, 2026-09-29): branding is done with CSS.
- Decided (sidhantha, 2026-09-29): add more built-in layouts, possibly ten or more over time, but only on demand.
- Decided (sidhantha, 2026-09-29): layouts are standard components of the Vite frontend, chosen by name in config and fed by JSON from Rust ([the architecture note](./17_local-spa-over-websocket.md)).
- Decided (sidhantha, 2026-09-30): the layouts live in a shared package, `apps/packages/agentks-ui`, used by the local client and by the static build ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

# 05 Notes & Analysis

## 01 What goes away

- The `@ext-layouts` alias and user layout folders (`default-docs/layouts/<type>/<style>/`).
- User layouts that run server-side code, like calling `loadFile` or `loadIssues`.

## 02 What stays

- Built-in layout styles chosen by name in config (docs default and compact, blog, issues, navbar and footer variants). They become frontend components.
- The built-in custom pages (home, about, countdown). They are built-in layouts fed by YAML data, not user code.

## 03 Escape hatch for one-off pages (claude, proposed)

An HTML artifact already covers a truly bespoke page. Letting an artifact serve as a top-level page would cover the remaining need without reopening custom layouts.

## 04 Consequence

Every existing custom layout in a consumer project needs a migration: to a built-in style plus CSS, or to an artifact.
