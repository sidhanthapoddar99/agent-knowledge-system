#!/usr/bin/env bun
/**
 * new-iteration.mjs — create an iteration file (or a producer's file) inside an
 * agent log's `02_working/`, with its HEAD pre-filled.
 *
 * Numbering: the first two digits are the ITERATION, the last digit is which
 * file within it — `0` for the iteration file itself, `1`…`9` for a producer's
 * own file sitting beside it.
 *
 *   02_working/010_audit-round.md          iteration 01 — the orchestrator's file
 *   02_working/011_scope-a-bytes.md          a producer within it
 *   02_working/012_scope-b-blast.md          another producer
 *   02_working/020_fix-round.md            iteration 02
 *
 * An iteration is a GROUP — of subtasks, of executions, of agents — not one
 * agent's assignment. File count scales with what was PRODUCED, not with how
 * many agents ran: two executors writing code share one iteration file; two
 * auditors writing reports get a file each.
 *
 * The head (Goal / Inputs / Expected Outcome) is the work order, so the tool
 * writes it rather than leaving four headings to be remembered. `# Outcome` is
 * filled by whoever does the work.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, isInsideAllowed, readIssueMeta,
  parseArgs, printHelp, relForLog, parseGroupSegments, sanitizeName,
} from './_lib.mjs';

// What "done" looks like per kind of work unit. Stating it even when obvious is
// the line that makes a half-finished file legible AS half-finished.
const EXPECTED = {
  planning: 'The ordered task list the later units execute against.',
  execution: 'The change, and what it touched.',
  audit: 'Findings — each with `file:line`, the failure scenario, and whether it was reproduced.',
  decide: 'A verdict per finding: fix / reject / defer / not-ready.',
  fix: 'The fix, and which finding it closes.',
  research: 'Findings and a recommendation.',
  benchmark: 'Before-and-after numbers, with units.',
  test: 'Survivors and kills, the exact command, and the collected count.',
};

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const logRaw = args.flags.log && args.flags.log !== true ? String(args.flags.log) : null;
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !logRaw || !rawName) {
  printHelp('issue new-iteration', [
    '<issue-id> --log <path-under-agent-log> --name <slug> [--producer] [--iteration <NN>]',
    '           [--goal <text>] [--inputs <a,b>] [--unit <kind>] [--agent <name>] [--json] [--tracker <path>]',
    '',
    "Create 02_working/NNN_<name>.md inside an agent log, with its head pre-filled",
    '(Goal / Inputs / Expected Outcome / Outcome). First two digits = the iteration,',
    'last digit = which file within it (0 = the iteration file, 1-9 = producers).',
    '',
    '--log         path to the agent log, relative to agent-log/ (e.g. 030_lp_overnight',
    '              or 030_lp_overnight/010_wf_decoder-swap for a child log)',
    '--name        kebab-case name for this file',
    '--title       frontmatter title (default: de-kebabed name)',
    '--producer    this file belongs to ONE agent that produced something substantial',
    '              (an audit, a survey, a measured comparison) — takes the next free',
    '              digit inside the current iteration instead of opening a new one',
    '--iteration   force the two-digit iteration number instead of deriving it',
    '--goal        seed # Goal',
    '--inputs      comma-separated paths to seed # Inputs (default: none)',
    `--unit        kind of work unit — seeds # Expected Outcome (${Object.keys(EXPECTED).join('/')})`,
    '--agent       frontmatter `agent:` — who wrote it. For an external tool, name the',
    '              TOOL: the finding is its, and its named owner is accountable for the',
    '              file existing',
    '--json        print the created file as JSON',
  ]);
  process.exit(id && logRaw && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

if (!readIssueMeta(tracker, id)) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const logSegments = parseGroupSegments(logRaw);
const logDir = path.join(tracker, id, 'agent-log', ...logSegments);
if (!fs.existsSync(logDir)) {
  console.error(`No agent log at ${relForLog(logDir)} — create it with \`agent-ks issue new-agent-log\` first.`);
  process.exit(1);
}

const name = sanitizeName(rawName);
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const workingDir = path.join(logDir, '02_working');

/** Every NNN_ prefix already used in 02_working/, as { iteration, file } pairs. */
function existingPrefixes() {
  if (!fs.existsSync(workingDir)) return [];
  const out = [];
  for (const e of fs.readdirSync(workingDir, { withFileTypes: true })) {
    // Both a file (`011_x.md`) and a producer's artifact FOLDER (`060_x/`)
    // occupy a prefix — counting only files would hand out a colliding number.
    const m = e.name.match(/^(\d{2})(\d)[_-]/);
    if (m) out.push({ iteration: parseInt(m[1], 10), file: parseInt(m[2], 10) });
  }
  return out;
}

