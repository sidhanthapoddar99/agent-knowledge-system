---
title: Lightbox
description: Full-screen pan/zoom viewer for images and diagrams
sidebar_position: 15
---

# Lightbox Script

**Files:** `src/scripts/lightbox.ts` (viewer + bindings), `src/scripts/panzoom.ts` (pan/zoom engine), `src/scripts/diagram-actions.ts` (copy/download actions + dropdown menu)

Turns images and rendered diagrams in markdown content into an interactive full-screen viewer. Clicking an image or a diagram opens an overlay with pan/zoom, a toolbar, and (for diagrams) copy/download actions. Inline diagrams additionally get a hover toolbar and selectable text.

## What It Targets

| Element | Selector | Trigger |
|---------|----------|---------|
| Images | `.markdown-content img` | Bound immediately on load |
| Diagrams | `.markdown-content .diagram-rendered` | Bound after `diagrams:rendered` event |

## Viewer Interactions

| Interaction | Behavior |
|-------------|----------|
| Mouse wheel | Zoom toward the cursor |
| Drag | Pan (pointer capture, 4px threshold so clicks still work) |
| Pinch (touch) | Zoom toward the gesture midpoint |
| Double-click | Zoom in 2.5×, or back to fit if already zoomed |
| `+` / `-` / `0` | Zoom in / out / reset to fit |
| `Escape`, background click, × button | Close |
| Click an SVG text label | Copies the label text to the clipboard (toast confirms) |
| Drag across SVG text | Native text selection (panning is suppressed on text targets) |

## Toolbar

Zoom out · zoom % (click resets) · zoom in · fit — plus a **copy split button** (default click = *Copy as PNG*, light) whose ▾ caret opens the copy/download dropdown, and ↗ *open original* for images and Excalidraw scenes.

## Copy/Download Dropdown (`diagram-actions.ts`)

One menu, shared by the viewer toolbar and the inline hover toolbar. It is a single fixed-position element appended to `<body>` (inline diagram containers scroll/clip, so it can't live inside them); it closes on outside click, Escape (without closing the viewer), or after an action.

| Item | Shown for | Behavior |
|------|-----------|----------|
| Copy as PNG | everything | rasterizes to PNG on a canvas (2×, white background for diagrams, 4096px cap) and writes it to the clipboard |
| Copy as PNG (dark) | diagrams | same, re-drawn through the site's dark-mode invert filter |
| Copy source | diagrams with source | Mermaid/Graphviz from `data-diagram-source` (set by `diagrams.ts`); Excalidraw fetches the scene JSON from `data-src` |
| Download PNG / PNG (dark) | everything / diagrams | same rasterization, saved as `diagram.png` / `diagram-dark.png` |
| Download SVG | diagrams | serializes the displayed SVG |
| Download source | diagrams with source | saves as `diagram.mmd` / `diagram.dot` / `diagram.excalidraw` by type |

## Inline Hover Toolbar

Each rendered diagram gets a `.diagram-tools` overlay (visible on hover): **expand** (opens the viewer) and the same **copy split button** (⎘ copies as PNG; ▾ opens the dropdown). Diagram SVG text is selectable inline too — clicks on text, links, the caption, or the toolbar do not open the viewer, and neither does a click while a selection is active.

## Overlay Structure

```html
<div class="lightbox-overlay lightbox-open">
  <div class="lightbox-stage">          <!-- pan/zoom viewport -->
    <div class="lightbox-canvas">       <!-- transformed via translate+scale -->
      <!-- <img> for images, cloned <svg> for diagrams -->
    </div>
  </div>
  <div class="lightbox-toolbar">…</div>
</div>
```

## Pan/Zoom Engine (`panzoom.ts`)

A dependency-free engine that applies `translate(tx, ty) scale(s)` to the canvas with `transform-origin: 0 0`. `createPanZoom({ viewport, content, shouldStartPan, onChange })` returns `{ zoomIn, zoomOut, fit, reset, getScale, wasDragged, destroy }`. `shouldStartPan` lets the viewer exclude text targets so selection keeps working; `wasDragged()` lets click handlers ignore the click that ends a pan.

## How It Works

1. Finds all images in `.markdown-content` and adds click handlers
2. Listens for the `diagrams:rendered` event to bind diagram click handlers and hover toolbars (since diagrams render asynchronously)
3. On open, clones the SVG (or creates an `<img>`), reads its natural size from the `viewBox`, and fits it to the viewport
4. Uses a `WeakSet` to track already-bound elements and avoid duplicate handlers
