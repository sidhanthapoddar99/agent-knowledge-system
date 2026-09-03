---
name: agent-ks-init
description: Set up a new agent-knowledge-system project from the bundled starter template. The template ships five sections, Home, Docs, Issues, Blog and User Guide. The skill asks for the scope, the site name, the title, the description and the repo URL. Invoke it in a fresh directory. It takes no arguments.
argument-hint: (no arguments, fully interactive)
allowed-tools: Read, Write, Edit, Bash
---

# agent-ks-init

Copy the starter template into the folder the user picks. Substitute the site name, title, description and repo URL. Walk the steps in order. Ask before you write. Summarise at the end.

## The result

```
<chosen_root>/                     the user's project root
├── config/                        site.yaml, navbar.yaml, footer.yaml
├── data/                          all editable content
│   ├── docs/                      the user's docs section, NN_-prefixed files
│   ├── blog/                      YYYY-MM-DD-slug.md
│   ├── issues/                    folder-per-issue tracker
│   └── pages/                     custom-page YAML (home.yaml)
├── assets/                        logos and images, served at /assets/
├── themes/                        empty, for custom themes
├── .gitignore
└── agent-knowledge-system/        the framework, cloned by the user AFTER init, beside config/ and data/
    ├── .env                       CONFIG_DIR=../config, written after the clone; reaches back up to the content
    ├── start                      the run wrapper
    ├── astro-doc-code/            framework code
    └── default-docs/              the framework's bundled docs; the User Guide section reads them
```

This is consumer mode. A patched `CLAUDE.md` tells later sessions the layout, the skills and the build commands.

## 1 Pre-flight

```bash
test -f ./config/site.yaml && echo "config/site.yaml exists"
test -d ./agent-knowledge-system && echo "agent-knowledge-system/ exists"
test -d ./documentation-template && echo "documentation-template/ exists"
test -f ./default-docs/config/site.yaml && echo "default-docs/config/site.yaml exists (framework-dev layout)"
```

If any line prints, stop with:

> Docs are already set up here (`<path>` exists). Use `/agent-ks-add-section` to add a section, or remove the existing structure first.

## 2 Locate the template

The template is `assets/template/` beside this `SKILL.md`.

```bash
# Claude Code
TEMPLATE_DIR="${CLAUDE_PLUGIN_ROOT}/skills/agent-ks-init/assets/template"
# Codex: assets/template under the folder this skill was loaded from
# Any host with agent-ks on PATH: derive it from the shim
[ -d "$TEMPLATE_DIR" ] || TEMPLATE_DIR="$(dirname "$(readlink -f "$(command -v agent-ks)")")/../skills/agent-ks-init/assets/template"
echo "Template: $TEMPLATE_DIR"
test -d "$TEMPLATE_DIR/config" || { echo "ERROR: bundled template not found"; exit 1; }
```

If the test fails, the install is broken. In Claude Code: run `/plugin update agent-ks@sids-plugin-marketplace`, then `/reload-plugins`. In Codex: copy the skill folder again.

## 3 Scope

> Will the whole repo be the docs site, or do the docs live in a subfolder?
>
> 1. Whole repo: the current directory (`<cwd>`).
> 2. Subfolder: pick a name (default `docs`). Recommended when the repo already holds source code.

| Answer | Do |
|---|---|
| whole repo | `chosen_root="."` |
| subfolder | ask the name (default `docs`); create the folder if missing; `chosen_root="./<name>"` |

Print `realpath "$chosen_root"` and confirm it before you write.

## 4 Site identity

Ask all four in one message.

| Question | Used for | Default |
|---|---|---|
| Site name | navbar label | the basename of `chosen_root` |
| Site title | the `<title>` tag | the site name |
| Description | one-sentence tagline | `Documentation built with agent-knowledge-system` |
| Repo URL, or `org/repo` | footer and social links | the placeholder `your-org/your-repo`; the user edits `config/footer.yaml` later |

```bash
SITE_NAME="..."
SITE_TITLE="..."
DESCRIPTION="..."
REPO_URL="..."        # full URL, e.g. https://github.com/acme/docs
```

When the user picks a non-default answer, restate it, so they can correct a typo.

## 5 Confirm the plan

