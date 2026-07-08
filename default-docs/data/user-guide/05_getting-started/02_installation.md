---
title: Installation
description: Set up your documentation site
---

# Installation

Get your documentation site running in under 5 minutes.

## Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- **Git** for version control
- A code editor (VS Code recommended)

## Step 1: Clone the framework as a subfolder

The framework ships as a self-contained folder you drop *inside* your docs project. From your docs project root:

```bash
cd your-docs-folder/                                          # or wherever your docs live
git clone --depth 1 https://github.com/sidhanthapoddar99/agent-knowledge-system.git
```

Now your project looks like:

```
your-docs-folder/
├── config/                       # YOUR content (created in Step 3 or via /docs-init)
├── data/
├── assets/
├── themes/
└── agent-knowledge-system/       # the framework, just cloned
    ├── .env.example
    ├── start
    ├── astro-doc-code/
    ├── default-docs/             # framework-bundled docs/themes/template
    └── plugins/
```

If you'd rather track the framework as a submodule (so updates pull cleanly), substitute `git submodule add https://github.com/.../agent-knowledge-system.git` for the plain clone.

## Step 2: Install Dependencies

The framework ships a `./start` wrapper at its root that handles dependency install, build sanity check, and dev launch in one go.

```bash
cd agent-knowledge-system/
./start
```

The wrapper checks for upstream updates and offers a fast-forward pull (`Y/n`), detects `bun` (falling back to `npm` if Bun isn't installed — with a red disk-usage warning and a confirm, since npm can't share packages across projects; see [Storage & Disk Footprint](07_storage-and-footprint.md)), runs `bun install` if `node_modules/` is missing, runs a build sanity check, then launches the dev server. After the first run you can skip the preflight by passing the script name explicitly (see [Available Commands](#available-commands) below). The update check still runs for explicit-script forms; bypass it entirely with `START_SKIP_UPDATE_CHECK=1` (useful in CI).

If you'd rather drive `bun`/`npm` directly, `cd astro-doc-code/` first:

```bash
cd astro-doc-code
bun install     # or: npm install
```

### Claude Code Plugin (Recommended)

Install the `agent-ks` plugin (distributed via [`sids-plugin-marketplace`](https://github.com/sidhanthapoddar99/sids-plugin-marketplace)) so Claude Code can help you write content, configure the site, and run the issue tracker. Three commands:

```
/plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace
/plugin install agent-ks@sids-plugin-marketplace
/reload-plugins
```

This installs:

- 3 skills (`agent-ks-docs` / `agent-ks-issues` / `agent-ks-artifacts`) that trigger automatically on docs, tracker, and artifact work
- A single `agent-ks` CLI on `$PATH` — every operation is a `agent-ks <group> <verb>` subcommand (run `agent-ks help` to list them all)
- 2 slash commands — `/docs-init` to bootstrap a new project from zero, `/docs-add-section` to add a top-level section to an existing one

For a fresh project that hasn't been scaffolded yet, the easiest entry point is to run `/docs-init` after installing — it walks you through site name + first section and writes everything for you. Skip the rest of this Installation page if you go that route.

For full details (skill internals, wrapper inventory, update flow, scope behaviour), see [Claude Code Plugin](./05_claude-skills.md).

## Step 3: Environment Setup

From inside `agent-knowledge-system/`, create your `.env`:

```bash
cp .env.example .env
```

The default `.env` is configured for **consumer mode** — it expects your `config/`, `data/`, etc. to be one level up (siblings of the framework folder):

```env
# Reaches UP from this framework folder to YOUR project root
CONFIG_DIR=../config

# Dev server
PORT=3088
HOST=true
```

If you're working *on the framework itself* (editing the bundled `default-docs/`), switch to dogfood mode by changing `CONFIG_DIR` to `./default-docs/config`. See [Environment Variables](/user-guide/configuration/env) for both modes.

Directory paths for content, assets, and themes are configured in `site.yaml`'s `paths:` section (see [Site Configuration](/user-guide/configuration/site/overview)).

## Step 4: Start Development

From `agent-knowledge-system/`:

```bash
./start dev
```

Open `http://localhost:4321` in your browser (or whatever `PORT` you set in `.env` — this repo's bundled `.env.example` ships with `PORT=3088`, so the dogfood site runs there). `./start` with no args also works — it just runs the install-and-build preflight first.

## Verifying Installation

You should see:
- Homepage with hero section
- Navigation with Docs and Blog links
- Sample documentation in the sidebar

## Available Commands

Run from inside `agent-knowledge-system/` via the `./start` wrapper:

| Command | Description |
|---------|-------------|
| `./start` | Preflight (update check + install + build) then dev — use on a fresh clone |
| `./start dev` | Start dev server with hot reload (skip preflight) |
| `./start build` | Build production site to `dist/` (skip preflight) |
| `./start preview` | Preview production build locally (skip preflight) |
| `./start clean` | Wipe `.astro/`, `dist/`, `node_modules/.vite/` (run after changing `.env` or paths) |
| `./start clean <cmd>` | Wipe caches then forward — e.g. `./start clean build` |
| `./start <script>` | Forward any other `package.json` script |

The dev server, build output, and preview all run inside `astro-doc-code/`. If you're already `cd`'d into that folder, the equivalent `bun run dev` / `bun run build` / `bun run preview` work as well.

## Troubleshooting

### Port Already in Use

The server automatically finds an available port. Check terminal output for the actual URL.

### Module Not Found Errors

```bash
# From inside agent-knowledge-system/
rm -rf astro-doc-code/node_modules astro-doc-code/bun.lockb
./start          # re-runs preflight (install + build + dev)
```

### Stale build after changing `.env` or paths

```bash
./start clean    # wipes .astro/, dist/, node_modules/.vite/
./start          # then rebuild
```

Astro caches compiled routes by source path; when `CONFIG_DIR` or content paths move, stale cache entries can cause "Cannot find module" failures. `./start clean` is the cure.

### Build Fails

Common causes:
1. Missing `NN_` prefix on doc files (required)
2. Invalid YAML frontmatter
3. Missing `settings.json` in a doc folder

Check the error message for the specific file and line number.

## Next Steps

Continue to [Configuration](/user-guide/configuration/overview) to customize your site.
