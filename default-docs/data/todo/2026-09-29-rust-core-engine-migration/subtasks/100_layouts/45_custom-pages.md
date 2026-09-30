---
title: "Custom pages: home, info and countdown"
status: open
---

Custom pages are built-in layouts drawn from YAML data: `home` (hero plus features), `info` (an about-style content page) and `countdown`. They are not user code, and after the migration there is no way to add user layouts; a truly one-off page is an HTML artifact or a fragment ([30](./30_artifact-pages.md)). This leaf rebuilds the three as pure components fed by the `custom` payload, and records which ideas from [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) subtask 02 survive.

# 01 To Do
- [ ] **Components** in `agentks-ui/src/layouts/custom/{home,info,countdown}/`, from today's [custom layouts](../../../../../../agent-ks-engine/src/layouts/custom). `home` keeps `Hero` and `Features`; `info` keeps `Content`.
- [ ] **Data from Rust.** The `custom` payload carries the page's parsed YAML, validated against a schema per layout (hero title, subtitle, CTA label and URL; feature items; info sections; countdown target date and labels). A missing required field is an error at load naming the file and field; the component never loads its own data (today's layouts call `loadFile` themselves).
- [ ] **Display tokens.** These are the only surfaces allowed `--display-*` tokens and fluid `clamp()` sizes.
- [ ] **Countdown** runs as a small island (the only timer), and shows the static target date without JavaScript.
- [ ] **Fragment slot.** When [30](./30_artifact-pages.md) settles HTML fragments, `home` and `info` accept a fragment block in their YAML.
- [ ] **From the variations backlog (absorbed 02):** "landing page with hero" is `home`; "about page" is `info`. "Contact page" and "more custom layouts" are dropped unless a real need appears: on-demand only.
- [ ] **Parity** with this repository's [home](../../../../pages/home.yaml) and [about](../../../../pages/about.yaml) pages.

## Guardrails
- No user layouts, no server-side code in layouts.
- Schema errors are errors, never silent defaults.

## Done when
- This repository's home and about pages render with parity in light and dark mode.
- A YAML file missing a required field fails start-up with a message naming the file and the field.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui/src/layouts/custom/`.
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (sections 01, 02), [the custom pages user guide](../../../../user-guide/20_custom-pages/01_overview.md), [custom layout internals](../../../../dev-docs/10_layouts/04_custom-layout).
- **Absorbed:** [layouts-and-variations subtask 02 page templates](../../../2025-06-25-layouts-and-variations/subtasks/02_page-templates.md).
- **Depends on:** [10](./10_theme-contract-and-css.md), [50](./50_navbar-and-footer.md), [030/80](../030_rust-engine/80_page-data-interface.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): user-authored custom layouts are dropped; `home`, `info` and `countdown` stay as built-in layouts.
- Decided (sidhantha, 2026-09-29): new layouts only on demand.

# 05 Notes & Analysis
## Watch out
- Today the home layout's README documents the YAML shape; turn it into the Rust schema and a docs page, not a comment in the component.
