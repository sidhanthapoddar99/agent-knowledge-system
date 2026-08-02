#!/usr/bin/env bun
/**
 * legacy-mask-probe.mjs — two questions about the retired-shape detector in
 * `agent-ks check issues`.
 *
 *   1. Does a CURRENT-shape agent log that also carries one legacy marker get
 *      every one of its checks skipped, silently? (targeted mutants)
 *   2. How many folders in the REAL tracker are currently classified as history,
 *      and how many of those are current-shape (they carry `01_summary.md`)?
 *
 * The skip is a bare `return`, so a wrong classification reports nothing at all
 * — which is indistinguishable from a clean run.
 *
 * Run:  bun verification/skill-consistency/legacy-mask-probe.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../..');
const SEED = path.join(HERE, 'scratch-tracker');
const OUT = path.join(HERE, 'out', 'legacy-mask');
const CHECK = path.join(REPO, 'plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs');
const TRACKER = path.join(REPO, 'default-docs/data/todo');
const ID = '2026-08-03-scratch-probe';
const LOG = `${ID}/agent-log/010_wf_ship-the-decoder`;

// Mirrors check.mjs lines 718-719.
const LEGACY_SLOT = /^(00_goal|02_task_list|03_working|04_benchmark|05_notes)$/;
const LEGACY_MILESTONE = /^[1-9]\d{2,4}_.+\.md$/;

function runCheck(tracker) {
  const r = spawnSync('bun', [CHECK, '--tracker', tracker, '--json'], { encoding: 'utf-8' });
  try { return JSON.parse(r.stdout); } catch { return { errors: [], warnings: [], parseFailure: true }; }
}

/** Break three things the validator normally catches, so a silent run proves
 *  the skip rather than proving the fixture was already clean. */
function breakThreeRules(t) {
  // (a) an unnumbered slot
  fs.mkdirSync(path.join(t, LOG, 'debrief'), { recursive: true });
  fs.writeFileSync(path.join(t, LOG, 'debrief/handover.md'), '---\ntitle: "H"\n---\n\nbody\n');
  // (b) `iteration:` in a working file — retired
  const f = path.join(t, LOG, '02_working/010_audit-round.md');
  fs.writeFileSync(f, fs.readFileSync(f, 'utf-8').replace(/^status: open$/m, 'status: open\niteration: 1'));
  // (c) a child agent log numbered into the slot band
  fs.mkdirSync(path.join(t, LOG, '05_wf_sneaky'), { recursive: true });
  fs.writeFileSync(path.join(t, LOG, '05_wf_sneaky/01_summary.md'), '---\ntitle: "S"\n---\n\nbody\n');
}

const CASES = [
  {
    id: 'P0-control-no-marker',
    why: 'CONTROL — the same three breakages with NO legacy marker. Must be caught.',
    apply: breakThreeRules,
  },
  {
    id: 'P1-root-milestone-file',
    why: 'current shape, intact, + one loose `140_audit-brief.md` at the log root',
    apply: (t) => { breakThreeRules(t); fs.writeFileSync(path.join(t, LOG, '140_audit-brief.md'), '---\ntitle: "Brief"\n---\n\nbody\n'); },
  },
  {
    id: 'P2-03-working-typo',
    why: 'current shape, intact, + a `03_working/` folder (off-by-one from `02_working/`)',
    apply: (t) => { breakThreeRules(t); fs.mkdirSync(path.join(t, LOG, '03_working'), { recursive: true }); fs.writeFileSync(path.join(t, LOG, '03_working/010_x.md'), '---\ntitle: "X"\n---\n\nbody\n'); },
  },
  {
    id: 'P3-05-notes-folder',
    why: 'current shape, intact, + a `05_notes/` folder (a plausible fourth slot)',
    apply: (t) => { breakThreeRules(t); fs.mkdirSync(path.join(t, LOG, '05_notes'), { recursive: true }); fs.writeFileSync(path.join(t, LOG, '05_notes/010_x.md'), '---\ntitle: "X"\n---\n\nbody\n'); },
  },
];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('# 1. targeted mutants — does ONE legacy marker silence a current-shape log?\n');
console.log('| case | findings on this log | verdict | what it is |');
console.log('|---|---|---|---|');
for (const c of CASES) {
  const dir = path.join(OUT, c.id);
  fs.cpSync(SEED, dir, { recursive: true });
  c.apply(dir);
  const res = runCheck(dir);
  const all = [...(res.errors || []), ...(res.warnings || [])].filter((s) => s.includes('010_wf_ship-the-decoder'));
  const verdict = c.id === 'P0-control-no-marker'
    ? (all.length >= 3 ? 'CONTROL-OK (caught)' : `CONTROL-WEAK (only ${all.length})`)
    : (all.length === 0 ? '**MASKED — validator silent**' : `partially caught (${all.length})`);
  console.log(`| ${c.id} | ${all.length} | ${verdict} | ${c.why} |`);
  fs.writeFileSync(path.join(OUT, `${c.id}.json`), JSON.stringify(all, null, 2));
}

console.log('\n# 2. blast radius on the real tracker\n');
let total = 0, legacy = 0, legacyWithSummary = 0;
const offenders = [];
function walkLogs(absDir, rel, depth) {
  let entries;
  try { entries = fs.readdirSync(absDir, { withFileTypes: true }); } catch { return; }
  const names = entries.map((e) => e.name);
  const isLegacy = names.some((n) => LEGACY_SLOT.test(n.replace(/\.md$/, '')) || LEGACY_MILESTONE.test(n));
  const hasSummary = names.includes('01_summary.md');
  total++;
  if (isLegacy) {
    legacy++;
    if (hasSummary) { legacyWithSummary++; offenders.push(rel); }
  }
  if (depth >= 4) return;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const m = e.name.match(/^(\d{1,5})[_-]/);
    if (!m || parseInt(m[1], 10) < 100) continue;   // only recurse into child activities
    walkLogs(path.join(absDir, e.name), `${rel}/${e.name}`, depth + 1);
  }
}
for (const issue of fs.readdirSync(TRACKER, { withFileTypes: true })) {
  if (!issue.isDirectory()) continue;
  const logDir = path.join(TRACKER, issue.name, 'agent-log');
  if (!fs.existsSync(logDir)) continue;
  for (const e of fs.readdirSync(logDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (!/^(\d{2,5})_([a-z]{2})_/.test(e.name)) continue;   // only real activities, as check.mjs does
    walkLogs(path.join(logDir, e.name), `${issue.name}/agent-log/${e.name}`, 1);
  }
}
console.log(`| metric | count |`);
console.log(`|---|---|`);
console.log(`| activity folders scanned | ${total} |`);
console.log(`| classified as RETIRED shape (all checks skipped) | ${legacy} |`);
console.log(`| …of those, carrying \`01_summary.md\` (current-shape marker too) | ${legacyWithSummary} |`);
if (offenders.length) {
  console.log('\nambiguous folders (current-shape summary + a legacy marker):');
  for (const o of offenders) console.log(`  - ${o}`);
}
