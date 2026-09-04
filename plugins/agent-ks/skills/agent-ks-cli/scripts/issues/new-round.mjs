#!/usr/bin/env bun
/**
 * new-round.mjs — add a round file to an agent log, flat beside `00_index.md`,
 * from `templates/log-round.md`, and list it under `## Files` in `00_index.md`.
 *
 * Numbering: a round file's prefix ends in 0 and rounds are gap-spaced by ten
 * (`10_`, `20_`, `30_`). `--report` writes a report produced inside the current
 * round; it takes the next free digit 1–9 (`21_`, `22_`).
 *
 *   10_audit.md          round 1
 *   20_fix.md            round 2
 *   21_scope-a-bytes.md  a report inside round 2
 *
 * `new-iteration` is an alias of this command.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, readAgentLogRounds,
  parseArgs, printHelp, relForLog, parseGroupSegments, sanitizeName, csv, AGENT_LOG_INDEX,
} from './_lib.mjs';
import { frontmatterData } from '../_frontmatter.mjs';
import { renderTemplate, readTemplate, TEMPLATE_NAMES } from '../_templates.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const logRaw = args.flags.log && args.flags.log !== true ? String(args.flags.log) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !logRaw || !rawName) {
  printHelp('issue new-round', [
    '<issue-id> --log <path-under-agent-log> --name <slug> [--title <text>] [--report] [--round <N>]',
    '           [--goal <text>] [--inputs <a,b>] [--agent <name>] [--json] [--tracker <path>]',
    '',
    'Write NN_<name>.md flat in the log folder from templates/log-round.md, and list',
    'it under `## Files` in 00_index.md. A round prefix ends in 0, gap-spaced by ten',
    '(10, 20, 30). --report writes the next N1–N9 file inside the current round.',
    '',
    '--log      path to the agent log, relative to agent-log/ (e.g. 030_lp_overnight)',
    '--name     kebab-case name for this file',
    '--title    frontmatter title (default: the name, de-kebabed and capitalised)',
    '--report   this file is one report produced inside the current round',
    '--round    force the round number instead of deriving it',
    '--goal     the lead line: why this round exists. Also the note beside the index entry',
    '--inputs   comma-separated paths (relative to the log, the issue, or the tracker);',
    '           each is written under `## Links` as a link with the file title as text',
    '--agent    frontmatter `agent:` — who wrote it (default claude; name the tool for an external job)',
    '--json     print the created file as JSON',
  ]);
  process.exit(id && logRaw && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

if (!readIssueMeta(tracker, id)) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const issueDir = path.join(tracker, id);
const logSegments = parseGroupSegments(logRaw);
const logDir = path.join(issueDir, 'agent-log', ...logSegments);
if (!fs.existsSync(logDir)) {
  console.error(`No agent log at ${relForLog(logDir)} — create it with \`agent-ks issue new-agent-log\` first.`);
  process.exit(1);
}

const indexPath = path.join(logDir, AGENT_LOG_INDEX);

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const rounds = readAgentLogRounds(logDir).filter((r) => r.round !== null);
const IS_REPORT = !!args.flags.report;
const forced = args.flags.round && args.flags.round !== true ? String(args.flags.round) : '';
if (forced && !/^[1-9]\d{0,3}$/.test(forced)) {
  console.error(`--round "${forced}" must be a round number from 1 to 9999.`);
  process.exit(1);
}

const maxRound = rounds.reduce((m, r) => Math.max(m, r.round), 0);
let round;
if (forced) round = parseInt(forced, 10);
else if (IS_REPORT) round = maxRound;
else round = maxRound + 1;

if (IS_REPORT && round === 0) {
  console.error(`No round in ${relForLog(logDir)} yet. Create the round first, then add its reports with --report.`);
  process.exit(1);
}

const inRound = rounds.filter((r) => r.round === round).map((r) => r.report);
let digit;
if (IS_REPORT) {
  if (!inRound.includes(0)) {
    console.error(`Round ${round} has no round file (\`${round}0_<name>.md\`). Create it first, then add its reports with --report.`);
    process.exit(1);
  }
  digit = 1;
  while (inRound.includes(digit)) digit++;
  if (digit > 9) {
    console.error(`Round ${round} already holds nine reports. Open the next round instead.`);
    process.exit(1);
  }
} else {
  digit = 0;
  if (inRound.includes(0)) {
    console.error(`Round ${round} already has its round file. A second file in the same round is a report — pass --report.`);
    process.exit(1);
  }
}

const prefix = String(round * 10 + digit).padStart(2, '0');
const fileName = `${prefix}_${name}.md`;
const abs = path.join(logDir, fileName);

if (!isInsideAllowed(abs, tracker)) {
  console.error(`Refusing to write outside the tracker: ${abs}`);
  process.exit(1);
}
if (fs.existsSync(abs)) {
  console.error(`Round file already exists: ${relForLog(abs)}`);
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const agent = args.flags.agent && args.flags.agent !== true ? String(args.flags.agent) : 'claude';
const goal = args.flags.goal && args.flags.goal !== true ? String(args.flags.goal) : '';

// Every `--inputs` path must exist. It is written as a link relative to the
// log folder, with the file's frontmatter title (or its name) as the text.
function resolveInput(ref) {
  for (const base of [logDir, issueDir, tracker, process.cwd()]) {
    const candidate = path.resolve(base, ref);
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.isAbsolute(ref) && fs.existsSync(ref) ? path.resolve(ref) : null;
}
function titleOf(absPath) {
  if (absPath.endsWith('.md')) {
    try {
      const t = frontmatterData(fs.readFileSync(absPath, 'utf-8')).title;
      if (t) return String(t);
    } catch { /* no frontmatter — fall back to the name */ }
  }
  return path.basename(absPath).replace(/\.md$/, '');
}
const inputLinks = [];
for (const ref of csv(args.flags.inputs)) {
  const found = resolveInput(ref);
  if (!found) {
    console.error(`--inputs "${ref}": no such file (looked from the log folder, the issue, the tracker and the working directory). Nothing written.`);
    process.exit(1);
  }
  const rel = path.relative(logDir, found).split(path.sep).join('/');
  inputLinks.push(`- [${titleOf(found).replace(/[[\]]/g, '')}](${rel.startsWith('.') ? rel : `./${rel}`})`);
}

