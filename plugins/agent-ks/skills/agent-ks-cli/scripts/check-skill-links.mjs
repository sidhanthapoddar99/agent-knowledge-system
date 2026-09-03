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
 * With no argument it checks **every skill beside this script**. Which tree that
 * is follows from which command you typed, and nothing here guesses:
 *
 *   agent-ks     check skill-links   → the INSTALLED plugin
 *   agent-ks-dev check skill-links   → this repo's source tree
 *
 * `agent-ks-dev` is a repo-root shim on PATH via mise; it execs the repo's own
 * `plugins/agent-ks/bin/agent-ks`, which resolves this script relative to itself.
 * So the same three lines below are correct under both names.
 *
 * THIS SCOPE HAS BEEN WRONG THREE TIMES, in the same mechanism, each time
 * reporting a clean pass over something nobody meant to check:
 *   1. It defaulted to its own SKILL root — one skill of three.
 *   2. It defaulted to its own INSTALL — a published copy, never the working tree.
 *   3. Fixing (2) by walking up from the CWD guessed the other way: in consumer
 *      mode the framework clone sits INSIDE the user's project, so a consumer
 *      standing in it got the bundled skills checked and labelled [source tree].
 *
 * The first two were fixed by widening the radius and leaving the anchor alone,
 * and this file said at the time: if a third turns up, change the anchor. A third
 * turned up. The anchor is now the human — stated by the command, not inferred
 * from a directory. There is no filesystem test that separates "the maintainer
 * developing the plugin" from "a consumer sitting in their framework folder",
 * because those are the same directory.
 *
 * WHAT SURVIVES from the (2) fix, because it was right independently of anchoring:
 * the run names the tree it read, in words, in the banner. The original failure
 * was not only that the wrong tree was read — it was that the green LOOKED like
 * it covered your work.
 *
 * Exit 0 = all links resolve, 1 = broken link(s) found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportAndExit } from './_check-lib.mjs';
import { eachLink } from './_links.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const JSON_OUT = process.argv.includes('--json');
const POSITIONAL = process.argv.slice(2).find((a) => !a.startsWith('-'));

/** The skills under `dir` — a skill is a subdirectory carrying a `SKILL.md`. */
function skillsIn(dir) {
  if (!dir || !fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(dir, e.name, 'SKILL.md')))
    .map((e) => path.join(dir, e.name))
    .sort();
}

/**
 * Which `skills/` directory to check — the one this script lives in.
 *
 * That is deliberately dumb, and the dumbness is the feature: the running copy
 * of this file IS the tree being asked about. Dispatched through the installed
 * `agent-ks`, that is the install; through `agent-ks-dev`, it is the repo. The
 * command carries the intent, so nothing here has to infer it.
 *
 * Do not reintroduce a CWD walk-up. See the header — it was tried, and it moved
 * the wrong-tree bug onto consumers instead of removing it.
 */
const OWN_SKILL = path.dirname(SCRIPT_DIR);           // scripts/ → this skill's root
const OWN_SKILLS_DIR = path.dirname(OWN_SKILL);       // …/skills/

/** Is the tree we are about to scan a checkout, or an installed plugin? */
function describeTree(dir) {
  // …/skills → …/agent-ks → …/plugins → the repo root, if this is a source tree.
  const repoRoot = path.dirname(path.dirname(path.dirname(dir)));
  return fs.existsSync(path.join(repoRoot, '.git')) ? 'repo' : 'installed';
}

const RESOLVED = POSITIONAL
  ? { dir: path.dirname(path.resolve(POSITIONAL)), source: 'explicit' }
  : { dir: OWN_SKILLS_DIR, source: describeTree(OWN_SKILLS_DIR) };
const SKILLS_DIR = RESOLVED.dir;

/** Every skill to check: the one named on the command line, or all of them. */
const SKILL_ROOTS = POSITIONAL ? [path.resolve(POSITIONAL)] : skillsIn(SKILLS_DIR);

const errors = [];
const warnings = [];

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
  const raw = fs.readFileSync(file, 'utf-8');
  const relFile = path.relative(SKILLS_DIR, file);
  // The SHARED walker — one place finds a link, blanks fenced blocks and code
  // spans, and scans the WHOLE document. This file kept a private two-regex
  // version for months after the other callers moved off it, and it was wrong in
  // both directions: it hid a real broken link behind escaped backticks, and it
  // errored on the scaffolder's own wrapped code span. A classification with
  // four private copies is four different answers.
  for (const link of eachLink(raw)) {
    let target = link.target.trim();
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
      errors.push(`${relFile}:${link.line}: broken link → ${target}`);
    }
  }
}
}

// A scope that read nothing is not a clean run. Without this, a bad path or an
// empty skills directory prints "all checks passed" — the same output as a real
// pass, which is the one thing a gate may never do.
if (filesScanned === 0) {
  errors.push(`no markdown found under ${SKILL_ROOTS.join(', ') || '(no skills resolved)'} — nothing was checked`);
}

// Name the TREE, not just the path. The old banner did print its root and still
// fooled a reader into taking an install-scoped pass as a working-tree pass, so
// the mode is stated in words rather than left to be inferred from a path.
// Neither mode is a fallback now — each is what the command you typed means.
const MODE = { repo: ' [repo source tree]', installed: ' [installed plugin]',
               explicit: ' [explicit path]' }[RESOLVED.source] ?? '';

reportAndExit({
  kind: 'skill-links',
  root: (SKILL_ROOTS.length === 1 ? SKILL_ROOTS[0] : `${SKILL_ROOTS.length} skills under ${SKILLS_DIR}`) + MODE,
  subtitle: `(${filesScanned} markdown file${filesScanned === 1 ? '' : 's'} scanned)`,
  errors,
  warnings,
  json: JSON_OUT,
});
