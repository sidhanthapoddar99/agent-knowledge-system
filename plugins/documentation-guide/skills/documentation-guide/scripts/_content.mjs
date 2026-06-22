/**
 * _content.mjs — shared list/show/search core for the docs and blog content
 * types (subtask 10). Mirrors what issues/list.mjs gives the tracker, but for
 * sidebar docs sections and flat blog posts. Thin command scripts under docs/
 * and blog/ just call cmdList/cmdShow/cmdSearch with their kind.
 *
 * Honors the Category-0 contract: --json everywhere, exit 0 ok / 1 none / 2 usage.
 * (--help/-h are intercepted globally by cli.mjs.)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { parseArgs, emitJson, writeStdout } from './_cli.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Top-level data/ folders that are NOT sidebar doc sections.
const NON_DOC = new Set(['blog', 'todo', 'pages', 'assets']);

function dataDir() {
  return path.join(resolveProjectContext(SCRIPT_DIR).contentRoot, 'data');
}

/** Parse the leading `--- … ---` frontmatter block into a flat {key: value}. */
function parseFrontmatter(content) {
  const fm = {};
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const mm = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (mm) fm[mm[1]] = mm[2].replace(/^["']|["']$/g, '').replace(/["']$/, '').trim();
  }
  return fm;
}

function frontmatter(file) {
  try { return parseFrontmatter(fs.readFileSync(file, 'utf-8')); } catch { return {}; }
}

/** Recursively collect .md files (skip hidden, assets/, README.md). */
function collectMd(dir) {
  const out = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'assets') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectMd(abs));
    else if (e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md') out.push(abs);
  }
  return out;
}

export function listDocsPages(section) {
  const data = dataDir();
  let sections;
  if (section) {
    sections = [path.basename(section.replace(/\/+$/, ''))];
  } else {
    sections = fs.readdirSync(data, { withFileTypes: true })
      .filter((e) => e.isDirectory() && !NON_DOC.has(e.name) && !e.name.startsWith('.'))
      .map((e) => e.name);
  }
  const pages = [];
  for (const s of sections) {
    const root = path.join(data, s);
    if (!fs.existsSync(root)) continue;
    for (const f of collectMd(root)) {
      pages.push({ rel: path.relative(data, f), section: s, title: frontmatter(f).title || path.basename(f, '.md'), path: f });
    }
  }
  return pages.sort((a, b) => a.rel.localeCompare(b.rel));
}

export function listBlogPosts() {
  const data = dataDir();
  const blog = path.join(data, 'blog');
  if (!fs.existsSync(blog)) return [];
  const RE = /^(\d{4}-\d{2}-\d{2})-(.+)\.md$/;
  const posts = [];
  for (const name of fs.readdirSync(blog)) {
    const m = RE.exec(name);
    if (!m) continue;
    const file = path.join(blog, name);
    posts.push({ rel: path.relative(data, file), date: m[1], slug: m[2], title: frontmatter(file).title || m[2], path: file });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug)); // newest first
}

function items(kind, section) {
  return kind === 'docs' ? listDocsPages(section) : listBlogPosts();
}

export function searchInFiles(files, pattern, caseSensitive) {
  const re = new RegExp(pattern, caseSensitive ? '' : 'i');
  const hits = [];
  for (const f of files) {
    let c;
    try { c = fs.readFileSync(f, 'utf-8'); } catch { continue; }
    c.split('\n').forEach((ln, i) => { if (re.test(ln)) hits.push({ path: f, line: i + 1, snippet: ln.trim() }); });
  }
  return hits;
}

// ---- cross-content collection + metadata search (for `find`, subtask 11) ----

const TEXT_EXT = new Set(['.md', '.json', '.yaml', '.yml']);

function walkText(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules' || e.name === 'assets') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) walkText(abs, out);
    else if (e.isFile() && TEXT_EXT.has(path.extname(e.name))) out.push(abs);
  }
}

/** Classify a file into a content type for --type filtering. */
export function classifyType(file) {
  const ctx = resolveProjectContext(SCRIPT_DIR);
  if (file === ctx.configDir || file.startsWith(ctx.configDir + path.sep)) return 'config';
  const data = path.join(ctx.contentRoot, 'data');
  const top = path.relative(data, file).split(path.sep)[0];
  if (top === 'blog') return 'blog';
  if (top === 'todo') return 'issues';
  return 'docs';
}

