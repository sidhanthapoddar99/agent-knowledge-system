---
description: Bootstrap a new agent-knowledge-system project from the bundled starter template (5 sections wired up — Home, Docs, Issues, Blog, User Guide). Walks through site name, description, repo URL.
allowed-tools: Read, Write, Edit, Bash
argument-hint: (no arguments — fully interactive)
---

You are running the `/docs-init` slash command from the `agent-ks` plugin.

# Goal

Scaffold a new **agent-knowledge-system** project from zero by **copying the plugin's bundled starter template** into the user's chosen directory, then substituting their site name / description / repo URL into the copied files.

The template ships **5 sections wired up**: Home (`/`), Docs (`/docs`), Issues (`/issues`), Blog (`/blog`), and the framework's bundled User Guide (`/user-guide`). It's a working site out of the box — the user customises the content from there.

## Final layout (consumer mode)

```
<chosen_root>/                     ← user's project root
├── config/                        ← site.yaml, navbar.yaml, footer.yaml
├── data/                          ← all editable content
│   ├── docs/                      ← user's docs section (NN_-prefixed)
│   ├── blog/                      ← YYYY-MM-DD-slug.md
│   ├── issues/                    ← folder-per-issue tracker
│   └── pages/                     ← custom-page YAML (home.yaml)
├── assets/                        ← logos, images (served at /assets/)
├── themes/                        ← (empty — for custom themes)
├── .gitignore
└── documentation-template/        ← framework folder — cloned by the user AFTER init
    ├── .env                       ← CONFIG_DIR=../config (created post-clone)
    ├── start                      ← bash wrapper
    ├── astro-doc-code/            ← framework code
    └── default-docs/              ← framework's bundled docs (the User Guide section reads from here)
```

The framework folder (`documentation-template/`) lives **inside** the user's project root as a sibling of `config/` and `data/`. The user's content is OUTSIDE the framework folder — this is the consumer-mode architecture. `.env` lives inside the framework folder with `CONFIG_DIR=../config` to reach back up to the content.

A patched `CLAUDE.md` at the project root tells future Claude Code sessions the layout, the active skill, and the build commands.

# Workflow

Walk the user through these steps **in order**. Be conversational — ask questions, confirm before writing files, summarise at the end.

## Step 1 — Pre-flight

Check the current working directory for evidence of an existing docs project:

```bash
test -f ./config/site.yaml && echo "config/site.yaml exists"
test -d ./documentation-template && echo "documentation-template/ exists"
test -f ./default-docs/config/site.yaml && echo "default-docs/config/site.yaml exists (legacy/dogfood layout)"
```

If **any** of these prints, stop:
> Looks like docs are already initialised here (`<path-found>` exists). Use `/docs-add-section` to add a new section, or remove the existing structure first.

If none exist, continue.

## Step 2 — Locate the bundled template

The starter template is bundled inside this plugin at `<plugin-root>/template/`. Locate it:

```bash
TEMPLATE_DIR=$(find ~/.claude/plugins/cache -path "*/agent-ks/*/template" -type d 2>/dev/null | sort -V | tail -1)
echo "Template: $TEMPLATE_DIR"
test -d "$TEMPLATE_DIR/config" || { echo "ERROR: bundled template not found"; exit 1; }
```

If not found, tell the user the plugin install is broken and they should `/plugin update agent-ks@sids-plugin-marketplace && /reload-plugins`.

## Step 3 — Ask: scope

Ask:
> Will this entire repo be the docs site, or should the docs live in a subfolder?
>
> 1. **Whole repo** — initialise at the current directory (`<cwd>`)
> 2. **Subfolder** (recommended for projects that already have source code) — pick a folder name (default: `docs`)

Capture:
- "whole repo" → `chosen_root="."`
- "subfolder" → ask for name (default `docs`); create the folder if missing → `chosen_root="./<name>"`

Print the resolved absolute path (`realpath "$chosen_root"`) for confirmation before writing anything.

## Step 4 — Ask: site identity

Ask three short questions in one message — the user can answer all at once:

