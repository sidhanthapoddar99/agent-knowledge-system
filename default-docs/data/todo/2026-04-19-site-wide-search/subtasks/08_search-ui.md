---
title: "Search UI — navbar modal, inline results, keyboard-first"
status: open
---

One UI, used everywhere. Scope-aware (see subtask 07), keyboard-first, respects the theme contract.

## Surface

### Navbar entry point
- Compact input in the navbar on desktop, collapses to an icon on narrow viewports.
- `Ctrl+K` / `⌘+K` opens a **full-screen modal** (keyboard-first power users).
- `/` from any non-input context focuses the inline navbar input.
- `Esc` closes.

### Modal layout
- Top: query input with scope dropdown on the left, advanced options (regex toggle, fuzzy slider) on the right.
- Middle: results list — infinite scroll, grouped by `type` when scope is global.
- Bottom: keyboard-shortcut footer (↑/↓ navigate, ↵ open, `Ctrl+↵` open in new tab).

### Inline results
- On the issues page: results appear in the existing filter chip area, replacing the list.
- On docs/blog: optional "open in modal" link for global cross-section search.

## Result rendering

- Title (boosted hit highlighted).
- Breadcrumb: `User Guide › Configuration › site.yaml`.
- Excerpt with match highlighted using Orama's match-positions — real highlighted snippet, not just the first 200 chars.
- Type badge (`docs` / `blog` / `issue`) + for issues, status/priority chips.
- `mtime` relative label ("updated 3d ago") when sorting by recency.

## Accessibility

- Modal is a real `<dialog>` with focus trap.
- Results list uses `role="listbox"`, items `role="option"`, `aria-activedescendant` for keyboard nav.
- Screen-reader announces "N results for 'foo'" when the list updates.

## Theme contract

- Consume declared tokens only: `--ui-text-body`, `--color-bg-primary/secondary`, `--color-border-default`, `--color-brand-primary` for highlight, `--shadow-lg` on the modal.
- No invented variables, no hardcoded colors (per CLAUDE.md theming rules).

## Out of scope
- Search analytics dashboard (future).
- Saved searches / alerts (future).
