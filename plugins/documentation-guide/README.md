# documentation-guide

Claude Code plugin for the [documentation-template](https://github.com/sidhanthapoddar99/documentation-template) framework. Ships:

- **3 skills** — `agent-ks-docs` (operating manual for docs / blog / config / writing / themes — triages to domain-specific reference files), `agent-ks-issues` (the complete, self-contained issue-tracker skill: anatomy, creation rules, subtasks, brainstorms, agent-logs, agent-memory, the dump — also fires on the execution verbs audit / refactor / loop / discuss), and `agent-ks-artifacts` (building self-contained HTML artifacts — reports, dashboards, data visualizations, design systems — as `.html` content files served at `/artifacts`, with a `.meta.json` sidecar; bundles a palette validator)
- **The `agent-ks` CLI** — one dispatcher on `PATH`; every operation is `agent-ks <group> <verb>` (issue tracker, validators, docs+blog content, git metadata, cross-content `find`, link-aware `move`, `img`). Discover with `agent-ks help`
- **2 slash commands** — `/docs-init` (bootstrap a new docs project from zero) and `/docs-add-section` (scaffold a new top-level section)

The skills teach Claude Code how to navigate this Astro-based docs framework: the project's `data/` content layout, frontmatter conventions, the folder-per-issue tracker, `site.yaml` configuration, custom themes, and more. Each task is triaged to a domain-specific reference file rather than dumping everything into one long prompt.

## Install

Distributed via [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace):

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install documentation-guide@sids-plugin-marketplace
/reload-plugins
```

After install, `agent-ks` is on your `PATH` automatically (Claude Code adds the plugin's `bin/` to PATH at session start), as an extensionless bash shim (Linux / macOS / WSL / Git Bash) plus a `.cmd` shim (native Windows cmd / PowerShell). Try:

```
agent-ks issue list --priority high
agent-ks issue list --search "indexer" --status open,review
agent-ks issue review-queue
agent-ks check config             # validate site.yaml / navbar.yaml / footer.yaml
agent-ks check section ./data/user-guide
```

The skills trigger automatically whenever you work on docs (agent-ks-docs) or the issue tracker (agent-ks-issues) in a documentation-template project (i.e. one with a `documentation-template/` framework folder, with `.env`'s `CONFIG_DIR` pointing at the project's config).

## Bootstrap a new project

In a fresh directory:

```
/docs-init
```

Walks you through scope (whole repo vs subfolder), site name, and first section name; scaffolds `config/`, `data/`, starter page, and patches `CLAUDE.md`. Prints the framework-clone command at the end.

To add another top-level section to an existing project:

```
/docs-add-section [name]
```

Computes the next `NN_` prefix, scaffolds `settings.json` + `01_overview.md`, and (optionally) registers the section in `config/site.yaml`.

## What's inside

| Capability | Where |
|---|---|
| Docs/blog/config skill | `skills/agent-ks-docs/SKILL.md` (+ reference files in `references/`) |
| Issue-tracker skill | `skills/agent-ks-issues/SKILL.md` (+ ~20 reference files in `references/`) |
| Artifact-authoring skill | `skills/agent-ks-artifacts/SKILL.md` (+ `references/` incl. a `dataviz/` sub-folder, and a bundled `scripts/validate_palette.js`) |
| CLI entrypoint | `bin/agent-ks` (bash) + `bin/agent-ks.cmd` (Windows) |
| CLI dispatcher | `skills/agent-ks-docs/scripts/cli.mjs` — the `<group> <verb>` → script map |
| 2 slash commands | `commands/docs-init.md`, `commands/docs-add-section.md` |
| Helper scripts | `skills/agent-ks-docs/scripts/{issues,blog,config,docs}/*.mjs` (the dispatcher routes to these) |

## Requirements

- A documentation-template-shaped project (the `documentation-template/` framework folder cloned somewhere, with `.env`'s `CONFIG_DIR` pointing at the project's `config/`)
- `bun` preferred for running the helpers and the framework; `npm` / `node` work as fallbacks

## License

TBD — placeholder. Decide before any public distribution.
