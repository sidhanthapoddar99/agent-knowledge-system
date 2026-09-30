---
title: "Project config: the config/ folder"
---

**A project is a folder that contains `config/`.** The folder is required, it sits at a fixed place (the project root), and nothing points to it from outside: `CONFIG_DIR` and the framework-root `.env` are gone. `config/` holds `site.yaml`, `navbar.yaml` and `footer.yaml` as today, plus two new required files: `dep.yaml`, the list of libraries the project uses, required even when empty, and `dep.lock`, which agentks writes. `.env` and `.env.example` move inside `config/`, and `.env` may only override values `site.yaml` already defines, in practice the port. The CLI and the server find a project the same way the CLI does today: `--config-dir`, then `AGENTKS_CONFIG_FOLDER`, then `./config`. `site.yaml` declares the content version it targets in `engine_version`, and the engine refuses to start on content outside its supported range.

# 03 References

- [Config folder and .env](../../brainstorm/01_initial-discussion/06_config-folder-and-env.md) — the decisions.
- [Libraries](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md) — `dep.yaml` and `dep.lock`.
- [Layouts](../../brainstorm/01_initial-discussion/11_layouts.md) — why the custom-layout config goes.
- [Content format](./01_content-format.md) — what the sections contain.
- [Library system](../04_ecosystem/01_library-system.md) — the full `dep.yaml`, `dep.lock` and manifest contract. This note only places the files.
- [Theming and layouts](../03_frontend/04_theming-and-layouts.md) — theme names and layout styles.
- [Versioning and migrations](../05_delivery/03_versioning-and-migrations.md) — the version gate and the 1.0.0 migration.
- Today: [site.yaml](../../../../../config/site.yaml), [navbar.yaml](../../../../../config/navbar.yaml), [footer.yaml](../../../../../config/footer.yaml), [the config loader](../../../../../../agent-ks-engine/src/loaders/config.ts), [path aliases](../../../../../../agent-ks-engine/src/loaders/alias.ts), [the version gate](../../../../../../agent-ks-engine/src/loaders/engine-version.ts), and the user guide's [configuration section](../../../../user-guide/10_configuration/01_overview.md).

# 04 Decisions

- Decided (sidhantha, 2026-09-29): `config/` is required in every project.
- Decided (sidhantha, 2026-09-29): `.env` and `.env.example` live under `config/`.
- Decided (sidhantha, 2026-09-29): `.env` does not choose where config lives. `CONFIG_DIR` is removed.
- Decided (sidhantha, 2026-09-29): `.env` overrides settings defined in config, mainly ports.
- Decided (sidhantha, 2026-09-29): user-authored custom layouts and the logic behind them are dropped.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required, even when empty; `config/dep.lock` sits beside it.
- Decided (sidhantha, 2026-09-29): the server listens on localhost only by default; network access needs an access key ([the server](../02_engine/04_sync-engine-and-server.md)).
- Decided (claude, 2026-10-01): `paths` aliases stay, because keeping them makes the migration smaller. `@root` and `@config` are reserved ([020/20](../../subtasks/020_content-contract/20_config-folder.md)).
- Decided (claude, 2026-10-01): `AGENTKS_PORT` is the only `.env` key in 1.0.0 ([020/20](../../subtasks/020_content-contract/20_config-folder.md)).
- Proposed (claude, 2026-09-30): the `site.yaml` keys that change in 1.0.0 are the ones in section 04. Every other key keeps its meaning, so the migration is small.

# 05 Notes & Analysis

## 01 The files

| File | Written by | Committed | Required | Holds |
|---|---|---|---|---|
| `site.yaml` | the user | yes | yes | Site identity, content version, sections, theme, logo, server port |
| `navbar.yaml` | the user | yes | yes | Navbar style and items |
| `footer.yaml` | the user | yes | yes | Footer style, columns, copyright |
| `dep.yaml` | the user, or `agentks library add` | yes | yes, even as `libraries: {}` | The libraries the project uses |
| `dep.lock` | agentks | yes | written on the first install of a git library; a project with no git libraries has none | The exact commit of every git library |
| `video.yaml` | the user | yes | no; a project with no videos has none | The project's default narration `voice:` and its `pronounce:` list ([video artifacts](../04_ecosystem/05_video-pages.md)) |
| `.env.example` | the user | yes | no | Every `.env` key, documented |
| `.env` | the user | no, git-ignored | no | Local overrides |
| `themes/<name>/` | the user | yes | no | CSS overrides for a named theme |

**Why `dep.yaml` is required.** It gives agents one fixed place to look for libraries. It also marks the folder as an agentks project: the manual cache cleanup scans for `config/dep.yaml` to find every project on the machine ([machine home](./06_machine-home-and-build-cache.md)). A missing file is an error that names the fix, `agentks migrate` or creating the file.

## 02 How a command finds the project

1. `--config-dir <path>` on the command line.
2. The `AGENTKS_CONFIG_FOLDER` environment variable.
3. `./config` in the working directory.

The project root is the parent of the config folder. Paths are resolved from the working directory. There is no upward search and no `.env` lookup, which is today's CLI rule. A missing config folder is an error; `help` and `--version` work without one.

