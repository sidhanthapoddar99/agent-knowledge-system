---
title: "M1 — docs audit (Haiku fleet: user-guide, dev-docs, audience split)"
iteration: 1
agent: claude
status: done
date: 2026-07-04
---

## Goal

Three parallel Haiku validators over the documentation, report-only: H1
validated the diagram-related user-guide pages, H2 swept dev-docs for
staleness against the recent framework changes, H3 classified every page in
both sections against the newly codified CLAUDE.md audience split
(user-guide = usage, dev-docs = internals).

## Result

**H1 — user-guide diagram docs: clean.** All 6 pages (markdown-basics,
asset-embedding, diagram-pages, diagram-showcase, data-structure,
folder-settings) pass frontmatter/prefix/settings checks; every relative
link and asset reference resolves; all 10 cross-page diagram-feature claims
(embed grammar, `[[..]]` fence rules, sidecar, collisions, no-prefix skip,
assets exclusion, opt-out scope) are mutually consistent. No findings.

**H2 — dev-docs staleness: no stale claims, no dead links — but 6 gaps.**
Nothing in dev-docs still presents custom tags as current, and nothing
contradicts the new asset-pipeline behaviour. What's *missing* (internals
never documented):

| Missing internals | Suggested home |
|---|---|
| First-class diagram pages (`src/loaders/diagram-pages.ts`) | `05_architecture/03_data-loading.md` |
| Excalidraw embed postprocessor (`excalidraw-embed.ts`) | `05_architecture/04_parser/06_post-processing.md` |
| `asset-src` postprocessor (img **and** href rewrite) | `06_post-processing.md` |
| Asset-route cache strategy (dev no-cache/ETag vs prod immutable) | `06_post-processing.md` or `03_data-loading.md` |
| `table-wrap.ts` postprocessor | `06_post-processing.md` |
| `issue-body-links.ts` postprocessor | `06_post-processing.md` |

**H3 — audience split: broadly consistent, misfilings surgical.** User-guide
is 93% pure usage; dev-docs mixed pages are mostly correct "interface for
developers" bridges. Flagged user-guide pages leaning internals:

- `10_configuration/03_site/09_reference.md` — TypeScript interfaces in a
  YAML-users page (strongest candidate to move/split).
- `25_themes/02_the-theme-contract.md` — engineering-rationale framing.
- `25_themes/05_component-styles/02_markdown-styles.md` +
  `03_navbar-styles.md` — internal selector scoping, not theming usage.
- `25_themes/09_validation.md` — describes validator internals rather than
  "how to fix error X".
- Dev-docs side: only `25_plugins/05_creating-plugins/04_bin-wrappers.md`
  noted as possibly worth a usage/internals split.

## Next

Findings are triage input for sidhantha — the dev-docs gap list pairs
naturally with the H2-suggested homes, and the flagged user-guide pages need
a human call on move vs reframe. No fixes applied in this audit.
