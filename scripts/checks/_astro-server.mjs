/**
 * _astro-server.mjs — where is the dev/preview server, actually?
 *
 * DEVELOPMENT-STAGE HELPER, shared by the repo-root gates that need a running
 * server to test against. Not a gate itself and not shipped — the leading
 * underscore says "imported, never run". See CLAUDE.md → "Three stages".
 *
 * WHY IT EXISTS. Both gates defaulted to `http://localhost:4321`, which is
 * Astro's default port and not this project's — `.env` sets `PORT=3088`, and a
 * consumer sets whatever they like. Pointed at a dead port neither gate hangs;
 * they fail. But they fail saying "every URL diverged" or "no HTML pages
 * reachable", which reads as a site defect rather than as "you are talking to
 * nothing", and that is a bad half hour.
 *
 * WHERE THE ANSWER LIVES. Astro writes a lock file per project and per command
 * — `astro-doc-code/.astro/dev.json`, `astro-doc-code/.astro/preview.json` —
 * holding the pid, the port and the resolved URLs. It is the same file
 * `astro dev status` reads, so this is the server's own account of itself
 * rather than a guess assembled from `.env`.
 *
 * DO NOT reach for the startup banner instead. In Astro 7 that banner is a JSON
 * object, so anything grepping for the old `astro v5.x ready in NNN ms` text
 * does not fail — it waits forever for a line that will never come. Two
 * measurements during the Astro 7 upgrade were bogus for exactly that reason.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASTRO_DIR = path.join(REPO, 'astro-doc-code', '.astro');

/** Is this pid still ours to talk to? A lock file outlives a crashed server. */
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read Astro's lock file for `dev` or `preview`.
 * Returns null when there is no file, the file is not the shape we expect, or
 * the process it names is gone — all three mean "nothing is running".
 */
export function readServerLock(kind = 'dev') {
  const file = path.join(ASTRO_DIR, `${kind}.json`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return null;
  }
  if (typeof data?.pid !== 'number' || typeof data?.url !== 'string') return null;
  if (!isAlive(data.pid)) return null;
  return data;
}

/**
 * The origin a gate should crawl.
 *
 * `explicit` always wins — a caller that passed `--base` meant it, including
 * when they are pointing at a second server for a comparison run. Otherwise
 * take whichever of dev/preview is running. Returns null when nothing is, so
 * the caller can print its own instructions rather than crawling a dead port.
 */
export function resolveServerBase(explicit = null, kinds = ['dev', 'preview']) {
  if (explicit) return { origin: explicit.replace(/\/+$/, ''), source: 'flag' };
  for (const kind of kinds) {
    const lock = readServerLock(kind);
    if (lock) return { origin: lock.url.replace(/\/+$/, ''), source: kind, pid: lock.pid };
  }
  return null;
}

/** The line every gate prints when it cannot find a server. One wording, one place. */
export const NO_SERVER_HELP = [
  'No running Astro server found (no live lock file in astro-doc-code/.astro/).',
  '',
  '  Start one, then re-run:   ./start dev       (holds the terminal; Ctrl-C stops it)',
  '  Check what is running:    ./start status',
  '  Or name a server:         --base http://localhost:<port>',
].join('\n');