The server and the CLI use this one rule, from the shared core. The engine never looks for a framework checkout, because there isn't one.

## 03 site.yaml

```yaml
site:
  name: "Agent KS"
  title: "Agent Knowledge System"
  description: "..."

engine_version: "1.0.0"          # the content version; see the version gate below

server:
  port: 3088                     # .env may override it

paths:                           # optional user aliases, relative to config/
  data: "../data"
  assets: "../assets"

theme: "default"                 # a built-in or user theme name
theme_paths: ["./themes"]        # where user themes live

logo:
  src: "@assets/logo-dark.svg"
  alt: "Docs"
  theme: { dark: "@assets/logo-dark.svg", light: "@assets/logo-light.svg" }
  favicon: "@assets/favicon.png"

pages:
  user-guide:
    base_url: "/user-guide"
    type: docs                   # docs | blog | issues | custom
    layout: "@docs/default"      # a built-in style of that type
    data: "@data/user-guide"
  todo:
    base_url: "/todo"
    type: issues
    layout: "@issues/default"
    data: "@data/todo"
  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

| Key | Meaning |
|---|---|
| `site.*` | Name, title and description, shown in the chrome and page metadata |
| `engine_version` | The content version. Required; missing means `0.0.0`, which the 1.x gate refuses |
| `server.port` | The local server's port |
| `paths` | User aliases (`@data`, `@assets` and any other name) resolved against `config/`. Two aliases are reserved and cannot be redefined: `@root`, the project root, and `@config`, the config folder. Only `@root` may appear inside a value. An absolute path is refused, because a project must work wherever it is checked out. A path that escapes the project root is refused, and so is a symlink that leads out of it |
| `theme`, `theme_paths` | The active theme and where user themes are found |
| `logo` | Logo per colour mode, and the favicon. Each must be a file inside the project that exists; a web address is refused |
| `pages.<name>` | One section: its URL base, type, built-in layout style and data. `data` is a folder for docs, blog and issues sections, and one YAML file for a custom page |

Every alias is resolved once, when config loads. A reference to an undefined alias, a missing data folder or an unknown layout style stops the start with an error naming the key.

## 04 What changes from 0.x

| 0.x | 1.0.0 | Why |
|---|---|---|
| Framework-root `.env` with `CONFIG_DIR` | Gone. `config/` is found by the rule in section 02 | No framework folder in a project any more |
| `LAYOUT_EXT_DIR` in `.env`; the `@ext-layouts` alias; user layout folders | Gone | Custom layouts are dropped. `layout` names a built-in style only |
| `server.allowedHosts` | Gone | The server binds to localhost; network access needs `--share` and an access key |
| `editor:` block (autosave and presence timings) | Gone | The old editor is discarded. Editing settings, if any, return with Phase 2 |
| `PORT`, `HOST` in `.env` | `server.port` in `site.yaml`, overridable by `.env` | `.env` only overrides config |
| No `dep.yaml` | `dep.yaml` required | Libraries |

The 1.0.0 docs migration makes each change and bumps `engine_version` ([versioning and migrations](../05_delivery/03_versioning-and-migrations.md)).

## 05 .env

- `.env` lives at `config/.env`, is git-ignored, and is optional.
- It may only override a key `site.yaml` defines. In 1.0.0 that is the port: `AGENTKS_PORT=3090` overrides `server.port`. `AGENTKS_PORT` is the only key 1.0.0 reads. A removed 0.x key, such as `PORT` or `HOST`, is an error that names its fix.
- An unknown key is a warning, not ignored silently, so a typo is noticed.
- `.env.example` is committed and documents every key.
- Access keys are not stored here. The server keeps only their hashes, in the machine home ([sync engine and server](./04_sync-engine-and-server.md)).

## 06 navbar.yaml and footer.yaml

Unchanged from today. `layout` names a built-in navbar or footer style. Items link with `href` for external addresses or `page:` for a section named in `site.yaml`, which resolves to that section's current `base_url`. The engine resolves `page:` links and sends the navbar and footer to the frontend as data.

## 07 dep.yaml and dep.lock in brief

```yaml
# config/dep.yaml
libraries: {}                     # the smallest valid file
```

- A key under `libraries` is an alias. The entry names a `github:` repository, any `git:` URL, or a local `path:` relative to `dep.yaml`.
- A git entry may name at most one selector, `tag` (exact or a range), `commit` or `branch`. None means the newest x.y.z tag.
- `dep.lock` pins every git entry to a commit. The commit is the hash; nothing else is stored.
- Local libraries are not locked; they live in the project's own git history.

The full format is in [library system](../04_ecosystem/01_library-system.md).

## 08 The version gate

- The engine carries two numbers: its own version and the oldest content version it still reads unmigrated (the floor).
- On start, and on every CLI command that reads content, the core compares `engine_version` with that range. Content below the floor or above the engine is a hard error. The server never starts on it.
- The error names the content version, the supported range and the fix: `agentks migrate`, or pinning the older release with mise.
- The gate lives in the binary and never depends on a download. Only the migration scripts are downloaded.
- 1.0.0's floor is 1.0.0: every 0.x project migrates once.
