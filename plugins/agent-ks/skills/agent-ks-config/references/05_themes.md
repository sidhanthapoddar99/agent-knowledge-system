# Themes

A theme is a folder with a `theme.yaml` and CSS files. It defines CSS variables. Every layout reads them. The user guide section is `@root/default-docs/data/user-guide/25_themes/`. Read it before you write a standalone theme or change the contract.

Dark mode is not a second theme. It is a switch inside one theme. The navbar toggle sets `data-theme="dark"` on `<html>`. The CSS rules under that selector do the rest.

## Where themes live

| What | Where |
|---|---|
| The built-in default theme | `@root/astro-doc-code/src/styles/`; read-only. Referenced as `@theme/default` |
| The bundled themes `full-width` and `minimal` | `@root/default-docs/themes/<name>/`; scan with `theme_paths: ["@root/default-docs/themes"]` |
| User themes | the project's `themes/<name>/`; scan with `theme_paths: ["@themes"]` |
| The active theme | `site.yaml → theme: "<name>"`. Themes are site-wide; a `pages:` entry cannot set one |

The loader scans only the folders in `theme_paths`. A theme outside them is "not found". Do not name a theme folder `default`. That name is the built-in theme, and the clash is an error at startup.

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

Then in `site.yaml` set `theme: "purple"` and `theme_paths: ["@themes"]`. A new folder needs one restart: `./start stop`, then `./start --detach`. Later CSS edits hot-reload.

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

The default theme's files, by role. `color.css` holds the colours, for both modes. `font.css` holds the families, the scale and the semantic tokens. `element.css` holds spacing, radii, shadows, transitions and dimensions. `breakpoints.css` holds the responsive scale, as comments, because `@media` cannot read a variable. The rest are `reset.css`, `markdown.css`, `navbar.css`, `footer.css`, `docs.css` and `blogs.css`. A child theme overrides some of these files by shipping a file of the same name.

## Override modes

The parent loads first, the child after, so the child wins on equal selectors. The mode decides what happens when both have a file of the same name.

| Mode | Behaviour | Use for |
|---|---|---|
| `merge` | Both files load, parent then child. Declare only what changes | A re-brand, a few sizes. Almost every theme |
| `override` | The parent's copy of that file is skipped. Its other files still load | A clean replacement of one file, so no parent selector leaks through |
| `replace` | The whole parent is skipped | Rare. Same as `extends: null` with a documented parent |

Chains nest. For example, `nordic-tight` extends `nordic`, and `nordic` extends the default. Keep a chain to two or three levels. A cycle is an error at startup, and the error names the whole chain. A parent rule with a more specific selector beats a child's `:root` rule. Match the selector, or use `override`.

## Dark mode

Declare every colour twice: under `:root` for light, under `[data-theme="dark"]` for dark. Declare shadows twice when needed, because a faint shadow vanishes on black. Never declare fonts, spacing, radii or semantic tokens twice. Dark mode is a colour change only.

Three things break dark mode without an error. A hardcoded hex or `rgba()` value stays light. An invented variable with a fallback, such as `var(--card-bg, #f5f5f5)`, always shows the fallback. A `color-mix()` with a literal colour keeps that half fixed. The fix is always a contract variable.

## The contract

Every theme must define, or inherit, every variable in `@root/astro-doc-code/src/styles/theme.yaml → required_variables`. A variable is on the list only when a shipped layout reads it. The list does not fill in a scale for neatness. So `--font-weight-normal` is required and `--font-weight-bold` is not. `agent-ks theme tokens --json` prints the live values for light and dark. The groups:

| Group | Variables |
|---|---|
| Colours | `--color-bg-{primary,secondary,tertiary}`, `--color-text-{primary,secondary,muted}`, `--color-border-{default,light}`, `--color-brand-{primary,secondary}`, `--color-{success,warning,error,info}` |
| Issue status | `--status-{open,blocked,in-progress,input-needed,review,done,dropped,superseded}`. A theme recolours them. The names are fixed in the framework |
| Font primitives | `--font-family-{base,mono}`, `--font-size-{sm,base,lg,xl,2xl}`, `--line-height-base`, `--font-weight-normal` |
| UI text tiers | `--ui-text-{micro,body,title}`. Three tiers are the whole chrome palette. Emphasis comes from weight and colour |
| Content text | `--content-{body,h1,h2,h3,h4,h5,h6,code}` |
| Display | `--display-{sm,md}`, for the home hero and the countdown |
| Elements | `--spacing-{xs,sm,md,lg,xl,2xl,3xl}`, `--border-radius-{sm,md,lg,full}`, `--shadow-{sm,md,lg,xl}`, `--transition-{fast,normal}` |
| Dimensions | `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-{primary,secondary}`. Structure, not style: drop one and the docs grid collapses |

A theme may declare extra variables for its own files. Nothing else reads them.

Two checks exist, and neither is the whole gate. The loader walks `required_variables` only for a theme whose own `theme.yaml` declares that key. It does that only in dev. It reports through the dev toolbar's error logger. Most themes omit the key to inherit the contract, so most themes are never walked. The gate that checks both directions is `@root/scripts/checks/check-theme-contract.mjs`. It keeps `theme.yaml` and the layouts in step. It is a development-stage script, so a consumer does not run it. So adding a variable to `required_variables` records the contract. It does not make every theme define the variable.

## Assets in a theme

Fonts and images sit in the theme folder, at `themes/<name>/assets/`. The CSS references them with a relative path: `src: url('./assets/Inter-Regular.woff2')`. The loader resolves the path against the theme folder.

## Validation and errors

The loader checks at load time. Errors block the theme. Warnings show in the dev toolbar's error logger and let the theme load. The Message column is the engine's exact text, so you can grep the console for it.

| Message | Cause | Fix |
|---|---|---|
| `Theme "x" not found` | `theme:` names a folder outside `theme_paths` | Fix the name, or add the folder to `theme_paths` |
| `Theme file not found: <file>` | `files:` names a missing file | Create it or drop the entry |
| `Required CSS variable not defined: <var>` | A standalone or `replace` theme that never defines it. An `override` gap warns instead, and `merge` inherits it silently | Declare it in the theme's own CSS |
| `Circular theme inheritance` | Two themes extend each other | Point one at `@theme/default` or `null` |
| `Invalid override_mode "<x>" in <path>` | Typo | `merge`, `override` or `replace` |

To check a theme, do three things. Toggle dark mode and walk every layout type. Grep the theme CSS for `#[0-9a-f]` and `rgba(`. In DevTools, confirm that every `--color-*` on an element resolves to a value, not to undefined. The validator checks the contract. It does not check contrast or taste.
