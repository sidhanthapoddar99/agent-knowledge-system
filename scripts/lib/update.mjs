/**
 * Git housekeeping offered at launch: is there a newer version, and does a
 * consumer clone really need full history?
 *
 * ## Why the update check is throttled
 *
 * It used to run on every invocation. That was fine when `./start` meant
 * "preflight then dev" and you typed it a few times a day. It is not fine now
 * that the bare command IS dev and gets typed ~20 times a day: a network fetch
 * plus a Y/n prompt on every one is friction, and the fetch is the single thing
 * most likely to hang on a bad connection.
 *
 * So it checks at most once per interval (default 6h) and records when it last
 * looked. You still hear about updates; you do not pay on start #2 through #20.
 *
 * Every function here bails silently rather than blocking a launch. Nothing in
 * this file is allowed to be the reason a dev server did not start.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { REPO, say, warn, isInteractive, ask, readEnv } from './util.mjs';

const DEFAULT_INTERVAL_HOURS = 6;
const STAMP = '.start-update-stamp';

function git(args, opts = {}) {
  return execFileSync('git', ['-C', REPO, ...args], {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'ignore'],
    ...opts,
  }).trim();
}

function tryGit(args, opts) {
  try { return git(args, opts); } catch { return null; }
}

const skip = () => process.env.START_SKIP_UPDATE_CHECK === '1';

function gitDir() {
  return tryGit(['rev-parse', '--absolute-git-dir']);
}

/** Has the interval elapsed since the last look? Also records this look. */
function dueForCheck(dir) {
  const hours = Number(process.env.START_UPDATE_INTERVAL_HOURS ?? DEFAULT_INTERVAL_HOURS);
  if (!Number.isFinite(hours) || hours <= 0) return true;   // 0 disables throttling
  const stamp = path.join(dir, STAMP);
  try {
    const age = Date.now() - fs.statSync(stamp).mtimeMs;
    if (age < hours * 3600_000) return false;
  } catch { /* never checked */ }
  try { fs.writeFileSync(stamp, ''); } catch { /* read-only .git — check anyway */ }
  return true;
}

/** Clean tree, tracked upstream, not diverged — the rails both checks share. */
function safeToTouch() {
  if (tryGit(['diff', '--quiet']) === null) return null;
  if (tryGit(['diff', '--cached', '--quiet']) === null) return null;
  return tryGit(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}']);
}

export async function updateCheck() {
  if (skip() || !isInteractive()) return;
  const dir = gitDir();
  if (!dir) return;
  if (!dueForCheck(dir)) return;

  const upstream = safeToTouch();
  if (upstream === null) {
    // Distinguish "dirty" from "no upstream" — only the first is worth saying.
    if (tryGit(['rev-parse', '@{u}'])) say('working tree has uncommitted changes — skipping update check');
    return;
  }

  say(`checking ${upstream} for updates...`);
  if (tryGit(['fetch', '--quiet']) === null) {
    say('fetch failed (offline?) — skipping update check');
    return;
  }

  const local = tryGit(['rev-parse', 'HEAD']);
  const remote = tryGit(['rev-parse', '@{u}']);
  if (!local || !remote) return;
  if (local === remote) { say('up to date'); return; }

  const base = tryGit(['merge-base', 'HEAD', '@{u}']);
  if (base !== local) {
    say(`local branch has diverged from ${upstream} — resolve manually before pulling`);
    return;
  }

  const ahead = tryGit(['rev-list', '--count', 'HEAD..@{u}']) ?? '?';
  say(`${ahead} new commit(s) available on ${upstream}`);
  const reply = (await ask('pull now? [Y/n] ')).trim();
  if (!/^(y|yes)?$/i.test(reply)) { say('skipping pull — continuing with current version'); return; }

  if (tryGit(['pull', '--ff-only', '--quiet']) !== null) say(`pulled ${ahead} commit(s) — continuing`);
  else warn('pull failed — continuing with current version');
}

/**
 * A vendored framework does not need git history. Offer a one-time in-place
 * shrink, and only in consumer mode — in this repo the tracker's git-derived
 * dates depend on history, so shallowing it would be actively wrong.
 */
export async function shallowCheck() {
  if (skip() || !isInteractive()) return;
  const dir = gitDir();
  if (!dir) return;
  if (tryGit(['rev-parse', '--is-shallow-repository']) !== 'false') return;
  const declined = path.join(dir, '.start-shallow-declined');
  if (fs.existsSync(declined)) return;

  // Consumer mode iff CONFIG_DIR resolves outside the framework folder.
  const configDir = readEnv().CONFIG_DIR;
  if (!configDir) return;
  const resolved = path.resolve(REPO, configDir);
  if (resolved === REPO || resolved.startsWith(REPO + path.sep)) return;   // dogfood

  const upstream = safeToTouch();
  if (!upstream) return;
  if (tryGit(['rev-parse', 'HEAD']) !== tryGit(['rev-parse', '@{u}'])) return;

  say('consumer-mode clone with full git history detected');
  say("a vendored framework doesn't need history — shallow keeps only the current commit");
  const reply = (await ask('shrink to a shallow clone now? [y/N] ')).trim();
  if (!/^(y|yes)$/i.test(reply)) {
    say("keeping full history (won't ask again — delete .git/.start-shallow-declined to re-enable)");
    try { fs.writeFileSync(declined, ''); } catch { /* best effort */ }
    return;
  }
  if (tryGit(['fetch', '--depth', '1', '--quiet']) === null) {
    warn('shallow fetch failed — leaving the clone as-is');
    return;
  }
  tryGit(['reflog', 'expire', '--expire=now', '--all']);
  tryGit(['gc', '--prune=now', '--quiet']);
  say('done — future pulls stay shallow');
}
