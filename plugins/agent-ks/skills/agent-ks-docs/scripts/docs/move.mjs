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
 * ORDERING LABELS are recomputed the same way. Text that opens with the
 * target's ordering path — `[040/100 the migration script](…)`, the numbers a
 * reader matches against the sidebar — has that path rebuilt from the target's
 * NEW location, so renumbering a folder or moving a file between groups never
 * leaves a label pointing at where something used to sit. Text with no label
 * never gains one; the convention is optional.
 *
 * Links are matched with a regex but every candidate is resolved as a real
 * filesystem path before deciding to rewrite — external (http/mailto),
 * site-absolute (`/...`) and pure-anchor (`#...`) links are left untouched.
 * FENCED BLOCKS are skipped: a link inside one is sample syntax, not a link,
 * and rewriting it edits someone's worked example to point somewhere else.
 *
 *   agent-ks move <from> <to> [--dry-run] [--no-git] [--root <dir>] [--help]
 *
 * Exit code 0 = success (or dry-run), 1 = error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import {
  MD_LINK_RE, isIgnorableTarget, splitAnchor, collectMarkdownFiles, blankedProseLines,
  orderingPathFor, relabelOrdering, makeFenceTracker,
} from '../_links.mjs';
import { FIRST_CLASS_PAGE_EXTS, sidecarPathsFor } from '../_page-types.mjs';

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
  out('Usage: agent-ks move <from> <to> [--dry-run] [--no-git] [--root <dir>] [--help]\n');
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
  out('  A first-class page\'s .meta.json / .meta.jsonc sidecar travels with it, renamed to match.');
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

// ── coupled files: the metadata sidecar ──────────────────────────────────
// A first-class non-markdown page (`.html` artifact, diagram source) may carry a
// same-basename `<NN_name>.meta.json` / `.meta.jsonc` sidecar holding its title,
// sidebar label, embed height and theme mode. It is found by NAME CONVENTION
// from its partner — nothing links to it — so it is not a neighbour of the page,
// it is part of it, and it has to travel with it. Moving one without the other
// produces two broken things at once: a page whose metadata has vanished, and a
// stray sidecar the loader flags as an orphan.
//
// Which extensions are pages, and what a sidecar is called, come from the shared
// `_page-types.mjs` — the same module `docs/check.mjs` reads for the opposite
// question ("is this file a sidecar, so don't warn about it as stray"). One
// definition, so a new page type cannot reach one tool and miss the other.

/**
 * Sidecars that must travel with a single-file move, as `{ from, to }` pairs.
 * Empty for a directory move (a sidecar inside the directory moves with it) and
 * for a page type that has none.
 */
function sidecarMoves() {
  if (fromIsDir) return [];
  const ext = path.extname(fromPath).toLowerCase();
  if (!FIRST_CLASS_PAGE_EXTS.has(ext)) return [];
  const fromBase = fromPath.slice(0, fromPath.length - path.extname(fromPath).length);
  const toBase = toPath.slice(0, toPath.length - path.extname(toPath).length);
  const sources = sidecarPathsFor(fromBase);
  const destinations = sidecarPathsFor(toBase);
  const out = [];
  for (let i = 0; i < sources.length; i++) {
    if (fs.existsSync(sources[i])) out.push({ from: sources[i], to: destinations[i] });
  }
  return out;
}

const sidecars = sidecarMoves();

