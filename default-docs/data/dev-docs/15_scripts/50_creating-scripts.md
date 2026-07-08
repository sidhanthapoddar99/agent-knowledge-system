---
title: Creating Scripts
description: How to add new client-side scripts to the framework
sidebar_position: 50
---

# Creating New Scripts

Add new client-side functionality by creating a script in `src/scripts/` and including it in the base layout.

## Step 1: Create the Script

Create a new TypeScript file in `src/scripts/`:

```typescript
// src/scripts/my-feature.ts

function initMyFeature() {
  const elements = document.querySelectorAll<HTMLElement>('.my-target');
  if (elements.length === 0) return;

  for (const el of elements) {
    // Add interactivity
  }
}

// Module scripts are deferred — DOM is already parsed
initMyFeature();
```

## Step 2: Include in BaseLayout

Add a `<script>` tag in `src/layouts/BaseLayout.astro`:

```astro
<script src="../scripts/my-feature.ts"></script>
```

Astro handles bundling, minification, and deferred loading automatically.

## Guidelines

### Lazy Loading

If your script depends on a heavy library, lazy-load it only when needed:

```typescript
async function init() {
  const elements = document.querySelectorAll('.my-target');
  if (elements.length === 0) return; // Exit early — no extra JS loaded

  const { Library } = await import('heavy-library');
  // Use library only on pages that need it
}

init();
```

### Communicating With Other Scripts

Use custom DOM events to coordinate between scripts:

```typescript
// Dispatch when your work is done
document.dispatchEvent(new CustomEvent('my-feature:ready'));

// Listen for events from other scripts
document.addEventListener('diagrams:rendered', () => {
  // React to diagrams being ready
});
```

### Dark Mode Support

If your script generates visual content that depends on the theme, watch for theme changes:

```typescript
const observer = new MutationObserver((mutations) => {
  for (const m of mutations) {
    if (m.attributeName === 'data-theme') {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      // Re-render with correct theme
    }
  }
});
observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
```

### Avoiding Duplicate Bindings

Use a `WeakSet` to track elements you've already bound handlers to:

```typescript
const bound = new WeakSet();

function bind() {
  for (const el of document.querySelectorAll('.target')) {
    if (bound.has(el)) continue;
    bound.add(el);
    el.addEventListener('click', handleClick);
  }
}
```

This is important when your `bind()` function can be called multiple times (e.g., after dynamic content updates).
