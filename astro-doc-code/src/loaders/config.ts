/**
 * Config Loader - Loads and validates YAML configuration files
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { paths, getConfigPath } from './paths';
import { resolveAssetUrl, resolveAliasPath } from './alias';
import { resolveThemeName } from './theme';
import { assertContentVersionSupported } from './engine-version';
import cacheManager from './cache-manager';

// ============================================
// Type Definitions
// ============================================

export interface SiteMetadata {
  name: string;
  title: string;
  description: string;
}

export interface LogoTheme {
  dark?: string;
  light?: string;
}

export interface SiteLogo {
  src?: string;
  alt?: string;
  theme?: LogoTheme;
  favicon?: string;
}

export type PageType = 'docs' | 'blog' | 'custom' | 'issues';

export interface PageConfig {
  base_url: string;
  type: PageType;
  layout: string;
  data: string;
}

export interface EditorSettings {
  autosave_interval: number;  // Auto-save interval in milliseconds
}

export interface SiteConfig {
  site: SiteMetadata;
  engine_version?: string;  // Engine version this content targets (N.N.N); missing → 0.0.0, gated on load
  theme?: string;  // Absolute path after loading (resolved from theme name like "default")
  theme_paths?: string[];  // Directories to scan for user themes (resolved to absolute paths)
  logo?: SiteLogo;
  editor: EditorSettings;  // Required — must be in site.yaml
  pages: Record<string, PageConfig>;
  paths?: Record<string, string>;  // Named directory paths → @key aliases
}

export interface NavItem {
  label: string;
  href?: string;
  items?: NavItem[];
}

export interface NavbarLogo {
  src?: string;
  alt?: string;
}

export interface NavbarConfig {
  layout?: string;  // Layout alias (e.g., "@navbar/default" or "@navbar/minimal")
  logo?: NavbarLogo;
  items: NavItem[];
}

export interface FooterLink {
  label: string;
  href?: string;
  page?: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  platform: string;
  href: string;
}

export interface FooterConfig {
  layout: string;
  copyright: string;
  columns?: FooterColumn[];
  social?: SocialLink[];
}

// ============================================
// Theme Paths State
// ============================================

/** Resolved absolute paths where user themes are stored */
let resolvedThemePaths: string[] = [];

/**
 * Get the resolved theme directory paths.
 * Returns [] if no theme_paths defined in site.yaml (only built-in default available).
 */
export function getThemePaths(): string[] {
  return resolvedThemePaths;
}

// ============================================
// Loader Functions
// ============================================

/**
 * Load a YAML file and parse it
 */
function loadYaml<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`Config file not found: ${filePath}`);
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content) as T;
  } catch (error) {
    console.error(`Error loading config file ${filePath}:`, error);
    return null;
  }
}

/**
 * Load site configuration
 */
export function loadSiteConfig(): SiteConfig {
  // Check cache first — HMR invalidates on config file changes
  const cached = cacheManager.getCached<{ config: SiteConfig; themePaths: string[] }>('config', 'site');
  if (cached) {
    // Restore side effect: resolvedThemePaths must be set for getThemePaths()
    resolvedThemePaths = cached.themePaths;
    return cached.config;
  }

  const config = loadYaml<SiteConfig>(getConfigPath('site.yaml'));

  if (!config) {
    // Return default config if file not found
    const defaults: SiteConfig = {
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
      },
      pages: {},
    };
    cacheManager.setCache('config', 'site', { config: defaults, themePaths: [] }, []);
    return defaults;
  }

  // Version gate: content outside this engine's supported range is a hard stop
  // (missing engine_version → 0.0.0). Runs before any resolution work so the
  // error is the first and only thing the user sees.
  assertContentVersionSupported(config.engine_version);

  // Resolve asset URLs in logo config
  if (config.logo) {
    config.logo = {
      ...config.logo,
      src: resolveAssetUrl(config.logo.src),
      favicon: resolveAssetUrl(config.logo.favicon),
      theme: config.logo.theme ? {
        dark: resolveAssetUrl(config.logo.theme.dark),
        light: resolveAssetUrl(config.logo.theme.light),
      } : undefined,
    };
  }

  // Resolve theme_paths to absolute paths BEFORE resolveThemeName(),
  // because resolveThemeName() calls getThemePaths() to scan for themes.
  if (config.theme_paths && config.theme_paths.length > 0) {
    config.theme_paths = config.theme_paths.map((entry) => {
      if (entry.startsWith('@')) {
        return resolveAliasPath(entry);
      }
      if (path.isAbsolute(entry)) {
        return entry;
      }
      return path.resolve(paths.config, entry);
    });
    resolvedThemePaths = config.theme_paths;
  } else {
    resolvedThemePaths = [];
  }

  // Resolve theme to absolute path
  if (config.theme) {
    config.theme = resolveThemeName(config.theme);
  }

  // Resolve page data paths to absolute paths
  if (config.pages) {
    for (const pageConfig of Object.values(config.pages)) {
      if (pageConfig.data && pageConfig.data.startsWith('@')) {
        pageConfig.data = resolveAliasPath(pageConfig.data);
      }
    }
  }

  // Cache with dependency on site.yaml (include resolvedThemePaths for side-effect replay)
  cacheManager.setCache('config', 'site', { config, themePaths: resolvedThemePaths }, [getConfigPath('site.yaml')]);

  return config;
}

