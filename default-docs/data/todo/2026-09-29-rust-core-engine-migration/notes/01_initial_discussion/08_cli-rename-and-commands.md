---
title: "The agentks rename and new commands"
---

The binary and its installer are renamed from `agent-ks` to **`agentks`**. The CLI gains the commands a single install needs to run and manage the engine, starting with `agentks ps`.

# 03 References

- [2026-04-26-project-rebrand](../../../2026-04-26-project-rebrand/issue.md) — the last rename, which locked `agent-ks`.
- [CSS and theming](./10_css-and-theming.md) — the CSS listing command.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): the installer and the binary are named `agentks`.
- Decided (sidhantha, 2026-09-29): server management commands like `agentks ps` stay part of the CLI.
- Decided (sidhantha, 2026-09-29): the rename covers everything the user sees — binary, installer, home folder, plugin, skills — so nothing is left ambiguous.

# 05 Notes & Analysis

## 01 Commands mentioned so far

| Command | Job |
|---|---|
| `agentks ps` | Show running servers |
| `agentks start` / `stop` | Run and stop the server (exists today as `agent-ks start`) |
| `agentks theme css` | Print the compiled CSS for this version ([theming](./10_css-and-theming.md)) |
| `agentks theme eject` | Copy the CSS into `config/themes/` for editing (proposed) |
| `agentks migrate` | Run content migrations ([versioning](./12_versioning-and-forced-migrations.md)) |
| `agentks docs` | Open the agentks docs, downloaded and cached ([Phase 2](../02_future-stages/08_agentks-docs-command.md)) |
| `agentks install` | Install the libraries in `config/dep.lock`; `--update` moves branch and latest entries ([Phase 2](../02_future-stages/09_libraries-and-dependencies.md)) |
| `agentks library add` · `remove` | Add a library to `config/dep.yaml` and install it, or remove it |
| `agentks library list` · `show` · `find` | What the project's libraries offer, read from their manifests, so agents reuse elements |
| `agentks check libraries` | Check the manifests of the project's libraries |
| `agentks cache status` · `clean <root>` | Show cache sizes; remove what no project under the root needs, after a report ([the home note](./07_agentks-home-and-build-cache.md)) |

## 02 How far it reaches

Everything the user sees: the binary, the installer, `~/.agentks`, the plugin (`agent-ks` today) and the skills (`agent-ks-docs`, …). It ships in one release, the 1.0.0 breaking release. Renaming the GitHub repository is optional, because GitHub redirects old URLs.
