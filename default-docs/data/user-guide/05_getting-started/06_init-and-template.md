---
title: Init and the Starter Template
description: How `/docs-init` scaffolds a new project from the bundled starter template — what gets copied, what gets substituted, what to do next.
---

# Init and the Starter Template

The `/docs-init` slash command (shipped by the `agent-ks` plugin) bootstraps a new docs project by copying a **bundled starter template** into your chosen directory and substituting your site name / description / repo URL into the copied files.

The result is a working five-section site (Home / Docs / Issues / Blog / User Guide) you can immediately `./start dev` and customise from there.

## What ships in the template

The template lives **inside the plugin** at `<plugin-install>/template/` (where `<plugin-install>` is `~/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/<version>/`). It does **not** live in the framework's source tree — the plugin is the single distribution point for the starter template, decoupled from any framework clone. The bundle:

```
template/
├── .env.example                 # CONFIG_DIR=./config (replaced post-clone)
├── .gitignore                   # .env, .astro/, node_modules/, dist/
├── README.md                    # describes the template (not copied to user)
├── config/
│   ├── site.yaml                # 5 page entries, theme=default, default-docs alias
│   ├── navbar.yaml              # 5 nav items
│   └── footer.yaml              # 3 columns + GitHub social link
├── data/
│   ├── docs/                    # one starter page under 05_getting-started/
│   ├── blog/                    # one welcome post
│   ├── issues/                  # empty tracker (vocabulary in settings.json)
│   └── pages/
│       └── home.yaml            # hero + 6 feature cards
├── assets/                      # Astro placeholder logos (replaceable)
└── themes/                      # empty — for your custom themes
```

The five sections are pre-wired:

| Section    | URL          | Source                                 |
|------------|--------------|----------------------------------------|
| Home       | `/`          | `data/pages/home.yaml`                 |
| Docs       | `/docs`      | `data/docs/**`                         |
| Issues     | `/issues`    | `data/issues/**`                       |
| Blog       | `/blog`      | `data/blog/**`                         |
| User Guide | `/user-guide`| `@root/default-docs/data/user-guide/**`|

The **User Guide** section points at the framework's bundled docs (the page you're reading right now). You get the framework's own user-guide alongside your content out of the box. Drop the `user-guide:` block from `config/site.yaml` and the matching navbar entry to remove it later.

## What `/docs-init` does

```
/docs-init
```

Walks you through five short questions (the last is optional) then copies + substitutes the template:

1. **Scope** — whole repo (init at current directory) or subfolder (default name: `docs`)
2. **Site name** — short label for the navbar (e.g. "Acme Docs")
3. **Site title** — full `<title>` string (defaults to site name)
4. **Description** — one-sentence tagline
5. **Repo URL** *(optional)* — `https://github.com/org/repo` (used in footer + social links; skip to leave the placeholder)

Then it:

