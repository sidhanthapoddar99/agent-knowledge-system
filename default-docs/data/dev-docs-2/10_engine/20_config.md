---
title: "Config: finding and loading a project"
description: "agentks-config: project discovery, loading config/, aliases, the version gate, and the tag that says what each setting affects."
---

`agentks-config` (layer 1) finds a project and loads its `config/` folder into one typed, checked and resolved value, `ProjectConfig`. The server and every CLI command go through it, so a project is found and read the same way everywhere. It must not read content sections, render anything or know about the server. It checks that `dep.yaml` exists and parses as YAML, and leaves its format to `agentks-library`.

## Discovery

`discover` finds the config folder from three sources, in order:

1. the `--config-dir` flag;
2. the `AGENTKS_CONFIG_FOLDER` environment variable;
3. `./config` in the working directory.

**The first source that is given decides.** A flag or variable that names a missing folder is an error, not a reason to try the next source. An empty variable counts as unset. There is no upward search and no `.env` lookup. The caller reads the flag and the environment and passes them in as `DiscoverInput`, so the function itself stays free of hidden inputs.

The result is a `ProjectLocation`:

| Field | Meaning |
|---|---|
| `root` | The project root: the config folder's parent, canonical |
| `config_dir` | The config folder, canonical |
| `key` | The `ProjectKey`, hashed from the canonical config folder path |
| `found_by` | Which source named the folder: flag, environment or working directory |

When nothing is found, `ConfigError::NotFound` lists every folder it tried, in order. `agentks help` and `agentks --version` never call `discover`, so they work outside a project.

## Loading

`load` reads every config file, checks it and resolves it. It returns a whole `ProjectConfig` or nothing: **loading never applies half a config.** The steps:

1. **Read `site.yaml` and its `engine_version` first.** A missing `engine_version` means `0.0.0`.
2. **Run the version gate** (below). Content from another format gets the migration message and nothing else, so a user is not buried in errors that one migration would fix.
3. **Read the rest of `site.yaml`**: site identity, server settings, aliases, theme, logo, hosting prefix and sections.
4. **Read `navbar.yaml` and `footer.yaml`**, checking that every `page:` item names a section `site.yaml` declares.
5. **Read `config/.env`**, if present.
6. **Check `dep.yaml`** exists and is YAML.

Warnings go to the `ErrorSink` and the load goes on. Every fatal problem of the load is collected into one `ConfigError::Invalid`, each with its file, line, key path and fix.

`read_content_version` reads only `engine_version`, without the gate. `agentks migrate` and `agentks update` use it, because they must work on content outside the supported range.

The YAML reader in `yaml.rs` builds a small tree from `saphyr-parser` events. Every node keeps its line number, which is how every config error can name a line. A duplicate key is reported, not silently overwritten.

## What the loader checks

| Check | Result |
|---|---|
| A key nobody defines | `config-key-unknown` warning, with the nearest known key as the suggestion |
| A key a past format used and a release removed | `config-key-removed` error. `removed.rs` holds one row per removed key: the key, the release that removed it, why, and the fix. A release that removes a key adds its row in the same change |
| An alias that is not defined, or defined against the rules | `alias-unknown` or `alias-invalid` error |
| A section whose type, data folder or file is wrong | `section-invalid` error |
| A layout that is not a built-in style of that section's type | `layout-unknown` error, listing the styles available |
| Two sections with one `base_url`, or a `base_url` under a reserved prefix such as `/api` | `base-url-duplicate` or `url-reserved` error |
| A `config/.env` variable that overrides nothing | `env-key-unknown` warning |

`config/.env` may only override a value `site.yaml` already defines. The one variable it accepts is `AGENTKS_PORT`, which overrides `server.port`.

## Aliases

A config value such as `@data/user-guide` becomes a project-relative path through the alias table.

- `@root` is the project root and `@config` the config folder. Neither can be redefined.
- A `paths:` entry in `site.yaml` defines a user alias. Its value is relative to the config folder, or starts with `@root`. No other alias may appear inside a value, so aliases never depend on each other's order.
- Some names are reserved for the engine and cannot be user aliases: `root`, `config`, `docs`, `blog`, `issues`, `custom`, `navbar`, `footer` and `theme`.
- Every alias is resolved once, at load. An absolute path is refused, because a project must work wherever it is checked out. A path that leaves the project root is refused, on paper and on disk: a symlink that points outside counts as leaving.

## Built-in layout styles

A section's `layout` names a built-in style of its type. The list in `layouts.rs` is closed. Adding a built-in layout adds its name here in the same change.

| Group | Styles |
|---|---|
| `docs` | `default`, `compact` |
| `blog` | `default` |
| `issues` | `default` |
| `custom` | `home`, `info`, `countdown` |
| `navbar` | `default`, `minimal` |
| `footer` | `default`, `minimal` |

## The version gate

`check_version` compares the content version with the range this engine reads: from `MIN_CONTENT_VERSION`, the floor, up to `ENGINE_VERSION`. The floor of 1.0.0 is 1.0.0. The floor moves only on a breaking change, when the engine would misread content that was not migrated.

| Content version | Error message names |
|---|---|
| Below the floor | `agentks migrate`, or a mise pin to stay on the release that matches the content |
| Above the engine | `agentks update`, or a mise pin to that release |

The gate runs on `agentks start`, `agentks build` and every command that reads content. The [versioning section](../50_versioning/01_overview.md) explains how versions and migrations fit together.

## What each setting affects

Every setting carries at least one `Affects` tag. The tag says what a change to that setting invalidates, so a live config edit redoes only the work it must.

| Tag | Settings | What a change invalidates |
|---|---|---|
| `identity` | `site.*`, `logo` | The manifest only |
| `chrome` | Everything in `navbar.yaml` and `footer.yaml` | The manifest's navbar and footer |
| `routing` | `pages.*.base_url`, `pages.*.data`, `pages.*.type`, `paths`, `base_path`, adding, removing or reordering sections | The site index is rebuilt; every URL and every page hash changes |
| `layout` | `pages.*.layout` | That section's manifest entry and page data |
| `theme` | `theme`, `theme_paths`, theme files | The compiled CSS only |
| `libraries` | `dep.yaml`, `dep.lock` | A library sync, then pages that name library elements |
| `server` | `server.port`, `config/.env` | Nothing live; a restart is needed |
| `version` | `engine_version` | The version gate runs again |

`diff(old, new)` compares two complete, valid configs and returns every tag a changed field carries. Inside it, each settings struct is taken apart field by field, with the field's tag beside it. **A new field that is not listed there does not compile**, so no setting can go untagged. Two configs of different projects differ in everything, so every tag comes back.

Three more functions feed the caches:

- `ProjectConfig::fingerprint` hashes every `routing` and `layout` setting.
- `ProjectConfig::section_fingerprint` hashes the `routing` settings and one section's `layout`, so a layout change in one section leaves the others' cached pages alone.
- `ProjectConfig::affects_of_file` says what a changed file means: `Reload` for `site.yaml`, `navbar.yaml`, `footer.yaml` and `.env`; the `libraries` tag for `dep.yaml` and `dep.lock`; the `theme` tag for files under `config/themes/` or a `theme_paths` folder; otherwise nothing.

The site crate turns the tags into cache work. See [keys and invalidation](../20_caching/05_keys-and-invalidation.md).

## Related

- [The error model](./15_error-model.md): the records every config problem becomes.
- [Site: the engine as one object](./45_site.md): how a config change is loaded, diffed and applied live.
