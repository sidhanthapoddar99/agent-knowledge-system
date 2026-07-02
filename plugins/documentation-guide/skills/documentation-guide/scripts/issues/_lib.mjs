/**
 * Shared utilities for scripts/issues/*.mjs
 *
 * Read-only helpers + safe surgical mutators. Mirrors the production
 * loadIssues() shape (src/loaders/issues.ts) but stays read-light:
 * no markdown rendering, no caching, no Astro coupling.
 *
 * Run with bun (preferred) or node — both support .mjs + node:* imports.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { resolveProjectContext } from '../_env.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';
import { parseArgs, printHelp } from '../_cli.mjs';
import { parseJsonc, preferJsonc } from '../_jsonc.mjs';

// parseArgs/printHelp now live canonically in _cli.mjs (lifted in subtask 02);
// re-exported here so issues/* import sites are unchanged.
export { parseArgs, printHelp };

// ---------- Paths & validation ----------------------------------------------

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Project context from the framework's .env (the same one astro.config.mjs
// reads). No hardcoded content-folder names — see _env.mjs for the full
// resolution policy. Resolved LAZILY: an explicit --tracker must be
// self-sufficient, so the env hunt only fires when a script actually needs
// the default location.
let _ctx = null;
function ctx() {
  if (!_ctx) _ctx = resolveProjectContext(SCRIPT_DIR);
  return _ctx;
}

/** Absolute path to the user's content root (parent of CONFIG_DIR by convention). */
export function getContentRoot() {
  return ctx().contentRoot;
}

/**
 * Resolve the tracker path for a script invocation. An explicit --tracker
 * value is resolved against cwd and used as-is — no .env required.
 * Without it, fall back to <content-root>/data/todo via the env hunt.
 */
export function resolveTracker(flagValue) {
  if (flagValue && flagValue !== true) {
    return path.resolve(process.cwd(), String(flagValue));
  }
  return path.join(getContentRoot(), 'data', 'todo');
}

/** Display helper — relative to content root when resolved, else cwd. */
function relForDisplay(filePath) {
  const base = _ctx ? _ctx.contentRoot : process.cwd();
  return path.relative(base, filePath) || filePath;
}

const FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$/;
const COMMENT_PATTERN = /^(\d+)_(\d{4}-\d{2}-\d{2})_([a-z0-9-]+)\.md$/i;

// Lifecycle vocabulary — the CLI's mirror of the framework constant
// (astro-doc-code/src/loaders/issue-status.ts). Fixed in code: issues and
// subtasks share these seven statuses grouped into four categories. Keep in
// sync with the loader (both are the single source on their side of the wall).
export const STATUSES = ['open', 'blocked', 'in-progress', 'input-needed', 'review', 'done', 'dropped'];
export const CATEGORIES = {
  'not-started': ['open', 'blocked'],
  'in-progress': ['in-progress'],
  'review': ['input-needed', 'review'],
  'closed': ['done', 'dropped'],
};
export const TERMINAL_STATUSES = CATEGORIES.closed;
export const REVIEW_STATUSES = CATEGORIES.review;
// Legacy values still tolerated on read (mapped) so a partially-migrated tree
// doesn't hard-fail the CLI; `check issues` flags them as needing migration.
export const LEGACY_STATUS_MAP = { closed: 'done', cancelled: 'dropped' };
const _STATUS_TO_CATEGORY = {};
for (const [cat, list] of Object.entries(CATEGORIES)) for (const s of list) _STATUS_TO_CATEGORY[s] = cat;

const VALID_STATES = STATUSES;

export function isValidState(s) {
  return STATUSES.includes(s);
}
export function categoryOf(status) {
  return _STATUS_TO_CATEGORY[status] || null;
}
/** Normalise a raw lifecycle value: canonical → itself; legacy → mapped;
 *  empty → 'open'; unknown → null (caller decides how loud to be). */
export function normalizeStatus(raw) {
  if (raw == null || raw === '') return 'open';
  if (STATUSES.includes(raw)) return raw;
  return LEGACY_STATUS_MAP[raw] || null;
}

/**
 * Allow-list: refuse to write anywhere outside `root`. Writer scripts pass
 * their tracker root (all writes land inside it), so an explicit --tracker
 * stays env-free; with no root given, falls back to the resolved content root.
 */
