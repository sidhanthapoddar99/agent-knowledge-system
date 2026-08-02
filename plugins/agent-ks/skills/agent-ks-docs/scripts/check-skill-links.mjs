#!/usr/bin/env bun
/**
 * check-skill-links.mjs — verify relative markdown links between skill files resolve.
 *
 * The references are split across many files (e.g. the agent-ks-issues skill has ~20) that
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
 * FENCED BLOCKS ARE SKIPPED ENTIRELY, for the same reason. A skill teaches by
 * example, and its examples are illustrative paths into a tracker that does not
 * exist — `[Stage 80](../../subtasks/16_slide-type/80_mandatory-catalog.md)`
 * inside a ```markdown fence is a demonstration of the syntax, not a link. They
 * do not render as links and cannot be navigated. Before this, every worked
 * example a reference file gained reported as a broken link, so the checker's
 * output was "N errors, all false" — and a gate that can only be read with a
 * correction attached stops being read at all.
 *
 * Usage: check-skill-links.mjs [skill-dir]
 *
 * With no argument it checks **every skill in the marketplace**, not just the
 * one that happens to ship this script. It used to default to its own skill
 * root, so a bare run reported "all checks passed" having read one skill of
 * three — a clean result that named a scope nobody could see.
 *
 * Exit 0 = all links resolve, 1 = broken link(s) found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportAndExit } from './_check-lib.mjs';
import { makeFenceTracker } from './_links.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));
const OWN_SKILL = path.dirname(SCRIPT_DIR);           // scripts/ → this skill's root
const SKILLS_DIR = path.dirname(OWN_SKILL);           // …/skills/

/** Every skill to check: the one named on the command line, or all of them.
 *  A skill is a directory under `skills/` carrying a `SKILL.md`. */
const SKILL_ROOTS = POSITIONAL
  ? [path.resolve(POSITIONAL)]
  : fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
      .filter((e) => e.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, e.name, 'SKILL.md')))
      .map((e) => path.join(SKILLS_DIR, e.name))
      .sort();

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

let filesScanned = 0;
for (const SKILL_ROOT of SKILL_ROOTS) {
for (const file of listMarkdown(SKILL_ROOT)) {
  filesScanned++;
  const lines = fs.readFileSync(file, 'utf-8').split(/\r?\n/);
  const relFile = path.relative(SKILLS_DIR, file);
  const isProse = makeFenceTracker();
  lines.forEach((line, i) => {
    if (!isProse(line)) return;   // fence delimiter, or inside a fenced example
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
}

// A scope that read nothing is not a clean run. Without this, a bad path or an
// empty skills directory prints "all checks passed" — the same output as a real
// pass, which is the one thing a gate may never do.
if (filesScanned === 0) {
  errors.push(`no markdown found under ${SKILL_ROOTS.join(', ') || '(no skills resolved)'} — nothing was checked`);
}

reportAndExit({
  kind: 'skill-links',
  root: SKILL_ROOTS.length === 1 ? SKILL_ROOTS[0] : `${SKILL_ROOTS.length} skills under ${SKILLS_DIR}`,
  subtitle: `(${filesScanned} markdown file${filesScanned === 1 ? '' : 's'} scanned)`,
  errors,
  warnings,
  json: JSON_OUT,
});
