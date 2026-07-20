#!/usr/bin/env bun
/**
 * new-agent-log.mjs — scaffold a new agent-log ACTIVITY folder for an issue,
 * pre-seeded with the standard six 0NN slots (blank + callout).
 *
 * Distinct from add-agent-log (which appends a single milestone/entry): this
 * creates the folder `agent-log/[<group>/]NNN_<code>_<name>/` and the uniform
 * slot set so every activity starts from the same shape with no guesswork:
 *   00_goal · 01_summary · 02_task_list · 03_working · 04_benchmark · 05_notes
 * Each slot is a file with `title` frontmatter and a placeholder callout; the
 * lower three note that they can be promoted to a same-named folder if they
 * grow. No milestone is stubbed — those are created on demand as work lands.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad,
  parseArgs, printHelp, relForLog, MAX_SUBFOLDER_DEPTH,
} from './_lib.mjs';

// Framework-default kinds (mirror of src/loaders/issues.ts). An issue may add
// custom codes via settings.json → agentLogKinds; unknown codes degrade
// gracefully (render without a symbol), so we warn rather than block.
const DEFAULT_KINDS = { lp: 'loop', au: 'audit', rf: 'refactor', it: 'iteration', wf: 'workflow' };

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const kind = args.flags.kind && args.flags.kind !== true ? String(args.flags.kind) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !kind || !rawName) {
  printHelp('issue new-agent-log', [
    '<issue-id> --kind <code> --name <slug> [--group <a[/b]>] [--prefix <NNN>] [--goal <text>] [--json] [--tracker <path>]',
    '',
    'Scaffold a new agent-log activity folder agent-log/[<group>/]NNN_<code>_<name>/',
    'pre-seeded with the standard six slots (00_goal 01_summary 02_task_list 03_working',
    '04_benchmark 05_notes), each a blank file with a title + placeholder callout.',
    '04_benchmark carries the full benchmark template. No milestone is created — add',
    'those on demand as work lands.',
    '',
    `--kind    activity kind code (defaults: ${Object.keys(DEFAULT_KINDS).join('/')}; custom via settings.json agentLogKinds)`,
    '--name    kebab-case run name (sanitised to [a-z0-9-])',
    '--group   nest under a grouping folder path, e.g. a per-series group like',
    '          "refactor" (created if missing; segments sanitised to [a-z0-9-];',
    '          numbering is scoped to the group folder)',
    '--prefix  explicit activity number (digits, e.g. 013) instead of the next',
    '          gap-spaced one — for series that number sequentially',
    '--goal    optional text to seed 00_goal.md instead of its placeholder callout',
    '--json    print the created folder + files as JSON',
  ]);
  process.exit(id && kind && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

// Issue must exist.
const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

// Validate the kind against the effective set (defaults + this issue's custom
// codes). Unknown is a warning, not an error — it still renders, just symbol-less.
const customKinds = meta.agentLogKinds && typeof meta.agentLogKinds === 'object' ? Object.keys(meta.agentLogKinds) : [];
const effective = new Set([...Object.keys(DEFAULT_KINDS), ...customKinds]);
if (!effective.has(kind)) {
  console.error(`warning: kind "${kind}" is not in this issue's effective set (${[...effective].sort().join('/')}) — it will render without a symbol. Declare it in settings.json agentLogKinds to give it one.`);
}

// Sanitise the name to the tracker's slug grammar.
const name = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

// Optional grouping folders — labels only (e.g. a per-series group like
// "refactor/"), sanitised segment by segment, same grammar as subtask groups.
const groupRaw = args.flags.group && args.flags.group !== true ? String(args.flags.group) : '';
const groupSegments = groupRaw
  .split('/')
  .map((s) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
  .filter(Boolean);

if (groupSegments.length >= MAX_SUBFOLDER_DEPTH) {
  console.error(
    `--group "${groupRaw}" nests ${groupSegments.length} folder levels; the loader ` +
    `reads at most ${MAX_SUBFOLDER_DEPTH - 1} grouping levels below agent-log/ ` +
    `(depth cap ${MAX_SUBFOLDER_DEPTH}). Flatten the grouping.`
  );
  process.exit(1);
}

// Optional explicit prefix — for series that number sequentially (001, 002, …)
// rather than gap-spaced; digits only, used verbatim (zero-padding preserved).
const prefixRaw = args.flags.prefix && args.flags.prefix !== true ? String(args.flags.prefix) : '';
if (prefixRaw && !/^\d{2,5}$/.test(prefixRaw)) {
  console.error(`--prefix "${prefixRaw}" must be 2–5 digits (e.g. 013).`);
  process.exit(1);
}

const baseDir = path.join(tracker, id, 'agent-log', ...groupSegments);

// Next activity prefix — gap-spaced by 10 (010, 020, …) to leave insert room,
// matching the convention. Scans existing DIRECTORIES (activity folders), not
// files, so it's independent of add-agent-log's file-level numbering.
function nextActivityPrefix(dir) {
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const m = e.name.match(/^(\d+)[_-]/);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return max === 0 ? 10 : max + 10;
}

const prefix = prefixRaw || pad(nextActivityPrefix(baseDir));
const folderName = `${prefix}_${kind}_${name}`;
const dir = path.join(baseDir, folderName);

if (!isInsideAllowed(dir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${dir}`);
  process.exit(1);
}
if (fs.existsSync(dir)) {
  console.error(`Activity folder already exists: ${relForLog(dir)}`);
  process.exit(1);
}

const goalBody = args.flags.goal && args.flags.goal !== true
  ? `${String(args.flags.goal).trim()}\n`
  : `> [!NOTE]\n> Blank — fill this in. **What this run is trying to achieve**: what triggered\n> it, what "done" looks like, and links to the subtask/notes it executes against.\n`;

// Each slot: [filename, title, body]. 00–02 near-always filled; 03–05 most
// often sit blank-with-callout until the run produces something.
const SLOTS = [
  ['00_goal.md', 'Goal', goalBody],
  ['01_summary.md', 'Summary',
    `> [!NOTE]\n> Blank — write at wrap. **Outcome TL;DR**: what the run was, what landed\n> (with evidence and pointers), and where things stand.\n`],
  ['02_task_list.md', 'Task list',
    `> [!NOTE]\n> Blank — the run's live checklist (working state for THIS run, not the\n> issue's durable subtasks). Add items and tick them off as you go.\n`],
  ['03_working.md', 'Working',
    `> [!NOTE]\n> Blank — raw byproducts this run worked on: research, sub-agent reports,\n> scratch analyses, discussion. The provenance a note is built from; the curated\n> conclusion goes to the issue's \`notes/\`. **If this grows, convert to a\n> \`03_working/\` folder** and split across files (\`research-01_<topic>.md\`, …).\n`],
  ['04_benchmark.md', 'Benchmark',
    `> [!NOTE]\n> Comparable measurements for this run (perf / evals / A-B). Fill the template\n> below, or state "Not applicable" if this run produced none. **If it grows heavy\n> artifacts** (traces, CSVs, screenshots), convert to a \`04_benchmark/\` folder.\n\n` +
    `# Benchmark — <what was measured>\n\n` +
    `## Method\n` +
    `- Baseline: <commit/branch before> vs <commit/branch after>\n` +
    `- Hardware: <cpu / gpu / RAM — the reference floor>\n` +
    `- Scenario: <exact repro: doc size, input pattern, iterations, tool>\n` +
    `- Instrument: <deterministic unit measure / Playwright + performance.memory / DevTools trace>\n\n` +
    `## Results\n` +
    `| Metric | Before | After | Delta | Notes |\n` +
    `|--------|--------|-------|-------|-------|\n` +
    `|  |  |  |  |  |\n\n` +
    `## Claim vs measured\n` +
    `<the stage claimed X; measured Y; verdict: confirmed / partial / regression / no-change —\n` +
    `for a non-perf stage, "no regression" is the passing result>\n\n` +
    `## Artifacts\n` +
    `<links to heavy artifacts — traces, screenshots, CSVs>\n`],
  ['05_notes.md', 'Notes',
    `> [!NOTE]\n> Blank — the run's **handover to the next run**: caveats and gotchas, issues\n> found but deferred (fix next iteration), and discoveries useful later.\n> Disambiguate: durable decisions/output → the issue's \`notes/\`; facts that stay\n> true across runs → \`agent-memory/\`; run-to-next-run notes → here. **If this\n> grows, convert to a \`05_notes/\` folder.**\n`],
];

fs.mkdirSync(dir, { recursive: true });
const written = [];
for (const [file, title, body] of SLOTS) {
  const abs = path.join(dir, file);
  fs.writeFileSync(abs, `---\ntitle: "${title}"\n---\n\n${body}`);
  written.push(file);
}

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    folder: folderName,
    path: relForLog(dir),
    group: groupSegments.join('/') || null,
    files: written,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(dir)}/ with ${written.length} slots: ${written.join(' ')}`);
}
