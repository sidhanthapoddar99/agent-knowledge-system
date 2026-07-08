/**
 * Shared environment helpers for plugin scripts.
 *
 * Scripts must NOT hardcode content-folder names. They derive everything
 * from the framework's `.env` (the same file astro.config.mjs reads),
 * so the layout works in both modes without per-script defaults:
 *
 *   • Consumer mode (default): .env inside the framework subfolder of the
 *     user's project, CONFIG_DIR=../config → content root = the user's docs folder
 *
 *   • Dogfood / framework-dev mode: .env at the framework repo root,
 *     CONFIG_DIR=./default-docs/config → content root = ./default-docs
 *
 * Resolution order:
 *   1. DOCS_PROJECT_ROOT env var (explicit override) — used as-is
 *   2. Walk up from the script (and from cwd) looking for `.env`,
 *      then read CONFIG_DIR from it. content root = parent of resolved CONFIG_DIR.
 *   3. Downward probe from cwd at the consumer-mode convention spots
 *      (<cwd>/docs/agent-knowledge-system/.env, <cwd>/agent-knowledge-system/.env (+ legacy documentation-template spots))
 *      — covers running from a consumer repo root, where the framework folder
 *      (and its .env) lives *below* cwd and the upward walk can never see it.
 *
 * If no step produces a usable content root, throw a clear error
 * — no silent fallback to a hardcoded folder name.
 */

import fs from 'node:fs';
import path from 'node:path';

/** Walk up from startDir looking for a `.env` file; return its absolute path or null. */
export function findEnvFile(startDir) {
  let dir = path.resolve(startDir);
  while (dir !== path.dirname(dir)) {
    const p = path.join(dir, '.env');
    if (fs.existsSync(p)) return p;
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Probe the consumer-mode convention spots *below* cwd for the framework's
 * `.env`. The upward walk can't find it when the framework is vendored as a
 * subfolder of the consumer's repo (the default consumer layout).
 */
export function findEnvConsumerConvention(cwd) {
  const spots = [
    path.join('docs', 'agent-knowledge-system'),
    'agent-knowledge-system',
    // legacy clone-dir name — consumers who vendored before the rebrand
    path.join('docs', 'documentation-template'),
    'documentation-template',
  ];
  for (const spot of spots) {
    const p = path.join(path.resolve(cwd), spot, '.env');
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Tiny dotenv parser — supports KEY=value, ignores blank lines and `#` comments. */
export function loadDotEnv(envPath) {
  const content = fs.readFileSync(envPath, 'utf-8');
  const out = {};
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    // Last-wins (matches dotenv semantics)
    out[key] = value;
  }
  return out;
}

/**
 * Resolve the project context (where the user's content lives) by reading `.env`.
 * Returns `{ envPath, envDir, configDir, contentRoot }`.
 * Throws with a clear message if `.env` or `CONFIG_DIR` can't be found.
 *
 * `searchStart` is where to start walking up for `.env` (defaults to script's dir
 * via the caller passing import.meta.url's dirname, then falling back to cwd).
 */
export function resolveProjectContext(searchStart) {
  // 1. Explicit override — DOCS_PROJECT_ROOT skips .env entirely
  if (process.env.DOCS_PROJECT_ROOT) {
    const contentRoot = path.resolve(process.env.DOCS_PROJECT_ROOT);
    return { envPath: null, envDir: null, configDir: null, contentRoot };
  }

  // 2. Walk up from script dir, then from cwd
  // 3. Downward probe at the consumer-mode convention spots under cwd
  const envPath =
    findEnvFile(searchStart) ||
    findEnvFile(process.cwd()) ||
    findEnvConsumerConvention(process.cwd());
  if (!envPath) {
    throw new Error(
      'No .env found walking up from script or cwd, nor at the consumer-mode\n' +
  '  convention spots (<cwd>/docs/agent-knowledge-system/.env, <cwd>/agent-knowledge-system/.env,\n' +
  '  or the legacy documentation-template equivalents).\n' +
      '  Set DOCS_PROJECT_ROOT or pass --tracker / a positional path explicitly.\n' +
      '  Plugin scripts read CONFIG_DIR from the framework\'s .env to derive the content root —\n' +
      '  no hardcoded folder names.'
    );
  }

  const env = loadDotEnv(envPath);
  if (!env.CONFIG_DIR) {
    throw new Error(
      `CONFIG_DIR not set in ${envPath}.\n` +
      '  Add CONFIG_DIR=<relative-to-env-or-absolute>/config (e.g. ../config for consumer mode, ./default-docs/config for dogfood).'
    );
  }

  const envDir = path.dirname(envPath);
  const configDir = path.resolve(envDir, env.CONFIG_DIR);
  // Content root = parent of config dir (the convention is that data/ is a sibling
  // of config/ — same default the template ships with). Override with
  // DOCS_PROJECT_ROOT or pass explicit paths to scripts if that doesn't fit.
  const contentRoot = path.dirname(configDir);

  return { envPath, envDir, configDir, contentRoot };
}
