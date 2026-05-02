# documentation-guide

Claude Code plugin for the [documentation-template](https://github.com/sidhanthapoddar99/documentation-template) framework. Ships:

- **1 skill** — `documentation-guide` — operating manual that triages docs/issue/blog/config tasks to domain-specific reference files
- **11 CLI wrappers** — 8 for the issue tracker (`docs-list`, `docs-show`, `docs-subtasks`, `docs-agent-logs`, `docs-set-state`, `docs-add-comment`, `docs-add-agent-log`, `docs-review-queue`) plus 3 validators (`docs-check-blog`, `docs-check-config`, `docs-check-section`)
- **2 slash commands** — `/docs-init` (bootstrap a new docs project from zero) and `/docs-add-section` (scaffold a new top-level section)

The skill teaches Claude Code how to navigate this Astro-based docs framework: the project's `data/` content layout, frontmatter conventions, the folder-per-issue tracker, `site.yaml` configuration, custom themes, and more. Triages every task to a domain-specific reference file rather than dumping everything into one long prompt.

## Install

Distributed via [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace):

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install documentation-guide@sids-plugin-marketplace
/reload-plugins
```

After install, the 11 CLI wrappers are on your `PATH` automatically (Claude Code adds the plugin's `bin/` to PATH at session start). Try one:

```
docs-list --priority high
docs-list --search "indexer" --status open,review
docs-review-queue
docs-check-config             # validate site.yaml / navbar.yaml / footer.yaml
docs-check-section ./data/user-guide
```

The skill triggers automatically whenever you work on docs in a documentation-template project (i.e. one with a `documentation-template/` framework folder, with `.env`'s `CONFIG_DIR` pointing at the project's config).

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

Computes the next `XX_` prefix, scaffolds `settings.json` + `01_overview.md`, and (optionally) registers the section in `config/site.yaml`.

## What's inside

| Capability | Where |
|---|---|
| Skill | `skills/documentation-guide/SKILL.md` (+ 5 reference files in `references/`) |
| 11 CLI wrappers | `bin/docs-*` |
| 2 slash commands | `commands/docs-init.md`, `commands/docs-add-section.md` |
| Helper scripts | `skills/documentation-guide/scripts/{issues,blog,config,docs}/*.mjs` (the wrappers shell out to these) |

## Requirements

- A documentation-template-shaped project (the `documentation-template/` framework folder cloned somewhere, with `.env`'s `CONFIG_DIR` pointing at the project's `config/`)
- `bun` preferred for running the helpers and the framework; `npm` / `node` work as fallbacks

## License

TBD — placeholder. Decide before any public distribution.
