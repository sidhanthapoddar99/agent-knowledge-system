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
- **Variation-set doctrine shipped (2026-07-08, subtask 100 → review):** the
  options-explorer pattern is now written into the skill
  (`design-systems.md` section + SKILL triage/§0/§1/§3 hooks + `variation-set`
  sidecar type). Also settled: sidecar = design memory (read before touching,
  update in the same change as any HTML edit — anti-drift is the agent's
  duty), and self-mode artifacts should reuse the contract's token *names*
  with their own values (free to add beyond). Full record:
  `agent-log/070_it_skill-sharpening/`; settled decisions appended to
  `notes/02_settled-decisions.md`. Cache mirror target is
  `~/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/0.5.4/`
  (the only cache dir with the artifacts skill, though repo plugin.json says
  0.5.5).
- **Tracker artifact rendering (subtask 80, done→review):** `.html` in an issue's
  `notes/`/`brainstorm/` renders first-class via a **loader-only** change — no
  issues-layout JS. `issues.ts readFreeformDocs` gates `.html` to those two
  folders (by `subName`) and emits the shared `artifactContainerHtml()` from
  `artifact-pages.ts`; the note then rides the global `BaseLayout`
  `scripts/artifacts.ts` + global `.artifact` CSS — that's why the theme
  handshake / open-full-page / expand all "just work". New `IssueNote.docType`
  drives the `SubdocTree` embed-glyph type marker; `NotePage` path label now uses
  the real filename (fixes diagrams too). `isTrackedDocFile` counts `.html` +
  `.meta.json`/`.meta.jsonc` for the cache signature. Scope is deliberately
  notes/brainstorm only (never root, `assets/`, or `agent-memory/`).

## Settled during planning (cite notes/02 + brainstorms)

- **Skill name: `agent-ks-artifacts`** (pre-rebrand: agent-ks-artifacts) — deliberately NOT `artifact-design`,
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

## Settled during subtask 90 (site-theme mode)

- **Mode vocabulary is `site` / `self`** (was documented as `adopts-site` /
  `self-world`). Engine normalizes: only `"site"` → inject; everything else
  (`self`, legacy `self-world`, unknown, absent) → `self`. Field lives inside the
  opaque sidecar `artifact:` block as `artifact.theme`; the ROUTE reads it via
  `readArtifactThemeMode()` (exported from `loaders/artifact-pages.ts`); the loader
  keeps the block opaque.
- **Injection point is the START of `<head>`, not before `</head>`** — an artifact's
  own content can contain a literal `</head>` (code sample); matching the opening
  tag is robust + theme-first cascade. Injects `getThemeCSS(getTheme())` (full merged
  output, same as BaseLayout) + an attribute-only dark-mode init mirroring BaseLayout.
- **Site-mode ETag = sha1 content-hash of the injected body** (not size+mtime), so a
  theme swap (mtime unchanged) or a `self`↔`site` flip busts it. `self` mode keeps
  the exact `"size-mtimeMs"` ETag and byte-identical serving (the subtask-20 contract
  now scopes to `self` only).
- **CLI: `agent-ks theme tokens [name] [--json]`** (`scripts/theme/tokens.mjs`, THEME
  group) mirrors engine theme resolution in pure Node and prints var→value light+dark;
  resolves `var()` chains. Self-test must run from the REPO (needs a reachable `.env`);
  running it from the plugin cache fails the `--json` checks (no `.env` up that tree)
  — not a defect.
- **Plugin parity target: cache `0.5.4`** — `agent-ks` on PATH resolves there and it
  is byte-identical to repo source (repo `plugin.json` says 0.5.5 but no 0.5.5 cache
  dir exists). Mirror every touched plugin file into 0.5.4.
- **theme.yaml ↔ skill coupling** recorded in repo CLAUDE.md theming section: the
  agent-ks-artifacts skill carries the `required_variables` names inline (standalone
  independence); changing them requires updating the skill (repo + cache) same-change.