1. **Site name** — short label shown in the navbar (e.g. "Acme Docs"). Default: the basename of `chosen_root`.
2. **Site title** — full title used in `<title>` tags. Default: same as site name.
3. **Description** — one-sentence tagline. Default: "Documentation built with agent-knowledge-system".
4. **GitHub repo URL** (or `org/repo` shorthand) — used in footer + social links. Default: leave the placeholder `your-org/your-repo` (the user can edit `config/footer.yaml` later).

Bind these to shell vars:
```bash
SITE_NAME="..."
SITE_TITLE="..."
DESCRIPTION="..."
REPO_URL="..."        # full URL, e.g. https://github.com/acme/docs
```

## Step 5 — Show the plan, confirm

Show:
```
Will copy template (5 sections — Home/Docs/Issues/Blog/User Guide) into <absolute-chosen-root>:

  config/site.yaml         (substitutions: name=<SITE_NAME>, title=<SITE_TITLE>, description=<DESCRIPTION>)
  config/navbar.yaml       (no substitution — uses <SITE_NAME> only via the rendered logo alt)
  config/footer.yaml       (substitutions: copyright=<SITE_NAME>, repo=<REPO_URL>)
  data/docs/               (one starter page under 05_getting-started/)
  data/blog/               (one welcome post)
  data/issues/             (empty tracker — vocabulary in settings.json)
  data/pages/home.yaml     (substitution: hero.title=<SITE_TITLE>)
  assets/                  (Astro placeholder logos — replace with your branding later)
  themes/                  (empty)
  .gitignore               (.env, .astro/, node_modules/, dist/)

Will patch CLAUDE.md at <chosen_root>/CLAUDE.md (created if absent).

Will print clone + .env setup instructions for the framework engine at the end
(the framework gets cloned INTO <chosen_root>/documentation-template/ as a subfolder).

Proceed?
```

## Step 6 — Copy + substitute

Run:

```bash
# Copy everything except the template's own README (it documents the template, not the user's project)
rsync -a --exclude='README.md' "$TEMPLATE_DIR/" "$chosen_root/"

# Substitute placeholders. Be precise — these strings appear in known files only.
# Use single-quoted sed expressions and pipe through xargs to handle absent files gracefully.

cd "$chosen_root"

# site.yaml — site.name + site.title + site.description + logo.alt
sed -i \
  -e "s|name: \"My Docs\"|name: \"$SITE_NAME\"|" \
  -e "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" \
  -e "s|description: \"Modern documentation built with Astro\"|description: \"$DESCRIPTION\"|" \
  -e "s|alt: \"My Docs\"|alt: \"$SITE_NAME\"|" \
  config/site.yaml

# footer.yaml — copyright + repo URLs
sed -i \
  -e "s|© {year} My Docs. All rights reserved.|© {year} $SITE_NAME. All rights reserved.|" \
  config/footer.yaml

if [ -n "$REPO_URL" ] && [ "$REPO_URL" != "https://github.com/your-org/your-repo" ]; then
  # escape forward slashes for sed
  REPO_ESCAPED=$(printf '%s\n' "$REPO_URL" | sed 's|[\&/]|\\&|g')
  sed -i "s|https://github.com/your-org/your-repo|$REPO_ESCAPED|g" config/footer.yaml
fi

# pages/home.yaml — hero.title
sed -i "s|title: \"My Documentation\"|title: \"$SITE_TITLE\"|" data/pages/home.yaml

cd - > /dev/null
```

**Important:** the `.env` file is **not** written here — it belongs inside the framework folder, which doesn't exist yet. It's created in step 8 after the user clones the framework.

## Step 7 — Patch CLAUDE.md

