/**
 * frontmatter.test.mjs — a DIFFERENTIAL test. It asserts nothing of its own.
 *
 * It asks `gray-matter` and `readFrontmatter` the same question about the same
 * bytes and fails when they disagree. That is the only honest way to retire a
 * library: not "the new one looks right", but "over every real file we have,
 * these two produce the same answer."
 *
 * **gray-matter is a TEST-ONLY dependency from here on.** A test may need a
 * package because a test never runs on a consumer's machine — the same standing
 * `code-spans.test.mjs` has with micromark. The shipped commands import neither.
 *
 * Run:  bun fixtures/frontmatter.test.mjs [content-root]
 *       (default root: the project's data/ dir, via resolve-context)
 *
 * Exit 0 = the two agree everywhere. Exit 1 = a disagreement, printed in full.
 *
 * The corpus is every `.md` on disk PLUS the hand-written cases below, because
 * a corpus can only test what someone happened to write. The synthetic half is
 * where the nasty shapes live — a colon in a title, an empty block, CRLF, a
 * body that contains its own `---`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { readFrontmatter } from '../_frontmatter.mjs';
import { resolveProjectContext } from '../_env.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));

// ---- the synthetic corpus: shapes a real tracker may not happen to contain ---

const CASES = [
  ['no frontmatter at all', '# just a heading\n\nbody\n'],
  ['empty document', ''],
  ['empty block', '---\n---\n\nbody\n'],
  ['blank-line block', '---\n\n---\n\nbody\n'],
  ['plain scalars', '---\ntitle: A page\nstatus: open\n---\n\nbody\n'],
  ['colon inside a quoted title', '---\ntitle: "Links: relative, always"\n---\n\nbody\n'],
  ['single quotes', "---\ntitle: 'It''s fine'\n---\n\nbody\n"],
  ['inline array', '---\nlabels: [a, b, c]\n---\n\nbody\n'],
  ['block array', '---\nlabels:\n  - a\n  - b\n---\n\nbody\n'],
  ['nested map', '---\nmeta:\n  owner: sid\n  n: 3\n---\n\nbody\n'],
  ['numbers and booleans', '---\nn: 3\nx: 1.5\nb: true\nz: null\n---\n\nbody\n'],
  ['date-shaped value', '---\ncreated: 2026-08-04\n---\n\nbody\n'],
  ['quoted date stays a string', '---\ncreated: "2026-08-04"\n---\n\nbody\n'],
  ['CRLF line endings', '---\r\ntitle: A page\r\n---\r\n\r\nbody\r\n'],
  ['no body after the block', '---\ntitle: A page\n---\n'],
  ['no trailing newline at all', '---\ntitle: A page\n---'],
  ['body contains its own ---', '---\ntitle: A page\n---\n\nbefore\n\n---\n\nafter\n'],
  ['thematic break, not frontmatter', '# heading\n\n---\n\nbody\n'],
  ['--- not at position 0', '\n---\ntitle: A page\n---\n\nbody\n'],
  ['four dashes is not a delimiter', '----\ntitle: A page\n----\n\nbody\n'],
  ['trailing space after close', '---\ntitle: A page\n--- \n\nbody\n'],
  ['multi-line scalar', '---\nsummary: |\n  line one\n  line two\n---\n\nbody\n'],
  ['folded scalar', '---\nsummary: >\n  line one\n  line two\n---\n\nbody\n'],
  ['key with a dash', '---\nagent-logs: [x]\n---\n\nbody\n'],
  ['unicode value', '---\ntitle: "काम — dash"\n---\n\nbody\n'],
];

// ---- comparison -------------------------------------------------------------

/** Both sides normalized the same way, so a difference is a real difference. */
function shape(fn, text) {
  try {
    const r = fn(text);
    return { threw: false, data: JSON.stringify(r.data ?? {}), content: r.content ?? '' };
  } catch (err) {
    // Only the FACT of throwing is compared. The message is each library's own
    // prose and would fail on wording, which is not what this test is about.
    return { threw: true, data: null, content: null, why: err.message };
  }
}

