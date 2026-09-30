---
title: "Settings invalidation — each config key declares what it invalidates"
status: open
---

A few settings change a lot (the theme, the sections), and most change very little (a navbar label). Today any config change reloads everything. In the new engine each setting declares which cache layers it affects, so a theme edit recompiles only the CSS, a navbar edit resends only the chrome, and a change to sections or paths rebuilds the index. This is what makes live config editing cheap and correct.

# 01 To Do
- [ ] **An invalidation class per setting.** In the settings schema ([030/30](../030_rust-engine/30_config-loader-and-settings-schema.md)), every key carries one or more classes from the table in section 01 below. A key without a class does not compile (make it a required field of the schema definition, not a convention).
- [ ] **Config diff on reload.** When the watcher reports a change under `config/`, load the new config, validate it, and diff it against the old one key by key. A failed validation pushes `fatal` and keeps the old config serving ([050/30](../050_server/30_watcher-and-push.md)).
- [ ] **Map the diff to actions.** The union of the changed keys' classes decides the work: recompile CSS, resend manifest, rebuild the index, re-render pages whose fingerprint includes the key, re-check libraries.
- [ ] **Feed the fingerprint.** Expose `settings_fingerprint(value_kind)` for [040/10](./10_cache-keys-and-dependencies.md): the hash of the values of every key whose class touches that kind.
- [ ] **Theme files count as settings.** Files under the theme folders and `config/themes/<name>/` belong to the `css` class; `theme.yaml` of the active theme too.
- [ ] **`.env` overrides.** A change in `config/.env` (today only the port) is `restart`: report that the change takes effect on the next start.
- [ ] **Tests** for each class, below.

## Guardrails
- Correct before fast: when a key's effect is uncertain, give it the wider class (`index`). Never a narrower one.
- The mapping lives in the schema definition, next to the key. No separate table that can drift.

## Done when
- A test per class: change one key of that class in a fixture project and assert exactly the listed actions ran and no others (count recompiles, re-renders, index rebuilds).
- With the server running: changing `theme` swaps the CSS URL without a page re-render; renaming a navbar item updates the navbar without refetching the page body; adding a section adds it to the manifest and sidebar.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — the settings schema in the config part of the core, the action mapping in the cache crate.

**Read first:**
- [Project config](../../notes/02_engine/02_project-config.md) — every `site.yaml` key, `.env`, what changed from 0.x.
- [Theming and layouts, sections 04–05](../../notes/03_frontend/04_theming-and-layouts.md) — where theme CSS comes from.
- [The Rust engine, section 07 Theme CSS](../../notes/02_engine/03_rust-engine.md).
- Today's config loader and theme merge, for the key list: [config.ts](../../../../../../agent-ks-engine/src/loaders/config.ts), [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts).

**Depends on:** [030/30 config loader and settings schema](../030_rust-engine/30_config-loader-and-settings-schema.md), [040/10](./10_cache-keys-and-dependencies.md).
**Unblocks:** [050/30 watcher and push](../050_server/30_watcher-and-push.md); [140/60 settings schema versioning](../140_versioning-and-migrations/60_settings-schema-versioning.md) reads the same schema.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS ([Rust engine](../../notes/02_engine/03_rust-engine.md)).
- Decided (claude, 2026-09-30): every setting declares its invalidation class in the schema; an unclassified key is a build error.

# 05 Notes & Analysis

## 01 Invalidation classes

| Class | Work | Example keys |
|---|---|---|
| `css` | Recompile theme CSS; push the new CSS URL in the manifest | `theme`, `theme_paths`, files under theme folders |
| `chrome` | Resend the manifest (navbar, footer, logo, site identity); no page re-render | `site.name`, `site.title`, `logo.*`, everything in `navbar.yaml` and `footer.yaml` |
| `page` | Re-render pages whose fingerprint includes the key | Keys that change body output, for example a future markdown option |
| `index` | Rebuild the site index and everything derived from it | `pages.*` (sections, base URLs, layouts, data folders), `paths.*` |
| `libraries` | Re-run the library sync check | `config/dep.yaml` (a file, handled like a setting) |
| `restart` | Report "takes effect on the next start" | `server.port`, `.env` keys |
| `gate` | Re-run the version gate; on failure push `fatal` | `engine_version` |

## Watch out
- `site.description` looks like `chrome` but feeds page metadata in the static build. Check each key against every consumer, including [150/00 publishing](../150_publishing/00_overview.md), before classing it.
