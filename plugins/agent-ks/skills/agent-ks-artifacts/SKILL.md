---
name: agent-ks-artifacts
description: Build a self-contained HTML artifact (report page, dashboard, chart, data viz, design-system page, variation set of design options, brand guideline) as an `NN_`-prefixed `.html` page with an optional `.meta.json` sidecar in an agent-knowledge-system project. Trigger on build, design or generate. Not claude.ai Artifacts. Markdown docs: agent-ks-docs. Tracker structure: agent-ks-issues.
license: Complete terms in the agent-ks plugin LICENSE file.
---

# agent-ks-artifacts

An artifact is one `.html` file in this repo, served at `/artifacts/<path>` and embedded in docs pages. It is not a claude.ai Artifact; where a claude.ai habit conflicts, this skill wins. Provenance: [PROVENANCE.md](references/PROVENANCE.md).

## Triage

| Task | Read |
|---|---|
| Treatment, craft, type, copy, the plan | [design-fundamentals.md](references/design-fundamentals.md) |
| Location, sidecar, route, embed, theme mechanics, self-containment, the verify gate | [publishing.md](references/publishing.md) |
| Any plotted data | [dataviz.md](references/dataviz.md), then [dataviz-color.md](references/dataviz-color.md) |
| This framework's chart palette | [palette.md](references/palette.md) |
| A design system, a brand guideline, a variation set | [design-systems.md](references/design-systems.md) |

## Calibrate the treatment

Pick the treatment first: utilitarian (the default), editorial (a standalone showcase), or decision tooling (a variation set). Rules: [design-fundamentals.md](references/design-fundamentals.md#calibrate-the-treatment).

## Theme mode

Precedence: the user's words, then the host theme contract, then your own choices. Every artifact declares `artifact.theme` in its sidecar. The default is `self`; an unknown value reads as `self`.

| Mode | Subject | Rule |
|---|---|---|
| `site` | Data: a chart, a dashboard, a report | The route injects the site theme. Consume the tokens. Define no palette. |
| `self` | A design: a theme, a design system, a UI, a variation set | Carry a complete theme in the HTML, light and dark. |

A design artifact is `self` even when its theme equals the site theme.

## The inline variable contract

Consume these names. `agent-ks theme tokens --json` prints the values ([cli-toolkit.md](../agent-ks-cli/references/cli-toolkit.md)).

- **Colors** `--color-bg-primary`, `-secondary`, `-tertiary`; `--color-text-primary`, `-secondary`, `-muted`; `--color-border-default`, `-light`; `--color-brand-primary`, `-secondary`; `--color-success`, `-warning`, `-error`, `-info`
- **Issue status** `--status-open`, `-blocked`, `-in-progress`, `-input-needed`, `-review`, `-done`, `-dropped`, `-superseded`
- **Type** `--ui-text-micro`, `-body`, `-title`; `--content-body`, `-h1`…`-h6`, `-code`; `--display-sm`, `-md`. Not the primitive `--font-size-*` scale. `--display-*` is marketing only; `--display-lg` is a default-theme extra.
- **Font** `--font-family-base`, `-mono`; `--line-height-base`; `--font-weight-normal` (other weights are a default-theme extra)
- **Spacing, radius** `--spacing-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-2xl`, `-3xl`; `--border-radius-sm`, `-md`, `-lg`, `-full`
- **Shadow, motion** `--shadow-sm`, `-md`, `-lg`, `-xl`; `--transition-fast`, `-normal`
- **Layout** `--sidebar-width`, `--navbar-height`, `--outline-width`, `--max-width-primary`, `--max-width-secondary`

This list mirrors `astro-doc-code/src/styles/theme.yaml` → `required_variables`; change both in one edit, source and installed cache. In `self` mode reuse these names. Add an own name only for a role beyond the contract.

## Never

| Never | Do instead |
|---|---|
| Write a `<body>` fragment | The complete document: doctype, head, style, script, body |
| Load a script, stylesheet or font from a CDN | Inline it, or reference a repo asset |
| Invent a token name, or give one a hex fallback | A contract name; the only fallback is the `site` neutral layer |
| Ship one theme | Light and dark; one theme only as a deliberate `self` choice |
| Let the page body scroll sideways | Wide content in its own `overflow-x: auto` box |
| Judge colorblind safety by eye | Run `scripts/validate_palette.js` |
| Write series or category names with `innerHTML` | `textContent` or `createTextNode` |
| Edit the HTML and leave the sidecar | Read it first; update it in the same change |
| Paste untrusted third-party HTML | Write it yourself |
| Call an artifact done before the gate | Run the [verify gate](references/publishing.md#verify-before-you-publish) |
