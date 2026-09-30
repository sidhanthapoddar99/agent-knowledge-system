---
title: "Settings invalidation — each config key declares what it invalidates"
status: review
---

A few settings change a lot (the theme, the sections), and most change very little (a navbar label). Today any config change reloads everything. In the new engine each setting declares which cache layers it affects, so a theme edit recompiles only the CSS, a navbar edit resends only the chrome, and a change to sections or paths rebuilds the index. This is what makes live config editing cheap and correct.

# 01 To Do
- [ ] **Tags per setting.** In the settings schema ([030/30](../030_rust-engine/30_config-loader-and-settings-schema.md)), every key carries one or more of the eight `Affects` tags that `agentks-config` defines in `crates/config/src/affects.rs`: `identity`, `chrome`, `routing`, `layout`, `theme`, `libraries`, `server`, `version`. This leaf uses that one list and adds no second one. A key without a tag fails a test.
- [ ] **Config diff on reload.** When the watcher reports a change under `config/`, load the new config, validate it, and diff it against the old one with `agentks_config::diff`, which returns the set of touched tags. A failed validation pushes `fatal` and keeps the old config serving ([050/30](../050_server/30_watcher-and-push.md)).
- [ ] **Map the diff to actions.** The union of the touched tags decides the work (section 01 below): recompile CSS, resend the manifest, rebuild the index, re-render pages whose fingerprint includes the key, re-check libraries.
- [ ] **Feed the fingerprint.** Expose `settings_fingerprint(value_kind)` for [040/10](./10_cache-keys-and-dependencies.md): the hash of the values of every key whose tags touch that kind.
- [ ] **Theme files count as settings.** Files under the theme folders and `config/themes/<name>/` carry the `theme` tag; `theme.yaml` of the active theme too.
- [ ] **`.env` overrides.** A change in `config/.env` (today only the port) is `server`: report that the change takes effect on the next start.
- [ ] **Tests** for each tag, below.

## Guardrails
- Correct before fast: when a key's effect is uncertain, give it the wider tag (`routing`). Never a narrower one.
- The mapping lives in the schema definition, next to the key. No separate table that can drift.

## Done when
- A test per tag: change one key with that tag in a fixture project and assert exactly the listed actions ran and no others (count recompiles, re-renders, index rebuilds).
- With the server running: changing `theme` swaps the CSS URL without a page re-render; renaming a navbar item updates the navbar without refetching the page body; adding a section adds it to the manifest and sidebar.

# 02 Status and Result
Review. The cache side is built: the settings fingerprint. The tag-to-action map belongs in `agentks-site`.

## Result
Where: the main repository, `apps/agentks-engine/crates/cache/` (branch `wave2/cache`). Tests: `cargo test -p agentks-cache`, 36 tests in 0.06 s; `./ctl gate` green.

- `keys::settings_fingerprint(kind, &[(dotted key, canonical JSON value)])`: a hash of only the settings passed in, sorted by key, domain-separated by value kind. A navbar key that is not passed for a page cannot move that page's key (tested).
- Left for other crates: tagging every setting (030/30, `agentks-config`), the config diff, and mapping the diff's tags to actions (`agentks-site`), plus the per-tag tests with a fixture project.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/` — the tags and the diff in `agentks-config` (`crates/config/src/affects.rs`), the action mapping in the cache crate (`crates/cache/`).

**Read first:**
- [Project config](../../notes/02_engine/02_project-config.md) — every `site.yaml` key, `.env`, what changed from 0.x.
- [Theming and layouts, sections 04–05](../../notes/03_frontend/04_theming-and-layouts.md) — where theme CSS comes from.
- [The Rust engine, section 07 Theme CSS](../../notes/02_engine/03_rust-engine.md).
- Today's config loader and theme merge, for the key list: [config.ts](../../../../../../agent-ks-engine/src/loaders/config.ts), [theme.ts](../../../../../../agent-ks-engine/src/loaders/theme.ts).

**Depends on:** [030/30 config loader and settings schema](../030_rust-engine/30_config-loader-and-settings-schema.md), [040/10](./10_cache-keys-and-dependencies.md).
**Unblocks:** [050/30 watcher and push](../050_server/30_watcher-and-push.md); [140/60 settings schema versioning](../140_versioning-and-migrations/60_settings-schema-versioning.md) reads the same schema.

# 04 Decisions
- Decided (sidhantha, 2026-09-29): Rust compiles and caches each project's theme CSS ([Rust engine](../../notes/02_engine/03_rust-engine.md)).
- Decided (claude, 2026-09-30): every setting declares its `Affects` tags next to the field; a key without one fails a test.
- Decided (claude, 2026-09-30): the invalidation classes are [030/30](../030_rust-engine/30_config-loader-and-settings-schema.md)'s eight `Affects` tags, one list defined in `agentks-config`, so the schema and the cache cannot disagree.
- Decided (claude, 2026-10-01): the map from `Affects` tags to cache actions lives in `agentks-site`, not in the cache crate, because `agentks-config` (which defines `Affects`) and `agentks-cache` are both layer 1 and may not depend on each other; `agentks_config::diff`'s own doc already names the site crate as the one that applies the invalidation.
- Decided (claude, 2026-10-01): the caller passes each setting's value as canonical JSON text, so the fingerprint needs no knowledge of the config types.

# 05 Notes & Analysis

## 01 The tags and their work

| Tag | Work | Example keys |
|---|---|---|
| `identity` | Resend the manifest (site identity, logo); no page re-render | `site.name`, `site.title`, `site.description`, `logo.*` |
| `chrome` | Resend the manifest's navbar and footer; no page re-render | everything in `navbar.yaml` and `footer.yaml` |
| `routing` | Rebuild the site index and everything derived from it: every URL and every page hash | `pages.*.base_url`, `pages.*.data`, `pages.*.type`, `paths.*`, `base_path` |
| `layout` | Resend that section's manifest entry and its page data (`layout` field) | `pages.*.layout` |
| `theme` | Recompile theme CSS; push the new CSS URL in the manifest | `theme`, `theme_paths`, theme files |
| `libraries` | Re-run the library sync check, then re-render pages that name library elements | `config/dep.yaml` (a file, handled like a setting) |
| `server` | Report "takes effect on the next start" | `server.port`, `.env` keys |
| `version` | Re-run the version gate; outside the range, push `fatal` with the migration message | `engine_version` |

## Watch out
- `site.description` looks like `identity` but feeds page metadata in the static build. Check each key against every consumer, including [150/00 publishing](../150_publishing/00_overview.md), before tagging it.