export function isInsideAllowed(filePath, root = getContentRoot()) {
  const abs = path.resolve(filePath);
  const base = path.resolve(root);
  return abs === base || abs.startsWith(base + path.sep);
}

// ---------- Args parsing ----------------------------------------------------

/**
 * Tiny CLI parser. Supports `--key value`, `--key=value`, bare flags, and
 * positional args (collected in `_`). No external dep.
 */
export function csv(s) {
  if (typeof s !== 'string') return [];
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

// ---------- Read helpers ----------------------------------------------------

export function readJson(filePath) {
  // Prefer a sibling `.jsonc` (comments / trailing commas) when present.
  try { return parseJsonc(fs.readFileSync(preferJsonc(filePath), 'utf-8')); }
  catch { return null; }
}

export function readVocabulary(trackerPath) {
  return readJson(path.join(trackerPath, 'settings.json')) ?? { fields: {} };
}

export function listIssueFolders(trackerPath) {
  if (!fs.existsSync(trackerPath)) return [];
  return fs
    .readdirSync(trackerPath, { withFileTypes: true })
    .filter((e) => e.isDirectory() && FOLDER_PATTERN.test(e.name))
    .map((e) => e.name)
    .sort();
}

export function readIssueMeta(trackerPath, issueId) {
  return readJson(path.join(trackerPath, issueId, 'settings.json'));
}

function makeSubtask(abs, groupPath) {
  const name = path.basename(abs);
  const slug = name.replace(/\.md$/, '');
  const { position: sequence, cleanName } = parseOrderPrefixLoose(slug);
  let title = cleanName.replace(/[-_]/g, ' ');
  let state = 'open';
  try {
    const fm = matter(fs.readFileSync(abs, 'utf-8')).data;
    if (fm.title) title = fm.title;
    // Canonical field is `status:`; tolerate the legacy `state:` name and
    // legacy values (closed/cancelled) so a partial migration still reads.
    const raw = fm.status ?? fm.state;
    const norm = normalizeStatus(raw);
    if (norm) state = norm;
  } catch { /* malformed frontmatter — keep defaults */ }
  return { slug, sequence, title, state, category: categoryOf(state), groupPath, filePath: abs, fileName: name };
}

/** Subtasks may live under up to 2 levels of grouping folders; the folder
 *  is a label only, never a body file. Each leaf .md is a first-class
 *  subtask. Returns a flat list with `groupPath` annotated. */
export function readIssueSubtasks(trackerPath, issueId) {
  const dir = path.join(trackerPath, issueId, 'subtasks');
  return walkTwoLevels(dir).map((e) => makeSubtask(e.filePath, e.groupPath));
}

/** Read group-folder labels under subtasks/. Each entry is `{ groupPath,
 *  sequence, title }`. Title is from the folder's optional settings.json
 *  (`title` field) else slug-derived. */
export function readIssueSubtaskGroups(trackerPath, issueId) {
  const dir = path.join(trackerPath, issueId, 'subtasks');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  function walk(absDir, groupPath) {
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }
    if (groupPath.length >= 2) return;
    const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
    for (const folder of subDirs) {
      const childPath = [...groupPath, folder];
      const childAbs = path.join(absDir, folder);
      const { position, cleanName } = parseOrderPrefixLoose(folder);
      let title = cleanName.replace(/[-_]/g, ' ').trim() || folder;
      const settings = readJson(path.join(childAbs, 'settings.json'));
      if (settings && typeof settings.title === 'string' && settings.title.length > 0) {
        title = settings.title;
      }
      out.push({
        groupPath: childPath,
        sequence: position,
        title,
      });
      walk(childAbs, childPath);
    }
  }
  walk(dir, []);
  return out;
}

export function readIssueComments(trackerPath, issueId) {
  const dir = path.join(trackerPath, issueId, 'comments');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((n) => n.endsWith('.md'))
    .sort()
    .map((name) => {
      const abs = path.join(dir, name);
      const m = name.match(COMMENT_PATTERN);
      let date = null, author = null, sequence = 0;
      if (m) {
        sequence = parseInt(m[1], 10);
        date = m[2];
        author = m[3];
      } else {
        const seq = name.match(/^(\d+)/);
        if (seq) sequence = parseInt(seq[1], 10);
        try {
          const fm = matter(fs.readFileSync(abs, 'utf-8')).data;
          if (fm.author) author = fm.author;
          if (fm.date) date = fm.date;
        } catch {}
      }
      return { name: name.replace(/\.md$/, ''), sequence, date, author, filePath: abs };
    });
}

