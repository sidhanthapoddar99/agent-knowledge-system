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
 * First-class non-md pages — diagram sources (.mmd/.mermaid/.dot/.gv/.excalidraw)
 * and .html artifacts — are validated as pages (NN_ prefix + collision pool), not
 * warned about as stray files; their `.meta.json`/`.meta.jsonc` sidecars are
 * recognized companions. Any other non-md file warns (belongs in assets/).
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { ORDER_PREFIX_FULL_RE, ANY_DIGIT_PREFIX_RE } from '../_order-prefix.mjs';
import { hasFrontmatterTitle, readText, readJsonChecked, reportAndExit } from '../_check-lib.mjs';

const JSON_OUT = process.argv.includes('--json');
const ROOT = process.argv.slice(2).find((a) => !a.startsWith('-'));

if (!ROOT) {
  // --help/-h are intercepted by cli.mjs; reaching here means no section arg.
  console.error('Usage: docs-guide check section <section-folder>\n');
  console.error('  Example: docs-guide check section ./data/user-guide  (or any docs section folder)\n');
  console.error('  Validates: NN_ prefix (2–5 digits) · settings.json presence · frontmatter title · prefix collisions');
  process.exit(1);
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

// First-class non-markdown pages that the runtime loaders render as docs pages,
// exactly like a `.md` file: diagram sources (loaders/diagram-pages.ts) and
// `.html` artifacts (loaders/artifact-pages.ts). Each takes an `NN_` prefix and
// joins the same slug-collision pool as markdown — so they are validated as pages
// here, never warned about as stray non-md files. Keep this in sync with
// DIAGRAM_EXTENSIONS / ARTIFACT_PAGE_GLOB in those loaders.
const FIRST_CLASS_PAGE_EXTS = new Set(['.mmd', '.mermaid', '.dot', '.gv', '.excalidraw', '.html']);
// A first-class page may carry a same-name metadata sidecar (`<NN_name>.meta.json`
// / `.meta.jsonc`) — a companion, never a page itself, so it is neither
// prefix-checked nor counted in the collision pool.
const SIDECAR_RE = /\.meta\.jsonc?$/i;

/** True when `name` is a `.meta.json(c)` sidecar for a colocated first-class page. */
function isSidecarForPage(dir, name) {
  const m = name.match(SIDECAR_RE);
  if (!m) return false;
  const base = name.slice(0, name.length - m[0].length);
  for (const ext of FIRST_CLASS_PAGE_EXTS) {
    if (fs.existsSync(path.join(dir, base + ext))) return true;
  }
  return false;
}

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

      // Non-markdown files inside a docs section. First-class artifact/diagram
      // pages (and their metadata sidecars) are legitimate here; anything else
      // belongs in assets/.
      if (!entry.name.endsWith('.md')) {
        // A `.meta.json(c)` sidecar for a colocated first-class page — companion
        // metadata, not a page. Skip silently (no prefix/collision check; its
        // prefix intentionally matches its page's).
        if (isSidecarForPage(dir, entry.name)) continue;

        // A diagram source or `.html` artifact renders as a first-class page, so
        // validate it like a `.md` page: it needs an `NN_` prefix and shares the
        // collision pool. No frontmatter-title check — its metadata lives in the
        // file itself or the sidecar.
        const ext = path.extname(entry.name).toLowerCase();
        if (FIRST_CLASS_PAGE_EXTS.has(ext)) {
          const c = classifyPrefix(entry.name);
          if (c.value !== undefined) {
            recordPrefix(prefixes, c.value, entry.name, relPath, errors);
          } else if (c.badDigits) {
            warnings.push(`${relPath}: prefix ${c.badDigits}_ has ${c.badDigits.length} digit(s) — use 2–5, or move into assets/ if embed-only`);
          } else {
            warnings.push(`${relPath}: first-class ${ext} page missing NN_ prefix — add one to make it a page, or move into assets/ if embed-only`);
          }
          continue;
        }

        // Any other non-md file: the walk skips assets/ entirely, so reaching
        // here means a genuinely stray file in a docs folder.
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

reportAndExit({ kind: 'docs', root: ROOT, errors, warnings, json: JSON_OUT });
