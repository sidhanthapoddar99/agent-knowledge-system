/**
 * Package-runner selection and dependency freshness.
 *
 * DEVELOPMENT-STAGE, but it ships: `./start` is the documented entry point for
 * consumers too, so this runs on machines that have never seen this repo's
 * tooling. Keep it dependency-free and defensive.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { FRAMEWORK, say, warn, die, isInteractive, ask } from './util.mjs';

/**
 * bun if present, npm otherwise. Silent by design — the server-control verbs
 * need a runner before there is anything worth announcing.
 */
export function pickRunner() {
  for (const [bin, install] of [['bun', ['install']], ['npm', ['install']]]) {
    const probe = spawnSync(bin, ['--version'], { stdio: 'ignore', shell: process.platform === 'win32' });
    if (probe.status === 0) {
      return { name: bin, install, lockfile: bin === 'bun' ? 'bun.lock' : 'package-lock.json' };
    }
  }
  die('neither bun nor npm found on PATH — install one and retry');
}

/** Run a package.json script (`dev`, `build`, …) in the framework folder. */
export function runScript(runner, args, opts = {}) {
  return spawnSync(runner.name, ['run', ...args], {
    cwd: FRAMEWORK,
    stdio: opts.stdio ?? 'inherit',
    encoding: 'utf-8',
    shell: process.platform === 'win32',
    ...opts,
  });
}

const STAMP = 'node_modules/.start-deps-stamp';

/**
 * Hash package.json + the runner's lockfile. A mismatch against the stamp means
 * someone pulled a commit that changed dependencies, and a stale `node_modules`
 * would otherwise miss them until an import failed at build time.
 */
function depsHash(runner) {
  const hash = crypto.createHash('sha256');
  for (const name of ['package.json', runner.lockfile]) {
    const file = path.join(FRAMEWORK, name);
    if (fs.existsSync(file)) hash.update(fs.readFileSync(file));
  }
  return hash.digest('hex');
}

/**
 * npm has no cross-project dedup: every project carries its own full
 * node_modules (~420 MB), while bun hardlinks from a global cache so N projects
 * cost about one copy. Loud on purpose — this is a disk decision made once and
 * regretted for a long time.
 */
async function npmDiskWarning() {
  warn('\x1b[1;31mWARNING: installing with npm — no cross-project dedup.\x1b[0m');
  warn('\x1b[31mnpm gives every project its own full node_modules (~420 MB each).');
  warn('bun hardlinks packages from a global cache, so N projects cost ~one copy.');
  warn('Recommended fix: install bun (https://bun.sh) and re-run.\x1b[0m');
  warn('Details: user-guide → Getting Started → Storage & Disk Footprint.');
  if (!isInteractive()) return;
  const reply = await ask('proceed with npm install anyway? [Y/n] ');
  if (!/^(y|yes)?$/i.test(reply.trim())) die('aborted — install bun and re-run');
}

/** Install when node_modules is missing or the manifests moved under it. */
export async function ensureDeps(runner) {
  const modules = path.join(FRAMEWORK, 'node_modules');
  const stamp = path.join(FRAMEWORK, STAMP);
  const wanted = depsHash(runner);

  let reason = null;
  if (!fs.existsSync(modules)) reason = 'node_modules missing';
  else if (!fs.existsSync(stamp) || fs.readFileSync(stamp, 'utf-8').trim() !== wanted) {
    reason = 'dependency manifest changed since last install';
  }
  if (!reason) return;

  if (runner.name === 'npm') await npmDiskWarning();
  say(`${reason} — running '${runner.name} install'...`);
  const res = spawnSync(runner.name, runner.install, {
    cwd: FRAMEWORK,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (res.status !== 0) die('dependency install failed');
  fs.mkdirSync(path.dirname(stamp), { recursive: true });
  fs.writeFileSync(stamp, wanted);
}
