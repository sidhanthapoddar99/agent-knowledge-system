#!/usr/bin/env bun
/**
 * config/check.mjs — validate site/navbar/footer YAML configs.
 *
 * Uses presence-checks (regex over the YAML text) — no YAML library dep.
 * Catches the common mistakes; for deep schema validation, run the dev
 * server and check its startup warnings.
 *
 * Checks:
 *   • All three files exist (site.yaml required, navbar/footer warned)
 *   • site.yaml has required top-level keys (site, paths, theme, pages)
 *   • Each page entry has required fields (base_url, type, layout, data)
 *   • Each page's `data:` path resolves on disk (after @alias substitution)
 *   • footer.yaml `page:` references resolve to a registered page
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import { reportAndExit } from '../_check-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.error('Usage: docs-guide check config [config-dir]\n');
  console.error('  When [config-dir] is omitted, uses CONFIG_DIR from the framework\'s .env (resolved absolute).\n');
  console.error('  Validates: required keys · pages structure · data: path resolution · footer page: refs');
  process.exit(0);
}

const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));

let ROOT;
if (POSITIONAL) {
  ROOT = POSITIONAL;
} else {
  // Derive from .env — config dir is exactly CONFIG_DIR
  const ctx = resolveProjectContext(SCRIPT_DIR);
  ROOT = ctx.configDir;
}

const SITE = path.join(ROOT, 'site.yaml');
const NAVBAR = path.join(ROOT, 'navbar.yaml');
const FOOTER = path.join(ROOT, 'footer.yaml');

const errors = [];
const warnings = [];

if (!fs.existsSync(SITE)) {
  errors.push(`Missing required: ${SITE}`);
  reportAndExit({ kind: 'config', root: ROOT, errors, warnings, json: JSON_OUT });
}
if (!fs.existsSync(NAVBAR)) warnings.push(`Missing: ${NAVBAR}`);
if (!fs.existsSync(FOOTER)) warnings.push(`Missing: ${FOOTER}`);

const siteContent = fs.readFileSync(SITE, 'utf-8');

// Required top-level keys
for (const key of ['site', 'paths', 'theme', 'pages']) {
  if (!new RegExp(`^${key}\\s*:`, 'm').test(siteContent)) {
    errors.push(`site.yaml: missing required top-level key \`${key}\``);
  }
}

// Extract paths block (for @alias resolution later)
const aliases = extractAliases(siteContent);

// Extract pages and validate each
const pageEntries = extractPages(siteContent);
if (pageEntries.size === 0) {
  warnings.push('site.yaml pages: no entries found (parser may have missed them)');
}
for (const [name, entry] of pageEntries) {
  for (const required of ['base_url', 'type', 'layout', 'data']) {
    if (!entry[required]) {
      errors.push(`site.yaml pages.${name}: missing \`${required}\``);
    }
  }
  if (entry.type && !['docs', 'blog', 'issues', 'custom'].includes(entry.type)) {
    errors.push(`site.yaml pages.${name}.type: \`${entry.type}\` is not docs|blog|issues|custom`);
  }
  if (entry.data) {
    const resolved = resolveAlias(entry.data, aliases, ROOT);
    if (resolved && !fs.existsSync(resolved)) {
      errors.push(`site.yaml pages.${name}.data: resolved path does not exist (${entry.data} → ${resolved})`);
    }
  }
}

// navbar — quick sanity
if (fs.existsSync(NAVBAR)) {
  const navContent = fs.readFileSync(NAVBAR, 'utf-8');
  const labels = (navContent.match(/^\s*-\s*label:/gm) || []).length;
  const hrefs = (navContent.match(/^\s+href:/gm) || []).length;
  if (labels === 0) warnings.push('navbar.yaml: no items found');
  if (labels !== hrefs) warnings.push(`navbar.yaml: ${labels} labels but ${hrefs} hrefs (possible orphan)`);
}

// footer — page: refs must resolve
if (fs.existsSync(FOOTER)) {
  const footContent = fs.readFileSync(FOOTER, 'utf-8');
  const pageNames = new Set([...pageEntries].map(([n]) => n));
  for (const m of footContent.matchAll(/^\s+page:\s*"?([a-zA-Z0-9_-]+)"?\s*$/gm)) {
    const ref = m[1];
    if (!pageNames.has(ref)) {
      errors.push(`footer.yaml: page reference \`${ref}\` not registered in site.yaml pages`);
    }
  }
}

reportAndExit({ kind: 'config', root: ROOT, errors, warnings, json: JSON_OUT });

// ---------- helpers ----------------------------------------------------------

/**
 * Extract a top-level YAML block by key. Returns the body text *after*
 * the `key:` line, up to either the next top-level key (line starting
 * with a letter at column 0) or end of string. JS regex has no `\Z`,
 * so we slice manually to handle the last-block-in-file case.
 */
function sliceTopLevelBlock(yaml, key) {
  const header = yaml.match(new RegExp(`^${key}\\s*:\\s*$`, 'm'));
  if (!header) return null;
  let block = yaml.slice(header.index + header[0].length);
  const nextTop = block.search(/^[a-zA-Z]/m);
  if (nextTop !== -1) block = block.slice(0, nextTop);
  return block;
}

function extractAliases(yaml) {
  const result = new Map();
  const block = sliceTopLevelBlock(yaml, 'paths');
  if (block === null) return result;
  for (const line of block.matchAll(/^\s+([a-zA-Z0-9_-]+):\s*"?([^"\n#]+?)"?\s*(?:#.*)?$/gm)) {
    result.set(line[1], line[2].trim());
  }
  return result;
}

function extractPages(yaml) {
  const result = new Map();
  const block = sliceTopLevelBlock(yaml, 'pages');
  if (block === null) return result;

  // Top-level page entries are 2-space indented `key:` lines
  const pageStarts = [...block.matchAll(/^  ([a-zA-Z0-9_-]+):\s*$/gm)];
  for (let i = 0; i < pageStarts.length; i++) {
    const start = pageStarts[i];
    const end = i + 1 < pageStarts.length ? pageStarts[i + 1].index : block.length;
    const name = start[1];
    const body = block.slice(start.index + start[0].length, end);
    const fields = {};
    for (const f of body.matchAll(/^\s+(\w+):\s*"?([^"\n#]+?)"?\s*(?:#.*)?$/gm)) {
      fields[f[1]] = f[2].trim();
    }
    result.set(name, fields);
  }
  return result;
}

function resolveAlias(p, aliases, configDir) {
  const m = p.match(/^@(\w+)\/?(.*)$/);
  if (!m) return path.isAbsolute(p) ? p : path.resolve(configDir, p);
  const [, alias, rest] = m;
  const aliasValue = aliases.get(alias);
  if (!aliasValue) return null;
  return path.resolve(configDir, aliasValue, rest);
}
