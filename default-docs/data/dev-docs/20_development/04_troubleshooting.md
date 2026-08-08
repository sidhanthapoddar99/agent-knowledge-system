---
title: Layout Switcher Troubleshooting
description: Common issues and fixes for the dev toolbar layout switcher
---

# Layout Switcher Troubleshooting

This page documents common issues encountered while building the layout switcher and their solutions.

## Issue 1: Click Events Not Firing

**Symptom:** Clicking layout buttons in dev toolbar does nothing.

**Root Cause:** The `astro-dev-toolbar-window` custom element uses Shadow DOM internally. When setting `innerHTML` directly on it and then using `querySelectorAll()`, the elements weren't found because they were slotted into the shadow DOM.

**Fix:** Wrap content in a standard div element:

```typescript
// Before (broken)
windowEl.innerHTML = html;
windowEl.querySelectorAll('.option-btn').forEach(btn => { ... });

// After (working)
const contentWrapper = document.createElement('div');
contentWrapper.innerHTML = html;
windowEl.appendChild(contentWrapper);
contentWrapper.querySelectorAll('.option-btn').forEach(btn => { ... });
```

**File:** `src/dev-tools/layout-selector/index.ts`

## Issue 2: URL Changes But Layout Doesn't

**Symptom:** Clicking a layout button adds `?layout=compact` to the URL, page reloads, but layout remains unchanged.

**Root Cause:** In Astro's static mode, `Astro.url.searchParams` doesn't include query parameters from the actual HTTP request. The URL is constructed from site config and path, not the request.

**Debug Output:**
```
Astro.url.href: http://localhost:4321/docs/page  // No query params!
Astro.url.search:
layoutOverride: null
```

**Fix:** Switch to server mode so middleware can intercept requests:

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',
  // ...
});
```

## Issue 3: Hybrid Mode Removed in Astro 5

**Symptom:** Error on startup:
```
The output: "hybrid" option has been removed. Use output: "static" instead.
```

**Root Cause:** Astro 5.x removed the `hybrid` output mode.

**Fix:** Use `output: 'server'` instead. In Astro 5, static is the default and server is for on-demand rendering.

## Issue 4: getStaticPaths() Ignored Warning

**Symptom:** Warning in console:
```
[WARN] getStaticPaths() ignored in dynamic page /src/pages/[...slug].astro
```

**Root Cause:** In server mode, `getStaticPaths()` doesn't run - pages render on-demand without pre-computed paths/props.

**Fix:** Add dynamic props loading that computes page data from the URL when `Astro.props` is empty:

```typescript
let { pageType, doc, ... } = Astro.props;

// Server mode: props are empty, compute from URL
if (!pageType) {
  const slug = Astro.params.slug || '';
  // Match URL to config and load content...
}
```

## Issue 5: LayoutComponent Undefined

**Symptom:** Error:
```
Unable to render LayoutComponent because it is undefined!
```

**Root Cause:** In server mode without dynamic props loading, `configLayout` was undefined because `Astro.props` was empty.

**Fix:** Same as Issue 4 - ensure all required props are computed dynamically when in server mode.

## Debugging Checklist

### 1. Verify Server Mode

Check `astro.config.mjs`:
```javascript
output: 'server',
```

### 2. Check Middleware Logs

Terminal should show:
```
[middleware] URL: http://...?layout=compact | layout: compact
```

### 3. Verify Dev Toolbar Registration

Check that `devToolbarIntegration()` is in the integrations array:
```javascript
integrations: [
  mdx(),
  devToolbarIntegration(),
],
```

### 4. Check Layout Exists

Layouts must exist at:
```
src/layouts/docs/styles/{layout_name}/Layout.astro
src/layouts/blogs/styles/{layout_name}/IndexLayout.astro
src/layouts/blogs/styles/{layout_name}/PostLayout.astro
```

### 5. Browser Console

Check for JavaScript errors that might prevent the dev toolbar from functioning.

## Quick Reference: Files Involved

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Set `output: 'server'` |
| `src/middleware.ts` | Capture `?layout=` param |
| `src/env.d.ts` | TypeScript types for `Astro.locals` |
| `src/pages/[...slug].astro` | Read layout override, dynamic props |
| `src/dev-tools/integration.ts` | Register toolbar app |
| `src/dev-tools/layout-selector/index.ts` | UI and click handlers |
