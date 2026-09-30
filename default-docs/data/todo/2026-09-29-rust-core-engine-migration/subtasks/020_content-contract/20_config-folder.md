---
title: "The config folder — discovery, site.yaml, navbar, footer, .env, aliases, validation"
status: open
---

A project is a folder that contains `config/`. This leaf implements how every command finds that folder, what each file in it may contain, and the errors a user sees when something is wrong. It replaces today's framework-root `.env` and `CONFIG_DIR`, and it delivers the "config validation with helpful errors" that [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md) asked for.

# 01 To Do
- [ ] **Discovery**, one function in `agentks-config`, used by the server and every CLI command: `--config-dir <path>`, then `AGENTKS_CONFIG_FOLDER`, then `./config`. The project root is the config folder's parent. No upward search, no `.env` lookup. A missing folder is an error naming all three sources; `help` and `--version` work without one.
- [ ] **The files and their rules** ([02/02](../../notes/02_engine/02_project-config.md) section 01): `site.yaml`, `navbar.yaml`, `footer.yaml`, `dep.yaml` required; `dep.lock` written by agentks; `.env.example` and `.env` optional; `themes/<name>/` optional.
    - [ ] A missing `dep.yaml` is an error whose fix names `agentks migrate` or creating `libraries: {}`. Parsing `dep.yaml` itself belongs to [120/10](../120_libraries/10_dep-yaml-and-lock.md); this leaf checks it exists and parses as YAML.
- [ ] **`site.yaml` keys** as in [02/02](../../notes/02_engine/02_project-config.md) section 03: `site.*`, `engine_version`, `server.port`, `paths`, `theme`, `theme_paths`, `logo`, `pages.<name>` (`base_url`, `type`, `layout`, `data`). Plus **`base_path`**, the hosting path prefix `agentks build` uses by default ([30](./30_links-and-urls.md)).
    - [ ] **Aliases:** every alias resolved once, at load, against `config/`. Only `@root` (the project root) may appear inside a `paths:` value. A path escaping the project root is refused. User-to-user alias references are refused.
    - [ ] **Sections:** `type` is one of `docs | blog | issues | custom`; `layout` names a built-in style of that type ([100/00 layouts](../100_layouts/00_overview.md)); `data` exists; `base_url` values are unique and none falls under a reserved prefix (`/api`, `/artifacts`, `/content-assets`, `/assets`, `/_lib`, and the client's own asset prefix).
- [ ] **Removed keys are errors that name the migration**: `CONFIG_DIR`, `LAYOUT_EXT_DIR`, `@ext-layouts`, `server.allowedHosts`, the `editor:` block, `PORT` and `HOST` in `.env` ([02/02](../../notes/02_engine/02_project-config.md) section 04).
- [ ] **`.env`** at `config/.env`: may only override keys `site.yaml` defines. In 1.0.0 that is the port, `AGENTKS_PORT`. An unknown key is a warning, never ignored silently.
- [ ] **`navbar.yaml`, `footer.yaml`**: unchanged from today. Resolve `page:` items to the named section's current `base_url`; an unknown section name is an error.
- [ ] **Error quality.** Every config error carries the file, the line (from the YAML parser's spans), the key path (`pages.todo.layout`), what was expected, and the fix. Check each message against the spec fixtures in [10](./10_golden-fixtures.md).
- [ ] **What happens to the rest of [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md):**

| Its task | Where it goes |
|---|---|
| Config validation with helpful errors | Here |
| Config migration tool for upgrades | `agentks migrate`, [140/20](../140_versioning-and-migrations/20_migrate-command.md) |
| SEO metadata, social cards, custom head tags, analytics | The static build, [150/00 publishing](../150_publishing/00_overview.md) |
| Per-page configuration overrides | Frontmatter keys read by layouts; no new config file. Decided per need in [100/00 layouts](../100_layouts/00_overview.md) |
| Environment-specific configs (dev / staging / prod) | Not carried: `.env` overrides the port, and `agentks build --base` covers the hosting difference |

## Guardrails
- One discovery rule for every command. The server never looks for a framework checkout; there is none.
- No silent defaults for a key that is misspelt: unknown keys in `site.yaml` are warnings with the nearest known key suggested.

## Done when
- `agentks check config` (and start-up) reports each spec fixture's config error with file, line, key path and fix, matching `expected.json`.
- Today's [site.yaml](../../../../../config/site.yaml), after the 1.0.0 migration's edits, loads with no error and no warning.
- A config with a section `base_url` under `/api` is refused at load, naming the section.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** crate `agentks-config` in `apps/agentks-engine/crates/`.
- **Read first:** [02/02 Project config](../../notes/02_engine/02_project-config.md) (whole note); [brainstorm: config folder and .env](../../brainstorm/01_initial-discussion/06_config-folder-and-env.md); today's [config.ts](../../../../../../agent-ks-engine/src/loaders/config.ts), [alias.ts](../../../../../../agent-ks-engine/src/loaders/alias.ts), [paths.ts](../../../../../../agent-ks-engine/src/loaders/paths.ts) and [site.yaml](../../../../../config/site.yaml); today's CLI [context.rs](../../../../../../agent-ks-cli/src/context.rs) (the discovery rule already in Rust); [2025-06-25-configuration-enhancements](../../../2025-06-25-configuration-enhancements/issue.md).
- **Depends on:** [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md), [10](./10_golden-fixtures.md).
- **Unblocks:** [030/30 config loader and settings schema](../030_rust-engine/30_config-loader-and-settings-schema.md), [020/60 engine version gate](./60_engine-version-gate.md), [140/30 the 0.x → 1.0 docs migration](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): `config/` is required; `.env` and `.env.example` live in it; `CONFIG_DIR` is removed; `.env` only overrides settings config defines, mainly ports.
- Decided (sidhantha, 2026-09-29): custom user layouts are dropped, so `layout` names a built-in style only.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required, even when empty.
- Decided (claude, 2026-09-30): the hosting path prefix's `site.yaml` key is `base_path` (default `/`); `agentks build --base` overrides it. [02/02](../../notes/02_engine/02_project-config.md) names no key; this fills the gap.
- Decided (claude, 2026-09-30): `paths:` aliases stay in 1.0.0, so the migration stays small ([02/02](../../notes/02_engine/02_project-config.md) section 09 left it open).

# 05 Notes & Analysis
## Watch out
- YAML crate: `serde_yaml` is archived. Pick a maintained parser that reports line and column spans, and record the choice in `AGENTS.md`.
- The port override name (`AGENTKS_PORT`) is proposed in the note, not agreed; keep it in one constant so a rename is one line.
- The stable-port rule ([050/45 stable ports](../050_server/45_stable-ports.md)) derives a port from the project key when `server.port` is unset; config loading must not invent a default port of its own.
