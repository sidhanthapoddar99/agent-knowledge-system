#!/usr/bin/env node
/**
 * `start` — the entry point for the astro-doc-code framework.
 *
 * ONE IMPLEMENTATION. This replaces a 447-line bash script and its 397-line
 * PowerShell twin. The twin was the actual problem: every feature had to be
 * written twice and the two drifted, and the Windows half was only ever
 * parse-verified because nobody had a Windows host to run it on. The repo
 * already requires bun or node to do anything at all, so a JS implementation
 * costs nothing and deletes the second copy outright.
 *
 * ## The bare command is `dev`, deliberately
 *
 * It used to be "update check → install → full production build → dev". That
 * build is a real check — dev renders through `matchServerRoute()` while the
 * build enumerates through `getStaticPaths()`, so a duplicate-URL bug fails the
 * build and is invisible in dev — but it was checking the wrong thing at the
 * wrong time. Measured: ~6 s and ~100 MB written per invocation, on a command
 * typed ~20 times a day, for an answer that only matters when you publish.
 *
 * So the check moved to `start doctor`, which is what you run before shipping.
 * Dev never touches `dist/` — verified by deleting it and serving every route.
 */
import fs from 'node:fs';
import path from 'node:path';

import { REPO, FRAMEWORK, say, warn, die } from './lib/util.mjs';
import { pickRunner, runScript, ensureDeps } from './lib/runner.mjs';
import { isRunning, control, stop, runServer, depsInstalled } from './lib/server.mjs';
import { updateCheck, shallowCheck } from './lib/update.mjs';
import { versionPrecheck } from './lib/version.mjs';

const HELP = `
start — run and manage the documentation site

USAGE
  start [command] [options]

COMMANDS
  (none) | dev      start the dev server (hot reload). The default.
  build             production build. Cleans caches first.
  preview           serve the built site from dist/
  doctor            update check + install + a full build, as a pre-publish check
  stop   [dev|preview]              stop a running server (default: both)
  status [dev|preview]              is anything running, and where (default: both)
  logs   [dev|preview] [--follow]   read a running server's output (default: dev)
  clean  [command]  wipe build caches, then optionally run <command>
  <script>          any other package.json script, forwarded as-is

OPTIONS
  --detach          background the server instead of holding this terminal.
                    Without it, Ctrl-C stops the server.
  --no-clean        for 'build': keep caches instead of wiping them first
  -h, --help        this text

ENVIRONMENT
  START_SKIP_UPDATE_CHECK=1        never check git for updates
  START_UPDATE_INTERVAL_HOURS=N    how often to check (default 6, 0 = every time)
  START_SKIP_VERSION_CHECK=1       skip the content/engine version precheck
  START_NONINTERACTIVE=1           never prompt; assume the safe answer

NOTES
  Dev does not build, and does not read dist/. Run 'start doctor' before you
  publish — that is where a build error you cannot see in dev will surface.

  Every command that launches or builds first checks site.yaml's engine_version
  against the engine's supported range, and stops if it is outside. The engine
  enforces the same rule, but only when it loads config — which in dev is the
  first request (after 'ready'), and in preview is never.

  Caches live in two places with confusingly similar names:
    astro-doc-code/.astro/               dev + preview LOCK FILES
    astro-doc-code/node_modules/.astro/  Astro's cacheDir (build cache)
  'start clean' wipes both, and stops any running server first, because
  removing a lock file out from under a live server orphans it.
`.trimStart();

const CACHES = ['.astro', 'dist', 'node_modules/.vite', 'node_modules/.astro'];

/** Wipe build caches. Stops servers first — their lock files live in .astro/. */
async function clean(runner) {
  for (const cmd of ['dev', 'preview']) {
    if (isRunning(runner, cmd)) {
      say(`a ${cmd} server is running — stopping it before wiping .astro/ (its lock file lives there)`);
      await stop(runner, cmd);
    }
  }
  say(`cleaning caches: ${CACHES.map((c) => c + '/').join(', ')}`);
  for (const rel of CACHES) fs.rmSync(path.join(FRAMEWORK, rel), { recursive: true, force: true });
}

async function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('-')));
  const args = argv.filter((a) => !a.startsWith('-'));
  const passthrough = argv.filter((a) => a.startsWith('--') && !['--detach', '--no-clean', '--help'].includes(a));

  if (flags.has('-h') || flags.has('--help')) { process.stdout.write(HELP); return; }

  let command = args[0] ?? 'dev';
  const rest = args.slice(1);

  // Server-control verbs answer instantly and never prompt to pull, install or
  // build — they are what you reach for when you suspect something is running.
  if (['stop', 'status', 'logs'].includes(command)) {
    const runner = pickRunner();
    if (!depsInstalled()) { say('dependencies are not installed — no server can be running'); return; }
    const targets = ['dev', 'preview'].includes(rest[0])
      ? [rest.shift()]
      : (command === 'logs' ? ['dev'] : ['dev', 'preview']);
    const extra = [...rest, ...passthrough];
    let code = 0;
    for (const t of targets) code = control(runner, t, command, extra) || code;
    process.exit(code);
  }

  const runner = pickRunner();

  if (command === 'clean') {
    await clean(runner);
    if (rest.length === 0) { say('clean done'); return; }
    command = rest.shift();
    say(`clean done — continuing with: ${command}`);
  }

  // Everything below launches or builds something, so it wants fresh deps and
  // an occasional look upstream.
  await updateCheck();
  await shallowCheck();
  say(`runner: ${runner.name}`);
  await ensureDeps(runner);

  // Before anything starts. The engine's own gate fires too late to be useful
  // in dev (first request, not startup) and not at all in preview — see
  // lib/version.mjs. Runs after the update check on purpose: a pull can move
  // ENGINE_VERSION, and the answer should be about the code we are about to run.
  versionPrecheck();

  const detach = flags.has('--detach');

  switch (command) {
    case 'dev':
    case 'preview':
      await runServer(runner, command, { detach, extra: passthrough });
      return;

    case 'build': {
      // A published artefact should not inherit yesterday's caches.
      if (!flags.has('--no-clean')) await clean(runner);
      const res = runScript(runner, ['build', '--', ...passthrough]);
      process.exit(res.status ?? 1);
    }

    case 'doctor': {
      say('running a full build to catch what dev cannot show...');
      const res = runScript(runner, ['build']);
      if (res.status !== 0) die('build failed');
      say('build clean — safe to publish');
      return;
    }

    default: {
      // Any other package.json script, forwarded as-is.
      const res = runScript(runner, [command, ...rest, ...passthrough]);
      process.exit(res.status ?? 1);
    }
  }
}

main(process.argv.slice(2)).catch((err) => {
  warn(err?.stack || String(err));
  process.exit(1);
});
