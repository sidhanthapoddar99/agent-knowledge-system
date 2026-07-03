---
title: Reference
description: TypeScript interfaces, code usage, complete example, and default values for site.yaml
sidebar_label: Reference
---

# Reference

## TypeScript Interface

```typescript
interface SiteMetadata {
  name: string;
  title: string;
  description: string;
}

interface LogoTheme {
  dark?: string;
  light?: string;
}

interface SiteLogo {
  src?: string;
  alt?: string;
  theme?: LogoTheme;
  favicon?: string;
}

interface ServerConfig {
  allowedHosts?: true | string[];
}

interface PresenceSettings {
  ping_interval?: number;    // Client ping frequency (ms, default: 5000)
  stale_threshold?: number;  // Remove silent users after (ms, default: 30000)
  cursor_throttle?: number;  // Min interval between cursor sends (ms, default: 100)
  content_debounce?: number; // Debounce for raw text diff sync (ms, default: 150)
  render_interval?: number;  // Server render interval (ms, default: 5000)
  sse_keepalive?: number;    // SSE keepalive comment interval (ms, default: 15000)
  sse_reconnect?: number;    // SSE auto-reconnect delay (ms, default: 2000)
}

interface EditorSettings {
  autosave_interval: number;    // Auto-save interval in milliseconds
  presence?: PresenceSettings;  // Multi-user presence timing (optional)
}

interface SiteConfig {
  site: SiteMetadata;
  engine_version?: string;    // Engine version this content targets (N.N.N); missing → 0.0.0, gated on load
  paths?: Record<string, string>;   // Named directory paths → @key aliases
  server?: ServerConfig;      // Vite server configuration
  theme?: string;             // Theme name (e.g., "default", "minimal")
  theme_paths?: string[];     // Directories to scan for user themes
  logo?: SiteLogo;
  editor: EditorSettings;     // Required — must be in site.yaml
  pages: Record<string, PageConfig>;
}
```

## Loading in Code

```typescript
import { loadSiteConfig, getSiteLogo, getFavicon } from '@loaders/config';

// Get full site config
const config = loadSiteConfig();
const { name, title, description } = config.site;

// Get logo configuration
const logo = getSiteLogo();
// logo.src, logo.alt, logo.theme, logo.favicon

// Get favicon URL
const faviconUrl = getFavicon();
```

## Complete Example

```yaml
# site.yaml
site:
  name: "My Docs"
  title: "My Documentation"
  description: "Modern documentation built with Astro"

# Engine version this content targets — see Configuration → Versioning & Migrations
engine_version: "0.7.0"

# Directory paths (relative to this config directory, or absolute)
paths:
  data: "../data"
  assets: "../assets"
  themes: "../themes"

# Vite server configuration (optional)
server:
  allowedHosts: true  # or use array: [".localhost", "127.0.0.1"]

# Theme (optional - defaults to built-in "default")
theme: "default"
theme_paths:
  - "@themes"

logo:
  src: "@assets/astro.svg"
  alt: "My Docs"
  theme:
    dark: "astro.svg"
    light: "astro.svg"
  favicon: "@assets/astro.png"

# Editor configuration (required)
editor:
  autosave_interval: 10000  # 10 seconds
  presence:
    ping_interval: 5000
    stale_threshold: 30000
    cursor_throttle: 100
    content_debounce: 150
    render_interval: 5000
    sse_keepalive: 15000
    sse_reconnect: 2000

pages:
  docs:
    base_url: "/docs"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/final_docs"

  blog:
    base_url: "/blog"
    type: blog
    layout: "@blog/default"
    data: "@data/blog"

  issues:
    base_url: "/issues"
    type: issues
    layout: "@issues/default"
    data: "@data/issues"

  home:
    base_url: "/"
    type: custom
    layout: "@custom/home"
    data: "@data/pages/home.yaml"
```

## Default Values

If `site.yaml` is missing, defaults are used:

```typescript
{
  site: {
    name: 'Documentation',
    title: 'Documentation Site',
    description: 'Modern documentation built with Astro',
  },
  logo: {
    alt: 'Docs',
  },
  editor: {
    autosave_interval: 10000,
    presence: {
      ping_interval: 5000,
      stale_threshold: 30000,
      cursor_throttle: 100,
      content_debounce: 150,
      render_interval: 5000,
      sse_keepalive: 15000,
      sse_reconnect: 2000,
    },
  },
  pages: {},
}
```
