#!/usr/bin/env bun
/**
 * battery.mjs — mutation battery against `agent-ks check issues`.
 *
 * For each rule the agent-ks-issues skill states in prose, break it on a
 * PRIVATE COPY of a clean scratch tracker and ask whether the validator
 * notices. A rule that survives is a rule nothing enforces.
 *
 * Never mutates a shared tree: every mutant gets its own copy under
 * `out/mutants/<id>/`, so two runs cannot corrupt each other.
 *
 * Run:  bun verification/skill-consistency/battery.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = path.resolve(HERE, '../..');
const SEED = path.join(HERE, 'scratch-tracker');
const OUT = path.join(HERE, 'out', 'mutants');
const CHECK = path.join(REPO, 'plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs');
const ID = '2026-08-03-scratch-probe';
const LOG = `${ID}/agent-log/010_wf_ship-the-decoder`;
const PLAN = `${ID}/plans/01_decoder-and-retention`;

function runCheck(tracker) {
  const r = spawnSync('bun', [CHECK, '--tracker', tracker, '--json'], { encoding: 'utf-8' });
  try { return JSON.parse(r.stdout); }
  catch { return { parseFailure: true, stdout: r.stdout, stderr: r.stderr, errors: [], warnings: [] }; }
}

// ── the mutants ────────────────────────────────────────────────────────────
// `expect` is a substring that must appear in errors+warnings for the mutant to
// count as KILLED. `expect: null` means "the skill states this rule and nothing
// is expected to enforce it" — recorded so a survivor is a finding, not a gap
// in the battery.
const MUTANTS = [
  {
    id: 'M00-control-untouched',
    why: 'CONTROL: an unmutated copy must be clean. Proves the seed is a valid baseline.',
    apply: () => {},
    expect: null,
    expectClean: true,
  },
  {
    id: 'M01-no-summary',
    why: 'skill: `01_summary.md` is REQUIRED',
    apply: (t) => fs.rmSync(path.join(t, LOG, '01_summary.md')),
    expect: 'no `01_summary.md`',
  },
  {
    id: 'M02-unnumbered-working',
    why: 'skill: the slots are NUMBERED; a bare `working/` is the retired shape',
    apply: (t) => fs.renameSync(path.join(t, LOG, '02_working'), path.join(t, LOG, 'working')),
    expect: 'unnumbered slot',
  },
  {
    id: 'M03-audit-folder',
    why: 'skill 24_agent-logs.md: "There is no separate `audit/` folder"',
    apply: (t) => {
      fs.mkdirSync(path.join(t, LOG, 'audit'));
      fs.writeFileSync(path.join(t, LOG, 'audit/scope-a.md'), '---\ntitle: "Scope A"\n---\n\nbody\n');
    },
    expect: 'reads as one of the run',
  },
  {
    id: 'M04-agent-logs-frontmatter',
    why: 'skill + guide + user-guide: `agent-logs:` is RETIRED and errors',
    apply: (t) => {
      const f = path.join(t, PLAN, '10_decoder-swap.md');
      const s = fs.readFileSync(f, 'utf-8');
      fs.writeFileSync(f, s.replace(
        /^status: open$/m,
        'status: open\nagent-logs:\n  - "[the run](../../agent-log/010_wf_ship-the-decoder/01_summary.md)"',
      ));
    },
    expect: '`agent-logs:` is retired',
  },
  {
    id: 'M05-broken-subtask-ref',
    why: 'skill: a broken `subtasks:` ref is a validator ERROR',
    apply: (t) => {
      const f = path.join(t, PLAN, '15_journal-compat.md');
      const s = fs.readFileSync(f, 'utf-8');
      fs.writeFileSync(f, s.replace('010_a-subtask.md', '999_does-not-exist.md'));
    },
    expect: 'does not exist',
  },
  {
    // The H1 finding of the 2026-08-03 audit, kept as a permanent mutant.
    //
    // A ref pointing at an agent-log file is the SAME defect as a ref pointing
    // at nothing — the renderer resolves `subtasks:` against subtasks alone, so
    // the plan page draws it in red either way. It used to pass the gate,
    // because the validator's index walked `agent-log/` too: a leftover from
    // when `agent-logs:` was a second frontmatter list resolved by that index.
    //
    // The path matters more than the mechanism. Retiring `agent-logs:` tells an
    // author to move a run link somewhere else, and `subtasks:` is the only
    // other structured list on a stage — so a green gate plus a broken page was
    // waiting at the end of the migration the docs prescribe.
    id: 'M21-agentlog-ref-in-subtasks',
    why: 'a `subtasks:` ref that names a real AGENT-LOG file must error — the renderer cannot resolve it',
    apply: (t) => {
      const f = path.join(t, PLAN, '15_journal-compat.md');
      const s = fs.readFileSync(f, 'utf-8');
      fs.writeFileSync(f, s.replace(
        /\.{2}\/\.{2}\/subtasks\/[^)\s]*010_a-subtask\.md/,
        '../../agent-log/010_wf_ship-the-decoder/01_summary.md',
      ));
    },
    expect: 'is not a subtask',
  },
  {
    id: 'M06-iteration-frontmatter',
    why: 'skill: `iteration:` is retired; the filename owns the number',
    apply: (t) => {
      const f = path.join(t, LOG, '02_working/010_audit-round.md');
      const s = fs.readFileSync(f, 'utf-8');
      fs.writeFileSync(f, s.replace(/^status: open$/m, 'status: open\niteration: 1'));
    },
    expect: 'carries `iteration:`',
  },
  {
    id: 'M07-dropped-no-callout',
    why: 'skill: a dropped round carries TWO signals — status AND a callout',
    apply: (t) => {
      const f = path.join(t, LOG, '02_working/010_audit-round.md');
      let s = fs.readFileSync(f, 'utf-8');
      s = s.replace(/^status: open$/m, 'status: dropped');
      s = s.replace(/> \[!NOTE\][\s\S]*$/m, 'It did not land.\n');
      fs.writeFileSync(f, s);
    },
    expect: 'no callout',
  },
  {
    id: 'M08-producer-without-iteration-file',
    why: 'skill: producer files hang off an iteration file (`NN0_`)',
    apply: (t) => fs.rmSync(path.join(t, LOG, '02_working/010_audit-round.md')),
    expect: 'no iteration file',
  },
  {
    id: 'M09-stage-h1',
    why: 'skill: a stage has NO `# H1` — the heading is generated',
    apply: (t) => {
      const f = path.join(t, PLAN, '20_retention.md');
      fs.appendFileSync(f, '\n# Retention\n\nbody\n');
    },
    expect: 'carries an `# H1`',
  },
  {
    id: 'M10-ordering-label-drift',
    why: 'skill: `agent-ks check issues` WARNS on a drifted ordering label',
    apply: (t) => {
      const f = path.join(t, PLAN, '20_retention.md');
      fs.appendFileSync(f, '\nSee [999/999 the subtask](../../subtasks/010_a-subtask.md).\n');
    },
    expect: 'ordering label',
  },
  {
    id: 'M11-plan-folder-one-digit-prefix',
    why: 'grammar is 2-5 digits; the validator prefix regex is `\\d{1,5}`',
    apply: (t) => {
      fs.renameSync(path.join(t, `${ID}/plans/01_decoder-and-retention`), path.join(t, `${ID}/plans/1_decoder-and-retention`));
    },
    expect: 'no numeric prefix',
  },
  {
    id: 'M12-stage-one-digit-prefix',
    why: 'grammar is 2-5 digits; a 1-digit stage prefix does not parse in the loader',
    apply: (t) => {
      fs.renameSync(path.join(t, PLAN, '20_retention.md'), path.join(t, PLAN, '5_retention.md'));
    },
    expect: 'no numeric prefix',
  },
  {
    id: 'M13-legacy-milestone-file-masks-everything',
    why: 'a root file matching `[1-9]\\d{2,4}_*.md` classifies the whole log as HISTORY and skips every new-shape rule',
    apply: (t) => {
      fs.rmSync(path.join(t, LOG, '01_summary.md'));                       // rule 1 broken
      fs.renameSync(path.join(t, LOG, '02_working'), path.join(t, LOG, 'working')); // rule 2 broken
      fs.writeFileSync(path.join(t, LOG, '120_findings.md'), '---\ntitle: "Findings"\n---\n\nbody\n');
    },
    expect: 'no `01_summary.md`',
  },
  {
    id: 'M14-legacy-slot-name-masks-everything',
    why: 'a folder named `03_working` (a RETIRED slot name) classifies the log as history and skips every rule',
    apply: (t) => {
      fs.rmSync(path.join(t, LOG, '01_summary.md'));
      fs.mkdirSync(path.join(t, LOG, '03_working'));
      fs.writeFileSync(path.join(t, LOG, '03_working/010_x.md'), '---\ntitle: "X"\n---\n\nbody\n');
    },
    expect: 'no `01_summary.md`',
  },
  {
    id: 'M15-summary-sections-gutted',
    why: 'skill: `01_summary.md` is FIVE `#` sections in order. Nothing else',
    apply: (t) => {
      fs.writeFileSync(path.join(t, LOG, '01_summary.md'), '---\ntitle: "Summary"\n---\n\n# Random\n\nnothing here\n');
    },
    expect: null,
  },
  {
    id: 'M16-todo-bare-number',
    why: 'skill (repo-wide): every reference is a LINK, never a bare backticked number',
    apply: (t) => {
      const f = path.join(t, LOG, '01_summary.md');
      fs.appendFileSync(f, '\n- [x] `010` — the plans section\n');
    },
    expect: null,
  },
  {
    id: 'M17-iteration-head-missing',
    why: 'skill: an iteration file opens with # Goal / # Inputs / # Expected Outcome / # Outcome',
    apply: (t) => {
      fs.writeFileSync(path.join(t, LOG, '02_working/010_audit-round.md'),
        '---\ntitle: "Audit round"\nstatus: done\nagent: claude\n---\n\nsome prose, no headings at all\n');
    },
    expect: null,
  },
  {
    id: 'M18-child-log-below-100',
    why: 'skill: a child agent log is prefix >= 100',
    apply: (t) => {
      fs.mkdirSync(path.join(t, LOG, '04_wf_sneaky'));
      fs.writeFileSync(path.join(t, LOG, '04_wf_sneaky/01_summary.md'), '---\ntitle: "S"\n---\n\nbody\n');
    },
    expect: 'reads as one of the run',
  },
  {
    id: 'M19-stage-outcome-multiline',
    why: 'skill: `outcome:`/`notes:` are ONE-LINERS rendered as inline markdown',
    apply: (t) => {
      const f = path.join(t, PLAN, '20_retention.md');
      const s = fs.readFileSync(f, 'utf-8');
      fs.writeFileSync(f, s.replace(/^status: open$/m, 'outcome: |\n  line one\n\n  line two as a second paragraph\nstatus: open'));
    },
    expect: null,
  },
  {
    id: 'M20-two-open-plans',
    why: 'skill: one plan open at a time is CONVENTION; the validator hints',
    apply: (t) => {
      const p2 = path.join(t, `${ID}/plans/02_second-plan`);
      fs.mkdirSync(p2, { recursive: true });
      fs.writeFileSync(path.join(p2, 'settings.json'), '{ "title": "Second", "status": "open" }\n');
      fs.writeFileSync(path.join(p2, 'overview.md'), '---\ntitle: "Overview"\n---\n\nbody\n');
    },
    expect: 'plans are open',
  },
];

// ── run ────────────────────────────────────────────────────────────────────
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const rows = [];
for (const m of MUTANTS) {
  const dir = path.join(OUT, m.id);
  fs.cpSync(SEED, dir, { recursive: true });
  m.apply(dir);
  const res = runCheck(dir);
  const all = [...(res.errors || []), ...(res.warnings || [])];
  const hit = m.expect ? all.some((s) => s.includes(m.expect)) : false;
  const verdict = m.expectClean
    ? (all.length === 0 ? 'CONTROL-OK' : 'CONTROL-DIRTY')
    : m.expect === null
      ? (all.length ? 'unenforced (other findings present)' : 'SURVIVED — nothing enforces it')
      : hit ? 'KILLED' : 'SURVIVED';
  rows.push({ id: m.id, verdict, why: m.why, findings: all.length, sample: all.slice(0, 3) });
}

const w = (s) => process.stdout.write(s + '\n');
w('# mutation battery — agent-ks check issues');
w('');
w(`seed: ${path.relative(REPO, SEED)}`);
w(`mutants: ${MUTANTS.length}  (each on its own copy under ${path.relative(REPO, OUT)}/)`);
w('');
w('| # | mutant | verdict | findings | rule |');
w('|---|---|---|---|---|');
for (const r of rows) w(`| ${r.id} | | **${r.verdict}** | ${r.findings} | ${r.why} |`);
w('');
w('## per-mutant detail');
for (const r of rows) {
  w('');
  w(`### ${r.id} — ${r.verdict}`);
  w(`rule: ${r.why}`);
  for (const s of r.sample) w(`  - ${s}`);
  if (!r.sample.length) w('  - (no findings at all)');
}
