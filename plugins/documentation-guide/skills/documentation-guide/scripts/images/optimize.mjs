#!/usr/bin/env bun
/**
 * docs-guide img — optimize images for documentation so the repo stays small.
 *
 * Screenshots/exports added under data/ bloat git history fast (repos cap
 * ~1–2GB *with* versioning). This shrinks them — resize, grayscale, re-encode
 * to webp/avif, strip metadata — and can rewrite the Markdown links when the
 * file extension changes. Pure optimization: it never *captures* (if Playwright
 * is installed you can auto-grab web screenshots, but that's a separate step;
 * manually pasted screenshots work just the same).
 *
 *   docs-guide img <inputs...> [flags]
 *
 * Engine: the ImageMagick CLI (see _lib.mjs). Exit 0 = ok, 1 = error.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import {
  IMAGE_EXTS, findEngine, parseSize, humanBytes, fileSize,
  runEngine, isLossy,
} from './_lib.mjs';
import { MD_LINK_RE } from '../_links.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// ── arg parsing ────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const positional = [];
const o = {
  scale: null, width: null, height: null, maxDim: null, dpr: null, trim: false,
  gray: false, quality: 80, lossless: false, colors: null, depth: null, dither: null,
  format: null, strip: true,
  out: null, inPlace: false, backup: null, noBackup: false,
  rewriteLinks: false, linksRoot: null, targetSize: null,
  recursive: false, dryRun: false, quiet: false,
};

const num = (v, name) => {
  const n = Number(v);
  if (!Number.isFinite(n)) { console.error(`Bad ${name}: ${v}`); process.exit(1); }
  return n;
};
const pct = (v) => num(String(v).replace('%', ''), '--scale');

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const val = () => args[++i];
  if (a === '--help' || a === '-h') usage(0);
  else if (a === '--scale') o.scale = pct(val());
  else if (a === '--width') o.width = num(val(), '--width');
  else if (a === '--height') o.height = num(val(), '--height');
  else if (a === '--max-dim') o.maxDim = num(val(), '--max-dim');
  else if (a === '--dpr') o.dpr = num(val(), '--dpr');
  else if (a === '--trim') o.trim = true;
  else if (a === '--gray' || a === '--grey') o.gray = true;
  else if (a === '--quality' || a === '-q') o.quality = num(val(), '--quality');
  else if (a === '--lossless') o.lossless = true;
  else if (a === '--colors' || a === '--colours') o.colors = num(val(), '--colors');
  else if (a === '--depth') o.depth = num(val(), '--depth');
  else if (a === '--dither') o.dither = val();
  else if (a === '--format' || a === '-f') o.format = val().toLowerCase().replace(/^\./, '');
  else if (a === '--strip') o.strip = true;
  else if (a === '--no-strip') o.strip = false;
  else if (a === '--out') o.out = val();
  else if (a === '--in-place') o.inPlace = true;
  else if (a === '--backup') o.backup = val();
  else if (a === '--no-backup') o.noBackup = true;
  else if (a === '--rewrite-links') o.rewriteLinks = true;
  else if (a === '--links-root') o.linksRoot = val();
  else if (a === '--target-size') o.targetSize = parseSize(val());
  else if (a === '--recursive' || a === '-r') o.recursive = true;
  else if (a === '--dry-run') o.dryRun = true;
  else if (a === '--quiet') o.quiet = true;
  else if (a.startsWith('-')) { console.error(`Unknown flag: ${a}`); usage(1); }
  else positional.push(a);
}

if (positional.length === 0) { console.error('No input files/dirs/globs given.\n'); usage(1); }
if (o.format === 'jpeg') o.format = 'jpg';

function usage(code) {
  const out = code === 0 ? console.log : console.error;
  out('Usage: docs-guide img <inputs...> [flags]\n');
  out('  Optimize images for docs (shrink → keep git small). In-place by default,');
  out('  with an automatic backup; never captures, only optimizes.\n');
  out('  Inputs: files, directories (add -r to recurse), or *.png-style globs.\n');
  out('  Geometry:');
  out('    --dpr N         divide dimensions by N (undo retina capture; e.g. 2)');
  out('    --scale P       resize to P percent       --max-dim N  cap longest side (shrink only)');
  out('    --width N / --height N                    --trim       crop surrounding whitespace');
  out('  Color & quality:');
  out('    --gray          grayscale                 --quality/-q N  lossy quality % (default 80)');
  out('    --lossless      lossless (webp/png)       --colors N   palette reduce (PNG only; warns on lossy)');
  out('    --depth N       bit depth (8|4|2|1)       --dither M   (default None)');
  out('  Format:');
  out('    --format F      webp|avif|png|jpg (default: keep)   --no-strip  keep metadata (stripped by default)');
  out('  Output & safety:');
  out('    --out DIR       write here (originals untouched; default is in-place)');
  out('    --backup DIR    backup dir for in-place (default: OS temp)   --no-backup  skip backup');
  out('  Docs integration:');
  out('    --rewrite-links rewrite ![](…) when the extension changes   --links-root DIR  where to scan md');
  out('    --target-size S shrink lossy quality until each file ≤ S (e.g. 100KB)');
  out('  Misc: -r/--recursive  --dry-run  --quiet  -h/--help\n');
  out('  Tip: Playwright (if installed) can capture web screenshots; docs-guide img then shrinks them.');
  process.exit(code);
}

// ── expand inputs ────────────────────────────────────────────────────────────
function globMatch(pattern) {
  const dir = path.dirname(pattern);
  const base = path.basename(pattern);
  const re = new RegExp('^' + base.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '[^/]*').replace(/\?/g, '.') + '$');
  let entries = [];
  try { entries = fs.readdirSync(dir); } catch { return []; }
  return entries.filter((n) => re.test(n)).map((n) => path.join(dir, n));
}
function collectDir(dir, recursive) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) { if (recursive) out.push(...collectDir(abs, true)); }
    else if (IMAGE_EXTS.has(path.extname(e.name).toLowerCase())) out.push(abs);
  }
  return out;
}

const inputs = new Set();
for (const p of positional) {
  if (p.includes('*') || p.includes('?')) { for (const f of globMatch(p)) inputs.add(path.resolve(f)); continue; }
  if (!fs.existsSync(p)) { console.error(`No such path: ${p}`); process.exit(1); }
  if (fs.statSync(p).isDirectory()) for (const f of collectDir(p, o.recursive)) inputs.add(path.resolve(f));
  else if (IMAGE_EXTS.has(path.extname(p).toLowerCase())) inputs.add(path.resolve(p));
  else console.error(`skip (not an image): ${p}`);
}
const files = [...inputs].sort();
if (files.length === 0) { console.error('No image files matched.'); process.exit(1); }

// ── engine ───────────────────────────────────────────────────────────────────
let engine;
try { engine = findEngine(); } catch (e) { console.error(e.message); process.exit(1); }

if (o.colors && isLossy(o.format ?? '')) {
  console.error('note: --colors with a lossy format usually makes files BIGGER (posterized edges cost bits). Prefer it for PNG, or drop it.');
}

const backupDir = o.noBackup ? null
  : (o.backup ?? path.join(os.tmpdir(), `docs-img-backup-${process.pid}`));

// ── plan / process ─────────────────────────────────────────────────────────
const outExt = (src) => '.' + (o.format || path.extname(src).slice(1).toLowerCase() || 'png');
function destFor(src) {
  const base = path.basename(src, path.extname(src)) + outExt(src);
  return o.out ? path.resolve(o.out, base) : path.join(path.dirname(src), base);
}

if (o.dryRun) {
  console.log('# docs-guide img (dry-run)\n');
  console.log('recipe:', summarize(o));
  console.log(`engine: ${engine.bin}   files: ${files.length}   ${o.out ? 'out: ' + o.out : 'in-place' + (backupDir ? ` (backup: ${backupDir})` : ' (no backup)')}\n`);
  for (const src of files) console.log(`  ${rel(src)}  →  ${rel(destFor(src))}`);
  process.exit(0);
}

if (o.out) fs.mkdirSync(path.resolve(o.out), { recursive: true });
if (backupDir && !o.out) fs.mkdirSync(backupDir, { recursive: true });

const rows = [];
const renames = []; // { oldAbs, newAbs } for link rewriting (in-place, ext changed)
let failures = 0;

for (const src of files) {
  const dest = destFor(src);
  const fmt = path.extname(dest).slice(1).toLowerCase();
  // Temp file MUST keep the real extension so the encoder picks the right format
  // (hidden + unique so globs/scans skip it). Placed beside dest for an atomic rename.
  const tmp = path.join(path.dirname(dest), `.docs-img-tmp-${process.pid}-${path.basename(dest)}`);
  const oldSize = fileSize(src);
  let usedQ = o.quality;
  try {
    if (o.targetSize && isLossy(fmt) && !o.lossless) {
      let fit = false;
      for (let q = o.quality; q >= 30; q -= 10) {
        runEngine(engine, src, tmp, o, q);
        usedQ = q;
        if (fileSize(tmp) <= o.targetSize) { fit = true; break; }
      }
      if (!fit) console.error(`note: ${path.basename(src)} still > target at q30 — consider --scale/--max-dim or --trim`);
    } else {
      runEngine(engine, src, tmp, o, o.quality);
    }
  } catch (e) {
    console.error(e.message); failures++; try { fs.rmSync(tmp, { force: true }); } catch {} continue;
  }

  // place
  if (o.out) {
    fs.renameSync(tmp, dest);
  } else {
    if (backupDir) fs.copyFileSync(src, path.join(backupDir, path.basename(src)));
    if (path.resolve(dest) !== path.resolve(src)) {
      fs.renameSync(tmp, dest);
      fs.rmSync(src, { force: true });
      renames.push({ oldAbs: path.resolve(src), newAbs: path.resolve(dest) });
    } else {
      fs.renameSync(tmp, dest);
    }
  }
  rows.push({ name: path.basename(dest), oldSize, newSize: fileSize(dest), q: usedQ, fmt });
}

// ── rewrite markdown links (extension changed, in-place only) ────────────────
let linkEdits = 0, linkFiles = 0;
if (o.rewriteLinks && renames.length && !o.out) {
  const byOld = new Map(renames.map((r) => [r.oldAbs, r.newAbs]));
  let root = o.linksRoot ? path.resolve(o.linksRoot) : null;
  if (!root) { try { root = resolveProjectContext(SCRIPT_DIR).contentRoot; } catch { root = process.cwd(); } }
  const LINK_RE = MD_LINK_RE; // shared regex from ../_links.mjs (also used by docs-guide move)
  const mds = collectMd(root);
  for (const md of mds) {
    let txt; try { txt = fs.readFileSync(md, 'utf-8'); } catch { continue; }
    const dir = path.dirname(md);
    let touched = false;
    const next = txt.replace(LINK_RE, (full, bang, text, target) => {
      const hash = target.indexOf('#');
      const url = hash === -1 ? target : target.slice(0, hash);
      const anchor = hash === -1 ? '' : target.slice(hash);
      if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('/') || url.startsWith('#')) return full;
      const abs = path.resolve(dir, url);
      const newAbs = byOld.get(abs);
      if (!newAbs) return full;
      let newRel = path.relative(dir, newAbs).split(path.sep).join('/');
      if (!newRel.startsWith('.')) newRel = './' + newRel;
      // keep author's leading "./" style if they used a bare relative path
      if (!url.startsWith('./') && newRel.startsWith('./')) newRel = newRel.slice(2);
      const newText = text === url ? newRel : text;
      touched = true; linkEdits++;
      return `${bang}[${newText}](${newRel}${anchor})`;
    });
    if (touched) { fs.writeFileSync(md, next); linkFiles++; }
  }
}

// ── report ───────────────────────────────────────────────────────────────────
if (!o.quiet) {
  let totOld = 0, totNew = 0;
  const w = Math.max(4, ...rows.map((r) => r.name.length));
  console.log(`\n# docs-guide img — ${rows.length} image(s)${o.out ? ` → ${o.out}` : ' (in-place)'}\n`);
  for (const r of rows) {
    totOld += r.oldSize; totNew += r.newSize;
    const pctSaved = r.oldSize ? Math.round((1 - r.newSize / r.oldSize) * 100) : 0;
    console.log(`  ${r.name.padEnd(w)}  ${humanBytes(r.oldSize).padStart(7)} → ${humanBytes(r.newSize).padStart(7)}  (-${pctSaved}%)  ${r.fmt}${o.targetSize ? ` q${r.q}` : ''}`);
  }
  const pctTot = totOld ? Math.round((1 - totNew / totOld) * 100) : 0;
  console.log(`  ${'─'.repeat(w + 30)}`);
  console.log(`  ${'total'.padEnd(w)}  ${humanBytes(totOld).padStart(7)} → ${humanBytes(totNew).padStart(7)}  (-${pctTot}%)`);
  if (linkEdits) console.log(`\n  rewrote ${linkEdits} link(s) across ${linkFiles} file(s)`);
  if (backupDir && !o.out) console.log(`  backup: ${backupDir}`);
}
process.exit(failures ? 1 : 0);

// ── small helpers ────────────────────────────────────────────────────────────
function collectMd(dir) {
  const out = [];
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...collectMd(abs));
    else if (e.name.endsWith('.md')) out.push(abs);
  }
  return out;
}
function rel(p) { return path.relative(process.cwd(), p) || p; }
function summarize(x) {
  const bits = [];
  if (x.dpr) bits.push(`dpr ${x.dpr}`);
  if (x.scale != null) bits.push(`scale ${x.scale}%`);
  if (x.maxDim) bits.push(`max-dim ${x.maxDim}`);
  if (x.width || x.height) bits.push(`resize ${x.width ?? ''}x${x.height ?? ''}`);
  if (x.trim) bits.push('trim');
  if (x.gray) bits.push('gray');
  if (x.format) bits.push(x.format);
  bits.push(x.lossless ? 'lossless' : `q${x.quality}`);
  if (x.colors) bits.push(`${x.colors} colors`);
  if (x.depth) bits.push(`depth ${x.depth}`);
  if (x.targetSize) bits.push(`target ${humanBytes(x.targetSize)}`);
  if (x.strip) bits.push('strip');
  return bits.join(', ');
}
