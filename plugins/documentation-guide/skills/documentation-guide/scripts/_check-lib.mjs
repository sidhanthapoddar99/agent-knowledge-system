/**
 * _check-lib — primitives shared by the four validators
 * (`docs/`, `blog/`, `config/`, `issues/` → `check.mjs`).
 *
 * Each validator owns its domain rules; this file owns the plumbing they all
 * repeated — the frontmatter `title:` test, safe file/JSON reads, and the
 * report-and-exit block. One copy here means a fix (e.g. tweaking the success
 * line, or the title regex) lands everywhere instead of in four places.
 */

import fs from 'node:fs';
import { parseJsonc } from './_jsonc.mjs';

/** A `.md` file has a `title:` key inside its leading `---` frontmatter block. */
export const FRONTMATTER_TITLE_RE = /^---\r?\n[\s\S]*?^title:\s*\S+/m;

export function hasFrontmatterTitle(content) {
  return FRONTMATTER_TITLE_RE.test(content);
}

/**
 * Read a file as utf-8. On failure, push a `read error` onto `errors` and
 * return `null` so the caller can skip the file without throwing.
 */
export function readText(abs, relPath, errors) {
  try {
    return fs.readFileSync(abs, 'utf-8');
  } catch (e) {
    errors.push(`${relPath}: read error — ${e.message}`);
    return null;
  }
}

/**
 * Read + JSON.parse a file. On failure, push an `invalid JSON` error onto
 * `errors` and return `null`. Presence is the caller's concern — this is for
 * "it exists, does it parse?".
 */
export function readJsonChecked(abs, relPath, errors) {
  let raw;
  try {
    raw = fs.readFileSync(abs, 'utf-8');
  } catch (e) {
    errors.push(`${relPath}: read error — ${e.message}`);
    return null;
  }
  try {
    return parseJsonc(raw);
  } catch (e) {
    errors.push(`${relPath}: invalid JSON (${e.message})`);
    return null;
  }
}

/**
 * Print the standard validator report and `process.exit` with the right code.
 * Output shape (identical across all four validators):
 *
 *   # <kind> check: <root>
 *   [<subtitle>]
 *
 *   ✓ all checks passed            (no errors, no warnings)
 *   ✓ no errors                    (no errors, warnings present but suppressed)
 *   ## N error(s) / ## N warning(s) sections otherwise
 *
 * Exit 1 if any errors, else 0. `quiet` suppresses the warning section (only
 * the issues validator uses it today, via --quiet/--no-warnings).
 */
export function reportAndExit({ kind, root, errors, warnings = [], quiet = false, subtitle = null, json = false }) {
  // Category-0 contract: machine-readable findings on --json.
  if (json) {
    process.stdout.write(JSON.stringify({
      kind,
      root,
      ok: errors.length === 0,
      errorCount: errors.length,
      warningCount: quiet ? 0 : warnings.length,
      errors,
      warnings: quiet ? [] : warnings,
    }, null, 2) + '\n');
    process.exit(errors.length ? 1 : 0);
  }
  const showWarnings = !quiet;
  console.log(`# ${kind} check: ${root}`);
  if (subtitle) console.log(subtitle);
  console.log('');

  if (errors.length === 0 && (warnings.length === 0 || !showWarnings)) {
    console.log(errors.length === 0 && warnings.length === 0 ? '✓ all checks passed' : '✓ no errors');
    process.exit(0);
  }
  if (errors.length) {
    console.log(`## ${errors.length} error(s)`);
    for (const e of errors) console.log(`  ✗ ${e}`);
  }
  if (warnings.length && showWarnings) {
    if (errors.length) console.log('');
    console.log(`## ${warnings.length} warning(s)`);
    for (const w of warnings) console.log(`  ⚠ ${w}`);
  }
  process.exit(errors.length ? 1 : 0);
}