```
Will copy the template (five sections: Home, Docs, Issues, Blog, User Guide) into <absolute-chosen-root>:

  config/site.yaml         (substitutions: name=<SITE_NAME>, title=<SITE_TITLE>, description=<DESCRIPTION>)
  config/navbar.yaml       (no substitution)
  config/footer.yaml       (substitutions: copyright=<SITE_NAME>, repo=<REPO_URL>)
  data/docs/               (one starter page under 05_getting-started/)
  data/blog/               (one welcome post)
  data/issues/             (empty tracker; vocabulary in settings.json)
  data/pages/home.yaml     (substitution: hero.title=<SITE_TITLE>)
  assets/                  (placeholder logos; replace with your branding later)
  themes/                  (empty)
  .gitignore               (.env, .astro/, node_modules/, dist/)

Will patch CLAUDE.md at <chosen_root>/CLAUDE.md (created if absent).

Will print the clone and .env instructions for the framework at the end
(the framework is cloned INTO <chosen_root>/agent-knowledge-system/).

Proceed?
```

Never scaffold without this confirmation.

## 6 Copy and substitute

```bash
# Copy everything except the template's own README.md. It documents the template, not the project.
rsync -a --exclude='README.md' "$TEMPLATE_DIR/" "$chosen_root/"

cd "$chosen_root"

# site.yaml: site.name, site.title, site.description, logo.alt
sed -i \
  -e "s|name: \"My Docs\"|name: \"$SITE_NAME\"|" \
  -e "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" \
  -e "s|description: \"Modern documentation built with Astro\"|description: \"$DESCRIPTION\"|" \
  -e "s|alt: \"My Docs\"|alt: \"$SITE_NAME\"|" \
  config/site.yaml

# footer.yaml: copyright, then the repo URLs when the user gave one
sed -i \
  -e "s|© {year} My Docs. All rights reserved.|© {year} $SITE_NAME. All rights reserved.|" \
  config/footer.yaml

if [ -n "$REPO_URL" ] && [ "$REPO_URL" != "https://github.com/your-org/your-repo" ]; then
  REPO_ESCAPED=$(printf '%s\n' "$REPO_URL" | sed 's|[\&/]|\\&|g')   # escape for sed
  sed -i "s|https://github.com/your-org/your-repo|$REPO_ESCAPED|g" config/footer.yaml
fi

# pages/home.yaml: hero.title
sed -i "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" data/pages/home.yaml

cd - > /dev/null
```

Do not write `.env`. It belongs inside the framework folder, which does not exist yet. Step 8 covers it.

## 7 Patch CLAUDE.md

If `<chosen_root>/CLAUDE.md` is absent, write the template below in full. If it exists, append from `## Documentation` on, or merge into an existing `## Documentation` section. Never overwrite the rest. Substitute `<SITE_NAME>`, `<DESCRIPTION>` and `<chosen_root>` (`.` for the root itself). Without it, later sessions do not know the layout, the skills or the build commands.

## 8 Validate and hand off

Run `agent-ks check config "<chosen_root>/config"` with the explicit path; `.env` does not exist yet. It must exit `0`. Otherwise fix it or report it. Then end with:

```
Created the docs scaffold at <absolute-chosen-root>.

Next step: clone the framework beside your content.

  cd <chosen_root>
  git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git
  cd agent-knowledge-system
  echo "CONFIG_DIR=../config" > .env
  ./start                  # installs dependencies when missing, then starts the dev server

Open http://localhost:4321. The navbar shows "<SITE_NAME>" with five sections
(Home / Docs / Issues / Blog / User Guide).

To customise:
  - Site identity     -> config/site.yaml
  - Navbar / footer   -> config/{navbar,footer}.yaml
  - Branding (logos)  -> put replacements in assets/, then update site.yaml -> logo:
  - Add a section     -> /agent-ks-add-section
  - New theme         -> themes/<name>/theme.yaml (extends: "@theme/default")

The User Guide section reads the framework's bundled docs
(@root/default-docs/data/user-guide). To remove it, delete the `user-guide:` block
from the pages: section of config/site.yaml and the matching entry in config/navbar.yaml.
```

Do not clone the framework for the user. It is a network operation, and the fork is the user's choice. Print the command instead.

## The CLAUDE.md template

````markdown
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
| Skills | `agent-ks-docs` (docs, blog, config, writing), `agent-ks-issues` (the issue tracker), `agent-ks-artifacts` (HTML artifacts), `agent-ks-cli` (the CLI contract). Each triggers on its domain |
| CLI on PATH | one `agent-ks` entrypoint; every operation is `agent-ks <group> <verb>`. Discover with `agent-ks help` |
| Commands | `/agent-ks-init`, `/agent-ks-add-section`, `/agent-ks-quick-idea-note`, `/agent-ks-index-check` |

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
| New top-level section | run `/agent-ks-add-section` |
| Validate before commit | `agent-ks check config` and `agent-ks check section <chosen_root>/data/<section>` |
````