/**
 * Get site logo configuration with resolved URLs
 */
export function getSiteLogo(): SiteLogo {
  const config = loadSiteConfig();
  return config.logo || { alt: 'Docs' };
}

/**
 * Get favicon URL from site config
 */
export function getFavicon(): string {
  const config = loadSiteConfig();
  return config.logo?.favicon || '/favicon.svg';
}

/**
 * Get theme reference from site config
 */
export function getTheme(): string {
  const config = loadSiteConfig();
  if (!config.theme) {
    throw new Error(
      `No "theme" field set in site.yaml. ` +
      `Please add a theme name, e.g.: theme: "default"`
    );
  }
  return config.theme;
}

/**
 * Get navbar layout from config (default: @navbar/style1)
 */
export function getNavbarLayout(): string {
  const config = loadNavbarConfig();
  return config.layout || '@navbar/default';
}

/**
 * Get footer layout from config (default: @footer/default)
 */
export function getFooterLayout(): string {
  const config = loadFooterConfig();
  return config.layout || '@footer/default';
}

/**
 * Load navbar configuration
 * Note: Logo configuration has moved to site.yaml - use getSiteLogo() instead
 */
export function loadNavbarConfig(): NavbarConfig {
  const cached = cacheManager.getCached<NavbarConfig>('config', 'navbar');
  if (cached) return cached;

  const config = loadYaml<NavbarConfig>(getConfigPath('navbar.yaml'));

  if (!config) {
    const defaults: NavbarConfig = { items: [] };
    cacheManager.setCache('config', 'navbar', defaults, []);
    return defaults;
  }

  cacheManager.setCache('config', 'navbar', config, [getConfigPath('navbar.yaml')]);
  return config;
}

/**
 * Load footer configuration
 */
export function loadFooterConfig(): FooterConfig {
  const cached = cacheManager.getCached<FooterConfig>('config', 'footer');
  if (cached) return cached;

  const config = loadYaml<FooterConfig>(getConfigPath('footer.yaml'));

  if (!config) {
    const defaults: FooterConfig = {
      layout: '@footer/default',
      copyright: '© {year} All rights reserved.',
      columns: [],
      social: [],
    };
    cacheManager.setCache('config', 'footer', defaults, []);
    return defaults;
  }

  cacheManager.setCache('config', 'footer', config, [getConfigPath('footer.yaml')]);
  return config;
}

/**
 * Get all page configurations
 */
export function getPages(): Record<string, PageConfig> {
  const config = loadSiteConfig();
  return config.pages || {};
}

/**
 * Get a specific page configuration by name
 */
export function getPage(pageName: string): PageConfig | undefined {
  const pages = getPages();
  return pages[pageName];
}

/**
 * Resolve page reference in navbar/footer links
 * Converts page name to actual URL
 */
export function resolvePageUrl(pageName: string): string {
  const page = getPage(pageName);
  if (!page) {
    console.warn(`Page not found: ${pageName}`);
    return '#';
  }
  return page.base_url;
}

/**
 * Process copyright string with dynamic year
 */
export function processCopyright(copyright: string): string {
  const year = new Date().getFullYear().toString();
  return copyright.replace('{year}', year);
}

/**
 * Validate route configuration (no overlapping routes except /)
 */
export function validateRoutes(pages: Record<string, PageConfig>): string[] {
  const errors: string[] = [];
  const routes = Object.entries(pages).map(([name, config]) => ({
    name,
    url: config.base_url,
  }));

  for (let i = 0; i < routes.length; i++) {
    for (let j = i + 1; j < routes.length; j++) {
      const routeA = routes[i];
      const routeB = routes[j];

      // Skip root route check
      if (routeA.url === '/' || routeB.url === '/') {
        continue;
      }

      // Check for overlapping routes
      if (
        routeA.url.startsWith(routeB.url + '/') ||
        routeB.url.startsWith(routeA.url + '/')
      ) {
        errors.push(
          `Overlapping routes: "${routeA.name}" (${routeA.url}) and "${routeB.name}" (${routeB.url})`
        );
      }
    }
  }

  return errors;
}

export default {
  loadSiteConfig,
  loadNavbarConfig,
  loadFooterConfig,
  getPages,
  getPage,
  getSiteLogo,
  getFavicon,
  getTheme,
  getNavbarLayout,
  getFooterLayout,
  resolvePageUrl,
  processCopyright,
  validateRoutes,
};
