/**
 * Settings file loading — JSON *and* JSONC.
 *
 * `settings.json` may also be authored as `settings.jsonc`, which allows `//`
 * line comments, `/* *\/` block comments, and trailing commas. This is useful for
 * annotating vocabulary (what each `component` / `label` means) inline so humans
 * and AI agents know what belongs where. When both files exist, `.jsonc` wins.
 *
 * The comment stripper is string-aware: comment markers and trailing commas that
 * appear *inside* string values are preserved untouched.
 */
import fs from 'fs';
import path from 'path';

export const SETTINGS_BASENAMES = ['settings.jsonc', 'settings.json'] as const;

/** True for `settings.json` or `settings.jsonc`. */
export function isSettingsFile(basename: string): boolean {
  return basename === 'settings.json' || basename === 'settings.jsonc';
}

/** Strip `//` + `/* *\/` comments and trailing commas from JSONC text. String-safe. */
export function stripJsonComments(input: string): string {
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

    // Drop a trailing comma immediately before a closing } or ].
    if (c === '}' || c === ']') {
      const trimmed = out.replace(/\s+$/, '');
      if (trimmed.endsWith(',')) out = trimmed.slice(0, -1);
    }

    out += c;
  }

  return out;
}

/** Parse JSON or JSONC text. Throws like `JSON.parse` on malformed input. */
export function parseJsonc<T = unknown>(text: string): T {
  return JSON.parse(stripJsonComments(text)) as T;
}

/**
 * Resolve a settings path in `dir`, preferring `settings.jsonc` when it exists.
 * Returns the `.json` path (whether or not it exists) as the fallback, so callers
 * can still use the result for existence checks and error messages.
 */
export function resolveSettingsPath(dir: string, base = 'settings'): string {
  const jsonc = path.join(dir, `${base}.jsonc`);
  if (fs.existsSync(jsonc)) return jsonc;
  return path.join(dir, `${base}.json`);
}

/**
 * Read + parse a settings file (`.jsonc` preferred) from a `.json` path OR a dir.
 * Accepts either a full `<dir>/settings.json` path or a directory. Returns null on
 * missing / invalid file.
 */
export function readSettings<T>(jsonPathOrDir: string): T | null {
  let target = jsonPathOrDir;
  if (jsonPathOrDir.endsWith('.json') || jsonPathOrDir.endsWith('.jsonc')) {
    const jsonc = jsonPathOrDir.replace(/\.jsonc?$/, '.jsonc');
    target = fs.existsSync(jsonc) ? jsonc : jsonPathOrDir;
  } else {
    target = resolveSettingsPath(jsonPathOrDir);
  }
  try {
    return parseJsonc<T>(fs.readFileSync(target, 'utf-8'));
  } catch {
    return null;
  }
}

/** Sum of mtimes of both settings variants in `dir` (for cache signatures). */
export function statSettingsMtime(dir: string, base = 'settings'): number {
  let sum = 0;
  for (const ext of ['json', 'jsonc']) {
    try { sum += fs.statSync(path.join(dir, `${base}.${ext}`)).mtimeMs; } catch { /* absent */ }
  }
  return sum;
}
