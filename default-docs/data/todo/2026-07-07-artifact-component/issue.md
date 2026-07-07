## Goal

**Artifacts** — self-contained HTML pages (reports, dashboards, interactive
visualizations, design-system showcases) — become a first-class content type of
the framework, the same way `.mmd` / `.dot` / `.excalidraw` diagram files did in
[[2026-04-10-editor-diagrams]].

The experience we want: an `NN_`-prefixed `.html` artifact in a docs section
appears in the sidebar like any page. Clicking it **replaces the central content
area with the embedded artifact** (iframe) — the sidebar and outline/TOC chrome
stay in place. The embed carries an **"open full page"** affordance that
navigates to a reserved route, `/artifacts/<path-to-artifact>`, where the
artifact IS the page — full viewport, own URL, bookmarkable and shareable. A
lightweight in-place expand may exist as a secondary affordance, but the
dedicated URL is the primitive: the iframe needs a `src` anyway, so the route is
the foundation the embed is built on, not an alternative to it.

Like first-class diagrams, an artifact takes an optional **same-name `.json`
metadata sidecar** carrying what frontmatter would carry — title, description,
and *explicit declared values* (palette, purpose, data points) so an AI agent
can understand the artifact without parsing the whole HTML.

## Why

Artifacts let us explain data and design far better than markdown alone —
in documentation pages, and equally inside the tracker (brainstorm entries,
notes, subtask context). A published docs section full of artifacts +
commentary can carry an entire **design system / brand guideline** for a
project, authored and maintained by AI agents.

## The authoring skill — converged from four captured sources

The second half of this issue is a new in-repo skill that teaches an agent to
*build* artifacts well. We captured four design skills into `tmp_skills/` at the
repo root (provenance detail in `notes/`):

1. **artifact-design** — Claude Code built-in: treatment calibration, typography,
   dual-theme tokens, anti-generic-design rules.
2. **dataviz** — Claude Code built-in: chart-form procedure, palette validation
   scripts, mark specs, anti-patterns catalog.
3. **design-sync** — Claude Code built-in: what goes into a design system
   (tokens, components, conventions headers, brand consistency).
4. **frontend-design** — official Anthropic plugin: distinctive UI design.

The new skill **writes this content in** (adapted to our publish mechanism —
files in the repo, not claude.ai; rewritten, not pasted verbatim), bundles the
useful scripts (e.g. the palette validator), and adds our own layer: how an
artifact is published here (docs sections, brainstorm folders, the metadata
sidecar), and how to run brand-system / design-system creation flows on top.
Because the sources have upstream lives, we keep a provenance map so future
upstream updates can be diffed and folded in (subtask `70_`).

## Constraint — reserved base URL

`/artifacts` is claimed by the full-page route, so **no docs section may use
`artifacts` as its base URL**. This must be rejected with a clear error at
config load time, and the limitation documented in the skills and the docs.

## Workstreams (= subtasks)

1. `10_component` — first-class artifact component: scan, sidebar, embed render.
2. `20_route` — reserved `/artifacts/<path>` full-page route + embed affordances.
3. `30_reserved-url-guard` — config-load validation rejecting `artifacts` base URLs.
4. `40_authoring-skill` — the new artifact-authoring skill, written in full detail.
5. `50_skills-integration` — teach `documentation-guide` + `doc-issues` about the new type, the limitation, and the new skill.
6. `60_documentation` — user-guide (authoring/usage) + dev-docs (mechanism) pages.
7. `70_upstream-provenance` — provenance map + protocol for folding in upstream skill updates.

## Success criteria

- An `.html` artifact under a docs section shows in the sidebar, renders
  embedded with chrome intact, and opens full-page at `/artifacts/<path>`.
- A section configured with base URL `artifacts` fails config load with an
  actionable error.
- The new skill exists in this repo, self-contained (frontend-design content
  included, not merely referenced), scripts bundled, provenance recorded.
- Sibling skills and both documentation sides know artifacts exist.

Planning depth (brainstorms, notes, detailed subtasks) is produced by the
ultracode workflow recorded in `agent-log/010_wf_artifact-planning/`.
