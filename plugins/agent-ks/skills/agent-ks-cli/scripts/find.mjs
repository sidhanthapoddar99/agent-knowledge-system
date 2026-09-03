#!/usr/bin/env bun
/**
 * `docs find <regex>` — unified, schema-AGNOSTIC search across ALL content
 * (docs + blog + issues + config) in one call (Category 1, subtask 11).
 *
 * Complements the per-type, schema-aware `*-search` commands: this answers
 * "where is this string ANYWHERE in content", they answer "find the issue/post
 * about X". One engine, every content type.
 *
 *   docs find <regex>              raw-text grep across all content
 *   docs find <regex> --meta       match only the structured layer (frontmatter + JSON/YAML)
 *   docs find <regex> --path       match the file/folder PATH text instead of content
 *   docs find <regex> --type docs,blog,issues,config   restrict scope
 *   [--count] [--paths-only] [--json] [--case-sensitive]
 *
 * Honors the Category-0 contract (--help/-h intercepted by cli.mjs; exit 0/1/2).
 */

import path from 'node:path';
import { parseArgs, emitJson, writeStdout } from './_cli.mjs';
import { collectContentFiles, searchInFiles, metaSearchInFiles, contentRootDir } from './_content.mjs';

const args = parseArgs(process.argv.slice(2));
const pattern = args._[0];
const caseSensitive = !!args.flags['case-sensitive'];
const types = typeof args.flags.type === 'string' ? args.flags.type.split(',').map((s) => s.trim()).filter(Boolean) : [];

if (!pattern) {
  console.error('Usage: docs find <regex> [--meta] [--path] [--type docs,blog,issues,config] [--count] [--paths-only] [--json]');
  process.exit(2);
}

const files = collectContentFiles(types);
const root = contentRootDir();
let hits;

if (args.flags.path) {
  // Match the path text itself (relative to the content root).
  const re = new RegExp(pattern, caseSensitive ? '' : 'i');
  hits = files.filter((f) => re.test(path.relative(root, f))).map((f) => ({ path: f, line: 0, snippet: path.relative(root, f) }));
} else if (args.flags.meta) {
  hits = metaSearchInFiles(files, pattern, caseSensitive);
} else {
  hits = searchInFiles(files, pattern, caseSensitive);
}

if (args.flags['paths-only']) {
  const seen = new Set();
  const lines = [];
  for (const h of hits) if (!seen.has(h.path)) { seen.add(h.path); lines.push(path.relative(process.cwd(), h.path)); }
  if (lines.length) writeStdout(lines.join('\n') + '\n');
  process.exit(seen.size ? 0 : 1);
}

if (args.flags.json) {
  emitJson(hits.map((h) => ({ path: path.relative(root, h.path), line: h.line, snippet: h.snippet })));
  process.exit(hits.length ? 0 : 1);
}

if (args.flags.count) {
  console.log(`${hits.length} match(es) in ${new Set(hits.map((h) => h.path)).size} file(s) across ${files.length} scanned`);
  process.exit(hits.length ? 0 : 1);
}

const out = hits.map((h) => {
  const rel = path.relative(process.cwd(), h.path);
  return args.flags.path ? rel : `${rel}:${h.line}\t${h.snippet}`;
});
if (out.length) writeStdout(out.join('\n') + '\n');
process.exit(hits.length ? 0 : 1);
