---
title: Layout & Theme Switcher
description: Dev toolbar for switching layouts, themes, navbar, and footer during development
---

# Layout & Theme Switcher

The framework includes a custom dev toolbar app for rapid layout iteration. This is a **development-only** feature that allows you to preview different layouts, themes, navbars, and footers without modifying configuration files.

## Accessing the Selector

1. Start the dev server (`npm run start`)
2. Navigate to any page
3. Click the **grid icon** in the dev toolbar
4. Select a layout, theme, navbar, or footer style

## Layout Selector

When on `/docs/*` pages:
- Switch between `default`, `compact`, etc.
- Preview different sidebar configurations
- Compare layout variants side-by-side (open in multiple tabs)

When on `/blog/*` pages:
- Switch between `default`, `blog_style2`, etc.
- Preview different post card layouts
- Test index vs post layouts

## Navbar Selector

Switch between navbar styles globally:

| Style | Description |
|-------|-------------|
| **Style 1** | Full-featured navbar with dropdowns, mobile menu, theme toggle |
| **Minimal** | Simple flat navbar with basic links |

## Footer Selector

Switch between footer styles globally:

| Style | Description |
|-------|-------------|
| **Default** | Multi-column footer with social links |
| **Minimal** | Simple single-line footer |

## Theme Selector

### Color Themes

Switch between color themes defined in `default-docs/themes/`:
- Default theme
- Minimal theme
- Custom themes

### Display Mode

Toggle between display modes:

| Mode | Behavior |
|------|----------|
| **Light** | Force light mode |
| **Dark** | Force dark mode |
| **System** | Follow OS preference |

Display mode selection persists in localStorage across sessions.

## Reset Overrides

Click "Reset All Overrides" to clear all dev toolbar selections and return to config defaults.

## How It Works

The layout switcher uses **cookies** to persist selections across page reloads. This allows the server to read the override values during rendering.

### Cookie-Based Persistence

| Cookie | Purpose | Default |
|--------|---------|---------|
| `dev-layout` | Content layout override | Config value |
| `dev-color-theme` | Color theme override | Config value |
| `dev-navbar` | Navbar style override | `default` |
| `dev-footer` | Footer style override | `default` |

Cookies expire after 7 days and are only used in development mode.

### 1. Dev Toolbar Integration (`src/dev-tools/integration.ts`)

Registers the custom app with Astro's dev toolbar:

```typescript
export function devToolbarIntegration(): AstroIntegration {
  return {
    name: 'dev-tools-apps',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp }) => {
        addDevToolbarApp({
          id: 'layout-theme-selector',
          name: 'Layout & Theme',
          icon: `<svg>...</svg>`,
          entrypoint: './src/dev-tools/layout-selector/index.ts',
        });
      },
    },
  };
}
```

### 2. Layout Selector UI (`src/dev-tools/layout-selector/index.ts`)

The client-side code that:
- Renders layout/theme/navbar/footer options in the toolbar panel
- Detects current page type (docs, blog, custom)
- Sets cookies for selected overrides
- Triggers page reload with new settings

### 3. Page Handler (`src/pages/[...slug].astro`)

Reads cookies and applies overrides in dev mode:

```typescript
// Get navbar/footer layouts from config
let navbarLayoutRef = getNavbarLayout();
let footerLayoutRef = getFooterLayout();

// Dev mode: Allow override via cookies
if (isDev) {
  const navbarCookie = Astro.cookies.get('dev-navbar');
  if (navbarCookie?.value && navbarCookie.value !== '__reset__') {
    navbarLayoutRef = `@navbar/${navbarCookie.value}`;
  }

  const footerCookie = Astro.cookies.get('dev-footer');
  if (footerCookie?.value && footerCookie.value !== '__reset__') {
    footerLayoutRef = `@footer/${footerCookie.value}`;
  }
}

// Dynamically load navbar and footer components
const NavbarComponent = (await resolveNavbarFooter(navbarLayoutRef, 'navbar')()).default;
const FooterComponent = (await resolveNavbarFooter(footerLayoutRef, 'footer')()).default;
```

## Available Layouts

Layouts are auto-discovered via dual glob patterns (built-in + external):

```typescript
// Built-in layouts
const builtinDocsLayouts = import.meta.glob('/src/layouts/docs/styles/*/Layout.astro');
// External layouts (from LAYOUT_EXT_DIR)
const extDocsLayouts = import.meta.glob('@ext-layouts/docs/styles/*/Layout.astro');
// Merged: external overrides built-in with the same style name
const docsLayouts = mergeLayouts(builtinDocsLayouts, extDocsLayouts, ...);
```

The dev toolbar fetches available layouts from the `/api/dev/layouts` endpoint, which returns all discovered layouts with their source (`builtin` or `external`).

### Doc Layouts

| Layout | Description |
|--------|-------------|
| `default` | Full layout with sidebar, body, and outline |
| `compact` | Minimal layout without sidebar |

Location: `src/layouts/docs/styles/{style}/Layout.astro` or `<LAYOUT_EXT_DIR>/docs/styles/{style}/Layout.astro`

### Navbar Styles

| Style | Description |
|-------|-------------|
| `default` | Full-featured with dropdowns and mobile menu |
| `minimal` | Simple flat navbar |

Location: `src/layouts/navbar/{style}/index.astro` or `<LAYOUT_EXT_DIR>/navbar/{style}/index.astro`

### Footer Styles

| Style | Description |
|-------|-------------|
| `default` | Multi-column with social links |
| `minimal` | Single-line footer |

Location: `src/layouts/footer/{style}/index.astro` or `<LAYOUT_EXT_DIR>/footer/{style}/index.astro`

### External Layouts in the Toolbar

External layouts appear with an **ext** badge in the toolbar UI, making them easy to distinguish from built-in layouts. The toolbar dynamically discovers all available layouts via the `/api/dev/layouts` API endpoint.

### Adding New Styles

You can add layouts either as built-in (in `src/`) or external (via `LAYOUT_EXT_DIR`).

**Built-in Doc Layout:**
1. Create folder: `src/layouts/docs/styles/doc_style3/`
2. Add `Layout.astro` with your design
3. The layout appears automatically in the dev toolbar

**External Doc Layout:**
1. Set `LAYOUT_EXT_DIR` in `.env` (e.g., `LAYOUT_EXT_DIR=./default-docs/layouts`)
2. Create folder: `<LAYOUT_EXT_DIR>/docs/styles/my-layout/`
3. Add `Layout.astro` (use `@layouts/` aliases for imports, not relative paths)
4. Restart dev server — the layout appears in the toolbar with an "ext" badge

**Navbar:**
1. Create folder: `src/layouts/navbar/my-style/` (or `<LAYOUT_EXT_DIR>/navbar/my-style/`)
2. Add `index.astro` with your design
3. Update `navbar.yaml`: `layout: "@navbar/my-style"`

**Footer:**
1. Create folder: `src/layouts/footer/my-style/` (or `<LAYOUT_EXT_DIR>/footer/my-style/`)
2. Add `index.astro` with your design
3. Update `footer.yaml`: `layout: "@footer/my-style"`
