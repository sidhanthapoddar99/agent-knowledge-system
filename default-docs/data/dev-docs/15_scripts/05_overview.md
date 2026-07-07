---
title: Scripts Overview
description: Client-side scripts that enhance rendered content in the browser
sidebar_position: 5
---

# Client-Side Scripts

**Folder:** `src/scripts/`

Scripts run in the browser after the page loads. They enhance the rendered HTML with interactive features like diagram rendering, image lightboxes, and code block copy buttons.

## How Scripts Fit In

```
Build Time (Server)                          Browser (Client)
─────────────────────                        ──────────────────────
Markdown
  │
  ▼
Preprocessors → Renderer → Postprocessors
  │
  ▼
Static HTML served to browser ──────────────▶ Scripts enhance the DOM
                                               • diagrams.ts  → renders SVGs
                                               • artifacts.ts → embeds .html artifacts
                                               • lightbox.ts  → pan/zoom viewer
                                               • code-labels.ts → copy buttons
```

Scripts are **not** part of the parser pipeline. The pipeline produces static HTML at build time; scripts run client-side to add interactivity.

## Available Scripts

| Script | Purpose | Loads Libraries |
|--------|---------|-----------------|
| `diagrams.ts` | Renders mermaid/graphviz code blocks into SVG diagrams | Yes (lazy) |
| `artifacts.ts` | Embeds first-class `.html` artifact pages as a same-origin iframe, propagates the theme, adds open-full-page + expand | No |
| `lightbox.ts` | Full-screen pan/zoom viewer for images and rendered diagrams, with a copy/download dropdown and an inline hover toolbar (pan/zoom engine in `panzoom.ts`, actions + menu in `diagram-actions.ts`) | No |
| `code-labels.ts` | Language label + copy-to-clipboard on code blocks | No |
| `tooltip.ts` | Site-wide cursor-anchored tooltip for any `data-tip` element — shows only when the text is actually cropped, unless `data-tip-always` opts in | No |

## How Scripts Are Loaded

All scripts are included in `BaseLayout.astro`:

```astro
<script src="../scripts/diagrams.ts"></script>
<script src="../scripts/artifacts.ts"></script>
<script src="../scripts/lightbox.ts"></script>
<script src="../scripts/code-labels.ts"></script>
<script src="../scripts/tooltip.ts"></script>
```

Astro processes `<script>` tags as modules — they are bundled, deferred, and tree-shaken. The DOM is already parsed when they execute.

## Script Communication

Scripts can communicate via custom DOM events:

| Event | Dispatched By | Listened By | Purpose |
|-------|---------------|-------------|---------|
| `diagrams:rendered` | `diagrams.ts` | `lightbox.ts` | Lightbox binds click handlers after diagrams finish rendering |
| `diagrams:render` | Editor preview | `diagrams.ts` | Triggers re-rendering when content updates in the live editor |
