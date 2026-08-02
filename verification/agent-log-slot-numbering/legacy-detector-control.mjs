#!/usr/bin/env bun
/**
 * Control for the RETIRED-shape detector in `agent-ks check issues`.
 *
 * The validator skips every current-shape rule on an agent log written in the
 * retired layout — history is not migrated, and warning on it would demand work
 * that was deliberately decided against. That skip is a bare `return`, so a
 * folder wrongly classified as history is checked by NOTHING and reports
 * nothing. **A false positive here is invisible in exactly the direction that
 * matters**: the validator goes quiet, and a quiet validator reads as a clean one.
 *
 * It has gone wrong twice, which is why this file exists.
 *
 *   1. The detector was `/^0\d_(goal|summary|task_list|working|benchmark|
 *      notes)$/`, written when the current shape's slots were unnumbered.
 *      Numbering them made `01_summary` and `02_working` names BOTH shapes use,
 *      so every current agent log would have been classified as history.
 *   2. Then `03_working`, `04_benchmark` and `05_notes` stayed in the marker set
 *      even though the current shape can produce all three by one typo or one
 *      extra slot — and an earlier version of THIS FILE asserted that behaviour
 *      as correct, so it passed while the defect was live.
 *
 * (2) is the reason this imports the real predicate instead of restating its
 * regexes. **A control that reimplements what it guards is not a control.** It
 * can only ever prove that two copies agree, which is the one thing that was
 * never in doubt.
 *
 * Run:  bun verification/agent-log-slot-numbering/legacy-detector-control.mjs
 */

import { isRetiredAgentLogShape } from
  '../../plugins/agent-ks/skills/agent-ks-docs/scripts/issues/_agent-log-shape.mjs';

/** `entries` in the shape the validator passes: a name, and whether it is a file.
 *  A trailing `/` in a case below means a directory. */
const entries = (names) => names.map((n) => ({
  name: n.replace(/\/$/, ''), isFile: !n.endsWith('/'),
}));

const CASES = [
  // [what it is, folder contents, must be classified retired?, why it matters]
  ['current shape',
    ['settings.json', '01_summary.md', '02_working/', '03_debrief/'], false],
  ['current, summary only',
    ['01_summary.md'], false],
  ['current + child activity',
    ['01_summary.md', '02_working/', '100_wf_child/'], false],

  // The three that used to MASK a valid run. Each is one plausible slip on a
  // folder that is plainly current-shape, and each used to silence every rule.
  ['current + 03_working typo',
    ['01_summary.md', '02_working/', '03_working/'], false],
  ['current + a future 04_ slot',
    ['01_summary.md', '02_working/', '04_benchmark/'], false],
  ['current + 05_notes folder',
    ['01_summary.md', '02_working/', '05_notes/'], false],
  ['current + loose root NNN file',
    ['01_summary.md', '02_working/', '140_audit-brief.md'], false],
  // …and the same slip on a MINIMAL current run, with no `02_working/` to vouch
  // for it. `01_summary.md` is what separates it from history.
  ['minimal current + loose root NNN file',
    ['01_summary.md', '140_audit-brief.md'], false],
  // A current run written before the prefixes, with the summary lost and a
  // producer file left at the root. Three current-shape rules broken at once —
  // and this used to be silence, because "no summary + a root NNN file" is the
  // signature of history. The bare `working/` is what tells them apart.
  ['current-shape slip: unnumbered working, no summary, loose root file',
    ['working/', '120_findings.md'], false],

  ['retired six-slot, full',
    ['00_goal.md', '01_summary.md', '02_task_list.md', '03_working/', '04_benchmark.md', '05_notes.md'], true],
  ['retired, goal only',
    ['00_goal.md', '01_summary.md'], true],
  ['retired, task-list only',
    ['02_task_list.md', '01_summary.md'], true],
  ['retired, milestones only',
    ['101_first.md', '102_second.md'], true],
  ['empty folder', [], false],
];

let failed = 0;
for (const [name, files, want] of CASES) {
  const got = isRetiredAgentLogShape(entries(files));
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(34)} retired=${got} (want ${want})`);
}

// The control's own control: a predicate that answered one way for everything
// would still pass every case above on a one-sided case list.
const answers = new Set(CASES.map(([, f]) => isRetiredAgentLogShape(entries(f))));
if (answers.size !== 2) {
  console.log('  FAIL  the detector answered one way for every case — it is not discriminating');
  failed++;
} else {
  console.log('  PASS  the detector separates the two shapes (both answers occur)');
}

// And a control on the IMPORT: if the module ever stops exporting a function,
// `isRetiredAgentLogShape(...)` would throw rather than quietly pass — but a
// stub returning `undefined` would read as `false` everywhere and score a clean
// run on the "current" cases. Assert it is callable and answers a known pair.
if (typeof isRetiredAgentLogShape !== 'function'
    || isRetiredAgentLogShape(entries(['00_goal.md'])) !== true
    || isRetiredAgentLogShape(entries(['01_summary.md'])) !== false) {
  console.log('  FAIL  the imported predicate is not the real one');
  failed++;
} else {
  console.log('  PASS  the imported predicate is real and answers both ways');
}

console.log();
if (failed) {
  console.log(`${failed} FAILED — see scripts/issues/_agent-log-shape.mjs`);
  process.exit(1);
}
console.log('all cases pass');
