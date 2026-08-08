/**
 * Content ↔ engine version precheck, run BEFORE a server or a build starts.
 *
 * ## Why this exists when the engine already has the gate
 *
 * `assertContentVersionSupported()` in `src/loaders/engine-version.ts` is the
 * real contract, and `loadSiteConfig()` calls it. What it cannot control is
 * *when* it fires, because it fires whenever config happens to be loaded:
 *
 *   build    during the build. Correct — you find out before you publish.
 *   dev      at the FIRST REQUEST, not at startup. The server prints "ready",
 *            and then every page is a 500. You believe you are running.
 *   preview  NEVER. Preview serves prebuilt files and never loads config, so a
 *            stale `dist/` built from unmigrated content is served in silence.
 *
 * So this runs the same comparison up front, from plain JS, before anything is
 * launched. The failure arrives where the decision is — at the command you
 * typed — instead of in a browser tab or not at all.
 *
 * ## The engine stays the authority
 *
 * This check refuses ONLY when it can read both versions and they are
 * positively out of range. Anything it cannot determine — no `.env`, no
 * `site.yaml`, a constant whose spelling it cannot parse — is a warning, and
 * the launch continues to the engine's own gate. A precheck that guesses is
 * worse than no precheck: it would become a new reason a working project fails
 * to start, which is exactly the failure it was added to prevent.
 *
 * ## One source of truth, read rather than copied
 *
 * `ENGINE_VERSION` and `MIN_CONTENT_VERSION` are parsed out of the TypeScript
 * source. That is deliberate and it is not the pretty option — the pretty
 * option is a second copy of the two numbers in a JSON file, and a second copy
 * is how the floor and the engine silently disagree. `scripts/` is plain
 * JavaScript (node cannot import `.ts`, and only half the machines running this
 * have bun), so reading the source is the only way to have one number. If the
 * declarations are ever reworded, this returns null and says so — a loud miss,
 * never a stale value.
 */
import fs from 'node:fs';
import path from 'node:path';

import { REPO, FRAMEWORK, say, warn, readEnv } from './util.mjs';

/** Content with no `engine_version` predates the contract — same as the engine. */
const UNVERSIONED = '0.0.0';

const ENGINE_VERSION_FILE = 'src/loaders/engine-version.ts';
const VERSION_RE = /^\d+\.\d+\.\d+$/;

const skip = () => process.env.START_SKIP_VERSION_CHECK === '1';

/** Numeric per-segment comparison over all three places, like the engine's. */
export function compare(a, b) {
  const [aMaj, aMin, aPat] = a.split('.').map(Number);
  const [bMaj, bMin, bPat] = b.split('.').map(Number);
  return aMaj - bMaj || aMin - bMin || aPat - bPat;
}

function constant(name, src) {
  const m = new RegExp(String.raw`^export const ${name}\s*=\s*['"](\d+\.\d+\.\d+)['"]`, 'm').exec(src);
  return m ? m[1] : null;
}

/** `{ engine, floor }` from the engine source, or null if either is unreadable. */
export function engineVersions() {
  let src;
  try { src = fs.readFileSync(path.join(FRAMEWORK, ENGINE_VERSION_FILE), 'utf-8'); } catch { return null; }
  const engine = constant('ENGINE_VERSION', src);
  const floor = constant('MIN_CONTENT_VERSION', src);
  return engine && floor ? { engine, floor } : null;
}

/**
 * `{ file, version }` for the active content tree, or null when `site.yaml`
 * cannot be located. A `site.yaml` that exists but declares nothing is
 * UNVERSIONED, which is a real answer and not a failure to read.
 */
