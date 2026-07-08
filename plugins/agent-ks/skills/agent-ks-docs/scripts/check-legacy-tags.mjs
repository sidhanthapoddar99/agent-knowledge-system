#!/usr/bin/env bun
/**
 * check-legacy-tags.mjs — detect retired custom-tags syntax in content.
 *
 * The platform is native-markdown-only (decision 2026-07-03, tracked in
 * `2026-07-03-skill-custom-tags-staleness`): the `:::callout` / `:::collapsible`
 * / `:::tabs` directive form and the `<callout>` / `<tabs>` / `<tab>` /
 * `<collapsible>` tag form are never parsed, so leftovers in pre-decision
 * content silently render as raw text. This validator scans a content root and
 * reports every occurrence with its native replacement.
 *
 * Lines inside fenced code blocks (``` or ~~~) are skipped — a fenced snippet
 * is a documentation example, not live content.
 *
 * Exit code 0 = clean, 1 = legacy usage found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { reportAndExit } from './_check-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.error('Usage: agent-ks check legacy-tags [content-root]\n');
  console.error("  When [content-root] is omitted, derives <content-root>/data from the framework's .env (CONFIG_DIR).\n");
  console.error('  Flags every retired custom-tags usage in .md files, with the native replacement:');
  console.error('    :::callout / <callout type="…">  →  > [!NOTE] / [!TIP] / [!WARNING] / [!CAUTION] (GFM alert)');
  console.error('    :::collapsible / <collapsible>   →  <details><summary>…</summary>…</details>');
  console.error('    :::tabs / <tabs> / <tab>         →  sequential ### sections (no native tab equivalent)');
  console.error('  Fenced code blocks are skipped (documentation examples). --json for structured findings.');
  process.exit(0);
}

const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));

let ROOT;
if (POSITIONAL) {
  ROOT = POSITIONAL;
} else {
  const ctx = resolveProjectContext(SCRIPT_DIR);
  ROOT = path.join(ctx.contentRoot, 'data');
}

if (!fs.existsSync(ROOT)) {
  console.error(`Not found: ${ROOT}`);
  process.exit(1);
}

// Type mapping mirrors the retired callout vocabulary onto GFM alert types.
const CALLOUT_TYPE_MAP = { info: '[!NOTE]', note: '[!NOTE]', tip: '[!TIP]', warning: '[!WARNING]', danger: '[!CAUTION]' };

function calloutSuggestion(line) {
  const type = line.match(/type\s*=\s*["']?(\w+)/i)?.[1]?.toLowerCase();
  const alert = CALLOUT_TYPE_MAP[type] || '[!NOTE]';
  return `> ${alert} GFM alert blockquote (fold any title= into the first bold line)`;
}

// [pattern, human label, suggestion builder] — patterns are line-oriented.
// \b after the tag name keeps <tab> from matching <table>.
const RULES = [
  [/:::\s*callout\b/i, ':::callout directive', calloutSuggestion],
  [/:::\s*collapsible\b/i, ':::collapsible directive', () => '<details><summary>…</summary>…</details>'],
  [/:::\s*tabs?\b/i, ':::tabs directive', () => 'sequential ### sections (flatten — no native tabs)'],
  [/<callout\b/i, '<callout> tag', calloutSuggestion],
  [/<collapsible\b/i, '<collapsible> tag', () => '<details><summary>…</summary>…</details>'],
  [/<tabs?\b/i, '<tabs>/<tab> tag', () => 'sequential ### sections (flatten — no native tabs)'],
];

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.astro']);
const errors = [];
const warnings = [];

function scanFile(abs, rel) {
  const lines = fs.readFileSync(abs, 'utf8').split('\n');
  // Skip the YAML frontmatter block — titles there may *mention* the syntax.
  let start = 0;
  if (lines[0]?.trim() === '---') {
    const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
    if (end > 0) start = end + 1;
  }
  let fence = null; // opening fence marker (``` or ~~~) while inside a block
  lines.forEach((line, i) => {
    if (i < start) return;
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0];
      else if (fenceMatch[1][0] === fence) fence = null;
      return;
    }
    if (fence) return;
    // Inline code spans are mentions, not usage (`<callout>` in prose about the
    // migration itself) — strip them before matching.
    const scannable = line.replace(/`[^`]*`/g, '');
    for (const [re, label, suggest] of RULES) {
      if (re.test(scannable)) {
        errors.push(`${rel}:${i + 1}: ${label} — migrate to ${suggest(scannable)}`);
        break; // one finding per line is enough
      }
    }
  });
}

function walk(dir, relBase) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue;
    const abs = path.join(dir, entry.name);
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) walk(abs, rel);
    else if (entry.isFile() && entry.name.endsWith('.md')) scanFile(abs, rel);
  }
}

walk(ROOT, '');

reportAndExit({ kind: 'legacy-tags', root: ROOT, errors, warnings, json: JSON_OUT });
