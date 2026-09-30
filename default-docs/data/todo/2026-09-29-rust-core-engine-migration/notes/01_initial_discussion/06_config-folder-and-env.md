---
title: "Config folder and .env"
---

The `config/` folder becomes **mandatory**, and `.env` no longer decides where it is. `.env` and `.env.example` move **inside** `config/`, and `.env` only overrides values that `config/` already defines, mostly ports. In about 90% of projects it is written once and forgotten. `config/dep.yaml` (the libraries the project uses) is required too, even when empty, and agentks writes `config/dep.lock` beside it.

# 03 References

- [CLI rename and commands](./08_cli-rename-and-commands.md) — how the CLI finds `config/`.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): `config/` is required in every project.
- Decided (sidhantha, 2026-09-29): `.env` and `.env.example` live under `config/`.
- Decided (sidhantha, 2026-09-29): `.env` does not choose the config folder's location. The logic that did (`CONFIG_DIR`) is removed.
- Decided (sidhantha, 2026-09-29): `.env` overrides settings defined in config, mainly ports. Define once and forget.
- Decided (sidhantha, 2026-09-30): `config/dep.yaml` is required, even when empty; `config/dep.lock` sits beside it. See [libraries](../02_future-stages/09_libraries-and-dependencies.md).

# 05 Notes & Analysis

## 01 What this removes

- Today the framework root's `.env` carries `CONFIG_DIR`, and consumer mode points it up out of the framework folder with `CONFIG_DIR=../config`. With a global install there is no framework folder in the project, so that indirection has no job left.
- The two operating modes (consumer and dogfood) collapse into one: a project is a folder with `config/`.

## 02 How the CLI finds config today

The CLI already resolves config as `--config-dir` > `AGENTKS_CONFIG_FOLDER` > `./config`, with no `.env` lookup. The new rule matches it.

## 03 What config holds

| File | Written by | Committed |
|---|---|---|
| `site.yaml`, `navbar.yaml`, `footer.yaml` | the user | yes |
| `dep.yaml` | the user, or `agentks library add` | yes, required even when empty |
| `dep.lock` | agentks | yes |
| `.env.example` | the user | yes |
| `.env` | the user | no |

## 04 Later use

`.env` is also where secrets would go when auth arrives ([server and editing](./09_server-websockets-and-editing.md)). `.env.example` documents every key and is committed. `.env` is ignored by git.