/**
 * Walk a 2-level tree of `*.md` files under `rootDir`. Returns entries in
 * stable folder-then-name order. Each entry is `{ filePath, groupPath }`
 * where `groupPath` is 0/1/2 folder segments below `rootDir`. Anything
 * deeper than 2 levels is silently skipped (the loader is the source of
 * truth for warnings; CLI tools just read what's there).
 */
function walkTwoLevels(rootDir) {
  if (!fs.existsSync(rootDir)) return [];
  const out = [];
  function emit(absDir, groupPath) {
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }
    const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md')).map((e) => e.name).sort();
    for (const name of files) out.push({ filePath: path.join(absDir, name), groupPath });
    if (groupPath.length >= 2) return;
    const subDirs = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
    for (const folder of subDirs) emit(path.join(absDir, folder), [...groupPath, folder]);
  }
  emit(rootDir, []);
  return out;
}

function makeAgentLog(abs, groupPath) {
  const base = path.basename(abs).replace(/\.md$/, '');
  const sequence = parseOrderPrefixLoose(base).position ?? 0;
  let fm = {};
  try { fm = matter(fs.readFileSync(abs, 'utf-8')).data; } catch {}
  return {
    name: base,
    sequence,
    iteration: typeof fm.iteration === 'number' ? fm.iteration : null,
    agent: fm.agent || null,
    status: fm.status || null,
    date: fm.date || null,
    groupPath,
    filePath: abs,
  };
}

export function readIssueAgentLogs(trackerPath, issueId) {
  const dir = path.join(trackerPath, issueId, 'agent-log');
  return walkTwoLevels(dir).map((e) => makeAgentLog(e.filePath, e.groupPath));
}

export function readIssueNotes(trackerPath, issueId) {
  const dir = path.join(trackerPath, issueId, 'notes');
  return walkTwoLevels(dir).map((e) => ({
    name: path.basename(e.filePath).replace(/\.md$/, ''),
    filePath: e.filePath,
    groupPath: e.groupPath,
  }));
}

/**
 * Extract the YYYY-MM-DD prefix from an issue folder id. Returns null if
 * the id doesn't match the canonical pattern.
 */
export function issueDateFromId(issueId) {
  const m = issueId.match(FOLDER_PATTERN);
  return m ? m[1] : null;
}

/**
 * Build the list of files searchable for one issue. `fields` is an array
 * of subset names; `null` means all. Recognised: body, settings, comments,
 * subtasks, notes, agent-log.
 */
export function listSearchableFiles(trackerPath, issueId, fields = null) {
  const include = (name) => !fields || fields.includes(name);
  const issueDir = path.join(trackerPath, issueId);
  const files = [];

  if (include('body') || include('issue')) {
    const p = path.join(issueDir, 'issue.md');
    if (fs.existsSync(p)) files.push(p);
  }
  if (include('settings') || include('title')) {
    const p = path.join(issueDir, 'settings.json');
    if (fs.existsSync(p)) files.push(p);
  }
  // comments stays flat; subtasks + notes + agent-log allow 2-level subfolders
  if (include('comments')) {
    const dir = path.join(issueDir, 'comments');
    if (fs.existsSync(dir)) {
      for (const n of fs.readdirSync(dir).sort()) {
        if (n.endsWith('.md')) files.push(path.join(dir, n));
      }
    }
  }
  if (include('subtasks')) {
    for (const e of walkTwoLevels(path.join(issueDir, 'subtasks'))) files.push(e.filePath);
  }
  if (include('notes')) {
    for (const e of walkTwoLevels(path.join(issueDir, 'notes'))) files.push(e.filePath);
  }
  if (include('agent-log') || include('agent-logs')) {
    for (const e of walkTwoLevels(path.join(issueDir, 'agent-log'))) files.push(e.filePath);
  }
  return files;
}

