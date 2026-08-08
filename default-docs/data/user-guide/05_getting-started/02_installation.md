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
├── config/                       # YOUR content (created in Step 3 or via /agent-ks-init)
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

The framework ships a `./start` wrapper at its root that handles dependency install and dev launch in one go.

```bash
cd agent-knowledge-system/
./start
```

The wrapper detects `bun` (falling back to `npm` if Bun isn't installed — with a red disk-usage warning and a confirm, since npm can't share packages across projects; see [Storage & Disk Footprint](07_storage-and-footprint.md)), runs `bun install` if `node_modules/` is missing or the manifests changed, then launches the dev server.

**It does not build.** Dev never reads `dist/`, so building before it was ~6 s and ~100 MB of writes for an answer you only need at publish time. Run [`./start doctor`](#available-commands) for that check instead.

It also looks upstream for updates and offers a fast-forward pull (`Y/n`) — at most once every 6 hours, so a command you type twenty times a day does not fetch twenty times. Tune with `START_UPDATE_INTERVAL_HOURS` (`0` = every run) or disable with `START_SKIP_UPDATE_CHECK=1` (useful in CI).

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
- 2 slash commands — `/agent-ks-init` to bootstrap a new project from zero, `/agent-ks-add-section` to add a top-level section to an existing one

For a fresh project that hasn't been scaffolded yet, the easiest entry point is to run `/agent-ks-init` after installing — it walks you through site name + first section and writes everything for you. Skip the rest of this Installation page if you go that route.

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

If you're working *on the framework itself* (editing the bundled `default-docs/`), switch to dogfood mode by changing `CONFIG_DIR` to `./default-docs/config`. See [Environment Variables](../10_configuration/02_env.md) for both modes.

Directory paths for content, assets, and themes are configured in `site.yaml`'s `paths:` section (see [Site Configuration](../10_configuration/03_site/01_overview.md)).

## Step 4: Start Development

From `agent-knowledge-system/`:

```bash
./start dev
```

Open `http://localhost:4321` in your browser (or whatever `PORT` you set in `.env` — this repo's bundled `.env.example` ships with `PORT=3088`, so the dogfood site runs there). `./start` with no args does exactly the same thing: the bare command *is* dev.

## Verifying Installation

You should see:
- Homepage with hero section
- Navigation with Docs and Blog links
- Sample documentation in the sidebar

## Available Commands

Run from inside `agent-knowledge-system/` via the `./start` wrapper:

| Command | Description |
|---------|-------------|
| `./start` | Dev server with hot reload. The default |
| `./start dev` | The same thing, spelled out |
| `./start build` | Build production site to `dist/` (wipes caches first; `--no-clean` keeps them) |
| `./start preview` | Preview production build locally |
| `./start doctor` | Update check + install + a full build — run before you publish |
| `./start clean` | Wipe `.astro/`, `dist/`, `node_modules/.vite/`, `node_modules/.astro/` |
| `./start clean <cmd>` | Wipe caches then forward — e.g. `./start clean build` |
| `./start <script>` | Forward any other `package.json` script |
| `./start stop` | Stop the running dev / preview server |
| `./start status` | Is a server running, and on which port |
| `./start logs` | Read a running server's output (`--follow` to stream) |
| `./start --help` | Every command and flag, authoritatively |

Add `--detach` to `dev` or `preview` to background the server instead of holding
the terminal. Without it, `Ctrl-C` stops the server.
| `./start logs` | Read a running server's output (`--follow` to stream) |

The dev server, build output, and preview all run inside `astro-doc-code/`. If you're already `cd`'d into that folder, the equivalent `bun run dev` / `bun run build` / `bun run preview` work as well.

### The three server verbs, and why they exist

`./start dev` occupies your terminal and `Ctrl-C` stops the server, exactly as you'd expect. Underneath, though, the server runs as a **detached background process** — Astro's own model — and the terminal is following its log stream. That means a server can outlive the terminal that started it: close the window mid-run, or lose an SSH session, and it is still there holding its port.

`./start status` finds it, `./start stop` stops it, and `./start logs` reads what it has been doing. Reach for those rather than hunting for a process id — the wrapper asks Astro through its lock file, which is right whatever happened to the terminal.

Two follow-ons worth knowing:

- **`./start dev` while a server is already running attaches to it** rather than starting a second one. `Ctrl-C` then detaches and leaves it running, and says so. You stop what you started.
- **`./start clean` stops a running server first.** The lock file lives in `.astro/`, which `clean` wipes; removing it under a live server would leave one nothing can find.

## Troubleshooting

### Port Already in Use

A second dev server **does not** pick a free port — Astro keeps one lock file per project, so starting another one reports the first one's URL and attaches to it instead. That is usually what you wanted; when it isn't, `./start status` tells you what is holding the port and `./start stop` releases it.

If something *other than Astro* owns the port, change `PORT` in `.env`.

### Module Not Found Errors

```bash
# From inside agent-knowledge-system/
rm -rf astro-doc-code/node_modules astro-doc-code/bun.lockb
./start          # reinstalls dependencies, then dev
```

### Stale build after changing `.env` or paths

```bash
./start clean    # wipes .astro/, dist/, node_modules/.vite/, node_modules/.astro/
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

Continue to [Configuration](../10_configuration/01_overview.md) to customize your site.
