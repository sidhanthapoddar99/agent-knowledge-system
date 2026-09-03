/**
 * _jsonc — JSON *and* JSONC reading for the toolkit.
 *
 * A `settings.json` may instead be authored as `settings.jsonc` with `//` line
 * comments, `/* *\/` block comments, and trailing commas — handy for annotating
 * tracker vocabulary (what each `component` / `label` means) inline. When both
 * files exist, `.jsonc` wins. The comment stripper is string-aware: markers and
 * trailing commas inside string values are left untouched.
 *
 * Mirror of `astro-doc-code/src/loaders/settings-file.ts` — keep them in sync.
 */
import fs from 'node:fs';

/** Strip `//` + `/* *\/` comments and trailing commas from JSONC text. String-safe. */
export function stripJsonComments(input) {
  let out = '';
  let inString = false;
  let inLine = false;
  let inBlock = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const next = input[i + 1];

    if (inLine) {
      if (c === '\n') { inLine = false; out += c; }
      continue;
    }
    if (inBlock) {
      if (c === '*' && next === '/') { inBlock = false; i++; }
      continue;
    }
    if (inString) {
      out += c;
      if (escaped) escaped = false;
      else if (c === '\\') escaped = true;
      else if (c === '"') inString = false;
      continue;
    }

    if (c === '"') { inString = true; out += c; continue; }
    if (c === '/' && next === '/') { inLine = true; i++; continue; }
    if (c === '/' && next === '*') { inBlock = true; i++; continue; }

    if (c === '}' || c === ']') {
      const trimmed = out.replace(/\s+$/, '');
      if (trimmed.endsWith(',')) out = trimmed.slice(0, -1);
    }

    out += c;
  }

  return out;
}

/** Parse JSON or JSONC text. Throws like `JSON.parse` on malformed input. */
export function parseJsonc(text) {
  return JSON.parse(stripJsonComments(text));
}

/** Given a `<dir>/settings.json` path (or any `.json` path), return the sibling
 *  `.jsonc` when it exists, else the original path. */
export function preferJsonc(jsonPath) {
  if (typeof jsonPath !== 'string') return jsonPath;
  const jsonc = jsonPath.replace(/\.jsonc?$/, '.jsonc');
  if (jsonc !== jsonPath && fs.existsSync(jsonc)) return jsonc;
  return jsonPath;
}
