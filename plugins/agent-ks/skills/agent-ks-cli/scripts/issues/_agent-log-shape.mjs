/**
 * Which shape an agent-log folder is in. Pure: takes a directory listing,
 * reads nothing.
 *
 * The current shape is flat: `settings.json`, `01_summary.md`, and
 * `NN_<round>.md` files beside it. Every other layout is the old shape. The
 * validator reports an old-shape folder once, with OLD_SHAPE_HINT, and runs
 * no current-shape rule on it. The scaffolders refuse to write into one.
 */

/** The text every old-shape finding carries. */
export const OLD_SHAPE_HINT = 'old agent-log shape; migrate';

/** Names only an old shape produces: index, goal, task list, and the slot folders. */
const OLD_NAMES = /^(00_index\.md|00_goal(\.md)?|02_task_list(\.md)?|02_working|03_debrief|working|debrief)$/;

/** A run folder nested inside a run (a child log): numeric prefix and a kind code. */
const CHILD_LOG = /^\d{2,5}_[a-z]{2}_.+$/;

/** A loose milestone file: `NNN_<name>.md` with a 3–5 digit prefix. */
const MILESTONE = /^[1-9]\d{2,4}_.+\.md$/;

/**
 * True when the folder is in an old shape.
 * A milestone file counts only when there is no `01_summary.md` beside it. With
 * a summary, `NNN_` files are reports of the current shape (`21_`, `101_`).
 *
 * @param {{name: string, isFile: boolean}[]} entries one folder's direct children
 * @returns {boolean}
 */
export function isOldAgentLogShape(entries) {
  const hasSummary = entries.some((e) => e.isFile && e.name === '01_summary.md');
  return entries.some((e) =>
    OLD_NAMES.test(e.name)
    || (!e.isFile && CHILD_LOG.test(e.name))
    || (e.isFile && !hasSummary && MILESTONE.test(e.name)));
}