/**
 * The ONE divergence that is intended, and it is a FIX rather than a tolerance.
 *
 * js-yaml (inside gray-matter) resolves an unquoted `date: 2026-08-04` into a JS
 * Date at UTC midnight, so the CLI has been emitting
 * `"date": "2026-08-04T00:00:00.000Z"` — a timestamp and a timezone the file
 * never carried. The framework already undoes this (`issues.ts → fmDateString`)
 * because it wants a `YYYY-MM-DD` string; the plugin never did.
 *
 * `Bun.YAML` leaves it a string, which is what every consumer here wants.
 *
 * Narrow on purpose: it fires only when gray-matter produced an ISO instant at
 * exactly UTC midnight where we produced its date half. Any other difference in
 * the same file is still a failure.
 */
function isTheDateFix(grayJson, oursJson) {
  let g, o;
  try { g = JSON.parse(grayJson); o = JSON.parse(oursJson); } catch { return false; }
  const keys = new Set([...Object.keys(g), ...Object.keys(o)]);
  let sawOne = false;
  for (const k of keys) {
    if (JSON.stringify(g[k]) === JSON.stringify(o[k])) continue;
    if (typeof o[k] === 'string' && typeof g[k] === 'string' && g[k] === `${o[k]}T00:00:00.000Z`) {
      sawOne = true;
      continue;
    }
    return false; // a difference this exception does not cover
  }
  return sawOne;
}

function compare(label, text, out, expected) {
  const a = shape(matter, text);
  const b = shape(readFrontmatter, text);

  if (a.threw !== b.threw) {
    out.push({ label, kind: 'throw', gray: a.threw ? `threw: ${a.why}` : 'ok', ours: b.threw ? `threw: ${b.why}` : 'ok' });
    return;
  }
  if (a.threw) return; // both rejected it — agreed
  if (a.data !== b.data) {
    if (isTheDateFix(a.data, b.data)) expected.push(label);
    else out.push({ label, kind: 'data', gray: a.data, ours: b.data });
  }
  if (a.content !== b.content) {
    out.push({ label, kind: 'content', gray: JSON.stringify(a.content), ours: JSON.stringify(b.content) });
  }
}

// ---- the on-disk corpus -----------------------------------------------------

function collectMd(dir, out) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) collectMd(abs, out);
    else if (e.name.endsWith('.md')) out.push(abs);
  }
}

const root = process.argv[2] ?? path.join(resolveProjectContext(SCRIPT_DIR).contentRoot, 'data');

const disagreements = [];
const expected = [];
for (const [label, text] of CASES) compare(`synthetic: ${label}`, text, disagreements, expected);

const files = [];
collectMd(root, files);
for (const f of files) {
  let text;
  try { text = fs.readFileSync(f, 'utf-8'); } catch { continue; }
  compare(path.relative(root, f), text, disagreements, expected);
}

// ---- report -----------------------------------------------------------------

const checked = CASES.length + files.length;
process.stdout.write(`# frontmatter differential: gray-matter vs readFrontmatter\n`);
process.stdout.write(`(${CASES.length} synthetic case(s) + ${files.length} file(s) under ${root})\n\n`);

// Named and counted, never folded into the pass line — a tolerance nobody can
// see is a tolerance that grows.
if (expected.length > 0) {
  process.stdout.write(`~ ${expected.length} intended divergence(s): unquoted \`date:\` stays a YYYY-MM-DD string\n`);
  process.stdout.write(`  (gray-matter yields a JS Date → "…T00:00:00.000Z"; the framework already undoes that)\n`);
  for (const l of expected.slice(0, 5)) process.stdout.write(`    ${l}\n`);
  if (expected.length > 5) process.stdout.write(`    … and ${expected.length - 5} more\n`);
  process.stdout.write('\n');
}

if (disagreements.length === 0) {
  process.stdout.write(`✓ ${checked} document(s), 0 unexpected disagreements\n`);
  process.exit(0);
}

for (const d of disagreements) {
  process.stdout.write(`✗ ${d.label}  [${d.kind}]\n`);
  process.stdout.write(`    gray-matter: ${d.gray}\n`);
  process.stdout.write(`    ours:        ${d.ours}\n`);
}
process.stdout.write(`\n${disagreements.length} disagreement(s) over ${checked} document(s)\n`);
process.exit(1);
