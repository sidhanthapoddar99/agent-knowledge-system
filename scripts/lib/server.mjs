/**
 * Dev / preview server lifecycle.
 *
 * ## Everything here goes through Astro's lock file, never the process tree
 *
 * `astro dev` re-spawns itself as a detached daemon when it detects an AI-agent
 * environment. The pid you launched is then the *launcher*, not the server, so
 * killing it leaves the server holding its port and its heap, invisible to
 * whoever started it. Eleven leaked during the Astro 7 upgrade, one for 18 hours
 * at 1.19 GB.
 *
 * `astro <cmd> stop|status|logs` resolves the server through the lock file, so
 * it is correct whether the server is a child of this process, a detached
 * daemon, or a leftover from a terminal that has since been closed.
 *
 * ## Never match on the startup banner
 *
 * In Astro 7 the banner is a JSON object. A check for the old
 * `astro v5.x ready in NNN ms` text does not fail — it waits forever for a line
 * that will never come. Two measurements during the upgrade were bogus for
 * exactly that reason. Match on a URL, which appears in every running form and
 * in no idle one.
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { FRAMEWORK, say, warn } from './util.mjs';

const URL_RE = /https?:\/\//;
const win = process.platform === 'win32';

/** `astro <cmd> <args…>` inside the framework folder. */
function astro(runner, cmd, args, opts = {}) {
  return spawnSync(runner.name, ['run', 'astro', '--', cmd, ...args], {
    cwd: FRAMEWORK,
    encoding: 'utf-8',
    shell: win,
    ...opts,
  });
}

export function depsInstalled() {
  return fs.existsSync(path.join(FRAMEWORK, 'node_modules'));
}

export function isRunning(runner, cmd) {
  if (!depsInstalled()) return false;
  const res = astro(runner, cmd, ['status'], { stdio: ['ignore', 'pipe', 'ignore'] });
  return URL_RE.test(res.stdout || '');
}

/** Forward a control verb (stop/status/logs) straight through. */
export function control(runner, cmd, verb, extra = []) {
  return astro(runner, cmd, [verb, ...extra], { stdio: 'inherit' }).status ?? 1;
}

/**
 * Stop a server, allowing for one that has not finished starting.
 *
 * Astro's launcher spawns the real server detached. An interrupt during the
 * startup window kills the launcher and never reaches the server, which goes on
 * booting and registers itself a second or two later — a live server nobody is
 * watching and nobody was told about. That is the leak this file exists to
 * close, so a stop issued mid-launch waits for the late arrival.
 */
export async function stop(runner, cmd, { launching = false } = {}) {
  astro(runner, cmd, ['stop'], { stdio: 'ignore' });

  if (launching) {
    say(`interrupted mid-launch — waiting for the detached ${cmd} server to register so it can be stopped`);
    // Astro's launcher gives a server 30s to come up; allow a little more.
    for (let i = 0; i < 35 && !isRunning(runner, cmd); i++) {
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (isRunning(runner, cmd)) astro(runner, cmd, ['stop'], { stdio: 'ignore' });
  }

  if (isRunning(runner, cmd)) {
    warn(`warning: a ${cmd} server is STILL running — 'start status' shows it, 'start stop' stops it`);
    return false;
  }
  say(`${cmd} server stopped`);
  return true;
}

/**
 * Start a server and hold this terminal on it.
 *
 * Ctrl-C stops the server. That is the default and the only mode most people
 * want; `--detach` opts out and leaves it running for `start stop`.
 *
 * Attaching to a server this invocation did not start is READ-ONLY: Ctrl-C
 * detaches and says so. You stop what you started.
 */
export async function runServer(runner, cmd, { detach = false, extra = [] } = {}) {
  const alreadyUp = isRunning(runner, cmd);
  const owned = !alreadyUp;
  let launching = true;
  let follower = null;
  let handled = false;

  const onSignal = async () => {
    if (handled) return;
    handled = true;
    process.stdout.write('\n');
    if (follower) follower.kill();
    if (owned) {
      say(`stopping ${cmd} server...`);
      await stop(runner, cmd, { launching });
    } else {
      say(`detached — the ${cmd} server is still running ('start stop' stops it)`);
    }
    process.exit(0);
  };
  // Armed BEFORE the launch: a Ctrl-C during the ~2s startup window would
  // otherwise leave behind exactly the daemon this is here to prevent.
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, onSignal);

  say(`launching ${cmd} server...`);
  const launched = spawnSync(runner.name, ['run', cmd, '--', '--background', ...extra], {
    cwd: FRAMEWORK,
    stdio: 'inherit',
    shell: win,
  });
  launching = false;
  if (launched.status !== 0) {
    warn(`${cmd} server failed to start`);
    process.exit(1);
  }

  console.log();
  control(runner, cmd, 'status');

  if (detach) {
    say(`detached. 'start status' finds it, 'start stop' stops it, 'start logs' reads it.`);
    process.exit(0);
  }

  if (owned) {
    say('Ctrl-C stops it.  Elsewhere: start stop | start status | start logs');
  } else {
    say(`a ${cmd} server was already running — this terminal is FOLLOWING it, not owning it.`);
    say(`Ctrl-C detaches; 'start stop' stops the server.`);
  }
  console.log();

  follower = spawn(runner.name, ['run', 'astro', '--', cmd, 'logs', '--follow'], {
    cwd: FRAMEWORK,
    stdio: 'inherit',
    shell: win,
  });

  await new Promise((resolve) => follower.on('exit', resolve));
  follower = null;

  // Reached only when the follower returned on its own, which it does when the
  // server it was watching went away.
  if (!handled) say(`${cmd} server is no longer running`);
}
