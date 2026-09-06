---
name: agent-ks-artifacts
description: Build a self-contained HTML artifact in an agent-knowledge-system project — a report page, a dashboard, a chart or data visualization, a design-system or brand-guideline page, or a variation set of design options to choose between. It ships as one `.html` page in a docs section, or in an issue's `notes/` or `brainstorm/`. Trigger whenever the user asks to build, design, generate, visualize, mock up or prototype a page, dashboard, chart, UI or set of options, even when they never say artifact. Not claude.ai Artifacts. Markdown pages and diagram pages belong to agent-ks-docs. Tracker structure belongs to agent-ks-issues.
license: Complete terms in the agent-ks plugin LICENSE file.
---

# agent-ks-artifacts

An artifact is one `.html` file in this repo, served at `/artifacts/<path>` and embedded in docs pages. It is not a claude.ai Artifact. Where a claude.ai habit conflicts with this skill, this skill wins.

## Triage

Work in this order: pick the home, plan, build, run the gate.

| Task | Read |
|---|---|
| Location, sidecar, route, embed, theme mechanics, self-containment, the verify gate | [publishing.md](references/publishing.md) |
| Treatment, craft, type, copy, the plan | [design-fundamentals.md](references/design-fundamentals.md) |
| Any plotted data | [dataviz.md](references/dataviz.md), then [dataviz-color.md](references/dataviz-color.md) |
| This framework's chart palette | [palette.md](references/palette.md) |
| A design system, a brand guideline, a variation set | [design-systems.md](references/design-systems.md) |
| An upstream sync, or a licensing question | [PROVENANCE.md](references/PROVENANCE.md) |

## Calibrate the treatment

Pick the treatment first: utilitarian (the default), editorial (a standalone showcase), or decision tooling (a variation set). The rules are in [design-fundamentals.md](references/design-fundamentals.md#calibrate-the-treatment).

## Theme mode

Sources win in this order: the user's words, then the host theme contract, then your own choices. Every artifact declares `artifact.theme` in its sidecar. The default is `self`. An unknown value reads as `self`.

| Mode | Subject | Rule |
|---|---|---|
| `site` | Data: a chart, a dashboard, a report | The route injects the site theme. Consume the tokens. Define no palette. |
| `self` | A design: a theme, a design system, a UI, a variation set | Carry a complete theme in the HTML, light and dark. |

A design artifact is `self` even when its theme equals the site theme.

## The inline variable contract

Use these names. `agent-ks theme tokens --json` prints the values ([cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md)).

- **Colors** `--color-bg-primary`, `-secondary`, `-tertiary`; `--color-text-primary`, `-secondary`, `-muted`; `--color-border-default`, `-light`; `--color-brand-primary`, `-secondary`; `--color-success`, `-warning`, `-error`, `-info`
- **Issue status** `--status-open`, `-blocked`, `-in-progress`, `-input-needed`, `-review`, `-done`, `-dropped`, `-superseded`
- **Type** `--ui-text-micro`, `-body`, `-title`; `--content-body`, `-h1`…`-h6`, `-code`; `--display-sm`, `-md`. Not the primitive `--font-size-*` scale. `--display-*` is for marketing pages only. `--display-lg` is a default-theme extra.
- **Font** `--font-family-base`, `-mono`; `--line-height-base`; `--font-weight-normal` (other weights are a default-theme extra)
- **Spacing, radius** `--spacing-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-2xl`, `-3xl`; `--border-radius-sm`, `-md`, `-lg`, `-full`
- **Shadow, motion** `--shadow-sm`, `-md`, `-lg`, `-xl`; `--transition-fast`, `-normal`
- **Layout** `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-primary`, `--max-width-secondary`

This list mirrors the `required_variables` list in `@root/agent-ks-engine/src/styles/theme.yaml`, minus the primitive `--font-size-*` scale, which no layout or artifact uses. In `self` mode reuse these names. Add a name of your own only for a role the contract does not cover.

## Never

| Never | Do instead |
|---|---|
| Write a `<body>` fragment | The complete document: doctype, head, style, script, body |
| Load a script, stylesheet or font from a CDN | Inline it, or use a [site URL form](references/publishing.md#the-url-forms) |
| Invent a token name, or give one a hex fallback | A contract name. The only fallback is the `site` neutral layer |
| Ship one theme | Light and dark. Ship one theme only as a deliberate `self` choice |
| Let the page body scroll sideways | Wide content in its own `overflow-x: auto` box |
| Judge colorblind safety by eye | Run [validate_palette.js](scripts/validate_palette.js) |
| Write series or category names with `innerHTML` | `textContent` or `createTextNode` |
| Edit the HTML and leave the sidecar | Read the sidecar first. Update it in the same change |
| Paste HTML from a source you do not trust | Write it yourself |
| Call an artifact done before the gate | Run the [verify gate](references/publishing.md#verify-before-you-publish) |

An artifact runs with no sandbox on the site origin. So anything it loads, or writes as markup, runs with the site's own permissions. Apply that same reason to any new case.
