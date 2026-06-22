#!/usr/bin/env bun
/**
 * check-skill-links.mjs — verify relative markdown links between skill files resolve.
 *
 * The references are split across many files (e.g. `layouts/issues/` has 16) that
 * cross-link with relative paths like `[24_agent-logs.md](24_agent-logs.md)`. A
 * rename or move can silently break those — nothing else catches it. This walks
 * every `.md` under the skill and confirms each relative `*.md` link target exists.
 *
 * Skips: external links (`http(s)://`, `mailto:`), alias refs (`@root/...`),
 * absolute paths, and pure `#anchor` fragments. Only same-repo relative `.md`
 * targets are checked; the `#anchor` part of a link is stripped before resolving.
 * Links inside inline code spans (`` `...` ``) are ignored — there the link is
 * being shown as literal text (e.g. a `docs-move` example), not used to navigate.
 *
 * Usage: check-skill-links.mjs [skill-dir]   (defaults to the skill root)
 * Exit 0 = all links resolve, 1 = broken link(s) found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportAndExit } from './_check-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));
const SKILL_ROOT = POSITIONAL || path.dirname(SCRIPT_DIR); // scripts/ → skill root

const errors = [];
const warnings = [];

// Markdown inline link: [text](target). We only care about the target.
const LINK_RE = /\[[^\]]*\]\(([^)]+)\)/g;

function listMarkdown(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) listMarkdown(abs, acc);
    else if (e.isFile() && e.name.endsWith('.md')) acc.push(abs);
  }
  return acc;
}

for (const file of listMarkdown(SKILL_ROOT)) {
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
  const relFile = path.relative(SKILL_ROOT, file);
  lines.forEach((line, i) => {
    // Drop inline code spans first (double-backtick before single) so links
    // shown as literal text inside `...` aren't mistaken for real links.
    const scan = line.replace(/``.+?``/g, '').replace(/`[^`]*`/g, '');
    for (const m of scan.matchAll(LINK_RE)) {
      let target = m[1].trim();
      // Strip a trailing #anchor and any surrounding angle brackets / title.
      target = target.replace(/\s+["'].*$/, '').replace(/^<|>$/g, '');
      const hash = target.indexOf('#');
      if (hash !== -1) target = target.slice(0, hash);
      if (!target) continue;                                   // pure #anchor
      if (/^(https?:|mailto:|@)/.test(target)) continue;       // external / alias
      if (path.isAbsolute(target)) continue;                   // absolute, out of scope
      if (!target.endsWith('.md')) continue;                   // only check .md targets
      const resolved = path.resolve(path.dirname(file), target);
      if (!fs.existsSync(resolved)) {
        errors.push(`${relFile}:${i + 1}: broken link → ${target}`);
      }
    }
  });
}

reportAndExit({ kind: 'skill-links', root: SKILL_ROOT, errors, warnings, json: JSON_OUT });
