---
title: Issues Styles
description: The issues layout — filter chips, state tabs, detail-page sidebars, metadata form
sidebar_position: 7
---

# Issues Styles

Styling for the issues layout — the index view's filter bar, state tabs, and result rows, plus the detail view's three-column layout, tabbed content, and editable metadata sidebar.

The default theme currently styles issues via a combination of `element.css` (variables) + layout-scoped CSS in `src/layouts/issues/default/` — a dedicated `issues.css` in the theme is **optional**. Themes can ship their own `issues.css` to restyle just this layout.

## Key classes

### Index

| Class | Element |
|---|---|
| `.issues-index` | Outer container |
| `.issues-index__header` | Tracker label + count |
| `.issues-presets` | Preset view strip |
| `.issues-preset-chip` | One preset button |
| `.issues-state-tabs` | Category filter tabs (Active / In Progress / Review / Not Started / Closed / All) |
| `.issues-state-tab` | Single tab |
| `.issues-state-tab--active` | Currently-selected tab |
| `.issues-filter-bar` | Search + dropdowns row |
| `.issues-filter-chip` | Filter value chip (multi-select) |
| `.issues-row` | Single issue row in results |
| `.issues-row__title` | Issue title |
| `.issues-row__badges` | Status + priority chips |

### Detail

| Class | Element |
|---|---|
| `.issue-detail` | Outer three-column grid |
| `.issue-sidebar` | Left sub-doc navigation sidebar |
| `.issue-main` | Centre content column |
| `.issue-tabs` | Overview / Comprehensive switch |
| `.issue-meta-sidebar` | Right metadata form sidebar |
| `.issue-meta-field` | Single field (label + input) |
| `.issue-subtask` | Subtask row in checklist |
| `.issue-subtask__state` | Clickable state icon (○/◐/●/✕) |

## Primary tokens consumed

- `--color-bg-secondary`, `--color-bg-tertiary` — panel + chip backgrounds
- `--color-border-default`, `--color-border-light` — dividers + input borders
- `--color-brand-primary` — active states
- Per-field colours from the tracker's vocabulary — `status` and `priority` chips render with their declared colours (e.g. `open: #888`, `review: #f0c674`, etc.)
- `--ui-text-body`, `--ui-text-micro` — row + chip text
- `--border-radius-sm`, `--border-radius-md`, `--border-radius-full` — chip + card + pill shapes
- `--spacing-*` — padding + gaps
- `--transition-fast` — hover transitions
- `--sidebar-width` — reused for the issue detail's left sidebar

## State tab styling

```css
.issues-state-tab {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--ui-text-body);
  font-weight: 500;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast);
}

.issues-state-tab--active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-brand-primary);
  font-weight: 600;
}

.issues-state-tab__count {
  color: var(--color-text-muted);
  font-size: var(--ui-text-micro);
  margin-left: var(--spacing-xs);
}
```

Tab count styled one tier smaller than tab label (`--ui-text-micro` vs `--ui-text-body`). Count in muted colour — clearly secondary information.

## Filter chips

```css
.issues-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: var(--ui-text-micro);
  border-radius: var(--border-radius-full);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.issues-filter-chip--selected {
  background: var(--color-brand-primary);
  color: var(--color-bg-primary);
}

.issues-filter-chip:hover:not(.issues-filter-chip--selected) {
  border-color: var(--color-border-default);
}
```

## Status + priority badges — vocabulary colours

The tracker's root `settings.json` declares a colour per value: `priority` colours live under `fields.priority.colors`, while the fixed lifecycle's colours come from the top-level `statusColors` map (a colours-only override of the seven built-in defaults — the status set itself is fixed in framework code). The layout reads those at render time and applies them inline-style or as CSS custom properties:

```astro
<!-- In the Astro component -->
<span class="issues-row__status-badge" style={`--badge-color: ${statusColor};`}>
  {status}
</span>
```

```css
.issues-row__status-badge {
  display: inline-block;
  padding: var(--spacing-0-5) var(--spacing-sm);
  background: var(--badge-color);
  color: var(--color-bg-primary);
  font-size: var(--ui-text-micro);
  font-weight: 600;
  border-radius: var(--border-radius-full);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
```

This is the one place a non-theme value enters the CSS: the vocabulary's declared colour. But it's passed via a CSS custom property, so the pattern stays clean.

## Three-column detail layout

```css
.issue-detail {
  display: grid;
  grid-template-columns: var(--sidebar-width) 1fr 280px;
  gap: var(--spacing-xl);
  max-width: var(--max-width-primary);
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.issue-sidebar,
.issue-meta-sidebar {
  position: sticky;
  top: calc(var(--navbar-height) + var(--spacing-lg));
  max-height: calc(100vh - var(--navbar-height) - var(--spacing-xl));
  overflow-y: auto;
}
```

Same sticky pattern as docs — offset by `--navbar-height`.

## Subtask state icons

```css
.issue-subtask__state {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.issue-subtask__state--open          { color: var(--color-text-muted); }
.issue-subtask__state--blocked       { color: var(--color-warning); }
.issue-subtask__state--in-progress   { color: var(--color-info); }
.issue-subtask__state--input-needed  { color: var(--color-warning); }
.issue-subtask__state--review        { color: var(--color-warning); }
.issue-subtask__state--done          { color: var(--color-success); }
.issue-subtask__state--dropped       { color: var(--color-error); }
```

Icon colours pull from status semantics — `review` is warning (yellow/gold), `done` is success (green), `dropped` is error (red). The seven statuses fall in four categories (Not Started · In Progress · Review · Closed); the tabs above filter by category.

## Customising issues styling

Create `issues.css` in your theme and add it to `files:`:

```yaml
# my-theme/theme.yaml
extends: "@theme/default"
files:
  - element.css
  - issues.css       # ← your custom issues styling
```

```css
/* my-theme/issues.css */
.issues-row {
  border-left: 4px solid transparent;
  padding-left: var(--spacing-md);
  transition: border-color var(--transition-fast);
}

.issues-row:hover {
  border-left-color: var(--color-brand-primary);
}
```

## See also

- [Issues Content Type](/user-guide/issues/overview) — the content + data side
- [Issues List View](/user-guide/issues/ui/list-view) — what the filter bar / state tabs look like
- [Issues Detail View](/user-guide/issues/ui/detail-view) — three-column layout details
- [Colors](../tokens/colors) — the `--color-*` tokens the badges consume
