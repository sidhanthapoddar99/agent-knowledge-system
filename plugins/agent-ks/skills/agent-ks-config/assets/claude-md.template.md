# <SITE_NAME>

<DESCRIPTION>

## Documentation

This project uses the agent-knowledge-system framework. The docs site lives at `<chosen_root>/`.

### Layout (consumer mode)

| Part | Path | Note |
|---|---|---|
| Content | `<chosen_root>/data/` | docs, blog, issues, custom pages |
| Config | `<chosen_root>/config/{site,navbar,footer}.yaml` | site identity, routes, navbar, footer |
| Assets | `<chosen_root>/assets/` | served at `/assets/` |
| Themes | `<chosen_root>/themes/` | custom themes; framework themes come from `@root/default-docs/themes` |
| Framework | `<chosen_root>/agent-knowledge-system/` | cloned separately. Do not edit it. Treat it as a vendored dependency |

### Build commands

Run them from `<chosen_root>/agent-knowledge-system/`:

```bash
./start            # dev server at http://localhost:4321; installs dependencies when missing
./start build      # production build into astro-doc-code/dist/
./start preview    # serve the built site
./start doctor     # update check, install, full build; run it before you publish
./start stop       # stop a running server; `./start status` shows what runs
./start --help     # every command
```

The framework reads `.env` from `agent-knowledge-system/.env`. Consumer mode sets `CONFIG_DIR=../config`, which points back to `<chosen_root>/config/`.

### Tooling: the agent-ks plugin

| Part | What it gives |
|---|---|
| Skills | `agent-ks-config` (setup, site config, themes, layouts), `agent-ks-docs` (docs pages), `agent-ks-blog` (blog posts), `agent-ks-issues` (the issue tracker), `agent-ks-issue-logs` (agent logs), `agent-ks-artifacts` (HTML artifacts), `agent-ks-cli` (the CLI contract). Each triggers on its domain |
| CLI on PATH | one `agent-ks` entrypoint; every operation is `agent-ks <group> <verb>`. Discover with `agent-ks help` |
| Commands | `/agent-ks-config`, `/agent-ks-quick-idea-note`, `/agent-ks-index-check` |

Install once per workstation:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

### Adding content

| Task | Do |
|---|---|
| New page in a section | create `data/<section>/<NN>_<slug>.md` with `title:` frontmatter. `NN_` is the next prefix in the section: 2 to 5 digits, sorted by value, gap-spaced |
| New top-level section | ask for one, or run `/agent-ks-config section <name>` |
| Validate before commit | `agent-ks check config` and `agent-ks check section <chosen_root>/data/<section>` |
