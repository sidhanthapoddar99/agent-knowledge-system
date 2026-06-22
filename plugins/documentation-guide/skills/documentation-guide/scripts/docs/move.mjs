#!/usr/bin/env bun
/**
 * docs/move.mjs — Obsidian-style link-aware move / rename for docs files & folders.
 *
 * Moving a markdown file with plain `mv` / `git mv` silently breaks every
 * relative link that pointed at it, plus every relative link *inside* it that
 * pointed elsewhere. This script moves the file (preferring `git mv` to keep
 * history) and then rewrites both sides:
 *
 *   • INBOUND  — links in other pages that pointed at the moved path are
 *     repointed at its new location.
 *   • OUTBOUND — links inside the moved page(s) that pointed at files which
 *     did NOT move are recomputed from the new directory so they still resolve.
 *
 * When a link's visible TEXT is itself the path string (e.g.
 * `` [`../a/b.md`](../a/b.md) `` — common in indexes), the text is rewritten to
 * mirror the new target too, so the rendered text never disagrees with where it
 * points. Descriptive text (`[the guide](../a/b.md)`) is left untouched.
 *
 * Links are matched with a regex but every candidate is resolved as a real
 * filesystem path before deciding to rewrite — external (http/mailto),
 * site-absolute (`/...`) and pure-anchor (`#...`) links are left untouched.
 *
 *   docs-move <from> <to> [--dry-run] [--no-git] [--root <dir>] [--help]
 *
 * Exit code 0 = success (or dry-run), 1 = error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import { MD_LINK_RE, isIgnorableTarget, splitAnchor, collectMarkdownFiles } from '../_links.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// ── arg parsing ──────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const positional = [];
let dryRun = false;
let noGit = false;
let rootOverride = null;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--help' || a === '-h') usage(0);
  else if (a === '--dry-run') dryRun = true;
  else if (a === '--no-git') noGit = true;
  else if (a === '--root') rootOverride = args[++i];
  else if (a.startsWith('--root=')) rootOverride = a.slice('--root='.length);
  else if (a.startsWith('-')) { console.error(`Unknown flag: ${a}`); usage(1); }
  else positional.push(a);
}

if (positional.length !== 2) {
  console.error('Expected exactly two positional arguments: <from> <to>\n');
  usage(1);
}

function usage(code) {
  const out = code === 0 ? console.log : console.error;
  out('Usage: docs-move <from> <to> [--dry-run] [--no-git] [--root <dir>] [--help]\n');
  out('  Link-aware move / rename for docs files and folders (Obsidian-style).');
  out('  Moves <from> to <to> and rewrites Markdown links so nothing breaks:');
  out('    • inbound  — links elsewhere that pointed at <from> are repointed');
  out('    • outbound — links inside moved files that pointed elsewhere are recomputed\n');
  out('  <from>      a .md file OR a directory (moved recursively, all depths)');
  out('  <to>        destination path (must not already exist; parents created)\n');
  out('  --dry-run   print the planned move + every link edit, change nothing');
  out('  --no-git    force a plain fs move even inside a git work tree');
  out('  --root <dir>  widen / override the scan + validation scope (default: content root from .env)');
  out('  --help      show this help\n');
  out('  External (http/https/mailto), site-absolute (/...), and pure-anchor (#...) links are ignored.');
  process.exit(code);
}

// ── resolve scope (content root, unless --root widens it) ────────────────
let scanRoot;
try {
  if (rootOverride) {
    scanRoot = path.resolve(rootOverride);
    if (!fs.existsSync(scanRoot) || !fs.statSync(scanRoot).isDirectory()) {
      console.error(`--root is not a directory: ${scanRoot}`);
      process.exit(1);
    }
  } else {
    const ctx = resolveProjectContext(SCRIPT_DIR);
    scanRoot = ctx.contentRoot;
  }
} catch (e) {
  console.error(`Could not resolve content root: ${e.message}`);
  process.exit(1);
}

const fromPath = path.resolve(positional[0]);
const toPath = path.resolve(positional[1]);

// ── validation ───────────────────────────────────────────────────────────
if (!fs.existsSync(fromPath)) {
  console.error(`<from> does not exist: ${fromPath}`);
  process.exit(1);
}
if (fs.existsSync(toPath)) {
  console.error(`<to> already exists: ${toPath}`);
  process.exit(1);
}

const fromStat = fs.statSync(fromPath);
const fromIsDir = fromStat.isDirectory();

function isInside(parent, child) {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

if (!isInside(scanRoot, fromPath)) {
  console.error(`<from> resolves outside the content root (${scanRoot}):\n  ${fromPath}\n  Pass --root <dir> to widen the scope.`);
  process.exit(1);
}
if (!isInside(scanRoot, toPath)) {
  console.error(`<to> resolves outside the content root (${scanRoot}):\n  ${toPath}\n  Pass --root <dir> to widen the scope.`);
  process.exit(1);
}

// ── helpers ──────────────────────────────────────────────────────────────

// collectMarkdownFiles() + MD_LINK_RE + isIgnorableTarget come from ../_links.mjs.

/** Recursively collect every file (any extension) under a directory. */
function collectAllFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectAllFiles(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

/** Map an absolute path under `fromPath` to its post-move absolute path. */
function mappedPath(abs) {
  if (abs === fromPath) return toPath;
  if (fromIsDir && isInside(fromPath, abs)) {
    return path.join(toPath, path.relative(fromPath, abs));
  }
  return abs; // unaffected by the move
}

// Set of absolute paths that are moving (for "did this move?" checks).
const movedFilesAbs = new Set(
  fromIsDir ? collectAllFiles(fromPath) : [fromPath]
);
function didMove(abs) {
  return movedFilesAbs.has(abs);
}

const LINK_RE = MD_LINK_RE; // shared regex from ../_links.mjs (also used by docs-img)

/**
 * Build a POSIX-style relative link from fileDir to targetAbs.
 * Ensures a leading `./` for same-dir / descendant targets so it reads as a
 * relative link rather than a bare word.
 */
function relLink(fileDir, targetAbs) {
  let rel = path.relative(fileDir, targetAbs);
  rel = rel.split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

/**
 * If a link's visible text is itself the path it points at (optionally wrapped
 * in a single pair of backticks, with or without the #anchor), return the text
 * updated to mirror the new target. Otherwise return the text unchanged — we
 * only touch text that is a bare path-mirror, never descriptive labels.
 *
 *   `[`old#a`](old#a)`  → mirrors full target → rewrite to `new#a`
 *   `[`old`](old#a)`    → mirrors rel only    → rewrite to `new` (rel, no anchor)
 */
function mirrorText(text, oldTarget, oldRel, newTarget, newRel) {
  const m = /^(`?)([^`]*)(`?)$/.exec(text);
  if (!m) return text;
  const [, open, inner, close] = m;
  if ((open === '`') !== (close === '`')) return text; // unbalanced backticks
  if (inner === oldTarget) return `${open}${newTarget}${close}`;
  if (oldRel && inner === oldRel) return `${open}${newRel}${close}`;
  return text;
}

// ── compute link edits ───────────────────────────────────────────────────
// An edit: { file (FINAL abs path), line (1-based), oldLink, newLink }
// We compute against FINAL locations so moved↔moved links self-correct.

const editsByFile = new Map(); // finalAbs -> [{line, old, new}]

function addEdit(finalAbs, line, oldFull, newFull) {
  if (oldFull === newFull) return;
  if (!editsByFile.has(finalAbs)) editsByFile.set(finalAbs, []);
  editsByFile.get(finalAbs).push({ line, old: oldFull, new: newFull });
}

// Files to scan for links: every .md in scope, plus moved .md files (which may
// live outside scanRoot if --root is narrow — but normally they're inside).
const scanFiles = new Set(collectMarkdownFiles(scanRoot));
if (fromIsDir) for (const f of collectMarkdownFiles(fromPath)) scanFiles.add(f);
else if (fromPath.endsWith('.md')) scanFiles.add(fromPath);

for (const file of scanFiles) {
  const moved = didMove(file);
  // The directory this file's links will be resolved-from AFTER the move.
  const finalFile = mappedPath(file);
  const finalDir = path.dirname(finalFile);
  // Links are currently written relative to the file's CURRENT directory.
  const currentDir = path.dirname(file);

  let content;
  try { content = fs.readFileSync(file, 'utf-8'); }
  catch { continue; }
  const lines = content.split('\n');

  lines.forEach((lineText, idx) => {
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(lineText)) !== null) {
      const [full, bang, text, target] = m;
      if (isIgnorableTarget(target)) continue;
      const { rel, anchor } = splitAnchor(target);
      if (rel === '') continue; // target was pure-anchor after all

      // Resolve the link target to a CURRENT absolute path.
      const targetAbsCurrent = path.resolve(currentDir, rel);
      // Where will that target live after the move?
      const targetAbsFinal = mappedPath(targetAbsCurrent);

      // If neither the file nor its target moved, the existing link is still
      // valid as written — leave it untouched (don't churn unrelated links
      // just to normalise their form).
      if (!moved && targetAbsFinal === targetAbsCurrent) continue;

      // Recompute the link from the file's FINAL directory to the target's
      // FINAL location.
      const newRel = relLink(finalDir, targetAbsFinal);
      const newTarget = newRel + anchor;
      const newText = mirrorText(text, target, rel, newTarget, newRel);

      const newFull = `${bang}[${newText}](${newTarget})`;
      if (newFull === full) continue; // neither target nor text changed
      addEdit(finalFile, idx + 1, full, newFull);
    }
  });
}

// ── plan summary (dry-run) or execute ──────────────────────────────────────
const movedFileCount = fromIsDir ? collectMarkdownFiles(fromPath).length || movedFilesAbs.size : 1;
const totalEdits = [...editsByFile.values()].reduce((n, arr) => n + arr.length, 0);
const filesTouched = [...editsByFile.keys()].filter(f => editsByFile.get(f).length).length;

if (dryRun) {
  console.log(`# docs-move (dry-run)\n`);
  console.log(`move:  ${fromPath}`);
  console.log(`   →   ${toPath}`);
  console.log(`mode:  ${noGit ? 'fs (forced --no-git)' : (inGitTree(fromPath) ? 'git mv' : 'fs (not a git work tree)')}\n`);
  if (totalEdits === 0) {
    console.log('No link edits needed.');
  } else {
    console.log(`# ${totalEdits} link edit(s) across ${filesTouched} file(s):\n`);
    for (const [finalAbs, arr] of editsByFile) {
      if (!arr.length) continue;
      // Show the path the file will have AFTER the move.
      for (const e of arr) {
        console.log(`${finalAbs}:${e.line}  ${e.old}  →  ${e.new}`);
      }
    }
  }
  process.exit(0);
}

// ── perform the filesystem move ────────────────────────────────────────────
function inGitTree(p) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: path.dirname(p), stdio: ['ignore', 'pipe', 'ignore'],
    });
    return true;
  } catch { return false; }
}

