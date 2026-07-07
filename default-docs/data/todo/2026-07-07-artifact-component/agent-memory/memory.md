---
title: "Agent memory — artifact component"
---

## Index

- This file — key facts and pointers for any agent working this issue.

## Key facts

- **Precedent to mirror:** first-class diagram pages from
  [[2026-04-10-editor-diagrams]] — `XX_`-prefixed diagram files render as docs
  pages with an optional same-name metadata sidecar; `assets/` excluded from
  the scan; slug collisions error explicitly. The artifact type reuses that
  loader foundation and its skill/doc update pattern.
- **Skill sources live at repo-root `tmp_skills/`** (untracked, has its own
  .gitignore): `artifact-design/`, `dataviz/`, `design-sync/`,
  `frontend-design/`. Captured 2026-07-07 from Claude Code v2.1.202 built-ins
  (Skill-tool load + `/tmp/claude-1000/bundled-skills/` extraction) and the
  official plugin marketplace cache (frontend-design, verbatim with
  frontmatter). Full provenance: `notes/` in this issue.
- **Settled decision:** dedicated `/artifacts/<path>` URL is the primary
  full-view mechanism (the iframe embed needs the route as its `src` anyway);
  in-place expand is a secondary, optional affordance. Decided with the user
  2026-07-07 before issue creation.
- **Reserved-URL constraint:** docs sections must not use `artifacts` as base
  URL; enforce at config load, document in skills + docs.
- **Skill convergence stance (user's latest word):** all four sources get
  *written into* the new skill (adapted/rewritten, scripts bundled), including
  frontend-design — reference-only was an earlier position, superseded.
- Planning content authored via the ultracode workflow in
  `agent-log/010_wf_artifact-planning/` (complete 2026-07-07 — 11 files,
  verified + fixed, validator clean).

## Settled during planning (cite notes/02 + brainstorms)

- **New skill name: `artifact-authoring`** — deliberately NOT `artifact-design`,
  which would collide with the Claude Code built-in skill of that name.
- **Sidecar naming: `<NN_name>.meta.json` / `.meta.jsonc`** — mirrors
  `diagram-pages.ts:161`, never a bare `<name>.json` (would collide with data
  files the artifact itself fetches). When cloning the diagram loader, fix its
  cache bug: `.jsonc` sidecars missing from `dependencyFiles`
  (`diagram-pages.ts:165`).
- **Reserved-URL guard covers a full set** — `artifacts`, `assets`,
  `content-assets`, `api`, `editor` — by resurrecting the dead
  `validateRoutes()` (`config.ts:354-384`) as a hard throw in `loadSiteConfig()`.
- **Trust stance:** artifacts run unsandboxed as first-party content;
  `text/html` is scoped to the `/artifacts` route only, NOT added to the shared
  MIME map (`pages/lib/mime.ts`).
- **Chrome reconciliation:** "sidebar + TOC stay" resolves to sidebar-only —
  an artifact has no headings, so the outline rail auto-hides (accepted
  reading, recorded in brainstorm/01 Thread C).
- **tmp_skills baseline:** keep untracked in the public repo; preserve the
  snapshot privately (version-locked — v2.1.202 built-ins are unrecoverable
  once the harness moves on); commit only a sha256 integrity manifest
  (subtask 70). Actual serving header for content-assets is
  `public, max-age=31536000` (no `immutable`).
