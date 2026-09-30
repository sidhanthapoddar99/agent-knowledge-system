---
title: "Config loader and settings schema — typed settings that declare what they affect"
status: in-progress
---

A few settings change a lot: the theme changes every page's CSS, a section's `base_url` changes every URL in it, the port needs a restart. If the engine treats every config change as "reload everything", edits feel slow and caches are thrown away; if it guesses what changed, it serves stale pages. This leaf turns [020/20](../020_content-contract/20_config-folder.md)'s rules into typed Rust settings, where **each setting declares what it affects**, so a config edit invalidates exactly what it must.

# 01 To Do
- [x] **Typed settings** in `agentks-config`: one struct per file (`SiteConfig`, `NavbarConfig`, `FooterConfig`), fully resolved (aliases expanded, paths canonical), plus the raw spans for error lines.
- [x] **Unknown keys are collected, not fatal**: parse to a YAML value first, record unknown keys as warnings with the nearest known key suggested (edit distance), then deserialise.
- [x] **An "affects" tag on every setting**, declared once beside the field (an attribute or a static table, whichever keeps it next to the field):

| Tag | Examples | What a change invalidates |
|---|---|---|
| `identity` | `site.name`, `site.title`, `site.description`, `logo` | The manifest only |
| `chrome` | `navbar.yaml`, `footer.yaml` | The manifest (navbar and footer data) |
| `routing` | `pages.*.base_url`, `pages.*.data`, `pages.*.type`, `paths` | The site index is rebuilt; every URL and every page hash |
| `layout` | `pages.*.layout` | That section's manifest entry and page data (`layout` field) |
| `theme` | `theme`, `theme_paths`, files under `config/themes/` | The compiled theme CSS only |
| `libraries` | `dep.yaml` | A library sync, then pages that name library elements |
| `server` | `server.port`, `.env` overrides | Nothing live: the running server reports "restart needed" |
| `version` | `engine_version` | Re-run the gate; outside the range, the server stops serving and shows the migration message |

- [x] **A config diff**: on a change to any config file, load the new config, diff it against the current one field by field, and return the set of tags touched. `agentks-site` applies the smallest invalidation that covers them ([040/20 settings invalidation](../040_caching/20_settings-invalidation.md) owns the cache side). A diff that cannot be classified (a field with no tag) is a build-time test failure, never a runtime guess.
- [x] **The config fingerprint**: a hash of the settings that shape rendered pages (`routing` and `layout` inputs; the theme reaches pages only through the hashed CSS URL), part of every page's render hash ([040/10](../040_caching/10_cache-keys-and-dependencies.md)). Identity and chrome changes do not change page hashes.
- [ ] **Live reload**: the server watches `config/` ([050/30](../050_server/30_watcher-and-push.md)); a valid change applies without restart (except `server` tags); an invalid change keeps the last good config running and shows the error in the dev toolbar and the log.
- [x] **Settings schema versioning**: the typed schema belongs to the engine version. A key removed in a release is recognised and reported with its migration ([140/60](../140_versioning-and-migrations/60_settings-schema-versioning.md)).

## Guardrails
- A setting without an "affects" tag does not compile or fails a test; nobody can add one silently.
- Never apply half a config: a change is loaded and validated completely before the diff is applied.

## Done when
- A test per tag: change one setting of that tag in a fixture and assert the diff reports exactly that tag and the site invalidates only what the table says (for `theme`: CSS hash changes, no page hash changes).
- A test that fails when a new field is added to a settings struct without a tag.
- Editing `navbar.yaml` in a running server updates the navbar in the browser without re-rendering any page (observe the pushed hashes).

# 02 Status and Result
In progress. The config side is built and tested; live reload is left, and it lives in the server and site crates (050/30, 040/20).

## Result
- All code is in the main repo's `apps/agentks-engine/crates/config/` (worktree branch `wave2/config`). Tests: `cargo test -p agentks-config`, 27 tests (15 unit, 12 integration in `tests/load.rs`), about 0.02 s to run. `./ctl gate` green on 2026-10-01.
- Typed settings: `SiteConfig`, `NavbarConfig`, `FooterConfig` (now with `social`), `EnvOverrides`, all resolved to project-relative paths. The YAML reader (`src/yaml.rs`) keeps the line of every key and value.
- Unknown keys: a warning (`config-key-unknown`) with the nearest known key by edit distance (`src/read.rs`); the load goes on.
- Affects tags: `diff` destructures each settings struct field by field with the tag on the same line (`src/affects.rs`). A new field that is not listed does not compile, which is the "untagged field fails" guard.
- `diff`, `ProjectConfig::fingerprint` (routing and layout settings), `ProjectConfig::section_fingerprint(name)` (routing plus that section's layout), and `ProjectConfig::affects_of_file(path)` returning `Reload`, `Tags(..)` or `Unrelated` for the watcher.
- A test per tag in `tests/load.rs` (`each_setting_reports_exactly_its_tag`), plus fingerprint checks: theme, identity, chrome and server edits leave the fingerprint alone.
- Removed keys: `src/removed.rs` holds each removed key with the release that removed it, why, and the fix.
- Left: live reload (the server watches `config/`, calls `affects_of_file`, then `load` and `diff`, and keeps the last good config on a failed load), and the running-server done-when check on `navbar.yaml`.

## Agent log
none

# 03 References
- **Where:** crate `agentks-config`; applied in `agentks-site`.
- **Read first:** [020/20 config folder](../020_content-contract/20_config-folder.md) (the rules and keys); [02/02 Project config](../../notes/02_engine/02_project-config.md); [03/04 Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) section 05 (theme inputs); today's [config.ts](../../../../../../agent-ks-engine/src/loaders/config.ts) and [cache-manager.ts](../../../../../../agent-ks-engine/src/loaders/cache-manager.ts) (today's invalidation by file type).
- **Depends on:** [10](./10_workspace-and-crate-boundaries.md), [20](./20_error-model.md), [020/20](../020_content-contract/20_config-folder.md).
- **Unblocks:** [040/20](../040_caching/20_settings-invalidation.md), [85](./85_theme-css-compiler.md), [050/30](../050_server/30_watcher-and-push.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): a few settings change how themes and other parts are defined, so config changes must be handled per setting, not as a blanket reload.
- Decided (claude, 2026-09-30): the eight "affects" tags above; the port needs a restart and is reported, never applied live.
- Decided (claude, 2026-10-01): the untagged-field guard is compile-time. `diff` destructures every settings struct without `..`, with each field's tag beside it, because a compile error cannot be skipped the way a forgotten test can.
- Decided (claude, 2026-10-01): the config fingerprint covers the `routing` and `layout` settings, not `theme`, because the done-when says a theme change moves the CSS hash and no page hash; pages reach the theme only through the hashed CSS URL. `section_fingerprint` narrows `layout` to one section, so a layout change in one section leaves the other sections' pages alone.
- Decided (claude, 2026-10-01): `dep.yaml`, `dep.lock` and theme files are not fields of `ProjectConfig`. `affects_of_file` tags them by path (`libraries`, `theme`), because their contents belong to the library crate and the theme compiler.
- Decided (claude, 2026-10-01): sections that are added, removed or reordered count as `routing`, and a change of project location returns every tag, because a wider tag is safe and a narrower one serves stale pages.

# 05 Notes & Analysis
## Watch out
- Theme files under `config/themes/` are not YAML settings but carry the `theme` tag: a change to one recompiles CSS only.
