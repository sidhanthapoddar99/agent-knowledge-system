---
title: Folder Settings
description: Configure folder display with settings.json
sidebar_position: 3
---

# Folder Settings

Every documentation folder (except the root doc folder) requires a `settings.json` file to configure how it appears in the sidebar.

## Basic Structure

```json
{
  "label": "Getting Started",
  "isCollapsible": true,
  "collapsed": false
}
```

## Configuration Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `label` | `string` | Yes | - | Display name shown in sidebar |
| `isCollapsible` | `boolean` | No | `true` | Whether the section can be collapsed |
| `collapsed` | `boolean` | No | `false` | Initial collapsed state |
| `allow_diagram_pages` | `boolean` | No | `true` | **Section root only.** Set `false` to stop `.mmd`/`.dot`/`.excalidraw`/`.drawio` files rendering as [first-class pages](../15_writing-content/06_diagram-pages.md) in this section |

## Field Details

### `label`

The display name for the folder in the sidebar navigation.

```json
{
  "label": "API Reference"
}
```

- Can include spaces and special characters
- Should be human-readable
- Does not affect URL (that's determined by folder name)

### `isCollapsible`

Controls whether users can collapse/expand the section.

```json
{
  "isCollapsible": true
}
```

- `true` - Section can be collapsed (shows expand/collapse arrow)
- `false` - Section is always expanded (no arrow shown)

### `collapsed`

Sets the initial state when the page loads.

```json
{
  "collapsed": false
}
```

- `true` - Section starts collapsed (children hidden)
- `false` - Section starts expanded (children visible)
- Only applies if `isCollapsible` is `true`

## Examples

### Always Expanded Section

For important sections that should always be visible:

```json
{
  "label": "Getting Started",
  "isCollapsible": false
}
```

### Collapsed by Default

For large sections or less frequently accessed content:

```json
{
  "label": "Advanced Topics",
  "isCollapsible": true,
  "collapsed": true
}
```

### Standard Collapsible Section

The most common configuration:

```json
{
  "label": "Guides",
  "isCollapsible": true,
  "collapsed": false
}
```

## Folder Structure Example

```
docs/
├── 01_getting-started/
│   ├── settings.json    ← { "label": "Getting Started", ... }
│   ├── 01_overview.md
│   └── 02_install.md
│
├── 02_guides/
│   ├── settings.json    ← { "label": "Guides", ... }
│   ├── 01_basics.md
│   └── 02_advanced.md
│
└── 03_api/
    ├── settings.json    ← { "label": "API Reference", ... }
    └── 01_endpoints.md
```

## Common Mistakes

### Missing settings.json

If a folder doesn't have `settings.json`, it may not appear correctly in the sidebar or may use the folder name as-is.

### Invalid JSON

Ensure valid JSON syntax:

```json
{
  "label": "My Section",
  "isCollapsible": true
}
```

Common errors:
- Missing quotes around strings
- Trailing commas after last property
- Using single quotes instead of double quotes
