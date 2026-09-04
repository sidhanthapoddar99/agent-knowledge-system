# Themes

A theme is a folder with a `theme.yaml` and CSS files. It defines CSS variables; every layout consumes them. The user guide section is `@root/default-docs/data/user-guide/25_themes/`. Read it before a standalone theme or a contract change.

Dark mode is not a second theme. It is a mode switch inside one theme: the navbar toggle sets `data-theme="dark"` on `<html>`, and the CSS cascade does the rest.

## Where themes live

| What | Where |
|---|---|
| The built-in default theme | `@root/astro-doc-code/src/styles/`; read-only. Referenced as `@theme/default` |
| The bundled themes `full-width` and `minimal` | `@root/default-docs/themes/<name>/`; scan with `theme_paths: ["@root/default-docs/themes"]` |
| User themes | the project's `themes/<name>/`; scan with `theme_paths: ["@themes"]` |
| The active theme | `site.yaml → theme: "<name>"`. Themes are site-wide; a `pages:` entry cannot set one |

The loader scans only the folders in `theme_paths`. A theme outside them is "not found". A theme folder may not be named `default`; that name is the built-in, and the collision errors at startup.

## Quick start: extend the default

Most themes re-brand the default and change nothing else.

```
themes/purple/
├── theme.yaml
└── color.css
```

```yaml
# themes/purple/theme.yaml
name: "Purple"
version: "1.0.0"
extends: "@theme/default"
override_mode: "merge"
files:
  - color.css
```

```css
/* themes/purple/color.css: only the variables that change */
:root {
  --color-brand-primary: #7c3aed;
  --color-brand-secondary: #6d28d9;
}
[data-theme="dark"] {
  --color-brand-primary: #a78bfa;
  --color-brand-secondary: #c4b5fd;
}
```

Then `site.yaml`: `theme: "purple"` with `theme_paths: ["@themes"]`. A new folder needs one restart: `./start stop`, then `./start --detach`. Later CSS edits hot-reload.

## `theme.yaml`

| Field | Required | Meaning |
|---|---|---|
| `name`, `version` | yes | Display name and semver. Stored, not enforced |
| `description` | no | One line |
| `extends` | no | `"@theme/default"`, another theme's name, or `null` for standalone |
| `override_mode` | no | `merge` (default), `override`, `replace`. See below |
| `supports_dark_mode` | no | Declares intent. The CSS does the work |
| `files` | yes | CSS files, in load order, relative to the theme folder. Variables first, then styling: `color.css`, `font.css`, `element.css`, then component files |
| `required_variables` | no | Omit it to inherit the contract. Declare it only for a theme that ships its own layouts |

The default theme's files, by role: `color.css` (colours, both modes), `font.css` (families, scale, semantic tokens), `element.css` (spacing, radii, shadows, transitions, dimensions), `breakpoints.css` (the responsive scale, as comments — `@media` cannot read a variable), `reset.css`, `markdown.css`, `navbar.css`, `footer.css`, `docs.css`, `blogs.css`. A child overrides a subset by shipping a file of the same name.

## Override modes

The parent loads first, the child after, so the child wins on equal selectors. The mode decides what happens when both have a file of the same name.

| Mode | Behaviour | Use for |
|---|---|---|
| `merge` | Both files load, parent then child. Declare only what changes | A re-brand, a few sizes. Almost every theme |
| `override` | The parent's copy of that file is skipped. Its other files still load | A clean replacement of one file, so no parent selector leaks through |
| `replace` | The whole parent is skipped | Rare. Same as `extends: null` with a documented parent |

Chains nest: `nordic-tight` extends `nordic` extends the default. Keep them to two or three levels. A cycle throws at startup with the whole chain named. A parent with a more specific selector beats a child's `:root`; match the selector or use `override`.

## Dark mode

Declare every colour twice: under `:root` for light, under `[data-theme="dark"]` for dark. Shadows sometimes, because a faint shadow vanishes on black. Never fonts, spacing, radii or semantic tokens; dark mode is a colour change only.

Three things silently break it. A hardcoded hex or `rgba()` stays light. An invented variable with a fallback, `var(--card-bg, #f5f5f5)`, freezes at the fallback. A `color-mix()` with a literal colour freezes that half. The fix is always a contract variable.

## The contract

Every theme must define, or inherit, every variable in `@root/astro-doc-code/src/styles/theme.yaml → required_variables`. A variable is on the list if and only if a shipped layout reads it. The list does not complete scales for tidiness: `--font-weight-normal` is required and `--font-weight-bold` is not. `agent-ks theme tokens --json` prints the live values for light and dark. The groups:

| Group | Variables |
|---|---|
| Colours | `--color-bg-{primary,secondary,tertiary}`, `--color-text-{primary,secondary,muted}`, `--color-border-{default,light}`, `--color-brand-{primary,secondary}`, `--color-{success,warning,error,info}` |
| Issue status | `--status-{open,blocked,in-progress,input-needed,review,done,dropped,superseded}`. A theme recolours them; the names are fixed in the framework |
| Font primitives | `--font-family-{base,mono}`, `--font-size-{sm,base,lg,xl,2xl}`, `--line-height-base`, `--font-weight-normal` |
| UI text tiers | `--ui-text-{micro,body,title}`. Three tiers are the whole chrome palette; emphasis comes from weight and colour |
| Content text | `--content-{body,h1,h2,h3,h4,h5,h6,code}` |
| Display | `--display-{sm,md}`, for the home hero and the countdown |
| Elements | `--spacing-{xs,sm,md,lg,xl,2xl,3xl}`, `--border-radius-{sm,md,lg,full}`, `--shadow-{sm,md,lg,xl}`, `--transition-{fast,normal}` |
| Dimensions | `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-{primary,secondary}`. Structure, not style: drop one and the docs grid collapses |

A theme may declare extra variables for its own files. Nothing else reads them.

Two checks, and neither is the whole gate. The loader walks `required_variables` only for a theme whose own `theme.yaml` declares that key, and only in dev; it reports through the dev toolbar's error logger. Most themes omit the key to inherit the contract, so most themes are never walked. The both-directions gate is `@root/scripts/checks/check-theme-contract.mjs`: it holds `theme.yaml` and the layouts in step, and it is a development-stage script that a consumer does not run. So adding a variable to `required_variables` records the contract; it does not make every theme define it.

## Assets in a theme

Fonts and images sit in the theme folder, `themes/<name>/assets/`, and CSS references them relatively: `src: url('./assets/Inter-Regular.woff2')`. The loader resolves the path against the theme folder.

## Validation and errors

The loader checks at load time. Errors block the theme; warnings show in the dev toolbar's error logger and let it load. The Message column is the engine's exact text, so you can grep the console for it.

| Message | Cause | Fix |
|---|---|---|
| `Theme "x" not found` | `theme:` names a folder outside `theme_paths` | Fix the name, or add the folder to `theme_paths` |
| `Theme file not found: <file>` | `files:` names a missing file | Create it or drop the entry |
| `Required CSS variable not defined: <var>` | A standalone or `replace` theme that never defines it. An `override` gap warns instead, and `merge` inherits it silently | Declare it in the theme's own CSS |
| `Circular theme inheritance` | Two themes extend each other | Point one at `@theme/default` or `null` |
| `Invalid override_mode "<x>" in <path>` | Typo | `merge`, `override` or `replace` |

To check a theme: toggle dark mode and walk every layout type; grep the theme CSS for `#[0-9a-f]` and `rgba(`; and in DevTools, confirm every `--color-*` on an element resolves to a value, not undefined. The validator checks the contract, not contrast or taste.
