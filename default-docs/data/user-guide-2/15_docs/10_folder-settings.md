---
title: "Folder settings"
description: "Every field of a docs folder's settings.json: its sidebar label, whether it folds, and the section-root switch for diagram pages."
---

# Folder settings

Every folder in a docs section below the section root has a `settings.json`. It gives the folder its name in the sidebar and says whether the reader can fold it away. The folder's order comes from its `NN_` prefix, not from this file.

## A settings file

```json
{
  "label": "Getting Started",
  "isCollapsible": true,
  "collapsed": false
}
```

| Field | Type | Default | Meaning |
|---|---|---|---|
| `label` | text | none | The folder's name in the sidebar. Required in every folder below the section root |
| `isCollapsible` | `true` or `false` | `true` | Whether the reader can fold the folder. `false` keeps it always open, with no toggle. The shorter name `collapsible` is read too |
| `collapsed` | `true` or `false` | `false` | Whether the folder starts folded. It only matters when `isCollapsible` is `true` |
| `allow_diagram_pages` | `true` or `false` | `true` | Section root only. `false` stops diagram files in the section from being pages |

The file may also be `settings.jsonc`, which allows `//` comments and trailing commas. When a folder has both, agentks reads `settings.jsonc`.

## A good default

Keep the map of a section in view, and let the reader open the detail they need:

| Folder depth | `isCollapsible` | `collapsed` | Effect |
|---|---|---|---|
| The first level, the main headings | `false` | `false` | Always open, so the reader sees the whole section at a glance |
| The second level and deeper | `true` | `true` | Folded at first. The reader opens what they need |

For a short section, or a group every reader needs, keep it open. This is a starting point, not a rule.

## Examples

A main heading that is always open:

```json
{ "label": "Getting Started", "isCollapsible": false }
```

A large group that starts folded:

```json
{ "label": "Command Reference", "isCollapsible": true, "collapsed": true }
```

A section root that keeps diagrams as figures only:

```json
{ "allow_diagram_pages": false }
```

At the section root, `label` is optional. `allow_diagram_pages` only works there; in any other folder agentks warns that it does nothing.

## When a settings file is wrong

agentks reports each problem with the file, and the sidebar still draws with the default values.

| Problem | What agentks reports |
|---|---|
| A folder below the root has no settings file | An error: missing folder settings |
| The file has no `label`, or an empty one | An error: every docs folder names itself in the sidebar |
| The file is not valid JSON | An error with the line of the mistake |
| A field has the wrong type, such as `"collapsed": "yes"` | An error, and the field's default is used |

`agentks check section data/guide` finds all of them at once.

The label is only a display name. Changing it changes nothing else. The folder's URL comes from its name on disk, so to change the URL, rename the folder with `agentks move`.
