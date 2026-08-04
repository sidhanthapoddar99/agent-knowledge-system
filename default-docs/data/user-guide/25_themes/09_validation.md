---
title: Validation
description: What the loader checks, what errors vs warnings mean, how to debug a broken theme
sidebar_position: 9
---

# Validation

The theme loader validates every theme at load time. Failures show up in the **error-logger** dev-toolbar app and, for critical errors, block the theme from loading.

This page covers what the loader checks, the difference between errors and warnings, and common failure modes with fixes.

## What gets checked

### 1. Manifest required fields

```yaml
# theme.yaml must have these
name: string         # ✅ required
version: string      # ✅ required
files: string[]      # ✅ required (at least one CSS file)
```

Missing any of the three → **error**. Theme doesn't load.

### 2. `override_mode` is a valid enum

```yaml
override_mode: merge     # ✅
override_mode: override  # ✅
override_mode: replace   # ✅
override_mode: blend     # ❌ error — not a known mode
```

### 3. Files listed in `files:` exist

```yaml
files:
  - color.css        # ✅ exists on disk
  - typo.css         # ❌ error — file not found
```

The loader reads each file; a missing file is an error that blocks loading.

### 4. `extends` resolves to a real theme

```yaml
extends: "@theme/default"     # ✅ resolves to built-in
extends: "@theme/nordic"      # ✅ if nordic exists in theme_paths
extends: "@theme/nonexistent" # ❌ error — no folder matches
extends: null                 # ✅ standalone
```

### 5. No circular inheritance

```yaml
# a/theme.yaml
extends: "@theme/b"

# b/theme.yaml
extends: "@theme/a"
```

Detected and rejected. **Error** — theme chain can't resolve.

### 6. Required variables are defined (or inheritable)

For each variable in `required_variables`:

- **Standalone theme (`extends: null`)** — variable must be declared in theme's CSS. Missing → **error**.
- **Child theme, `merge` mode** — missing in child is fine; inherits from parent via cascade. No warning.
- **Child theme, `override` mode** — if child replaces a file that defines the variable, child must redefine it. Missing → **warning** (cascade may still work, or may not, depending on which file's being replaced).
- **Child theme, `replace` mode** — parent is fully skipped, variable must be in child. Missing → **error**.

The validator checks for the pattern `\-\-varname\s*:` in concatenated CSS.

## Errors vs warnings

| Severity | Effect | Shown where |
|---|---|---|
| **Error** | Theme doesn't load; site falls back to default OR fails build | Error-logger dev-toolbar app (red) |
| **Warning** | Theme loads; something is suspicious | Error-logger dev-toolbar app (yellow) |

Errors block. Warnings don't. You can ship a theme with warnings — but they're usually flags for real bugs, and worth investigating.

## Common failure modes

### "Theme '<name>' not found"

```
Error: Theme "nordic" not found. Searched:
  - /path/to/project/themes
```

**Cause**: `site.yaml theme: "nordic"` but no folder at `themes/nordic/` (or wherever your `theme_paths` points).

**Fix**:
- Check spelling of theme name in `site.yaml`
- Check the folder exists under one of `theme_paths`
- Check `theme_paths` in `site.yaml` includes the directory

### "File 'foo.css' not found in theme"

```
Error: Theme "my-theme" lists file "color.css" but file does not exist
```

**Cause**: `theme.yaml files:` lists a file that's not on disk.

**Fix**: either create the file, or remove it from the `files:` array.

### "Required variable '--color-bg-primary' not defined"

```
Error: Theme "my-theme" missing required variable: --color-bg-primary
```

**Cause**: standalone theme (or `override` / `replace` mode) where the variable isn't declared.

**Fix**: declare the variable in one of your CSS files. For standalone themes, all 46 must be present. See [The Theme Contract](./02_the-theme-contract.md).

### "Circular extends chain"

```
Error: Circular theme inheritance: theme-a → theme-b → theme-a
```

**Cause**: two themes `extend:` each other.

**Fix**: change one of them to extend default (or `null`).

### "Invalid override_mode 'X'"

```
Error: override_mode 'blend' is not valid. Must be: merge | override | replace
```

**Fix**: use one of the three valid values.

### Warnings that look like errors

| Warning | What it means |
|---|---|
| `--foo declared under :root but never read by any layout` | You defined a variable nothing consumes. Not necessarily a bug — could be for your own custom layouts. |
| `Variable '--font-size-xs' used without fallback, and theme doesn't declare it` | A layout uses `var(--font-size-xs)` directly (no fallback). The current theme doesn't define `--font-size-xs`. If the layout is yours, switch to `var(--font-size-xs, var(--font-size-sm))` or consume a semantic token instead. |
| `Hardcoded colour found in layout CSS` | Grep-based heuristic. Any line matching `/#[0-9a-f]{3,8}/` in a layout CSS file. Fix: use a theme token. |

## Debugging workflow

### Step 1: Open the dev-toolbar error-logger

Bottom of the screen in dev mode. Shows every theme-related error and warning.

### Step 2: Read the error message

Messages are specific — they tell you which theme, which file, which variable or config key.

### Step 3: Fix and hot-reload

The loader watches theme files. Save a fix in your theme CSS → the site re-renders with the updated styles. No need to restart the dev server.

Hot reloading doesn't re-validate at every edit, but on next full reload (or save of `theme.yaml`), it re-runs validation.

### Step 4: Confirm in computed styles

Open DevTools → Elements → select an element → Computed tab. Scroll to custom properties. Every `--color-*`, `--font-*`, `--spacing-*` should have a resolved value, not "— (undefined)".

If a variable is undefined at runtime:

- Variable isn't declared in any loaded CSS
- Check `theme.yaml files:` includes the file that should declare it
- Check inheritance chain is correct

### Step 5: Check cascade order

If a variable is **defined** but not the value you expect, CSS cascade is the culprit:

- Open DevTools → Elements → select the element → Computed tab
- Scroll to the variable — click the arrow to see declaration sources
- The declaration with highest specificity / latest source order wins

Typically this is: parent theme's declaration winning over child's because the parent used a more-specific selector. Fix by matching selector specificity in child, or switching to `override_mode: "override"`.

## What validation doesn't check

- **Theme aesthetic decisions** — the validator checks the contract, not whether your colours look good.
- **Contrast ratios / a11y** — use a dedicated tool (axe, WebAIM).
- **FOUC / load order issues** — runtime, not static.
- **CSS syntax errors** — reported by the browser, not by the theme loader.
- **Missing `@font-face` assets** — fonts not loading is a runtime concern, not a theme-validation one.

## Escape hatch: suppress a warning

Not yet implemented — the framework doesn't currently support `// @theme-ignore` comments or `ignore_warnings:` in `theme.yaml`. If a warning is legitimate-but-unfixable, the workaround is to write the variable in a way that doesn't trigger the heuristic.

## See also

- [The Theme Contract](./02_the-theme-contract.md) — the 46-variable list validation checks against
- [Inheritance and Override](./07_inheritance-and-override.md) — how override modes affect validation
- [Rules for Layout Authors](./10_rules-for-layout-authors.md) — the layout-side contract (not checked by validator, but enforced by convention)
