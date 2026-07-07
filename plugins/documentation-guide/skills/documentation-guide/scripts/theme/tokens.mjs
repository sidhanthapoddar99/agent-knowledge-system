#!/usr/bin/env bun
/**
 * theme/tokens.mjs — resolve the active (or a named) theme and print its CSS
 * custom properties as a variable→value map for LIGHT and DARK.
 *
 * Mirrors the engine's theme resolution (astro-doc-code/src/loaders/theme.ts):
 *   site.yaml `theme:` name → `theme_paths` scan → `extends` inheritance
 *   → CSS file merge (merge / override / replace) → parse `:root` (light) and
 *   `[data-theme="dark"]` (dark) blocks → resolve `var()` references.
 *
 * Why a CLI verb: the variable *names* are a documented contract (theme.yaml's
 * `required_variables`, and the artifact-authoring skill's inline list). The
 * *values*, though, need the active theme resolved — non-trivial. A `site`-mode
 * artifact consumes the injected variables; this verb hands an agent the live
 * values to validate a chart palette against the real surfaces in both modes.
 *
 * Usage: docs-guide theme tokens [theme-name] [--json]
 *   no name → the active theme from site.yaml
 *   name    → "default" (built-in) or a user theme found on `theme_paths`
 *   --json  → { theme:{name,path,active}, light:{var:val,…}, dark:{var:val,…} }
 *
 * Exit: 0 ok · 1 error (no .env / theme not found / no styles dir) · 2 usage.
 * (`--help`/`-h` are handled centrally by the dispatcher from the manifest.)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import { parseArgs, emitJson, die, writeStdout } from '../_cli.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));
const JSON_OUT = !!args.flags.json;
const NAME_ARG = args._[0]; // optional explicit theme name

// ---- project context -------------------------------------------------------
const ctx = resolveProjectContext(SCRIPT_DIR);
if (!ctx.configDir || !ctx.envDir) {
  die(
    'theme tokens: needs the framework .env (to find site.yaml + the built-in\n' +
      '  default theme under astro-doc-code/src/styles). Run from the project, or\n' +
      '  set CONFIG_DIR. DOCS_PROJECT_ROOT alone is not enough for theme resolution.',
    1,
  );
}
const CONFIG_DIR = ctx.configDir;
const BUILTIN_STYLES = path.join(ctx.envDir, 'astro-doc-code', 'src', 'styles');
const SITE_YAML = path.join(CONFIG_DIR, 'site.yaml');
if (!fs.existsSync(SITE_YAML)) die(`theme tokens: site.yaml not found at ${SITE_YAML}`, 1);
const siteText = read(SITE_YAML);

// site.yaml pieces we need: the active theme name, theme_paths, and paths aliases.
const ACTIVE_NAME = scalar(siteText, 'theme');
const THEME_PATHS = list(siteText, 'theme_paths');
const ALIASES = aliasMap(siteText);

// ---- resolve the target theme ----------------------------------------------
const targetName = NAME_ARG || ACTIVE_NAME;
if (!targetName) die('theme tokens: no `theme:` in site.yaml and no theme name given.', 1);

const themeDir = resolveThemeDir(targetName);
if (!themeDir) {
  die(
    `theme tokens: theme "${targetName}" not found. Searched theme_paths ` +
      `[${THEME_PATHS.join(', ') || 'none'}] + the built-in default.`,
    1,
  );
}
const manifest = loadManifest(themeDir);
const displayName = manifest?.name || targetName;

// ---- build merged CSS + parse tokens ---------------------------------------
let mergedCss;
try {
  mergedCss = buildCss(themeDir);
} catch (e) {
  die(`theme tokens: ${e.message}`, 1);
}

const { light, dark } = parseThemeVars(mergedCss);
const resolvedLight = resolveVars(light);
const resolvedDark = resolveVars(dark);

// ---- output -----------------------------------------------------------------
if (JSON_OUT) {
  emitJson({
    theme: {
      name: displayName,
      key: targetName,
      path: themeDir,
      active: !NAME_ARG || targetName === ACTIVE_NAME,
    },
    light: resolvedLight,
    dark: resolvedDark,
  });
  process.exit(0);
}

const clip = (s) => (s.length > 56 ? s.slice(0, 55) + '…' : s);
const keys = [...new Set([...Object.keys(resolvedLight), ...Object.keys(resolvedDark)])].sort();
const nameW = Math.max(8, ...keys.map((k) => k.length));
const lightW = Math.max(5, ...keys.map((k) => clip(resolvedLight[k] ?? '').length));
const out = [];
out.push(`Theme: ${displayName}  (${targetName === ACTIVE_NAME ? 'active' : 'named'})`);
out.push(`Path:  ${themeDir}`);
out.push(`Vars:  ${keys.length}  ·  light / dark (dark ‘·’ = inherits light)  ·  --json for full values`);
out.push('');
out.push(`${'VARIABLE'.padEnd(nameW)}  ${'LIGHT'.padEnd(lightW)}  DARK`);
for (const k of keys) {
  const l = resolvedLight[k] ?? '';
  const d = resolvedDark[k] ?? '';
  const darkCol = d === l ? '·' : clip(d);
  out.push(`${k.padEnd(nameW)}  ${clip(l).padEnd(lightW)}  ${darkCol}`);
}
writeStdout(out.join('\n') + '\n');
process.exit(0);

// ============================================================================
// helpers
// ============================================================================

function read(p) {
  return fs.readFileSync(p, 'utf-8');
}

/** First top-level `key: value` scalar (quotes/comments tolerated, indented keys ignored). */
function scalar(yaml, key) {
  const m = yaml.match(new RegExp(`^${key}\\s*:\\s*["']?([^"'#\\n]+?)["']?\\s*(?:#.*)?$`, 'm'));
  return m ? m[1].trim() : null;
}