export function contentVersion() {
  const configDir = readEnv().CONFIG_DIR;
  if (!configDir) return null;
  const file = path.resolve(REPO, configDir, 'site.yaml');
  let src;
  try { src = fs.readFileSync(file, 'utf-8'); } catch { return null; }
  // Column 0 only — `engine_version` is a top-level key, and a nested key of the
  // same name somewhere else in the file is not it.
  const m = /^engine_version:\s*["']?(\d+\.\d+\.\d+)["']?\s*(?:#.*)?$/m.exec(src);
  if (m) return { file, version: m[1] };
  return { file, version: /^engine_version:/m.test(src) ? null : UNVERSIONED };
}

/** Migration scripts that bring content from `after` up to `upto`, in run order. */
export function migrationsBetween(after, upto) {
  let names;
  try { names = fs.readdirSync(path.join(REPO, 'migration')); } catch { return []; }
  return names
    .filter((n) => n.endsWith('.py'))
    .map((n) => ({ name: n, v: (/^(\d+\.\d+\.\d+)_/.exec(n) || [])[1] }))
    .filter((e) => e.v && compare(e.v, after) > 0 && compare(e.v, upto) <= 0)
    .sort((a, b) => compare(a.v, b.v) || a.name.localeCompare(b.name))
    .map((e) => `migration/${e.name}`);
}

function refuse(lines) {
  warn('\x1b[1;31merror: this content cannot run on this engine.\x1b[0m');
  for (const line of lines) warn(line);
  warn('');
  warn('Set START_SKIP_VERSION_CHECK=1 to start anyway — the engine will still refuse.');
  process.exit(1);
}

/**
 * Compare the content's declared version against the engine's range and stop
 * the command when it falls outside. Silent-ish on success: one line, because a
 * check nobody can see is a check nobody trusts.
 */
export function versionPrecheck() {
  if (skip()) return;

  const eng = engineVersions();
  if (!eng) {
    warn(`cannot read ENGINE_VERSION / MIN_CONTENT_VERSION from ${ENGINE_VERSION_FILE} — skipping the version precheck`);
    return;
  }

  const content = contentVersion();
  if (!content) {
    warn('cannot locate site.yaml (is CONFIG_DIR set in .env?) — skipping the version precheck');
    return;
  }
  if (content.version === null) {
    warn(`site.yaml declares an engine_version this check cannot parse — skipping the version precheck`);
    return;
  }
  if (!VERSION_RE.test(content.version)) {
    warn(`site.yaml engine_version "${content.version}" is not a valid N.N.N version — skipping the version precheck`);
    return;
  }

  const { engine, floor } = eng;
  const declared = content.version;

  if (compare(declared, floor) < 0) {
    const undeclared = declared === UNVERSIONED ? ' (no engine_version declared in site.yaml)' : '';
    const scripts = migrationsBetween(declared, engine);
    refuse([
      `content targets engine ${declared}${undeclared}; engine ${engine} needs ${floor} or newer.`,
      `  site.yaml: ${content.file}`,
      '',
      scripts.length
        ? `Migrate the content. Run these ${scripts.length} script(s), in this order:`
        : 'Migrate the content. No migration script matches that range — check migration/ by hand.',
      ...scripts.map((s) => `    ${s}`),
      '',
      'For each script: detect pass, then --dry-run, then migrate, then detect again',
      '(a zero-hit detect is a passed check, not a skipped script).',
      `Verify with 'agent-ks check', then set engine_version: "${engine}" in site.yaml — last, never first.`,
    ]);
  }

  if (compare(declared, engine) > 0) {
    refuse([
      `content targets engine ${declared}, but this engine is only ${engine}.`,
      `  site.yaml: ${content.file}`,
      '',
      `Update the framework to ${declared} or newer. './start' offers the pull when the upstream is ahead.`,
    ]);
  }

  say(`content ${declared} · engine ${engine} (floor ${floor})`);

  // In range, but behind. Nothing is broken and nothing is refused — a floor
  // that has not moved means old content still works. Say it once so the
  // available migrations are discoverable rather than archaeological.
  if (compare(declared, engine) < 0) {
    const scripts = migrationsBetween(declared, engine);
    if (scripts.length) {
      say(`${scripts.length} optional migration(s) available for ${declared} → ${engine}: ${scripts.join(', ')}`);
    }
  }
}
