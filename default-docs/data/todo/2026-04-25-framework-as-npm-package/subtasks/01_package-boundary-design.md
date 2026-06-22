---
title: "Package boundary design — what's in the package vs in the consumer"
state: open
---

Decide and document the line between **engine** (ships in the npm package) and **consumer-owned** (lives in each docs project). Everything else in this issue depends on this call.

## What's clearly *engine*

- `src/loaders/` — paths, alias, config, data, issues, themes, cache management
- `src/parsers/` — markdown → HTML pipeline (preprocessors, renderers, transformers, postprocessors)
- `src/layouts/` — all built-in layout variants (docs, blog, issues, custom, navbar, footer)
- `src/styles/` — built-in default theme + theme contract (`theme.yaml → required_variables`)
- `src/custom-tags/` — callouts, tabs, collapsible, etc.
- `src/pages/` — dynamic routing (`[...slug].astro`, `assets/`, `api/dev/`)
- The Astro integration entry point (subtask 03)

## What's clearly *consumer-owned*

- `dynamic_data/` — content, config, assets, themes (the entire reason this framework exists per consumer)
- `.env` — per-project secrets, runtime toggles
- `astro.config.mjs` — minimal: import the integration, pass `dataPath`
- `package.json` — declares the dep on the engine package + Astro
- `tsconfig.json` — minimal extends from the engine

## Grey areas — decide explicitly

| Question | Default leaning | Why |
|---|---|---|
| `src/dev-tools/` (live editor, dev-toolbar apps, system-metrics, cache-inspector) | **Engine** | Consumer benefit; no per-project config beyond what the integration exposes. Subtask 04 dives deeper. |
| `dynamic_data/data/user-guide/` (the framework's own self-hosted docs) | **Engine repo only**, distributed as an example consumer | Useful as a reference site; not shipped *into* every consumer's `dynamic_data/` |
| Default theme files (`src/styles/`) | **Engine** | Consumers consume them via the theme contract; can override |
| Helper scripts under `.claude/skills/...` | **Already separate** — owned by the agent-skill plugin (different distribution) | See `2025-06-25-claude-skills/subtasks/09_plugin-marketplace-dogfood.md` |
| `package.json`'s `scripts:` (`bun run dev`, etc.) | **Both** — engine ships defaults; consumer can override | The integration shouldn't dictate how the consumer runs Astro |

## Naming

- Package name candidates: `documentation-template`, `@<scope>/docs-template`, branded name
- Need to check npm availability before committing
- Scoped (`@xxx/`) is friendlier for org/personal hygiene; unscoped is shorter
- Pick before subtask 05 (publish pipeline)

## Acceptance

- A short ADR-style note in this issue's `notes/` capturing the boundary decisions and the package name choice
- All grey-area items explicitly resolved (engine, consumer, or split — with reasoning)
- The boundary diagram is concrete enough that subtask 02 (path/config refactor) and subtask 03 (integration) can start without re-litigating

## Out of scope

- Implementing the boundary — that's subtasks 02-05
- Consumer migration — subtask 06