/** All text content files across data/ + config/, optionally filtered by type. */
export function collectContentFiles(types) {
  const ctx = resolveProjectContext(SCRIPT_DIR);
  const files = [];
  walkText(path.join(ctx.contentRoot, 'data'), files);
  walkText(ctx.configDir, files);
  let unique = [...new Set(files)];
  if (types && types.length) {
    const want = new Set(types);
    unique = unique.filter((f) => want.has(classifyType(f)));
  }
  return unique.sort();
}

/** The metadata region(s) of a file: .json/.yaml whole, .md frontmatter only. */
function metaRegions(file) {
  let c;
  try { c = fs.readFileSync(file, 'utf-8'); } catch { return []; }
  if (/\.(json|ya?ml)$/.test(file)) return [{ startLine: 1, text: c }];
  if (file.endsWith('.md')) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(c);
    return m ? [{ startLine: 2, text: m[1] }] : [];
  }
  return [];
}

export function metaSearchInFiles(files, pattern, caseSensitive) {
  const re = new RegExp(pattern, caseSensitive ? '' : 'i');
  const hits = [];
  for (const f of files) {
    for (const r of metaRegions(f)) {
      r.text.split('\n').forEach((ln, i) => { if (re.test(ln)) hits.push({ path: f, line: r.startLine + i, snippet: ln.trim() }); });
    }
  }
  return hits;
}

export function contentRootDir() {
  return resolveProjectContext(SCRIPT_DIR).contentRoot;
}

// ---- commands ---------------------------------------------------------------

export function cmdList(kind, argv) {
  const args = parseArgs(argv);
  const list = items(kind, args._[0]);
  if (args.flags.json) { emitJson(list.map(({ path: _p, ...r }) => r)); process.exit(list.length ? 0 : 1); }
  const lines = list.map((it) => kind === 'docs'
    ? `${it.rel}\t${it.section}\t${it.title}`
    : `${it.date}\t${it.slug}\t${it.title}`);
  if (lines.length) writeStdout(lines.join('\n') + '\n');
  process.exit(list.length ? 0 : 1);
}

export function cmdShow(kind, argv) {
  const args = parseArgs(argv);
  const q = args._[0];
  if (!q) { console.error(`Usage: docs ${kind === 'docs' ? 'doc' : 'blog'} show <name|path|slug>`); process.exit(2); }
  const it = items(kind).find((x) =>
    x.rel === q || x.rel.endsWith(`/${q}`) ||
    path.basename(x.rel) === q || path.basename(x.rel, '.md') === q ||
    x.slug === q || x.date === q);
  if (!it) { console.error(`Not found: ${q}`); process.exit(1); }
  const fm = frontmatter(it.path);
  if (args.flags.json) { emitJson({ ...it, path: undefined, frontmatter: fm }); process.exit(0); }
  console.log(`# ${it.title}`);
  console.log(`path:    ${it.rel}`);
  if (it.section) console.log(`section: ${it.section}`);
  if (it.date) console.log(`date:    ${it.date}`);
  for (const [k, v] of Object.entries(fm)) if (k !== 'title') console.log(`${k}: ${v}`);
  process.exit(0);
}

export function cmdSearch(kind, argv) {
  const args = parseArgs(argv);
  const pattern = args._[0];
  if (!pattern) { console.error(`Usage: docs ${kind === 'docs' ? 'doc' : 'blog'} search <regex> [section]`); process.exit(2); }
  const list = items(kind, kind === 'docs' ? (args.flags.section || args._[1]) : undefined);
  const hits = searchInFiles(list.map((i) => i.path), pattern, !!args.flags['case-sensitive']);
  if (args.flags.json) {
    emitJson(hits.map((h) => ({ path: path.relative(dataDir(), h.path), line: h.line, snippet: h.snippet })));
    process.exit(hits.length ? 0 : 1);
  }
  if (args.flags.count) {
    console.log(`${hits.length} match(es) in ${new Set(hits.map((h) => h.path)).size} file(s)`);
    process.exit(hits.length ? 0 : 1);
  }
  const lines = hits.map((h) => `${path.relative(process.cwd(), h.path)}:${h.line}\t${h.snippet}`);
  if (lines.length) writeStdout(lines.join('\n') + '\n');
  process.exit(hits.length ? 0 : 1);
}