// The template has no `#` sections, so the whole body is its lead. Seed the
// first line with the goal and append the input links under `## Links`.
const t = readTemplate('log-round');
const leadLines = t.lead.split('\n');
if (goal) leadLines[0] = goal;
let lead = leadLines.join('\n');
if (inputLinks.length) lead = `${lead.replace(/\s+$/, '')}\n${inputLinks.join('\n')}`;
const body = renderTemplate('log-round', [['title', title], ['status', 'open'], ['agent', agent]], { lead });

fs.writeFileSync(abs, body);

// The index lists every file in the folder. Append this one under `## Files`,
// creating the section at the end when the index has none. A log with no
// 00_index.md gets the file anyway and a one-line notice; the shape is guidance.
const entry = `- [${title.replace(/[[\]]/g, '')}](./${fileName})${goal ? ` — ${goal}` : ''}`;
const hasIndex = fs.existsSync(indexPath);
let indexText = hasIndex ? fs.readFileSync(indexPath, 'utf-8') : '';
const lines = indexText.split(/\r?\n/);
const head = lines.findIndex((l) => /^## Files\s*$/.test(l));
if (!hasIndex) {
  // nothing to update
} else if (head < 0) {
  indexText = `${indexText.replace(/\s+$/, '')}\n\n## Files\n${entry}\n`;
} else {
  // Drop the template's placeholder sentence the first time a real entry lands.
  const placeholder = new Set(
    TEMPLATE_NAMES.filter((n) => n.startsWith('log-index')).flatMap((n) =>
      (readTemplate(n).lead.split(/\n## Files\n/)[1] || '').split(/\n## /)[0].split('\n').map((l) => l.trim()).filter(Boolean)),
  );
  let end = head + 1;
  while (end < lines.length && !/^#{1,2} /.test(lines[end])) {
    if (placeholder.has(lines[end].trim())) lines.splice(end, 1);
    else end++;
  }
  while (end > head + 1 && lines[end - 1].trim() === '') end--;
  lines.splice(end, 0, entry);
  indexText = lines.join('\n');
}
if (hasIndex) fs.writeFileSync(indexPath, indexText);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    log: logSegments.join('/'),
    file: fileName,
    path: relForLog(abs),
    round,
    report: digit,
    prefix,
    // false means the log has no 00_index.md, so nothing listed the new file.
    // The human path prints that notice; --json carries it here.
    indexUpdated: hasIndex,
  }, null, 2));
} else {
  console.log(`Created ${relForLog(abs)} — round ${round}${IS_REPORT ? `, report ${digit}` : ''}`);
  if (hasIndex) console.log(`  next: when it lands, write its result under "## Result"; the 00_index.md line is already added`);
  else console.log(`  00_index.md not found; add the file line by hand`);
}
