// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { loadEnv } from 'vite';
import yaml from 'js-yaml';
import { devToolbarIntegration } from './src/dev-tools/integration.ts';
import { initPaths } from './src/loaders/paths.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Repo root is one level above astro-doc-code/. .env, default-docs/, and any
// relative paths in .env are interpreted from this root, regardless of cwd.
const repoRoot = path.resolve(__dirname, '..');

// Load environment variables from .env (lives at repo root)
const env = loadEnv(process.env.NODE_ENV || 'development', repoRoot, '');
const { PORT, HOST, CONFIG_DIR, LAYOUT_EXT_DIR } = env;

// Propagate to process.env so SSR/render contexts that load paths.ts
// independently (without going through initPaths()) read the same CONFIG_DIR
// the build is using. Without this, paths.ts's early fallback kicks in during
// SSR and navbar/footer/site.yaml get loaded from the wrong directory.
if (CONFIG_DIR) process.env.CONFIG_DIR = CONFIG_DIR;
if (LAYOUT_EXT_DIR) process.env.LAYOUT_EXT_DIR = LAYOUT_EXT_DIR;

// Load site config for server.allowedHosts and paths initialization

// CONFIG_DIR is required — it bootstraps the entire config system
if (!CONFIG_DIR) {
  throw new Error(
    '[config] CONFIG_DIR is not set in .env. This variable is required to locate site.yaml.\n' +
    '  Add to your .env file: CONFIG_DIR=./default-docs/config\n' +
    '  (relative to project root, or use an absolute path)'
  );
}

const resolvedConfigDir = path.resolve(repoRoot, CONFIG_DIR);

// External layouts directory — optional, mirrors src/layouts/ structure
const extLayoutsDir = LAYOUT_EXT_DIR
  ? path.resolve(repoRoot, LAYOUT_EXT_DIR)
  : path.resolve(__dirname, './src/layouts/_ext-stub');

if (LAYOUT_EXT_DIR && !fs.existsSync(extLayoutsDir)) {
  throw new Error(
    `[config] External layouts directory not found: ${extLayoutsDir}\n` +
    `  LAYOUT_EXT_DIR="${LAYOUT_EXT_DIR}" (from .env) resolved to this path.\n` +
    `  Create the directory or remove LAYOUT_EXT_DIR from .env.`
  );
}

if (!fs.existsSync(resolvedConfigDir)) {
  throw new Error(
    `[config] Config directory not found: ${resolvedConfigDir}\n` +
    `  CONFIG_DIR="${CONFIG_DIR}" (from .env) resolved to this path.\n` +
    `  Ensure the directory exists and contains site.yaml.`
  );
}

// Load site.yaml — required for paths and page definitions
const siteConfigPath = path.join(resolvedConfigDir, 'site.yaml');
if (!fs.existsSync(siteConfigPath)) {
  throw new Error(
    `[config] site.yaml not found at: ${siteConfigPath}\n` +
    `  CONFIG_DIR="${CONFIG_DIR}" (from .env) points to this directory.\n` +
    `  Ensure site.yaml exists in the config directory.`
  );
}

let siteConfig;
try {
  const content = fs.readFileSync(siteConfigPath, 'utf-8');
  siteConfig = yaml.load(content);
} catch (error) {
  throw new Error(
    `[config] Failed to parse site.yaml at: ${siteConfigPath}\n` +
    `  ${error.message}`
  );
}

// Initialize path system — pass resolvedConfigDir to fix timing gap where
// CONFIG_DIR from .env isn't available when paths.ts module first loads
initPaths({ paths: siteConfig?.paths, configDir: resolvedConfigDir });

// https://astro.build/config
// Server mode in dev (enables layout switcher), static in production (fast CDN builds)
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  output: isDev ? 'server' : 'static',
  server: {
    port: PORT ? parseInt(PORT, 10) : 4321,
    host: HOST === 'true' || HOST === '1',
    allowedHosts: siteConfig?.server?.allowedHosts ?? true,
  },
  integrations: [
    mdx(),
    devToolbarIntegration(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
  vite: {
    server: {
      // allowedHosts can be: array of hostnames, true (allow all), or undefined
      allowedHosts: siteConfig?.server?.allowedHosts ?? true,
      fs: {
        // Allow the whole repo root so vite can serve files from default-docs/
        // (which lives outside astro-doc-code/).
        allow: [
          repoRoot,
          ...(LAYOUT_EXT_DIR ? [extLayoutsDir] : []),
        ],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@loaders': path.resolve(__dirname, './src/loaders'),
        '@parsers': path.resolve(__dirname, './src/parsers'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@modules': path.resolve(__dirname, './src/modules'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@ext-layouts': extLayoutsDir,
      },
    },
  },
});
