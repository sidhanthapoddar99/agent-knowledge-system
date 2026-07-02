---
title: "Plugin architecture"
status: open
---

## Goal

Plugins can extend functionality without touching core.

## Hooks

- [ ] `onBuild` — during build process
- [ ] `onContent` — content transformation
- [ ] `onRender` — component rendering
- [ ] `onConfig` — configuration modification

## Tasks

- [ ] Plugin API with TypeScript types
- [ ] Plugin loader and registration system
- [ ] Plugin configuration in `site.yaml`
- [ ] Plugin documentation and development guide

## Sample plugins

- [ ] Search plugin (Pagefind / Fuse.js)
- [ ] Analytics plugin (Google Analytics, Plausible)
- [ ] Comments plugin (Giscus, Disqus)
- [ ] RSS feed plugin
