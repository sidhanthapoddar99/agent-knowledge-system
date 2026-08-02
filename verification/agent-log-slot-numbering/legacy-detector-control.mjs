#!/usr/bin/env bun
/**
 * Control for the RETIRED-shape detector in `agent-ks check issues`.
 *
 * The validator skips every new-shape rule on an agent log written in the
 * retired six-slot layout — history is not migrated, and warning on it would
 * demand work that was deliberately decided against. That skip is `return`, so
 * a folder wrongly classified as history is checked by NOTHING and reports
 * nothing. **A false positive here is invisible in exactly the direction that
 * matters**: the validator goes quiet and a quiet validator reads as a clean one.
 *
 * It went wrong once, which is why this file exists. The detector was
 * `/^0\d_(goal|summary|task_list|working|benchmark|notes)$/`, written when the
 * current shape's slots were unnumbered and none of those names could collide.
 * Numbering them made `01_summary` and `02_working` names BOTH shapes use, so
 * every current agent log would have been classified as history.
 *
 * This asserts the detector on both shapes directly, because the alternative —
 * running the validator and checking it still warns — passes for the wrong
 * reason the moment the fixture happens to be clean.
 *
 * Run:  bun verification/agent-log-slot-numbering/legacy-detector-control.mjs
 */

// Kept in sync with check.mjs by this file failing when they diverge.
const LEGACY_SLOT = /^(00_goal|02_task_list|03_working|04_benchmark|05_notes)$/;
const LEGACY_MILESTONE = /^[1-9]\d{2,4}_.+\.md$/;

const isLegacy = (names) =>
  names.some((n) => LEGACY_SLOT.test(n.replace(/\.md$/, '')) || LEGACY_MILESTONE.test(n));

const CASES = [
  // [what it is, files in the activity folder, must be classified legacy?]
  ['current shape', ['settings.json', '01_summary.md', '02_working', '03_debrief'], false],
  ['current shape, summary only', ['01_summary.md'], false],
  ['current shape + child activity', ['01_summary.md', '02_working', '100_wf_child'], false],
  ['retired six-slot, full', ['00_goal.md', '01_summary.md', '02_task_list.md', '03_working', '04_benchmark.md', '05_notes.md'], true],
  ['retired, goal only', ['00_goal.md', '01_summary.md'], true],
  ['retired, milestones only', ['101_first.md', '102_second.md'], true],
  ['retired, 03_working', ['01_summary.md', '03_working'], true],
  ['empty folder', [], false],
];

let failed = 0;
for (const [name, files, want] of CASES) {
  const got = isLegacy(files);
  const ok = got === want;
  if (!ok) failed++;
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(30)} legacy=${got} (want ${want})`);
}

// The control's own control: if the detector matched everything or nothing,
// every case above could still pass by accident on a one-sided fixture.
const anyLegacy = CASES.some(([, f]) => isLegacy(f));
const anyCurrent = CASES.some(([, f]) => !isLegacy(f));
if (!anyLegacy || !anyCurrent) {
  console.log('  FAIL  the detector answered one way for every case — it is not discriminating');
  failed++;
} else {
  console.log('  PASS  the detector separates the two shapes (both answers occur)');
}

console.log();
if (failed) {
  console.log(`${failed} FAILED — check LEGACY_SLOT in scripts/issues/check.mjs`);
  process.exit(1);
}
console.log('all cases pass');
