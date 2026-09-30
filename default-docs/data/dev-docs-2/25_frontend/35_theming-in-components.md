---
title: "Theming in components"
---

This page explains how the components of `agentks-ui` take their look from the theme. Users brand a site with CSS only, so the markup they can style is an API. How the engine compiles a theme is in [the engine](../10_engine/01_overview.md). How a user writes one is in the user guide's [themes and layouts](../../user-guide-2/45_themes-and-layouts/01_overview.md).

## Where the CSS comes from

| Part | Lives in | Reaches the page how |
|---|---|---|
| The built-in theme: colours, fonts, reset, elements, markdown, breakpoints, and the base CSS of navbar, footer, docs and blog | `apps/agentks-engine/themes/default/` | Rust compiles it with the user's theme into one stylesheet, served at `/theme.<hash>.css` |
| Component CSS of the layouts and islands | `agentks-ui`, beside each component | Vite bundles it into the client. The static renderer links the CSS files that Vite's build manifest lists |
| The user's theme | The project | Compiled by Rust together with the built-in theme |

The manifest names the current theme URL. The client points its stylesheet link at it and changes the link only when the URL changes.

## The cascade layers

Every page's CSS starts with one line that fixes the order of the layers:

```css
@layer reset, theme, elements, components, user;
```

| Layer | Holds |
|---|---|
| `reset` | The built-in reset |
| `theme` | The built-in colours, fonts, element defaults and breakpoints |
| `elements` | The built-in markdown, navbar, footer, docs and blog CSS |
| `components` | The component CSS of `agentks-ui` |
| `user` | Every file of the user's theme |

A later layer beats an earlier one at the same strength. So a user's rule wins over a built-in or component rule without `!important`. `!important` works the other way round across layers: an `!important` in an earlier layer beats one in a later layer.

This line must be the first CSS a page sees, so every layer keeps its place whatever loads first. It lives once, as `LAYER_ORDER_CSS` in `apps/packages/agentks-ui/src/page-head.ts`, and both builds insert it into the page head.

## Rules for component CSS

- **A plain CSS file beside the component,** imported by it, and wrapped in `@layer components`.
- **Values only from the theme contract.** Colours, sizes, spacing, radii, shadows and transitions are `var(--…)` from the theme's required variables and the semantic tokens: `--ui-text-*` for chrome, `--content-*` for prose. No hex codes, no raw `rem` or `px` font sizes, no invented variable names, and no fallback that freezes a value.
- **Hierarchy from weight, colour and position,** not from font size. Three chrome sizes are the whole palette: `--ui-text-micro`, `--ui-text-body` and `--ui-text-title`.
- **No CSS modules and no CSS-in-JS.** Both hash class names, and hashed names would break the public class contract below.

**Class names.** The layouts emit the class names the built-in theme already styles, such as `sidebar__link` and `navbar__logo`, because themes and user CSS target those names. CSS that the package adds beyond them uses the `aks-` prefix, such as `aks-docs-breadcrumbs`, so one layout's CSS cannot reach another's. Every part a user may restyle also carries a `data-part` attribute.

## The public hooks

`apps/packages/agentks-ui/src/hooks.json` lists, for each layout, the `data-part` values and the class names a user theme may style:

```json
{
  "layouts": {
    "@docs/default": {
      "parts": ["docs-layout", "sidebar", "sidebar-folder", "sidebar-item", "docs-body", "outline", "pagination"],
      "classes": ["docs-layout", "sidebar", "sidebar__link", "sidebar__link--active", "outline__link"]
    }
  }
}
```

- **A hook is an API.** Renaming or removing one breaks users' branding silently, so it needs a docs migration, like a renamed frontmatter field ([versioning](../50_versioning/01_overview.md)).
- **`agentks theme css`** prints the compiled CSS together with these hooks and the theme variables, so an agent writing overrides reads the current list instead of an old copy.

## The theme contract check

The package's tests check its CSS against the built-in theme's `theme.yaml`, in two gates:

| Gate | Checks | Catches |
|---|---|---|
| A | Every `var(--x)` the package reads is declared by the built-in theme, or by the package itself for a component-local property | A value that silently falls back and freezes |
| B | Every theme variable the package reads is on `required_variables` | A variable that a `replace`-mode theme would drop |

`--font-size-xs` is the one allowed exception, always read as `var(--font-size-xs, var(--font-size-sm))`.

**A variable is on the contract if and only if a shipped layout reads it,** because a `replace`-mode theme keeps only what the contract names.

## Light and dark

- The mode is a `data-theme` attribute on `<html>`, `light` or `dark`.
- A small script in the page head sets it before first paint: the stored choice under the key `theme`, else the system preference. It is `THEME_PREPAINT_SCRIPT` in `apps/packages/agentks-ui/src/page-head.ts`, shared by both builds.
- The theme-toggle island switches the attribute and stores the choice under the same key. Its code lives in `theme.client.ts`, where browser code is allowed.
- Code highlighting uses CSS classes from Rust's highlighter, so code colours follow the mode too.

## Shared display parts

The UX standards of every layout live as small shared parts in `apps/packages/agentks-ui/src/shared/`:

| Part | Rule it carries |
|---|---|
| `tip`, `iconTip` in `tooltip.ts` | A text row carries `data-tip` and shows it only when the text is cropped. An icon carries `data-tip-always` and the same text as its `aria-label`. When a state swaps, both change together |
| `glyphFor` in `glyphs.ts` | Markdown rows get no type icon. Diagram and artifact pages get a small monochrome glyph, because colour is kept for status |
| `STATUS_VARS` in `status.ts` | Status colour comes only from the theme's status variables. Rust sends the status; this only maps it to its variable |
| `cx` | Joins class names |