// ---------- Search backend (rg → grep → js) --------------------------------

let cachedBackend = null;
let installHintShown = false;

function binaryAvailable(name) {
  try {
    const r = spawnSync(name, ['--version'], { stdio: 'ignore' });
    return r.status === 0;
  } catch { return false; }
}

/**
 * Pick the fastest search backend on PATH:
 *   tier 1 — `rg`   (parallel, rust regex)
 *   tier 2 — `grep` (POSIX, single-threaded native)
 *   tier 3 — `js`   (pure async fallback)
 * Cached per process.
 */
export function detectSearchBackend() {
  if (cachedBackend) return cachedBackend;
  if (binaryAvailable('rg'))   return (cachedBackend = { tier: 1, name: 'rg' });
  if (binaryAvailable('grep')) return (cachedBackend = { tier: 2, name: 'grep' });
  return (cachedBackend = { tier: 3, name: 'js' });
}

/**
 * Print a one-time stderr hint when running on tier 2 or 3, with platform-
 * appropriate install commands. Suppress with --quiet-tips or
 * DOCS_SKILL_QUIET_TIPS=1. Hint goes silent automatically once `rg` lands
 * on PATH (no caching beyond process lifetime).
 */
export function maybePrintInstallHint(backend, opts = {}) {
  if (installHintShown) return;
  if (opts.quietTips) return;
  if (process.env.DOCS_SKILL_QUIET_TIPS === '1') return;
  if (backend.tier === 1) return;
  installHintShown = true;

  const lines = [];
  if (backend.tier === 2) {
    lines.push('tip: ripgrep is not installed — using grep fallback (works, but ~10× slower on large corpora).');
    lines.push('     install for the fast path:\n');
  } else {
    lines.push('tip: neither ripgrep nor grep is on PATH — using pure-JS fallback (slowest of the three).');
    lines.push('     install ripgrep for the fast path:\n');
  }
  const cmds = installCommandsForPlatform();
  for (const [label, cmd] of cmds) {
    lines.push('  ' + label.padEnd(14) + cmd);
  }
  lines.push('');
  lines.push('  suppress this hint: pass --quiet-tips or set DOCS_SKILL_QUIET_TIPS=1');
  console.error(lines.join('\n'));
}

function installCommandsForPlatform() {
  switch (process.platform) {
    case 'darwin':
      return [
        ['macOS',         'brew install ripgrep'],
        ['MacPorts',      'sudo port install ripgrep'],
        ['other',         'https://github.com/BurntSushi/ripgrep#installation'],
      ];
    case 'win32':
      return [
        ['Windows',       'winget install BurntSushi.ripgrep.MSVC'],
        ['Chocolatey',    'choco install ripgrep'],
        ['Scoop',         'scoop install ripgrep'],
        ['other',         'https://github.com/BurntSushi/ripgrep#installation'],
      ];
    default:
      // Assume Linux / Unix-like.
      return [
        ['Ubuntu/Debian', 'sudo apt install ripgrep'],
        ['Fedora',        'sudo dnf install ripgrep'],
        ['Arch',          'sudo pacman -S ripgrep'],
        ['Alpine',        'apk add ripgrep'],
        ['other',         'https://github.com/BurntSushi/ripgrep#installation'],
      ];
  }
}

/**
 * Run a regex search across `paths`, returning `[{path, line, snippet}]`.
 * Caller passes the already-detected backend to avoid re-probing PATH.
 *
 * Snippet is the matching line, trimmed and capped at 200 chars.
 */
