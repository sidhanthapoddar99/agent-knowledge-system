---
title: Environment Variables
description: Configure environment variables for your site
sidebar_position: 2
---

# Environment Variables

Environment variables configure the bootstrap path and server settings. **`.env` lives inside the framework folder** (`agent-knowledge-system/.env`), not at your project root — it ships with the framework.

> **Note:** Directory paths for data, assets, and themes are configured in `site.yaml`'s `paths:` section, not in `.env`. Only `CONFIG_DIR` (and optionally `LAYOUT_EXT_DIR`) lives in `.env`. See [Site Configuration](./site) for details.

## Directory Paths

### Config Bootstrap

`CONFIG_DIR` tells the system where to find `site.yaml`. Its value depends on which mode you're in:

**Consumer mode** (the default — your content sits next to the framework folder):

```env
# Reaches UP from the framework folder to your project root, then into config/
CONFIG_DIR=../config
```

**Dogfood / framework-dev mode** (working *on the framework itself*, editing `default-docs/`):

```env
# Stays inside the framework folder, pointing at the bundled config
CONFIG_DIR=./default-docs/config
```

| Variable | Description |
|----------|-------------|
| `CONFIG_DIR` | Path to configuration directory. **Required.** Relative to `.env` (i.e. relative to the framework folder), or absolute. No default — the framework throws if missing. |

All other content directory paths (`data`, `assets`, `themes`) are defined in `site.yaml`'s `paths:` section.

> **Path relativity rule:** `CONFIG_DIR` in `.env` is relative to the **framework folder** (where `.env` lives — `agent-knowledge-system/`, **not** `astro-doc-code/` where `astro.config.mjs` sits). Paths in `site.yaml`'s `paths:` section are relative to the **config directory** (where `site.yaml` lives). Absolute paths work in both places. Internally the framework calls the parent of `astro-doc-code/` the *project root* — that's `agent-knowledge-system/` itself, NOT the consumer's outer project. The `@root` alias resolves to that project root, so `@root/default-docs/...` always reaches the framework's bundled content.

### External Layouts

Optionally, `LAYOUT_EXT_DIR` points to a directory of custom layout components that extend or override the built-in layouts:

```env
# Consumer mode — your layouts folder is sibling of the framework
LAYOUT_EXT_DIR=../layouts

# Dogfood mode — layouts shipped under default-docs/
# LAYOUT_EXT_DIR=./default-docs/layouts
```

| Variable | Description |
|----------|-------------|
| `LAYOUT_EXT_DIR` | Path to external layouts directory. **Optional** — when unset, only built-in layouts are available. Same relativity as `CONFIG_DIR` (relative to `.env` / framework folder, or absolute). |

When set, external layouts are merged with built-in layouts. If an external layout has the same style name as a built-in one, the external version takes priority. When not set, only built-in layouts are available (no overhead).

The external directory mirrors the `src/layouts/` structure:

```
<LAYOUT_EXT_DIR>/
├── docs/styles/<style>/Layout.astro
├── blogs/styles/<style>/IndexLayout.astro + PostLayout.astro
├── custom/styles/<style>/Layout.astro
├── navbar/<style>/index.astro
└── footer/<style>/index.astro
```

> **Important:** External `.astro` files must use Vite aliases for imports (e.g., `@layouts/`, `@loaders/`) instead of relative paths, since they live outside `src/`.

See [Layout System](/user-guide/layout-system/overview) for details on creating external layouts.

## Server Settings

Configure the development server:

```env
PORT=3088
HOST=true
```

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4321` | Port number for the dev server |
| `HOST` | `false` | Enable network access (`true` = listen on all interfaces, `false` = localhost only) |

### `PORT`

The port number for the development server:

```env
# Default Astro port
PORT=4321

# Custom port
PORT=3088
```

### `HOST`

Controls whether the server is accessible from other devices on the network:

```env
# Localhost only (default, more secure)
HOST=false

# Network access (accessible from other devices)
HOST=true
```

When `HOST=true`, the server binds to `0.0.0.0` allowing access from:
- Other devices on your local network
- Docker containers
- Virtual machines
- Remote tunneling services (ngrok, localtunnel)

**Security Note:** When enabling network access, consider using `server.allowedHosts` in `site.yaml` to restrict which hostnames can connect.

## Complete Example

**Consumer mode** (the default — content sits next to the framework folder):

```env
# ============================================
# DIRECTORY PATHS
# ============================================
# Bootstrap: relative to .env (the framework folder); ../config reaches your project root
CONFIG_DIR=../config

# Optional: External layout directory (mirrors astro-doc-code/src/layouts/ structure)
# LAYOUT_EXT_DIR=../layouts

# ============================================
# SERVER SETTINGS
# ============================================
PORT=3088
HOST=true
```

**Dogfood mode** (working *on* the framework — config lives inside the framework's bundled `default-docs/`):

```env
CONFIG_DIR=./default-docs/config
# LAYOUT_EXT_DIR=./default-docs/layouts
PORT=3088
HOST=true
```

## Best Practices

1. **Never commit secrets** — add `.env` to `.gitignore` (the framework folder's `.gitignore` already excludes it)
2. **Use `.env.example`** — the framework ships one as documentation
3. **Directory paths belong in `site.yaml`** — only `CONFIG_DIR` (and optionally `LAYOUT_EXT_DIR`) stays in `.env`
4. **Use absolute paths for external config** — when content lives somewhere unrelated to the framework folder
