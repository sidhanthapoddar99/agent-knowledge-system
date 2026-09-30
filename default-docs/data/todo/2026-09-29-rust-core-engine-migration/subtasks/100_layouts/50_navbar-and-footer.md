---
title: "Navbar and footer"
status: review
---

Every page carries a navbar and a footer, each chosen by name in config: `default` or `minimal`. This leaf rebuilds the four components, fed by the navbar and footer data in the manifest (from `navbar.yaml` and `footer.yaml`), including logos that switch with light and dark mode, the section links, and the mobile menu.

# 01 To Do
- [x] **Components** in `agentks-ui/src/layouts/navbar/{default,minimal}/` and `footer/{default,minimal}/`, from today's [navbar](../../../../../../agent-ks-engine/src/layouts/navbar) and [footer](../../../../../../agent-ks-engine/src/layouts/footer).
- [x] **Data from the manifest**: site name, logo URLs for light and dark mode (resolved by Rust from `@assets/…` references), navbar items with resolved URLs and the active section, footer columns and links, the theme-toggle placement.
- [x] **Logo switching** by CSS on `data-theme`, no script, so it is right before first paint.
- [ ] **Mobile menu.** Below the tablet breakpoint the navbar collapses into a menu button; it also opens the sidebar drawer on docs pages ([080/60](../080_ui-and-client/60_pwa-and-mobile.md)).
- [x] **Hooks** for the brand, items and footer columns ([10](./10_theme-contract-and-css.md)).
- [x] **From the variations backlog (absorbed 03, open items):** a centred-logo navbar, a four-column footer and a mega menu are **not built now**; they go to [65](./65_layout-variations.md) as on-demand candidates.
- [ ] **Parity** with today on every page type, light and dark.

## Guardrails
- Unknown navbar or footer names fail start-up with the list of names.
- The navbar height is `--navbar-height`; nothing hard-codes it.

## Done when
- Both navbar and both footer styles render with parity, logos switch with the theme, and the mobile menu works at 320 pixels.

# 02 Status and Result
Review: both navbar and both footer styles are built, tested and screenshotted; the menu works at 320 pixels. Two gaps need the engine: footer `social` links and the theme-toggle placement are not in the manifest, and the docs sidebar drawer belongs to [080/60](../080_ui-and-client/60_pwa-and-mobile.md).

## Result
- **Code** (main repository, branch `wave3/layout-pages`): `apps/packages/agentks-ui/src/layouts/navbar/` — `parts/` (`Frame.tsx`: brand, theme toggle, menu button, small-screen menu; `NavLink.tsx`; `navbar.css`), `default/Navbar.tsx` (menus), `minimal/Navbar.tsx` (one flat row). `footer/` — `parts/FooterLink.tsx`, `default/Footer.tsx`, `minimal/Footer.tsx` and `footer.css`. Registry: `@navbar/minimal`, `@footer/minimal`. Hooks in `src/hooks.json`, now checked by `tests/hooks.test.tsx`.
- **Tests:** `tests/pages.test.tsx` (both logos drawn, active item, minimal has no menus and drops no link, minimal footer, unknown names list the known ones), `tests/live.test.tsx` (menu button opens and closes). `ctl gate` green.
- **Screenshots:** `/tmp/lp-shots/default-*-{light,dark}.png` (default chrome), `minimal-post-{light,dark}.png`, `minimal-phone-menu-{light,dark}.png` (320 px, menu open), `minimal-phone-home-*.png`.

## Agent log
none

# 03 References
- **Where:** main repository `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `apps/packages/agentks-ui/src/layouts/navbar/` and `footer/`.
- **Read first:** [theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) (section 01), [project config](../../notes/02_engine/02_project-config.md) (navbar and footer files).
- **Today's config:** [navbar.yaml](../../../../../config/navbar.yaml), [footer.yaml](../../../../../config/footer.yaml).
- **Absorbed:** [layouts-and-variations subtask 03 navbar and footer](../../../2025-06-25-layouts-and-variations/subtasks/03_navbar-and-footer.md) (its done items carry over as behaviour; its open items move to [65](./65_layout-variations.md)).
- **Depends on:** [10](./10_theme-contract-and-css.md), [080/20](../080_ui-and-client/20_shared-ui-package.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): navbar and footer keep `default` and `minimal` ([theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) section 01).
- Decided (claude, 2026-10-01): the two navbar styles share one frame (`navbar/parts/Frame.tsx`), and a style supplies only its row of links, so the brand, toggle and small-screen menu are one piece of code.
- Decided (claude, 2026-10-01): `minimal` uses the theme's `navbar__…` and `footer__…` classes plus `aks-navbar-minimal` or `aks-footer-minimal`, because today's `navbar-minimal__…` classes had no CSS at all, and one set of hooks lets a user theme style both.
- Decided (claude, 2026-10-01): the minimal navbar puts a menu's children in the row, and the minimal footer shows every column link. Today's minimal navbar dropped every menu, and today's minimal footer kept only 4 links; both lost configured links silently.
- Decided (claude, 2026-10-01): a navbar menu also opens on keyboard focus (`:focus-within`), not only on hover.
- Decided (claude, 2026-10-01): the centred-logo navbar, the four-column footer and the mega menu are not built; they stay candidates for [65](./65_layout-variations.md).

# 05 Notes & Analysis
## Watch out
- Today's logo path fix (`resolveAssetUrl` for `theme.dark` and `theme.light`) is a rule; the new engine resolves these in Rust and sends URLs.