function fsMoveRecursive(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  try {
    fs.renameSync(src, dst); // fast path: same filesystem
    return;
  } catch (e) {
    if (e.code !== 'EXDEV') throw e;
  }
  // Cross-device: copy then remove.
  fs.cpSync(src, dst, { recursive: true });
  fs.rmSync(src, { recursive: true, force: true });
}

// Ensure destination parent dirs exist.
fs.mkdirSync(path.dirname(toPath), { recursive: true });

let moveMode;
if (!noGit && inGitTree(fromPath)) {
  try {
    execFileSync('git', ['mv', fromPath, toPath], {
      cwd: path.dirname(fromPath), stdio: ['ignore', 'pipe', 'pipe'],
    });
    moveMode = 'git mv';
  } catch (e) {
    // Fall back to fs move if git mv refused (e.g. untracked file).
    fsMoveRecursive(fromPath, toPath);
    moveMode = 'fs (git mv failed, fell back)';
  }
} else {
  fsMoveRecursive(fromPath, toPath);
  moveMode = noGit ? 'fs (--no-git)' : 'fs';
}

// ── apply link edits to the (now-final) files ──────────────────────────────
let editedFiles = 0;
let editedLinks = 0;
for (const [finalAbs, arr] of editsByFile) {
  if (!arr.length) continue;
  let content;
  try { content = fs.readFileSync(finalAbs, 'utf-8'); }
  catch (e) {
    console.error(`warning: could not read ${finalAbs} to rewrite links — ${e.message}`);
    continue;
  }
  const lines = content.split('\n');
  let touched = false;
  for (const e of arr) {
    const i = e.line - 1;
    if (i < 0 || i >= lines.length) continue;
    if (lines[i].includes(e.old)) {
      lines[i] = lines[i].replace(e.old, e.new);
      editedLinks++;
      touched = true;
    } else {
      console.error(`warning: expected link not found at ${finalAbs}:${e.line} (skipped): ${e.old}`);
    }
  }
  if (touched) {
    fs.writeFileSync(finalAbs, lines.join('\n'));
    editedFiles++;
  }
}

console.log(`moved ${movedFileCount} file(s) [${moveMode}]; rewrote ${editedLinks} link(s) across ${editedFiles} file(s)`);
process.exit(0);
