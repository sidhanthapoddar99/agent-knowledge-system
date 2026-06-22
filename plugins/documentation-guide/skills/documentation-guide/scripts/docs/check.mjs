#!/usr/bin/env bun
/**
 * docs/check.mjs — validate a docs section.
 *
 * Checks every folder + .md file inside a docs section follows the project
 * conventions documented in `references/layouts/docs-layout.md`:
 *
 *   • NN_ ordering prefix (2–5 digits) on folders (except `assets/`) and .md files (except README.md)
 *   • settings.json present in every folder
 *   • frontmatter `title:` present on every .md file
 *   • prefixes don't collide within a folder (compared by numeric value, so 02_ and 002_ clash)
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ORDER_PREFIX_FULL_RE, ANY_DIGIT_PREFIX_RE } from '../_order-prefix.mjs';
import { hasFrontmatterTitle, readText, readJsonChecked, reportAndExit } from '../_check-lib.mjs';

const ROOT = process.argv[2];

if (!ROOT || ROOT === '--help' || ROOT === '-h') {
  console.error('Usage: docs-check-section <section-folder>\n');
  console.error('  Example: docs-check-section ./data/user-guide  (or any docs section folder)\n');
  console.error('  Validates: NN_ prefix (2–5 digits) · settings.json presence · frontmatter title · prefix collisions');
  process.exit(ROOT ? 0 : 1);
}

if (!fs.existsSync(ROOT)) {
  console.error(`Not found: ${ROOT}`);
  process.exit(1);
}
if (!fs.statSync(ROOT).isDirectory()) {
  console.error(`Not a directory: ${ROOT}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
// Ordering-prefix grammar comes from the shared `_order-prefix.mjs` (docs use
// the strict `_` separator). ORDER_PREFIX_FULL_RE = /^(\d{2,5})_(.+)$/.
// Frontmatter `title:` test + read/report helpers come from `_check-lib.mjs`.

/**
 * Classify a folder/file name's ordering prefix.
 * → { value }       valid 2–5 digit prefix (numeric value, for collision keying)
 * → { badDigits }   a leading `<digits>_` of the wrong width (1, or 6+)
 * → {}              no leading-digit prefix at all
 */
function classifyPrefix(name) {
  const m = name.match(ORDER_PREFIX_FULL_RE);
  if (m) return { value: parseInt(m[1], 10), digits: m[1] };
  const bad = name.match(ANY_DIGIT_PREFIX_RE);
  return bad ? { badDigits: bad[1] } : {};
}

/** Record a prefix in `seen` (keyed by numeric value), pushing a collision error if dup. */
function recordPrefix(seen, value, label, relPath, errors) {
  if (seen.has(value)) {
    errors.push(`${relPath}: prefix value ${value} collides with ${seen.get(value)}`);
  } else {
    seen.set(value, label);
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const prefixes = new Map();        // for collision detection within this folder
  const rel = path.relative(ROOT, dir) || '.';

  // Every folder must have a settings.json (sidebar label) — and where one
  // exists, it must parse (presence ≠ valid JSON; a malformed one breaks the loader).
  const settingsPath = path.join(dir, 'settings.json');
  const hasSettings = fs.existsSync(settingsPath);
  if (dir !== ROOT && !hasSettings) {
    errors.push(`${rel}/settings.json: missing`);
  } else if (hasSettings) {
    readJsonChecked(settingsPath, `${rel === '.' ? 'settings.json' : `${rel}/settings.json`}`, errors);
  }

  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    const relPath = path.relative(ROOT, abs);

    if (entry.isDirectory()) {
      if (entry.name === 'assets') continue;             // assets/ excluded from sidebar
      if (entry.name.startsWith('.')) continue;          // hidden dirs

      const c = classifyPrefix(entry.name);
      if (c.value !== undefined) {
        recordPrefix(prefixes, c.value, `${entry.name}/`, `${relPath}/`, errors);
      } else if (c.badDigits) {
        errors.push(`${relPath}/: prefix ${c.badDigits}_ has ${c.badDigits.length} digit(s) — use 2–5`);
      } else {
        errors.push(`${relPath}/: folder missing NN_ prefix (2–5 digits)`);
      }
      walk(abs);
    } else if (entry.isFile()) {
      if (entry.name === 'settings.json' || entry.name === 'README.md') continue;
      if (entry.name.startsWith('.')) continue;
      if (entry.name.startsWith('__')) continue;        // __placeholder__ etc.

      // Asset files (non-md) inside a docs section
      if (!entry.name.endsWith('.md')) {
        // Allowed only inside assets/ folders — the walk skips assets/ entirely,
        // so reaching this branch means a non-md file is in a docs folder.
        warnings.push(`${relPath}: non-md file in docs folder (move to assets/?)`);
        continue;
      }

      const c = classifyPrefix(entry.name);
      if (c.value !== undefined) {
        recordPrefix(prefixes, c.value, entry.name, relPath, errors);
      } else if (c.badDigits) {
        errors.push(`${relPath}: prefix ${c.badDigits}_ has ${c.badDigits.length} digit(s) — use 2–5`);
      } else {
        errors.push(`${relPath}: file missing NN_ prefix (2–5 digits)`);
      }

      const content = readText(abs, relPath, errors);
      if (content !== null && !hasFrontmatterTitle(content)) {
        errors.push(`${relPath}: missing frontmatter \`title:\``);
      }
    }
  }
}

walk(ROOT);

reportAndExit({ kind: 'docs', root: ROOT, errors, warnings });
