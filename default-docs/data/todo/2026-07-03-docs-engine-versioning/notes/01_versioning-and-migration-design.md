---
title: "Design — documentation ↔ engine versioning and root-owned migrations"
---

# Design — documentation ↔ engine versioning and root-owned migrations

Pinned specification distilled from
[brainstorm/01](../brainstorm/01_idea_version-gate.md) (sidhantha's design,
2026-07-03). Subtasks 20–50 implement exactly this.

## Version format

`N.N.N` (major.minor.patch). Major stays `0` while the project is in beta.
Comparison is numeric per segment. **Only major.minor participate in the
compatibility gate** — a patch bump never changes content format by definition.

## The three version anchors

| Anchor | Lives in | Meaning |
|---|---|---|
| Content version | `site.yaml → engine_version: "0.7.0"` (top-level, sibling of `theme`) | The engine version this content tree targets — bumped by running migrations |
| Engine version | `astro-doc-code/src/loaders/engine-version.ts → ENGINE_VERSION` | What the engine currently is (`0.7.0` at introduction; `package.json`'s `1.0.0` is a dead placeholder) |
| Compatibility floor | same file → `MIN_CONTENT_VERSION` | Oldest content version this engine still parses. Starts equal to `ENGINE_VERSION`; raised only when a release actually breaks format |

**Missing `engine_version` ⇒ `0.0.0`.** Every pre-contract project trips the gate
exactly once, migrates, and is on the contract thereafter.

## The gate

Runs inside `loadSiteConfig()` (`src/loaders/config.ts`) — same place the
`theme`-required rule already hard-throws, so it stops dev, build, and preview
alike:

- `content < MIN_CONTENT_VERSION` → **throw**: names both versions and instructs
  — *"your content targets X, this engine is Y (minimum supported Z). Ask your AI
  to migrate: the scripts live in `migration/` at the repo root, named by the
  version they bring content to — run each one between X and Y in order (detect →
  dry-run → migrate), verify with `docs-guide check`, then set
  `engine_version: "Y"` in site.yaml."*
- `content > ENGINE_VERSION` → **throw**, other direction: *"content targets a
  newer engine — update the framework (`./start` pulls when behind) or check
  upgrade options."*
- In-range → proceed silently. No warnings-only mode: the stop is the feature.

## Root-owned migrations

```
<repo-root>/migration/
├── README.md                    # convention, one screen
├── 0.5.0_done-to-state.py       # <to-version>_<statement>.py
├── 0.6.0_state-to-status.py
└── 0.7.0_root-settings-schema.py
```

- **Named by the version they bring content TO**; a statement after the
  underscore; the original date moves into the docstring (provenance, not
  ordering). The gate's instruction "run everything between X and Y" chains on
  this ordering.
- Script contract unchanged from the 2026-06-22 convention: stdlib-only Python,
  self-documenting docstring, **detect** pass + **`--dry-run`** + **idempotent
  migrate**.
- The three existing plugin scripts move here (mapping: done-to-state → 0.5.0,
  state-to-status → 0.6.0, root-settings-schema → 0.7.0 — the lifecycle versions
  those changes shipped in). The plugin's `migration/` folder is removed, repo
  and cache.

## Ownership split — engine vs skill

- **The repo root owns the code.** Migrations ship with the engine in the same
  clone; a consumer who updates the framework folder has exactly the migrations
  that engine needs. No plugin-version skew.
- **The skill owns the protocol.** `doc-migration.md` keeps the when/how
  (detect → show count → confirm → migrate) but points at root `migration/` as
  the code location, documents the version-based naming, the gate, and the
  upgrade flow ("engine stopped with a version error → run the chain → bump
  `engine_version`"). All other skill references that name migration script
  paths follow.

## Bump discipline (forward-looking — never skip)

- **Any change that needs migration ships with two things**: `ENGINE_VERSION`
  bumped (minor) and **a script added inside `migration/`**
  (`<new-version>_<statement>.py`, detect + dry-run + idempotent migrate) —
  the change does not exist until its script does.
- **The floor moves only for breaking changes** (sidhantha, 2026-07-03): a
  *good-to-have* migration — old content still loads and renders correctly —
  leaves `MIN_CONTENT_VERSION` alone; old trees keep running and migrate
  opportunistically (or get swept up by a later breaking chain). A **breaking**
  change — old content fails or misrenders without it — raises the floor to
  that version. The floor means "oldest content version that still *works*
  unmigrated", not "newest migration available": raise it needlessly and you
  force pointless migrations; forget it on a breaking change and old content
  loads silently wrong — the exact failure the gate exists to prevent.
- **And it must be documented**: the script's docstring carries the full
  what/why/how (source of truth for running it), and the user-guide versioning
  page / CLAUDE.md contract stay accurate to the current floor.
- Release with no format change at all: bump `ENGINE_VERSION` patch (or minor),
  floor untouched.
- **Consumer mirror-image rule**: on a gate error, run the *full* chain — every
  script in `(content, engine]`, ascending, detect → dry-run → migrate →
  re-detect zero — before touching `engine_version`. A zero-hit detect is a
  passed check, not a skipped script. Bumping the version to silence the gate is
  never acceptable, regardless of who asks — the gate's purpose is *detecting*
  that migration is needed.
- `/docs-init` scaffolding writes the current `engine_version` into new
  projects' `site.yaml` from day one.
