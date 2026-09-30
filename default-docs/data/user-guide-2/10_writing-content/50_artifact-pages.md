---
title: "Artifact pages"
description: "Put a self-contained HTML file in a docs section and it becomes a page: a report, a dashboard or a design, shown in a frame and openable full page."
---

# Artifact pages

An artifact is a self-contained HTML page: a report, a dashboard, an interactive chart, a design-system sheet or a set of design options. Give the `.html` file an `NN_` prefix in a docs section, and it becomes a page with a sidebar entry and a URL. The whole HTML document is the content. You need no markdown around it.

Artifacts are often built by an AI agent. The `agentks-artifacts` skill teaches an agent how to build one that reads well; see [getting started](../05_getting-started/01_overview.md) for the AI plugins.

## Make one

```
data/guide/20_reports/
├── settings.json
├── 05_how-we-measure.md          → /guide/reports/how-we-measure
├── 10_q3-dashboard.html          → /guide/reports/q3-dashboard
└── 10_q3-dashboard.meta.json     its sidecar, optional
```

The naming rules are the same as for markdown and diagram pages. Link to an artifact page by its file, `[the Q3 dashboard](./10_q3-dashboard.html)`, and agentks writes its URL.

## What the reader sees

The artifact appears in the content area, in a frame that fills the column. The sidebar stays, and there is no outline. From the frame, the reader can:

- **expand** it to fill the window without leaving the page, and close it again;
- **open it full page** at its own address, where the artifact is the whole browser tab.

The full-page address is `/artifacts/` followed by the file's path in the project, with its prefixes and extension kept. For the file above that is `/artifacts/data/guide/20_reports/10_q3-dashboard.html`. It is a real address you can bookmark or send.

## Write it self-contained

An artifact is one file. Put its CSS and scripts inside it, and embed its images as `data:` URLs. Do not rely on other files beside it.

To use a shared icon, frame or widget, take it from a library instead of drawing it again. An artifact loads a library element from `/_lib/<alias>/<element>`, for example `<img src="/_lib/icons/server">`. The [libraries section](../40_libraries/01_overview.md) explains libraries and how to find an element.

## Trust

Your own artifacts run as part of your site, with no sandbox, like any page you write. That is what lets an artifact follow the site theme. It also means an artifact's scripts can do anything your site can. So never paste HTML from a source you do not trust into an artifact.

Library HTML is different: it comes from someone else, so agentks runs it in a sandbox.

## The sidecar

A sidecar gives the artifact a title and display options, and it tells a reader or an agent what the artifact is without opening the HTML. It sits beside the artifact with the same name and `.meta.json` (or `.meta.jsonc`, which allows comments and wins when both exist).

```jsonc
// 10_q3-dashboard.meta.json
{
  "title": "Q3 dashboard",
  "description": "Sign-ups, activation and churn for the third quarter.",
  "embed_height": "full",
  "artifact": {
    "theme": "site",
    "type": "dashboard",
    "purpose": "Show whether the Q3 onboarding changes moved activation.",
    "data": "Weekly counts from the product database, inlined."
  }
}
```

| Field | Meaning |
|---|---|
| `title` | The page title. Without it, the title comes from the file name |
| `description` | A one-line summary |
| `sidebar_label` | Shorter text for the sidebar |
| `sidebar_position` | Accepted, but does not change the order. The sidebar orders pages by prefix |
| `draft` | `true` keeps the page out of a published site. See [drafts](./35_drafts.md) |
| `embed_height` | The frame's height on the page: `"full"` (the default) fills the column, a CSS length such as `"640px"` fixes it, and a ratio such as `"16/9"` follows the width |
| `artifact` | What the artifact is. agentks reads only `artifact.theme` from it |

Every field is optional. The `artifact` block holds whatever describes the artifact: common keys are `purpose`, `type`, `theme`, `palette` and `data`. agentks keeps it as written.

## Theme: the site's, or its own

`artifact.theme` decides whose styling the artifact uses.

| Value | What happens | Use it for |
|---|---|---|
| `"self"`, the default | The file is served exactly as written. The artifact carries its own complete styling, light and dark | Anything whose look is the point: a design-system sheet, a brand study, UI options |
| `"site"` | The site theme's CSS applies inside the artifact. The artifact uses the theme's variables and defines no colours of its own | Data: charts, dashboards, metric reports |

A missing or unknown value means `"self"`. An unknown value is also reported as a warning.

**In site mode**, read the theme's variables, with a plain fallback so the file still reads when opened outside the site:

```css
body {
  background: var(--color-bg-primary, #fff);
  color: var(--color-text-primary, #111);
}
```

`agentks theme tokens` prints every variable with its light and dark value. `agentks theme css` prints the whole compiled stylesheet.

**In self mode**, the artifact supports light and dark itself. Style for the reader's system setting, and let the site's explicit choice win, which it passes as a `data-theme` attribute:

```css
:root { /* light colours */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark colours */ }
}
:root[data-theme="dark"] { /* dark colours */ }
```

## Artifact or asset?

- **An artifact page** is an HTML document that is the content. Give it a prefix and it becomes a page.
- **An HTML file under `assets/`** is just a file, never a page. So is an `.html` file with no prefix, which agentks skips with a warning.

## Artifacts in the issue tracker

An issue's `notes/` and `brainstorm/` folders can hold artifacts too, beside the notes that discuss them. The [issue tracker](../30_issue-tracker/01_overview.md) explains how they show there.