1. **Locates the bundled template** in your plugin install (`~/.claude/plugins/cache/.../agent-ks/<version>/template/`)
2. **Copies** everything into your chosen root (excluding the template's own `README.md`)
3. **Substitutes placeholders** — `My Docs` → your site name, `My Documentation` → your title, `Modern documentation built with Astro` → your description, `your-org/your-repo` → your repo URL
4. **Patches `CLAUDE.md`** at your project root so future Claude Code sessions know the layout, the active skill, and the build commands
5. **Prints the framework-clone command** — init does NOT clone the framework for you (network operation, license/fork preference)

## What `/docs-init` deliberately doesn't do

- **Doesn't clone the framework.** Cloning is a network operation with a fork/license decision the user owns. Init prints the exact clone command at the end.
- **Doesn't write `.env`.** `.env` lives inside the framework folder which doesn't exist yet. The post-clone step creates it (`echo "CONFIG_DIR=../config" > .env`).
- **Doesn't write any framework files** (`astro-doc-code/`, `default-docs/`, `start`, etc.). Those arrive with the framework clone.
- **Doesn't replace your existing files.** Pre-flight aborts if `./config/site.yaml` or `./agent-knowledge-system/` already exists.

## The complete first-time flow

```bash
# 0. One-time per workstation: install the plugin
#    (from any Claude Code session)
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins

# 1. Scaffold your content folders
cd <your-project>
/docs-init                                 # answer prompts; gets you config/, data/, assets/, themes/

# 2. Clone the framework as a sibling
git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git
cd agent-knowledge-system

# 3. Wire .env to point at your content
echo "CONFIG_DIR=../config" > .env

# 4. Run
./start                                    # preflight: bun (else npm) → install → sanity build → dev
```

After step 4, the site is live at `http://localhost:4321` showing your customised "My Docs" homepage.

## Manual scaffold (without `/docs-init`)

If you'd rather not run the slash command — for example, you're scripting the install or want to inspect the template before copying — the bundle is at `<plugin-install>/template/`. You still need the plugin marketplace added (the marketplace add is what installs the bundle to disk), but you can skip the slash command and copy by hand:

```bash
# 0. (One-time) Install the plugin so its files land in the cache.
#    From a Claude Code session:
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins

# 1. Find the bundle on disk.
TEMPLATE=$(find ~/.claude/plugins/cache -path "*/agent-ks/*/template" -type d | sort -V | tail -1)
echo "$TEMPLATE"

# 2. Copy the bundle UP to your project root (excluding the template's own README).
cd <your-project>
rsync -a --exclude='README.md' "$TEMPLATE/" ./

# 3. Substitute the four placeholders (search for "My Docs", "My Documentation",
#    "Modern documentation built with Astro", "your-org/your-repo" across config/ and data/pages/).

# 4. Clone the framework as a sibling and wire .env.
git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git
echo "CONFIG_DIR=../config" > agent-knowledge-system/.env

# 5. Run.
cd agent-knowledge-system
./start
```

The `/docs-init` flow automates steps 1–3 and adds the `CLAUDE.md` patch.

> **Why the template lives in the plugin and not in the framework clone:** the plugin is the canonical distribution point for new-project tooling. Keeping it there avoids two copies drifting and means `/docs-init` works without any framework clone on disk. The framework clone (`agent-knowledge-system/`) is what your *running* docs site needs; the plugin is what your *first-time setup* needs.

## What gets substituted

The init command uses targeted `sed` replacements against four known placeholder strings — it doesn't use a templating language. The substitutions:

| Placeholder string                              | Replaced with         | Lives in                                                      |
|-------------------------------------------------|-----------------------|---------------------------------------------------------------|
| `My Docs`                                       | site name             | `config/site.yaml` (site.name + logo.alt), `config/footer.yaml` (copyright) |
| `My Documentation`                              | site title            | `config/site.yaml` (site.title), `data/pages/home.yaml` (hero.title) |
| `Modern documentation built with Astro`         | description           | `config/site.yaml` (site.description)                        |
| `your-org/your-repo`                            | repo path             | `config/footer.yaml` (Project column link + social GitHub)   |

That's it — no other strings are touched. You can re-run substitutions later by editing those files directly.

## Customising after init

The template is the **starting point**, not the final shape. Common follow-ups:

- **Replace the Astro placeholder logos** — swap files in `assets/` and update `config/site.yaml → logo:` paths
- **Change the theme** — set `theme: "<name>"` in `site.yaml`; framework themes (`full-width`, `minimal`) are already in the scan path via `@root/default-docs/themes`
- **Add another section** — `/docs-add-section` (or hand-roll: see [Data Structure](./04_data-structure))
- **Drop a section you don't need** — remove the `pages:` entry in `site.yaml` and the navbar item; delete the `data/<section>/` folder
- **Hide the framework's User Guide** — drop the `user-guide:` block from `config/site.yaml → pages:` and the matching `navbar.yaml` entry

## See also

- [Installation](./02_installation.md) — full install walkthrough including the manual route
- [Data Structure](./04_data-structure) — what each top-level folder is for
- [Path Aliases](./03_aliases.md) — how `@root` and the user-defined aliases interact
