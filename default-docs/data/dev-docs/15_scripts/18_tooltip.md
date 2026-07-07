---
title: Tooltip
description: The site-wide truncation-aware tooltip — one singleton, cursor-anchored, opt-in via data-tip
sidebar_position: 18
---

# Tooltip

**File:** `src/scripts/tooltip.ts` · **CSS:** `.ui-tooltip` in `src/styles/element.css`

One tooltip element for the whole site. Any element carrying a `data-tip` attribute becomes a trigger; the script decides *whether* the tip actually shows. Loaded from `BaseLayout.astro`, so it works in every layout (docs, blogs, issues, custom) and both side panels.

## The display rule

The rule lives in the script, not in the markup:

| Trigger | Shows when |
|---|---|
| `data-tip="…"` | Only when the element's text is **actually cropped** — the element or any descendant overflows horizontally (`scrollWidth > clientWidth + 1`) |
| `data-tip="…" data-tip-always` | Always — for icons, symbols, and dots whose meaning isn't visible as text |

This is the framework's [tooltips-only-when-needed standard](/dev-docs/architecture/layout-internals/ux-standards): fully visible text never gets a tooltip, because it would repeat what's already on screen. Non-text triggers (a status icon, an agent-log kind symbol, a file-type glyph) opt in with `data-tip-always` since they always need naming.

## Mechanism

- **Singleton**: one `.ui-tooltip` div appended to `<body>` at load. No per-trigger elements, no cleanup problem, and — because it's `position: fixed` — it can never be clipped by a scroll container or lose a stacking-context fight.
- **Cursor-anchored**: the tip's bottom-left corner sits at the pointer's top-right (10px offset), follows the pointer on `mousemove`, clamps to the viewport, and flips below the cursor when there's no room above.
- **Delegated events**: a single `mouseover` listener resolves `closest('[data-tip]')`, so triggers created at runtime (client-rendered rows, swapped icons) work with no re-binding.
- **60ms show delay** filters drive-by hovers; any scroll hides the tip (capture-phase listener), since scrolling under a shown tip would leave it hovering over the wrong row.
- **Plain text only**: content is set via `textContent` — a `data-tip` value is never interpreted as HTML.

## Using it in a layout

```astro
<!-- Text row that may ellipsize — tooltip appears only when it does -->
<a href={href} class="row" data-tip={title}>
  <span class="row__label">{title}</span>
</a>

<!-- Icon whose meaning isn't visible as text — always shows -->
<span data-tip="In Progress" data-tip-always aria-label="In Progress">
  <Fragment set:html={icon} />
</span>
```

Two things to get right:

1. **The label element must actually ellipsize** (`overflow: hidden; text-overflow: ellipsis; white-space: nowrap`) — the crop check reads overflow, so a wrapping label never triggers.
2. **Keep `data-tip` in step with dynamic state.** The tip text is read at hover time from the attribute — if client code swaps an icon (e.g. subtask status cycling), it must update `data-tip` too (see `setIconTip()` in the issues layout's `subtask-state.ts`).

Nested triggers compose: an icon with `data-tip-always` inside a row with `data-tip` wins when hovered directly, because `closest()` resolves the innermost trigger.
