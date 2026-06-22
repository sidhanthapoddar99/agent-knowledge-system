/**
 * _git.mjs — shared core for the `git` content helper (Category 1, subtask 12).
 *
 * Surfaces the git-derived metadata the framework already leans on (the tracker
 * derives an issue's `updated` from git history) as first-class CLI verbs, so an
 * agent doesn't have to shell out to raw git and reinvent path resolution:
 *
 *   docs git updated <path>          last-commit date for any issue/doc/post
 *   docs git changed --since <ref>   content changed under data/ (review sweeps)
 *   docs git log <issue|path>        commit history of one folder/file
 *   docs git commit --scope <path>   GUARDED: stage + commit ONLY that path
 *
 * Schema-agnostic — runs over any content path. Reuses docs-move's proven
 * execFileSync git pattern. Honors the Category-0 contract: --json everywhere,
 * exit 0 ok / 1 nothing / 2 usage. **commit/push stay explicit, never automatic.**
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { parseArgs, emitJson, writeStdout } from './_cli.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

function ctx() {
  return resolveProjectContext(SCRIPT_DIR);
}

/** Run git, return trimmed stdout. Throws on non-zero (caller decides). */
function git(args, cwd) {
  return execFileSync('git', args, {
    cwd, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function repoRoot(cwd) {
  return git(['rev-parse', '--show-toplevel'], cwd);
}

/**
 * Resolve a CLI argument to an absolute content path. Accepts (in order):
 *   • an absolute path that exists
 *   • a path relative to the current working directory
 *   • a bare issue id under data/todo/<id>
 *   • a path relative to the content root's data/ dir
 * Returns null if nothing resolves.
 */
export function resolveContentTarget(arg) {
  if (!arg) return null;
  const { contentRoot } = ctx();
  const data = path.join(contentRoot, 'data');
  const candidates = [
    path.isAbsolute(arg) ? arg : null,
    path.resolve(process.cwd(), arg),
    path.join(data, 'todo', arg),
    path.join(data, arg),
    path.join(contentRoot, arg),
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return null;
}

function lastCommit(abs) {
  const cwd = fs.statSync(abs).isDirectory() ? abs : path.dirname(abs);
  // %H hash · %cI committer date (ISO) · %an author · %s subject
  const out = git(['log', '-1', '--format=%H%x00%cI%x00%an%x00%s', '--', abs], cwd);
  if (!out) return null;
  const [hash, date, author, subject] = out.split('\0');
  return { hash, date, author, subject };
}

// ---- commands ---------------------------------------------------------------

export function cmdUpdated(argv) {
  const args = parseArgs(argv);
  const target = resolveContentTarget(args._[0]);
  if (!args._[0]) { console.error('Usage: docs git updated <issue|path> [--json]'); process.exit(2); }
  if (!target) { console.error(`Not found: ${args._[0]}`); process.exit(1); }
  let c;
  try { c = lastCommit(target); } catch (e) { console.error(`git error: ${e.message.split('\n')[0]}`); process.exit(1); }
  if (!c) { console.error(`No git history for: ${args._[0]}`); process.exit(1); }
  const rel = path.relative(ctx().contentRoot, target);
  if (args.flags.json) { emitJson({ path: rel, ...c }); process.exit(0); }
  writeStdout(`${c.date}\t${c.hash.slice(0, 9)}\t${c.author}\t${c.subject}\n`);
  process.exit(0);
}

export function cmdChanged(argv) {
  const args = parseArgs(argv);
  const since = typeof args.flags.since === 'string' ? args.flags.since : null;
  if (!since) { console.error('Usage: docs git changed --since <ref> [--type docs,blog,issues] [--json]'); process.exit(2); }
  const { contentRoot } = ctx();
  const data = path.join(contentRoot, 'data');
  let root, pathspec;
  try {
    root = repoRoot(data);
    pathspec = path.relative(root, data) || '.';
  } catch (e) { console.error(`Not a git work tree: ${e.message.split('\n')[0]}`); process.exit(1); }
  let raw;
  try { raw = git(['diff', '--name-only', since, '--', pathspec], root); }
  catch (e) { console.error(`git error: ${e.message.split('\n')[0]}`); process.exit(1); }
  let files = raw ? raw.split('\n').filter(Boolean).map((f) => path.join(root, f)) : [];
  // Optional --type filter, reusing the same classifier `find` uses.
  const types = typeof args.flags.type === 'string' ? args.flags.type.split(',').map((s) => s.trim()).filter(Boolean) : [];
  if (types.length) {
    const want = new Set(types);
    files = files.filter((f) => {
      const top = path.relative(data, f).split(path.sep)[0];
      const t = top === 'blog' ? 'blog' : top === 'todo' ? 'issues' : 'docs';
      return want.has(t);
    });
  }
  const rels = files.map((f) => path.relative(contentRoot, f)).sort();
  if (args.flags.json) { emitJson({ since, count: rels.length, files: rels }); process.exit(rels.length ? 0 : 1); }
  if (rels.length) writeStdout(rels.join('\n') + '\n');
  process.exit(rels.length ? 0 : 1);
}

export function cmdLog(argv) {
  const args = parseArgs(argv);
  const target = resolveContentTarget(args._[0]);
  if (!args._[0]) { console.error('Usage: docs git log <issue|path> [--limit N] [--json]'); process.exit(2); }
  if (!target) { console.error(`Not found: ${args._[0]}`); process.exit(1); }
  const limit = args.flags.limit ? parseInt(args.flags.limit, 10) : 20;
  const cwd = fs.statSync(target).isDirectory() ? target : path.dirname(target);
  let raw;
  try { raw = git(['log', `-n${limit}`, '--format=%H%x00%cI%x00%an%x00%s', '--', target], cwd); }
  catch (e) { console.error(`git error: ${e.message.split('\n')[0]}`); process.exit(1); }
  const commits = raw ? raw.split('\n').filter(Boolean).map((l) => {
    const [hash, date, author, subject] = l.split('\0');
    return { hash, date, author, subject };
  }) : [];
  if (args.flags.json) {
    emitJson({ path: path.relative(ctx().contentRoot, target), count: commits.length, commits });
    process.exit(commits.length ? 0 : 1);
  }
  const lines = commits.map((c) => `${c.date}\t${c.hash.slice(0, 9)}\t${c.author}\t${c.subject}`);
  if (lines.length) writeStdout(lines.join('\n') + '\n');
  process.exit(commits.length ? 0 : 1);
}

export function cmdCommit(argv) {
  const args = parseArgs(argv);
  const scopeArg = typeof args.flags.scope === 'string' ? args.flags.scope : null;
  const message = typeof args.flags.message === 'string' ? args.flags.message
    : (typeof args.flags.m === 'string' ? args.flags.m : null);
  if (!scopeArg || !message) {
    console.error('Usage: docs git commit --scope <path> --message <msg> [--dry-run] [--json]');
    console.error('  Stages and commits ONLY <path>. Never pushes. Commit is explicit.');
    process.exit(2);
  }
  const target = resolveContentTarget(scopeArg);
  if (!target) { console.error(`Not found: ${scopeArg}`); process.exit(1); }
  let root;
  try { root = repoRoot(fs.statSync(target).isDirectory() ? target : path.dirname(target)); }
  catch (e) { console.error(`Not a git work tree: ${e.message.split('\n')[0]}`); process.exit(1); }
  // What would be committed (scoped status), so dry-run is honest.
  let pending;
  try { pending = git(['status', '--porcelain', '--', target], root); }
  catch (e) { console.error(`git error: ${e.message.split('\n')[0]}`); process.exit(1); }
  if (!pending) { console.error(`Nothing to commit under: ${scopeArg}`); process.exit(1); }
  const changed = pending.split('\n').filter(Boolean).map((l) => l.slice(3));
  if (args.flags['dry-run']) {
    const payload = { dryRun: true, scope: path.relative(ctx().contentRoot, target), message, files: changed };
    if (args.flags.json) { emitJson(payload); process.exit(0); }
    writeStdout(`[dry-run] would commit ${changed.length} path(s) under ${scopeArg}:\n` +
      changed.map((f) => '  ' + f).join('\n') + `\nmessage: ${message}\n`);
    process.exit(0);
  }
  try {
    git(['add', '--', target], root);
    git(['commit', '-m', message, '--', target], root);
  } catch (e) { console.error(`git error: ${e.message.split('\n')[0]}`); process.exit(1); }
  const head = git(['rev-parse', '--short', 'HEAD'], root);
  const payload = { committed: true, hash: head, scope: path.relative(ctx().contentRoot, target), message, files: changed };
  if (args.flags.json) { emitJson(payload); process.exit(0); }
  writeStdout(`Committed ${head}: ${message}\n  ${changed.length} path(s) under ${scopeArg} (not pushed)\n`);
  process.exit(0);
}
