#!/usr/bin/env bun
/**
 * blog/check.mjs — validate blog folder structure.
 *
 * Checks every .md file in the blog folder follows the project conventions
 * documented in `references/layouts/blog-layout.md`:
 *
 *   • Filename matches YYYY-MM-DD-<kebab-case-slug>.md
 *   • Frontmatter `title:` present
 *   • No subfolders (blog is flat — `assets/` is the only allowed subfolder)
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from '../_env.mjs';
import { hasFrontmatterTitle, readText, reportAndExit } from '../_check-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

if (process.argv[2] === '--help' || process.argv[2] === '-h') {
  console.error('Usage: docs-check-blog [blog-folder]\n');
  console.error('  When [blog-folder] is omitted, derives <content-root>/data/blog from the framework\'s .env (CONFIG_DIR).\n');
  console.error('  Validates: YYYY-MM-DD-<slug>.md naming · frontmatter title · no nested folders');
  process.exit(0);
}

let ROOT;
if (process.argv[2]) {
  ROOT = process.argv[2];
} else {
  // Derive from .env — no hardcoded folder name
  const ctx = resolveProjectContext(SCRIPT_DIR);
  ROOT = path.join(ctx.contentRoot, 'data', 'blog');
}

if (!fs.existsSync(ROOT)) {
  console.error(`Not found: ${ROOT}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const BLOG_RE = /^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.md$/;

const entries = fs.readdirSync(ROOT, { withFileTypes: true });
for (const entry of entries) {
  const rel = entry.name;
  if (entry.isDirectory()) {
    if (entry.name === 'assets') continue;
    if (entry.name.startsWith('.')) continue;
    errors.push(`${rel}/: subfolders not allowed in blog/ (only YYYY-MM-DD-<slug>.md files + assets/)`);
    continue;
  }
  if (!entry.isFile()) continue;
  if (entry.name === 'README.md' || entry.name.startsWith('.')) continue;

  if (!entry.name.endsWith('.md')) {
    warnings.push(`${rel}: non-md file in blog/ (move to blog/assets/?)`);
    continue;
  }

  if (!BLOG_RE.test(entry.name)) {
    errors.push(`${rel}: doesn't match YYYY-MM-DD-<kebab-slug>.md`);
    continue;
  }

  const content = readText(path.join(ROOT, entry.name), rel, errors);
  if (content !== null && !hasFrontmatterTitle(content)) {
    errors.push(`${rel}: missing frontmatter \`title:\``);
  }
}

reportAndExit({ kind: 'blog', root: ROOT, errors, warnings });