// Never overwrite a file the caller did not name. Checked before anything moves,
// so a refusal leaves the tree exactly as it was.
for (const s of sidecars) {
  if (fs.existsSync(s.to)) {
    console.error(`sidecar destination already exists: ${s.to}\n  Refusing to overwrite it. Move or remove it first.`);
    process.exit(1);
  }
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

const LINK_RE = MD_LINK_RE; // shared regex from ../_links.mjs (also used by agent-ks img)

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
// Site-absolute internal links met along the way. `move` cannot rewrite these
// and never could; what changed is that it now says so instead of passing over
// them in silence. A run that maintained 40 links and abandoned 12 used to look
// exactly like a run that maintained 52.
const unmaintainable = [];

/**
 * `col` is the match offset and it is load-bearing, not decoration.
 *
 * Edits used to be applied with `line.replace(old, new)` — first occurrence
 * wins. That was harmless while every occurrence of a link was a link. It stopped
 * being harmless once code spans were excluded from scanning: the SAME link can
 * now appear twice on one line, once inside backticks as an example and once in
 * prose, and a first-occurrence replace would edit whichever came first — the
 * example. Splicing at the offset the scan actually matched cannot pick wrong.
 */
function addEdit(finalAbs, line, col, oldFull, newFull) {
  if (oldFull === newFull) return;
  if (!editsByFile.has(finalAbs)) editsByFile.set(finalAbs, []);
  editsByFile.get(finalAbs).push({ line, col, old: oldFull, new: newFull });
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
  const isProse = makeFenceTracker();
  const scannedLines = blankedProseLines(lines.join('\n'));

  lines.forEach((lineText, idx) => {
    if (!isProse(lineText)) return;   // inside a fenced example — not a link
    // A link inside BACKTICKS is being shown, not used — a doc telling a reader
    // what to type. Rewriting one edits the example into a lie, which is the
    // same damage as rewriting a fenced block. `move` tracked fences and not
    // spans until 2026-08-04; demonstrated on a fixture, where a dry run
    // rewrote `[Overview](./01_overview.md)` inside a code span.
    // The blanker replaces spans with same-length filler, so match offsets stay
    // valid against the untouched line that actually gets edited.
    const scanned = scannedLines[idx] ?? lineText;
    let m;
    LINK_RE.lastIndex = 0;
    while ((m = LINK_RE.exec(scanned)) !== null) {
      const [full, bang, text, target, title] = m;
      if (isIgnorableTarget(target)) {
        // A site-absolute INTERNAL link is not external and not an anchor — it
        // is a link this tool cannot maintain, because it cannot know what URL
        // prefix a section publishes under. Skipping is correct; skipping in
        // SILENCE is what let 341 links be converted to this form without
        // anyone noticing they had left link maintenance. Count them and say so.
        if (target.startsWith('/') && !target.startsWith('//')) {
          unmaintainable.push(`${file}:${idx + 1}  [${text}](${target})`);
        }
        continue;
      }
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
      // Two text rewrites, and they are mutually exclusive in practice: a
      // path-mirror has no ordering label, and a labelled link is descriptive
      // rather than a mirror. Applied in sequence so neither has to know about
      // the other.
      const mirrored = mirrorText(text, target, rel, newTarget, newRel);
      const newText = relabelOrdering(mirrored, orderingPathFor(targetAbsFinal));

      const newFull = `${bang}[${newText}](${newTarget}${title || ''})`;
      if (newFull === full) continue; // neither target nor text changed
      addEdit(finalFile, idx + 1, m.index, full, newFull);
    }
  });
}

// ── plan summary (dry-run) or execute ──────────────────────────────────────
const movedFileCount = fromIsDir ? collectMarkdownFiles(fromPath).length || movedFilesAbs.size : 1;
const totalEdits = [...editsByFile.values()].reduce((n, arr) => n + arr.length, 0);
const filesTouched = [...editsByFile.keys()].filter(f => editsByFile.get(f).length).length;

if (dryRun) {
  console.log(`# agent-ks move (dry-run)\n`);
  console.log(`move:  ${fromPath}`);
  console.log(`   →   ${toPath}`);
  console.log(`mode:  ${noGit ? 'fs (forced --no-git)' : (inGitTree(fromPath) ? 'git mv' : 'fs (not a git work tree)')}\n`);
  for (const s of sidecars) {
    console.log(`sidecar: ${s.from}`);
    console.log(`   →     ${s.to}`);
  }
  if (sidecars.length) console.log('');
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
  reportUnmaintainable();
  process.exit(0);
}

/**
 * Say what was skipped. A warning, not an error — `move` is doing its job
 * correctly and refusing to move a file over someone else's link form would be
 * disproportionate. But the count has to be visible, because the failure this
 * prevents is not a crash: it is a link set that quietly shrinks while every
 * run still reports success.
 */
function reportUnmaintainable() {
  if (!unmaintainable.length) return;
  console.log(`\n⚠ ${unmaintainable.length} site-absolute link(s) left UNMAINTAINED.`);
  console.log(`  A "/" target is a URL from the site root, not a path — it is not true on disk,`);
  console.log(`  so no filesystem tool can follow it. \`move\` cannot rewrite one (it cannot know`);
  console.log(`  what URL prefix a section publishes under), and neither can grep or an editor.`);
  console.log(`  These will not follow a file when it moves.`);
  console.log(`  Rewrite them as relative links (./x, ../x) to bring them back into maintenance.\n`);
  for (const u of unmaintainable) console.log(`  ${u}`);
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

/**
 * Move one path with the best mechanism available: `git mv` inside a work tree
 * (so history follows), a plain filesystem move otherwise or on refusal.
 * Returns the mode actually used, for the summary line.
 */
function performMove(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (!noGit && inGitTree(src)) {
    try {
      execFileSync('git', ['mv', src, dst], {
        cwd: path.dirname(src), stdio: ['ignore', 'pipe', 'pipe'],
      });
      return 'git mv';
    } catch {
      // Fall back to fs move if git mv refused (e.g. untracked file).
      fsMoveRecursive(src, dst);
      return 'fs (git mv failed, fell back)';
    }
  }
  fsMoveRecursive(src, dst);
  return noGit ? 'fs (--no-git)' : 'fs';
}

const moveMode = performMove(fromPath, toPath);
// The sidecar goes the same way, by the same mechanism, immediately after its
// page — see the coupled-files note above.
const sidecarsMoved = sidecars.map(s => ({ ...s, mode: performMove(s.from, s.to) }));

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
  // Right-to-left within a line, so an earlier edit never shifts a later offset.
  for (const e of [...arr].sort((a, b) => b.line - a.line || b.col - a.col)) {
    const i = e.line - 1;
    if (i < 0 || i >= lines.length) continue;
    // Assert at the offset rather than anywhere on the line. A mismatch here
    // means the file changed under us, and skipping is the safe answer.
    if (lines[i].slice(e.col, e.col + e.old.length) === e.old) {
      lines[i] = lines[i].slice(0, e.col) + e.new + lines[i].slice(e.col + e.old.length);
      editedLinks++;
      touched = true;
    } else {
      console.error(`warning: expected link not found at ${finalAbs}:${e.line}:${e.col + 1} (skipped): ${e.old}`);
    }
  }
  if (touched) {
    fs.writeFileSync(finalAbs, lines.join('\n'));
    editedFiles++;
  }
}

console.log(`moved ${movedFileCount} file(s) [${moveMode}]; rewrote ${editedLinks} link(s) across ${editedFiles} file(s)`);
for (const s of sidecarsMoved) {
  console.log(`carried sidecar: ${s.from}  →  ${s.to} [${s.mode}]`);
}
reportUnmaintainable();
process.exit(0);