export function runSearch(backend, paths, pattern, opts = {}) {
  if (paths.length === 0) return [];
  const { caseSensitive = false, invert = false } = opts;

  if (backend.name === 'rg') {
    const args = ['-n', '--no-heading', '--with-filename', '--color=never'];
    if (!caseSensitive) args.push('-i');
    if (invert) args.push('-v');
    args.push('-e', pattern, '--', ...paths);
    const r = spawnSync('rg', args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 2) throw new Error(`ripgrep error: ${r.stderr || 'unknown'}`);
    return parseGrepLikeOutput(r.stdout || '');
  }

  if (backend.name === 'grep') {
    const args = ['-E', '-n', '-H'];
    if (!caseSensitive) args.push('-i');
    if (invert) args.push('-v');
    args.push('-e', pattern, '--', ...paths);
    const r = spawnSync('grep', args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 });
    if (r.status === 2) throw new Error(`grep error: ${r.stderr || 'unknown'}`);
    return parseGrepLikeOutput(r.stdout || '');
  }

  // Pure-JS fallback. Read all files in parallel via Promise.all is overkill
  // for our scale (10s of files); sync is simpler and still fast.
  let re;
  try { re = new RegExp(pattern, caseSensitive ? '' : 'i'); }
  catch (e) { throw new Error(`invalid regex: ${e.message}`); }
  const matches = [];
  for (const p of paths) {
    let text;
    try { text = fs.readFileSync(p, 'utf-8'); } catch { continue; }
    const lines = text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const hit = re.test(lines[i]);
      if (invert ? !hit : hit) {
        matches.push({ path: p, line: i + 1, snippet: lines[i].trim().slice(0, 200) });
      }
    }
  }
  return matches;
}

function parseGrepLikeOutput(output) {
  if (!output) return [];
  const matches = [];
  for (const line of output.split('\n')) {
    if (!line) continue;
    // Format: <path>:<line>:<content>. Lazy-match path to first :NNN: pair.
    const m = line.match(/^(.+?):(\d+):(.*)$/);
    if (!m) continue;
    matches.push({ path: m[1], line: parseInt(m[2], 10), snippet: m[3].trim().slice(0, 200) });
  }
  return matches;
}

// ---------- Filename helpers ------------------------------------------------

export function nextNumericPrefix(dir) {
  if (!fs.existsSync(dir)) return 1;
  let max = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const m = name.match(/^(\d+)[_-]/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return max + 1;
}

export function pad(n, width = 3) {
  return String(n).padStart(width, '0');
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------- Surgical mutators ----------------------------------------------

/**
 * Set a frontmatter field via surgical regex. Preserves formatting, key
 * order, line endings, and surrounding content. If the field doesn't
 * exist, append to the end of the frontmatter block.
 */
export function setFrontmatterField(filePath, field, value) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, message: `File not found: ${filePath}` };
  }
  const original = fs.readFileSync(filePath, 'utf-8');
  const fmMatch = original.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
  if (!fmMatch) {
    return { ok: false, message: `No frontmatter block in ${filePath}` };
  }
  const [, openDelim, fmBlock, closeDelim] = fmMatch;
  const newLine = `${field}: ${formatYamlScalar(value)}`;
  const re = new RegExp(`^(${field})\\s*:\\s*.*$`, 'm');
  const newFmBlock = re.test(fmBlock)
    ? fmBlock.replace(re, newLine)
    : `${fmBlock}\n${newLine}`;
  const replaced = original.replace(fmMatch[0], `${openDelim}${newFmBlock}${closeDelim}`);
  fs.writeFileSync(filePath, replaced);
  return { ok: true, message: `Set ${field}: ${value} in ${relForDisplay(filePath)}` };
}

function formatYamlScalar(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (/^[a-zA-Z0-9_.-]+$/.test(v)) return v;
  return `"${String(v).replace(/"/g, '\\"')}"`;
}

/**
 * Set a top-level scalar field in a JSON file via surgical regex. Only
 * handles simple scalar values (string, number, boolean, null). Preserves
 * formatting and key order.
 */
export function setJsonField(filePath, field, value) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, message: `File not found: ${filePath}` };
  }
  const original = fs.readFileSync(filePath, 'utf-8');
  const formatted = formatJsonScalar(value);
  const re = new RegExp(`("${field}"\\s*:\\s*)("[^"]*"|-?\\d+(?:\\.\\d+)?|true|false|null)`);
  if (!re.test(original)) {
    return { ok: false, message: `Field "${field}" not found in ${filePath}` };
  }
  const replaced = original.replace(re, `$1${formatted}`);
  fs.writeFileSync(filePath, replaced);
  return { ok: true, message: `Set ${field}: ${value} in ${relForDisplay(filePath)}` };
}

function formatJsonScalar(v) {
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (v === null) return 'null';
  return JSON.stringify(String(v));
}

// ---------- CLI helpers ----------------------------------------------------

export function relForLog(p) {
  return path.relative(process.cwd(), p);
}
