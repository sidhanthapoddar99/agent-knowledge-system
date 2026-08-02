/**
 * Is an agent-log folder written in the RETIRED shape?
 *
 * Its own module, with no dependencies, for one reason: the validator imports
 * it and so does its control. A control that reimplements the rules it guards
 * passes happily while the real thing is broken — which is how the earlier
 * version of this logic survived a review with a live defect in it.
 *
 * Pure — takes a directory listing, returns a boolean, reads nothing.
 */

/** Names the CURRENT shape cannot produce. It has no goal and no task-list slot
 *  at all, so either is proof of history — and on the real corpus every retired
 *  run carries one of the two. */
const RETIRED_SLOT = /^(00_goal|02_task_list)$/;

/**
 * Names only the CURRENT shape can produce. The retired shape's third and
 * fourth slots were `02_task_list` and `03_working`, so it could contain none
 * of these.
 *
 * The UNNUMBERED forms count too, and that is not an oversight: `working/` and
 * `debrief/` are the current shape written before the prefixes were added — a
 * mistake the validator has its own warning for — and the retired shape never
 * spelled them bare (it was `03_working`). Measured on the whole corpus, no
 * historical run carries either. So a folder holding one is a current run with
 * a fixable naming slip, and treating it as history would swallow the warning
 * written for exactly that slip.
 */
const CURRENT_SLOT = /^(02_working|03_debrief|working|debrief)$/;

/** The oldest shape of all: milestone files loose at the run root, no slots. */
const RETIRED_MILESTONE = /^[1-9]\d{2,4}_.+\.md$/;

/**
 * True when this folder is history, and every current-shape rule must be
 * skipped for it. Existing agent logs are deliberately NOT migrated — history
 * stays as written, and the conventions govern what is recorded next. Warning
 * on them would demand work that was decided against, and a few hundred
 * warnings nobody acts on is how a validator stops being read at all, taking
 * the real findings with it.
 *
 * **A wrong `true` is silent in the worst direction.** The caller returns, the
 * folder is then checked by nothing, and reporting nothing is the same output
 * as having nothing to report. Three rules prevent that, and the order of the
 * first two is the design rather than a detail:
 *
 *   1. **A current slot wins outright**, before any retired marker is read.
 *   2. **Only names the current shape CANNOT produce may mark history.**
 *      `03_working`, `04_benchmark` and `05_notes` were in that set and are
 *      not any more: `03_working/` is the off-by-one a rename produces, `04_`
 *      is the next slot number anyone would reach for, and on the real corpus
 *      none of the three ever identifies a retired run on its own — every one
 *      also carries `00_goal` or `02_task_list`. They bought no discrimination
 *      and each was a live way to silence a valid run.
 *   3. **A loose root `NNN_*.md` counts only when there is no `01_summary.md`.**
 *      Alone it means nothing, because it is also exactly the misplaced file
 *      the validator warns about — so a current run that committed one had its
 *      whole folder reclassified and never got the warning written for it.
 *
 * @param {{name: string, isFile: boolean}[]} entries one folder's direct children
 * @returns {boolean}
 */
export function isRetiredAgentLogShape(entries) {
  const named = (e) => e.name.replace(/\.md$/, '');
  if (entries.some((e) => CURRENT_SLOT.test(named(e)))) return false;
  const hasSummary = entries.some((e) => e.isFile && e.name === '01_summary.md');
  return entries.some(
    (e) => RETIRED_SLOT.test(named(e))
      || (e.isFile && !hasSummary && RETIRED_MILESTONE.test(e.name)),
  );
}
