# New project

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
└── agent-knowledge-system/        the framework, cloned by the user AFTER this, beside config/ and data/
    ├── .env                       CONFIG_DIR=../config, written after the clone
    ├── start                      the run wrapper
    ├── astro-doc-code/            framework code
    └── default-docs/              the framework's bundled docs; the User Guide section reads them
```

This is consumer mode. A patched `CLAUDE.md` tells later sessions the layout, the skills and the build commands.

## 1 Pre-flight

```bash
test -f ./config/site.yaml && echo "config/site.yaml exists"
test -d ./agent-knowledge-system && echo "agent-knowledge-system/ exists"
test -f ./default-docs/config/site.yaml && echo "default-docs/config/site.yaml exists (framework-dev layout)"
```

If any line prints, stop with:

> Docs are already set up here (`<path>` exists). Add a section instead ([02_add-section.md](./02_add-section.md)), or remove the existing structure first.

## 2 Locate the template

The template is `assets/template/` beside this skill's `SKILL.md`. Claude Code sets `CLAUDE_PLUGIN_ROOT`; any other host derives the path from the `agent-ks` shim.

```bash
TEMPLATE_DIR="${CLAUDE_PLUGIN_ROOT}/skills/agent-ks-config/assets/template"
[ -d "$TEMPLATE_DIR" ] || TEMPLATE_DIR="$(dirname "$(readlink -f "$(command -v agent-ks)")")/../skills/agent-ks-config/assets/template"
echo "Template: $TEMPLATE_DIR"
test -d "$TEMPLATE_DIR/config" || { echo "ERROR: bundled template not found"; exit 1; }
```

If the test fails, the install is broken. In Claude Code: run `/plugin update agent-ks@sids-plugin-marketplace`, then `/reload-plugins`. In Codex: copy the skill folder again.

## 3 Scope

Ask: whole repo, or a subfolder? A subfolder (default `docs`) is right when the repo already holds source code. Whole repo: `chosen_root="."`. Subfolder: ask the name, create the folder if missing, `chosen_root="./<name>"`. Print `realpath "$chosen_root"` and confirm it before you write.

## 4 Site identity

Ask all four in one message.

| Question | Used for | Default |
|---|---|---|
| Site name | navbar label | the basename of `chosen_root` |
| Site title | the `<title>` tag | the site name |
| Description | one-sentence tagline | `Documentation built with agent-knowledge-system` |
| Repo URL, or `org/repo` | footer and social links | the placeholder `your-org/your-repo`; the user edits `config/footer.yaml` later |

Keep them in `SITE_NAME`, `SITE_TITLE`, `DESCRIPTION` and `REPO_URL` (a full URL). When the user picks a non-default answer, restate it, so they can correct a typo.

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
Will print the clone and .env instructions for the framework at the end.

Proceed?
```

Never scaffold without this confirmation.

## 6 Copy and substitute

```bash
# Copy everything except the template's own README.md. It documents the template, not the project.
rsync -a --exclude='README.md' "$TEMPLATE_DIR/" "$chosen_root/"
cd "$chosen_root"

sed -i \
  -e "s|name: \"My Docs\"|name: \"$SITE_NAME\"|" \
  -e "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" \
  -e "s|description: \"Modern documentation built with Astro\"|description: \"$DESCRIPTION\"|" \
  -e "s|alt: \"My Docs\"|alt: \"$SITE_NAME\"|" \
  config/site.yaml

sed -i -e "s|© {year} My Docs. All rights reserved.|© {year} $SITE_NAME. All rights reserved.|" config/footer.yaml

if [ -n "$REPO_URL" ] && [ "$REPO_URL" != "https://github.com/your-org/your-repo" ]; then
  REPO_ESCAPED=$(printf '%s\n' "$REPO_URL" | sed 's|[\&/]|\\&|g')
  sed -i "s|https://github.com/your-org/your-repo|$REPO_ESCAPED|g" config/footer.yaml
fi

sed -i "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" data/pages/home.yaml
cd - > /dev/null
```

Do not write `.env`. It belongs inside the framework folder, which does not exist yet. Step 8 covers it.

## 7 Patch CLAUDE.md

The template is `assets/claude-md.template.md`, beside `assets/template/`. If `<chosen_root>/CLAUDE.md` is absent, write the template in full. If it exists, append from `## Documentation` on, or merge into an existing `## Documentation` section. Never overwrite the rest. Substitute `<SITE_NAME>`, `<DESCRIPTION>` and `<chosen_root>` (`.` for the root itself). Without it, later sessions do not know the layout, the skills or the build commands.

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

To customise: site identity in config/site.yaml; navbar and footer in config/;
logos in assets/, then site.yaml -> logo:; a section with /agent-ks-config section <name>;
a theme at themes/<name>/theme.yaml (extends: "@theme/default").

The User Guide section reads the framework's bundled docs. To remove it, delete the
`user-guide:` block from config/site.yaml pages: and the matching navbar.yaml entry.
```

Do not clone the framework for the user. It is a network operation, and the fork is the user's choice. Print the command instead.
