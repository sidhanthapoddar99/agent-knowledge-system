/**
 * Shared helpers for docs-img — image optimization for documentation.
 *
 * Engine: the ImageMagick CLI (`magick`, or legacy `convert`). Chosen over an
 * npm image lib (e.g. sharp) so the plugin stays dependency-free `.mjs` with no
 * install step — ImageMagick is a single system prerequisite and ships webp/avif
 * delegates. If a future in-process engine is wanted, swap `runEngine` only.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const IMAGE_EXTS = new Set([
  '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.tif', '.tiff', '.bmp',
]);

/** Locate the ImageMagick binary. Returns { bin, kind: 'magick'|'convert' }. */
export function findEngine() {
  for (const [bin, kind] of [['magick', 'magick'], ['convert', 'convert']]) {
    try {
      execFileSync(bin, ['-version'], { stdio: ['ignore', 'pipe', 'ignore'] });
      return { bin, kind };
    } catch { /* try next */ }
  }
  throw new Error(
    'ImageMagick not found (looked for `magick` and `convert`).\n' +
    '  docs-img needs ImageMagick (with webp/avif delegates). Install it:\n' +
    '    • Debian/Ubuntu: sudo apt install imagemagick\n' +
    '    • macOS:         brew install imagemagick\n' +
    '    • Windows:       winget install ImageMagick.ImageMagick'
  );
}

/** Best-effort set of supported output formats (UPPERCASE), or null if unknown. */
export function engineFormats({ bin }) {
  try {
    const out = execFileSync(bin, ['-list', 'format'], {
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    const set = new Set();
    for (const m of out.matchAll(/^\s*([A-Z0-9]+)\*?\s+/gm)) set.add(m[1]);
    return set;
  } catch { return null; }
}

/** Parse a size budget like "100KB", "60k", "1.5MB", or a bare byte count. */
export function parseSize(str) {
  const m = /^([\d.]+)\s*([kmg]?)b?$/i.exec(String(str).trim());
  if (!m) throw new Error(`Bad --target-size: ${str} (try 100KB, 1.5MB, 60k)`);
  const n = parseFloat(m[1]);
  const mult = { '': 1, k: 1024, m: 1024 ** 2, g: 1024 ** 3 }[m[2].toLowerCase()];
  return Math.round(n * mult);
}

/** Human-readable byte size, base-1024 (e.g. "53K", "1.2M", "812 B"). */
export function humanBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) { const k = n / 1024; return `${k < 10 ? k.toFixed(1) : Math.round(k)}K`; }
  const mb = n / 1024 ** 2; return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)}M`;
}

export function fileSize(p) {
  try { return fs.statSync(p).size; } catch { return 0; }
}

/** Lossy output formats — `--colors`/palette reduction is counterproductive here. */
const LOSSY = new Set(['webp', 'avif', 'jpg', 'jpeg']);

/**
 * Build the ordered ImageMagick operator list for one conversion (excluding the
 * input/output paths). `fmt` is the lowercase target format (output extension).
 */
export function buildOps(opts, fmt) {
  const ops = ['-auto-orient'];

  // Geometry — explicit width/height/scale/max-dim win over --dpr.
  if (opts.width || opts.height) {
    ops.push('-resize', `${opts.width ?? ''}x${opts.height ?? ''}`);
  } else if (opts.maxDim) {
    ops.push('-resize', `${opts.maxDim}x${opts.maxDim}>`); // shrink-only
  } else if (opts.scale != null) {
    ops.push('-resize', `${opts.scale}%`);
  } else if (opts.dpr && opts.dpr !== 1) {
    ops.push('-resize', `${(100 / opts.dpr).toFixed(4)}%`);
  }

  if (opts.trim) ops.push('-trim', '+repage');
  if (opts.gray) ops.push('-colorspace', 'Gray');
  if (opts.depth) ops.push('-depth', String(opts.depth));
  if (opts.colors) ops.push('-colors', String(opts.colors), '-dither', opts.dither ?? 'None');
  if (opts.strip) ops.push('-strip');

  // Encoder-specific tuning.
  if (fmt === 'webp') {
    if (opts.lossless) ops.push('-define', 'webp:lossless=true');
  } else if (fmt === 'png') {
    ops.push('-define', 'png:compression-level=9');
  }
  return ops;
}

/**
 * Encode `input` → `output` once at quality `q` (q ignored for lossless/png).
 * Throws with stderr on failure.
 */
export function runEngine(engine, input, output, opts, q) {
  const fmt = path.extname(output).slice(1).toLowerCase();
  const ops = buildOps(opts, fmt);
  const args = [input, ...ops];
  const lossless = fmt === 'png' || (fmt === 'webp' && opts.lossless);
  if (!lossless && q != null) args.push('-quality', String(q));
  // Force the encoder by format prefix so it never depends on the output filename.
  args.push(`${fmt}:${output}`);
  try {
    execFileSync(engine.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const msg = (e.stderr?.toString() || e.message || '').trim();
    throw new Error(`encode failed (${path.basename(input)} → ${fmt}): ${msg}`);
  }
}

/** True if a format is lossy (so --target-size can step quality). */
export function isLossy(fmt) { return LOSSY.has(fmt); }