/** A top-level YAML list: `key:` then `- item` lines up to the next top-level key. */
function list(yaml, key) {
  const header = yaml.match(new RegExp(`^${key}\\s*:\\s*$`, 'm'));
  if (!header) return [];
  let block = yaml.slice(header.index + header[0].length);
  const nextTop = block.search(/^[a-zA-Z]/m);
  if (nextTop !== -1) block = block.slice(0, nextTop);
  const out = [];
  for (const m of block.matchAll(/^\s*-\s*["']?([^"'#\n]+?)["']?\s*(?:#.*)?$/gm)) out.push(m[1].trim());
  return out;
}

/** The `paths:` block as name→value (for @alias resolution). */
function aliasMap(yaml) {
  const map = new Map();
  const header = yaml.match(/^paths\s*:\s*$/m);
  if (!header) return map;
  let block = yaml.slice(header.index + header[0].length);
  const nextTop = block.search(/^[a-zA-Z]/m);
  if (nextTop !== -1) block = block.slice(0, nextTop);
  for (const m of block.matchAll(/^\s+([a-zA-Z0-9_-]+):\s*"?([^"\n#]+?)"?\s*(?:#.*)?$/gm)) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

/** Resolve `@alias/rest` (or a plain path) to an absolute path against CONFIG_DIR. */
function resolveAlias(ref) {
  const m = ref.match(/^@([\w-]+)\/?(.*)$/);
  if (!m) return path.isAbsolute(ref) ? ref : path.resolve(CONFIG_DIR, ref);
  const [, alias, rest] = m;
  const val = ALIASES.get(alias);
  if (!val) return null;
  return path.resolve(CONFIG_DIR, val, rest);
}

/** Absolute dir of a theme by name / `@theme/<name>` / `@alias` / path. */
function resolveThemeDir(ref) {
  if (!ref) return null;
  let name = ref;
  if (name === 'default' || name === '@theme/default') return BUILTIN_STYLES;
  if (name.startsWith('@theme/')) name = name.slice('@theme/'.length);
  if (name === 'default') return BUILTIN_STYLES;
  if (name.startsWith('@')) {
    const r = resolveAlias(name);
    return r && hasTheme(r) ? r : null;
  }
  if (path.isAbsolute(name)) return hasTheme(name) ? name : null;
  for (const tp of THEME_PATHS) {
    const dir = resolveAlias(tp);
    if (!dir) continue;
    const cand = path.join(dir, name);
    if (hasTheme(cand)) return cand;
  }
  return null;
}

function hasTheme(dir) {
  return fs.existsSync(path.join(dir, 'theme.yaml'));
}

/** Parse a theme.yaml enough to merge it: name, extends, override_mode, css files. */
function loadManifest(themeDir) {
  const p = path.join(themeDir, 'theme.yaml');
  if (!fs.existsSync(p)) return null;
  const y = read(p);
  const rawExtends = scalar(y, 'extends');
  const ext = !rawExtends || rawExtends === 'null' || rawExtends === '~' ? null : rawExtends;
  return {
    name: scalar(y, 'name'),
    extends: ext,
    override_mode: scalar(y, 'override_mode') || 'merge',
    files: list(y, 'files').filter((f) => f.endsWith('.css')),
  };
}

/** Concatenate a theme's CSS, resolving `extends` — mirrors getThemeCSS's 3 modes. */
function buildCss(themeDir, skipFiles = new Set()) {
  const man = loadManifest(themeDir);
  if (!man) throw new Error(`theme.yaml not found/invalid in ${themeDir}`);
  let css = '';
  if (man.extends) {
    const parentDir = resolveThemeDir(man.extends);
    if (!parentDir) throw new Error(`extends target not found: ${man.extends}`);
    if (man.override_mode === 'replace') {
      // standalone child — skip the parent entirely
    } else if (man.override_mode === 'override') {
      css += buildCss(parentDir, new Set([...skipFiles, ...man.files]));
    } else {
      css += buildCss(parentDir, skipFiles);
    }
  }
  for (const f of man.files) {
    if (skipFiles.has(f)) continue;
    const fp = path.join(themeDir, f);
    if (fs.existsSync(fp)) css += '\n' + read(fp);
  }
  return css;
}

/** Extract the light map (`:root`) and the dark map (light + `[data-theme=dark]` overrides). */
function parseThemeVars(css) {
  // Declared inside the fn (not module scope) so they exist before the top-level
  // call site runs — `const` has no hoisting / lives in a temporal dead zone.
  const LIGHT_SEL = [':root', ':root[data-theme="light"]', '[data-theme="light"]', ":root[data-theme='light']"];
  const DARK_SEL = ['[data-theme="dark"]', ':root[data-theme="dark"]', "[data-theme='dark']", ":root[data-theme='dark']"];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const light = {};
  const darkOver = {};
  for (const { sel, body } of topLevelRules(clean)) {
    const parts = sel.split(',').map((s) => s.trim());
    if (parts.some((s) => LIGHT_SEL.includes(s))) Object.assign(light, varsFrom(body));
    else if (parts.some((s) => DARK_SEL.includes(s))) Object.assign(darkOver, varsFrom(body));
  }
  return { light, dark: { ...light, ...darkOver } };
}

/** Yield every depth-0 `selector { body }` rule; at-rules (@media …) are yielded whole, not recursed. */
function* topLevelRules(css) {
  const n = css.length;
  let i = 0;
  let selStart = 0;
  while (i < n) {
    const c = css[i];
    if (c === '{') {
      const sel = css.slice(selStart, i).trim();
      let j = i + 1;
      let depth = 1;
      while (j < n && depth > 0) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      yield { sel, body: css.slice(i + 1, j - 1) };
      i = j;
      selStart = i;
      continue;
    }
    if (c === '}') {
      selStart = i + 1;
    }
    i++;
  }
}

/** `--name: value;` declarations from a rule body → object. */
function varsFrom(body) {
  const map = {};
  for (const m of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)/g)) map[m[1]] = m[2].trim();
  return map;
}

/** Resolve `var(--x[, fallback])` references within a single mode's map. */
function resolveVars(map) {
  const out = {};
  const expand = (value, depth) =>
    depth > 24
      ? value
      : value.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)/g, (m, ref, fb) => {
          if (map[ref] !== undefined) return expand(map[ref], depth + 1);
          if (fb !== undefined) return expand(fb.trim(), depth + 1);
          return m;
        });
  for (const k of Object.keys(map)) out[k] = expand(map[k], 0);
  return out;
}
