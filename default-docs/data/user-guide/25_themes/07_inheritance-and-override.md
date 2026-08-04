---
title: Inheritance and Override
description: The extends chain, merge / override / replace modes, cascade order, and when to use which
sidebar_position: 7
---

# Inheritance and Override

A theme can inherit from another. The child declares `extends: "@theme/<name>"`, the loader resolves the parent recursively, and the concatenated CSS includes both. Three `override_mode` values decide **how** parent and child combine.

This page is the full reference. For the guided walkthroughs, see [Creating Themes](./06_creating-themes/01_quick-start.md).

## The `extends` field

```yaml
# Inherit from the built-in default
extends: "@theme/default"

# Inherit from another custom theme
extends: "@theme/nordic"

# Standalone — no inheritance
extends: null
```

The `@theme/` prefix is a convention — it tells the loader to look up the parent via `resolveThemeName()`:

- `@theme/default` → `src/styles/` (built-in)
- `@theme/<other-name>` → scans `theme_paths` (from site.yaml) for a folder named `<other-name>`

You can also omit the prefix (`extends: "nordic"`) and the loader applies the same resolution. Prefix is optional but recommended for clarity.

## The chain

Inheritance can nest arbitrarily:

```
nordic-tight  extends nordic  extends "@theme/default"
     │             │
     └─ own overrides        └─ own overrides
```

At load, the loader walks the chain depth-first:

1. Resolve `nordic-tight` → sees `extends: "nordic"` → resolve `nordic`
2. Resolve `nordic` → sees `extends: "@theme/default"` → resolve default
3. Default has `extends: null` → stop
4. Concatenate in order: default's CSS → nordic's CSS → nordic-tight's CSS

The deepest parent loads first. Child CSS is appended last. CSS cascade applies — **child always wins** on identical selectors.

### Circular references are detected

```yaml
# theme-a/theme.yaml
extends: "@theme/theme-b"

# theme-b/theme.yaml
extends: "@theme/theme-a"   # ← circular
```

The loader detects this and errors at startup. No infinite loops.

## The three override modes

```yaml
override_mode: "merge"        # default
override_mode: "override"
override_mode: "replace"
```

The mode is **per child theme**, not per file. It decides how *that* child's CSS combines with its parent's.

### `merge` — default

**Both** parent and child CSS load. Parent first, child second. CSS cascade resolves conflicts.

```
parent: color.css
parent: font.css
parent: element.css
─────
child:  color.css    ← cascades over parent's
child:  element.css  ← cascades over parent's
```

**Result**: child overrides variables where declared; parent's other CSS flows through unchanged.

**Use for**: typical custom themes. Re-brand, tweak some element sizing, override a few UI styles. See [Extending Default](./06_creating-themes/02_extending-default.md).

### `override` — skip parent files that child replaces

When child has a file with the **same name** as a parent file, the parent's version is **skipped**. Parent files not replaced by child still load normally.

```
parent: color.css       ← SKIPPED (child has color.css)
parent: font.css
parent: element.css
─────
child:  color.css        ← the only color.css that loads
```

**Result**: child's `color.css` is the only one. Parent's `font.css` and `element.css` still flow through.

**Use for**: you want a **clean replacement** of a specific file, without any of the parent's declarations leaking through. Example: a radically different colour palette where you don't want accidental cascades.

### `replace` — skip the parent entirely

Child stands alone. Parent is loaded but entirely discarded. Equivalent to `extends: null` with slightly different semantics (the parent is *referenced* but not *used*).

```
parent: color.css      ← SKIPPED
parent: font.css       ← SKIPPED
parent: element.css    ← SKIPPED
─────
child:  color.css
child:  font.css
child:  element.css
```

**Result**: only child CSS. Parent might as well not exist.

**Use for**: rare. Most "full replace" scenarios use `extends: null` + a standalone theme. `replace` is for cases where you *reference* a parent (for documentation / versioning purposes) but don't want its CSS.

## Decision matrix

| Goal | Approach |
|---|---|
| Re-brand, keep everything else | `extends: "@theme/default"`, `merge`, child overrides |
| Tweak a few layouts + colours | `extends: "@theme/default"`, `merge`, list files child overrides |
| Replace a file entirely, keep rest of parent | `extends: "@theme/default"`, `override`, child replaces file by name |
| Build a new theme, inherit contract but nothing else | `extends: "@theme/default"`, `override`, child overrides all files |
| Fully custom theme, no parent | `extends: null` (standalone), define all 46 vars |

## CSS cascade — the final tiebreaker

Once files are loaded, **CSS cascade** resolves conflicts. A later declaration wins over an earlier one for the same selector + specificity. The loader's file order + the child-after-parent discipline means:

```css
/* parent/color.css — loaded first */
:root { --color-brand-primary: #2563eb; }

/* child/color.css — loaded second (with merge) */
:root { --color-brand-primary: #7c3aed; }
```

Child wins. `--color-brand-primary` resolves to `#7c3aed`.

This is why `merge` mode works so cleanly — you don't need to redeclare every variable in the child, only the ones you're changing. CSS cascade handles the rest.

## Inheriting the required_variables contract

A child theme's `required_variables` field is **optional**:

- **Omitted** → inherits parent's `required_variables` recursively up the chain → ultimately inherits default's 46.
- **Declared** → child's list **replaces** parent's. Use sparingly, typically only when adding vars for custom layouts.

So a typical child theme looks like:

```yaml
name: "Child"
extends: "@theme/default"
files:
  - color.css
# no required_variables — inherit default's 46
```

And the validator still checks all 46 against the concatenated CSS.

## Common gotchas

### Forgetting `override_mode: "override"` when you wanted clean replacement

You override `color.css` intending to replace the palette. But with default `merge`, parent's `color.css` still loads first. If the parent declares more specific selectors (e.g. `html[data-theme="light"] :root { … }`), they may win over your `:root { … }` — producing weird cascade artifacts.

**Fix**: switch to `override_mode: "override"` so parent's `color.css` is skipped entirely.

### Cascade order for same-name files

With `merge`, both files load, but in **CSS source order** — parent first. So selectors of *equal specificity* resolve to child's values.

If you use **more-specific** selectors in parent, they beat less-specific child selectors:

```css
/* parent/color.css */
html[data-theme="light"] body { --color-brand: #2563eb; }

/* child/color.css */
:root { --color-brand: #7c3aed; }
```

`html[data-theme="light"] body` wins on specificity → parent's colour applies.

**Fix**: match the parent's selector specificity in your override, or use `override_mode: "override"` to skip the parent's file.

### `extends: "@theme/custom-theme"` not found

The loader scans `theme_paths` (from `site.yaml`) — not arbitrary directories. If your parent theme isn't in one of those paths, the loader errors.

**Fix**: ensure `site.yaml theme_paths` lists the directory containing the parent theme, and the parent theme folder matches the name.

## Chain-length limits

Practically, keep chains shallow — 2 or 3 levels max. The loader supports arbitrary depth, but debugging which theme wins which variable gets confusing past 3 levels.

## See also

- [Theme Structure](./03_theme-structure.md) — `extends`, `override_mode`, and `files:` in the manifest
- [Creating Themes / Extending Default](./06_creating-themes/02_extending-default.md) — typical merge-mode child
- [Creating Themes / Standalone Theme](./06_creating-themes/03_standalone-theme.md) — `extends: null` approach
- [Validation](./09_validation.md) — what errors on each mode