Open `$chosen_root/CLAUDE.md`. If absent, write the full template below. If present, append the **`## Documentation`** section (or merge intelligently if there's already such a section). Substitute `<SITE_NAME>`, `<DESCRIPTION>`, and `<chosen_root>` (use `.` if `chosen_root="."`).

The CLAUDE.md patch is the single most important post-init artifact — without it, future sessions don't know the docs layout, that the `agent-ks-docs` skill is installed, or how to build/run.

## Step 8 — Print summary + next steps

End with a concrete next-actions block:

```
✅ Created docs scaffold at <absolute-chosen-root>.

Next step — clone the framework alongside your content:

  cd <chosen_root>
  git clone https://github.com/sidhanthapoddar99/documentation-template.git
  cd documentation-template
  echo "CONFIG_DIR=../config" > .env
  ./start                  # preflight: pick bun (else npm) → install if needed → sanity build → dev

Open http://localhost:4321 — you should see "<SITE_NAME>" with five sections in the navbar
(Home / Docs / Issues / Blog / User Guide).

To customise:
  • Site identity     → config/site.yaml
  • Navbar / footer   → config/{navbar,footer}.yaml
  • Branding (logos)  → drop replacements into assets/, then update site.yaml → logo:
  • Add a section     → /docs-add-section
  • New theme         → themes/<name>/theme.yaml (extends: "@theme/default")

The User Guide section already points at the framework's bundled documentation
(@root/default-docs/data/user-guide) — you get the framework's own docs in your site
out of the box. To remove it, delete the `user-guide:` block from config/site.yaml's
pages: section and the matching entry in config/navbar.yaml.
```

---

# CLAUDE.md template (used in step 7 if file is absent)

````markdown
# <SITE_NAME>

<DESCRIPTION>

## Documentation

This project uses the **agent-knowledge-system** framework. The docs site lives at `<chosen_root>/`.

### Layout (consumer mode)

- **Content** — `<chosen_root>/data/` (docs, blog, issues, custom pages)
- **Config** — `<chosen_root>/config/{site,navbar,footer}.yaml`
- **Assets** — `<chosen_root>/assets/` (served at `/assets/`)
- **Themes** — `<chosen_root>/themes/` (custom themes; framework themes auto-available via `@root/default-docs/themes`)
- **Framework** — `<chosen_root>/documentation-template/` (cloned separately — don't edit, treat as a vendored dependency)

### Build commands

From `<chosen_root>/documentation-template/`:

```bash
./start            # preflight: pick bun (else npm) → install → sanity build → dev
./start dev        # skip preflight, dev only       → http://localhost:4321
./start build      # skip preflight, build only     → astro-doc-code/dist/
./start preview    # skip preflight, preview only
./start clean      # wipe .astro/, dist/, node_modules/.vite/
```

The framework reads `.env` from `documentation-template/.env`. Default for consumer mode: `CONFIG_DIR=../config` (points back up to `<chosen_root>/config/`).

### Tooling — `agent-ks` plugin

This project uses the `agent-ks` Claude Code plugin. It ships:

- **Skills (3)** — `agent-ks-docs` (docs/blog/config/writing; routes to domain-specific reference files), `agent-ks-issues` (issue tracker), `agent-ks-artifacts` (HTML artifacts); each triggers automatically on its domain
- **CLI on PATH** — one `agent-ks` entrypoint; every operation is `agent-ks <group> <verb>` (issue tracker: `agent-ks issue …`, validators: `agent-ks check …`, content: `agent-ks doc/blog …`, plus `find`, `move`, `img`). Discover with `agent-ks help`
- **Slash commands** — `/docs-init`, `/docs-add-section`

Install (per workstation, one-time):

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

### Adding content

- **New page in existing section** — create `data/<section>/<NN>_<slug>.md` with `title:` frontmatter. `NN_` is the next numeric prefix in the section (2–5 digits, sorted by value — generally 2-digit and gap-spaced).
- **New top-level section** — run `/docs-add-section` (creates `data/<name>/`, `settings.json`, starter page; optionally registers in `site.yaml`)
- **Validate before commit** — `agent-ks check config` and `agent-ks check section <chosen_root>/data/<section>` flag missing `settings.json`, missing frontmatter, prefix collisions
````

If `CLAUDE.md` already exists, append everything from `## Documentation` onward — don't overwrite the rest of the file.

---

# Tone & guardrails

- Ask one question at a time when you genuinely need user input; batch related questions where natural.
- Show the file plan before writing — never silently scaffold.
- If the user has chosen a non-default for any answer, restate it back so they can correct typos.
- After scaffolding, validate by running `agent-ks check config` (with the resolved `<chosen_root>/config` path passed explicitly, since `.env` doesn't exist yet) — it should exit clean. If it doesn't, fix the issue or report it.
- Do **not** clone the framework engine for the user (network operation, license/fork preference). Print the clone command in the summary instead.
- Do **not** write `.env` — it lives inside the framework folder which doesn't exist yet. The post-clone step creates it.