const used = existingPrefixes();
const IS_PRODUCER = !!args.flags.producer;
const forced = args.flags.iteration && args.flags.iteration !== true ? String(args.flags.iteration) : '';
if (forced && !/^\d{1,2}$/.test(forced)) {
  console.error(`--iteration "${forced}" must be 1–2 digits (the iteration number, e.g. 03).`);
  process.exit(1);
}

const maxIteration = used.reduce((m, p) => Math.max(m, p.iteration), 0);
let iteration;
if (forced) iteration = parseInt(forced, 10);
else if (IS_PRODUCER) iteration = maxIteration || 1;
else iteration = maxIteration + 1;

if (iteration > 99) {
  console.error(
    `Iteration ${iteration} exceeds the two-digit band. A 02_working/ that has run ` +
    `99 rounds is evidence the RUN should have been split into child agent logs.`,
  );
  process.exit(1);
}

const inIteration = used.filter((p) => p.iteration === iteration).map((p) => p.file);
let fileDigit;
if (IS_PRODUCER) {
  fileDigit = 1;
  while (inIteration.includes(fileDigit)) fileDigit++;
  if (fileDigit > 9) {
    console.error(
      `Iteration ${iteration} already has nine producer files. That many agents on ` +
      `one round is evidence the round should be two child agent logs, not that ` +
      `02_working/ should grow a tree.`,
    );
    process.exit(1);
  }
} else {
  fileDigit = 0;
  if (inIteration.includes(0)) {
    console.error(
      `Iteration ${String(iteration).padStart(2, '0')} already has its iteration file. ` +
      `A second agent on the same round writes a PRODUCER file — pass --producer.`,
    );
    process.exit(1);
  }
}

const prefix = `${String(iteration).padStart(2, '0')}${fileDigit}`;
const fileName = `${prefix}_${name}.md`;
const abs = path.join(workingDir, fileName);

if (!isInsideAllowed(abs, tracker)) {
  console.error(`Refusing to write outside the tracker: ${abs}`);
  process.exit(1);
}
if (fs.existsSync(abs)) {
  console.error(`Iteration file already exists: ${relForLog(abs)}`);
  process.exit(1);
}

const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : name.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
const agent = args.flags.agent && args.flags.agent !== true ? String(args.flags.agent) : 'claude';

const unit = args.flags.unit && args.flags.unit !== true ? String(args.flags.unit) : '';
if (unit && !EXPECTED[unit]) {
  console.error(`--unit "${unit}" is not a known work unit (${Object.keys(EXPECTED).join('/')}).`);
  process.exit(1);
}

const goalBody = args.flags.goal && args.flags.goal !== true
  ? `${String(args.flags.goal).trim()}\n`
  : `> [!NOTE]\n> The problem this covers, in one or two lines. **Stands alone** — a reader who\n> has opened nothing else understands what was being solved.\n`;

const inputsRaw = args.flags.inputs && args.flags.inputs !== true ? String(args.flags.inputs) : '';
const inputsBody = inputsRaw
  ? inputsRaw.split(',').map((s) => s.trim()).filter(Boolean).map((p) => `- \`${p}\``).join('\n') + '\n'
  : `none\n`;

const expectedBody = unit
  ? `${EXPECTED[unit]}\n`
  : `> [!NOTE]\n> What "done" looks like for this kind of work. State it even when obvious — it\n> is the line that makes a half-finished file legible as half-finished.\n`;

const body = `---
title: "${title}"
status: open
agent: ${agent}
---

# Goal

${goalBody}
# Inputs

${inputsBody}
# Expected Outcome

${expectedBody}
# Outcome

> [!NOTE]
> What actually came back — filled when the round lands. \`status\` above says
> whether the agent FINISHED; this says what it found. An audit that finished
> and found two real defects is \`done\`, not \`dropped\`.
`;

fs.mkdirSync(workingDir, { recursive: true });
fs.writeFileSync(abs, body);

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    log: logSegments.join('/'),
    file: fileName,
    path: relForLog(abs),
    iteration,
    fileDigit,
    producer: IS_PRODUCER,
  }, null, 2));
} else {
  console.log(
    `Created ${relForLog(abs)} — iteration ${String(iteration).padStart(2, '0')}, ` +
    `${IS_PRODUCER ? `producer file ${fileDigit}` : 'the iteration file'}`,
  );
}
