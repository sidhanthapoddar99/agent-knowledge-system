---
title: "Custom pages: home, info and countdown"
status: in-progress
---

Custom pages are built-in layouts drawn from YAML data: `home` (hero plus features), `info` (an about-style content page) and `countdown`. They are not user code, and after the migration there is no way to add user layouts; a truly one-off page is an HTML artifact or a fragment ([30](./30_artifact-pages.md)). This leaf rebuilds the three as pure components fed by the `custom` payload, and records which ideas from [2025-06-25-layouts-and-variations](../../../2025-06-25-layouts-and-variations/issue.md) subtask 02 survive.

# 01 To Do
- [x] **Components** in `agentks-ui/src/layouts/custom/{home,info,countdown}/`, from today's [custom layouts](../../../../../../agent-ks-engine/src/layouts/custom). `home` keeps `Hero` and `Features`; `info` keeps `Content`.
- [ ] **Data from Rust.** The `custom` payload carries the page's parsed YAML, validated against a schema per layout (hero title, subtitle, CTA label and URL; feature items; info sections; countdown target date and labels). A missing required field is an error at load naming the file and field; the component never loads its own data (today's layouts call `loadFile` themselves).
- [x] **Display tokens.** These are the only surfaces allowed `--display-*` tokens and fluid `clamp()` sizes.
- [x] **Countdown** runs as a small island (the only timer), and shows the static target date without JavaScript.
- [ ] **Fragment slot.** When [30](./30_artifact-pages.md) settles HTML fragments, `home` and `info` accept a fragment block in their YAML.
- [x] **From the variations backlog (absorbed 02):** "landing page with hero" is `home`; "about page" is `info`. "Contact page" and "more custom layouts" are dropped unless a real need appears: on-demand only.
- [ ] **Parity** with this repository's [home](../../../../pages/home.yaml) and [about](../../../../pages/about.yaml) pages.

## Guardrails
- No user layouts, no server-side code in layouts.
- Schema errors are errors, never silent defaults.

## Done when
- This repository's home and about pages render with parity in light and dark mode.
- A YAML file missing a required field fails start-up with a message naming the file and the field.

# 02 Status and Result
In progress: the three layouts, the countdown island and the field check are built and green. Left: Rust's per-layout schema check at start-up, the rendered `content` of an info page, and the fragment slot (waits on [30](./30_artifact-pages.md)).

## Result
- **Code** (main repository, branch `wave3/layout-pages`): `apps/packages/agentks-ui/src/layouts/custom/` — `home/` (`Layout.tsx`, `Hero.tsx`, `Features.tsx`, `data.ts`, `home.css`), `info/` (`Layout.tsx`, `info.css`), `countdown/` (`Layout.tsx`, `countdown.css`), `read.ts` (the field reader), `DataProblems.tsx` (the problems page). The timer island is `src/islands/countdown/` (`Countdown.tsx`, `remaining.ts`). Registry: `CUSTOM_LAYOUTS` with `@custom/home`, `@custom/info`, `@custom/countdown`.
- **Client:** `controller.ts` draws `custom` routes; the mock engine serves this repository's home and about pages and a countdown at `/`, `/about`, `/launch`.
- **Tests:** `tests/pages.test.tsx` (home, info, countdown without JavaScript, every problem named by field, the engine fixture's `hero.tagline` reported), `tests/live.test.tsx` (the countdown ticks). `ctl gate` green.
- **Parity:** home matches today (hero, both calls to action, six features) in light and dark. About shows its title and description as today; its `content` was never shown today and now shows a notice instead.
- **Screenshots:** `/tmp/lp-shots/default-home-{light,dark}.png`, `default-about-{light,dark}.png`, `default-launch-{light,dark}.png`, `minimal-phone-home-*.png`, `minimal-phone-launch-*.png`.

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
- Decided (claude, 2026-10-01): until Rust types each layout's data, `read.ts` checks the untyped `data` field by field, and a page with any problem draws the list of problems (`` `hero.title` is required.``) instead of the layout, because the rule is errors, never defaults. It also reports unknown fields, so a typo is not silently ignored.
- Decided (claude, 2026-10-01): the fields are today's YAML: home needs `hero.title` (`subtitle`, `cta`, `secondaryCta`, `features` optional; a call to action needs `label` and `href`; a feature needs `title` and `description`); info needs `title`; countdown needs `title` and `targetDate`. Today's fallbacks (`"Page"`, `"Countdown"`, a fixed date) are gone.
- Decided (claude, 2026-10-01): `targetDate` must be a date and time (`2026-03-01T00:00:00`, zone optional), because a bare date counts to midnight UTC while a date and time counts to local time.
- Decided (claude, 2026-10-01): an info page's `content` is markdown the component cannot render, so the page shows a notice where it would go, rather than dropping it silently as today.
- Decided (claude, 2026-10-01): the countdown ticks once a second (not every frame), and the page always prints the target date, so a reader without JavaScript still sees when.
- Decided (claude, 2026-10-01): the custom pages' classes carry the `aks-` prefix (`aks-hero`, `aks-feature`…), because today's were scoped Astro classes, not public hooks; each part also has a `data-part`.

# 05 Notes & Analysis
## Watch out
- Today the home layout's README documents the YAML shape; turn it into the Rust schema and a docs page, not a comment in the component.
