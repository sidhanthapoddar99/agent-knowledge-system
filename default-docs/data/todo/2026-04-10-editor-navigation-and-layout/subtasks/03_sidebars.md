---
title: "Primary & secondary sidebars (VSCode-style)"
status: open
---

## Model

Mirrors VSCode:

- **Primary sidebar** = the narrow activity bar of icons (Explorer, Search, Source Control, …). Clicking an icon selects *which* panel the secondary sidebar should display.
- **Secondary sidebar** = the wider panel that renders the *content* of whatever the primary sidebar selected. State (scroll position, expanded nodes, etc.) persists per panel.

Selection is one-to-one: one primary icon active at a time → one secondary panel visible.

## Primary sidebar (activity icons)

- [ ] Icon strip on the left edge
- [ ] Active-icon highlight
- [ ] Icon registry — each entry declares its label, icon, and the secondary panel to mount

## Secondary sidebar (selected panel content)

- [ ] Panel container that swaps on primary selection
- [ ] Per-panel state persistence
- [ ] Resize handle (shared with editor pane)
- [ ] Collapse / pin toggle

## Built-in panels

- [ ] File explorer
- [ ] Settings
- [ ] Sync status & live users
- [ ] RAM / CPU usage
- [ ] AI assistant
